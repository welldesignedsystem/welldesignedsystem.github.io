+++
date = '2025-05-27T11:00:00+10:00'
draft = false
title = 'High Availability Patterns Reference'
tags = ['High Availability', 'Microservices', 'AWS', 'System Design', 'Patterns', 'Reference']
summary = 'A comprehensive reference of high-availability patterns for microservices with tables comparing HA trade-offs.'
+++

This reference collects pattern tables from the main [High Availability](/blog/system_design/high-availability-microservices/) post and adds pattern families not covered there. Each section compares strategies or patterns across dimensions relevant to availability. Sources are cited per section.



## Consistency Models

**Consistency model:** A set of **rules** defining how **quickly a write to one node becomes visible to reads** on other nodes. The choice determines **replication strategy**, **failover behaviour**, and whether **quorum reads/writes** are needed.

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 5, 9)

| Model | Behaviour | HA Trade-off | Example |
|-------|-----------|-------------|---------|
| **Strong consistency** | All nodes see the same data at the same time | Highest correctness, highest latency, potentially lower availability | DynamoDB DAX, Spanner |
| **Eventual consistency** | Writes propagate asynchronously; stale reads possible until convergence | Lower latency, higher availability | DynamoDB default, S3 |
| **Read-after-write consistency** | A client always sees its own writes immediately, but others may not | Balances write availability with read freshness | User session stores |
| **Causal consistency** | Causally related operations seen in order; unrelated ones can lag | Preserves logical ordering without global coordination | DynamoDB Transactions, CRDTs |

**Note &mdash; eventual vs read-after-write:** With eventual consistency even the *writer* may not see their own write immediately — the read could land on a replica still catching up. With read-after-write consistency the writer always sees their own writes, but other clients may still read stale data for a while.

---

## CAP Theorem

**CAP Theorem:** In a distributed data store, you can have at most two of **Consistency** (every read returns the most recent write), **Availability** (every request receives a non-error response) and **Partition Tolerance** (the system continues operating despite network failures).

**Note — two caveats to keep in mind:**

1. **Writes during a partition:** In a **CP** system the majority side keeps accepting writes but the minority side rejects writes (returns errors) to prevent divergence. Those writes fail until the partition heals — they are not lost, simply denied. In an **AP** system both sides accept writes but data may diverge until the link is restored.

2. **Why CA is impossible:** Partitions are inevitable — network failures *will* happen. A CA-classified system is only CA *when the network is perfect*, which is never true at scale. The real choice in production is CP or AP.

**How real systems pick their trade-off:**

| System | Official CAP | How they engineer around the sacrificed aspect | Use Cases |
|--------|-------------|-----------------------------------------------|-----------|
| **Spanner** | CA | TrueTime (GPS + atomic clocks) guarantees external consistency across regions; Google's private redundant fiber network makes partitions so rare that 99.999% availability is achievable despite being CP | Global financial ledgers, multi-region inventory, planetary-scale OLTP |
| **DynamoDB** | AP | Default is eventually consistent; per-request strongly consistent reads available at higher latency/cost; DynamoDB Transactions add causal consistency on top of an AP foundation | Session stores, shopping carts, gaming leaderboards, high-traffic user profiles, IoT event ingestion |
| **Cassandra** | AP | Tunable consistency per query (ONE, QUORUM, ALL) — dial up when needed; no single point of failure means linear scalability at the cost of strong consistency | Time-series data, IoT sensor ingestion, messaging / chat, recommendation engines |
| **MongoDB** | CP | Automatic replica-set failover; all writes go to primary; reads can be configured for eventual consistency (secondary reads) when partition tolerance matters more | Content management, catalogs, real-time analytics, mobile backends |
| **CockroachDB** | CP | Serializable isolation via Raft consensus; survives full region outages — but drops writes if no quorum is reachable | Multi-region SaaS backends, financial services requiring strong consistency with geo-distribution |
| **Clustered PG / MySQL** | CP | Primary handles all writes; replica takes over on failure — writes are blocked during promotion. RDBMS outside CAP's scope entirely (CAP governs distributed systems; a single instance is not distributed) | Single-region financial transactions, ERP, traditional relational workloads |

**Key insight:** The "sacrificed" pillar is never truly zero. AP systems find ways to give you consistency when you need it (DynamoDB strongly consistent reads, Cassandra QUORUM). CP systems invest heavily in infrastructure to make partitions rare (Spanner's private network, Raft lease mechanisms). No system fully ignores any pillar — they just prioritise.

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 9); "Brewer's Conjecture and the Feasibility of C, A, P" (Eric Brewer, PODC 2000)

---

## Partitioning (Sharding)

**Partitioning:** Splitting a dataset across multiple independent nodes so no single node holds everything. Each partition is responsible for a subset of the data. In HA terms:

- **Limits blast radius** — if one partition fails, only the data on that node is affected; the rest stays up.
- **Enables horizontal scaling** — more partitions = more nodes = more room for redundancy.
- **Determines rebalance complexity** — adding/removing nodes requires redistribution (e.g. consistent hashing minimises moves).

**Partitioning strategies (choices):**

| Strategy | How it works | HA Strengths | HA Weaknesses |
|----------|-------------|-------------|---------------|
| **Range-based** | Split by key range (A-M, N-Z) | Simple, efficient range queries | Hot spots if distribution is skewed; rebalancing moves large ranges |
| **Hash-based** | Hash(key) % N determines shard | Even distribution, good load balance | Range queries hit all shards; adding/removing nodes reshuffles most data |
| **Directory-based** | Lookup table maps key to shard | Flexible, supports dynamic splits | Lookup table is a SPOF and potential bottleneck |
| **List-based** | Split by discrete value list (region: US, EU, APAC) | Aligns with access patterns, geo-isolation | Uneven list sizes cause hot shards |
| **Composite** | Combine two or more (e.g. hash within range) | Best of both worlds | Higher routing and rebalance complexity |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 6); *The Art of Scalability* by Abbott & Fisher (Ch. 15)

---

## Caching

**Caching:** Temporarily storing frequently accessed data in a fast, nearby layer to reduce load on slower backend systems. In HA context:

**Placement choices:**

| Placement | Architecture | HA Strengths | HA Weaknesses |
|-----------|-------------|-------------|---------------|
| **Local** | In-process per instance (Caffeine, Guava) | Fastest, no network dependency | Stale across instances, memory-limited per node |
| **Distributed** | Shared cluster (Redis, Memcached) | Consistent view, replication across AZs, larger capacity | Network latency, cache cluster is itself a SPOF |

**Write policy choices:**

| Strategy | How it works | HA Strengths | HA Weaknesses |
|----------|-------------|-------------|---------------|
| **Cache-aside (lazy loading)** | App checks cache; on miss, loads from DB | Degrades to DB reads if cache fails; battle-tested | Thundering herd on cold start; stale until TTL expires |
| **Read-through** | Cache fetches from DB on miss transparently | Simplified app logic, consistent staleness | Cache failure causes full outage until restored |
| **Write-through** | Write to cache + DB synchronously | Cache always fresh | Higher write latency; double failure surface |
| **Write-behind** | Write to cache, async flush to DB | Low write latency, absorbs bursts | Data loss if cache fails before flush completes |
| **Refresh-ahead** | Cache proactively refreshes expiring entries | No thundering herd, consistent low latency | Wastes resources if predictions miss |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 12)

---

## Replication Patterns

Replication has two orthogonal dimensions: **topology** (who can accept writes) and **mode** (when the write returns to the caller).

**Topology patterns:**

| Pattern | Write | Read | HA Strengths | HA Weaknesses |
|---------|-------|------|-------------|---------------|
| **Single-leader** | One node | Strong from leader; stale from replicas | Simple failover, known semantics | Write SPOF; failover has RTO |
| **Multi-leader** | Multiple nodes | Eventual (conflict resolution) | Survives region outage; no write SPOF | Conflict resolution (LWW loses data); causality tracking required |
| **Leaderless (quorum)** | Any node (R+W > N for strong) | Configurable via quorum size | Highest availability; linear scalability | Weak consistency at low quorum; vector clocks needed |

**Replication modes** (applies within any topology):

| Mode | Behaviour | HA Impact |
|------|-----------|-----------|
| **Synchronous** | Primary waits for all replicas to ack before confirming | Zero data loss; higher write latency; availability drops if a replica is slow |
| **Asynchronous** | Primary confirms before replicas ack | Low latency; data loss on primary failure before replication catches up |
| **Semi-synchronous** | Primary waits for one replica to ack, rest async | Best trade-off for most workloads; some data loss risk still present |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 5); *Database Internals* by Alex Petrov (Ch. 9-10)

---

## Load Balancing Patterns

**Distribution algorithms:**

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Round Robin** | Cycles through targets in order | Simple, no state | Ignores backend load; slow instances get the same rate as fast ones |
| **Least Connections** | Sends to backend with fewest active connections | Adapts to varying request durations | Requires connection tracking state on LB |
| **Least Response Time** | Sends to fastest-responding backend | Adapts to degraded instances (slower = fewer requests) | Relies on accurate latency measurements |
| **Weighted** | Distributes proportionally (e.g. 3:1) | Handles heterogeneous instances | Static weights need manual tuning |
| **IP Hash / Sticky sessions** | Pins client to backend via hash | Consistent routing for stateful apps | Breaks when backend count changes; thundering herd on failover |
| **Consistent Hashing** | Hash-based with minimal reshuffle on node change | Cache affinity; minimal rebalancing on scale events | Complex hash ring management |

**Architectural patterns (LB placement):**

| Pattern | Architecture | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Layer 4 (TCP)** | Routes on IP + port | Simple, fast, no TLS overhead | No content-aware routing; limited health checks |
| **Layer 7 (HTTP)** | Inspects headers, paths, cookies | Content-based routing, smart health checks, TLS termination | Higher CPU cost; more attack surface (TLS) |
| **Active-passive** | One LB handles traffic; standby takes over on failure | Simple failover, no split-brain | Half capacity idle; failover has RTO |
| **Active-active (anycast / DNS GSLB)** | Multiple LBs accept traffic simultaneously | Full capacity utilised; sub-second failover (anycast) | Complex routing; DNS caching delays failover (GSLB) |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 20)

---

## Connection Pooling Patterns

**Size strategy:**

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Fixed pool** | Constant size regardless of load | Predictable resource usage | Cannot absorb traffic spikes; queue builds up |
| **Dynamic pool** | Grows/shrinks with demand | Adapts to varying load | Risk of connection storm cascading to backend under peak |
| **Partitioned (separate pools)** | Isolated pool per workload (read / write / critical) | Connection-level bulkheading — one caller type cannot starve others | Requires more connections; harder to tune per-pool |

**Health validation:**

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Test-on-borrow** | Validate before handing to caller | Catches dead connections before use | Adds latency to every acquire |
| **Test-idle** | Periodic check on idle connections | Low overhead; catches many failures early | Stale between check intervals |
| **Test-on-return** | Check when returned to pool | Useful for detecting leaky connections | Does not protect the next acquirer |

**Exhaustion behaviour:**

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Block / queue** | Caller waits until a connection is available | Highest throughput under normal conditions | Can cause cascading pileup — all blocked callers cascade |
| **Fail fast** | Throw error immediately | Graceful degradation; lets caller circuit-break upstream | Drops legitimate requests under brief spikes |
| **Timeout + retry** | Wait up to N ms, then fail | Balanced — absorbs brief waits without cascading | Tuning window is narrow (too long = cascade; too short = false fail) |

---

## Retry Logic Patterns

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Simple retry** | Fixed N retries immediately | Simple to implement | Can amplify load on an already-stressed backend |
| **Exponential backoff** | Increasing delay between retries | Reduces pressure on recovering backend | Clients may time out before backoff completes |
| **Exponential backoff + jitter** | Adds randomness to delay | Prevents thundering herd — retries from all clients do not sync | Slightly higher latency on the unlucky long-drawn retry |
| **Circuit breaker** | Stop retrying after threshold, probe periodically | Protects backend from cascading failure | False trip if threshold is too tight |
| **Retry budget** | Limit total retries across all requests | Prevents system-wide overload from aggregate retries | Hard to tune — too conservative leaves retries unused |
| **Idempotency key** | Unique key so retries do not produce duplicates | Safe to retry indefinitely without side effects | Requires application-level deduplication logic |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 22); *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 8)

---

## Health Check Patterns

**Probe type:**

| Type | What it detects | HA Strengths | HA Weaknesses |
|------|----------------|-------------|---------------|
| **TCP** | Port is open | Fast, low overhead | Misses app-level failures (process alive but pool exhausted) |
| **HTTP endpoint** | `/healthz` returns 200 | Catches application failures | Logic in the handler; a slow DB can cascade and falsely trip it |
| **gRPC health protocol** | Standard gRPC health service | Language-agnostic, streaming | Only works for gRPC backends |
| **Command / script** | Exit code of inside-container script | Flexible, can check anything | Higher overhead; shell dependency |

**Check depth:**

| Check | Behaviour | HA Strengths | HA Weaknesses |
|-------|-----------|-------------|---------------|
| **Liveness** | Is the process alive? Restart if dead | Recovers from hangs and deadlocks | Too aggressive can restart a healthy-but-slow instance |
| **Readiness** | Is it ready to serve? Remove from LB if not | Drains traffic from degraded instances | Misconfigured dependency check removes all nodes in cascade |
| **Startup** | Has init completed? Delays liveness during boot | Prevents premature restarts during slow startup | Adds boot latency; if too short, defeats the purpose |
| **Shallow** | Quick self-check only | Fast, cheap | Misses dependency failures |
| **Deep** | Checks dependencies (DB, cache, downstream) | Catches transitive failures | A downstream blip can falsely remove a perfectly healthy instance |

**Aggregation:**

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Single `/healthz`** | One endpoint for everything | Simple, easy to wire | A degraded cache removes the entire node |
| **Separate endpoints** | `/live`, `/ready`, `/db`, `/cache` | Granular — decide what removes vs alerts | More endpoints to manage; orchestrators need multiple probes |

**Direction:**

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Pull (LB polls)** | Load balancer polls each target | LB controls check rate; no registration needed | Inactive instances not discovered until next poll cycle |
| **Push (self-register)** | Instance registers with service registry | Instant registration; registry holds state | Registry is itself a SPOF; health becomes stale between re-registrations |

**Sources:** *Kubernetes in Action* by Marko Lukša (Ch. 8); *Site Reliability Engineering* by Beyer et al. (Ch. 20)

---

## Traffic Shifting Patterns

| Pattern | Mechanism | AWS Support | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|-------------|---------------|
| **Canary (weighted)** | Route X% to new version, increase gradually | Route 53 weighted, ALB weighted target groups, CodeDeploy | Gradual exposure; zero-weight rollback | Needs metrics comparison; statistical noise can mislead |
| **Header / cookie** | Route specific users via header match | ALB rule-based routing, CloudFront + Lambda@Edge | Zero impact on production users | Only tests the paths matched users exercise |
| **Blue/green** | Swap whole target pool behind LB | CodeDeploy, ECS blue/green, ALB target group swap | Instant rollback (revert pool swap) | All-or-nothing; double capacity during cutover |
| **Geographic / latency** | Shift DNS weights per region | Route 53 geolocation, latency, geoproximity | Isolates blast radius by region | Slow DNS propagation; coarse-grained control |
| **GSLB percentage** | Gradually shift DNS resolution % | Route 53 weighted routing | Multi-region failover testing | DNS TTL delays each step takes minutes |
| **Shadow / mirror** | Duplicate live requests to new version silently | API Gateway stage mirroring, VPC Traffic Mirroring | Zero user impact; validates latency + correctness | Backend must handle and discard mirrored requests separately |
| **A/B split** | Canary with session persistence | ALB weighted + sticky sessions | User-consistent experience during shift | Sticky sessions complicate draining old sessions |

**Cross-cutting rule:** Never shift more traffic than you can absorb if the new version fails. Stage the rollback before the shift starts.

**Sources:** *Continuous Delivery* by Humble & Farley (Ch. 10); *The DevOps Handbook* by Kim et al. (Ch. 13)

---

## TTL Management Patterns

| Pattern | Behaviour | HA Strengths | HA Weaknesses |
|---------|-----------|-------------|---------------|
| **Low TTL (30–300s)** | DNS records expire quickly | Fast failover — clients pick up new IPs in seconds | High query volume; higher cost (Route 53 charges per query) |
| **High TTL (300–86400s)** | DNS records cached for long periods | Low query volume; stable caching; cheaper | Slow failover — stale clients hit dead IPs for minutes to hours |
| **Client-side re-resolution** | App re-resolves DNS at a shorter interval than the TTL | Break glass for critical services — bypass DNS cache | Non-standard; adds application complexity |

---

## Disaster Recovery Strategies

DR strategies trade off recovery speed against cost. Each has different RTO and RPO characteristics:

| Strategy | RPO | RTO | Cost | HA Strengths | HA Weaknesses |
|----------|-----|-----|------|-------------|---------------|
| **Backup & Restore** | Hours | Hours | Low | Simple, cheap, well-understood | Highest RTO/RPO; data loss window measured in hours |
| **Pilot Light** | Minutes | Tens of minutes | Medium | Core data always current; compute provisioned on failover | Compute cold start; may need manual scaling decisions |
| **Warm Standby** | Seconds | Minutes | Medium-High | Fully functional scaled-down environment; fast scale-up | Double base infra cost at reduced capacity; not instant |
| **Active-Passive (standby)** | Near-zero | Seconds to minutes | High | Instant traffic switch; full capacity ready | Double full infra cost; idle resources in standby region |
| **Active-Active (multi-region)** | Near-zero | Near-zero | Very High | No failover delay; all capacity utilised; no idle waste | Highest complexity; conflict resolution for concurrent writes |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 29); AWS Well-Architected Framework Reliability Pillar

---

## Auto-scaling Strategies

Auto-scaling ensures enough compute capacity is available to handle traffic without over-provisioning:

| Strategy | Mechanism | HA Strengths | HA Weaknesses |
|----------|-----------|-------------|---------------|
| **Target tracking** | Scale on a single metric threshold (e.g. CPU at 70%) | Simple to configure; AWS-managed; predictable | Reacts to load after it arrives — no anticipation |
| **Step scaling** | Scale by defined increments per alarm severity level | Granular control; faster response for large swings | Complex to tune multiple thresholds; can oscillate |
| **Predictive scaling** | ML-based forecast of future load from historical patterns | Anticipates demand before it arrives; reduces cold start | Requires stable historical data; may over-provision for novel spikes |
| **Scheduled scaling** | Scale at known times (peak hours, marketing events, holiday sales) | Zero reaction time; perfect for known patterns | Useless for unexpected events; needs manual schedule maintenance |
| **Dynamic (queue-based)** | Scale based on queue depth or backlog (SQS, Kinesis) | Absorbs processing bursts; consumer-first scaling | Lag between queue growth and scale action; oscillation risk |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 20)

---

## Rate Limiting / Throttling

Rate limiting protects backend services from resource exhaustion by rejecting excess requests:

| Strategy | How it works | HA Strengths | HA Weaknesses |
|----------|-------------|-------------|---------------|
| **Token bucket** | Bucket of N tokens refilled at R tokens/sec; each request consumes one | Simple, permits bursts up to bucket size | Global bucket alone cannot isolate abusive clients |
| **Leaky bucket** | Request queue drained at fixed rate; excess spills | Smooths traffic to a predictable rate | Drops bursts entirely; no flexibility for brief spikes |
| **Fixed window** | Count requests per time window (e.g. 100/min), reset at boundary | Very simple to implement; low memory | Traffic spike at window boundary can double throughput momentarily |
| **Sliding window** | Rolling time window with sub-second granularity | More accurate rate enforcement; no boundary spike | Higher memory and computation per client |
| **Per-client vs global** | Separate counters per API key/user or one shared counter | Per-client prevents noisy neighbours from starving others | Global is simpler but allows one client to exhaust shared capacity |
| **Adaptive (concurrency-limited)** | Limit based on backend capacity using Little's Law | Protects backend regardless of request rate pattern | Requires real-time saturation or latency signal from backend |

**Sources:** *Building Microservices* by Sam Newman (Ch. 7); *Site Reliability Engineering* by Beyer et al. (Ch. 21)

---

## Backpressure / Load Shedding

When the system cannot keep up with demand, backpressure mechanisms slow intake or shed load rather than degrading unpredictably:

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Admission control** | Reject requests before they enter the service (at LB or API gateway) | Preserves remaining capacity for in-flight work | Rejects legitimate requests that could have been queued |
| **Queue depth limits** | Cap the internal work queue; reject when full | Bounded latency; predictable degradation under load | Need to size the cap correctly — too small rejects unnecessarily |
| **Priority queuing** | Classify requests by priority; process high-priority first | Critical path preserved under load | Low-priority requests may starve indefinitely |
| **Graceful rejection (503 + Retry-After)** | Return 503 with a Retry-After header | Client can back off intelligently; reduces retry storms | Requires client cooperation — non-compliant clients ignore the header |
| **Load shedding by percentage** | Drop X% of all traffic at the edge (ALB rule or feature flag) | Quick to activate; easy to undo; tested in advance | Blunt instrument; drops good traffic along with bad |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 21); *Building Microservices* by Sam Newman (Ch. 7)

---

## Timeout Patterns

Timeouts prevent a single slow dependency from consuming resources indefinitely:

| Type | What it sets | HA Strengths | HA Weaknesses |
|------|-------------|-------------|---------------|
| **Connection timeout** | Max time to establish TCP/TLS handshake | Catches network failures fast; frees resources quickly | Too low causes false failures on flaky but functional networks |
| **Read timeout** | Max time to receive the complete response body | Prevents a slow downstream from holding a thread/connection indefinitely | Too high delays detection; too low causes unnecessary retries |
| **Write timeout** | Max time to send the request body | Protects against slow upstream ingestion | Rarely the bottleneck in practice |
| **Deadline propagation** | Pass the remaining timeout budget to downstream calls | Coherent end-to-end timeout — no downstream outlives the caller | Complex to implement; clock skew between services can misalign budgets |
| **Per-dependency timeout** | Independent timeout for each downstream service call | Isolates failures — one slow dependency cannot cascade to others | Requires configuration per dependency; more surface for misconfiguration |
| **Per-request timeout** | Single timeout for the entire request end-to-end | Simple; guaranteed total latency bound | A brief hiccup in one dependency exhausts the whole timeout budget |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 22); *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 8)

---

## Service Discovery

Service discovery lets clients find healthy instances of a dependency without hard-coding addresses:

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Client-side** | Client queries a service registry and load-balances locally | No extra network hop; client controls retry and balancing | Registry is a SPOF; each language needs its own discovery library |
| **Server-side (LB)** | Load balancer or API gateway handles discovery and routing | Centralised; clients are simple HTTP callers | Extra network hop; LB itself must be highly available |
| **DNS-based** | DNS returns multiple A records for healthy instances (round-robin) | Simple, battle-tested, no additional infrastructure | Slow propagation; TTL delays failover; limited health granularity |
| **Registry-based (Consul, etcd, Zookeeper)** | Dedicated service registry with health checking | Rich health metadata; fast updates; watch-based change notification | Registry cluster is itself a complex distributed system to operate |
| **Service mesh (sidecar proxy)** | Sidecar proxy intercepts all outbound traffic and handles discovery | App-agnostic; language-independent; rich telemetry | Added latency per hop; significant operational overhead for mesh control plane |

**Sources:** *Building Microservices* by Sam Newman (Ch. 8); *Kubernetes in Action* by Marko Lukša (Ch. 5)

---

## Chaos Engineering

Chaos engineering validates that a system withstands unexpected failures by injecting faults in a controlled manner:

| Pattern | What it tests | HA Strengths | HA Weaknesses |
|---------|---------------|-------------|---------------|
| **Fault injection** | Inject specific failure (kill pod, block port, terminate instance) | Validates a specific resilience mechanism end-to-end | Narrow scope — only tests the injected failure mode |
| **Latency injection** | Add delay to downstream calls (e.g. +500ms on DB queries) | Tests timeout and retry behaviour; validates circuit breaker thresholds | Can trigger false alarms if monitoring is too sensitive |
| **Resource exhaustion** | Saturate CPU, memory, disk, or file descriptors | Validates throttling, auto-scaling, and OOM handling | Risk of real cascading failure if blast radius is not contained |
| **Game days** | Full scenario simulation with ops team responding | Builds team muscle memory; exposes runbook and tooling gaps | Disruptive; requires cross-team scheduling and stakeholder buy-in |
| **Blast radius control** | Keep experiments within bounded scope (one AZ, one cell, one service) | Contains damage; safe to run in production-like environments | May not test cross-cell or cross-region failure propagation |

**Sources:** *Chaos Engineering* by Casey Rosenthal & Nora Jones; *Site Reliability Engineering* by Beyer et al. (Ch. 27)

---

## Saga / Compensating Transactions

Sagas manage data consistency across multiple services without distributed transactions. Each step has a compensating action to undo it:

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Choreography** | Each service emits events; the next service reacts to the event | No central coordinator; simple topology; no SPOF | Hard to trace the full workflow; no central view of state |
| **Orchestration** | Central coordinator calls each service in sequence and manages state | Traceable; compensatable on failure; central state tracking | Coordinator is a SPOF and a potential bottleneck |
| **Backward recovery** | Compensating actions undo completed steps on failure | Eventual consistency with full rollback capability | Compensations may fail themselves, requiring manual intervention |
| **Forward recovery** | Retry or continue from the failure point without rolling back | No rollback needed; can complete if the failure is transient | May leave partially-committed data in an inconsistent state |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 9); *Microservices Patterns* by Chris Richardson (Ch. 4)

---

## Feature Flags / Toggles

Feature flags separate deployment from release, enabling instant kill-switches, gradual rollouts, and operational flexibility:

| Type | Purpose | HA Strengths | HA Weaknesses |
|------|---------|-------------|---------------|
| **Release toggle** | Gate new features behind a flag; enable when ready | Separate deploy from release; instant kill-switch without rollback | Flag debt — stale flags accumulate and increase code complexity |
| **Ops toggle** | Control operational behaviour (disable caching, enable debug logging) | Emergency lever for operational issues; no code deploy needed | Must be tested pre-production; can cause surprise behaviour if toggled live |
| **Experiment toggle** | A/B test or canary release with percentage-based exposure | Gradual rollout with data-driven go/no-go decisions | Statistical noise can mislead; needs careful metric design |
| **Permission toggle** | Enable features for specific users, tenants, or roles | Targeted rollouts; tenant isolation; staged enterprise rollouts | Complexity grows with permission matrix size |
| **Kill switch** | Emergency disable of a non-critical feature under load | Last line of defence before full outage; proven in game days | Must be pre-built and tested; useless if created during the incident |

**Sources:** *Continuous Delivery* by Humble & Farley (Ch. 14); *The DevOps Handbook* by Kim et al. (Ch. 14)

---

## Circuit Breaker

Prevent cascading failures by failing fast when a downstream service is unhealthy, then probing periodically for recovery:

**Circuit breaker states:**

| State | Behaviour | HA Strengths | HA Weaknesses |
|-------|-----------|-------------|---------------|
| **Closed** | Normal operation; all calls pass through | Zero overhead when healthy | No protection until failure threshold is reached |
| **Open** | Calls fail immediately without reaching downstream | Protects downstream from cascading failure; gives it time to recover | Rejects all calls even if the downstream has already recovered |
| **Half-open** | Limited probe requests pass through to test recovery | Enables automatic recovery without full exposure | May overload a still-recovering downstream if probe count is too high |

**Configuration dimensions:**

| Dimension | Options | HA Strengths | HA Weaknesses |
|-----------|---------|-------------|---------------|
| **Failure threshold** | Count or percentage over a time window | Count is simpler; percentage adapts to varying traffic volume | Percentage requires more events to trigger; count can false-trip on brief spikes |
| **Cooldown / sleep window** | Duration before transitioning from open to half-open | Shorter = faster recovery; longer = more protection for the downstream | Too short risks repeated failures; too long delays availability unnecessarily |
| **Probe count** | Number of successful probes required to close the breaker | Higher = more confidence in recovery; lower = faster restoration of normal operation | Too few probes may miss intermittent failures; too many delays service restoration |
| **Per-dependency vs shared** | One breaker per downstream vs a single breaker for all downstream calls | Per-dependency isolates failures precisely; shared is simpler to configure | Global breaker means one slow dependency opens the breaker for all downstream calls |

**Sources:** *Site Reliability Engineering* by Beyer et al. (Ch. 22); *Building Microservices* by Sam Newman (Ch. 7); *Microservices Patterns* by Chris Richardson (Ch. 4)

---

## API Gateway / Backend for Frontend (BFF)

A single entry point for client requests that handles cross-cutting concerns, reducing round-trips and centralizing HA policy enforcement:

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Single API Gateway** | One gateway for all clients | Centralized auth, rate limiting, routing; single place to enforce HA policies | SPOF if not deployed with HA (multi-AZ, multiple replicas); can become a throughput bottleneck |
| **Backend for Frontend (BFF)** | Dedicated gateway per client type (web, mobile, IoT) | Client-specific optimizations; failure in one BFF does not affect other client types | More infrastructure to manage; duplicated cross-cutting configuration across BFFs |
| **Gateway Aggregation** | Gateway aggregates responses from multiple downstream services for a single client call | Reduces client round-trips; hides internal service topology from clients | Gateway becomes a chatty orchestrator; increased latency per aggregated request |
| **Gateway Offloading** | Gateway handles TLS termination, compression, caching on behalf of services | Reduces per-service CPU for TLS; consistent compression and caching across all services | Gateway must be provisioned for CPU-intensive TLS termination |

**Sources:** *Building Microservices* by Sam Newman (Ch. 8); *Microservices Patterns* by Chris Richardson (Ch. 8)

---

## CQRS (Command Query Responsibility Segregation)

Separating read and write data models so each can be optimized independently for its workload:

| Pattern | How it works | HA Strengths | HA Weaknesses |
|---------|-------------|-------------|---------------|
| **Separate read/write stores** | Write model uses normalized OLTP store; read model uses denormalized views or search indexes | Read path can remain available even if write path fails; independent scaling on each side | Eventual consistency between write and read; read model can lag behind writes |
| **Separate read/write services** | Distinct services for commands (writes) and queries (reads) | Write service can degrade without affecting reads; independent deployment and scaling | Duplicated business logic across services; read model must be rebuilt on schema changes |
| **Materialized views** | Pre-computed read models updated asynchronously from the write model | Fast reads; no expensive joins at query time | Stale data until the view is refreshed; storage grows with the number of views |
| **Separate read replicas** | Read-only database replicas serving query traffic | Simple to implement; strong consistency with sync replicas or low latency with async | Replica lag under high write throughput; writes still bottlenecked on the primary |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 11); *Microservices Patterns* by Chris Richardson (Ch. 11)

---

## Transactional Outbox

Ensures reliable message or event publishing by writing the message to the same database as the business data within the same transaction, eliminating the need for distributed transactions:

| Strategy | How it works | HA Strengths | HA Weaknesses |
|----------|-------------|-------------|---------------|
| **Polling publisher** | Separate process polls the outbox table for unprocessed messages and publishes them | Simple to implement; no additional infrastructure beyond the database | Polling latency between write and publish; risk of duplicated delivery (at-least-once semantics) |
| **Transactional log tailing (CDC)** | Read from the database's commit log via CDC tooling (Debezium, AWS DMS) | Near-real-time delivery; no table contention between writers and publisher | Requires CDC infrastructure and operational expertise; schema changes must be handled carefully |
| **Outbox table with TTL** | Write message to outbox; publish via background worker; clean up processed records via TTL | Controlled retry semantics; visibility into pending messages and failures | Table can grow under high volume if publishing stalls; needs cleanup process |
| **Saga + outbox combined** | Outbox entries feed into a saga coordinator for multi-step workflows | Reliable saga step execution with full traceability; supports compensation | Higher complexity — outbox publishing and saga coordination must be managed together |

**Sources:** *Microservices Patterns* by Chris Richardson (Ch. 7); *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 11)

---

## Event Sourcing

Storing the full sequence of state-changing events as the authoritative source of truth rather than only the current state:

| Strategy | How it works | HA Strengths | HA Weaknesses |
|----------|-------------|-------------|---------------|
| **Full event log** | Append-only log of every state change; current state is derived by replaying events | Complete audit trail; can rebuild state from any point in time; zero data loss | Replay can be slow for high-volume entities; storage grows unboundedly |
| **Snapshot + event log** | Periodic snapshots of current state; replay from the last snapshot on recovery | Faster recovery than full replay; bounded replay time | Snapshot management adds complexity; stale snapshots waste storage |
| **Projection / read model** | Separate read models built asynchronously from the event stream (often used with CQRS) | Read path can be optimized independently; projections can be rebuilt from the log if corrupted | Projections lag behind the event log; eventual consistency between write and read |
| **Temporal versioning** | Every event carries a timestamp and version, enabling time-travel queries | Full historical visibility; supports point-in-time reconstruction for audit and debugging | Complex query model; storage and indexing overhead for version metadata |

**Sources:** *Designing Data-Intensive Applications* by Martin Kleppmann (Ch. 11); *Microservices Patterns* by Chris Richardson (Ch. 10)

---

*This reference is part of the [High Availability](/blog/system_design/high-availability-microservices/) series.*
