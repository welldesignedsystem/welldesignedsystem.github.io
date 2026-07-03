+++
date = '2025-05-27T11:00:00+10:00'
draft = false
title = 'High Availability Patterns Reference'
tags = ['High Availability', 'Microservices', 'AWS', 'System Design', 'Patterns', 'Reference']
summary = 'A comprehensive reference of high-availability patterns for microservices with tables comparing HA trade-offs.'
+++

This reference collects pattern tables from the main [High Availability](/blog/system_design/high-availability-microservices/) post and adds pattern families not covered there. Each section compares strategies or patterns across dimensions relevant to availability. Sources are cited per section.

## Consistency Models

### Interservice consistency

When service A calls service B synchronously, A's availability is coupled to B's — if B is slow or down, A degrades too. This is the CAP trade-off at the service boundary: synchronous propagation gives immediate consistency at the cost of availability. The patterns below decouple services by accepting eventual consistency.

The same consistency models that govern database replication apply directly to interservice communication — any time state is replicated or propagated across nodes (DB replicas, caches, or microservices), the same trade-offs and vocabulary apply.

**Sources:** _Microservices Patterns_ by Chris Richardson (Ch. 4, 7); _Building Event-Driven Microservices_ by Adam Bellemare (Ch. 3, 6)

| Pattern | How it works | Consistency | Operational necessities |
|---|---|---|---|
| **Async messaging** | A publishes an event ("OrderCreated") to a broker (SQS/SNS, Kafka, EventBridge); B consumes asynchronously. A no longer blocks on B's availability | Eventual | Broker HA, DLQ, consumer lag monitoring |
| **Transactional Outbox** | Event written to an outbox table in the same local transaction as the business data; a separate relay process (or CDC) reads that table and publishes to the broker. Solves the dual-write problem — crash between DB write and publish would otherwise cause divergence | At-least-once, eventual | Idempotent consumer, relay process, outbox table cleanup |
| **Change Data Capture (CDC)/Transactional log tailing** | A tool like Debezium (or DynamoDB Streams / Kinesis) tails the DB commit log and emits change events automatically. Removes the outbox relay; decouples propagation from app code entirely | At-least-once, eventual | CDC infra, schema change handling |
| **Saga — Choreography** | Services react to each other's events in sequence; compensating transactions undo prior steps on failure. No central coordinator — simpler but harder to trace as the chain grows | Eventual across steps | Per-service compensation logic, event tracing, monitoring |
| **Saga — Orchestration** | Central saga coordinator tells each service what to do next and manages compensation. Easier to reason about and debug, but adds a new component to keep available | Eventual across steps | Coordinator HA, central state tracking |
| **CQRS** | A owns writes; B (or several B's) maintain eventually-consistent read models / projections built from A's event stream. Read path independent from write path | Eventual (read model lags) | Projection infrastructure, schema migrations across models |

**How the standard consistency models map to a two-service scenario:**

- **Strong consistency** — every reader sees the same value immediately after a write, regardless of which node or service they query. The synchronous call gave this: A waited for B to confirm before the operation was considered done, so anyone reading from B afterward saw the update. Availability suffered because enforcing this across a slow or unreachable node means blocking or failing.
- **Eventual consistency** — no guarantee about when B converges, only that it will given no more writes. Async messaging gives this: A returns immediately, B catches up whenever the message is processed. Availability goes up, but there is a window where A and B disagree.
- **Read-your-writes consistency** — the writer itself sees its own write on subsequent reads, even if other readers might not yet. This matters when the same client that triggered a change in A immediately queries B and expects to see it (e.g. a user updates a profile in service A, then the UI fetches it from service B and the update appears missing). Solved by routing that specific read back to A's primary or a cache A writes through, rather than waiting on B's eventual sync.
- **Causal consistency** — causally related operations (B's event depends on A's event) are seen by everyone in that order, even if unrelated operations can be reordered. If A emits "OrderCreated" then "OrderCancelled," the consumer must see Created before Cancelled. Achieved via partition keys (Kafka partitioning by order ID guarantees ordering within that key) or version vectors.

**Patterns to consistency mapping:**

| Pattern | Consistency it typically gives |
|---|---|
| Synchronous call | Strong |
| Async messaging / outbox / CDC | Eventual |
| Saga | Eventual, with compensation for failures |
| CQRS read model | Eventual (sometimes read-your-writes via a cache layer) |

The practical question is not which pattern is correct in the abstract — it is which guarantee the business requirement actually needs. If nothing bad happens when B lags behind A by a few hundred milliseconds to a few seconds, eventual consistency with async messaging is the right call. If the caller needs to see its own write immediately, that is a read-your-writes requirement on a specific path, not a reason to make the whole system strongly consistent again.

**Operational necessities for any async pattern:**
- **Idempotency** — consumers deduplicate by event ID because brokers offer at-least-once, not exactly-once
- **Dead-letter queues** — events B cannot process must not vanish silently; DLQs capture them for inspection and replay
- **Lag monitoring** — track the staleness window so "eventual" is measurable in practice
- **Starting point for two-service propagation:** outbox pattern + SQS/SNS (or Kafka) + idempotent consumer. This removes synchronous coupling without needing full saga orchestration — save that for multi-step business transactions, not a two-hop propagation.


**Consistency model:** A set of **rules** defining how **quickly a write to one node becomes visible to reads** on other nodes. The choice determines **replication strategy**, **failover behaviour**, and whether **quorum reads/writes** are needed.

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 5, 9)

| Model                            | Behaviour                                                               | HA Trade-off                                                         | Example                      |
| -------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| **Strong consistency**           | All nodes see the same data at the same time                            | Highest correctness, highest latency, potentially lower availability | DynamoDB DAX, Spanner        |
| **Eventual consistency**         | Writes propagate asynchronously; stale reads possible until convergence | Lower latency, higher availability                                   | DynamoDB default, S3         |
| **Read-after-write consistency** | A client always sees its own writes immediately, but others may not     | Balances write availability with read freshness                      | User session stores          |
| **Causal consistency**           | Causally related operations seen in order; unrelated ones can lag       | Preserves logical ordering without global coordination               | DynamoDB Transactions, CRDTs |

**Note: eventual vs read-after-write:** With eventual consistency even the _writer_ may not see their own write immediately — the read could land on a replica still catching up. With read-after-write consistency the writer always sees their own writes, but other clients may still read stale data for a while.

---

## CAP Theorem

**CAP Theorem:** In a distributed data store, you can have at most two of **Consistency** (every read returns the most recent write), **Availability** (every request receives a non-error response) and **Partition Tolerance** (the system continues operating despite network failures).

**Note — two caveats to keep in mind:**

1. **Writes during a partition:** In a **CP** system the majority side keeps accepting writes but the minority side rejects writes (returns errors) to prevent divergence. Those writes fail until the partition heals — they are not lost, simply denied. In an **AP** system both sides accept writes but data may diverge until the link is restored.

2. **Why CA is impossible:** Partitions are inevitable — network failures _will_ happen. A CA-classified system is only CA _when the network is perfect_, which is never true at scale. The real choice in production is CP or AP.

**How real systems pick their trade-off:**

| System                   | Official CAP | How they engineer around the sacrificed aspect                                                                                                                                                              | Use Cases                                                                                            |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Spanner**              | CA           | TrueTime (GPS + atomic clocks) guarantees external consistency across regions; Google's private redundant fiber network makes partitions so rare that 99.999% availability is achievable despite being CP   | Global financial ledgers, multi-region inventory, planetary-scale OLTP                               |
| **DynamoDB**             | AP           | Default is eventually consistent; per-request strongly consistent reads available at higher latency/cost; DynamoDB Transactions add causal consistency on top of an AP foundation                           | Session stores, shopping carts, gaming leaderboards, high-traffic user profiles, IoT event ingestion |
| **Cassandra**            | AP           | Tunable consistency per query (ONE, QUORUM, ALL) — dial up when needed; no single point of failure means linear scalability at the cost of strong consistency                                               | Time-series data, IoT sensor ingestion, messaging / chat, recommendation engines                     |
| **MongoDB**              | CP           | Automatic replica-set failover; all writes go to primary; reads can be configured for eventual consistency (secondary reads) when partition tolerance matters more                                          | Content management, catalogs, real-time analytics, mobile backends                                   |
| **CockroachDB**          | CP           | Serializable isolation via Raft consensus; survives full region outages — but drops writes if no quorum is reachable                                                                                        | Multi-region SaaS backends, financial services requiring strong consistency with geo-distribution    |
| **Clustered PG / MySQL** | CP           | Primary handles all writes; replica takes over on failure — writes are blocked during promotion. RDBMS outside CAP's scope entirely (CAP governs distributed systems; a single instance is not distributed) | Single-region financial transactions, ERP, traditional relational workloads                          |

**Key insight:** The "sacrificed" pillar is never truly zero. AP systems find ways to give you consistency when you need it (DynamoDB strongly consistent reads, Cassandra QUORUM). CP systems invest heavily in infrastructure to make partitions rare (Spanner's private network, Raft lease mechanisms). No system fully ignores any pillar — they just prioritise.

**No database guarantees 100% availability.** The best achievable is five 9s (99.999%) — about 5 minutes of downtime per year. Even AP systems go down during a full-region outage (no replicas left) or a software/ops failure that affects all nodes simultaneously. Real-world outages happen regardless of architectural trade-off: global DNS failures, bad schema migrations, shared control-plane bugs, misconfigured firewalls.

**DynamoDB-specific write behaviour (being AP):** DynamoDB does not have dirty writes or dirty reads — every write is atomic and there is no uncommitted state. However, its default **last-writer-wins** policy means concurrent writes silently overwrite each other (lost updates). To prevent this, use **conditional writes** (`ConditionExpression`) for optimistic locking, or **DynamoDB Transactions** for serializable isolation. The trade-off: preventing lost updates requires a read-before-write round trip, reducing throughput.

**RDBMS replication modes (sync vs async):** In **async** replication (default in PostgreSQL, MySQL) the primary commits immediately and ships the WAL to replicas asynchronously. A replica failure never stalls the primary — the replica catches up when it returns. In **sync** replication, the primary waits for at least one replica to acknowledge before committing. If the replica is down, the primary stalls. Most production deployments use **semi-sync** — the primary waits for a configurable timeout (e.g. 100ms), then falls back to async to avoid blocking writes on a slow or unreachable replica.

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 9); "Brewer's Conjecture and the Feasibility of C, A, P" (Eric Brewer, PODC 2000)

---

## Write Anomalies

**Write anomalies:** Types of data corruption that can occur when multiple clients read and write concurrently without proper isolation. The choice of consistency model and database architecture determines which anomalies are possible.

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 7)

| Anomaly                 | Definition                                                                                                                  | RDBMS (PG / MySQL)                                                                                 | AP NoSQL                                                                                                                                       | Availability trade-off                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Dirty write**         | Overwriting data that another client is still modifying (has not committed yet)                                             | Prevented at all isolation levels — uncommitted writes are invisible via row-level locking         | Not possible — there is no uncommitted state. Every write is atomic and immediately visible                                                    | No trade-off: atomic-write model naturally avoids this                                                                                |
| **Dirty read**          | Reading data that another client is modifying but has not committed yet                                                     | Prevented at Read Committed and above                                                              | Not possible (same reason — no uncommitted state)                                                                                              | No trade-off                                                                                                                          |
| **Lost update**         | Two concurrent writes silently overwrite each other; the last writer wins and the earlier write disappears                  | Prevented at all isolation levels — a write locks the row until commit, so concurrent writes queue | Default: last-writer-wins. Prevented via conditional writes (optimistic locking) or transactions                                               | Preventing requires a read-before-write round trip, reducing throughput and increasing latency. Last-writer-wins favours availability |
| **Non-repeatable read** | Reading the same row twice and getting different results because another client modified it in between                      | Possible at Read Committed; prevented at Repeatable Read+                                          | Strongly consistent reads return the latest version every time. Eventual consistency may return stale committed data, but that's not a phantom | Strongly consistent reads cost more resources and add latency                                                                         |
| **Phantom read**        | A search predicate returns different sets of rows on two executions because another client inserted/deleted rows in between | Possible at Read Committed and Repeatable Read; prevented at Serializable                          | No equivalent concept in key-value / document stores — queries reflect current committed state                                                 | —                                                                                                                                     |

---

## Partitioning (Sharding)

**Partitioning:** Splitting a dataset across multiple independent nodes so no single node holds everything. Each partition is responsible for a subset of the data. In HA terms:

- **Limits blast radius** — if one partition fails, only the data on that node is affected; the rest stays up.
- **Enables horizontal scaling** — more partitions = more nodes = more room for redundancy.
- **Determines rebalance complexity** — adding/removing nodes requires redistribution (e.g. consistent hashing minimises moves).

**Partitioning strategies (choices):**

| Strategy            | How it works                                        | HA Strengths                               | HA Weaknesses                                                            |
| ------------------- | --------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| **Range-based**     | Split by key range (A-M, N-Z)                       | Simple, efficient range queries            | Hot spots if distribution is skewed; rebalancing moves large ranges      |
| **Hash-based**      | Hash(key) % N determines shard                      | Even distribution, good load balance       | Range queries hit all shards; adding/removing nodes reshuffles most data |
| **Directory-based** | Lookup table maps key to shard                      | Flexible, supports dynamic splits          | Lookup table is a SPOF and potential bottleneck                          |
| **List-based**      | Split by discrete value list (region: US, EU, APAC) | Aligns with access patterns, geo-isolation | Uneven list sizes cause hot shards                                       |
| **Composite**       | Combine two or more (e.g. hash within range)        | Best of both worlds                        | Higher routing and rebalance complexity                                  |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 6); _The Art of Scalability_ by Abbott & Fisher (Ch. 15)

---

## Caching

**Caching:** Temporarily storing frequently accessed data in a fast, nearby layer to reduce load on slower backend systems. In HA context:

**Placement choices:**

| Placement       | Architecture                              | HA Strengths                                             | HA Weaknesses                                   |
| --------------- | ----------------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| **Local**       | In-process per instance (Caffeine, Guava) | Fastest, no network dependency                           | Stale across instances, memory-limited per node |
| **Distributed** | Shared cluster (Redis, Memcached)         | Consistent view, replication across AZs, larger capacity | Network latency, cache cluster is itself a SPOF |

**Write policy choices:**

| Strategy                       | How it works                                 | HA Strengths                                       | HA Weaknesses                                          |
| ------------------------------ | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| **Cache-aside (lazy loading)** | App checks cache; on miss, loads from DB     | Degrades to DB reads if cache fails; battle-tested | Thundering herd on cold start; stale until TTL expires |
| **Read-through**               | Cache fetches from DB on miss transparently  | Simplified app logic, consistent staleness         | Cache failure causes full outage until restored        |
| **Write-through**              | Write to cache + DB synchronously            | Cache always fresh                                 | Higher write latency; double failure surface           |
| **Write-behind**               | Write to cache, async flush to DB            | Low write latency, absorbs bursts                  | Data loss if cache fails before flush completes        |
| **Refresh-ahead**              | Cache proactively refreshes expiring entries | No thundering herd, consistent low latency         | Wastes resources if predictions miss                   |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 12)

---

## Replication Patterns

Replication has two orthogonal dimensions: **topology** (who can accept writes) and **mode** (when the write returns to the caller).

**Topology patterns:**

| Pattern                 | Write                         | Read                                    | HA Strengths                             | HA Weaknesses                                                     |
| ----------------------- | ----------------------------- | --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| **Single-leader**       | One node                      | Strong from leader; stale from replicas | Simple failover, known semantics         | Write SPOF; failover has RTO                                      |
| **Multi-leader**        | Multiple nodes                | Eventual (conflict resolution)          | Survives region outage; no write SPOF    | Conflict resolution (LWW loses data); causality tracking required |
| **Leaderless (quorum)** | Any node (R+W > N for strong) | Configurable via quorum size            | Highest availability; linear scalability | Weak consistency at low quorum; vector clocks needed              |

**Replication modes** (applies within any topology):

| Mode                 | Behaviour                                               | HA Impact                                                                     |
| -------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Synchronous**      | Primary waits for all replicas to ack before confirming | Zero data loss; higher write latency; availability drops if a replica is slow |
| **Asynchronous**     | Primary confirms before replicas ack                    | Low latency; data loss on primary failure before replication catches up       |
| **Semi-synchronous** | Primary waits for one replica to ack, rest async        | Best trade-off for most workloads; some data loss risk still present          |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 5); _Database Internals_ by Alex Petrov (Ch. 9-10)

---

## Leader Election / Distributed Coordination

Mechanisms for electing a single leader among multiple replicas to coordinate writes, assign partition ownership or manage task distribution:

| Pattern                                   | How it works                                                                                                | HA Strengths                                                                              | HA Weaknesses                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Raft / Paxos consensus**                | Majority-based voting to elect a leader with a replicated write-ahead log                                   | Strong consistency guarantees; well-understood safety properties; no split-brain          | Multiple RTTs per write under leader; leader election has a blackout window                                     |
| **Lease-based (etcd, Zookeeper, Consul)** | Candidate creates an ephemeral lease; lease expiry triggers re-election                                     | Simple lease semantics; lease renewal acts as heartbeat; widely used in service discovery | Lease window must be tuned — too short causes false elections, too long delays failover; clock skew sensitivity |
| **Generation clock / fencing token**      | Monotonically increasing token issued with each leader term; older tokens are rejected by the storage layer | Prevents a stale leader from corrupting shared state after a split or partition heals     | Requires the resource layer (DB, queue, lock manager) to validate the token on every write                      |
| **Bully algorithm**                       | Highest-ID node becomes leader; all others defer                                                            | Simple to implement; no consensus overhead                                                | If the highest-ID node is unstable leadership churns; O(n²) message complexity                                  |

**How Raft consensus works.** A cluster elects a single leader by majority vote. The leader is the only node that accepts writes — followers just replicate its decisions. No split-brain is possible because only one leader can exist per term.

**Replicated write-ahead log (WAL).** Every write is first appended to a durable log file on the leader. That log entry is replicated to a majority of followers before the leader commits it. Each follower appends the same entry to its own WAL in the same order. If the leader crashes, the new leader replays its WAL so no committed write is lost. Because the log is _write-ahead_ (recorded before the state is updated) and _replicated_ (copied to N servers), you get durability even if half the cluster dies. This is the foundation of Aurora, DynamoDB Global Tables, CockroachDB, Kafka's KRaft mode and many other HA data services.

**Ephemeral** (in lease-based elections) means temporary — the lease auto-expires if not renewed. The leader periodically renews its lease to stay alive; if it crashes, the lease expires and triggers re-election. No manual cleanup needed.

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 8, 9); _Database Internals_ by Alex Petrov (Ch. 7-8)

---

## Load Balancing Patterns

**Distribution algorithms:**

| Pattern                       | How it works                                     | HA Strengths                                           | HA Weaknesses                                                       |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------- |
| **Round Robin**               | Cycles through targets in order                  | Simple, no state                                       | Ignores backend load; slow instances get the same rate as fast ones |
| **Least Connections**         | Sends to backend with fewest active connections  | Adapts to varying request durations                    | Requires connection tracking state on LB                            |
| **Least Response Time**       | Sends to fastest-responding backend              | Adapts to degraded instances (slower = fewer requests) | Relies on accurate latency measurements                             |
| **Weighted**                  | Distributes proportionally (e.g. 3:1)            | Handles heterogeneous instances                        | Static weights need manual tuning                                   |
| **IP Hash / Sticky sessions** | Pins client to backend via hash                  | Consistent routing for stateful apps                   | Breaks when backend count changes; thundering herd on failover      |
| **Consistent Hashing**        | Hash-based with minimal reshuffle on node change | Cache affinity; minimal rebalancing on scale events    | Complex hash ring management                                        |

**Architectural patterns (LB placement):**

| Pattern                                | Architecture                                          | HA Strengths                                                | HA Weaknesses                                       |
| -------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| **Layer 4 (TCP)**                      | Routes on IP + port                                   | Simple, fast, no TLS overhead                               | No content-aware routing; limited health checks     |
| **Layer 7 (HTTP)**                     | Inspects headers, paths, cookies                      | Content-based routing, smart health checks, TLS termination | Higher CPU cost; more attack surface (TLS)          |
| **Active-passive**                     | One LB handles traffic; standby takes over on failure | Simple failover, no split-brain                             | Half capacity idle; failover has RTO                |
| **Active-active (anycast / DNS GSLB)** | Multiple LBs accept traffic simultaneously            | Full capacity utilised; sub-second failover (anycast)       | Complex routing; DNS caching delays failover (GSLB) |

**Instance lifecycle / draining:**

| Pattern                           | How it works                                                                                                                                        | HA Strengths                                                                                            | HA Weaknesses                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lame Duck / Graceful Shutdown** | Instance deregisters from the LB or returns unhealthy, finishes in-flight requests within a configured grace period (drain window), then shuts down | Zero failed requests during deployments, scale-in and rolling updates; hot instances get no new traffic | Grace period must exceed the longest expected request; slow clients may still see connection reset; in-flight tracking adds application complexity |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 20)

---

## Connection Pooling Patterns

**Size strategy:**

| Pattern                          | How it works                                         | HA Strengths                                                        | HA Weaknesses                                            |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| **Fixed pool**                   | Constant size regardless of load                     | Predictable resource usage                                          | Cannot absorb traffic spikes; queue builds up            |
| **Dynamic pool**                 | Grows/shrinks with demand                            | Adapts to varying load                                              | Risk of connection storm cascading to backend under peak |
| **Partitioned (separate pools)** | Isolated pool per workload (read / write / critical) | Connection-level bulkheading — one caller type cannot starve others | Requires more connections; harder to tune per-pool       |

**Health validation:**

| Pattern            | Behaviour                          | HA Strengths                              | HA Weaknesses                      |
| ------------------ | ---------------------------------- | ----------------------------------------- | ---------------------------------- |
| **Test-on-borrow** | Validate before handing to caller  | Catches dead connections before use       | Adds latency to every acquire      |
| **Test-idle**      | Periodic check on idle connections | Low overhead; catches many failures early | Stale between check intervals      |
| **Test-on-return** | Check when returned to pool        | Useful for detecting leaky connections    | Does not protect the next acquirer |

**Exhaustion behaviour:**

| Pattern             | Behaviour                                    | HA Strengths                                             | HA Weaknesses                                                        |
| ------------------- | -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| **Block / queue**   | Caller waits until a connection is available | Highest throughput under normal conditions               | Can cause cascading pileup — all blocked callers cascade             |
| **Fail fast**       | Throw error immediately                      | Graceful degradation; lets caller circuit-break upstream | Drops legitimate requests under brief spikes                         |
| **Timeout + retry** | Wait up to N ms, then fail                   | Balanced — absorbs brief waits without cascading         | Tuning window is narrow (too long = cascade; too short = false fail) |

---

## Bulkhead

Isolating system resources into isolated pools so a failure in one pool does not cascade to others — named after the watertight compartments (bulkheads) on a ship:

| Isolation level                       | How it works                                                                                                                   | HA Strengths                                                                                                                     | HA Weaknesses                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thread pool isolation**             | Each downstream dependency gets its own thread pool (e.g. Hystrix thread pools)                                                | One slow or hung downstream cannot exhaust all threads in the service; failure is contained per pool                             | Higher overhead from context switching; thread pool sizing must be tuned per dependency                                                                           |
| **Semaphore isolation**               | Caps the number of concurrent callers via a semaphore instead of a separate thread pool (e.g. Resilience4j semaphore bulkhead) | Lower overhead than thread pool isolation; no thread context switching; blocks the calling thread only up to the semaphore limit | No built-in timeout — a blocked caller stays blocked until a permit is acquired unless a separate timing mechanism is added; cannot interrupt a running operation |
| **Connection pool isolation**         | Separate connection pools per downstream or per workload class                                                                 | Connection exhaustion in one pool does not block other dependencies                                                              | More total connections needed; per-pool sizing must account for peak load independently                                                                           |
| **Process / container isolation**     | Each service or workload runs in its own process or container                                                                  | A crash, OOM or memory leak in one does not affect others                                                                        | Higher resource overhead per process; inter-process communication latency                                                                                         |
| **Cellular / shard isolation**        | Each shard or cell is independent with its own resources (compute + storage)                                                   | Complete blast radius containment — one cell failure cannot affect others; independent deployments per cell                      | No cross-cell resource sharing; warm standby needed per cell for failover                                                                                         |
| **Tenant / consumer-based isolation** | Pools partitioned by caller identity (premium vs free tier, per-tenant) rather than by downstream dependency                   | A flood of low-priority requests cannot starve high-priority callers because each tenant draws from its own isolated pool        | Harder to size per-tenant pools without tenant-level traffic data; many small pools increase total resource overhead                                              |

**Sources:** _Building Microservices_ by Sam Newman (Ch. 7); _Site Reliability Engineering_ by Beyer et al. (Ch. 22)

---

## Retry Logic Patterns

| Pattern                          | Behaviour                                         | HA Strengths                                                    | HA Weaknesses                                           |
| -------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| **Simple retry**                 | Fixed N retries immediately                       | Simple to implement                                             | Can amplify load on an already-stressed backend         |
| **Exponential backoff**          | Increasing delay between retries                  | Reduces pressure on recovering backend                          | Clients may time out before backoff completes           |
| **Exponential backoff + jitter** | Adds randomness to delay                          | Prevents thundering herd — retries from all clients do not sync | Slightly higher latency on the unlucky long-drawn retry |
| **Circuit breaker**              | Stop retrying after threshold, probe periodically | Protects backend from cascading failure                         | False trip if threshold is too tight                    |
| **Retry budget**                 | Limit total retries across all requests           | Prevents system-wide overload from aggregate retries            | Hard to tune — too conservative leaves retries unused   |
| **Idempotency key**              | Unique key so retries do not produce duplicates   | Safe to retry indefinitely without side effects                 | Requires application-level deduplication logic          |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 22); _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 8)

---

## Health Check Patterns

**Probe type:**

| Type                     | What it detects                      | HA Strengths                 | HA Weaknesses                                                   |
| ------------------------ | ------------------------------------ | ---------------------------- | --------------------------------------------------------------- |
| **TCP**                  | Port is open                         | Fast, low overhead           | Misses app-level failures (process alive but pool exhausted)    |
| **HTTP endpoint**        | `/healthz` returns 200               | Catches application failures | Logic in the handler; a slow DB can cascade and falsely trip it |
| **gRPC health protocol** | Standard gRPC health service         | Language-agnostic, streaming | Only works for gRPC backends                                    |
| **Command / script**     | Exit code of inside-container script | Flexible, can check anything | Higher overhead; shell dependency                               |

**Check depth:**

| Check         | Behaviour                                       | HA Strengths                                    | HA Weaknesses                                                     |
| ------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| **Liveness**  | Is the process alive? Restart if dead           | Recovers from hangs and deadlocks               | Too aggressive can restart a healthy-but-slow instance            |
| **Readiness** | Is it ready to serve? Remove from LB if not     | Drains traffic from degraded instances          | Misconfigured dependency check removes all nodes in cascade       |
| **Startup**   | Has init completed? Delays liveness during boot | Prevents premature restarts during slow startup | Adds boot latency; if too short, defeats the purpose              |
| **Shallow**   | Quick self-check only                           | Fast, cheap                                     | Misses dependency failures                                        |
| **Deep**      | Checks dependencies (DB, cache, downstream)     | Catches transitive failures                     | A downstream blip can falsely remove a perfectly healthy instance |

**Aggregation:**

| Pattern                | Behaviour                          | HA Strengths                             | HA Weaknesses                                                |
| ---------------------- | ---------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| **Single `/healthz`**  | One endpoint for everything        | Simple, easy to wire                     | A degraded cache removes the entire node                     |
| **Separate endpoints** | `/live`, `/ready`, `/db`, `/cache` | Granular — decide what removes vs alerts | More endpoints to manage; orchestrators need multiple probes |

**Direction:**

| Pattern                  | Behaviour                                | HA Strengths                                   | HA Weaknesses                                                            |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| **Pull (LB polls)**      | Load balancer polls each target          | LB controls check rate; no registration needed | Inactive instances not discovered until next poll cycle                  |
| **Push (self-register)** | Instance registers with service registry | Instant registration; registry holds state     | Registry is itself a SPOF; health becomes stale between re-registrations |

**Sources:** _Kubernetes in Action_ by Marko Lukša (Ch. 8); _Site Reliability Engineering_ by Beyer et al. (Ch. 20)

---

## Traffic Shifting Patterns

| Pattern                  | Mechanism                                       | AWS Support                                               | HA Strengths                                      | HA Weaknesses                                                |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **Canary (weighted)**    | Route X% to new version, increase gradually     | Route 53 weighted, ALB weighted target groups, CodeDeploy | Gradual exposure; zero-weight rollback            | Needs metrics comparison; statistical noise can mislead      |
| **Header / cookie**      | Route specific users via header match           | ALB rule-based routing, CloudFront + Lambda@Edge          | Zero impact on production users                   | Only tests the paths matched users exercise                  |
| **Blue/green**           | Swap whole target pool behind LB                | CodeDeploy, ECS blue/green, ALB target group swap         | Instant rollback (revert pool swap)               | All-or-nothing; double capacity during cutover               |
| **Geographic / latency** | Shift DNS weights per region                    | Route 53 geolocation, latency, geoproximity               | Isolates blast radius by region                   | Slow DNS propagation; coarse-grained control                 |
| **GSLB percentage**      | Gradually shift DNS resolution %                | Route 53 weighted routing                                 | Multi-region failover testing                     | DNS TTL delays each step takes minutes                       |
| **Shadow / mirror**      | Duplicate live requests to new version silently | API Gateway stage mirroring, VPC Traffic Mirroring        | Zero user impact; validates latency + correctness | Backend must handle and discard mirrored requests separately |
| **A/B split**            | Canary with session persistence                 | ALB weighted + sticky sessions                            | User-consistent experience during shift           | Sticky sessions complicate draining old sessions             |

**Cross-cutting rule:** Never shift more traffic than you can absorb if the new version fails. Stage the rollback before the shift starts.

**Sources:** _Continuous Delivery_ by Humble & Farley (Ch. 10); _The DevOps Handbook_ by Kim et al. (Ch. 13)

---

## TTL Management Patterns

| Pattern                       | Behaviour                                              | HA Strengths                                         | HA Weaknesses                                                   |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------- |
| **Low TTL (30–300s)**         | DNS records expire quickly                             | Fast failover — clients pick up new IPs in seconds   | High query volume; higher cost (Route 53 charges per query)     |
| **High TTL (300–86400s)**     | DNS records cached for long periods                    | Low query volume; stable caching; cheaper            | Slow failover — stale clients hit dead IPs for minutes to hours |
| **Client-side re-resolution** | App re-resolves DNS at a shorter interval than the TTL | Break glass for critical services — bypass DNS cache | Non-standard; adds application complexity                       |

---

## Disaster Recovery Strategies

DR strategies trade off recovery speed against cost. Each has different RTO and RPO characteristics:

| Strategy                         | RPO       | RTO                | Cost        | HA Strengths                                              | HA Weaknesses                                                 |
| -------------------------------- | --------- | ------------------ | ----------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| **Backup & Restore**             | Hours     | Hours              | Low         | Simple, cheap, well-understood                            | Highest RTO/RPO; data loss window measured in hours           |
| **Pilot Light**                  | Minutes   | Tens of minutes    | Medium      | Core data always current; compute provisioned on failover | Compute cold start; may need manual scaling decisions         |
| **Warm Standby**                 | Seconds   | Minutes            | Medium-High | Fully functional scaled-down environment; fast scale-up   | Double base infra cost at reduced capacity; not instant       |
| **Active-Passive (standby)**     | Near-zero | Seconds to minutes | High        | Instant traffic switch; full capacity ready               | Double full infra cost; idle resources in standby region      |
| **Active-Active (multi-region)** | Near-zero | Near-zero          | Very High   | No failover delay; all capacity utilised; no idle waste   | Highest complexity; conflict resolution for concurrent writes |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 29); AWS Well-Architected Framework Reliability Pillar

---

## Auto-scaling Strategies

Auto-scaling ensures enough compute capacity is available to handle traffic without over-provisioning:

| Strategy                  | Mechanism                                                          | HA Strengths                                             | HA Weaknesses                                                        |
| ------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- |
| **Target tracking**       | Scale on a single metric threshold (e.g. CPU at 70%)               | Simple to configure; AWS-managed; predictable            | Reacts to load after it arrives — no anticipation                    |
| **Step scaling**          | Scale by defined increments per alarm severity level               | Granular control; faster response for large swings       | Complex to tune multiple thresholds; can oscillate                   |
| **Predictive scaling**    | ML-based forecast of future load from historical patterns          | Anticipates demand before it arrives; reduces cold start | Requires stable historical data; may over-provision for novel spikes |
| **Scheduled scaling**     | Scale at known times (peak hours, marketing events, holiday sales) | Zero reaction time; perfect for known patterns           | Useless for unexpected events; needs manual schedule maintenance     |
| **Dynamic (queue-based)** | Scale based on queue depth or backlog (SQS, Kinesis)               | Absorbs processing bursts; consumer-first scaling        | Lag between queue growth and scale action; oscillation risk          |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 20)

---

## Rate Limiting / Throttling

Rate limiting protects backend services from resource exhaustion by rejecting excess requests:

| Strategy                           | How it works                                                           | HA Strengths                                              | HA Weaknesses                                                      |
| ---------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| **Token bucket**                   | Bucket of N tokens refilled at R tokens/sec; each request consumes one | Simple, permits bursts up to bucket size                  | Global bucket alone cannot isolate abusive clients                 |
| **Leaky bucket**                   | Request queue drained at fixed rate; excess spills                     | Smooths traffic to a predictable rate                     | Drops bursts entirely; no flexibility for brief spikes             |
| **Fixed window**                   | Count requests per time window (e.g. 100/min), reset at boundary       | Very simple to implement; low memory                      | Traffic spike at window boundary can double throughput momentarily |
| **Sliding window**                 | Rolling time window with sub-second granularity                        | More accurate rate enforcement; no boundary spike         | Higher memory and computation per client                           |
| **Per-client vs global**           | Separate counters per API key/user or one shared counter               | Per-client prevents noisy neighbours from starving others | Global is simpler but allows one client to exhaust shared capacity |
| **Adaptive (concurrency-limited)** | Limit based on backend capacity using Little's Law                     | Protects backend regardless of request rate pattern       | Requires real-time saturation or latency signal from backend       |

**Sources:** _Building Microservices_ by Sam Newman (Ch. 7); _Site Reliability Engineering_ by Beyer et al. (Ch. 21)

---

## Backpressure / Load Shedding

When the system cannot keep up with demand, backpressure mechanisms slow intake or shed load rather than degrading unpredictably:

| Pattern                                    | How it works                                                         | HA Strengths                                            | HA Weaknesses                                                         |
| ------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| **Admission control**                      | Reject requests before they enter the service (at LB or API gateway) | Preserves remaining capacity for in-flight work         | Rejects legitimate requests that could have been queued               |
| **Queue depth limits**                     | Cap the internal work queue; reject when full                        | Bounded latency; predictable degradation under load     | Need to size the cap correctly — too small rejects unnecessarily      |
| **Priority queuing**                       | Classify requests by priority; process high-priority first           | Critical path preserved under load                      | Low-priority requests may starve indefinitely                         |
| **Graceful rejection (503 + Retry-After)** | Return 503 with a Retry-After header                                 | Client can back off intelligently; reduces retry storms | Requires client cooperation — non-compliant clients ignore the header |
| **Load shedding by percentage**            | Drop X% of all traffic at the edge (ALB rule or feature flag)        | Quick to activate; easy to undo; tested in advance      | Blunt instrument; drops good traffic along with bad                   |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 21); _Building Microservices_ by Sam Newman (Ch. 7)

---

## Timeout Patterns

Timeouts prevent a single slow dependency from consuming resources indefinitely:

| Type                       | What it sets                                          | HA Strengths                                                             | HA Weaknesses                                                            |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Connection timeout**     | Max time to establish TCP/TLS handshake               | Catches network failures fast; frees resources quickly                   | Too low causes false failures on flaky but functional networks           |
| **Read timeout**           | Max time to receive the complete response body        | Prevents a slow downstream from holding a thread/connection indefinitely | Too high delays detection; too low causes unnecessary retries            |
| **Write timeout**          | Max time to send the request body                     | Protects against slow upstream ingestion                                 | Rarely the bottleneck in practice                                        |
| **Deadline propagation**   | Pass the remaining timeout budget to downstream calls | Coherent end-to-end timeout — no downstream outlives the caller          | Complex to implement; clock skew between services can misalign budgets   |
| **Per-dependency timeout** | Independent timeout for each downstream service call  | Isolates failures — one slow dependency cannot cascade to others         | Requires configuration per dependency; more surface for misconfiguration |
| **Per-request timeout**    | Single timeout for the entire request end-to-end      | Simple; guaranteed total latency bound                                   | A brief hiccup in one dependency exhausts the whole timeout budget       |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 22); _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 8)

---

## Service Discovery

Service discovery lets clients find healthy instances of a dependency without hard-coding addresses:

| Pattern                                      | How it works                                                        | HA Strengths                                                        | HA Weaknesses                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Client-side**                              | Client queries a service registry and load-balances locally         | No extra network hop; client controls retry and balancing           | Registry is a SPOF; each language needs its own discovery library              |
| **Server-side (LB)**                         | Load balancer or API gateway handles discovery and routing          | Centralised; clients are simple HTTP callers                        | Extra network hop; LB itself must be highly available                          |
| **DNS-based**                                | DNS returns multiple A records for healthy instances (round-robin)  | Simple, battle-tested, no additional infrastructure                 | Slow propagation; TTL delays failover; limited health granularity              |
| **Registry-based (Consul, etcd, Zookeeper)** | Dedicated service registry with health checking                     | Rich health metadata; fast updates; watch-based change notification | Registry cluster is itself a complex distributed system to operate             |
| **Service mesh (sidecar proxy)**             | Sidecar proxy intercepts all outbound traffic and handles discovery | App-agnostic; language-independent; rich telemetry                  | Added latency per hop; significant operational overhead for mesh control plane |

**Sources:** _Building Microservices_ by Sam Newman (Ch. 8); _Kubernetes in Action_ by Marko Lukša (Ch. 5)

---

## Chaos Engineering

Chaos engineering validates that a system withstands unexpected failures by injecting faults in a controlled manner:

| Pattern                  | What it tests                                                         | HA Strengths                                                            | HA Weaknesses                                                     |
| ------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Fault injection**      | Inject specific failure (kill pod, block port, terminate instance)    | Validates a specific resilience mechanism end-to-end                    | Narrow scope — only tests the injected failure mode               |
| **Latency injection**    | Add delay to downstream calls (e.g. +500ms on DB queries)             | Tests timeout and retry behaviour; validates circuit breaker thresholds | Can trigger false alarms if monitoring is too sensitive           |
| **Resource exhaustion**  | Saturate CPU, memory, disk, or file descriptors                       | Validates throttling, auto-scaling, and OOM handling                    | Risk of real cascading failure if blast radius is not contained   |
| **Game days**            | Full scenario simulation with ops team responding                     | Builds team muscle memory; exposes runbook and tooling gaps             | Disruptive; requires cross-team scheduling and stakeholder buy-in |
| **Blast radius control** | Keep experiments within bounded scope (one AZ, one cell, one service) | Contains damage; safe to run in production-like environments            | May not test cross-cell or cross-region failure propagation       |

**Sources:** _Chaos Engineering_ by Casey Rosenthal & Nora Jones; _Site Reliability Engineering_ by Beyer et al. (Ch. 27)

---

## Supervisor / Watchdog

A monitoring process that detects failures in a worker process and restarts it or triggers escalation:

| Pattern                                                   | How it works                                                                                              | HA Strengths                                                                          | HA Weaknesses                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Process supervisor** (Erlang OTP, systemd, supervisord) | Parent process monitors child; restarts it on crash or hang                                               | Fast local restart; no external dependency; battle-tested in Erlang/Elixir            | Does not protect against infrastructure-level failures (host, network, AZ)                   |
| **Kuberentes ReplicaSet / Deployment**                    | Controller ensures N replicas are running; replaces terminated pods                                       | Declarative; self-healing across nodes; integrates with readiness and liveness probes | Restart takes seconds (pull image, init); does not handle stateful failures (corrupted data) |
| **Sidecar health proxy** (Envoy, Istio sidecar)           | Sidecar monitors the application process and reports health to the control plane                          | Language-agnostic; integrates with service mesh observability                         | Adds latency for health check proxying; sidecar can become a SPOF for the pod                |
| **External watchdog** (separate monitoring system)        | Out-of-process system (e.g. Prometheus + Alertmanager, Datadog) that alerts when a process is unreachable | Independent of the monitored process; can trigger escalations and page humans         | Detection latency includes scrape interval + alert evaluation time                           |

**Sources:** _Kuberentes in Action_ by Marko Lukša (Ch. 8); _Site Reliability Engineering_ by Beyer et al. (Ch. 11)

---

## Saga / Compensating Transactions

Sagas manage data consistency across multiple services without distributed transactions. Each step has a compensating action to undo it:

| Pattern               | How it works                                                         | HA Strengths                                                 | HA Weaknesses                                                    |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Choreography**      | Each service emits events; the next service reacts to the event      | No central coordinator; simple topology; no SPOF             | Hard to trace the full workflow; no central view of state        |
| **Orchestration**     | Central coordinator calls each service in sequence and manages state | Traceable; compensatable on failure; central state tracking  | Coordinator is a SPOF and a potential bottleneck                 |
| **Backward recovery** | Compensating actions undo completed steps on failure                 | Eventual consistency with full rollback capability           | Compensations may fail themselves, requiring manual intervention |
| **Forward recovery**  | Retry or continue from the failure point without rolling back        | No rollback needed; can complete if the failure is transient | May leave partially-committed data in an inconsistent state      |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 9); _Microservices Patterns_ by Chris Richardson (Ch. 4)

---

## Feature Flags / Toggles

Feature flags separate deployment from release, enabling instant kill-switches, gradual rollouts, and operational flexibility:

| Type                  | Purpose                                                               | HA Strengths                                                       | HA Weaknesses                                                               |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Release toggle**    | Gate new features behind a flag; enable when ready                    | Separate deploy from release; instant kill-switch without rollback | Flag debt — stale flags accumulate and increase code complexity             |
| **Ops toggle**        | Control operational behaviour (disable caching, enable debug logging) | Emergency lever for operational issues; no code deploy needed      | Must be tested pre-production; can cause surprise behaviour if toggled live |
| **Experiment toggle** | A/B test or canary release with percentage-based exposure             | Gradual rollout with data-driven go/no-go decisions                | Statistical noise can mislead; needs careful metric design                  |
| **Permission toggle** | Enable features for specific users, tenants, or roles                 | Targeted rollouts; tenant isolation; staged enterprise rollouts    | Complexity grows with permission matrix size                                |
| **Kill switch**       | Emergency disable of a non-critical feature under load                | Last line of defence before full outage; proven in game days       | Must be pre-built and tested; useless if created during the incident        |

**Sources:** _Continuous Delivery_ by Humble & Farley (Ch. 14); _The DevOps Handbook_ by Kim et al. (Ch. 14)

---

## Circuit Breaker

Prevent cascading failures by failing fast when a downstream service is unhealthy, then probing periodically for recovery:

**Circuit breaker states:**

| State         | Behaviour                                            | HA Strengths                                                         | HA Weaknesses                                                         |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Closed**    | Normal operation; all calls pass through             | Zero overhead when healthy                                           | No protection until failure threshold is reached                      |
| **Open**      | Calls fail immediately without reaching downstream   | Protects downstream from cascading failure; gives it time to recover | Rejects all calls even if the downstream has already recovered        |
| **Half-open** | Limited probe requests pass through to test recovery | Enables automatic recovery without full exposure                     | May overload a still-recovering downstream if probe count is too high |

**Configuration dimensions:**

| Dimension                    | Options                                                                 | HA Strengths                                                                         | HA Weaknesses                                                                       |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Failure threshold**        | Count or percentage over a time window                                  | Count is simpler; percentage adapts to varying traffic volume                        | Percentage requires more events to trigger; count can false-trip on brief spikes    |
| **Cooldown / sleep window**  | Duration before transitioning from open to half-open                    | Shorter = faster recovery; longer = more protection for the downstream               | Too short risks repeated failures; too long delays availability unnecessarily       |
| **Probe count**              | Number of successful probes required to close the breaker               | Higher = more confidence in recovery; lower = faster restoration of normal operation | Too few probes may miss intermittent failures; too many delays service restoration  |
| **Per-dependency vs shared** | One breaker per downstream vs a single breaker for all downstream calls | Per-dependency isolates failures precisely; shared is simpler to configure           | Global breaker means one slow dependency opens the breaker for all downstream calls |

**Sources:** _Site Reliability Engineering_ by Beyer et al. (Ch. 22); _Building Microservices_ by Sam Newman (Ch. 7); _Microservices Patterns_ by Chris Richardson (Ch. 4)

---

## Graceful Degradation / Fallback

When a dependency fails or degrades, the system continues operating at reduced functionality rather than failing entirely:

| Strategy                    | How it works                                                             | HA Strengths                                                                | HA Weaknesses                                                             |
| --------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Stale data fallback**     | Return the last cached value when the primary data source is unavailable | Users see something meaningful rather than an error; buys time for recovery | Stale data may be incorrect for time-sensitive operations                 |
| **Functional degradation**  | Disable non-critical features while keeping critical paths working       | Preserves core user experience under partial failure                        | Users may be confused by partial functionality; needs clear UI signalling |
| **Default value fallback**  | Return a safe default when the real value cannot be fetched              | Simple to implement; fast                                                   | Default may be wrong for the specific request context                     |
| **Null object / no-op**     | Return an empty result or no-op instead of throwing an error             | Caller does not need to handle the error path; clean semantics              | Hides real failures from monitoring; delays detection                     |
| **Prioritised degradation** | Drop lower-priority requests first as resources become scarce            | Preserves SLOs for the most critical traffic                                | Requires classification of all request types by priority                  |

**Sources:** _Building Microservices_ by Sam Newman (Ch. 7); _Site Reliability Engineering_ by Beyer et al. (Ch. 22)

---

## API Gateway / Backend for Frontend (BFF)

A single entry point for client requests that handles cross-cutting concerns, reducing round-trips and centralizing HA policy enforcement:

| Pattern                        | How it works                                                                            | HA Strengths                                                                            | HA Weaknesses                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Single API Gateway**         | One gateway for all clients                                                             | Centralized auth, rate limiting, routing; single place to enforce HA policies           | SPOF if not deployed with HA (multi-AZ, multiple replicas); can become a throughput bottleneck |
| **Backend for Frontend (BFF)** | Dedicated gateway per client type (web, mobile, IoT)                                    | Client-specific optimizations; failure in one BFF does not affect other client types    | More infrastructure to manage; duplicated cross-cutting configuration across BFFs              |
| **Gateway Aggregation**        | Gateway aggregates responses from multiple downstream services for a single client call | Reduces client round-trips; hides internal service topology from clients                | Gateway becomes a chatty orchestrator; increased latency per aggregated request                |
| **Gateway Offloading**         | Gateway handles TLS termination, compression, caching on behalf of services             | Reduces per-service CPU for TLS; consistent compression and caching across all services | Gateway must be provisioned for CPU-intensive TLS termination                                  |

**Sources:** _Building Microservices_ by Sam Newman (Ch. 8); _Microservices Patterns_ by Chris Richardson (Ch. 8)

---

## CQRS (Command Query Responsibility Segregation)

Separating read and write data models so each can be optimized independently for its workload:

| Pattern                          | How it works                                                                                 | HA Strengths                                                                              | HA Weaknesses                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Separate read/write stores**   | Write model uses normalized OLTP store; read model uses denormalized views or search indexes | Read path can remain available even if write path fails; independent scaling on each side | Eventual consistency between write and read; read model can lag behind writes           |
| **Separate read/write services** | Distinct services for commands (writes) and queries (reads)                                  | Write service can degrade without affecting reads; independent deployment and scaling     | Duplicated business logic across services; read model must be rebuilt on schema changes |
| **Materialized views**           | Pre-computed read models updated asynchronously from the write model                         | Fast reads; no expensive joins at query time                                              | Stale data until the view is refreshed; storage grows with the number of views          |
| **Separate read replicas**       | Read-only database replicas serving query traffic                                            | Simple to implement; strong consistency with sync replicas or low latency with async      | Replica lag under high write throughput; writes still bottlenecked on the primary       |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 11); _Microservices Patterns_ by Chris Richardson (Ch. 11)

---

## Transactional Outbox

Ensures reliable message or event publishing by writing the message to the same database as the business data within the same transaction, eliminating the need for distributed transactions:

| Strategy                            | How it works                                                                               | HA Strengths                                                               | HA Weaknesses                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Polling publisher**               | Separate process polls the outbox table for unprocessed messages and publishes them        | Simple to implement; no additional infrastructure beyond the database      | Polling latency between write and publish; risk of duplicated delivery (at-least-once semantics) |
| **Transactional log tailing (CDC)** | Read from the database's commit log via CDC tooling (Debezium, AWS DMS)                    | Near-real-time delivery; no table contention between writers and publisher | Requires CDC infrastructure and operational expertise; schema changes must be handled carefully  |
| **Outbox table with TTL**           | Write message to outbox; publish via background worker; clean up processed records via TTL | Controlled retry semantics; visibility into pending messages and failures  | Table can grow under high volume if publishing stalls; needs cleanup process                     |
| **Saga + outbox combined**          | Outbox entries feed into a saga coordinator for multi-step workflows                       | Reliable saga step execution with full traceability; supports compensation | Higher complexity — outbox publishing and saga coordination must be managed together             |

**Sources:** _Microservices Patterns_ by Chris Richardson (Ch. 7); _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 11)

---

## Dead Letter Queue (DLQ)

A holding area for messages or events that cannot be processed successfully after repeated retries:

| Strategy                    | How it works                                                                  | HA Strengths                                                                                 | HA Weaknesses                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Simple DLQ**              | Failed messages moved to a separate queue after max retries exhausted         | Protects the main queue from poison-pill messages; preserves message order in the main queue | DLQ is a dead end without monitoring; messages sit there unless manually re-driven    |
| **DLQ with alerting**       | DLQ message arrival triggers an alert or incident                             | Ensures human attention on processing failures before data loss accumulates                  | Alert fatigue if retry policy is too lenient and DLQ fills frequently                 |
| **DLQ with replay**         | DLQ messages can be re-driven to the main queue after the root cause is fixed | Zero data loss for poison-pill messages; enables post-mortem analysis and replay             | Re-driven messages may arrive out of order; may cause duplicate processing downstream |
| **DLQ with TTL + archival** | DLQ messages expire after a TTL and are archived to object storage            | Bounded DLQ storage; audit trail for all failed messages                                     | Archived messages require a separate retrieval process for replay                     |

**Sources:** _Building Event-Driven Microservices_ by Adam Bellemare (Ch. 6); AWS Well-Architected Framework Reliability Pillar

---

## Event Sourcing

Storing the full sequence of state-changing events as the authoritative source of truth rather than only the current state:

| Strategy                    | How it works                                                                           | HA Strengths                                                                                   | HA Weaknesses                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Full event log**          | Append-only log of every state change; current state is derived by replaying events    | Complete audit trail; can rebuild state from any point in time; zero data loss                 | Replay can be slow for high-volume entities; storage grows unboundedly            |
| **Snapshot + event log**    | Periodic snapshots of current state; replay from the last snapshot on recovery         | Faster recovery than full replay; bounded replay time                                          | Snapshot management adds complexity; stale snapshots waste storage                |
| **Projection / read model** | Separate read models built asynchronously from the event stream (often used with CQRS) | Read path can be optimized independently; projections can be rebuilt from the log if corrupted | Projections lag behind the event log; eventual consistency between write and read |
| **Temporal versioning**     | Every event carries a timestamp and version, enabling time-travel queries              | Full historical visibility; supports point-in-time reconstruction for audit and debugging      | Complex query model; storage and indexing overhead for version metadata           |

**Sources:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Ch. 11); _Microservices Patterns_ by Chris Richardson (Ch. 10)

---

_This reference is part of the [High Availability](/blog/system_design/high-availability-microservices/) series._
