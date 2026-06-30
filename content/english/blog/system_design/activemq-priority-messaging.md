+++
date = '2026-06-25T12:00:00+10:00'
draft = false
title = 'Amazon MQ System Design — ActiveMQ and RabbitMQ on AWS'
tags = ['Amazon MQ', 'ActiveMQ', 'RabbitMQ', 'AWS', 'Messaging', 'JMS', 'AMQP', 'Priority', 'Queue', 'System Design']
summary = 'Comprehensive system design guide for Amazon MQ covering both ActiveMQ and RabbitMQ engines — architecture, availability, cost, resiliency, disaster recovery, and trade-offs against SQS, SNS, EventBridge and Kafka on AWS.'
+++

Amazon MQ is the AWS managed message broker service supporting two engines: Apache ActiveMQ and RabbitMQ. This guide covers system design for both engines — architecture, availability, cost, resiliency patterns, disaster recovery, and how they compare to other AWS messaging services. Priority-based messaging on the ActiveMQ engine is covered in depth as a reference implementation.

---

### Terms

- **Wire-level protocol** — defines the exact bytes that go over the TCP connection: framing, encoding, handshakes. You can open a raw socket and speak it byte-for-byte. OpenWire, AMQP 0-9-1, and MQTT are wire-level protocols.

- **Message transfer protocol** — defines how to move a message from one peer to another at the application layer without dictating the routing/queueing model. The broker decides how to route; the protocol only handles delivery. In the AMQP 1.0 sense, 0-9-1 is both a wire protocol *and* a routing protocol in one spec — routing logic is baked into the L7 protocol itself. 1.0 is a transfer protocol — each broker maps it to its own routing model underneath.

**Note** - Both protocols discussed here operate at **OSI Layer 7 (Application Layer)** — they run over TCP (Layer 4) and define their own framing, encoding, and application semantics on top of it. The distinction below is about scope *within* the application layer.


## ActiveMQ vs RabbitMQ — Design Decision Framework

Choose your Amazon MQ engine based on protocol requirements, delivery semantics and operational model.

### Protocol Support

| Protocol | Wire Format | Key Characteristics | Best For | ActiveMQ | RabbitMQ |
|---|---|---|---|---|---|---|
| **JMS** | API (not a wire protocol) | Java EE standard for messaging. Defines connection factories, destinations, message producers/consumers, and XA transactions. Under the wire it uses the broker's native protocol. | Spring / Jakarta EE apps, existing JMS investments | Native | Via AMQP bridge |
| **AMQP 1.0** | Binary, type system | Message transfer standard — defines how to exchange messages between peers, but leaves the routing model to the implementation. Each broker maps it to its own destinations. | Cross-platform, multi-broker topologies | Native | Native |
| **AMQP 0-9-1** | Binary, compact | Version 0.9.1 — not a predecessor of 1.0, but a separate fork. While the financial industry group stripped the spec down to a wire-level standard (1.0), RabbitMQ kept the rich routing model in the protocol itself: exchanges, queues, bindings, and flexible routing (direct, topic, fanout, headers, consistent hash). | Complex routing, polyglot environments | No | Native |
| **STOMP** | Text, frame-based | Simple, human-readable. Easy to debug (telnet). No routing model — sends to a destination string. | Quick scripts, non-JVM clients, prototyping | Plugin | Plugin |
| **MQTT** | Binary, ultra-lightweight | Pub-sub only, three QoS levels, persistent sessions, last-will. Minimal per-message overhead. | IoT, mobile, constrained devices | Plugin | Plugin |
| **OpenWire** | Binary, command set | ActiveMQ's native protocol. Full JMS feature set: XA, selectors, priority headers. Failover transport provides client-side HA. | JVM/Spring apps, HA requirements | Native | No |

### When to Choose ActiveMQ

- **You already use JMS.** ActiveMQ's native JMS support means zero protocol translation overhead. Spring JMS, `javax.jms`, and Jakarta JMS all work directly.
- **Priority-based messaging is a core requirement.** ActiveMQ's cursor-based priority dispatch with `sortedStore="true"` is more mature and configurable than RabbitMQ's `x-max-priority`.
- **You need XA transactions.** ActiveMQ supports JMS XA transactions for distributed transaction coordination across multiple resources.
- **Network of brokers topology.** If you need broker-to-broker message forwarding between regions or VPCs without application changes, ActiveMQ's network of brokers is straightforward to configure.
- **Wire-level protocol filtering.** ActiveMQ supports message selectors (SQL-based filtering on JMS properties) at the broker level, reducing consumer-side filtering.

### When to Choose RabbitMQ

- **You need AMQP 0-9-1.** RabbitMQ's native AMQP 0-9-1 gives you flexible routing with exchanges (direct, topic, fanout, headers, consistent hash). This enables complex routing topologies that are difficult to replicate with ActiveMQ.
- **Multi-language polyglot environment.** RabbitMQ's client libraries are well-maintained for Python, Go, Ruby, .NET, Node.js, and many others. ActiveMQ's non-JVM clients (STOMP, MQTT) are less polished.
- **Streaming use cases.** RabbitMQ 3.13+ includes the RabbitMQ Stream Plugin for large message streams with offset tracking, which ActiveMQ Classic does not provide.
- **Federation use cases.** RabbitMQ federation allows exchanges and queues in different regions to be connected with upstream/downstream relationships, supporting multi-region fan-out.
- **Graviton (ARM) cost optimisation.** RabbitMQ on `mq.m7g` Graviton instances benefits from Erlang's ARM optimisation, providing better price-performance than ActiveMQ on equivalent instances.
- **Smaller operational blast radius.** RabbitMQ 3-node cluster tolerates one node failure without manual intervention. ActiveMQ active/standby requires both healthy for HA.

### When to Use Neither (Pick SQS/SNS Instead)

- **Throughput exceeds 50,000 msg/sec:** Amazon MQ instance limits will require splitting across multiple brokers. SQS Standard scales to virtually unlimited throughput.
- **Cost is the primary constraint:** SQS Standard is 3-10x cheaper at scale.
- **Schedule-based or event-driven workloads:** EventBridge Scheduler or EventBridge Pipes integrate natively with SQS/SNS.
- **Lambda-native architectures:** SQS triggers Lambda directly. Amazon MQ requires Event Source Mapping (Lambda polling the broker) or an intermediary ECS service.
- **Exactly-once processing:** SQS FIFO provides exactly-once delivery within a message group. Amazon MQ provides at-least-once semantics.

### Decision Flowchart

```
Do you need JMS / XA transactions / wire-level message selectors?
├── Yes → ActiveMQ
└── No  → Do you need AMQP 0-9-1 / exchanges / complex routing / streams?
        ├── Yes → RabbitMQ
        └── No  → Can you use a fully-managed, protocol-agnostic service?
                  ├── Yes → SQS (queues) / SNS (pub-sub) / EventBridge (event bus)
                  └── No  → Amazon MQ (choose engine per criteria above)
```

---

## Amazon MQ vs Other AWS Messaging Services

When designing a system on AWS, Amazon MQ is rarely the only option. Here is how it compares to the alternatives.

| Attribute               | Amazon MQ (ActiveMQ)                                  | Amazon MQ (RabbitMQ)                       | Amazon SQS                                            | Amazon SNS                          | Amazon EventBridge                              | Amazon Kinesis / MSK                                |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- | ----------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| **Model**               | Message broker                                        | Message broker                             | Queue (pull)                                          | Pub-sub (push)                      | Event bus                                       | Stream / log                                        |
| **Protocol**            | JMS, OpenWire, AMQP, STOMP, MQTT                      | AMQP 0-9-1, AMQP 1.0, STOMP, MQTT          | HTTPS, SDK                                            | HTTPS, SDK, SQS, Lambda, SMS, Email | HTTPS, SDK                                      | SDK, Kafka protocol (MSK)                           |
| **Delivery**            | At-least-once, exactly-once (XA)                      | At-least-once                              | At-least-once (Standard), Exactly-once (FIFO)         | At-least-once                       | At-least-once                                   | At-least-once                                       |
| **Ordering**            | Per-queue (priority)                                  | Per-queue (priority)                       | Best-effort (Standard), Strict (FIFO)                 | None (best-effort)                  | None                                            | Per-shard                                           |
| **Throughput**          | Instance-limited                                      | Instance-limited                           | Virtually unlimited                                   | Virtually unlimited                 | Virtually unlimited                             | Very high                                           |
| **Latency**             | Sub-ms (same AZ)                                      | Sub-ms (same AZ)                           | 10-100ms                                              | 10-100ms                            | 10-100ms                                        | Sub-ms (same AZ)                                    |
| **Persistence**         | Configurable                                          | Configurable                               | 14 days (Standard), 14 days (FIFO)                    | Not persistent                      | 24 hours / archive                              | 7-365 days (Kinesis), Configurable (MSK)            |
| **Multi-region**        | Manual (network of brokers / shovel)                  | Manual (shovel / federation)               | Native (queues are regional, manual replication)      | Native (cross-region subscriptions) | Cross-region event buses                        | MSK MirrorMaker                                     |
| **Lambda trigger**      | Event Source Mapping                                  | Event Source Mapping                       | Native                                                | Native                              | Native                                          | Event Source Mapping                                |
| **Management overhead** | Low (AWS managed)                                     | Low (AWS managed)                          | Zero (fully managed)                                  | Zero (fully managed)                | Zero (fully managed)                            | Low (MSK managed)                                   |
| **Cost (at scale)**     | High (instance-based)                                 | High (instance-based)                      | Low (request-based)                                   | Low (request-based)                 | Low (event-based)                               | Moderate                                            |
| **Best for**            | Migrating existing brokers, JMS apps, priority queues | AMQP apps, complex routing, multi-language | Decoupling simple workloads, Lambda integration, FIFO | Broadcast notifications, fan-out    | SaaS integration, schema registry, event-driven | Real-time analytics, log aggregation, streaming ETL |

### When to Use Amazon MQ

- **Lift-and-shift migration.** You have existing ActiveMQ or RabbitMQ infrastructure and want to move to AWS without rewriting application code. Amazon MQ supports the same protocols and APIs.
- **JMS dependency.** Your application uses JMS APIs, XA transactions, or JMS message selectors. SQS does not support JMS.
- **Complex routing.** RabbitMQ's exchange-based routing (topic, headers, consistent hash) enables patterns that are verbose or impossible with SQS.
- **Priority queues.** ActiveMQ's priority dispatch is more sophisticated than SQS's per-message delay queue workaround.
- **Protocol flexibility.** You need STOMP, MQTT, or AMQP alongside JMS in the same broker.

### When NOT to Use Amazon MQ

- **Greenfield serverless architecture.** SQS + SNS + Lambda is simpler, cheaper and more scalable.
- **Very high throughput (> 50K msg/sec).** SQS scales to hundreds of thousands without instance upgrades.
- **Cost-sensitive workloads.** At scale, Amazon MQ's per-instance-hour pricing is significantly more expensive than SQS's per-request pricing.
- **Event-driven integrations.** EventBridge natively integrates with 200+ SaaS partners and AWS services. Amazon MQ requires custom consumers.
- **Exactly-once delivery.** SQS FIFO provides exactly-once in a message group. Amazon MQ requires XA transactions for the same guarantee.

---

### Key Flags Available on Amazon MQ

| Flag                               | Available on Amazon MQ  | Notes                                    |
| ---------------------------------- | ----------------------- | ---------------------------------------- |
| `prioritizedMessages="true"`       | Yes                     | Core priority flag                       |
| `sortedStore="true"`               | Yes                     | Recommended with persistence             |
| `optimizedDispatch="true"`         | Yes                     | Recommended for throughput               |
| `prefetchPerLevel`                 | Yes                     | Via `priorityQueueCursor` config         |
| `concurrentStoreAndDispatchQueues` | **No** — managed by AWS | Set correctly by AWS on 5.15.9+          |
| `<persistenceAdapter>` (KahaDB)    | **No**                  | Managed by AWS                           |
| `<transportConnectors>`            | **No**                  | Managed by AWS                           |
| `<networkConnectors>`              | **No**                  | Use Amazon MQ network of brokers feature |
| `<systemUsage>`                    | Partially               | Some memory settings accepted            |

### Recommended activemq.xml for Amazon MQ

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<broker xmlns="http://activemq.apache.org/schema/core"
        schedulePeriodForDestinationPurge="10000">

  <destinationPolicy>
    <policyMap>
      <policyEntries>

        <policyEntry queue="ORDERS.>"
                     prioritizedMessages="true"
                     optimizedDispatch="true"
                     gcInactiveDestinations="true"
                     inactiveTimoutBeforeGC="600000">
          <pendingQueuePolicy>
            <priorityQueueCursor sortedStore="true"/>
          </pendingQueuePolicy>
          <dispatchPolicy>
            <priorityDispatchPolicy/>
          </dispatchPolicy>
          <deadLetterStrategy>
            <individualDeadLetterStrategy
              queuePrefix="DLQ."
              useQueueForQueueMessages="true"/>
          </deadLetterStrategy>
        </policyEntry>

        <policyEntry queue=">"
                     gcInactiveDestinations="true"
                     inactiveTimoutBeforeGC="600000">
          <deadLetterStrategy>
            <sharedDeadLetterStrategy/>
          </deadLetterStrategy>
        </policyEntry>

      </policyEntries>
    </policyMap>
  </destinationPolicy>

  <plugins>
    <redeliveryPlugin fallbackToDeadLetter="true"
                      sendToDlqIfMaxRetriesExceeded="true">
      <redeliveryPolicyMap>
        <redeliveryPolicyMap>
          <defaultEntry>
            <redeliveryPolicy maximumRedeliveries="6"
                              initialRedeliveryDelay="1000"
                              useExponentialBackOff="true"
                              backOffMultiplier="2"/>
          </defaultEntry>
        </redeliveryPolicyMap>
      </redeliveryPolicyMap>
    </redeliveryPlugin>
  </plugins>

</broker>
```


## Amazon MQ Broker Engines and Instance Types

### Engine Versions

Amazon MQ supports ActiveMQ engine versions 5.15.x, 5.16.x, and 5.17.x (check the AWS documentation for the currently supported minor versions). Priority behaviour is consistent across these versions, though 5.17.x includes cursor improvements that make priority sorting slightly more efficient under high load.

### Deployment Modes

| Mode                    | Description                                       | Priority Behaviour                                     |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Single-instance broker  | One broker, no HA                                 | Standard priority support                              |
| Active/standby broker   | Two brokers across AZs, shared Amazon EFS storage | Priority state preserved on failover                   |
| Active/standby with NFS | Same, using NFS-backed Amazon EFS                 | Identical — failover is transparent to priority cursor |

**Active/standby is the production-recommended deployment.** On failover, the standby broker reads the same underlying store (Amazon EFS) as the failed active broker. Priority ordering is preserved because the KahaDB journal on EFS is intact — the standby replays it in priority order provided `sortedStore="true"` is configured.

### Instance Types

Amazon MQ offers `mq.m5.large`, `mq.m5.xlarge`, `mq.m5.2xlarge`, `mq.m5.4xlarge` and `mq.m4.*` sizes. For priority-heavy workloads:

- `mq.m5.large` — suitable for low-throughput priority queues (< 5,000 msg/sec)
- `mq.m5.xlarge` — general production use with priority enabled
- `mq.m5.2xlarge` and above — deep queues (> 500K messages) with multiple priority levels, or high-throughput mixed-priority workloads

Priority sorting is CPU-bound during burst periods. Under-sizing the instance class is a common cause of priority dispatch latency at scale.

#### ActiveMQ Priority Queues

ActiveMQ handles priority through **cursor-based dispatch**, fundamentally different from RabbitMQ's enqueue-time sorting. Each consumer has a dispatch cursor that walks the queue in priority order. Messages are sorted on dispatch, not on receipt.

- **Priority levels:** 0–9 per JMS spec (0 lowest, 9 highest). Default is 4. More levels increase cursor overhead — practical range is 3–5 tiers.
- **`prioritizedMessages="true"`** — enables priority dispatch on a destination policy entry. Without this flag, priority headers are ignored.
- **`sortedStore="true"`** — the priority queue cursor reads from the persistent store (KahaDB) in priority order rather than FIFO. Without it, only in-memory messages are sorted.
- **`optimizedDispatch="true"`** — dispatches messages as soon as they arrive rather than waiting for a full batch. Recommended for priority queues.
- **`concurrentStoreAndDispatchQueues`** — when disabled (which Amazon MQ enforces on 5.15.9+), the broker waits for the store to commit before dispatching, preventing priority inversion during failover.

Configuring ActiveMQ priority is done through broker XML policy entries — not per-queue arguments like RabbitMQ:

```xml
<!-- Applied to a destination policy entry, not per queue -->
<policyEntry queue="ORDERS.>"
             prioritizedMessages="true"
             optimizedDispatch="true">
  <pendingQueuePolicy>
    <priorityQueueCursor sortedStore="true"/>
  </pendingQueuePolicy>
  <dispatchPolicy>
    <priorityDispatchPolicy/>
  </dispatchPolicy>
</policyEntry>
```

Delivering priority messages from the producer requires no broker-side setup if the destination policy is configured — the `JMSPriority` header on the JMS message is honoured automatically:

```java
// Producer — broker sorts by this value on dispatch
Message msg = session.createTextMessage("order");
msg.setJMSPriority(9);   // 0–9, 9 = highest
producer.send(msg);
```

The one client-side requirement is `ExplicitQosEnabled=true` in Spring JMS — without it, `JMSPriority` is silently dropped from the wire frame.

**Priority starvation** — high-priority messages arriving continuously can starve lower-priority ones indefinitely. ActiveMQ provides no built-in aging mechanism. Mitigate with the multi-queue tier pattern: separate physical queues per priority tier, each with its own consumer pool.

### RabbitMQ Engine

Amazon MQ also supports RabbitMQ (3.13+), which uses a fundamentally different architecture from ActiveMQ.

#### Deployment Architecture

| Mode            | Nodes | Storage | Load Balancing        | HA Mechanism                   |
| --------------- | ----- | ------- | --------------------- | ------------------------------ |
| Single-instance | 1     | EBS     | NLB (static endpoint) | None (replaced on failure)     |
| Cluster         | 3     | EBS     | NLB (static endpoint) | Classic mirroring across 3 AZs |

RabbitMQ cluster mode provisions three broker nodes across three Availability Zones behind a Network Load Balancer. The NLB provides a static endpoint that survives instance replacement — your clients never need to update connection strings on infrastructure events.

**Cluster HA defaults:** Amazon MQ creates a default system policy that sets `ha-mode=all` and `ha-sync-mode=automatic`. Every queue is mirrored to all three nodes. Do not delete this policy — Amazon MQ automatically recreates it if removed. Custom policies you add will have HA properties overridden by Amazon MQ.

**AZ outage handling:** If an AZ fails, Amazon MQ relocates the affected node to a healthy AZ to maintain cluster size. After the outage resolves, the cluster automatically rebalances across AZs.

**Maintenance behaviour:** Amazon MQ performs cluster maintenance one node at a time, keeping at least two running. Each node restart severs its client connections — your clients must support automatic reconnection. When a node rejoins, mirrored queues synchronise, which blocks all other queue operations during sync. Keep queues short to reduce sync time during maintenance windows.

#### RabbitMQ Priority Queues

RabbitMQ supports priority queues via the `x-max-priority` queue argument (0–255, but practical range is 0–10). Unlike ActiveMQ's cursor-based priority dispatch, RabbitMQ sorts messages within the queue on enqueue. This has different performance characteristics:

- **Enqueue overhead:** Each message insertion into a priority queue is O(log n) — non-trivial for deep queues
- **No broker-level `sortedStore` equivalent:** RabbitMQ handles priority in-memory; persistence is through EBS
- **Recommended max priority levels:** 5 or fewer. More levels increase sorting overhead without proportional benefit
- **Use a single priority queue per consumer group:** Multiple priority queues competing for the same consumer negate the ordering benefit

```bash
# Declare a priority queue via the RabbitMQ management plugin or AMQP client
# Max priority = 10
rabbitmqadmin declare queue name=orders.priority \
  arguments='{"x-max-priority": 10}'
```

**Priority starvation** exists in RabbitMQ too — high-priority messages can block lower ones indefinitely. Mitigation is similar to ActiveMQ: use separate queues per priority tier and dedicate consumers to each.

#### RabbitMQ Plugins on Amazon MQ

Amazon MQ includes these RabbitMQ plugins out of the box:

- **Management plugin** — web UI and HTTP API (port 15672, accessible via the broker console URL)
- **Shovel** — unidirectional message transfer between brokers (cross-region, cross-account)
- **Federation** — upstream/downstream exchange and queue federation (distributed fan-out)
- **Consistent hash exchange** — exchange type that routes messages to queues based on consistent hashing

Custom plugins are not supported on Amazon MQ for RabbitMQ.

#### RabbitMQ Instance Types

Amazon MQ offers `mq.m5.*` and `mq.m7g.*` instance families for RabbitMQ. The Graviton-based `mq.m7g` series (e.g. `mq.m7g.large`, `mq.m7g.xlarge`) provides better price-performance for RabbitMQ workloads due to ARM-native optimisations in the Erlang runtime.

- `mq.m5.large` / `mq.m7g.large` — dev/test, low-throughput (< 3,000 msg/sec)
- `mq.m5.xlarge` / `mq.m7g.xlarge` — production, moderate throughput
- `mq.m5.2xlarge` / `mq.m7g.2xlarge` — high-throughput with mirrored queues and priority

---

## Configuring Priority on Amazon MQ

### The Broker Configuration Resource

Amazon MQ uses a **configuration** resource — an XML document in ActiveMQ format — that is applied to brokers. You do not SSH into the broker and edit `activemq.xml`. Instead:

1. Create or update a configuration via the Console, AWS CLI, or CloudFormation
2. Apply the configuration to a broker (requires a broker reboot for most changes)
3. Amazon MQ validates the XML before applying it

**Unsupported elements:** Amazon MQ restricts certain XML elements for security and operational reasons. The following are not available in Amazon MQ configurations: `<transportConnectors>` (managed by AWS), `<networkConnectors>` (use the network of brokers feature in the console), `<persistenceAdapter>` (KahaDB settings are not exposed), `<systemUsage>` memory settings (partially restricted), `<jetty>` and web console customisation.

### Priority Configuration via AWS CLI

```bash
# 1. Create a new configuration
aws mq create-configuration \
  --name "priority-config" \
  --engine-type ACTIVEMQ \
  --engine-version "5.17.6" \
  --region ap-southeast-2

# 2. The response includes a ConfigurationId and an S3-like revision system
# Get the current configuration data
aws mq describe-configuration-revision \
  --configuration-id "c-xxxx-xxxx-xxxx" \
  --configuration-revision 1 \
  --region ap-southeast-2

# 3. Update the configuration with your XML
aws mq update-configuration \
  --configuration-id "c-xxxx-xxxx-xxxx" \
  --data "$(base64 < priority-activemq.xml)" \
  --description "Enable priority for ORDERS queues" \
  --region ap-southeast-2

# 4. Apply the configuration to the broker (triggers reboot at next maintenance window,
#    or immediately if you pass --apply-immediately in update-broker)
aws mq update-broker \
  --broker-id "b-xxxx-xxxx-xxxx" \
  --configuration Id="c-xxxx-xxxx-xxxx",Revision=2 \
  --region ap-southeast-2
```

### Minimal Priority Configuration XML

This is the XML you upload as the broker configuration. It only includes elements Amazon MQ accepts:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<broker xmlns="http://activemq.apache.org/schema/core"
        schedulePeriodForDestinationPurge="10000">

  <destinationPolicy>
    <policyMap>
      <policyEntries>

        <!-- Priority-enabled queues under ORDERS.> -->
        <policyEntry queue="ORDERS.>"
                     prioritizedMessages="true"
                     optimizedDispatch="true"
                     gcInactiveDestinations="true"
                     inactiveTimoutBeforeGC="600000">
          <pendingQueuePolicy>
            <priorityQueueCursor sortedStore="true"/>
          </pendingQueuePolicy>
          <dispatchPolicy>
            <priorityDispatchPolicy/>
          </dispatchPolicy>
          <deadLetterStrategy>
            <individualDeadLetterStrategy queuePrefix="DLQ."
                                           useQueueForQueueMessages="true"/>
          </deadLetterStrategy>
        </policyEntry>

        <!-- Priority-enabled queues under ALERTS.> -->
        <policyEntry queue="ALERTS.>"
                     prioritizedMessages="true"
                     optimizedDispatch="true">
          <pendingQueuePolicy>
            <priorityQueueCursor sortedStore="true"/>
          </pendingQueuePolicy>
          <dispatchPolicy>
            <priorityDispatchPolicy/>
          </dispatchPolicy>
        </policyEntry>

        <!-- Default policy for all other queues (no priority) -->
        <policyEntry queue=">"
                     gcInactiveDestinations="true"
                     inactiveTimoutBeforeGC="600000">
          <deadLetterStrategy>
            <sharedDeadLetterStrategy/>
          </deadLetterStrategy>
        </policyEntry>

      </policyEntries>
    </policyMap>
  </destinationPolicy>

  <plugins>
    <redeliveryPlugin fallbackToDeadLetter="true"
                      sendToDlqIfMaxRetriesExceeded="true">
      <redeliveryPolicyMap>
        <redeliveryPolicyMap>
          <defaultEntry>
            <redeliveryPolicy maximumRedeliveries="6"
                              initialRedeliveryDelay="1000"
                              useExponentialBackOff="true"
                              backOffMultiplier="2"/>
          </defaultEntry>
        </redeliveryPolicyMap>
      </redeliveryPolicyMap>
    </redeliveryPlugin>
  </plugins>

</broker>
```

**Note on `<persistenceAdapter>`:** You cannot include this in an Amazon MQ configuration. AWS manages KahaDB internally. The important setting `concurrentStoreAndDispatchQueues="false"` — which is critical for correct priority behaviour in self-hosted ActiveMQ — is **set by Amazon MQ by default** for brokers running 5.15.9+ and 5.16.x+. Verify this in the broker logs if you are on an older engine version.

### CloudFormation

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Resources:
  MQBrokerConfig:
    Type: AWS::AmazonMQ::Configuration
    Properties:
      Name: priority-orders-config
      EngineType: ACTIVEMQ
      EngineVersion: "5.17.6"
      Data: !Base64 |
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <broker xmlns="http://activemq.apache.org/schema/core">
          <destinationPolicy>
            <policyMap>
              <policyEntries>
                <policyEntry queue="ORDERS.>"
                             prioritizedMessages="true"
                             optimizedDispatch="true">
                  <pendingQueuePolicy>
                    <priorityQueueCursor sortedStore="true"/>
                  </pendingQueuePolicy>
                  <dispatchPolicy>
                    <priorityDispatchPolicy/>
                  </dispatchPolicy>
                </policyEntry>
              </policyEntries>
            </policyMap>
          </destinationPolicy>
        </broker>

  MQBroker:
    Type: AWS::AmazonMQ::Broker
    Properties:
      BrokerName: priority-broker
      DeploymentMode: ACTIVE_STANDBY_MULTI_AZ
      EngineType: ACTIVEMQ
      EngineVersion: "5.17.6"
      HostInstanceType: mq.m5.xlarge
      PubliclyAccessible: false
      SubnetIds:
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB
      SecurityGroups:
        - !Ref BrokerSecurityGroup
      Configuration:
        Id: !Ref MQBrokerConfig
        Revision: !GetAtt MQBrokerConfig.Revision
      MaintenanceWindowStartTime:
        DayOfWeek: SUNDAY
        TimeOfDay: "02:00"
        TimeZone: Australia/Sydney
      Users:
        - Username: !Sub "{{resolve:secretsmanager:${MQSecret}:SecretString:username}}"
          Password: !Sub "{{resolve:secretsmanager:${MQSecret}:SecretString:password}}"
          Groups:
            - admin
      Logs:
        General: true
        Audit: true
      EncryptionOptions:
        KmsKeyId: !Ref MQKmsKey
        UseAwsOwnedKey: false

  MQSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: /mq/priority-broker/credentials
      GenerateSecretString:
        SecretStringTemplate: '{"username": "mqadmin"}'
        GenerateStringKey: password
        PasswordLength: 32
        ExcludeCharacters: '"@/\'

  MQKmsKey:
    Type: AWS::KMS::Key
    Properties:
      Description: KMS key for Amazon MQ broker encryption
      EnableKeyRotation: true
```

---

## VPC Networking and Security

### Amazon MQ is VPC-Only for Production

`PubliclyAccessible: false` is strongly recommended. Amazon MQ brokers in a VPC are only reachable from within the VPC, from VPC-peered networks, or via AWS PrivateLink.

### Security Group Rules

The broker requires inbound rules for the protocols you use:

```hcl
# Terraform example
resource "aws_security_group_rule" "mq_openwire" {
  type              = "ingress"
  from_port         = 61617   # OpenWire over TLS (Amazon MQ enforces TLS)
  to_port           = 61617
  protocol          = "tcp"
  security_group_id = aws_security_group.mq_broker.id
  source_security_group_id = aws_security_group.app_servers.id
  description       = "OpenWire TLS from app servers"
}

resource "aws_security_group_rule" "mq_stomp" {
  type              = "ingress"
  from_port         = 61614   # STOMP over TLS
  to_port           = 61614
  protocol          = "tcp"
  security_group_id = aws_security_group.mq_broker.id
  source_security_group_id = aws_security_group.app_servers.id
}

resource "aws_security_group_rule" "mq_amqp" {
  type              = "ingress"
  from_port         = 5671    # AMQP over TLS
  to_port           = 5671
  protocol          = "tcp"
  security_group_id = aws_security_group.mq_broker.id
  source_security_group_id = aws_security_group.app_servers.id
}

resource "aws_security_group_rule" "mq_console" {
  type              = "ingress"
  from_port         = 8162    # Web console over HTTPS (443 in some versions)
  to_port           = 8162
  protocol          = "tcp"
  security_group_id = aws_security_group.mq_broker.id
  source_security_group_id = aws_security_group.bastion.id
  description       = "Web console from bastion only"
}
```

**Amazon MQ enforces TLS** — plaintext ports (61616, 61613, 5672) are not available. Clients must connect on TLS ports.

### Broker Endpoints

Amazon MQ provides endpoints for each protocol. For active/standby brokers, there are two sets (primary and standby). Use the failover URL in your client:

```java
// OpenWire — failover across primary and standby
String brokerUrl =
  "failover:(ssl://b-xxxx-1.mq.ap-southeast-2.amazonaws.com:61617," +
             "ssl://b-xxxx-2.mq.ap-southeast-2.amazonaws.com:61617)" +
  "?maxReconnectDelay=5000&useExponentialBackOff=true";

ActiveMQSslConnectionFactory factory = new ActiveMQSslConnectionFactory(brokerUrl);
factory.setUserName(username);
factory.setPassword(password);
```

Retrieve the credentials from AWS Secrets Manager at runtime rather than hardcoding them:

```java
// Retrieve credentials from Secrets Manager
SecretsManagerClient sm = SecretsManagerClient.builder()
    .region(Region.AP_SOUTHEAST_2)
    .build();

GetSecretValueResponse secret = sm.getSecretValue(
    GetSecretValueRequest.builder()
        .secretId("/mq/priority-broker/credentials")
        .build());

JsonNode creds = new ObjectMapper().readTree(secret.secretString());
factory.setUserName(creds.get("username").asText());
factory.setPassword(creds.get("password").asText());
```

### IAM Permissions for Amazon MQ Management

IAM controls the management plane (creating brokers, updating configurations, reading logs) but not the messaging plane (sending/receiving messages — that uses broker-level user credentials).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MQBrokerManagement",
      "Effect": "Allow",
      "Action": [
        "mq:DescribeBroker",
        "mq:UpdateBroker",
        "mq:RebootBroker",
        "mq:DescribeConfiguration",
        "mq:UpdateConfiguration",
        "mq:CreateConfiguration",
        "mq:ListConfigurations"
      ],
      "Resource": "arn:aws:mq:ap-southeast-2:123456789012:broker:priority-broker:*"
    },
    {
      "Sid": "MQSecretsAccess",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:ap-southeast-2:123456789012:secret:/mq/*"
    },
    {
      "Sid": "MQLogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:ap-southeast-2:123456789012:log-group:/aws/amazonmq/broker/*"
    }
  ]
}
```

---

## Monitoring Priority Queues on AWS

### CloudWatch Metrics

Amazon MQ publishes broker and queue-level metrics to CloudWatch automatically. There is no per-priority-level CloudWatch metric — depth is reported at the queue level.

**Key metrics for priority queue health:**

| Metric              | Namespace      | Dimension         | What to Watch                                                  |
| ------------------- | -------------- | ----------------- | -------------------------------------------------------------- |
| `QueueSize`         | `AWS/AmazonMQ` | `Queue`, `Broker` | Total pending messages. Growth indicates consumer lag.         |
| `EnqueueCount`      | `AWS/AmazonMQ` | `Queue`, `Broker` | Messages entering per period.                                  |
| `DequeueCount`      | `AWS/AmazonMQ` | `Queue`, `Broker` | Messages leaving per period.                                   |
| `DispatchCount`     | `AWS/AmazonMQ` | `Queue`, `Broker` | Messages dispatched (not yet acked).                           |
| `ExpiredCount`      | `AWS/AmazonMQ` | `Queue`, `Broker` | Messages expired due to TTL — indicates starvation risk.       |
| `MemoryUsage`       | `AWS/AmazonMQ` | `Broker`          | Broker heap usage — spikes during deep priority queue sorting. |
| `StorePercentUsage` | `AWS/AmazonMQ` | `Broker`          | KahaDB disk usage on EFS — alert at 70%.                       |
| `HeapUsage`         | `AWS/AmazonMQ` | `Broker`          | JVM heap — alert at 80%.                                       |

### CloudWatch Alarms

```bash
# Alert when ORDERS queue depth exceeds 10,000 (possible starvation of low-priority)
aws cloudwatch put-metric-alarm \
  --alarm-name "MQ-ORDERS-QueueDepthHigh" \
  --alarm-description "ORDERS queue depth above 10000 — check for priority starvation" \
  --namespace "AWS/AmazonMQ" \
  --metric-name "QueueSize" \
  --dimensions Name=Broker,Value=priority-broker Name=Queue,Value=ORDERS \
  --statistic Maximum \
  --period 60 \
  --threshold 10000 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 3 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:mq-alerts" \
  --region ap-southeast-2

# Alert on high heap usage (risk of OOM during sorting of deep priority queue)
aws cloudwatch put-metric-alarm \
  --alarm-name "MQ-BrokerHeapHigh" \
  --alarm-description "Amazon MQ broker heap above 80%" \
  --namespace "AWS/AmazonMQ" \
  --metric-name "HeapUsage" \
  --dimensions Name=Broker,Value=priority-broker \
  --statistic Average \
  --period 60 \
  --threshold 80 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:mq-alerts" \
  --region ap-southeast-2

# Alert when DLQ accumulates (failed priority messages piling up)
aws cloudwatch put-metric-alarm \
  --alarm-name "MQ-DLQ-ORDERS-Growing" \
  --alarm-description "DLQ for ORDERS has messages — review failed priority messages" \
  --namespace "AWS/AmazonMQ" \
  --metric-name "QueueSize" \
  --dimensions Name=Broker,Value=priority-broker Name=Queue,Value=DLQ.ORDERS \
  --statistic Maximum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:mq-alerts" \
  --region ap-southeast-2
```

### CloudWatch Dashboard (CDK)

```typescript
import * as cw from "aws-cdk-lib/aws-cloudwatch";

const dashboard = new cw.Dashboard(this, "MQPriorityDashboard", {
  dashboardName: "AmazonMQ-Priority-Health",
});

dashboard.addWidgets(
  new cw.GraphWidget({
    title: "Queue Depth by Queue",
    left: [
      new cw.Metric({
        namespace: "AWS/AmazonMQ",
        metricName: "QueueSize",
        dimensionsMap: { Broker: "priority-broker", Queue: "ORDERS" },
        label: "ORDERS",
        statistic: "Maximum",
        period: Duration.minutes(1),
      }),
      new cw.Metric({
        namespace: "AWS/AmazonMQ",
        metricName: "QueueSize",
        dimensionsMap: { Broker: "priority-broker", Queue: "DLQ.ORDERS" },
        label: "DLQ.ORDERS",
        statistic: "Maximum",
        period: Duration.minutes(1),
      }),
    ],
  }),
  new cw.GraphWidget({
    title: "Broker Resource Usage",
    left: [
      new cw.Metric({
        namespace: "AWS/AmazonMQ",
        metricName: "HeapUsage",
        dimensionsMap: { Broker: "priority-broker" },
        label: "Heap %",
        statistic: "Average",
        period: Duration.minutes(1),
      }),
      new cw.Metric({
        namespace: "AWS/AmazonMQ",
        metricName: "StorePercentUsage",
        dimensionsMap: { Broker: "priority-broker" },
        label: "Store %",
        statistic: "Maximum",
        period: Duration.minutes(1),
      }),
    ],
  }),
);
```

### Broker Logs in CloudWatch Logs

Enable general and audit logs on the broker. Logs land in `/aws/amazonmq/broker/<broker-id>/general` and `.../audit`.

Priority-related log entries to watch for:

```
# Message expired before dispatch (TTL starvation)
WARN | Message ... expired (JMSExpiration exceeded)

# Store reaching capacity (triggers flow control)
WARN | Usage Manager Memory Limit reached

# Dispatch blocked (consumer not keeping up)
WARN | 1 messages dispatched but not acknowledged
```

Query logs with CloudWatch Insights:

```
# Find expired messages by priority queue
fields @timestamp, @message
| filter @logStream like /general/
| filter @message like /expired/
| filter @message like /ORDERS/
| sort @timestamp desc
| limit 100
```

---

## Connecting from AWS Services

### From Amazon ECS / EKS (Fargate or EC2)

The most common pattern on AWS. The task or pod runs in the same VPC as the broker.

```java
// ECS task — credentials injected via Secrets Manager at task startup
// or retrieved at runtime via SDK (preferred for rotation)

@Configuration
public class AmazonMQConfig {

    @Value("${MQ_BROKER_URL}")  // Injected as ECS environment variable
    private String brokerUrl;

    @Bean
    public ActiveMQSslConnectionFactory connectionFactory(
            @Value("${MQ_SECRET_ARN}") String secretArn) {

        SecretsManagerClient sm = SecretsManagerClient.builder()
            .region(Region.of(System.getenv("AWS_REGION")))
            .build();

        JsonNode creds = new ObjectMapper().readTree(
            sm.getSecretValue(r -> r.secretId(secretArn)).secretString());

        ActiveMQSslConnectionFactory factory =
            new ActiveMQSslConnectionFactory(brokerUrl);
        factory.setUserName(creds.get("username").asText());
        factory.setPassword(creds.get("password").asText());

        // Low prefetch for priority correctness
        ActiveMQPrefetchPolicy prefetch = new ActiveMQPrefetchPolicy();
        prefetch.setQueuePrefetch(10);
        factory.setPrefetchPolicy(prefetch);

        return factory;
    }

    @Bean
    public JmsTemplate jmsTemplate(ConnectionFactory cf) {
        JmsTemplate t = new JmsTemplate(cf);
        t.setExplicitQosEnabled(true);  // Required to honour JMSPriority
        t.setDeliveryPersistent(true);
        return t;
    }
}
```

### From AWS Lambda

Lambda is not ideal for Amazon MQ consumers because Lambda's stateless execution model does not support long-lived JMS connections. However, you can use Lambda to **produce** priority messages:

```python
import boto3, json, ssl, stomp, os

def handler(event, context):
    # Retrieve credentials
    sm = boto3.client('secretsmanager', region_name=os.environ['AWS_REGION'])
    creds = json.loads(sm.get_secret_value(
        SecretId=os.environ['MQ_SECRET_ARN'])['SecretString'])

    # Connect via STOMP over TLS
    conn = stomp.Connection(
        host_and_ports=[(os.environ['MQ_STOMP_HOST'], 61614)],
        use_ssl=True,
        ssl_version=ssl.PROTOCOL_TLSv1_2
    )
    conn.connect(creds['username'], creds['password'], wait=True)

    # Send with priority
    priority = 9 if event.get('vip') else 4
    conn.send(
        destination='/queue/ORDERS',
        body=json.dumps(event['order']),
        headers={'priority': str(priority), 'content-type': 'application/json'}
    )
    conn.disconnect()
```

For **consuming** from Amazon MQ in a Lambda-driven architecture, use an intermediary: an ECS service consumes from Amazon MQ and produces to SQS or EventBridge. Lambda then processes the SQS messages. This avoids the connection lifecycle problem.

Alternatively, Lambda can consume directly from Amazon MQ via **Event Source Mapping** (supported for both ActiveMQ and RabbitMQ). Lambda manages a long-lived polling process that reads messages from the broker and invokes your function synchronously. This removes the need for an intermediary but has caveats:

- Lambda scales concurrency up to the number of queues and partitions. Each function instance processes one batch of messages.
- Partial batch failures are reported back to the broker — successfully processed messages are removed, failed ones remain for redelivery.
- The event source mapping supports both ActiveMQ queues and RabbitMQ queues/exchanges.
- Maximum batch size is 10,000 messages per invocation.
- Function timeout must be sufficient to process the entire batch (max 15 minutes).

```yaml
# CloudFormation — Lambda event source mapping for Amazon MQ
LambdaMQEventSourceMapping:
  Type: AWS::Lambda::EventSourceMapping
  Properties:
    EventSourceArn: !Ref MQBrokerArn # ARN of the ActiveMQ or RabbitMQ broker
    FunctionName: !Ref ConsumerFunction
    Enabled: true
    BatchSize: 100
    MaximumBatchingWindowInSeconds: 5
    SourceAccessConfigurations:
      - Type: BASIC_AUTH
        URI: !Sub "{{resolve:secretsmanager:${MQSecret}:SecretString:username}}"
```

**Important:** Lambda event source mapping for Amazon MQ is suitable for moderate-throughput workloads. For high-throughput consumers (> 1,000 msg/sec), use a long-lived consumer (ECS, EKS, EC2) instead — Lambda's polling interval and cold-start latency add overhead.

### From Amazon EC2

Standard JMS connection. Use an instance profile to access Secrets Manager instead of hardcoding credentials:

```bash
# EC2 instance profile policy (attach to EC2 IAM role)
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:ap-southeast-2:123456789012:secret:/mq/*"
}
```

---

## Priority Starvation on Amazon MQ

### The Starvation Problem

When high-priority messages arrive faster than consumers process them, low-priority messages queue up behind them indefinitely. On Amazon MQ you cannot implement broker-side TTL escalation via a Camel route (Camel is not available in Amazon MQ). Mitigation strategies differ from self-hosted deployments.

### Mitigation on Amazon MQ

**Multi-queue tier pattern (recommended):**

Route messages to separate physical queues based on priority tier. This is the cleanest approach and avoids broker-level priority sorting entirely:

```java
public void sendOrder(Order order) {
    String destination = switch (order.getPriorityTier()) {
        case VIP      -> "ORDERS.P9";
        case EXPRESS  -> "ORDERS.P7";
        case STANDARD -> "ORDERS.P4";
        case BULK     -> "ORDERS.P1";
    };
    jmsTemplate.convertAndSend(destination, order);
}
```

Separate ECS task definitions or consumer thread pools subscribe to each queue. Low-priority consumers are never blocked by high-priority traffic.

**ECS-based escalation service:**

A lightweight ECS service monitors queue depth via CloudWatch and re-enqueues aged low-priority messages at a higher priority:

```python
# Runs as an ECS scheduled task or always-on service
import boto3, time

cw = boto3.client('cloudwatch', region_name='ap-southeast-2')

def check_starvation(queue_name, threshold_seconds=300):
    # CloudWatch does not give per-message age; use approximate approach:
    # if queue depth is non-zero and dequeue rate is near zero, flag as starved
    depth = get_metric('QueueSize', queue_name)
    dequeue = get_metric('DequeueCount', queue_name)
    if depth > 100 and dequeue < 1:
        # Trigger escalation — re-enqueue with higher priority via JMS
        escalate_queue(queue_name)
```

**TTL-based natural expiry:**

Set a message TTL on low-priority producers. Messages that are not consumed within the TTL expire and go to the DLQ rather than blocking forever. The DLQ can be processed separately.

```java
jmsTemplate.send("ORDERS", session -> {
    Message msg = session.createObjectMessage(order);
    msg.setJMSPriority(1);
    msg.setJMSExpiration(System.currentTimeMillis() + 86_400_000); // 24h
    return msg;
});
```

---

## Redelivery and Dead Letter Queue

### Configuration

Amazon MQ supports redelivery plugin configuration:

```xml
<plugins>
  <redeliveryPlugin fallbackToDeadLetter="true"
                    sendToDlqIfMaxRetriesExceeded="true">
    <redeliveryPolicyMap>
      <redeliveryPolicyMap>
        <!-- High-priority: fast retry, fewer attempts -->
        <redeliveryPolicyEntries>
          <redeliveryPolicy queue="ORDERS.P9"
                            maximumRedeliveries="3"
                            initialRedeliveryDelay="500"
                            useExponentialBackOff="true"
                            backOffMultiplier="2"/>
        </redeliveryPolicyEntries>
        <!-- Default: slower retry, more attempts -->
        <defaultEntry>
          <redeliveryPolicy maximumRedeliveries="6"
                            initialRedeliveryDelay="2000"
                            useExponentialBackOff="true"
                            backOffMultiplier="2"/>
        </defaultEntry>
      </redeliveryPolicyMap>
    </redeliveryPolicyMap>
  </redeliveryPlugin>
</plugins>
```

### DLQ Monitoring with SNS

Wire the DLQ CloudWatch alarm to an SNS topic for immediate notification when critical failed messages accumulate:

```bash
aws sns create-topic --name mq-dlq-alerts --region ap-southeast-2

aws cloudwatch put-metric-alarm \
  --alarm-name "MQ-DLQ-P9-Critical" \
  --namespace "AWS/AmazonMQ" \
  --metric-name "QueueSize" \
  --dimensions Name=Broker,Value=priority-broker Name=Queue,Value=DLQ.ORDERS.P9 \
  --statistic Maximum \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions "arn:aws:sns:ap-southeast-2:123456789012:mq-dlq-alerts" \
  --treat-missing-data notBreaching \
  --region ap-southeast-2
```

---

## Spring JMS on AWS

### Dependencies

```xml
<!-- pom.xml -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-activemq</artifactId>
  </dependency>
  <dependency>
    <groupId>org.apache.activemq</groupId>
    <artifactId>activemq-broker</artifactId>
  </dependency>
  <!-- AWS SDK for Secrets Manager -->
  <dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>secretsmanager</artifactId>
    <version>2.25.0</version>
  </dependency>
</dependencies>
```

### Configuration

```java
@Configuration
public class AmazonMQPriorityConfig {

    @Bean
    public ActiveMQSslConnectionFactory connectionFactory(
            SecretsManagerClient secretsClient,
            @Value("${MQ_BROKER_FAILOVER_URL}") String brokerUrl,
            @Value("${MQ_SECRET_ARN}") String secretArn) throws Exception {

        JsonNode creds = new ObjectMapper().readTree(
            secretsClient.getSecretValue(r -> r.secretId(secretArn))
                         .secretString());

        ActiveMQSslConnectionFactory factory =
            new ActiveMQSslConnectionFactory(brokerUrl);
        factory.setUserName(creds.get("username").asText());
        factory.setPassword(creds.get("password").asText());

        // Priority correctness: low prefetch
        ActiveMQPrefetchPolicy prefetch = new ActiveMQPrefetchPolicy();
        prefetch.setQueuePrefetch(10);
        factory.setPrefetchPolicy(prefetch);

        // Reconnect policy for active/standby failover
        factory.setUseExponentialBackOffReconnect(true);
        factory.setMaxReconnectDelay(10000);

        return factory;
    }

    @Bean
    public JmsTemplate priorityJmsTemplate(ActiveMQSslConnectionFactory cf) {
        JmsTemplate t = new JmsTemplate(cf);
        t.setExplicitQosEnabled(true);   // Must be true for JMSPriority to be sent
        t.setDeliveryPersistent(true);
        t.setPriority(4);               // Default; override per message
        return t;
    }

    @Bean
    public DefaultJmsListenerContainerFactory jmsListenerContainerFactory(
            ActiveMQSslConnectionFactory cf) {
        DefaultJmsListenerContainerFactory factory =
            new DefaultJmsListenerContainerFactory();
        factory.setConnectionFactory(cf);
        factory.setConcurrency("3-10");
        factory.setSessionTransacted(true);
        factory.setSessionAcknowledgeMode(Session.SESSION_TRANSACTED);
        return factory;
    }
}
```

### Producer — Sending with Priority

```java
@Service
public class OrderProducer {

    @Autowired private JmsTemplate priorityJmsTemplate;

    public void sendOrder(Order order) {
        int priority = resolvePriority(order);
        priorityJmsTemplate.send("ORDERS", session -> {
            ObjectMessage msg = session.createObjectMessage(order);
            msg.setJMSPriority(priority);
            msg.setStringProperty("orderType", order.getType());
            return msg;
        });
    }

    private int resolvePriority(Order order) {
        if (order.isVip())            return 9;
        if (order.isExpressShipping()) return 7;
        if (order.isBulk())           return 1;
        return 4;
    }
}
```

### Consumer

```java
@Component
public class OrderConsumer {

    @JmsListener(destination = "ORDERS",
                 containerFactory = "jmsListenerContainerFactory")
    public void handleOrder(Message message) throws JMSException {
        int priority = message.getJMSPriority();
        // The broker has already sorted; log for observability
        log.info("Processing order priority={}", priority);

        if (message instanceof ObjectMessage om) {
            Order order = (Order) om.getObject();
            processOrder(order);
        }
    }
}
```

---

## Performance Characteristics on Amazon MQ

### Instance Sizing vs Priority Overhead

| Instance        | Throughput (no priority) | Throughput (priority, 3 levels) | Notes                          |
| --------------- | ------------------------ | ------------------------------- | ------------------------------ |
| `mq.m5.large`   | ~5,000 msg/sec           | ~3,500–4,250 msg/sec            | Fine for moderate workloads    |
| `mq.m5.xlarge`  | ~15,000 msg/sec          | ~11,000–13,500 msg/sec          | Standard production choice     |
| `mq.m5.2xlarge` | ~30,000 msg/sec          | ~22,000–27,000 msg/sec          | High-volume priority workloads |

Figures are approximate and vary with message size, persistence settings, and consumer prefetch.

### EFS Latency Impact

Active/standby Amazon MQ brokers store KahaDB on Amazon EFS. EFS adds latency compared to local NVMe in self-hosted deployments. With `sortedStore="true"`, each priority-indexed write involves an EFS operation. On multi-AZ deployments this is across an AZ boundary.

Expected EFS impact on priority write path:

- EFS throughput mode: **Bursting** — suitable for most workloads; latency spikes under sustained load
- EFS throughput mode: **Provisioned** — recommended for deep priority queues with frequent writes (> 10,000 persistent priority messages/sec)

Switch to provisioned throughput if `StorePercentUsage` remains high or if you observe `MemoryUsage` spikes (indicating the broker is buffering because the store is slow).

---

## Operational Pitfalls on Amazon MQ

### Pitfall 1: Including Unsupported XML Elements

Attempting to include `<persistenceAdapter>`, `<transportConnectors>`, or `<networkConnectors>` in the Amazon MQ configuration document causes a validation error and the update is rejected. Strip these before uploading.

### Pitfall 2: Configuration Not Applied After Update

Updating a configuration in Amazon MQ does not automatically restart the broker. You must explicitly apply the configuration revision to the broker, which triggers a reboot at the next maintenance window (or immediately if `--apply-immediately` is used in `update-broker`).

### Pitfall 3: Hardcoded Credentials

Never hardcode broker credentials in application config. Use Secrets Manager with automatic rotation. Amazon MQ supports broker user password rotation via Secrets Manager without a broker reboot in 5.15.12+ and 5.16.3+.

### Pitfall 4: `ExplicitQosEnabled` Not Set in Spring

`JmsTemplate.setExplicitQosEnabled(true)` is required for the `JMSPriority` header to be included in the OpenWire wire frame. Without it, all messages are sent at the default priority (4) regardless of what you set.

### Pitfall 5: Lambda as a Consumer

Lambda cannot maintain a persistent JMS connection. Do not attempt to use Lambda as an Amazon MQ consumer. Use ECS (Fargate) for long-lived consumer processes.

### Pitfall 6: Active/Standby Priority State During Failover

On failover, the standby broker takes over. If messages were in the in-memory priority cursor of the failed active broker and had not yet been persisted to EFS/KahaDB, they may be replayed from the journal in write order rather than priority order. Mitigate by keeping in-memory queue depth low (small `prefetchPerLevel`) and ensuring `sortedStore="true"` is configured.

### Pitfall 7: EFS Throughput Throttling

Amazon MQ on active/standby uses EFS. EFS Bursting mode throttles after consuming burst credits. Deep priority queues with high write rates exhaust burst credits. When this happens, `StorePercentUsage` climbs and the broker applies flow control, blocking producers. Switch to Provisioned Throughput on EFS when this occurs.

---

## Cost Considerations

Amazon MQ pricing has three components: broker instance hours, storage, and data transfer.

**Important:** Amazon MQ does **not** offer Reserved Instance or Savings Plan pricing. All usage is on-demand. For 24/7 production workloads, this makes Amazon MQ significantly more expensive than equivalent SQS throughput at scale. Factor this into your messaging service selection.

### Broker Instance Pricing

| Deployment              | Nodes Billed | mq.m5.large (us-east-1, hourly) | mq.m5.xlarge | mq.m5.2xlarge |
| ----------------------- | ------------ | ------------------------------- | ------------ | ------------- |
| ActiveMQ single-inst    | 1            | ~$0.288                         | ~$0.576      | ~$1.152       |
| ActiveMQ active/standby | 2            | ~$0.576                         | ~$1.152      | ~$2.304       |
| RabbitMQ single-inst    | 1            | ~$0.288                         | ~$0.576      | ~$1.152       |
| RabbitMQ 3-node cluster | 3            | ~$0.864                         | ~$1.728      | ~$3.456       |

ActiveMQ active/standby = 2 instances always billed. RabbitMQ cluster = 3 instances always billed. A RabbitMQ 3-node `mq.m5.large` cluster costs approximately $630/month just in instance hours (us-east-1). The Graviton-based `mq.m7g` instances are approximately 5-10% cheaper per hour than equivalent `mq.m5` sizes.

### Storage Pricing

| Engine   | Storage Type | Price (us-east-1) | Characteristics                             |
| -------- | ------------ | ----------------- | ------------------------------------------- |
| ActiveMQ | EFS          | ~$0.30/GB-month   | Shared across AZs, higher latency, durable  |
| ActiveMQ | EBS          | ~$0.10/GB-month   | Local to instance, lower latency, single-AZ |
| RabbitMQ | EBS          | ~$0.10/GB-month   | One volume per node (3x for cluster)        |

ActiveMQ EFS storage includes 5 GB-month free per broker. RabbitMQ EBS storage charges scale linearly with the `storage-type` limit you set (default 200 GB per node for cluster mode = 600 GB total across 3 nodes).

### Data Transfer Costs

| Traffic Path                         | Cost                             |
| ------------------------------------ | -------------------------------- |
| Same AZ (app + broker endpoint)      | Free                             |
| Cross-AZ within region               | $0.01/GB each direction          |
| Cross-region                         | Standard EC2 data transfer rates |
| RabbitMQ inter-node (within cluster) | **Free** (included)              |
| RabbitMQ private networking          | $0.01/GB processed + VPC Lattice |

Cross-AZ traffic is a hidden cost for active/standby ActiveMQ (2 AZs) and RabbitMQ cluster (3 AZs). If your application runs in a single AZ but the broker distributes across AZs, every message incurs cross-AZ data transfer charges.

### Cost Comparison: Amazon MQ vs Alternatives

| Service                                           | Approximate Monthly Cost (10K msg/sec, persistent, HA) | Pricing Model                               |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| Amazon MQ (ActiveMQ active/standby, mq.m5.xlarge) | ~$850/month                                            | Per-instance-hour + storage                 |
| Amazon MQ (RabbitMQ 3-node cluster, mq.m5.xlarge) | ~$1,270/month                                          | Per-instance-hour + storage (3x)            |
| Amazon SQS (Standard)                             | ~$400/month                                            | Per-request (first 1M free, ~$0.40/M after) |
| Amazon SQS (FIFO)                                 | ~$1,200/month                                          | Per-request (higher per-GB pricing)         |
| Self-managed on EC2 (2x m5.xlarge)                | ~$280/month                                            | EC2 on-demand + EBS                         |

At scale, SQS Standard is significantly cheaper for workloads that do not need JMS/AMQP compatibility. Amazon MQ is priced for convenience, not volume.

### Cost Optimisation

- **Right-size your instance.** Monitor `HeapUsage` and `StorePercentUsage`. If both remain below 40% during peak, downsize.
- **Delete inactive destinations.** Use `gcInactiveDestinations="true"` with `inactiveTimoutBeforeGC` — stale queues with priority config still consume memory.
- **Set message TTLs.** Expired messages are removed from the store, bounding storage growth and reducing cursor size.
- **Collocate consumers in the same AZ as the broker endpoint** to minimise cross-AZ data transfer.
- **Use `mq.m7g` (Graviton) for RabbitMQ** — approximately 5-10% cheaper than equivalent `mq.m5` with better Erlang runtime performance.
- **EBS throughput-optimised (ActiveMQ) instead of EFS durability-optimised** for non-critical workloads to reduce storage cost from $0.30/GB to $0.10/GB.

---

## Availability and SLA

### Service Level Agreement

Amazon Mq provides an SLA for multi-AZ deployments only:

| Broker Type                  | SLA Monthly Uptime | Service Credits (if SLA missed)          |
| ---------------------------- | ------------------ | ---------------------------------------- |
| ActiveMQ active/standby      | 99.9%              | 10% (< 99.9%), 25% (< 99%), 100% (< 95%) |
| RabbitMQ 3-node cluster      | 99.9%              | Same scale                               |
| Single-instance (any engine) | **No SLA**         | Excluded from SLA                        |

**SLA definition:** A broker is "Unavailable" when **all** connection requests fail during any 1-minute interval. Partial failure (e.g. one of two active/standby nodes unreachable but the other accepts connections) does not count as downtime.

**SLA exclusions:** Micro instance classes, customer-initiated actions (reboot, config change, security group misconfiguration), underlying engine software bugs that crash the broker, and force majeure events.

### Availability Characteristics by Deployment

| Deployment               | Multi-AZ | RTO (failover)             | RPO (data loss window)                           |
| ------------------------ | -------- | -------------------------- | ------------------------------------------------ |
| ActiveMQ active/standby  | Yes (2)  | 30-120s (DNS fail)         | Near-zero (shared EFS, journal replay)           |
| RabbitMQ 3-node cluster  | Yes (3)  | Seconds (NLB, transparent) | Near-zero (mirrored queues, sync-mode=automatic) |
| ActiveMQ single-instance | No       | Minutes (restart)          | Up to last KahaDB fsync                          |
| RabbitMQ single-instance | No       | Minutes (restart)          | Up to last EBS write                             |

**ActiveMQ active/standby failover:** The standby broker monitors the active via a heartbeat. On detection of failure, the standby promotes itself and begins accepting connections. The DNS failover latency depends on client DNS caching — most clients see 30-60 seconds of interruption. Using the OpenWire failover transport (`failover:(ssl://...)`) with `maxReconnectDelay=5000` masks this from the application layer.

**RabbitMQ cluster failover:** The NLB detects failed nodes via health checks (default: 10-second interval, 2 consecutive failures = unhealthy). Connected clients on the failed node must reconnect — the NLB routes them to a healthy node. Mirrored queues ensure no message loss as long as at least one replica was synchronised before the failure.

### Maintenance Windows

Amazon MQ performs software upgrades and security patching during configurable maintenance windows (set per broker). Both engines experience disruption:

- **ActiveMQ active/standby:** The standby is updated first, then the active triggers a failover. Expect 30-120s of connection interruption.
- **RabbitMQ cluster:** Nodes are updated one at a time. Each node restart severs its client connections. Keep at least two nodes running throughout. Queue synchronisation on rejoin blocks operations — maintain short queue depths to limit the window.

Set maintenance windows during known low-traffic periods. For ActiveMQ, apply configuration changes (which require a reboot) during the maintenance window rather than immediately.

### Design Considerations for High Availability

- **Always use multi-AZ for production.** Single-instance brokers have no SLA and no automatic failover.
- **Client-side failover is essential.** ActiveMQ applications must use the OpenWire failover transport. RabbitMQ applications must implement automatic reconnection with exponential backoff.
- **Stagger client reconnection.** After a failover event, thousands of clients reconnecting simultaneously can overwhelm a newly promoted broker. Use `randomize=false` on the failover URL and add jitter to client startup.
- **Test failover regularly.** Amazon MQ does not provide a controlled failover test API for ActiveMQ active/standby. You can trigger a reboot via the API and observe client behaviour.
- **RabbitMQ cluster minimum size is 3.** Two-node RabbitMQ clusters are not supported on Amazon MQ. A 3-node cluster can tolerate one node failure.

---

## Resiliency Patterns

Amazon MQ requires careful client-side handling for network faults, broker failover and message processing failures. The following patterns apply to both engines.

### Connection Resilience

**ActiveMQ:**

```java
// OpenWire failover transport — masks broker failover from application code
String url = "failover:(ssl://b-xxx-1.mq.us-east-1.amazonaws.com:61617,"
           + "ssl://b-xxx-2.mq.us-east-1.amazonaws.com:61617)"
           + "?maxReconnectDelay=30000"
           + "&useExponentialBackOff=true"
           + "&backOffMultiplier=2"
           + "&initialReconnectDelay=100";
```

| Parameter               | Recommended Value | Purpose                             |
| ----------------------- | ----------------- | ----------------------------------- |
| `maxReconnectDelay`     | 30000             | Cap backoff at 30 seconds           |
| `useExponentialBackOff` | true              | Reduce reconnect storm after outage |
| `backOffMultiplier`     | 2                 | Double delay each attempt           |
| `initialReconnectDelay` | 100               | Start at 100ms                      |
| `randomize`             | false             | Try primary first, then secondary   |

**RabbitMQ:**

```python
# RabbitMQ automatic connection recovery (all official clients support this)
import pika

params = pika.URLParameters("amqps://user:pass@b-xxx.mq.us-east-1.amazonaws.com:5671")
params.heartbeat = 60          # Detect dead connections
params.blocked_connection_timeout = 30
params.connection_attempts = 5  # Retry on initial connect

connection = pika.BlockingConnection(params)
# Reconnection is automatic after connection loss if you use
# the ConnectionParameters with blocking or select connection
```

### Circuit Breaker for Producer

When the broker is unavailable or applying backpressure (flow control in ActiveMQ, alarm state in RabbitMQ), producers should back off rather than hammering the broker:

```java
@Component
public class ResilientProducer {

    private final JmsTemplate jms;
    private final CircuitBreaker circuitBreaker;
    private final MeterRegistry metrics;

    public void send(String destination, Message message) {
        circuitBreaker.run(
            () -> jms.send(destination, session -> message),
            fallback -> {
                metrics.counter("mq.producer.circuit-broken").increment();
                // Fallback: write to S3, SQS DLQ, or local buffer
                writeToFallbackStore(destination, message);
            }
        );
    }
}
```

Set the circuit breaker timeout slightly longer than `maxReconnectDelay` (e.g. 60 seconds). On open circuit, redirect messages to a fallback store like SQS or S3 for later replay.

### Idempotent Consumer

Message brokers in a distributed system may deliver the same message more than once (at-least-once semantics). For ActiveMQ, this happens during failover when a message is dispatched but not yet acknowledged. For RabbitMQ mirrored queues, it can occur during mirror promotion.

```java
@Component
public class IdempotentConsumer {

    // Track processed message IDs in a deduplication store
    private final Set<String> processedIds = new ConcurrentHashMap<>()
        .newKeySet();

    @JmsListener(destination = "ORDERS")
    public void onMessage(Message msg, Channel channel) throws JMSException {
        String messageId = msg.getJMSMessageID();

        if (processedIds.contains(messageId)) {
            msg.acknowledge();  // Already processed — ack and skip
            return;
        }

        try {
            process(msg);
            processedIds.add(messageId);
            msg.acknowledge();
        } catch (Exception e) {
            msg.acknowledge(); // Or use redelivery for transient failures
        }
    }
}
```

For persistent deduplication, store processed message IDs in DynamoDB (TTL-enabled) or Redis. Use `JMSMessageID` for ActiveMQ or `message_id` / custom dedup ID for RabbitMQ.

### Consumer Backpressure

If consumers fall behind, broker memory and disk fill up. Both engines apply flow control when limits are reached:

- **ActiveMQ:** Blocks producers when `StorePercentUsage` exceeds the limit. Producers receive a `javax.jms.ResourceAllocationException`.
- **RabbitMQ:** Publishers in a blocked connection receive a `publisher-confirm` failure or connection-level `connection.blocked` notification.

```python
# RabbitMQ — react to connection blocked notification
def on_connection_blocked(connection, method_frame):
    logger.warning("Broker is blocking publishers — reducing send rate")
    producer.set_max_rate(100)  # Slow down

def on_connection_unblocked(connection, method_frame):
    logger.info("Broker unblocked — restoring send rate")
    producer.set_max_rate(5000)

connection.add_on_connection_blocked_callback(on_connection_blocked)
connection.add_on_connection_unblocked_callback(on_connection_unblocked)
```

### Stash-Unstash Pattern (ActiveMQ)

When a consumer fails mid-processing, the unacknowledged message stays in the prefetch buffer and blocks subsequent messages. The stash-unstash pattern preserves ordering while isolating failures:

```java
// On consumer failure, "stash" the failed message by converting current
// session to a separate "stash" queue. New messages go to the main queue.
// Process the stash manually or after a delay.

@Component
public class StashUnstashConsumer {

    @JmsListener(destination = "ORDERS")
    public void handle(Message msg, JmsSession session) {
        try {
            process(msg);
            msg.acknowledge();
        } catch (ProcessingException e) {
            // Move to stash queue — preserve ordering of remaining messages
            session.createQueue("ORDERS.STASH");
            jms.send("ORDERS.STASH", msg);
            msg.acknowledge();  // Remove from main queue
        }
    }
}
```

Process the stash queue at a lower priority or after a delay. Re-enqueue successfully processed stash messages back to the main queue if needed.

---

## Disaster Recovery and Multi-Region

Amazon MQ is a regional service. It does not provide native cross-region replication. You must implement disaster recovery at the application layer.

### Strategy 1: ActiveMQ Network of Brokers (Cross-Region)

Amazon MQ supports the ActiveMQ network of brokers feature, which connects brokers in a mesh topology. Use this for cross-region forwarding:

```yaml
# Primary region broker (us-east-1)
# Secondary region broker (us-west-2)
# Configured via Amazon MQ console — no XML transport connectors needed
```

The network of brokers uses demand-based forwarding: messages are forwarded from the primary to the secondary only when a consumer in the secondary region has a matching subscription. This is pull-based, not push-based. Disadvantages: network of brokers does not guarantee full replication; it forwards based on demand.

### Strategy 2: RabbitMQ Shovel (Cross-Region)

```bash
# Configure a shovel on the primary RabbitMQ broker via management plugin
rabbitmqadmin declare parameter shovel cross-region-shovel \
  component=federation \
  name=cross-region-shovel \
  value='{
    "src-protocol": "amqp091",
    "src-uri": "amqps://...",
    "src-queue": "orders",
    "dest-protocol": "amqp091",
    "dest-uri": "amqps://secondary-broker...",
    "dest-queue": "orders-dr",
    "add-forward-headers": true
  }'
```

Shovel is unidirectional and provides at-least-once delivery. It survives broker restarts. Monitor the shovel status via the management plugin or CloudWatch.

### Strategy 3: Application-Level Dual-Write

For workloads requiring zero RPO, dual-write to two regions from the producer:

```java
public void sendOrder(Order order) {
    // Primary region — synchronous send
    primaryJms.send("ORDERS", order);

    // Secondary region — async send (fire-and-forget or async confirm)
    CompletableFuture.runAsync(() -> {
        try {
            secondaryJms.send("ORDERS.DR", order);
        } catch (Exception e) {
            log.error("DR write failed", e);
            metrics.counter("mq.dr.write.failure").increment();
        }
    });
}
```

**Caveats:** Dual-write doubles producer-side cost and latency for the secondary call. The secondary region's queue may diverge from primary if writes fail. A reconciliation job can compare queue depths across regions.

### Strategy 4: Periodic Export to S3

For compliance or long-term archival, export messages from Amazon MQ to S3 using an ECS consumer:

```
[Amazon MQ] → [ECS Consumer (always-on)] → [S3 Bucket (partitioned by date)]
                                      ↓
                             [DLQ for failed exports]
```

Set S3 lifecycle policies to transition to Glacier after N days. This is a cold DR pattern — restore requires replaying messages from S3 into a new broker.

### Multi-Region Architecture Decision

| Requirement            | Recommended Approach                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| RTO < 1 minute         | Active-passive with pre-warmed broker in secondary region, application dual-write |
| RTO < 5 minutes        | Active-passive with shovel/network of brokers forwarding                          |
| RPO = 0 (no data loss) | Dual-write from all producers                                                     |
| RPO < 1 hour           | Periodic S3 export + replay                                                       |
| Compliance / audit     | S3 export + SQS for chain of custody                                              |
| Cost-sensitive DR      | Single-region active/standby with S3 backup                                       |

### Backup and Restore

Amazon MQ does not provide native backup APIs. For message-level backup:

1. **ActiveMQ:** The KahaDB journal on EFS/EFS is not directly accessible. Export messages by consuming them programmatically and writing to S3 or DynamoDB.
2. **RabbitMQ:** Use the `rabbitmqadmin export` command against the management API to export queue definitions (not message contents). For message content, use shovel to replicate to a DR broker or consume and store externally.
3. **Configuration backup:** Amazon MQ configurations are versioned and retrievable via `describe-configuration-revision`. Store configuration IDs in CloudFormation or Terraform state for reproducible broker setup.

---


## Summary

- Amazon MQ supports two engines: **ActiveMQ** (JMS, OpenWire, priority cursors, active/standby) and **RabbitMQ** (AMQP 0-9-1, exchanges, 3-node cluster, NLB)
- **Active/standby (ActiveMQ)** and **3-node cluster (RabbitMQ)** are the only deployment modes covered by the 99.9% SLA — never use single-instance for production
- RabbitMQ uses EBS (low-latency, per-node), ActiveMQ uses EFS (shared across AZs) or EBS (throughput-optimised)
- Priority messaging: ActiveMQ cursor-based with `prioritizedMessages="true"` and `sortedStore="true"`; RabbitMQ via `x-max-priority` queue argument (limit to 5 levels)
- Amazon MQ does **not** support Reserved Instance pricing — all usage is on-demand. Cost is 3-10x higher than SQS at scale
- **No native disaster recovery** — implement cross-region replication via network of brokers (ActiveMQ), shovel/federation (RabbitMQ), or application-level dual-write
- Client-side resiliency is mandatory: failover transport (ActiveMQ), automatic reconnection (RabbitMQ), idempotent consumers, circuit breakers for producers
- Lambda can consume from Amazon MQ via Event Source Mapping (moderate throughput only) — use ECS Fargate for high-throughput consumers
- Cross-AZ data transfer ($0.01/GB each direction) is a hidden cost for multi-AZ deployments — collocate consumers in the same AZ as the broker endpoint
- For greenfield serverless architectures, prefer SQS/SNS/EventBridge — they are cheaper, simpler and scale beyond Amazon MQ's instance limits
- **Decision rule:** JMS/XA → ActiveMQ. AMQP 0-9-1/complex routing → RabbitMQ. Neither → SQS/SNS/EventBridge
