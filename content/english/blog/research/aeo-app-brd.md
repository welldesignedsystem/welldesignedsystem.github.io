+++
date = '2026-03-21T12:44:47+10:00'
draft = true
title = 'Business Requirement Document - aeo-app.ai (AEO & GEO)'
tags = ['SEO', 'GEO', 'AEO']
summary = "Business idea - Search IQ, a tool to help businesses optimise for AEO and GEO in the age of AI search."
+++
# Business Requirements Document
> *aeo-app.ai — The Unified SEO · AEO · GEO Intelligence Platform*

---
## 1. Executive Summary

aeo-app.ai is a B2B SaaS platform that gives digital marketing agencies, in-house SEO teams, and enterprise content teams a unified command centre for the three pillars of modern search visibility:

- **SEO** — Traditional search engine ranking optimisation
- **AEO** — Answer Engine Optimisation (featured snippets, voice, PAA, Knowledge Panels)
- **GEO** — Generative Engine Optimisation (LLM citation tracking, AI search visibility)

The platform addresses a critical market gap: existing tools (Semrush, Ahrefs, Moz) were built for the pre-LLM era and measure the wrong thing — link rankings. aeo-app.ai measures what actually matters in 2026: **who gets quoted when AI answers a question**.

### Problem Statement

```mermaid
flowchart LR
    A["🔍 User Types Query\n'best CRM for startups'"] --> B{"Which Era?"}
    B --> |"2010–2020\nClick-era"| C["📋 Scans top 10 results\nClicks best-looking link\nVisits website"]
    B --> |"2024+\nAnswer-era"| D["🤖 AI reads the answer\nMaybe scans sources\nRarely clicks"]

    C --> E["💰 SEO = Revenue\nOld tools work fine"]
    D --> F["💀 SEO alone = Invisible\nNew tools needed"]

    style A fill:#1e293b,stroke:#64748b,color:#fff
    style B fill:#7c3aed,stroke:#6d28d9,color:#fff
    style C fill:#166534,stroke:#15803d,color:#fff
    style D fill:#991b1b,stroke:#dc2626,color:#fff
    style E fill:#166534,stroke:#15803d,color:#fff
    style F fill:#991b1b,stroke:#dc2626,color:#fff
```

---

## 2. Strategic Pillars

```mermaid
mindmap
  root((aeo-app.ai))
    Measure
      AI Citation Tracking
      GEO Visibility Score
      AEO Snippet Wins
      Voice Search Rankings
      Competitor AI Share
    Optimise
      Content Brief Generator
      Schema Markup Builder
      Answer-First Rewriter
      Entity Optimiser
      FAQ Generator
    Monitor
      Real-time AI Alerts
      Competitor Mentions
      Brand Entity Watch
      Freshness Decay Alerts
      Crawler Access Audit
    Report
      Client White-label Reports
      Executive Dashboards
      ROI Attribution
      Benchmark Comparisons
      Automated Insights
```

### Competitive Positioning

```mermaid
quadrantChart
    title aeo-app.ai Competitive Landscape
    x-axis "Traditional SEO Focus" --> "AI/Answer Search Focus"
    y-axis "Agency/SMB Focused" --> "Enterprise Focused"
    quadrant-1 Enterprise AI
    quadrant-2 Enterprise Traditional
    quadrant-3 SMB Traditional
    quadrant-4 SMB AI
    Semrush: [0.15, 0.60]
    Ahrefs: [0.10, 0.55]
    Moz: [0.12, 0.35]
    BrightEdge: [0.20, 0.90]
    Profound: [0.80, 0.45]
    Otterly: [0.75, 0.25]
    Goodie AI: [0.78, 0.30]
    Surfer SEO: [0.18, 0.28]
    Frase: [0.22, 0.22]
    MarketMuse: [0.25, 0.65]
    Conductor: [0.18, 0.85]
    Botify: [0.16, 0.80]
    SE Ranking: [0.14, 0.20]
    Mangools: [0.11, 0.15]
    aeo-app.ai: [0.92, 0.68]
```

---

## 3. Market Opportunity

| Segment | TAM | SAM | SOM (Y3) |
|---|---|---|---|
| Global SEO Software Market | $1.6B | $400M | $18M |
| AI Search Optimisation (emerging) | $800M (projected) | $200M | $25M |
| Digital Agency Tools | $4.2B | $600M | $30M |
| **Total Addressable** | **~$6.6B** | **~$1.2B** | **$73M** |

### Market Tailwinds

- AI Overview appearances growing at ~40% YoY
- Perplexity growing from 10M → 100M+ monthly queries in 18 months
- 67% of marketers report zero-click rates increasing
- No single platform currently offers unified SEO + AEO + GEO measurement

---

## 4. Stakeholders

```mermaid
flowchart TD
    CEO["👔 CEO / Founder\nProduct direction & fundraising"]
    CPO["🧠 CPO\nProduct roadmap owner"]
    CTO["⚙️ CTO\nArchitecture & engineering lead"]
    CMO["📣 CMO\nGo-to-market & pricing"]

    AgencyHead["🏢 Agency Heads\nMulti-client management"]
    SEOLead["📈 SEO Leads\nDay-to-day platform users"]
    ContentTeam["✍️ Content Teams\nOptimisation workflows"]
    DevTeam["💻 Dev Teams\nSchema & technical SEO"]
    Clients["👥 End Clients\nConsume reports"]

    CEO --> CPO
    CEO --> CTO
    CEO --> CMO
    CPO --> AgencyHead
    CPO --> SEOLead
    CPO --> ContentTeam
    CTO --> DevTeam

    style CEO fill:#7c3aed,stroke:#6d28d9,color:#fff
    style CPO fill:#0369a1,color:#fff,stroke:#075985
    style CTO fill:#0369a1,color:#fff,stroke:#075985
    style CMO fill:#0369a1,color:#fff,stroke:#075985
```

---

## 5. User Personas

### Persona 1: The Agency Director — "Alex"
- **Role:** Head of Digital at a 40-person agency managing 60+ client accounts
- **Pain:** Manually checking AI answers for each client is impossible at scale. Clients ask "are we in ChatGPT?" and there's no good answer.
- **Needs:** White-labelled client reporting, bulk monitoring, ROI dashboards, alerts
- **Willing to pay:** $500–$2,000/month

### Persona 2: The In-House SEO Lead — "Priya"
- **Role:** Senior SEO Manager at a mid-size e-commerce brand
- **Pain:** Knows AI search is important but has no tooling. Justifying investment to the CMO requires data she can't produce.
- **Needs:** GEO score benchmarking, content gap analysis, automated briefs
- **Willing to pay:** $200–$600/month

### Persona 3: The Enterprise Content Strategist — "Marcus"
- **Role:** VP Content at a Fortune 500 financial services firm
- **Pain:** Compliance requires knowing exactly where brand messaging appears. AI citations are ungoverned. Competitor AI mentions are eating their share.
- **Needs:** Enterprise governance, brand entity monitoring, competitor tracking, API access
- **Willing to pay:** $2,000–$10,000/month

---

## 6. Core Product Features

### Feature Map

```mermaid
flowchart TD
    subgraph F1["MODULE 1: GEO TRACKER"]
        G1["AI Citation Monitor\n(Perplexity, ChatGPT, Gemini, Copilot)"]
        G2["Brand Mention Alerts"]
        G3["Competitor AI Share"]
        G4["GEO Visibility Score™"]
        G5["Query-level Citation Log"]
    end

    subgraph F2["MODULE 2: AEO MANAGER"]
        A1["Featured Snippet Tracker"]
        A2["People Also Ask Monitor"]
        A3["Voice Search Rank Tracker"]
        A4["Knowledge Panel Manager"]
        A5["AI Overview Detector"]
        A6["Rich Result Monitor"]
    end

    subgraph F3["MODULE 3: CONTENT OPTIMISER"]
        C1["Answer-First Content Scorer"]
        C2["AI-Powered Brief Generator"]
        C3["Schema Markup Builder"]
        C4["FAQ Auto-Generator"]
        C5["Entity Linker"]
        C6["Comprehensiveness Checker"]
    end

    subgraph F4["MODULE 4: SEO FOUNDATION"]
        S1["Keyword Rank Tracker"]
        S2["Backlink Monitor"]
        S3["Technical SEO Auditor"]
        S4["Crawler Access Audit\n(GPTBot, PerplexityBot, etc)"]
        S5["Core Web Vitals Monitor"]
        S6["Sitemap & Index Health"]
    end

    subgraph F5["MODULE 5: REPORTING HUB"]
        R1["White-label Client Reports"]
        R2["Executive Dashboards"]
        R3["Automated Insight Summaries"]
        R4["Scheduled Email Reports"]
        R5["API Data Export"]
    end
```

---

## 7. System Architecture — AWS Microservices

### High-Level Architecture

```mermaid
flowchart TB
    subgraph CLIENTS["CLIENT LAYER"]
        WEB["🌐 Web App\n(React/Next.js)"]
        MOB["📱 Mobile App\n(React Native)"]
        API_CLIENT["🔌 API Clients\n(3rd Party)"]
    end

    subgraph CDN["EDGE / CDN"]
        CF["☁️ CloudFront CDN"]
        WAF["🛡️ AWS WAF"]
        R53["🔗 Route 53 DNS"]
    end

    subgraph GATEWAY["API GATEWAY LAYER"]
        APIGW["⚡ AWS API Gateway\n(REST + WebSocket)"]
        AUTH["🔐 Cognito Auth\n+ JWT"]
        RATELIMIT["🚦 Rate Limiter\n(API Gateway Throttling)"]
    end

    subgraph SERVICES["MICROSERVICES LAYER (ECS Fargate)"]
        direction TB
        SVC1["🤖 GEO Crawler\nService"]
        SVC2["📊 AEO Monitor\nService"]
        SVC3["🔍 SEO Rank\nService"]
        SVC4["✍️ Content AI\nService"]
        SVC5["📋 Schema\nService"]
        SVC6["📈 Analytics\nService"]
        SVC7["📧 Notification\nService"]
        SVC8["👥 User/Tenant\nService"]
        SVC9["🏷️ White-label\nService"]
        SVC10["🔄 Ingestion\nService"]
    end

    subgraph MESSAGING["EVENT BUS"]
        SQS["📨 SQS Queues"]
        SNS["📢 SNS Topics"]
        EB["🚌 EventBridge"]
    end

    subgraph DATA["DATA LAYER"]
        RDS["🗃️ RDS Aurora\n(PostgreSQL) - Tenant Data"]
        ELASTIC["🔎 OpenSearch\n- Search & Rankings"]
        REDIS["⚡ ElastiCache Redis\n- Sessions & Cache"]
        S3["🪣 S3\n- Reports & Assets"]
        DYNAMO["📦 DynamoDB\n- Real-time Events"]
        TIMESTREAM["📉 Timestream\n- Metrics & Time Series"]
    end

    subgraph CRAWLERS["CRAWLER INFRASTRUCTURE"]
        LAMBDA_CRAWL["λ Lambda\nCrawler Workers"]
        BATCH["⚙️ AWS Batch\nBulk Crawl Jobs"]
        SCRAPER["🕷️ Headless Browser\nPool (Playwright on ECS)"]
    end

    subgraph AI["AI / ML LAYER"]
        BEDROCK["🧠 AWS Bedrock\n(Claude, Titan)"]
        SAGEMAKER["🔬 SageMaker\nCustom Models"]
        COMPREHEND["📝 Comprehend\nNLP & Entity"]
    end

    subgraph OBS["OBSERVABILITY"]
        CW["📊 CloudWatch\nLogs & Metrics"]
        XRAY["🔍 X-Ray\nDistributed Tracing"]
        GRAFANA["📈 Managed Grafana\nDashboards"]
    end

    CLIENTS --> CF
    CF --> WAF --> APIGW
    R53 --> CF
    APIGW --> AUTH
    APIGW --> RATELIMIT
    APIGW --> SERVICES

    SERVICES <--> MESSAGING
    SERVICES <--> DATA
    SERVICES --> CRAWLERS
    SERVICES --> AI

    CRAWLERS --> DATA
    AI --> DATA

    SERVICES --> OBS
    CRAWLERS --> OBS

    style CLIENTS fill:#1e3a5f,stroke:#2563eb,color:#fff
    style GATEWAY fill:#1e3a1e,stroke:#16a34a,color:#fff
    style SERVICES fill:#3b1f5e,stroke:#7c3aed,color:#fff
    style DATA fill:#1f2937,stroke:#6b7280,color:#fff
    style AI fill:#451a03,stroke:#d97706,color:#fff
    style CRAWLERS fill:#1c1917,stroke:#78716c,color:#fff
```

---

### Microservice Detail — Service Responsibilities

```mermaid
flowchart LR
    subgraph GEO_SVC["GEO Crawler Service"]
        direction TB
        GS1["Schedule Query Batches"]
        GS2["Send queries to:\nPerplexity API\nChatGPT API\nGemini API\nCopilot API"]
        GS3["Parse AI responses"]
        GS4["Extract citations &\ndomain mentions"]
        GS5["Store citation events\n→ DynamoDB + Timestream"]
        GS1 --> GS2 --> GS3 --> GS4 --> GS5
    end

    subgraph AEO_SVC["AEO Monitor Service"]
        direction TB
        AS1["SERP Crawl Scheduler"]
        AS2["Google SERP Scraper\n(Playwright)"]
        AS3["Snippet Extractor"]
        AS4["PAA Box Parser"]
        AS5["AI Overview Detector"]
        AS6["Knowledge Panel\nTracker"]
        AS1 --> AS2 --> AS3 & AS4 & AS5 & AS6
    end

    subgraph CONTENT_SVC["Content AI Service"]
        direction TB
        CS1["Ingest Content URL\nor Paste"]
        CS2["AEO Score Engine\n(Bedrock Claude)"]
        CS3["GEO Score Engine\n(Custom Rubric)"]
        CS4["Schema Recommender"]
        CS5["Brief Generator\n(Bedrock Claude)"]
        CS6["FAQ Auto-Generator\n(Bedrock Claude)"]
        CS1 --> CS2 & CS3
        CS2 & CS3 --> CS4 & CS5 & CS6
    end
```

---

### Deployment Architecture

```mermaid
flowchart TB
    subgraph PROD["PRODUCTION (Multi-AZ)"]
        subgraph AZ1["Availability Zone 1"]
            ECS1["ECS Fargate\nCluster A"]
            RDS1["Aurora Primary\n(Writer)"]
        end
        subgraph AZ2["Availability Zone 2"]
            ECS2["ECS Fargate\nCluster B"]
            RDS2["Aurora Replica\n(Reader)"]
        end
        subgraph AZ3["Availability Zone 3"]
            ECS3["ECS Fargate\nCluster C"]
            RDS3["Aurora Replica\n(Reader)"]
        end
    end

    subgraph DR["DISASTER RECOVERY"]
        DR_REGION["Secondary Region\n(ap-southeast-2 → us-east-1)"]
        S3_REPL["S3 Cross-Region\nReplication"]
    end

    subgraph CICD["CI/CD PIPELINE"]
        GH["GitHub Actions"]
        ECR["ECR Container\nRegistry"]
        CODEDEPLOY["CodeDeploy\nBlue/Green"]
        GH --> ECR --> CODEDEPLOY
    end

    PROD --> DR
    CICD --> PROD

    style PROD fill:#0f2027,stroke:#203a43,color:#fff
    style DR fill:#1a0a2e,stroke:#6d28d9,color:#fff
    style CICD fill:#0a1628,stroke:#1d4ed8,color:#fff
```

---

### Multi-Tenancy Architecture

```mermaid
flowchart TD
    subgraph TENANT["Tenant Isolation Strategy"]
        T1["Tenant A\n(Agency - 60 clients)"]
        T2["Tenant B\n(Enterprise)"]
        T3["Tenant C\n(SMB)"]
    end

    subgraph ROUTER["Tenant Router\n(API Gateway + Lambda Authorizer)"]
        JWT_CHECK["Validate JWT\n+ Extract tenant_id"]
        TIER_CHECK["Check Subscription Tier\n→ Feature Flags"]
    end

    subgraph ISOLATION["Data Isolation (Row-Level Security)"]
        SCHEMA["PostgreSQL RLS\nSET app.tenant_id = :id\nall queries auto-filtered"]
        REDIS_NS["Redis Namespace\ntenant:{id}:*"]
        S3_PREFIX["S3 Prefix\ntenant/{id}/reports/"]
    end

    T1 & T2 & T3 --> ROUTER
    ROUTER --> ISOLATION

    style TENANT fill:#1e3a5f,stroke:#2563eb,color:#fff
    style ROUTER fill:#1e3a1e,stroke:#16a34a,color:#fff
    style ISOLATION fill:#3b1f5e,stroke:#7c3aed,color:#fff
```

---

## 8. Data Architecture & Data Flow

### Core Data Flow — GEO Tracking

```mermaid
sequenceDiagram
    participant SCHED as ⏰ Scheduler<br>(EventBridge)
    participant QUEUE as 📨 SQS Queue<br>(geo-crawl-jobs)
    participant WORKER as 🤖 GEO Worker<br>(Lambda / ECS)
    participant AI_API as 🧠 AI Engine<br>(Perplexity/ChatGPT)
    participant PARSER as 🔍 Citation Parser
    participant DYNAMO as 📦 DynamoDB<br>(Events)
    participant TSDB as 📉 Timestream<br>(Metrics)
    participant NOTIF as 📧 Notification<br>Service
    participant DASH as 📊 Dashboard

    SCHED->>QUEUE: Enqueue target queries<br>(every 6 hours per account)
    QUEUE->>WORKER: Dequeue batch (max 10 queries)
    WORKER->>AI_API: Send query + capture response
    AI_API-->>WORKER: AI-generated answer with citations
    WORKER->>PARSER: Extract citations, domains, brand mentions
    PARSER->>DYNAMO: Store citation event record
    PARSER->>TSDB: Write time-series metric<br>(cited: 1/0, position: N)
    TSDB->>NOTIF: Trigger if new citation OR loss detected
    NOTIF->>DASH: Push real-time WebSocket update
    NOTIF-->>SCHED: Email/Slack alert to user
```

---

### Content Optimisation Flow

```mermaid
sequenceDiagram
    participant USER as 👤 User
    participant API as ⚡ API Gateway
    participant CONTENT as ✍️ Content Service
    participant BEDROCK as 🧠 AWS Bedrock<br>(Claude)
    participant SCHEMA as 📋 Schema Service
    participant SCORE as 📊 Scoring Engine
    participant DB as 🗃️ Aurora DB

    USER->>API: Submit URL or paste content
    API->>CONTENT: Forward content request
    CONTENT->>CONTENT: Scrape + clean content
    CONTENT->>SCORE: Run AEO + GEO scoring rubric
    SCORE-->>CONTENT: Raw scores per dimension
    CONTENT->>BEDROCK: "Analyse this content for AI optimisation\ngaps with specific recommendations"
    BEDROCK-->>CONTENT: Structured improvement suggestions
    CONTENT->>SCHEMA: Check existing schema markup
    SCHEMA-->>CONTENT: Schema gaps + auto-generated JSON-LD
    CONTENT->>DB: Save analysis result
    CONTENT-->>USER: Full report: scores, gaps, recommendations, schema
```

---

### Data Schema (Core Entities)

```mermaid
erDiagram
    TENANT {
        uuid id PK
        string name
        string plan_tier
        string subdomain
        jsonb brand_config
        timestamp created_at
    }

    PROJECT {
        uuid id PK
        uuid tenant_id FK
        string name
        string domain
        string[] target_locales
        jsonb settings
    }

    QUERY {
        uuid id PK
        uuid project_id FK
        string query_text
        string intent_type
        string[] target_engines
        string priority
        bool is_active
    }

    CITATION_EVENT {
        uuid id PK
        uuid query_id FK
        string engine
        bool brand_cited
        int citation_position
        string[] all_cited_domains
        text ai_response_snippet
        timestamp captured_at
    }

    SERP_SNAPSHOT {
        uuid id PK
        uuid query_id FK
        bool has_featured_snippet
        bool has_ai_overview
        bool has_paa
        bool brand_in_snippet
        int organic_rank
        text snippet_text
        timestamp captured_at
    }

    CONTENT_AUDIT {
        uuid id PK
        uuid project_id FK
        string url
        float aeo_score
        float geo_score
        float seo_score
        jsonb recommendations
        jsonb schema_gaps
        timestamp audited_at
    }

    TENANT ||--o{ PROJECT : "owns"
    PROJECT ||--o{ QUERY : "tracks"
    QUERY ||--o{ CITATION_EVENT : "generates"
    QUERY ||--o{ SERP_SNAPSHOT : "generates"
    PROJECT ||--o{ CONTENT_AUDIT : "contains"
```

---

## 9. Module Specifications

### Module 1: GEO Visibility Score™

The **GEO Visibility Score** is aeo-app.ai's proprietary metric — a 0–100 composite score representing how visible a brand is across AI-generated search responses.

#### Score Calculation

```mermaid
flowchart TD
    subgraph INPUTS["Raw Inputs (collected per query batch)"]
        I1["Citation Rate\n% of queries where brand is cited"]
        I2["Citation Position\nAvg position among cited sources"]
        I3["Query Coverage\n% of tracked queries with any AI answer"]
        I4["Engine Breadth\nHow many AI engines cite the brand"]
        I5["Mention Quality\nBrand mentioned vs just linked"]
        I6["Competitor Δ\nShare vs top 3 competitors"]
    end

    subgraph WEIGHTS["Weighted Scoring"]
        W1["Citation Rate × 0.30"]
        W2["Citation Position × 0.20"]
        W3["Engine Breadth × 0.20"]
        W4["Mention Quality × 0.15"]
        W5["Competitor Δ × 0.15"]
    end

    subgraph OUTPUT["GEO Score™"]
        SCORE["0 – 100\nComposite Score"]
        TREND["7-day / 30-day trend"]
        BREAKDOWN["Per-engine breakdown"]
    end

    I1 --> W1
    I2 --> W2
    I3 --> W3
    I4 --> W3
    I5 --> W4
    I6 --> W5

    W1 & W2 & W3 & W4 & W5 --> SCORE
    SCORE --> TREND
    SCORE --> BREAKDOWN
```

#### GEO Score Bands

| Score | Label | Description |
|---|---|---|
| 85–100 | 🟢 **Dominant** | Cited in most tracked queries across multiple AI engines |
| 65–84 | 🔵 **Established** | Consistently cited; strong single-engine presence |
| 40–64 | 🟡 **Emerging** | Cited sporadically; significant gaps in coverage |
| 15–39 | 🟠 **Weak** | Rarely cited; competitor brands dominate |
| 0–14 | 🔴 **Invisible** | Not found in AI responses; urgent remediation needed |

---

### Module 2: AEO Command Centre

#### SERP Feature Detection Logic

```mermaid
flowchart TD
    START["🔍 Run SERP Crawl\nfor target query"] --> PARSE["Parse SERP HTML\n(Playwright headless)"]

    PARSE --> Q1{"AI Overview\nDetected?"}
    Q1 -->|Yes| AIO["Log: has_ai_overview = true\nExtract cited domains\nCheck if brand cited"]
    Q1 -->|No| Q2

    AIO --> Q2{"Featured\nSnippet?"}
    Q2 -->|Yes| SNIP["Log: snippet_text\nsnippet_type (para/list/table)\nbrand_in_snippet = true/false"]
    Q2 -->|No| Q3

    SNIP --> Q3{"PAA Box\nPresent?"}
    Q3 -->|Yes| PAA["Extract all PAA questions\nCheck brand presence\nMap to tracked query list"]
    Q3 -->|No| Q4

    PAA --> Q4{"Knowledge\nPanel?"}
    Q4 -->|Yes| KP["Capture panel entity\nCheck brand association"]
    Q4 -->|No| ORGANIC

    KP --> ORGANIC["Record organic rank\npositions 1–100"]
    ORGANIC --> STORE["Store SERP Snapshot\n→ Aurora DB"]
    STORE --> SCORE["Update AEO Score\nfor this query"]
```

---

### Module 3: Content Optimiser — Scoring Rubric

The Content Optimiser evaluates any piece of content across 6 dimensions:

```mermaid
xychart-beta horizontal
    title "Content AEO/GEO Readiness Score"
    x-axis ["Answer-First", "Schema Markup", "Question Coverage", "Statistical Depth", "Entity Clarity", "Chunk Independence"]
    y-axis "Score" 0 --> 100
    bar [85, 40, 70, 55, 65, 50]
```

#### Dimension Definitions

| Dimension | Weight | What it measures |
|---|---|---|
| Answer-First Structure | 20% | Does each section open with a direct answer? Inverted pyramid use |
| Schema Markup | 20% | FAQPage, HowTo, Article, Speakable presence and validity |
| Question Coverage | 18% | % of PAA questions for this topic addressed |
| Statistical Depth | 15% | Named, cited, specific statistics per 1,000 words |
| Entity Clarity | 15% | Definitional sentences, named attributions, entity mentions |
| Chunk Independence | 12% | Each section readable without surrounding context |

---

### Module 4: Schema Builder

An interactive, zero-code schema markup generator:

```mermaid
flowchart LR
    U["👤 User pastes\ncontent or URL"] --> DETECT["Auto-detect\nschema opportunities"]

    DETECT --> TYPE{"Content\nType?"}

    TYPE -->|FAQ content| FAQ_SCHEMA["Generate FAQPage\nJSON-LD"]
    TYPE -->|How-to guide| HOWTO_SCHEMA["Generate HowTo\nJSON-LD with steps"]
    TYPE -->|Article/Blog| ART_SCHEMA["Generate Article\n+ Author schema"]
    TYPE -->|Local business| LOCAL_SCHEMA["Generate LocalBusiness\n+ NAP schema"]
    TYPE -->|Product| PROD_SCHEMA["Generate Product\n+ Review schema"]

    FAQ_SCHEMA & HOWTO_SCHEMA & ART_SCHEMA & LOCAL_SCHEMA & PROD_SCHEMA --> VALIDATE["Validate against\nSchema.org spec"]
    VALIDATE --> TEST["One-click test in\nGoogle Rich Results API"]
    TEST --> EXPORT["Export as:\n• JSON-LD snippet\n• WordPress plugin code\n• GTM data layer push\n• CMS-specific format"]
```

---

### Module 5: AI Crawler Audit

A dedicated tool to ensure all AI crawlers have access to client sites:

```mermaid
flowchart TD
    CRAWL["Fetch robots.txt\nfor target domain"] --> PARSE_R["Parse all\nDisallow/Allow rules"]

    PARSE_R --> CHECK["Check each known\nAI crawler user-agent"]

    CHECK --> UA1{"GPTBot\n(OpenAI)"}
    CHECK --> UA2{"PerplexityBot"}
    CHECK --> UA3{"ClaudeBot\n(Anthropic)"}
    CHECK --> UA4{"GoogleBot-Extended\n(AI Overviews)"}
    CHECK --> UA5{"CCBot\n(Common Crawl)"}
    CHECK --> UA6{"FacebookBot\n(Meta AI)"}

    UA1 & UA2 & UA3 & UA4 & UA5 & UA6 --> STATUS{"Allowed\nor Blocked?"}

    STATUS -->|Blocked| ALERT["🚨 ALERT: AI Crawler\nBlocked — potential\ninvisibility to this engine"]
    STATUS -->|Allowed| OK["✅ Pass"]

    ALERT --> REC["Auto-generate\nrobots.txt fix snippet"]
    OK --> REPORT["Include in\nCrawl Health Report"]
```

---

## 10. Metrics, Dashboards & KPIs

### Primary Dashboard — Executive View

The executive dashboard surfaces three headline scores plus trend indicators:

```mermaid
flowchart LR
    subgraph DASH["aeo-app.ai Executive Dashboard"]
        subgraph GEO_CARD["GEO Score™"]
            GS["72 / 100\n▲ +8 (30d)"]
        end
        subgraph AEO_CARD["AEO Win Rate"]
            AW["43%\n▲ +12% (30d)\nof tracked queries"]
        end
        subgraph SEO_CARD["SEO Visibility"]
            SV["68 / 100\n▼ -2 (30d)"]
        end
    end

    style GEO_CARD fill:#166534,stroke:#16a34a,color:#fff
    style AEO_CARD fill:#1e3a5f,stroke:#2563eb,color:#fff
    style SEO_CARD fill:#7f1d1d,stroke:#dc2626,color:#fff
```

### Key Metrics Tracked

#### GEO Metrics

| Metric | Definition | Frequency |
|---|---|---|
| **GEO Visibility Score™** | Composite 0–100 AI citation score | Daily |
| **Citation Rate** | % of tracked queries where brand is cited by any AI engine | Per crawl |
| **Per-Engine Citation Rate** | Citation rate broken down by Perplexity / ChatGPT / Gemini / Copilot | Per crawl |
| **Citation Position** | Average ranked position of brand among all cited sources | Per crawl |
| **AI Share of Voice** | Brand citations / (Brand + top 3 competitors) citations | Weekly |
| **New Citation Gain** | Queries newly citing brand this period (wasn't cited before) | Weekly |
| **Citation Loss** | Queries that used to cite brand but no longer do | Weekly |
| **Engine Coverage** | Number of distinct AI engines that have cited brand at least once | Monthly |

#### AEO Metrics

| Metric | Definition | Frequency |
|---|---|---|
| **Featured Snippet Win Rate** | % of tracked queries where brand owns the snippet | Daily |
| **PAA Presence Rate** | % of tracked queries where brand appears in PAA box | Daily |
| **AI Overview Citation Rate** | % of tracked queries where brand cited in Google AI Overview | Daily |
| **Voice Rank (Position 1 Rate)** | % of voice-intent queries where brand answer is returned | Weekly |
| **Zero-Click Impact Score** | Estimated impressions captured via answer positions | Weekly |
| **Rich Result Coverage** | % of site content with valid rich result schema | Weekly |

#### SEO Metrics

| Metric | Definition | Frequency |
|---|---|---|
| **Visibility Score** | Weighted rank score across all tracked keywords | Daily |
| **Average Position** | Mean organic position for tracked queries | Daily |
| **Top 3 Rate** | % of queries ranking positions 1–3 | Daily |
| **Crawl Health Score** | Composite of Core Web Vitals + index coverage + redirect chains | Weekly |
| **AI Crawler Access Score** | % of AI crawlers explicitly allowed in robots.txt | Weekly |
| **Backlink Authority Score** | DR-equivalent composite from indexed link profile | Weekly |

---

### Metric Trend Visualisations

#### GEO Score Over Time (Concept)

```mermaid
xychart-beta
    title "GEO Visibility Score — 12-Month Trend"
    x-axis ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    y-axis "GEO Score (0-100)" 0 --> 100
    line [18, 22, 28, 31, 38, 42, 49, 55, 60, 65, 69, 72]
```

#### AI Share of Voice — Competitor View (Concept)

```mermaid
xychart-beta
    title "AI Share of Voice — Brand vs Top 3 Competitors"
    x-axis ["Q1", "Q2", "Q3", "Q4"]
    y-axis "% of AI Citations" 0 --> 50
    bar [12, 18, 25, 32]
    line [30, 28, 25, 22]
```

---

### Alerting & Notification Framework

```mermaid
flowchart TD
    EVENT["📊 Metric Change Detected\n(Timestream → Lambda trigger)"] --> CLASSIFY{"Severity\nClassification"}

    CLASSIFY -->|Δ > 20% drop| CRITICAL["🔴 CRITICAL\nImmediate alert"]
    CLASSIFY -->|Δ 10–20% drop| WARN["🟡 WARNING\n24hr digest"]
    CLASSIFY -->|Δ < 10% / positive| INFO["🟢 INFO\nWeekly summary"]

    CRITICAL --> SLACK["Slack Alert\n(channel + @mention)"]
    CRITICAL --> EMAIL_NOW["Immediate Email"]
    CRITICAL --> DASH_BADGE["Dashboard Alert Badge"]

    WARN --> EMAIL_DIGEST["Daily Email Digest"]
    WARN --> DASH_BADGE

    INFO --> WEEKLY_REPORT["Weekly Report\n(auto-generated PDF)"]

    subgraph ALERT_TYPES["Alert Trigger Types"]
        AT1["🆕 New competitor citation\nin tracked query"]
        AT2["📉 Citation loss:\nbrand dropped from AI answer"]
        AT3["🚫 AI crawler newly\nblocked in robots.txt"]
        AT4["🎯 Snippet stolen\nby competitor"]
        AT5["📈 GEO Score milestone\n(every 10 points)"]
        AT6["📋 Schema error\ndetected on key page"]
    end
```

---

## 11. Security & Compliance

### Security Architecture

```mermaid
flowchart TD
    subgraph PERIMETER["Perimeter Security"]
        WAF["AWS WAF\n- OWASP Top 10 rules\n- Rate limiting\n- Bot management"]
        SHIELD["AWS Shield Advanced\nDDoS Protection"]
        CF_SEC["CloudFront\nGeo-blocking if required"]
    end

    subgraph APP_SEC["Application Security"]
        COGNITO["Cognito\nMFA enforced for all users"]
        JWT["JWT Tokens\n15min access / 7d refresh"]
        RBAC["Role-Based Access Control\nOwner / Admin / Analyst / Viewer"]
        SECRETS["Secrets Manager\nAll API keys + DB credentials"]
    end

    subgraph DATA_SEC["Data Security"]
        ENCRYPT_TRANSIT["TLS 1.3\nAll in-transit data"]
        ENCRYPT_REST["AES-256\nAll at-rest (RDS, S3, DynamoDB)"]
        RLS["PostgreSQL RLS\nRow-level tenant isolation"]
        AUDIT_LOG["CloudTrail\nAll API + data access logged"]
    end

    subgraph COMPLIANCE["Compliance"]
        GDPR["GDPR\nData residency controls\nRight to erasure API"]
        SOC2["SOC2 Type II\n(Target: Year 2)"]
        PRIVACY["Privacy by Design\nNo PII in crawler payloads"]
    end

    PERIMETER --> APP_SEC --> DATA_SEC --> COMPLIANCE
```

---

## 12. Infrastructure & Scalability

### Auto-Scaling Strategy

```mermaid
flowchart TB
    subgraph LOAD["Load Patterns"]
        L1["Steady State\n~100 req/sec"]
        L2["Peak: Report Generation\n~500 req/sec"]
        L3["Crawl Burst\n~10,000 queries/hour"]
    end

    subgraph SCALE["Scaling Mechanisms"]
        ECS_SCALE["ECS Fargate Auto-scaling\nTarget tracking: CPU 60%\nMin: 2, Max: 50 tasks"]
        LAMBDA_SCALE["Lambda Concurrency\nReserved: 500\nCrawl workers: on-demand burst"]
        RDS_SCALE["Aurora Serverless v2\nACU: 0.5–128\nAuto-pause in dev"]
        CACHE_SCALE["ElastiCache\nCluster mode\n3 shards × 2 replicas"]
    end

    L1 --> ECS_SCALE
    L2 --> ECS_SCALE & RDS_SCALE
    L3 --> LAMBDA_SCALE & CACHE_SCALE

    style LOAD fill:#1e3a5f,stroke:#2563eb,color:#fff
    style SCALE fill:#1e3a1e,stroke:#16a34a,color:#fff
```

### Infrastructure Cost Model (Monthly — 1,000 Tenants)

| Component | Service | Est. Monthly Cost |
|---|---|---|
| Compute (services) | ECS Fargate | $1,200 |
| Compute (crawlers) | Lambda + ECS Batch | $800 |
| Database | Aurora Serverless v2 | $600 |
| Cache | ElastiCache Redis | $300 |
| Search | OpenSearch | $400 |
| Time-series DB | Timestream | $200 |
| Storage | S3 + DynamoDB | $150 |
| CDN | CloudFront | $100 |
| AI/ML | Bedrock API calls | $1,500 |
| Monitoring | CloudWatch + Grafana | $200 |
| **Total Infrastructure** | | **~$5,450/mo** |
| **Cost per tenant** | | **~$5.45/mo** |

At $299/month average plan, infrastructure is ~1.8% of revenue. Gross margin target: **>80%**.

---

## 13. Integrations

### Integration Architecture

```mermaid
flowchart LR
    subgraph aeo-app.ai["aeo-app.ai Core"]
        INT_HUB["Integration Hub\n(ECS Fargate)"]
        WEBHOOK["Webhook Engine"]
        OAUTH["OAuth 2.0\nManager"]
    end

    subgraph DATA_IN["Data-In Integrations"]
        GSC["Google Search Console\nAPI — rank + impression data"]
        GA4["Google Analytics 4\nTraffic + conversion data"]
        GADS["Google Ads\nPaid keyword context"]
        SEMrush["Semrush API\nBacklink + keyword fallback"]
    end

    subgraph NOTIFY["Notification Integrations"]
        SLACK_INT["Slack\nAlert channels"]
        TEAMS["Microsoft Teams\nAlert channels"]
        EMAIL_INT["SendGrid\nTransactional email"]
        PAGERDUTY["PagerDuty\nCritical alerts"]
    end

    subgraph CMS["CMS Integrations"]
        WP["WordPress Plugin\nSchema injection + score widget"]
        WEBFLOW["Webflow\nSchema embed via script"]
        CONTENTFUL["Contentful\nContent audit webhook"]
        SHOPIFY["Shopify\nProduct schema audit"]
    end

    subgraph EXPORT["Export / BI"]
        SHEETS["Google Sheets\nAuto-export reports"]
        DATASTUDIO["Looker Studio\nLive connector"]
        BIGQUERY["BigQuery\nData warehouse export"]
        ZAPIER["Zapier / Make\nWorkflow automation"]
    end

    INT_HUB --> DATA_IN
    INT_HUB --> NOTIFY
    INT_HUB --> CMS
    INT_HUB --> EXPORT
    OAUTH --> DATA_IN
    WEBHOOK --> NOTIFY & EXPORT
```

---

## 14. Pricing & Packaging

### Tier Structure

```mermaid
flowchart LR
    subgraph STARTER["🌱 Starter — $99/mo"]
        S1["1 domain"]
        S2["50 tracked queries"]
        S3["3 AI engines monitored"]
        S4["Weekly crawl frequency"]
        S5["Basic AEO + GEO dashboard"]
        S6["Email alerts"]
    end

    subgraph GROWTH["🚀 Growth — $299/mo"]
        G1["5 domains"]
        G2["250 tracked queries"]
        G3["All AI engines"]
        G4["Daily crawl frequency"]
        G5["Full AEO + GEO + SEO suite"]
        G6["Content Optimiser (20 audits/mo)"]
        G7["Schema Builder"]
        G8["Slack + Email alerts"]
    end

    subgraph AGENCY["🏢 Agency — $799/mo"]
        A1["25 domains (client accounts)"]
        A2["1,000 tracked queries"]
        A3["All engines + voice"]
        A4["6-hour crawl frequency"]
        A5["White-label client reports"]
        A6["Unlimited content audits"]
        A7["Competitor tracking (3 per domain)"]
        A8["API access"]
        A9["Priority support"]
    end

    subgraph ENTERPRISE["🏛️ Enterprise — Custom"]
        E1["Unlimited domains"]
        E2["Unlimited queries"]
        E3["1-hour crawl frequency"]
        E4["Custom brand entity setup"]
        E5["Dedicated CSM"]
        E6["SLA 99.9%"]
        E7["SSO / SAML"]
        E8["Custom integrations"]
        E9["Data residency options"]
    end

    style STARTER fill:#1f2937,stroke:#4b5563,color:#fff
    style GROWTH fill:#1e3a5f,stroke:#2563eb,color:#fff
    style AGENCY fill:#3b1f5e,stroke:#7c3aed,color:#fff
    style ENTERPRISE fill:#451a03,stroke:#d97706,color:#fff
```

---

## 15. Roadmap

```mermaid
gantt
    title aeo-app.ai Product Roadmap
    dateFormat  YYYY-MM
    section Phase 1 — MVP (Q2 2026)
    GEO Tracker (core)           :active, geo1, 2026-04, 2026-06
    AEO Monitor (snippets + PAA) :active, aeo1, 2026-04, 2026-06
    SEO Rank Tracker             :seo1, 2026-04, 2026-06
    Basic Dashboard              :dash1, 2026-05, 2026-06
    Multi-tenant Auth            :auth1, 2026-04, 2026-05

    section Phase 2 — Growth (Q3 2026)
    Content Optimiser            :cont1, 2026-07, 2026-08
    Schema Builder               :sch1, 2026-07, 2026-08
    AI Crawler Audit Tool        :craw1, 2026-07, 2026-08
    White-label Reports          :rep1, 2026-08, 2026-09
    Slack + Email Alerts         :alert1, 2026-07, 2026-07

    section Phase 3 — Scale (Q4 2026)
    Voice Search Tracking        :voice1, 2026-10, 2026-11
    Competitor AI Share          :comp1, 2026-10, 2026-11
    GSC + GA4 Integration        :gsc1, 2026-10, 2026-11
    Agency Multi-client Hub      :ag1, 2026-11, 2026-12
    WordPress Plugin             :wp1, 2026-11, 2026-12

    section Phase 4 — Enterprise (Q1 2027)
    Enterprise SSO/SAML          :sso1, 2027-01, 2027-02
    BigQuery Export              :bq1, 2027-01, 2027-02
    Custom GEO Rubric Builder    :rubric1, 2027-02, 2027-03
    Agentic Search Monitoring    :agent1, 2027-02, 2027-03
    Multimodal Tracking (Video)  :multi1, 2027-03, 2027-03
```

---

## 16. Risks & Mitigations

```mermaid
quadrantChart
    title Risk Matrix — Likelihood vs Impact
    x-axis "Low Likelihood" --> "High Likelihood"
    y-axis "Low Impact" --> "High Impact"
    quadrant-1 Enterprise AI
    quadrant-2 Enterprise Traditional
    quadrant-3 SMB Traditional
    quadrant-4 SMB AI
    Semrush: [0.15, 0.60]
    Ahrefs: [0.10, 0.55]
    Moz: [0.12, 0.35]
    BrightEdge: [0.20, 0.90]
    Profound: [0.80, 0.45]
    Otterly: [0.75, 0.25]
    aeo-app.ai: [0.85, 0.70]
```

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM changes citation behaviour | Medium | High | Multi-engine redundancy; monitor model update announcements |
| AI API rate limits / cost increase | High | Medium | Build caching layer; negotiate enterprise contracts; own crawl layer where possible |
| Google blocks SERP scraping | Medium | High | Use official Search Console API where possible; maintain headless browser fallback; legal counsel review |
| Competitor (Semrush, Ahrefs) copies feature | High | Medium | IP moat via proprietary GEO Score™ methodology; brand + customer lock-in |
| Privacy regulation (GDPR AI) | Low-Medium | Medium | Privacy by design from day one; DPA + data residency options |
| AWS Outage | Low | High | Multi-AZ + cross-region DR; 99.9% SLA with 30-min RPO target |

---

## 17. Acceptance Criteria

### Phase 1 MVP Go/No-Go Criteria

```mermaid
flowchart TD
    subgraph MUST["🔴 Must-Have (P0 — MVP blockers)"]
        M1["✅ GEO Tracker queries Perplexity + ChatGPT\nwith < 2hr data freshness"]
        M2["✅ AEO Monitor detects featured snippets\nand PAA with ≥ 90% accuracy vs manual check"]
        M3["✅ Multi-tenant isolation verified:\nno cross-tenant data leakage in pen test"]
        M4["✅ GEO Visibility Score™ computes\ncorrectly for 100 test queries"]
        M5["✅ Dashboard loads in < 2 seconds\nfor accounts with 250 queries"]
        M6["✅ Alert system delivers notifications\nwithin 5 minutes of trigger event"]
    end

    subgraph SHOULD["🟡 Should-Have (P1 — Target at launch)"]
        S1["Content Optimiser scoring\nwithin ±5 points of expert manual review"]
        S2["Schema Builder generates\nvalid JSON-LD passing Rich Results Test"]
        S3["White-label reports\nrender in < 10 seconds"]
        S4["GSC integration imports\ndata within 1 hour of auth"]
    end

    subgraph NICE["🟢 Nice-to-Have (P2 — Post-launch)"]
        N1["Voice search rank tracking"]
        N2["WordPress plugin 1-click install"]
        N3["Competitor AI share tracking"]
    end

    MUST --> LAUNCH["🚀 MVP Launch Decision"]
    SHOULD --> LAUNCH
```

### System Performance SLAs

| Metric | Target | Critical Threshold |
|---|---|---|
| API Response Time (p50) | < 200ms | < 500ms |
| API Response Time (p99) | < 1,000ms | < 2,000ms |
| Dashboard Load Time | < 2s | < 4s |
| GEO Crawl Freshness | ≤ 6 hours | ≤ 12 hours |
| AEO SERP Freshness | ≤ 24 hours | ≤ 48 hours |
| Platform Uptime | 99.9% | 99.5% |
| Data Accuracy (vs manual) | ≥ 90% | ≥ 80% |
| Alert Delivery Time | < 5 minutes | < 15 minutes |

---

## Appendix A — AWS Services Reference

| AWS Service | aeo-app.ai Use Case |
|---|---|
| **ECS Fargate** | All microservices (stateless, containerised) |
| **Lambda** | Crawler workers, event triggers, lightweight transformations |
| **API Gateway** | REST + WebSocket APIs, rate limiting, auth integration |
| **Cognito** | User auth, MFA, JWT issuance |
| **Aurora Serverless v2** | Primary relational DB (tenant + project data) |
| **DynamoDB** | Real-time citation events, high-throughput writes |
| **Timestream** | Time-series metrics for all tracked KPIs |
| **ElastiCache (Redis)** | Session store, query result caching, pub/sub |
| **OpenSearch** | Full-text search, keyword/content indexing |
| **S3** | Report storage, asset storage, data lake |
| **EventBridge** | Scheduled crawl triggers, event routing |
| **SQS** | Crawl job queues, async processing |
| **SNS** | Alert fan-out to email/Slack/webhooks |
| **AWS Batch** | Bulk historical crawl jobs |
| **Bedrock** | Claude / Titan for content analysis and AI generation |
| **SageMaker** | Custom scoring models (GEO rubric training) |
| **Comprehend** | NLP entity extraction from crawled content |
| **Secrets Manager** | API keys, DB credentials |
| **CloudFront** | CDN for web app and static assets |
| **WAF** | OWASP protection, bot rules |
| **Shield Advanced** | DDoS protection |
| **Route 53** | DNS + health-check-based failover |
| **CloudWatch** | Logs, metrics, alarms |
| **X-Ray** | Distributed tracing across microservices |
| **Managed Grafana** | Operational dashboards |
| **CloudTrail** | Audit logging for compliance |
| **CodePipeline + CodeDeploy** | CI/CD with blue/green deployments |
| **ECR** | Container registry |
| **VPC + PrivateLink** | Network isolation + secure service communication |

---

## Appendix B — AEO & GEO Complete Guide

# AEO & GEO: The Complete Guide to Optimising for AI-Powered Search in 2026

> *SEO is no longer enough. The search landscape has fundamentally changed — and if you're not showing up inside AI answers, you're invisible to a growing majority of your audience.*

---
