+++
date = '2026-06-25T12:00:00+10:00'
draft = false
title = 'AWS Aurora Serverless'
tags = ['Aurora', 'Serverless', 'AWS', 'RDS', 'Database', 'Cloud Architecture']
summary = 'Deep dive into Aurora Serverless v1 and v2 architecture, auto-scaling, Data API, pricing, best practices, limitations and migration strategies.'
+++

Aurora Serverless is Amazon's auto-scaling deployment option for Aurora that abstracts away database instance management. Instead of provisioning dB.r5.* instances, you define an ACU range and Aurora scales compute and memory automatically based on workload. This post covers everything from architecture to operational trade-offs.

---

## Architecture Fundamentals

### Aurora Storage Layer

All Aurora variants (provisioned and serverless) share the same distributed storage subsystem:

- **6 copies across 3 AZs** — storage is replicated across 3 Availability Zones with 2 copies per AZ
- **SSD-backed virtualised volume** — auto-expanding up to 128 TiB
- **Shared cluster volume** — a single storage volume serves both writer and reader instances
- **Crash recovery offloaded to storage** — redo logs are pushed to storage; the storage layer handles recovery without needing a crash-recovery replay on startup

Serverless adds a **warm pool** of instances ready to scale into the compute fleet.

### Aurora Capacity Units (ACUs)

- 1 ACU = ~2 GiB RAM + corresponding CPU + networking
- v1: min/max ACU range configurable (e.g. 2–8, 8–256)
- v2: same ACU model but scaling is faster and more granular
- Billed per ACU-second (v2) or per ACU-hour (v1)

### Cluster Endpoints

- **Writer endpoint** — always points to the single writer
- **Reader endpoint** — load-balanced across available readers (auto-scaled in v2)
- **Custom endpoints** — manually group instances for specific workloads

---

## Aurora Serverless v1

Released 2018. Functional but carries significant limitations.

### How v1 Works

- Idle timeout: after a configurable period of no activity (default 5 minutes), the cluster **pauses** — compute is torn down, storage persists
- On next connection, a **cold start** (10–30 seconds) re-provisions compute and reconnects to storage
- Scaling: cooldown period after each scale point; cannot scale again until cooldown elapses
- ACU range is set per-cluster; scaling is measured in ACU steps (not continuous)

### v1 Limitations

| Limitation | Detail |
|---|---|
| No read replicas | Only a single writer; cannot add readers |
| No Multi-AZ | Single AZ only (though storage is multi-AZ) |
| Pause/resume cold starts | 10–30s latency on resume — unsuitable for latency-sensitive apps |
| Scaling cooldown | Up to 5 minutes between scale events |
| Feature gaps | No Performance Insights, no RDS Proxy, no backtrack |
| Instance cap | Max 256 ACUs (512 GiB RAM) |
| Maximum connections | Based on ACU; at 256 ACUs, ~6000 connections (lower than provisioned) |
| Limited engine support | Only MySQL 5.7 and PostgreSQL 10 compatible Aurora |
| No Data API | v1 does not support the Aurora Data API |

### When v1 Might Still Be Used

- Dev/test environments with sporadic usage
- Low-traffic applications tolerant of 30s cold starts
- Batch jobs that run infrequently and need zero idle cost

---

## Aurora Serverless v2

Released 2022. Designed to close the gaps in v1 and eventually replace it.

### How v2 Differs From v1

| Feature | v1 | v2 |
|---|---|---|
| Read replicas | No | Yes (auto-scaled) |
| Multi-AZ | No | Yes |
| Scaling granularity | Coarse (steps, cooldown) | Continuous, sub-second |
| Pause | Yes | No — always-on |
| Scaling time | Minutes | Seconds (1–2s typical) |
| Connection management | Direct | RDS Proxy recommended |
| Data API | No | Yes |
| Engine versions | MySQL 5.7, PG 10 | MySQL 8.0, PG 15+ |
| ACU range | 2–256 | 0.5–256 (per instance) |
| Billing | ACU-hour | ACU-second |

### v2 Architecture in Detail

**Capacity range per instance:**
- Minimum: 0.5 ACU (1 GiB RAM) — extremely low baseline for near-idle workloads
- Maximum: 256 ACU (512 GiB RAM) per instance
- Can add up to 15 reader replicas, each auto-scaling independently within the same range

**Scaling behaviour:**
- Aurora monitors instance metrics (CPU, connections, memory pressure)
- Scaling decisions are made every ~1 second
- No cooldown window — scales up as fast as demand increases
- Scales down gracefully when utilisation drops
- Writer and readers scale independently

**Warm pool:**
- AWS maintains a pool of pre-warmed instances per ACU tier
- Scale-up requests draw from this pool, achieving sub-second allocation
- The warm pool is invisible to the user but critical to v2's responsiveness

### RDS Proxy Integration

Strongly recommended with v2 for two reasons:

- **Connection pooling** — serverless scaling is tied to connections; RDS Proxy multiplexes thousands of app connections into a smaller pool of database connections
- **IAM authentication** — avoids storing DB credentials in application code
- **Failover speed** — RDS Proxy cuts failover time by keeping connections warm during Multi-AZ switch

### Data API (v2 Only)

HTTPS-based query interface that does not require a persistent database connection:

```sql
-- Example: ExecuteStatement via Data API
POST /v2/ExecuteStatement
{
  "resourceArn": "arn:aws:rds:us-east-1:123456:cluster:my-cluster",
  "secretArn": "arn:aws:secretsmanager:us-east-1:123456:secret:my-secret",
  "sql": "SELECT * FROM orders WHERE status = :status",
  "parameters": [{"name": "status", "value": {"stringValue": "PENDING"}}]
}
```

**Characteristics:**
- Stateless — no persistent connection needed
- Good for Lambda, Step Functions, serverless apps
- Supports transactions (begin/commit/rollback)
- 1 MB response limit per call
- No support for LOAD DATA LOCAL INFILE or prepared statement caching

---

## When to Use Aurora Serverless v2

### Good Fit

- **Variable or unpredictable workloads** — SaaS applications with sporadic traffic, dev/test databases used only during business hours
- **New serverless-first applications** — especially when paired with Lambda, API Gateway, RDS Proxy
- **Multi-tenant databases** — each tenant's DB can scale independently
- **Bursty batch processing** — ETL jobs that need 256 ACU for 10 minutes then drop to 1 ACU
- **Capacity planning avoidance** — teams that want to eliminate instance-type decisions and right-sizing overhead

### Poor Fit

- **Steady high-throughput workloads** — provisioned Aurora with reserved instances is 40–60% cheaper at sustained utilisation > 30%
- **Sub-100ms query latency requirements** — v2 adds 1–5ms overhead per query versus provisioned due to the scaling layer; for OLTP benchmarks this is negligible, for high-frequency trading it matters
- **Legacy MySQL 5.7 applications that cannot upgrade** — v2 does not support MySQL 5.7; only v1 does (and v1 is on a deprecation path)
- **Applications needing GTID-based replication** — v2 has limited GTID support compared to provisioned
- **Very large datasets (> 10 TiB)** — at that scale, provisioned Aurora with custom instance types offers better price/performance

---

## Pricing Model

### v1
- Pay per ACU-hour consumed
- 0 ACU when paused (pay only for storage and I/O)
- Storage and I/O charges are additional (same as provisioned)
- No data transfer costs within the same AZ

### v2
- Pay per ACU-second — billed in 1-second increments
- Minimum charge: 1 ACU always-on (no pause)
- Storage, I/O and data transfer billed separately
- Reader replicas billed at same ACU-second rate

### Cost Comparison Example

| Scenario | Provisioned (db.r6g.large) | Serverless v2 (2–8 ACU) |
|---|---|---|
| 24/7 at 2 ACU | ~$0.34/hr (reserved) | ~$0.24/hr |
| 24/7 at 8 ACU | ~$0.34/hr | ~$0.96/hr (scales up when needed) |
| 8 hr/day, idle rest | ~$0.34/hr (wasting) | ~$0.24/hr idle / scales up on demand |

Serverless v2 is most cost-effective when average utilisation is low and peaks are short.

---

## Migration Strategies

### From Provisioned Aurora

1. **Snapshot restore** — take a snapshot from provisioned cluster, restore as serverless v2 cluster (fastest for large DBs)
2. **Aurora cloning** — create a clone from a provisioned cluster and convert to serverless (zero-copy, fast)
3. **Blue/green deployment** — use RDS Blue/Green to switch from provisioned to serverless with minimal downtime; requires engine version compatibility
4. **DMS CDC** — use AWS DMS with continuous replication to migrate live data to a new serverless cluster

### From v1 to v2

- No direct in-place upgrade from v1 to v2
- Snapshot restore or DMS migration is required
- Engine version upgrade (MySQL 5.7 → 8.0 or PG 10 → 15+) is usually necessary
- Application must be updated to use RDS Proxy or the Data API

---

## Operational Best Practices

### Connection Management

- Always use RDS Proxy with v2 to reduce connection overhead
- Set application-side connection pool limits (recommend: max 80% of `max_connections`)
- Use IAM database authentication to rotate credentials without restart

### Scaling Configuration

- Set min ACU to handle baseline traffic + 30% headroom
- Set max ACU to handle peak traffic + 50% headroom
- Monitor `ServerlessDatabaseCapacity` CloudWatch metric
- Enable Performance Insights to identify queries that spike CPU

### Monitoring and Alerting

| Metric | Why | Alert Threshold |
|---|---|---|
| `ServerlessDatabaseCapacity` | Current ACU consumption | > 80% of max ACU for 5 min |
| `ACUUtilization` | Percent of max ACU used | > 90% for 5 min |
| `DatabaseConnections` | Active connections | > 80% of max_connections |
| `ReadLatency` / `WriteLatency` | Storage performance | > 10 ms for 5 min |
| `DMLThroughput` | Write volume | Configure based on baseline |

### Backup and Recovery

- Automated backups enabled by default (1–35 day retention)
- Manual snapshots are cross-Region copyable
- Point-in-Time Restore (PITR) supported to any second within retention window
- Backtrack (v2 only) — rewind to a specific point without restoring a snapshot

### Security

- Encryption at rest enabled by default (AES-256 via KMS)
- TLS 1.3 for connections
- VPC security groups control network access
- Audit logging via Advanced Audit (MySQL) or pgAudit (PostgreSQL)

---

## Key Limitations

- **No pause in v2** — v2 clusters run continuously; you pay ACU-seconds even at 0.5 ACU minimum
- **Maximum storage: 128 TiB** — same as provisioned Aurora, but cannot exceed this
- **Maximum ACU per cluster: 256 ACU (writer) + 15 × 256 (readers)** — 4096 ACU total
- **No support for Aurora Global Database** in v2 (as of mid-2026)
- **No Lambda invocation from DB** — Aurora MySQL only supports Lambda invocation in provisioned
- **Maximum database connections scale with ACU** — not configurable independently
- **Data API 1 MB limit** — unsuitable for large BLOBs or bulk exports

---

## Summary Decision Matrix

| Requirement | Choice |
|---|---|
| Sporadic dev/test workload | v1 (if OK with cold starts) or v2 |
| Variable production traffic | v2 + RDS Proxy |
| Steady high-throughput | Provisioned Aurora (reserved instances) |
| Need read scaling | v2 (multi-reader) or provisioned |
| Multi-AZ required | v2 or provisioned |
| Must minimise latency | Provisioned Aurora |
| MySQL 5.7 only | v1 (deprecating) or provisioned |
| Lambda-native, no persistent conns | v2 + Data API |
