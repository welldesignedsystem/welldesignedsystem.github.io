+++
date = '2026-06-25T12:00:00+10:00'
draft = false
title = 'AWS Aurora Serverless'
tags = ['Aurora', 'Serverless', 'AWS', 'RDS', 'Database', 'Cloud Architecture']
summary = 'Deep dive into Aurora Serverless v1 and v2 architecture, auto-scaling, Data API, pricing, best practices, limitations and migration strategies.'
+++

Aurora Serverless is Amazon's auto-scaling deployment option for Aurora that abstracts away database instance management. Instead of provisioning `db.r5.*` instances, you define an ACU range and Aurora scales compute and memory automatically based on workload. This post covers architecture, operational trade-offs, pricing, and migration — with a focus on v2, which is the current recommended path.

---

## Architecture Fundamentals

### Aurora Storage Layer

All Aurora variants (provisioned and serverless) share the same distributed storage subsystem:

- **6 copies across 3 AZs** — storage is replicated across 3 Availability Zones with 2 copies per AZ
- **SSD-backed virtualised volume** — auto-expanding up to 128 TiB
- **Shared cluster volume** — a single storage volume is shared by the writer and all reader instances in the cluster
- **Crash recovery offloaded to storage** — redo logs are pushed to storage; the storage layer handles crash recovery without replaying the full redo log on startup

Serverless adds a **warm pool** of pre-warmed instances maintained by AWS. Scale-up requests draw from this pool, enabling sub-second allocation without cold provisioning.

### Aurora Capacity Units (ACUs)

- 1 ACU ≈ 2 GiB RAM + proportional CPU (Graviton2/3 vCPUs) + networking
- v2 instances run on AWS Graviton2 or Graviton3 processors, which deliver better price/performance than the x86 instances used in v1
- ACU range is set per cluster (v1) or per instance (v2)
- Billed per ACU-hour (v1) or per ACU-second (v2)

### Cluster Endpoints

- **Writer endpoint** — always points to the current writer instance
- **Reader endpoint** — load-balanced across available reader instances
- **Instance endpoints** — direct connection to a specific instance; use sparingly
- **Custom endpoints** — manually group a subset of instances for specific workloads (e.g. analytics readers vs OLTP readers)

---

## Aurora Serverless v1

Released 2018. Still available but on a deprecation path; new workloads should use v2.

### How v1 Works

- After a configurable idle period (default 5 minutes, minimum 5 minutes), the cluster **pauses** — compute is deallocated, storage persists on S3-backed Aurora storage
- On next connection, a **cold start** re-provisions compute and reconnects to storage — typically 20–40 seconds
- Scaling occurs in discrete ACU steps with a cooldown period between steps; it cannot respond to rapid demand changes
- The Data API is available on v1 and provides an HTTP interface that avoids the cold start for connection-based clients (the Data API itself warms the cluster)

### v1 Limitations

| Limitation              | Detail                                                               |
| ----------------------- | -------------------------------------------------------------------- |
| No read replicas        | Single writer only; no horizontal read scaling                       |
| Single AZ compute       | Compute runs in one AZ; storage is multi-AZ                          |
| Cold start latency      | 20–40s on resume — unsuitable for latency-sensitive applications     |
| Coarse scaling          | Discrete ACU steps with up to 5-minute cooldown between scale events |
| No Performance Insights | Not available on v1                                                  |
| No RDS Proxy            | v1 cannot use RDS Proxy                                              |
| No Backtrack            | Not supported                                                        |
| Engine versions         | Aurora MySQL 5.7 and Aurora PostgreSQL 10 only                       |
| Max ACU                 | 256 ACU (512 GiB RAM)                                                |
| No Global Database      | Not supported                                                        |

### When v1 May Still Be Appropriate

- Dev/test environments with very sporadic usage where the zero-cost pause is more important than cold start latency
- Applications locked to Aurora MySQL 5.7 that cannot migrate to 8.0 (though this is a short-term position; plan the migration)
- Batch workloads running infrequently (weekly jobs) where the cold start is acceptable

---

## Aurora Serverless v2

Released 2022; pause/resume capability added in 2023. The recommended deployment option for new serverless Aurora workloads.

### How v2 Differs From v1

| Feature                | v1                       | v2                                              |
| ---------------------- | ------------------------ | ----------------------------------------------- |
| Read replicas          | No                       | Yes — up to 15, each auto-scaling independently |
| Multi-AZ               | No                       | Yes                                             |
| Scaling granularity    | Discrete steps, cooldown | Continuous, sub-second                          |
| Pause (zero-cost idle) | Yes                      | Yes (added 2023)                                |
| Scaling time           | Minutes                  | 1–2 seconds typical                             |
| Connection management  | Direct                   | RDS Proxy supported and recommended             |
| Data API               | Yes                      | Yes                                             |
| Engine versions        | MySQL 5.7, PG 10         | MySQL 8.0, PG 15+                               |
| ACU minimum            | 1                        | 0 (when paused) or 0.5 (always-on)              |
| ACU maximum            | 256                      | 256 per instance                                |
| Billing                | ACU-hour                 | ACU-second                                      |
| Global Database        | No                       | Yes (supported since late 2023)                 |
| Graviton processors    | No                       | Yes (Graviton2/3)                               |
| Aurora I/O-Optimized   | No                       | Yes                                             |

### v2 Architecture in Detail

**Capacity range per instance:**

- Minimum: 0.5 ACU (1 GiB RAM) in always-on mode; 0 ACU when paused
- Maximum: 256 ACU (512 GiB RAM) per instance
- Up to 15 reader replicas, each scaling independently within the cluster's configured ACU range

**Scaling behaviour:**
Aurora v2 evaluates scaling every second using four signals:

1. **CPU utilisation** — primary scale-up trigger; scaling begins before CPU is fully saturated
2. **Memory pressure** — if the buffer pool is evicting pages, the instance scales up to expand available RAM
3. **Network throughput** — high network I/O triggers scale-up, particularly during bulk loads
4. **Connection count** — approaching `max_connections` triggers scale-up to expand the connection limit

Scale-down is more conservative: the instance waits for CPU and memory to stabilise before reducing ACU to avoid thrashing. There is no user-configurable cooldown; AWS manages this internally.

**Pause and resume (v2, added 2023):**

- Configurable idle timeout (minimum 5 minutes)
- On pause, compute is deallocated; you pay only for storage
- On resume, cold start is faster than v1: typically 5–15 seconds (v2 benefits from the warm pool and Graviton)
- Pause is opt-in; clusters not configured to pause run at minimum 0.5 ACU continuously
- Pause is only available when the cluster has no reader replicas and no RDS Proxy attached

**Warm pool:**
AWS maintains a pool of pre-warmed Graviton instances per ACU tier in each Region. Scale-up requests allocate from this pool, achieving the 1–2 second scaling latency. The warm pool is invisible to users and its size is managed by AWS based on regional demand patterns.

### Connection Limits by ACU

`max_connections` in v2 scales with ACU. The formula differs by engine:

**Aurora MySQL:**

```
max_connections = LEAST(GREATEST(({DBInstanceClassMemory}/12582880), 25), 16000)
```

Approximate values:

| ACU | RAM     | max_connections (MySQL) |
| --- | ------- | ----------------------- |
| 0.5 | 1 GiB   | ~80                     |
| 1   | 2 GiB   | ~160                    |
| 2   | 4 GiB   | ~320                    |
| 4   | 8 GiB   | ~640                    |
| 8   | 16 GiB  | ~1,270                  |
| 16  | 32 GiB  | ~2,560                  |
| 64  | 128 GiB | ~10,240                 |
| 128 | 256 GiB | ~16,000 (cap)           |

**Aurora PostgreSQL:**

```
max_connections = LEAST({DBInstanceClassMemory}/9531392, 5000)
```

Because connections are limited at low ACU, RDS Proxy is strongly recommended for applications with many concurrent connections. RDS Proxy maintains a fixed pool of database connections and multiplexes application connections into it, decoupling connection count from ACU.

### RDS Proxy Integration

RDS Proxy sits between your application and Aurora. It maintains a persistent connection pool to Aurora and multiplexes many application connections through a smaller set of database connections.

Benefits for v2:

- Avoids exhausting `max_connections` at low ACU levels
- Provides IAM-based authentication (avoids storing DB credentials in app code)
- Reduces failover impact during Multi-AZ switchover — the proxy absorbs the reconnection burst
- Enables connection reuse across Lambda invocations

Trade-offs:

- RDS Proxy adds 1–2ms latency per query
- Prevents v2 pause (a cluster with RDS Proxy attached cannot pause)
- Costs approximately $0.015 per vCPU per hour (based on the endpoint's connection capacity)

### Data API

Both v1 and v2 support the Aurora Data API, which provides an HTTPS interface for running SQL without a persistent database connection. This is particularly useful for Lambda functions that would otherwise exhaust connection limits.

```python
import boto3

client = boto3.client('rds-data', region_name='ap-southeast-2')

response = client.execute_statement(
    resourceArn='arn:aws:rds:ap-southeast-2:123456789012:cluster:my-cluster',
    secretArn='arn:aws:secretsmanager:ap-southeast-2:123456789012:secret:my-db-secret',
    database='mydb',
    sql='SELECT * FROM orders WHERE status = :status AND tenant_id = :tenant',
    parameters=[
        {'name': 'status',    'value': {'stringValue': 'PENDING'}},
        {'name': 'tenant',    'value': {'longValue': 42}}
    ]
)

for record in response['records']:
    print(record)
```

**Data API characteristics:**

- Stateless — no persistent connection; each call establishes and closes a connection internally
- Supports transactions: `begin_transaction`, `commit_transaction`, `rollback_transaction`
- 1 MB response size limit per call — unsuitable for large BLOB retrieval or bulk exports
- No support for `LOAD DATA LOCAL INFILE` or binary protocols
- No prepared statement caching across calls
- Latency is higher than a persistent connection (additional HTTPS + connection setup per call): typically 5–20ms overhead vs a pooled connection
- Best suited for low-frequency queries from Lambda or Step Functions; not recommended for high-frequency OLTP paths

### Aurora Global Database (v2)

Aurora Serverless v2 supports Aurora Global Database since late 2023. This allows:

- A primary cluster in one Region with up to 5 secondary read-only clusters in other Regions
- Replication lag typically under 1 second
- Secondaries can be promoted to primary in under 1 minute for disaster recovery
- Each cluster in the global database can be independently configured as serverless or provisioned

Each Region's serverless cluster scales its ACU range independently. A secondary cluster at 0.5 ACU can serve low-traffic reads while the primary handles full load.

### Aurora I/O-Optimized (v2)

Introduced in 2023, I/O-Optimized is a storage configuration option for Aurora (available on v2 and provisioned) that eliminates per-I/O charges in exchange for a higher storage rate.

**Standard pricing:**

- Storage: $0.10/GB-month
- I/O: $0.20 per 1 million requests

**I/O-Optimized pricing:**

- Storage: $0.225/GB-month
- I/O: $0.00 (no per-I/O charge)

I/O-Optimized becomes cost-effective when I/O costs exceed approximately 25% of total Aurora spend. For write-heavy workloads (e.g. high-frequency inserts, large batch writes) this threshold is crossed quickly.

Enable via the AWS Console or CLI when creating or modifying a cluster. Switching between standard and I/O-Optimized requires a brief cluster modification (no downtime in v2).

```bash
aws rds modify-db-cluster \
  --db-cluster-identifier my-serverless-cluster \
  --storage-type aurora-iopt1 \
  --apply-immediately \
  --region ap-southeast-2
```

---

## When to Use Aurora Serverless v2

### Good Fit

- **Variable or unpredictable workloads** — SaaS applications with sporadic traffic; dev/test databases used only during business hours; seasonal e-commerce
- **New serverless-first applications** — especially when paired with Lambda, API Gateway, Step Functions, and RDS Proxy
- **Multi-tenant databases** — per-tenant clusters scale independently; each tenant pays proportional to their usage
- **Bursty batch processing** — ETL jobs that need 64+ ACU for 30 minutes then drop to 0.5 ACU for the rest of the day
- **Capacity planning elimination** — teams that want to remove instance right-sizing overhead
- **Global applications** — v2 + Global Database handles multi-Region read scaling with automatic failover

### Poor Fit

- **Steady high-throughput OLTP** — at sustained utilisation above ~30%, provisioned Aurora with reserved instances (1-year or 3-year) is significantly cheaper. A `db.r6g.2xlarge` reserved instance at ~$0.42/hr (1-year reserved) running 24/7 is cheaper than the equivalent ACU-seconds in v2 once the ACU stays consistently at 8+
- **Sub-millisecond P99 latency requirements** — v2 adds a small amount of overhead (1–3ms per query in some benchmarks) versus provisioned at equivalent ACU; for high-frequency trading or real-time bidding this matters
- **Applications locked to MySQL 5.7** — v2 requires MySQL 8.0 or later; v1 is deprecated; plan the upgrade or use provisioned Aurora MySQL 5.7 (also limited life)
- **Applications requiring GTID-based external replication** — v2's GTID handling differs from provisioned in edge cases; validate carefully if you rely on cross-cluster GTID replication
- **Very large datasets with complex query plans** — above ~5–10 TiB with complex analytical queries, provisioned Aurora with purpose-sized instances (e.g. `db.r6g.16xlarge`) or Amazon Redshift gives better price/performance
- **DDL-heavy migrations** — DDL operations (ALTER TABLE, CREATE INDEX) hold locks and can block scaling events during execution

---

## Pricing Model

### v1

- Pay per ACU-hour consumed while active
- $0.00 per ACU-hour when paused (storage and I/O charges continue)
- Storage ($0.10/GB-month) and I/O ($0.20/million requests) charged separately
- No RDS Proxy available

### v2

- Pay per ACU-second in 1-second increments
- Minimum charge when always-on: 0.5 ACU × seconds running
- $0.00 ACU charge when paused (storage charges continue)
- Storage and I/O charged separately (standard or I/O-Optimized)
- RDS Proxy charged separately per vCPU-hour of the proxy endpoint

### Accurate Cost Comparison

Prices shown are for ap-southeast-2 (Sydney) as of mid-2026. Check the AWS pricing page for current figures.

| Scenario                              | Provisioned db.r6g.large (on-demand) | Provisioned db.r6g.large (1yr reserved) | Serverless v2 (0.5–8 ACU)   |
| ------------------------------------- | ------------------------------------ | --------------------------------------- | --------------------------- |
| Always-on, ~1 ACU load                | ~$0.34/hr                            | ~$0.21/hr                               | ~$0.12/hr                   |
| Always-on, ~4 ACU sustained           | ~$0.34/hr                            | ~$0.21/hr                               | ~$0.48/hr                   |
| 8 hr/day active, 16 hr idle (0.5 ACU) | ~$0.34/hr (wasted)                   | ~$0.21/hr (wasted)                      | ~$0.18/hr avg               |
| Burst to 8 ACU for 1hr/day            | Not possible without resize          | Not possible                            | Only pay for burst duration |

The `db.r6g.large` has 2 vCPUs and 16 GiB RAM — roughly equivalent to 8 ACU. At sustained 8 ACU, provisioned reserved is materially cheaper. At variable load averaging 2 ACU, v2 wins.

**Reserved instance pricing is the correct baseline for always-on comparisons.** On-demand provisioned pricing is only relevant for temporary instances. For cost modelling, always compare v2 ACU-second costs against 1-year reserved provisioned pricing.

### I/O Cost Modelling

For a write-heavy workload generating 500 million I/O requests per month:

- Standard Aurora: 500M × $0.20/1M = $100/month in I/O alone
- I/O-Optimized: $0 in I/O; storage surcharge kicks in but at modest database size (< 1 TiB) is likely $0–$115/month extra depending on data volume

Break-even is roughly when I/O charges exceed 25% of total Aurora spend. Run a month with standard pricing, check the `VolumeReadIOPs` and `VolumeWriteIOPs` CloudWatch metrics, calculate the I/O cost, and switch if I/O-Optimized would be cheaper.

---

## Scaling Configuration Best Practices

### Setting the ACU Range

- **Minimum ACU:** set to the ACU level that handles your average off-peak baseline, not the absolute minimum. Setting 0.5 ACU minimum when your overnight traffic requires 2 ACU means every morning involves a scaling event (adds latency to the first wave of traffic). A minimum of 2 ACU trades $0.24/hr idle cost for smoother ramp-up.
- **Maximum ACU:** set to the ACU level your peak workload needs, plus ~30% headroom. If the cluster hits max ACU and cannot scale further, queries queue and latency spikes — the CloudWatch `ACUUtilization` metric approaching 100% is the signal.
- Do not set maximum ACU to an unnecessarily high value — a misconfigured query storm can drive ACU to max and generate large unexpected bills. Set an AWS Budget alert at 80% of your expected monthly ACU spend.

### Scaling During DDL

ALTER TABLE and other DDL statements can hold metadata locks that prevent the scaling engine from committing a scale event. Long-running DDL on large tables can block scaling for the duration. Mitigate by:

- Running DDL during low-traffic windows
- Using online DDL tools (e.g. `gh-ost` for MySQL, `pg_repack` for PostgreSQL) that minimise lock time
- Setting `lock_wait_timeout` (MySQL) or `lock_timeout` (PostgreSQL) to fail-fast on blocked DDL rather than holding locks indefinitely

---

## Zero-ETL Integration with Amazon Redshift

Aurora Serverless v2 (MySQL and PostgreSQL) supports zero-ETL integration with Amazon Redshift. This replicates data from Aurora to Redshift in near-real-time without building and maintaining a custom ETL pipeline.

```bash
# Create a zero-ETL integration from Aurora to Redshift
aws rds create-integration \
  --source-arn arn:aws:rds:ap-southeast-2:123456789012:cluster:my-aurora-cluster \
  --target-arn arn:aws:redshift:ap-southeast-2:123456789012:namespace:my-redshift-namespace \
  --integration-name aurora-to-redshift \
  --region ap-southeast-2
```

Considerations for serverless clusters:

- The source Aurora cluster must be running (not paused) for replication to proceed; lag accumulates during pause and catches up on resume
- Binlog retention must be enabled on the Aurora cluster (`binlog_format=ROW`, `binlog_row_image=FULL`)
- Zero-ETL adds a small but non-zero write overhead to the source cluster (binlog generation); account for this in your ACU sizing

---

## Migration Strategies

### From Provisioned Aurora to Serverless v2

**Option 1: Snapshot restore**

- Take a manual snapshot of the provisioned cluster
- Restore the snapshot to a new Aurora Serverless v2 cluster
- Test the new cluster, then cut over DNS/endpoint
- Downtime: duration of snapshot restore (minutes to hours depending on data volume)

**Option 2: Aurora cloning (zero-copy)**

- Clone the provisioned cluster — Aurora cloning uses copy-on-write at the storage layer, completing in seconds regardless of data volume
- The clone can be configured as serverless v2
- Test the clone, then switch the application endpoint
- Downtime: near-zero for clone creation; endpoint switch is a brief DNS change

**Option 3: Blue/Green Deployment (recommended for minimal downtime)**

- RDS Blue/Green creates a staging copy of the cluster and maintains replication between them
- Modify the green (staging) cluster to serverless v2 configuration
- Validate, then trigger a switchover — Blue/Green manages the cutover with typically < 1 minute downtime
- Requires engine version compatibility between blue and green

**Option 4: AWS DMS with CDC**

- Use AWS DMS to perform an initial full load followed by continuous change data capture (CDC) replication
- Allows extended parallel running of old and new clusters
- Best for situations where zero downtime is required and the above options are impractical

### From v1 to v2

There is no direct in-place upgrade path from v1 to v2. You must:

1. Take a snapshot of the v1 cluster
2. Restore to a new v2 cluster — this requires an engine version upgrade (MySQL 5.7 → 8.0 or PostgreSQL 10 → 15+)
3. Test application compatibility with the new engine version
4. Update application connection strings (v2 uses different TLS requirements in some client versions)
5. Attach RDS Proxy if the application has high connection counts
6. Cut over

Engine version compatibility testing is the most time-consuming step. Aurora MySQL 8.0 has behavioural differences from 5.7 (default charset utf8mb4, strict SQL mode enabled by default, JSON functions changed) that require application validation.

---

## Monitoring and Alerting

### Key CloudWatch Metrics

| Metric                       | Namespace | What to Watch                                                    |
| ---------------------------- | --------- | ---------------------------------------------------------------- |
| `ServerlessDatabaseCapacity` | `AWS/RDS` | Current ACU consumption in real time                             |
| `ACUUtilization`             | `AWS/RDS` | Percent of max ACU used — alert at >85% for 5 min                |
| `DatabaseConnections`        | `AWS/RDS` | Active connections — alert at >80% of `max_connections`          |
| `ReadLatency`                | `AWS/RDS` | Storage read latency — alert at >10ms                            |
| `WriteLatency`               | `AWS/RDS` | Storage write latency — alert at >10ms                           |
| `DMLThroughput`              | `AWS/RDS` | Rows written per second — baseline and alert on 3× deviation     |
| `VolumeReadIOPs`             | `AWS/RDS` | Used to evaluate I/O-Optimized switch-over                       |
| `VolumeWriteIOPs`            | `AWS/RDS` | Same                                                             |
| `FreeableMemory`             | `AWS/RDS` | Low value indicates memory pressure, scaling should occur        |
| `CommitLatency`              | `AWS/RDS` | Transaction commit time — useful for identifying lock contention |

### Recommended Alarms

```bash
# Alert when approaching max ACU
aws cloudwatch put-metric-alarm \
  --alarm-name "Aurora-ACU-High" \
  --namespace "AWS/RDS" \
  --metric-name "ACUUtilization" \
  --dimensions Name=DBClusterIdentifier,Value=my-serverless-cluster \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 3 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:db-alerts" \
  --region ap-southeast-2

# Alert on high write latency (I/O bottleneck)
aws cloudwatch put-metric-alarm \
  --alarm-name "Aurora-WriteLatency-High" \
  --namespace "AWS/RDS" \
  --metric-name "WriteLatency" \
  --dimensions Name=DBClusterIdentifier,Value=my-serverless-cluster \
  --statistic Average \
  --period 60 \
  --threshold 0.01 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 5 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:db-alerts" \
  --region ap-southeast-2
```

### Performance Insights

Performance Insights is available on Aurora Serverless v2 (not v1). Enable it on the cluster to get:

- Top SQL statements by load (DB time)
- Wait event breakdown (CPU, lock, I/O, buffer)
- Active session history for the past 7 days (free) or up to 2 years (paid)

Performance Insights is the primary tool for identifying queries that are driving ACU scale-up events. A query spending 90% of its time on `lock/table/sql_lock` wait events is a locking problem, not a compute problem — scaling ACU will not fix it.

---

## Operational Best Practices

### Connection Management

- Use RDS Proxy for any application with > 50 concurrent connections or Lambda-based consumers
- Set application connection pool maximum to 80% of `max_connections` at the minimum ACU level — this ensures the pool fits even if the cluster scales down
- Use IAM database authentication through RDS Proxy to avoid credential rotation restarts

### Backup and Recovery

- Automated backups: 1–35 day retention window; enabled by default
- Manual snapshots: no retention limit; cross-Region copyable; use for pre-migration or pre-upgrade checkpoints
- Point-in-Time Restore (PITR): restore to any second within the retention window; creates a new cluster
- Backtrack (Aurora MySQL only, v2): rewind the cluster to a specific point in time without restoring a snapshot — much faster than PITR; useful for "oops" recovery from accidental deletes; must be enabled at cluster creation with a backtrack window (up to 72 hours); storage overhead applies

### Security

- Encryption at rest: AES-256 via AWS KMS; enabled by default; cannot be disabled post-creation
- In-transit encryption: TLS 1.2/1.3 enforced; clients must present a valid CA certificate (download from AWS)
- VPC isolation: Aurora Serverless v2 requires VPC deployment; no public accessibility option
- Security groups: restrict inbound on port 3306 (MySQL) or 5432 (PostgreSQL) to application security groups only
- Audit logging: Aurora MySQL Advanced Audit and Aurora PostgreSQL pgAudit are available on v2; publish to CloudWatch Logs
- IAM database authentication: available on v2; use for Lambda and ECS workloads to avoid credential management

---

## Key Limitations

- **Maximum storage: 128 TiB** — shared with provisioned Aurora; cannot be increased
- **Maximum ACU per instance: 256 ACU** — if a single writer instance at 256 ACU is insufficient, the architecture needs rethinking (sharding, caching, read offload)
- **Max reader replicas: 15** — same as provisioned Aurora
- **Pause requires no RDS Proxy** — cannot pause a cluster that has an RDS Proxy endpoint attached
- **Pause requires no reader replicas** — clusters with readers cannot pause
- **Data API 1 MB response limit** — unsuitable for large BLOB retrieval or bulk export
- **Connection limits scale with ACU** — at low ACU, `max_connections` is low; use RDS Proxy to decouple
- **DDL can block scaling** — long-running ALTER TABLE statements hold locks that can delay scale-up commit
- **Zero-ETL requires binlog** — enabling binlog on the source cluster adds a write overhead; size your ACU range accordingly
- **Backtrack only available for Aurora MySQL** — not supported on Aurora PostgreSQL

---

## Summary Decision Matrix

| Requirement                                              | Recommended Choice                               |
| -------------------------------------------------------- | ------------------------------------------------ |
| Sporadic dev/test workload, zero idle cost               | v2 with pause enabled                            |
| Variable production traffic                              | v2 + RDS Proxy                                   |
| Steady high-throughput OLTP (>30% sustained utilisation) | Provisioned Aurora + reserved instances          |
| Read scaling needed                                      | v2 with reader replicas                          |
| Multi-AZ required                                        | v2 or provisioned                                |
| Global multi-Region                                      | v2 + Aurora Global Database                      |
| Lambda-native, no persistent connections                 | v2 + Data API                                    |
| Write-heavy with high I/O                                | v2 + I/O-Optimized storage                       |
| MySQL 5.7 locked                                         | Provisioned Aurora MySQL 5.7 (plan migration)    |
| Near-real-time analytics on Aurora data                  | v2 + Zero-ETL to Redshift                        |
| Must minimise per-query latency                          | Provisioned Aurora (1–3ms less overhead than v2) |
