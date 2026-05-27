+++
date = '2025-05-27T10:00:00+10:00'
draft = false
title = 'High Availability in Microservices'
tags = ['High Availability', 'Microservices', 'AWS', 'System Design', 'Resilience']
summary = 'Designing highly available microservices on AWS using multi-AZ deployment, stateless services, circuit breakers, and chaos engineering.'
+++

High availability (HA) is the ability of a system to remain operational and accessible despite failures in its components. In a microservices architecture on AWS, HA must be designed at every layer: compute, data, networking, and the application itself. This post covers the key patterns and AWS services that enable highly available microservices.

---

## Foundations of High Availability

### Reliability vs Resiliency

Reliability is the ability of a workload to perform its intended function correctly and consistently when expected to — including the ability to operate and test the workload through its total lifecycle. Reliability depends on several factors, the primary of which is **Resiliency**: the ability to recover from infrastructure or service disruptions, dynamically acquire computing resources to meet demand, and mitigate disruptions such as misconfigurations or transient network issues.

The other reliability factors are Operational Excellence (automation of changes, playbooks, Operational Readiness Reviews), Security (preventing harm to data or infrastructure), Performance Efficiency (maximising request rates, minimising latency), and Cost Optimization (trade-offs such as static stability vs auto-scaling).

### Design Principles

The Well-Architected Reliability Pillar identifies five design principles for cloud reliability:

**1. Automatically recover from failure.** Monitor KPIs that measure business value (not just technical metrics). Run automation when a threshold is breached. With more sophisticated automation it is possible to anticipate and remediate failures before they occur.

**2. Test recovery procedures.** In the cloud you can test how your workload fails and validate your recovery procedures. Use automation to simulate different failures or recreate failure scenarios. This exposes failure pathways that can be fixed before a real event occurs.

**3. Scale horizontally to increase aggregate workload availability.** Replace one large resource with multiple small resources to reduce the impact of a single failure. Distribute requests across multiple smaller resources to ensure they don't share a common point of failure.

**4. Stop guessing capacity.** Resource saturation is a common cause of failure. In the cloud you can monitor demand and workload utilisation and automate the addition or removal of resources to maintain the optimal level without over- or under-provisioning.

**5. Manage change through automation.** Changes to infrastructure should be made using automation. The changes that need to be managed include changes to the automation itself, which can then be tracked and reviewed.

### Availability Targets

Availability is measured as a percentage of uptime over a period. Common targets:

| Availability | Max unavailability per year | Application categories |
|---|---|---|
| 99% (two nines) | 3 days 15 hours | Batch processing, ETL jobs |
| 99.9% (three nines) | 8 hours 45 minutes | Internal tools, project tracking |
| 99.95% | 4 hours 22 minutes | Online commerce, point of sale |
| 99.99% (four nines) | 52 minutes | Video delivery, broadcast |
| 99.999% (five nines) | 5 minutes | ATM transactions, telecommunications |

Each additional nine imposes significantly more architectural complexity and cost. For most microservices, 99.9% is a pragmatic starting point.

### AWS Service SLAs

Every AWS service publishes its own SLA. These are not uniform — architectural choices (multi-AZ vs single-AZ, standard vs global replication tier) change the commitment. The table below covers the services most relevant to microservices architectures. AWS measures Monthly Uptime Percentage per region, calculates it over 5-minute intervals, and excludes scheduled maintenance and force majeure. Service credits (the sole remedy) scale with severity and must be claimed within two billing cycles.

| Category | Service | SLA commitment | Conditions |
|---|---|---|---|
| **Compute** | EC2 | 99.99% | Multi-AZ: instances in 2+ AZs in same region |
| | EC2 | 99.5% | Single instance |
| | ECS / Fargate | 99.99% | Multi-AZ: tasks or pods in 2+ AZs |
| | ECS / Fargate | 99.5% | Single task or pod |
| | Lambda | 99.95% | Per region |
| **Networking** | Route 53 (DNS queries) | 100% | Data plane only; control plane excluded |
| | ELB (ALB / NLB) | 99.99% | Multi-AZ |
| | API Gateway | 99.95% | Per region |
| | CloudFront | 99.9% | Global edge network |
| | Global Accelerator | 99.99% | Global |
| **Storage** | S3 Standard | 99.9% | Designed for 99.99% availability |
| | S3 Standard-IA | 99.0% | |
| | S3 One Zone-IA | 99.0% | Single AZ |
| | EBS | 99.99% | Covered under Compute SLA (multi-AZ) |
| **Database** | RDS Multi-AZ | 99.95% | Multi-AZ DB Instance or DB Cluster |
| | RDS Single-DB | 99.5% | Instance-level |
| | Aurora Multi-AZ | 99.99% | Cluster with instances in 2+ AZs |
| | Aurora Single-AZ | 99.5% | |
| | DynamoDB (standard) | 99.99% | Standard tables |
| | DynamoDB (Global Tables) | 99.999% | Active-active multi-region |
| | ElastiCache (Serverless) | 99.99% | Valkey, Memcached, or Redis OSS |
| | ElastiCache (Multi-AZ) | 99.99% | Valkey / Redis OSS with auto-failover |
| | ElastiCache (Single-AZ) | 99.5% | |
| **Messaging** | SQS | 99.9% | Standard queues |
| | SNS | 99.9% | Standard topics |
| | EventBridge | 99.99% | Default event bus |
| | Step Functions | 99.9% | Standard workflows |
| | Kinesis Data Streams | 99.9% | |
| **Observability** | CloudWatch (metrics, logs, alarms) | 99.9% | Per region |

These are the contractual commitments AWS makes. Your architecture's effective availability — calculated using the formulas in the next section — will be lower once you account for dependency chains and your own application layers.

### Availability Formulas

The formal definition of availability is:

```
Availability (%) = (Available Time / Total Time) × 100
```

**Measuring availability based on requests.** For services it is often easier to count successful and failed requests instead of time:

```
Availability (%) = (Successful Requests / Total Requests) × 100
```

This is typically measured over one-minute or five-minute periods and averaged into a monthly uptime percentage. If no requests are received in a given period it counts as 100% available.

**Calculating availability with hard dependencies.** Where an interruption in a dependent system directly translates to an interruption of the invoking system, the invoking system's availability is the **product** of the dependent systems' availabilities:

```
Avail_workload = Avail_invoking × Avail_dep1 × Avail_dep2

Example:
99.99% × 99.99% × 99.99% = 99.97%
```

This means three 99.99% services chained together can only achieve 99.97% combined availability. Refer to the AWS SLA table above for each service's commitment — note that chaining a 99.95% API Gateway with a 99.99% DynamoDB and a 99.9% Lambda gives only 99.84% combined. Understanding your dependency graph is essential before committing to an SLA.

**Calculating availability with redundant components.** When a system uses independent, redundant components (for example redundant resources in different Availability Zones), the effective availability is:

```
Avail_effective = Avail_MAX − ((100% − Avail_component) × (100% − Avail_component))

Example (two independent components each at 99.9%):
99.9999% = 100% − (0.1% × 0.1%)
```

Shortcut: if all component availabilities consist solely of the digit nine, sum the count of nines digits to get your answer. Two redundant independent components with three nines each gives six nines.

**Estimating availability from MTBF and MTTR.** When a dependency does not publish an availability design goal, estimate it using Mean Time Between Failure (MTBF) and Mean Time to Recover (MTTR):

```
Availability (%) = MTBF / (MTBF + MTTR) × 100

Example: MTBF = 150 days, MTTR = 1 hour → 99.97%
```

### Costs for Availability

Designing for higher availability typically increases cost. High levels of availability impose stricter requirements for testing and validation under exhaustive failure scenarios, automation for recovery from all manner of failures, and require that all aspects of system operations be built and tested to the same standards. At very high availability goals, innovation suffers because of the need to move more slowly. The guidance is to be thorough in applying standards and to consider the appropriate availability target for the entire lifecycle of the system.

At higher availability design goals, the set of software or services that can be chosen as dependencies diminishes based on which services have received the necessary engineering investment. As the goal increases it is typical to find fewer multi-purpose services (such as a relational database) and more purpose-built services.

### Costs for Availability

### Understanding Availability Needs

It is common to initially think of an application's availability as a single target for the whole application. However, upon closer inspection, different aspects of an application often have different availability requirements:

- Some systems prioritise the ability to receive and store new data ahead of retrieving existing data.
- Some prioritise real-time operations over configuration operations.
- Services may have very high availability requirements during certain hours of the day but can tolerate much longer disruption outside those hours.

Decompose a single application into constituent parts and evaluate the availability requirements for each. This focuses effort (and expense) on availability according to specific needs, rather than engineering the whole system to the strictest requirement.

**Data plane vs control plane.** Within AWS, the data plane delivers real-time service (EC2 instances serving traffic, RDS database read/write, DynamoDB table operations) while the control plane configures the environment (launching new EC2 instances, creating RDS databases, adding DynamoDB table metadata). Data planes typically have higher availability design goals than control planes. Workloads with high availability requirements should avoid run-time dependency on control plane operations.

### Shared Responsibility Model

AWS secures the cloud; you secure what you run in it. For HA this means:

AWS owns: AZ independence, physical infrastructure, hypervisor isolation, inter-AZ high-bandwidth low-latency networking (all AZ traffic is encrypted), and making services available to their published SLAs.

You own: multi-AZ deployment, auto-scaling, data replication, retry logic, circuit breakers, deployment strategies, backup and recovery, service quota management, and network topology planning.

---

## Foundations: Service Quotas and Network

### Managing Service Quotas and Constraints

For cloud-based workload architectures there are service quotas (also called service limits) that exist to prevent accidentally provisioning more resources than needed and to limit API request rates to protect services from abuse. There are also resource constraints such as network throughput or physical disk capacity.

**Common anti-patterns to avoid:**
- Deploying a workload without understanding hard or soft quotas and their limits.
- Assuming cloud services have no limits and can be used without consideration of rates, counts, or quantities.
- Assuming quotas will automatically be increased.
- Not knowing the process and timeline of quota increase requests.
- Assuming default quotas are identical across all regions.
- Not testing at peak traffic to stress utilisation.
- Not assessing capacity requirements in advance of a new customer event.

**Key practices:**

Use the **AWS Service Quotas console** to look up quota values, request increases, and track quota increase requests for over 250 AWS services. **AWS Trusted Advisor** provides alerts at 80% and 90% threshold breaches.

Manage quotas across accounts and regions. Service quota limits are per-account and per-region. The same named quota can have a different value in different regions; reconcile these differences continuously. Passive DR regions must have equivalent quotas to the active region — game days rarely test at peak capacity and often miss quota discrepancies between regions. This is referred to as **service quota drift** and must be actively tracked and remediated.

Ensure a sufficient gap between current quotas and maximum usage to accommodate failover. If a primary AZ or region fails, surviving resources must absorb the full load. Pre-request quota increases so that headroom exists before it is needed.

Accommodate fixed quotas through architecture. Some limits are not adjustable (for example API Gateway integration timeout is 29 seconds maximum, serverless function invocation payload sizes). Design the architecture to work within these constraints rather than expecting them to be lifted.

Monitor and automate quota management using **Amazon EventBridge** to trigger **AWS Lambda** functions that check utilisation and automatically request increases.

### Planning Network Topology

**Highly available public endpoints.** Place an **Application Load Balancer (ALB)** or **Network Load Balancer (NLB)** in front of your compute to provide a highly available public endpoint. Load balancers distribute traffic across multiple AZs and automatically route around unhealthy targets. Use **Amazon Route 53** with health checks for DNS-level failover and geolocation routing. Use **AWS Global Accelerator** for workloads that need low-latency routing from users across the globe to the nearest healthy endpoint.

**Redundant on-premises connectivity.** For hybrid workloads, provision redundant connectivity using two or more **AWS Direct Connect** connections to separate Direct Connect locations. Back up Direct Connect with **AWS Site-to-Site VPN** so that on-premises connectivity survives a circuit failure.

**IP subnet allocation.** Ensure IP subnet allocation accounts for expansion and availability. Plan subnets in each AZ to be large enough to accommodate auto-scaling events, including failover scenarios where one AZ's capacity is absorbed by the remaining AZs.

**Hub-and-spoke topologies.** Prefer hub-and-spoke topologies over many-to-many mesh. Use **AWS Transit Gateway** as the hub for connecting VPCs and on-premises networks. This simplifies routing tables and avoids the combinatorial explosion of VPC peering connections in large environments.

**Non-overlapping IP ranges.** Enforce non-overlapping private IP address ranges across all private address spaces that are connected. Overlapping CIDRs prevent peering and cause routing failures that are difficult to diagnose under stress.

---

## Workload Architecture

### Choosing How to Segment Your Workload

Build highly scalable and reliable workloads using a service-oriented architecture (SOA) or a microservices architecture. SOA makes software components reusable via service interfaces. Microservices go further, making components smaller and simpler.

Microservices allow you to differentiate the availability required by different services, focusing investment more specifically on the microservices that have the greatest availability needs. For example, on Amazon product detail pages, hundreds of microservices build discrete portions of the page. While a few services must be available to show price and product details, the vast majority of page content can simply be excluded if a service is unavailable — even photos and reviews are not required for a customer to complete a purchase.

**Key trade-offs.** Smaller services can introduce additional latency, more complex debugging, and increased operational burden. One primary trade-off is that distributed compute can make it harder to achieve latency requirements and adds complexity in debugging and tracing. Use AWS X-Ray to address the tracing complexity.

**The microservice Death Star anti-pattern.** A situation in which atomic components become so highly interdependent that the failure of one results in a much larger failure, making the components as rigid and fragile as a monolith. Avoid this by enforcing loose coupling between services.

**Strangler Fig pattern.** When refactoring a monolith, gradually replace specific application components with new applications and services. AWS Migration Hub Refactor Spaces acts as the starting point for incremental application refactoring.

### Service Contracts per API

Each service should provide a versioned contract per API. A service contract is a documented agreement between a service and its consumers specifying the request format, response format, error codes, and SLA. Versioning allows the service to evolve without breaking existing consumers.

Key elements of a service contract:
- API version in the URL path or header (e.g., `/v1/orders`)
- Documented request/response schemas (OpenAPI/Swagger recommended)
- Explicit error codes and their meanings
- Rate limit headers so clients can implement respectful back-off
- Published deprecation timelines for old API versions

### Build Services Focused on Specific Business Domains

Align service boundaries to bounded contexts in your business domain rather than to technical layers. Avoid sharing databases between services — each service should own its data store, accessed only through that service's API. This prevents tight coupling at the data layer, which is one of the most common ways that nominally independent services become coupled in practice.

---

## Designing Distributed Systems to Prevent Failures

### Implement Loosely Coupled Dependencies

Loose coupling isolates the behaviour of a component from the components that depend on it, increasing resiliency and agility. When a loosely coupled component fails, that failure is contained within its isolation boundary.

**Event-driven architectures.** Use **Amazon EventBridge** to build loosely coupled event-driven architectures. Components emit events to an event bus; downstream consumers subscribe to events they care about. Neither the producer nor the consumer knows about each other directly.

**Message queues.** Use **Amazon SQS** to decouple distributed systems. A producer writes a message to a queue; the consumer reads from the queue when it is ready. The queue absorbs spikes in message arrival rate and decouples producer throughput from consumer throughput.

**Orchestrated workflows.** Use **AWS Step Functions** to coordinate multiple AWS services into flexible workflows. Step Functions handles retries, error handling, and branching logic, removing this complexity from individual services.

**Publish-subscribe.** Use **Amazon SNS** for fan-out scenarios where a single event must be delivered to multiple consumers.

**Back pressure.** Loosely coupled systems should have the ability to slow down or stop incoming data when a component cannot process it at the same rate. Implement queue depth alarms and consumer auto-scaling to handle back pressure automatically.

**Avoid tight coupling via shared data.** Shared databases or shared caches reintroduce tight coupling and hinder scalability. Each service should own its data.

### Do Constant Work

Systems can fail when there are large, rapid changes in load. Design systems to do constant work so that the load on a component is predictable regardless of how many upstream events are firing.

For example, if a health check system monitors the health of thousands of servers, it should send the same size payload — a full snapshot of current state — every time. Whether no servers are failing or all of them are, the health check system is doing constant work. 100,000 server health states, each represented by a bit, is only a 12.5 KB payload. This is actually how Amazon Route 53 handles health checks for endpoints.

### Make Mutating Operations Idempotent

An idempotent service promises that each request is processed exactly once, such that making multiple identical requests has the same effect as making a single request. This makes it safe for clients to retry without fear that a request is processed multiple times.

**How idempotency tokens work.** Clients issue API requests with an idempotency token. When the service receives a request with a token it has already seen, it returns the same response as the first time rather than processing the request again.

**When to apply idempotency.** Idempotency is most important for mutating operations: HTTP POST, PUT, and DELETE; database inserts, updates, and deletes. Read-only queries generally do not need idempotency unless they have side effects.

**Common anti-patterns:**
- Using timestamps as idempotency keys (inaccurate due to clock skew or multiple clients using the same timestamp).
- Storing entire payloads for idempotency (degrades performance and scalability).
- Generating keys inconsistently across services (services may fail to recognise duplicate requests).
- Applying idempotency indiscriminately even where not needed.

**Implementation steps:**

1. **Identify idempotent operations** — mutating HTTP methods and database write operations.
2. **Use unique identifiers** — include a unique token (UUID or KSUID) in each idempotent request, either in the request body or as an HTTP header (e.g., `Idempotency-Key`).
3. **Track and manage state** — maintain the idempotency token and its state (pending, completed, failed) in a durable store. Common options:
   - **Amazon DynamoDB** — low-latency NoSQL, well-suited for storing idempotency tokens with TTL-based expiration.
   - **Amazon ElastiCache for Redis** — in-memory store for high-throughput token checking.
4. **Use concurrency controls** — use optimistic locking or DynamoDB conditional writes to handle race conditions where duplicate requests arrive simultaneously.
5. **Expire old tokens** — use TTL values to automatically remove old tokens from the datastore. The likelihood of token reuse diminishes over time.
6. **Propagate tokens downstream** — services and consumers should pass the received idempotency token to any downstream services they call. Every downstream service in the processing chain is responsible for idempotency.

**Idempotency in event-driven architectures.** Message queues such as SQS, Kinesis, and MSK can deliver a message more than once under certain conditions. When a publisher generates and includes idempotency tokens in messages, consumers must keep track of each token received and ignore messages containing duplicate tokens.

---

## Designing Distributed Systems to Withstand Failures

### Implement Graceful Degradation

Transform hard dependencies into soft dependencies where possible. A hard dependency is one whose failure directly causes your service to fail. A soft dependency is one whose failure is compensated for in the application — the workload degrades gracefully but continues to serve its core function.

```go
func GetRecommendations(ctx context.Context, userID string) (*Recommendations, error) {
    recs, err := recommendationClient.Fetch(ctx, userID)
    if err != nil {
        // Fall back to popular items instead of failing
        return getPopularItems(ctx, 10)
    }
    return recs, nil
}
```

Examples of hard dependency mitigation:
- If a recommendation service is unavailable, display a curated list of popular items.
- If a real-time personalisation service is unavailable, display generic content.
- If monitoring/logging is intermittently unavailable, continue business operations but alert on the logging failure.
- If an RDS primary writer is unavailable, buffer write requests in an SQS queue so that customer writes are still accepted even though they are processed asynchronously.

### Throttle Requests

Throttle requests to mitigate resource exhaustion due to unexpected increases in demand. Requests below throttling rates are processed; those over the limit are rejected with a 429 Too Many Requests response.

**The token bucket algorithm.** Each token counts as a request. Tokens are refilled at a configured rate per second and consumed one-per-request asynchronously.

```
Token bucket:
- Bucket capacity: N tokens (burst allowance)
- Refill rate: R tokens/second (sustained rate)
- Each request consumes 1 token
- If bucket is empty → reject with 429
```

**AWS services for throttling:**
- **Amazon API Gateway** implements the token bucket algorithm per account/region and can be configured per-client with usage plans.
- **Amazon SQS** and **Amazon Kinesis** can buffer requests to smooth request rates, allowing higher burst throttle rates.
- **AWS WAF** can enforce per-IP rate limiting rules to prevent a single IP from exhausting resources.
- **AWS AppSync** supports rate limiting on API keys for application-to-application consumers.

**Anti-patterns:**
- API endpoint throttles not implemented or left at default values.
- Not load testing at throttling limits.
- Throttling request rates without considering request size or complexity.
- Not configuring maximum concurrency on SQS-triggered Lambda consumers.

### Control and Limit Retry Calls

When a request fails, the client must decide whether to retry. The retry strategy must be carefully controlled to avoid compounding the problem.

**Exponential back-off with jitter.** Back off with progressively longer delays between retries, and add randomised jitter to avoid retry storms (the thundering herd problem).

```go
func RetryWithBackoff(ctx context.Context, maxRetries int, fn func() error) error {
    for i := 0; i <= maxRetries; i++ {
        err := fn()
        if err == nil {
            return nil
        }
        if i == maxRetries {
            return err
        }
        // Exponential back-off with jitter
        wait := time.Duration(100*(1<<i)+rand.Intn(50)) * time.Millisecond
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(wait):
        }
    }
    return nil
}
```

**Anti-patterns:**
- Implementing retries without back-off, jitter, and a maximum retry count. Uncontrolled retries at common intervals create artificial traffic spikes.
- Retrying non-idempotent operations (can cause unexpected side effects like duplicated records).
- Retrying at multiple layers of the application stack (compounds retry attempts in a retry storm — implement retries at only one layer).
- Retrying errors that are clearly non-transient (permission errors, configuration errors) that will never succeed without manual intervention.
- Not monitoring and alerting on repeated service failures so that underlying issues are surfaced.

**Only retry idempotent services** — implementing retries against a non-idempotent endpoint risks creating duplicate records or double-charging customers. Ensure services are idempotent before enabling retries.

### Fail Fast and Limit Queues

When a service cannot respond successfully to a request, fail fast. Releasing resources quickly allows the service to recover.

**Fail fast in code.** Use programmatic assertions and metric-based alarms to detect and surface failures early. Validate inputs at service boundaries rather than allowing invalid data to propagate through the system.

**Queue management.** Queues smooth load and allow clients to release resources when asynchronous processing is tolerable. However, do not allow unbounded queue backlogs:

- **Dead letter queues (DLQ)** — move messages that fail processing after a configured number of retries into a DLQ. Alarm on DLQ depth.
- **Message age monitoring** — measure and alarm on the age of the oldest message in the queue. A growing age indicates consumers are falling behind.
- **Sideline queues** — when backlogs build up, sideline older or excess traffic to a spillover queue so that new work is processed at normal priority. This is an approximation of LIFO processing.
- **Discard stale messages** — compare the current timestamp to the message timestamp. If a message is older than the client's timeout, discard it rather than processing a response the client has already abandoned.
- **Dead letter configuration:**

```hcl
resource "aws_sqs_queue" "orders" {
  name                      = "orders"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "orders_dlq" {
  name = "orders-dlq"
}

resource "aws_cloudwatch_metric_alarm" "dlq_depth" {
  alarm_name          = "orders-dlq-not-empty"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions = { QueueName = aws_sqs_queue.orders_dlq.name }
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.oncall.arn]
}
```

**Queue architecture anti-patterns:**
- Not configuring DLQs or alarms on DLQ depth.
- Combining many request types into a single queue (a backlog of one type delays all others).
- Configuring FIFO queues when strict ordering is not required (LIFO-style processing is better when backlog processing is delaying time-sensitive new requests).
- Exposing internal queues directly to clients (expose an API instead that manages work intake and places requests into the queue).

### Set Client Timeouts

Set timeouts appropriately on connections and requests. Do not rely on default values — many frameworks have defaults that are infinite or far higher than acceptable for service goals.

Set both a **connection timeout** (time to establish the TCP/TLS connection) and a **request timeout** (time to receive the complete response once connected).

**Timeout considerations:**
- Too high a timeout: resources continue to be consumed while the client waits, reducing the usefulness of the timeout.
- Too low a timeout: generates increased back-end traffic because too many requests are retried; in severe cases this can cause complete outages as all requests are being retried.

**When to time out vs retry:**
- Content that is inherently expensive: time out and do not retry — preserve resources for other requests.
- Transient service impairment: time out and retry — if the cause is localised, a retry is likely inexpensive and will succeed.
- Network delivery failure: time out and retry — the client can release resources and the retry will reach a healthy node.

**AWS-specific timeout configuration:**
- **AWS Lambda**: configure function timeout explicitly (default is 3 seconds; maximum is 15 minutes).
- **API Gateway**: integration timeout is configurable from 50 milliseconds to 29 seconds; API Gateway does not retry when an integration request times out.
- **AWS SDKs**: configure `connectTimeoutInMillis` and `tlsNegotiationTimeoutInMillis` in the SDK default configuration.
- **AWS CLI**: use `--cli-connect-timeout` and `--cli-read-timeout` for one-off commands.
- **App Mesh Envoy**: provides built-in timeout and circuit breaker capabilities at the sidecar level.
- **AWS Step Functions**: build low-code circuit breakers for remote service calls where calling AWS-native SDK integrations.

Use CloudWatch anomaly detection on call error rates, SLO latency metrics, and latency outliers to provide insight into whether timeouts are too aggressive or too permissive.

### Circuit Breaker

Prevent cascading failures by failing fast when a downstream service is unhealthy:

```go
type CircuitBreaker struct {
    mu            sync.Mutex
    state         int // 0=closed, 1=open, 2=half-open
    failureCount  int
    threshold     int
    timeout       time.Duration
    lastFailure   time.Time
}

func (cb *CircuitBreaker) Call(fn func() (interface{}, error)) (interface{}, error) {
    cb.mu.Lock()
    if cb.state == 1 { // open
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = 2 // half-open
        } else {
            cb.mu.Unlock()
            return nil, errors.New("circuit breaker open")
        }
    }
    cb.mu.Unlock()

    result, err := fn()
    if err != nil {
        cb.mu.Lock()
        cb.failureCount++
        if cb.failureCount >= cb.threshold {
            cb.state = 1
            cb.lastFailure = time.Now()
        }
        cb.mu.Unlock()
        return nil, err
    }

    cb.mu.Lock()
    cb.failureCount = 0
    if cb.state == 2 {
        cb.state = 0 // reset to closed
    }
    cb.mu.Unlock()
    return result, nil
}
```

AWS SDK v2 includes a built-in circuit breaker via the `Retryer` interface combined with throttled error detection. For application-level breakers, use resilience libraries like `gobreaker` or `resilience4j`. App Mesh Envoy provides circuit breaker capabilities at the mesh level. AWS Step Functions can be used to build low-code circuit breakers for AWS SDK integrations.

### Bulkheads

Isolate service resources to prevent a failure in one partition from taking down others:

- Separate ECS task definitions per service, each with its own CPU/memory limits.
- Dedicated DynamoDB tables per service to avoid throttling contention.
- Separate RDS or Aurora clusters for different domains (e.g., orders vs users).
- Thread pool isolation in JVM-based services.

### Implement Emergency Levers

Emergency levers are rapid processes that can mitigate availability impact on your workload. They work by disabling, throttling, or changing the behaviour of components or dependencies using known and tested mechanisms.

**When to use emergency levers.** Emergency levers address resource exhaustion due to unexpected demand spikes, and failures in non-critical components that would otherwise impact the availability of critical ones.

**Implementation steps:**
1. **Identify critical components** — map each technical component to its business function and classify as critical or non-critical.
2. **Design critical components to withstand non-critical failures** — apply graceful degradation patterns between critical and non-critical components.
3. **Test** — conduct testing to validate the behaviour of critical components during non-critical component failure.
4. **Define triggers** — define and monitor the metrics or alarms that signal when to activate an emergency lever.
5. **Define procedures** — specify the manual or automated steps that comprise the lever. Examples:
   - Feature flag: disable a non-critical feature at the application configuration level.
   - Traffic shedding: drop a percentage of low-priority requests at the ALB or API Gateway level.
   - Dependency bypass: hard-code a fallback response for a dependency that is failing.
   - Scaling: immediately scale out compute or database resources.

**Anti-patterns:**
- Failure of non-critical dependencies impacts core workload availability.
- Not testing or verifying critical component behaviour during non-critical impairment.
- No clear criteria defined for activation or deactivation of an emergency lever.

---

## Multi-AZ Deployment

Every microservice should run across at least three Availability Zones in an AWS Region. An AZ is one or more discrete data centres with independent power, cooling, and networking. Despite being physically separated, AZs in the same Region are connected via high-throughput, low-latency (single-digit millisecond) networking, making synchronous replication feasible.

### Compute Layer

**ECS / EKS with Fargate:**

```hcl
resource "aws_ecs_service" "svc" {
  name            = "orders-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.svc.arn
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_az1.id,
      aws_subnet.private_az2.id,
      aws_subnet.private_az3.id,
    ]
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}
```

- `deployment_minimum_healthy_percent = 100` ensures no downtime during rolling updates
- Three tasks spread across three AZs via subnet selection
- Service auto-replaces failed tasks via ECS health checks

**ECS Service Auto Scaling:**

```hcl
resource "aws_appautoscaling_target" "svc" {
  max_capacity       = 12
  min_capacity       = 3
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.svc.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.svc.resource_id
  scalable_dimension = aws_appautoscaling_target.svc.scalable_dimension
  service_namespace  = aws_appautoscaling_target.svc.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70
  }
}
```

### Data Layer

**Amazon RDS Multi-AZ** provides automatic failover to a standby in a different AZ:
- Synchronous replication to a standby instance.
- Automatic DNS name update on failover (60–120 seconds typical).
- No application changes needed if you use the RDS endpoint.

For higher write throughput, **Aurora** offers:
- Six copies across three AZs.
- Storage auto-healing with no loss of data.
- Failover in under 30 seconds.
- Cross-region read replicas for DR with replication lag typically under 1 second on the AWS backbone.

**DynamoDB** replicates data across multiple AZs by default. Enable **DynamoDB global tables** for active-active multi-region replication.

**Amazon S3** stores objects across a minimum of three AZs providing 99.999999999% (eleven nines) durability. Do not use S3 One Zone-IA for statically stable designs — the loss of that zone removes access to the stored data.

**Amazon ElastiCache for Redis** with cluster mode:

```hcl
resource "aws_elasticache_replication_group" "cache" {
  replication_group_id       = "sessions-cache"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 3
  multi_az_enabled           = true
  automatic_failover_enabled = true
}
```

---

## Stateless Services

Stateless services are the foundation of HA. Any instance can handle any request, which lets you add or remove instances freely, route traffic to any healthy instance, and recover from failures by replacing instances with no data loss.

### Session State

Store session data in external caches instead of local memory:

- **ElastiCache for Redis** for fast, durable session storage.
- **DynamoDB** for session data that must survive cache failures.
- **DynamoDB Accelerator (DAX)** for read-heavy session workloads.
- **Amazon MemoryDB** for Redis-compatible in-memory storage with full durability.
- **Amazon Cognito** to decouple user identity and profile data from application code.
- **AWS Secrets Manager** to decouple secrets from application code.

```go
// Example: session middleware using Redis
func SessionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("X-Session-Token")
        if token == "" {
            http.Error(w, "missing session", http.StatusUnauthorized)
            return
        }
        data, err := redisClient.Get(ctx, "session:"+token).Result()
        if err != nil {
            http.Error(w, "invalid session", http.StatusUnauthorized)
            return
        }
        ctx := context.WithValue(r.Context(), "session", data)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

Once stateless, services can run on serverless compute like AWS Lambda or AWS Fargate, which provides inherent horizontal scaling and fault tolerance.

---

## Load Balancing and Service Discovery

### Application Load Balancer

- Distributes traffic across targets in multiple AZs.
- Performs health checks and removes unhealthy targets.
- Provides path-based routing (`/orders/*`, `/payments/*`) for API gateways.

```hcl
resource "aws_lb_target_group" "svc" {
  name     = "orders-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }
}
```

### Service Mesh (App Mesh)

For inter-service communication, AWS App Mesh provides:
- Traffic splitting for canary deployments.
- Retry policies and timeouts at the mesh level.
- Envoy sidecars for observability (including built-in circuit breaker capabilities).

```yaml
# VirtualNode definition for orders service
kind: VirtualNode
metadata:
  namespace: app
  name: orders-vn
spec:
  listeners:
    - portMapping:
        port: 8080
        protocol: http
      healthCheck:
        healthyThreshold: 2
        intervalMillis: 10000
        path: /health
        port: 8080
        protocol: http
  backends:
    - virtualServiceRef:
        namespace: app
        name: inventory-svc
```

---

## Observability for HA

You cannot operate a highly available system without deep observability.

### Health Endpoints

Every service must expose a `/health` endpoint that checks its critical dependencies:

```go
func HealthHandler(db *sql.DB, redis *redis.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if err := db.PingContext(r.Context()); err != nil {
            http.Error(w, "db unhealthy", http.StatusServiceUnavailable)
            return
        }
        if err := redis.Ping(r.Context()).Err(); err != nil {
            http.Error(w, "cache unhealthy", http.StatusServiceUnavailable)
            return
        }
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"status":"healthy"}`))
    }
}
```

### Amazon CloudWatch

**Metrics.** Collect CPU, memory, request count, latency, error rate, and throttled requests from both application and infrastructure. Define business-level KPI metrics alongside technical metrics. Use **CloudWatch custom metrics** to publish application-specific indicators.

**Metric aggregation.** Define and calculate meaningful aggregate metrics. P99 and P99.9 latency percentiles reveal tail latency that averages hide. Error rate as a percentage of total requests is more meaningful than an absolute error count.

**Alarms.** Create three types of alarms:
- **Application alarms** — detect when any part of your workload is not working properly (for example, 5xx error rate exceeds 1%).
- **Infrastructure alarms** — indicate when to scale resources (for example, CPU > 70% for 5 minutes).
- **Composite alarms** — combine multiple KPI alarms using boolean logic to reduce alarm noise and create higher-confidence alerts.

SLO-based alarms should page the on-call engineer before users are meaningfully affected:

```hcl
resource "aws_cloudwatch_metric_alarm" "high_errors" {
  alarm_name          = "orders-svc-high-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Order service returning excessive 5xx"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  dimensions = {
    TargetGroup  = aws_lb_target_group.svc.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }
  alarm_actions = [aws_sns_topic.oncall.arn]
}
```

**Automated responses.** Configure alarms to trigger automated remediation via **Amazon EventBridge** rules that invoke **AWS Lambda** functions. Examples: automatically scale out tasks when error rate rises, trigger a failover when primary database health deteriorates, or post to a Slack/Teams channel when any threshold is breached.

**Log analysis.** Use structured JSON logs with correlation IDs that span service boundaries. Use **CloudWatch Logs Insights** to run queries across large volumes of structured log data. Use **CloudWatch Log Metric Filters** to extract metrics from log patterns (for example, count occurrences of `"level":"ERROR"` per minute).

**Regularly review monitoring scope.** As workloads evolve, monitoring scope must be reviewed to ensure that new components are instrumented, that retired components are removed from dashboards, and that alarm thresholds are still appropriate.

**AWS Health notifications.** Create AWS Health event notifications to e-mail and chat channels through AWS User Notifications. Integrate programmatically through Amazon EventBridge to react to service degradations that may affect your workload.

### CloudWatch Synthetics and Real-User Monitoring (RUM)

**Synthetic canaries** are configurable scripts that run on a schedule to monitor endpoints and APIs. They verify availability and latency from external vantage points, independent of your application's own metrics. Configure canaries with X-Ray tracing to include client-interaction telemetry in the end-to-end trace analysis.

**CloudWatch RUM** instruments web application clients to capture real-user performance data including load times, Core Web Vitals, JavaScript errors, and backend call latency as experienced by actual users. Use this alongside synthetic canaries to accurately evaluate performance against SLAs.

### Distributed Tracing with AWS X-Ray

```go
import "github.com/aws/aws-xray-sdk-go/xray"

func main() {
    xray.Configure(xray.Config{
        ServiceVersion: "1.2.3",
    })
    http.Handle("/orders", xray.Handler(xray.NewFixedSegmentNamer("orders-svc"), orderHandler))
}
```

All application components should be included in request traces: service clients, middleware gateways and event buses, compute components, storage, key-value stores, and databases. Enable X-Ray on all supported native services (S3, Lambda, API Gateway) using configuration toggles via IaC or the Console.

Use **CloudWatch ServiceLens** to integrate traces with metrics, logs, and alarms, providing a single view of service health.

Use **AWS Distro for OpenTelemetry** to instrument applications that are not native AWS services, or to forward trace telemetry to third-party tools (Datadog, New Relic, Dynatrace) while also sending to X-Ray.

The benefits of end-to-end tracing: teams alerted to issues can see a full picture of component interactions including correlation to logs, performance, and failures. Decisions like when to invoke DR failover or where to implement self-healing strategies are improved by analysing system traces, ultimately improving customer satisfaction.

### AWS Resilience Hub

AWS Resilience Hub provides a central place to define, validate, and track the resiliency of AWS applications. It analyses your workload against a resiliency policy you define (RTO and RPO targets) and produces a report identifying gaps. It also generates AWS FIS experiment templates that you can use directly for chaos testing. Run Resilience Hub assessments after any significant architectural change.

---

## Deployment Strategies

### Rolling Deployments

- Default in ECS: replace containers one by one.
- Requires `deployment_minimum_healthy_percent = 100`.
- No additional cost but slower rollouts.

### Blue/Green Deployments

- Run two complete environments.
- Switch DNS or ALB listener rules to cut over instantly.
- Fast rollback by switching back.

```hcl
resource "aws_codedeploy_deployment_group" "bluegreen" {
  app_name              = aws_codedeploy_app.ecs.name
  deployment_group_name = "orders-bluegreen"
  service_role_arn      = aws_iam_role.codedeploy.arn
  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }
  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}
```

### Canary Deployments

- Route a small percentage of traffic to the new version via ALB weighted target groups or App Mesh traffic splitting.
- Monitor error rates and latency before shifting more traffic.
- Automated rollback if metrics degrade.

### Feature Flags

Feature flags (also known as feature toggles) are configuration options on an application. You can deploy software with a feature turned off so that customers don't see it. You can then turn on the feature gradually (as with a canary deployment) or all at once. If the deployment has problems, simply turn the feature back off without rolling back the entire service. This provides a separation between code deployment and feature release.

### Fault-Isolated Zonal Deployments

One of the most important rules for production deployments is to avoid touching multiple Availability Zones within a Region at the same time. Deploy changes one AZ at a time with health validation between each zone. This ensures that AZs remain independent for availability calculations and that a bad deployment fails in one AZ before reaching the others.

### Immutable Infrastructure

Immutable infrastructure is a model that mandates that no updates, security patches, or configuration changes happen in-place on production workloads. When a change is needed, new infrastructure is built and deployed into production.

**Benefits:**
- **Increased consistency** — no differences in infrastructure across environments; testing is simplified.
- **Reduced configuration drift** — infrastructure is always in a known, version-controlled state.
- **Reliable atomic deployments** — deployments either complete successfully or nothing changes.
- **Simpler deployments** — upgrades are just new deployments; no upgrade path logic required.
- **Safer rollbacks** — the previous working version is unchanged; roll back by switching traffic.
- **Enhanced security posture** — remote access mechanisms like SSH can be disabled since in-place modification is not permitted.

**Implementation:**
- Use infrastructure as code (AWS CloudFormation, AWS CDK, Terraform) to define all infrastructure declaratively.
- Pre-bake Amazon Machine Images (AMIs) using EC2 Image Builder to speed up launch times.
- Use AWS Elastic Beanstalk, AWS CodeDeploy, or AWS Proton to automate immutable deployments.
- Use AWS Config to detect drift from the expected infrastructure state and alert when changes are made outside of the deployment pipeline.

### Functional and Resiliency Testing in the Deployment Pipeline

Integrate functional testing into every deployment. Automated tests run against a staging or canary environment before traffic is shifted to the new version. If any test fails, the deployment is automatically halted and rolled back.

Integrate resiliency testing into the deployment pipeline as well. Run a subset of chaos experiments against the new version in a pre-production environment as part of CI/CD. To learn how to do this, see the blog on running AWS FIS experiments using AWS CodePipeline.

### Operational Readiness Reviews (ORRs)

AWS performs Operational Readiness Reviews that evaluate the completeness of testing, the ability to monitor, and the ability to audit application performance against SLAs. A formal ORR is conducted prior to initial production deployment and repeated periodically (once per year or before critical performance periods) to ensure no drift from operational expectations has occurred. Consider adopting a similar practice: define a checklist of reliability, observability, and operational criteria that must be satisfied before a service is approved for production launch.

---

## Back Up Data

Back up data, applications, and configuration to meet your RTO and RPO requirements.

### Identify and Back Up All Data

Identify all data sources used by the workload and classify them by criticality. Establish a recovery strategy — either backing up those sources or having the ability to reproduce data from other sources — that meets the RPO.

Most AWS data stores offer backup capabilities:
- **Amazon RDS** and **Amazon DynamoDB** support automated backup with point-in-time recovery (PITR), allowing restore to any time up to five minutes before the current time.
- **Amazon DynamoDB** on-demand backup captures a full snapshot at any time with no performance impact.
- **Amazon EBS** snapshots capture point-in-time copies of volumes and can be copied to other regions.
- **AWS Backup** centralises and automates data protection across AWS services (RDS, DynamoDB, EBS, EFS, S3, Aurora, FSx, EC2, and more) from a single console and API.

**Anti-patterns:**
- Not being aware of all data sources for the workload.
- Not taking backups of critical data sources.
- No defined RPO, or backup frequency that cannot meet the RPO.
- Not evaluating whether backup is necessary or whether data can be reproduced from other sources.

### Secure and Encrypt Backups

Encrypt backups to ensure that data is secure. Use **AWS KMS** customer-managed keys for encryption at rest. Copy backups to a separate AWS account or region to protect against accidental deletion or account-level compromise. Restrict access to backup vaults using resource-based policies in AWS Backup.

### Perform Data Backup Automatically

Use AWS Backup to create automated backup schedules. Define backup plans that specify the frequency, retention period, and destination vault. Use EventBridge rules with Lambda or Step Functions to back up data sources not supported by AWS Backup (for example, on-premises data sources or message queues).

### Periodic Recovery Testing

Validate that your backup process meets your RTO and RPO by performing a recovery test periodically. Restoring a backup without verifying the data is insufficient — common tests include:
- Verifying that all data is present, not corrupted, and accessible.
- Verifying that data loss is within the RPO (compare backup timestamp to the time of simulated failure).
- Measuring the time to restore and comparing it to the RTO.
- Notifying stakeholders via SNS if validation fails or RTO is exceeded.

Use **AWS Elastic Disaster Recovery (AWS DRS)** for continual point-in-time recovery of Amazon EBS volumes with the ability to launch recovery drills without redirecting production traffic.

Automate the recovery validation process using AWS Lambda or Step Functions, triggered on a schedule by EventBridge. Store validation results in DynamoDB and notify stakeholders via SNS on failure. Automate this end-to-end — do not rely on a manual process that may be skipped under operational pressure.

---

## Fault Isolation

### Deploy to Multiple Locations

All compute associated with a workload should be distributed among multiple Availability Zones. AWS compute services (EC2 Auto Scaling, ECS, EKS) provide ways to launch and manage compute across AZs and will automatically replace compute in a different AZ to maintain availability.

Data services that are multi-AZ by default include Amazon S3, EFS, Aurora, DynamoDB, SQS, and Kinesis Data Streams. Data services that require explicit multi-AZ enablement include Amazon RDS, Amazon Redshift, and Amazon ElastiCache — once enabled, these services automatically detect AZ impairment, redirect requests, and re-replicate data.

If using self-managed storage (EBS volumes, EC2 instance storage), you must manage multi-AZ replication yourself.

### Static Stability to Prevent Bimodal Behaviour

Bimodal behaviour occurs when a workload behaves differently under normal conditions vs failure conditions. For example, relying on launching new EC2 instances when an AZ fails is bimodal — the workload operates normally in one mode and attempts to provision new resources (a control plane operation) in the other.

A statically stable design operates in only one mode regardless of whether a failure is occurring. Provision enough instances in each AZ to handle the full load if one AZ is removed. When an AZ fails, traffic shifts to the healthy AZs (a data plane operation), and Auto Scaling asynchronously replaces the failed capacity.

Static stability applies to:
- **Compute** (EC2, ECS/EC2, EKS/EC2, EMR) — pre-provision capacity in each AZ.
- **Database read replicas** — maintain enough replicas in each AZ so that the loss of one AZ doesn't reduce read capacity below acceptable levels.
- **Storage** (EBS, EFS mounts, FSx mounts) — avoid single-AZ storage for statically stable designs.
- **Load balancers** — distribute target registration evenly across AZs.
- **Kubernetes (EKS) clusters** — spread node groups across AZs.

Example of bimodal behaviour to avoid: a network timeout that causes the system to attempt to refresh the configuration state of the entire system. This adds unexpected load to another component and may cause a cascading failure. A statically stable design refreshes configuration state on a fixed cadence (constant work) and uses the previously cached value when a call fails, while initiating an alarm.

Another example: allowing clients to bypass your workload cache when failures occur. This can significantly change the demands on your backend and is likely to result in cascading failure.

```
Static stability formula for AZ failure tolerance:

Instances per AZ = ceil(Total Required Capacity / (Total AZs - 1))

Example: 9 total required instances across 3 AZs
→ ceil(9 / 2) = 5 instances per AZ
→ Total deployed: 15 (5 per AZ)
→ If one AZ fails: 10 remaining instances ≥ 9 required ✓
```

### Automate Recovery for Components Constrained to a Single Location

Some components (for example, stateful storage with EBS volumes) cannot easily be distributed across AZs. For these, automate recovery: detect failure using CloudWatch alarms, and trigger automated recovery actions using EC2 Auto Recovery, ECS service replacement, or Lambda-driven automation that provisions the component in a healthy AZ.

### Bulkhead Architectures to Limit Scope of Impact

Bulkhead architectures partition resources so that a failure in one partition is contained and does not propagate. Beyond the service-level bulkheads described earlier (separate task definitions, separate data stores), consider:

- **Cell-based architectures** — partition workloads by customer, geography, or function into independent cells. A failure in one cell affects only that cell's users. Route traffic between cells using Route 53 or Global Accelerator.
- **Separate AWS accounts** — use separate accounts for production, staging, and development to prevent resource and quota conflicts between environments.
- **Reserved concurrency for Lambda** — use reserved concurrency to prevent one Lambda function from consuming all available concurrency in the account and starving other functions.

### Rely on the Data Plane During Recovery

During recovery operations, prefer data plane operations over control plane operations. The data plane (EC2 instances serving requests, RDS serving reads/writes, DynamoDB table operations) typically has higher availability design goals than the control plane (launching new instances, creating new databases, configuring new resources).

In a failure scenario, the control plane may be degraded at the same time as your workload. Design recovery actions to rely on pre-deployed resources (data plane operations) rather than provisioning new resources (control plane operations) wherever possible. For example:
- Use pre-provisioned Route 53 health check and failover records (data plane) rather than creating new DNS records during failover.
- Use **Amazon Application Recovery Controller (ARC)** to reroute traffic without needing to mutate DNS records.
- Avoid Lambda-based automation that creates new resources during a failure event.

### Send Notifications When Events Impact Availability

Automated healing allows workloads to be reliable, but it can also obscure underlying problems. Implement notifications so that even automatically resolved issues are surfaced to the operations team.

When defining notifications:
- Send alerts when thresholds are breached, even if auto-healing has already resolved the immediate issue.
- Set alarm thresholds at values where investigation is warranted, not just at levels that represent complete failure.
- Avoid alarm fatigue — too many alarms, or alarms that are not actionable, cause operators to ignore them. Tune thresholds regularly.
- Use composite alarms to create high-confidence alerts based on multiple KPIs before paging on-call.

```hcl
resource "aws_cloudwatch_composite_alarm" "orders_svc_degraded" {
  alarm_name = "orders-svc-degraded"
  alarm_rule = "ALARM(${aws_cloudwatch_metric_alarm.high_errors.alarm_name}) AND ALARM(${aws_cloudwatch_metric_alarm.high_latency.alarm_name})"
  alarm_actions = [aws_sns_topic.oncall.arn]
  ok_actions    = [aws_sns_topic.oncall.arn]
}
```

### Architect to Meet Availability Targets and SLAs

If you publish or privately agree to availability targets or uptime SLAs, verify that your architecture and operational processes are designed to support them. Resilience metrics must be set before deploying, not derived after. The availability calculation formulas covered earlier — hard dependency chains, redundant component benefits — should be applied at design time to verify that the architecture can theoretically meet the target.

Common anti-patterns:
- Deploying workloads without setting any SLAs.
- Setting SLA metrics too high without rationale or business requirements.
- Not accounting for dependency SLAs when setting your own.
- Not considering the Shared Responsibility Model in the SLA calculation.

---

## Testing for HA

### Load Testing

**Amazon Distributed Load Testing** can simulate thousands of concurrent users against your services. Perform load testing with representative traffic:
- Identify the mix of requests across different endpoints and times of day.
- Start with small capacity to see immediate effects, then scale up to production-equivalent capacity.
- Identify which metric first indicates the need to add or remove capacity.
- Validate throttling limits under combined peak request rate and peak request size.

**Load Testing with Locust:**

```python
from locust import HttpUser, task, between

class OrdersUser(HttpUser):
    wait_time = between(0.5, 2)

    @task(3)
    def get_orders(self):
        self.client.get("/orders")

    @task(1)
    def create_order(self):
        self.client.post("/orders", json={
            "user_id": "u-123",
            "items": [{"sku": "SKU-001", "qty": 1}]
        })
```

### Chaos Engineering with AWS Fault Injection Service (FIS)

Chaos engineering validates that a system can withstand unexpected failures. The process follows a flywheel:

**1. Establish steady state.** Identify the measurable system outputs that define normal operation (for example, error rate < 0.01% and P99 latency < 500 ms). These become the hypothesis of your experiment.

**2. Form a hypothesis.** Describe what you expect to happen when a fault is injected. For example: "If we terminate one of three ECS tasks in AZ2, the service will continue to handle requests with less than 0.01% increase in 5xx errors."

**3. Inject a fault and run the experiment.**

```hcl
resource "aws_fis_experiment_template" "az_failure" {
  description = "Simulate single AZ failure"

  target {
    resource_type  = "aws:ecs:cluster"
    resource_arns  = [aws_ecs_cluster.main.arn]
    selection_mode = "ALL"
  }

  action {
    name      = "az-failure"
    action_id = "aws:ecs:stop-task"
    target {
      key   = "Cluster"
      value = "cluster"
    }
    parameter {
      key   = "duration"
      value = "PT5M"
    }
  }

  stop_condition {
    source = "aws:cloudwatch:alarm"
    value  = aws_cloudwatch_metric_alarm.critical_errors.arn
  }
}
```

Key safety practices:
- Start with non-production environments; only run in production after pre-production results are satisfactory.
- Use stop conditions (up to five per FIS template) to halt the experiment automatically if guardrail metrics are breached.
- Communicate with operations teams, SRE teams, and customer support before running any experiment.
- Configure rollback actions (post-actions) in FIS experiment parameters so that the workload returns to its known-good state at experiment end.
- Use AWS Resilience Hub to generate FIS experiment templates based on an analysis of your workload.

We discourage custom scripts for chaos experiments unless they track current experiment state, emit logs, and provide rollback mechanisms. Use an established framework like AWS FIS that provides these capabilities by default.

**4. Verify the hypothesis.** Measure system outputs during the experiment and compare to steady state. Focus on consequences that clients directly experience (5xx error rates, failed customer requests, latency) rather than internal attributes. Include a synthetic canary as a user proxy metric in every experiment's stop conditions.

**5. Improve the workload.** If steady state was not maintained, apply Well-Architected best practices to address the failure mode, then run the experiment again. This iterative cycle is the core of chaos engineering.

**6. Run experiments regularly.** After a workload meets the experiment hypothesis, automate the experiment to run as a regression in the CI/CD pipeline. Fault injection experiments are also a key component of game days.

**Capture results.** Persist experiment results including timestamps, workload state, and conditions for later trend analysis. Examples: dashboard screenshots, CloudWatch metric CSV exports, X-Ray trace archives.

### Game Days

Game days simulate a failure or event to verify systems, processes, and team responses. The purpose is to perform the same actions the team would perform as if the event actually occurred, building ingrained habits for responding under pressure.

**Benefits:**
- **Enhanced response skills** — teams practice their duties and communication mechanisms during simulated events, creating more coordinated and efficient responses in production.
- **Identify and address dependencies** — complex environments have intricate dependencies; game days expose them before real events do.
- **Foster a culture of resilience** — game days promote awareness, collaboration, and shared understanding of reliability across the organisation.
- **Continuous improvement** — regular game days allow you to continually assess and adapt resilience strategies.
- **Increased confidence** — successful game days build confidence in the system's ability to recover.

**How to run a game day:**

1. **Prepare**: Define scenarios and procedures. Inform all team members and stakeholders in advance of the date, time, and scenarios.
2. **Simulate**: Inject faults using AWS FIS. Teams monitor and assess the impact of simulated events.
3. **Observe**: If systems operate as designed, automated detection, scaling, and self-healing mechanisms should activate with little to no user impact.
4. **Remediate**: If negative impact is observed, roll back the test and remedy identified issues through automated or manual means documented in runbooks.
5. **Document**: Capture lessons learned. Use them as a feedback loop to improve systems, processes, and team capabilities.

**Anti-patterns:**
- Documenting procedures but never exercising them.
- Excluding business decision-makers from the exercises.
- Not informing all relevant stakeholders before running.
- Focusing solely on technical failures without involving business stakeholders.
- Blaming teams for failures or bugs found during game days.
- Not incorporating lessons learned into recovery processes.

In AWS, game days can use replicas of production environments built using infrastructure as code, keeping experiments isolated from live customer traffic.

---

## Disaster Recovery

### Defining Recovery Objectives

Define a Recovery Time Objective (RTO) and Recovery Point Objective (RPO) for each workload based on business impact.

**RTO** is the maximum acceptable delay between the interruption of service and restoration of service. **RPO** is the maximum acceptable time since the last data recovery point (the maximum tolerable data loss).

Build a DR tiering matrix to classify workloads:

| Business criticality | Example RTO | Example RPO |
|---|---|---|
| Critical | < 1 hour | < 15 minutes |
| High | < 4 hours | < 1 hour |
| Medium | < 24 hours | < 4 hours |
| Low | < 72 hours | < 24 hours |

When analysing business impact consider: financial impact (lost revenue), reputational impact (loss of customer trust), operational impact (missed payroll, decreased productivity), and regulatory risk. Also consider whether recovery objectives change during specific times of year (holiday shopping seasons, sporting events, product launches).

Note that different parts of the same workload may have different RTOs and RPOs — for example a database of completed orders (high criticality) vs a cache of recommendation data (lower criticality).

### DR Strategy Selection

| Strategy | RPO | RTO | Cost |
|---|---|---|---|
| Backup & Restore | Hours | Hours | Low |
| Pilot Light | Minutes | Tens of minutes | Medium |
| Warm Standby | Seconds | Minutes | Medium-High |
| Multi-Region Active-Active | Near-zero | Near-zero | High |

**Backup & Restore**: Data is backed up to S3 or cross-region replicated snapshots. In a disaster, restore the backup to new infrastructure in the recovery region. Lowest cost but highest RTO.

**Pilot Light**: A minimal version of the environment (typically data replication, core services) runs continuously in the recovery region. In a disaster, scale up the infrastructure around the pilot light. Core data is always current; compute must be provisioned.

**Warm Standby**: A scaled-down but fully functional copy of the production environment runs in the recovery region. In a disaster, scale it up to full production capacity and switch traffic.

**Multi-Region Active-Active**: Full production load is served from multiple regions simultaneously. In a disaster, evacuate one region by routing all traffic to the remaining active regions.

### Active-Passive with Route 53

```hcl
resource "aws_route53_health_check" "primary" {
  fqdn              = "api.primary.example.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 10
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }
  set_identifier = "primary"
  alias {
    zone_id                = aws_lb.primary.zone_id
    name                   = aws_lb.primary.dns_name
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api_failover" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"

  failover_routing_policy {
    type = "SECONDARY"
  }
  set_identifier = "secondary"
  alias {
    zone_id                = aws_lb.secondary.zone_id
    name                   = aws_lb.secondary.dns_name
    evaluate_target_health = true
  }
}
```

Use **Amazon Application Recovery Controller (ARC)** routing controls to reroute traffic without needing to mutate DNS records directly. ARC provides a highly available data plane API for manually initiated failover, which is critical when the control plane of the primary region may be degraded during a disaster event.

### Testing DR Implementation

DR plans must be tested; untested plans should not be relied upon. Test DR implementation to validate:
- Recovery can be performed within RTO.
- Data recovered is within RPO.
- Data is not corrupted and is accessible.
- All members of the team can execute the runbook.

Run **AWS Elastic Disaster Recovery (AWS DRS)** recovery drills that launch drill instances without redirecting production traffic, verifying the recovery process end-to-end.

Schedule DR tests regularly — at minimum annually, and before significant architectural changes or new product launches.

### Managing Configuration Drift at the DR Site

Configuration drift occurs when the recovery region or site diverges from the primary due to changes made only in the primary. Manage drift by:
- Applying all infrastructure changes via IaC (CloudFormation, CDK, Terraform) and deploying to all regions simultaneously using **CloudFormation StackSets** or multi-region CI/CD pipelines.
- Using **AWS Config** rules to detect configuration deviations in the recovery region.
- Regularly running game days that test DR procedures using the recovery region at production scale (to catch quota drift as well as configuration drift).
- Reconciling service quota differences across primary and recovery regions continuously.

### Failback Planning

Failback is the process of returning workload operation to the primary region after a disaster. Plan failback in advance:

1. Restore infrastructure and code to the primary region using the same IaC and deployment pipelines.
2. Re-synchronise data from the recovery region (now the live region) back to the primary. Some AWS services handle this automatically: DynamoDB global tables resume propagating pending writes when a recovered table comes back online; Aurora Global Database with managed planned failover maintains its replication topology.
3. Re-establish database replicas in the primary region — in many cases this involves deleting the old primary database and creating new replicas.
4. Route a small percentage of traffic back to the primary to verify it is healthy before full failover.
5. Consider making the recovery region the new primary rather than failing back if it simplifies operations. Some organisations rotate primary and recovery regions on a scheduled basis (for example every three months).

All failover and failback steps should be maintained in a playbook reviewed periodically by all team members.

### Automated Recovery

Design recovery to be automated where possible:
- **AWS Elastic Disaster Recovery** continually replicates machines (OS, system state, databases, applications, files) into a staging area in the target account and region. If an incident occurs, it automates the conversion of replicated servers into fully provisioned workloads in the recovery region.
- **AWS Systems Manager Automation** runbooks can orchestrate multi-step recovery procedures.
- **Amazon EventBridge** can trigger recovery automation in response to CloudWatch alarm state changes.
- **AWS Lambda** or **Step Functions** can orchestrate complex recovery workflows.

Maintenance and improvement of automated recovery is an ongoing process: continually test and refine recovery procedures based on lessons learned, and stay updated on new AWS services and features that enhance recovery capabilities.

---

## Cost Considerations

HA is not free. Key cost drivers and how to manage them:

- **Multi-AZ**: data transfer between AZs is charged at standard inter-AZ rates. Colocate dependent services in the same AZ pair to minimise cross-AZ traffic where the latency is acceptable.
- **Fargate vs EC2**: Fargate eliminates instance management but costs more per unit of CPU/memory for predictable workloads. For steady-state services, reserved EC2 instances with mixed-instance ASGs are cheaper.
- **Static stability**: pre-provisioning headroom capacity (for example 5 instances per AZ instead of 3) increases baseline compute cost. Weigh this against the cost of a recovery failure and the use of reserved or savings plan pricing for the baseline.
- **Multi-Region DR**: warm standby in a second region doubles compute cost. Use pilot light for non-critical workloads.
- **Data transfer**: Internet-facing ALBs and NAT gateways generate recurring costs. Minimise cross-region traffic by partitioning data by region.
- **Availability cost progression**: moving from 99.9% to 99.99% increases cost significantly. At very high availability goals, the engineering investment needed to test exhaustive failure scenarios and operate with extreme care further drives cost. Be thorough in determining the right target for each workload lifecycle.

---

## Operational Runbooks and Playbooks

**Runbooks** are predefined procedures to achieve specific outcomes (deploying a workload, patching, making DNS modifications). **Playbooks** are used in response to specific incidents. Often runbooks cover routine activities while playbooks cover non-routine events.

Start with a valid, effective manual process; implement it in code; and invoke it automatically where appropriate. Even for highly automated workloads, runbooks are useful for game days and for rigorous reporting and auditing requirements.

Every HA incident should follow a documented runbook:

1. **Detection**: CloudWatch alarm fires, on-call receives page.
2. **Diagnosis**: Check dashboard for error rate, latency, and throttling.
3. **Mitigation**: Run the mitigation script (e.g., scale up, failover, rollback).
4. **Resolution**: Confirm the system is healthy.
5. **Post-mortem**: Document root cause, timeline, and preventive actions.

```yaml
# Example runbook snippet
runbook: high-latency-in-orders-svc
steps:
  - check_dashboard: Open CloudWatch dashboard "orders-svc"
  - check_db_cpu: |
      aws rds describe-db-instances \
        --db-instance-identifier orders-db \
        --query 'DBInstances[0].DBInstanceStatus'
  - scale_up_tasks: |
      aws ecs update-service \
        --cluster main \
        --service orders-svc \
        --desired-count 6
  - failover_db: |
      aws rds failover-db-instance \
        --db-instance-identifier orders-db
  - rollback_deploy: |
      aws ecs update-service \
        --cluster main \
        --service orders-svc \
        --task-definition orders-svc:${PREVIOUS_REVISION}
```

Ensure rollback safety during deployments. Before any deployment, verify that the deployment can be rolled back without customer disruption. Test the rollback procedure as part of game days.

Use AWS Systems Manager Automation to execute runbooks programmatically, with full audit trails in AWS CloudTrail and notifications via SNS.

---

## Conclusion

High availability in microservices on AWS requires deliberate design at every layer of the stack. Start with the availability formulas to set realistic targets based on your dependency graph. Understand the distinction between hard and soft availability requirements across different parts of your workload. Manage service quotas proactively — quota exhaustion is one of the most common and preventable causes of availability incidents.

Run services across multiple AZs, make them stateless, and implement static stability so workloads operate identically during normal and failure conditions. Use loosely coupled architectures with event-driven patterns, SQS queues, and idempotent APIs. Apply resilience patterns — circuit breakers, bulkheads, throttling, fail-fast, and client timeouts — at every service boundary. Implement emergency levers for rapid mitigation before automated healing kicks in.

Deploy changes using immutable infrastructure, fault-isolated zonal rollouts, and automated CI/CD pipelines with integrated functional and resiliency testing. Monitor everything with CloudWatch metrics, composite alarms, synthetic canaries, real-user monitoring, and distributed tracing. Back up all data automatically, encrypt it, copy it cross-region, and validate recovery regularly.

Validate your architecture with load testing and chaos experiments. Run game days to build team muscle memory for responding to failures. Define RTO and RPO for every workload, implement the appropriate DR strategy, and test it.

The goal is not to eliminate failure — that is impossible. It is to design systems that degrade gracefully, recover automatically, and give teams the observability and runbooks needed to respond consistently and confidently when failure inevitably occurs.
