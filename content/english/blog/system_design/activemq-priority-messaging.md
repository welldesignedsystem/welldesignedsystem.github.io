+++
date = '2026-06-25T12:00:00+10:00'
draft = false
title = 'ActiveMQ and Priority-Based Messaging'
tags = ['ActiveMQ', 'Messaging', 'JMS', 'Message Broker', 'Priority', 'Queue']
summary = 'Deep dive into ActiveMQ message priority model, broker configuration, cursor behaviour, protocol support, trade-offs and real-world use cases.'
+++

ActiveMQ is an open-source message broker implementing JMS 1.1 with support for queues, topics, durable subscriptions and priority-based message ordering. This post covers everything about how priority works in ActiveMQ including broker internals, protocol differences, performance characteristics and operational best practices.

---

## Message Priority Model

### JMS Priority Levels

JMS defines 10 priority levels (0–9):

| Level | Constant | Meaning |
|---|---|---|
| 0–4 | `javax.jms.Message.DEFAULT_PRIORITY` (4) | Normal priority |
| 5–9 | Various | Expedited / high priority |

ActiveMQ maps these directly. Level 4 is the default. Higher numeric value = higher priority.

### How Priority Affects Message Ordering

ActiveMQ uses **priority queues** internally. When a producer sends messages with different priorities, the broker sorts them in the queue so that higher-priority messages are delivered first. Within the same priority level, FIFO ordering is preserved.

**Important trade-off:** priority ordering breaks strict FIFO across priority levels. A high-priority message that arrives after 10,000 low-priority messages will be delivered before any remaining low-priority messages.

### Priority is Advisory, Not Guaranteed

The JMS spec says message priority is a "hint to the broker" — it does not mandate strict priority ordering. ActiveMQ implements it with best-effort correctness:

- Strict priority ordering is guaranteed **only within a single consumer session**
- When multiple consumers compete on the same queue, priority ordering is probabilistic — the next available consumer gets the highest-priority message available at dispatch time
- If a consumer prefetches 1000 messages, it may process lower-priority messages while higher-priority messages sit in the broker queue

---

## Broker Internals

### Message Cursors

ActiveMQ has a layered cursor architecture for queue storage:

```
Producer → Pending Queue (in-memory) → Message Store (KahaDB or JDBC) → Dispatch Queue → Consumer
```

The priority ordering is applied at two points:

1. **Pending cursor** — the in-memory list of undelivered messages. This is a `PriorityQueue` data structure that sorts by priority then by timestamp.
2. **Dispatch cursor** — when messages are moved from the store to the dispatch queue, they are re-sorted by priority.

### PriorityQueue Implementation

ActiveMQ uses `org.apache.activemq.broker.region.cursors.PriorityQueue` backed by a sorted array. When `usePriority` is enabled, the queue maintains a separate sub-queue per priority level:

```
Level 9 → [msg_1, msg_2, ...]
Level 8 → [msg_3, ...]
...
Level 0 → [msg_N, ...]
```

Dispatch pulls from the highest non-empty level in FIFO order within that level.

### Configuring Priority Support

In `activemq.xml`:

```xml
<policyEntry queue=">" prioritizedMessages="true">
  <pendingQueuePolicy>
    <priorityQueueCursor>
      <!-- Optional: prefetch per priority level -->
      <config>
        <prefetchPerLevel>100</prefetchPerLevel>
        <sortedStore>true</sortedStore>
      </config>
    </priorityQueueCursor>
  </pendingQueuePolicy>
</policyEntry>
```

Key properties:
- `prioritizedMessages="true"` — enables priority ordering for all matching queues
- `sortedStore="true"` — preserves priority ordering when spooling to disk
- `prefetchPerLevel` — how many messages per priority level to cache in memory (default: all)

### Priority During Store Recovery

When KahaDB replays journaled messages on broker restart, messages are re-inserted into the pending queue in priority order. Recovery time increases with the number of priority levels in use:

- 1–2 levels: negligible overhead
- 5+ levels: up to 15% recovery time increase on large journals

---

## Protocol Support

### OpenWire (Native Protocol)

Full priority support. The priority field is present in the wire format and is used by the broker for sorting.

**Set priority in JMS:**

```java
// Producer side
MessageProducer producer = session.createProducer(queue);
producer.setPriority(9);  // All messages at priority 9

// Or per message
TextMessage msg = session.createTextMessage("Urgent");
msg.setJMSPriority(9);
producer.send(msg);
```

**Consumer side — overriding priority behavior:**

```java
// Consumer can request priority-based dispatch
ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory(brokerURL);
// No consumer-side configuration needed — priority is broker-enforced
```

### STOMP

Full priority support via the `priority` header:

```
SEND
destination:/queue/orders
priority:9
content-type:text/plain

URGENT ORDER
```

The STOMP header value is mapped to JMS priority (0–9). Non-numeric or missing values default to 4.

### MQTT

**Limited priority support.** MQTT v3.1.1 has no concept of message priority. ActiveMQ maps MQTT QoS levels to priority:

| MQTT QoS | Mapped JMS Priority |
|---|---|
| QoS 0 (At most once) | 4 (default) |
| QoS 1 (At least once) | 4 (default) |
| QoS 2 (Exactly once) | 4 (default) |

All MQTT messages arrive at default priority. To use priority with MQTT, you must use custom broker-side transformation or route to different queues based on topic.

### AMQP

ActiveMQ's AMQP support maps the AMQP `priority` field (0–9) directly to JMS priority. The mapping matches JMS semantics:

- AMQP `priority` header = 0–9
- ActiveMQ maps to JMS priority without transformation
- Default AMQP priority is 4 (same as JMS)

---

## Priority and Consumer Prefetch

### The Prefetch Problem

Prefetch is the number of messages pulled from the broker into the consumer's local buffer. Default is 1000 for queues.

**Without priority, prefetch improves throughput.** With priority, prefetch is destructive:

1. Consumer A prefetches 1000 low-priority messages
2. Producer sends a priority-9 message
3. Consumer A already has 1000 messages in its buffer — the priority-9 message stays in the broker
4. Consumer A processes all 1000 buffered messages before the broker dispatches the priority-9 message

### Solutions

**Disable prefetch for priority-sensitive queues:**

```xml
<policyEntry queue="priority.>" prioritizedMessages="true">
  <dispatchPolicy>
    <priorityDispatchPolicy/>
  </dispatchPolicy>
</policyEntry>
```

```java
// Consumer side
ActiveMQPrefetchPolicy prefetchPolicy = new ActiveMQPrefetchPolicy();
prefetchPolicy.setQueuePrefetch(0);  // No prefetch
((ActiveMQConnectionFactory) factory).setPrefetchPolicy(prefetchPolicy);
```

With prefetch = 0, every message requires a round-trip dispatch request. Throughput drops but priority ordering is strict.

**Use `optimizedDispatch="true"`:**

```xml
<policyEntry queue=">" prioritizedMessages="true" optimizedDispatch="true"/>
```

Optimized dispatch balances throughput and priority by dispatching higher-priority messages to consumers even after a prefetch batch started.

---

## Client-Side vs Broker-Side Priority

### Broker-Side (Default)

The broker reorders messages in its queue based on priority before dispatching. This is the ActiveMQ default when `prioritizedMessages="true"`.

- Advantage: centralised control, works with any client protocol
- Disadvantage: broker overhead from sorting; requires `sortedStore="true"` for correctness after broker restart

### Client-Side Priority

The producer sets priority but the broker sends messages in FIFO order. The consumer must implement its own priority sorting.

- Advantage: no broker overhead; simpler configuration
- Disadvantage: every consumer must implement sorting logic; inconsistent with other consumers

### Mixed Approach

Use separate queues for priority tiers and route messages at the producer or via a Camel route:

```java
// Producer routes to different queue based on priority
if (priority >= 7) {
    producer = session.createProducer(session.createQueue("ORDERS.HIGH"));
} else if (priority >= 4) {
    producer = session.createProducer(session.createQueue("ORDERS.NORMAL"));
} else {
    producer = session.createProducer(session.createQueue("ORDERS.LOW"));
}
```

Consumers subscribe to the queues they handle. No broker-level priority sorting needed. This is the most common production pattern.

---

## Redelivery and Priority

### Redelivery Policy

ActiveMQ's redelivery mechanism interacts with priority in important ways:

```xml
<redeliveryPlugin fallbackToDeadLetter="true" sendToDlqIfMaxRetriesExceeded="true">
  <redeliveryPolicyMap>
    <redeliveryPolicyMap>
      <defaultEntry>
        <redeliveryPolicy maximumRedeliveries="6"
                          initialRedeliveryDelay="1000"
                          useExponentialBackOff="true"
                          backOffMultiplier="2"
                          redeliveryDelayType="EXPONENTIAL"/>
      </defaultEntry>
    </redeliveryPolicyMap>
  </redeliveryPolicyMap>
</redeliveryPlugin>
```

**Priority inversion during redelivery:**

- A message that fails processing is rolled back for redelivery
- During rollback, the message is re-added to the queue at its original priority level
- If a higher-priority message arrived while the consumer was processing, the rolled-back message (even if originally higher priority) waits behind the newer high-priority message in the priority queue
- This is correct behaviour — a failed high-priority message does not block newer high-priority messages

### Dead Letter Queue

Messages that exceed redelivery count go to the DLQ. The DLQ prefix can be configured:

```xml
<policyEntry queue=">" prioritizedMessages="true">
  <deadLetterStrategy>
    <individualDeadLetterStrategy queuePrefix="DLQ."
                                   useQueueForQueueMessages="true"/>
  </deadLetterStrategy>
</policyEntry>
```

DLQ messages retain their original priority. Consumers can use priority ordering on the DLQ to process the most critical failed messages first.

---

## Performance Characteristics

### Throughput Impact

| Configuration | Messages/sec (relative) | Notes |
|---|---|---|
| No priority | 1.0x (baseline) | FIFO only |
| Priority (in-memory only) | 0.85x–0.95x | Sorting overhead in priority queue |
| Priority + sorted store | 0.70x–0.85x | Disk overhead from maintaining priority ordering |
| Priority + prefetch = 0 | 0.40x–0.60x | Round-trip per message |

### Memory Impact

ActiveMQ maintains a pending list per priority level. With 10 levels, memory overhead is approximately:

- 10 linked lists or arrays (one per level)
- Each message pointer ~ 8 bytes
- For 100,000 messages: ~ 8 MB additional overhead vs a single FIFO queue

### When Priority Is Cheap

- 2–3 priority levels: near-zero overhead
- All messages at the same priority: no sorting, but the queue structure still allocates sub-queues
- Small queues (< 10,000 messages): overhead is negligible

### When Priority Is Expensive

- 7+ priority levels with frequent level-switching
- Very deep queues (> 1M messages) — re-sorting on store recovery is slow
- Combined with selectors — priority + selector requires scanning across all levels

---

## Queue and Topic Differences

### Queues (Point-to-Point)

Priority is fully supported. The broker sorts the queue and dispatches highest-priority messages first to available consumers.

### Topics (Pub-Sub)

Priority matters **per subscriber**. Each durable subscriber maintains its own cursor. The broker sorts pending messages per subscriber by priority. For non-durable subscribers, priority applies only to messages currently in the dispatch buffer.

### Virtual Topics

ActiveMQ's Virtual Topics combine topic routing with queue semantics. Priority is supported: each physical queue backing a virtual topic inherits the priority policy of the virtual topic.

---

## Common Use Cases

### Order Processing

- Priority 9: VIP orders, manual intervention required
- Priority 7: Express shipping orders
- Priority 4: Standard orders (default)
- Priority 1: Bulk / scheduled orders

### Alerting and Monitoring

- Priority 9: Critical system alerts (pager duty)
- Priority 7: Warning thresholds
- Priority 4: Informational logs
- Priority 1: Debug / trace messages

### Support Ticket Systems

- Priority 9: P1 — system down
- Priority 7: P2 — feature broken for paying customer
- Priority 4: P3 — cosmetic issue
- Priority 1: P4 — feature request

### Payment Processing

High-value transactions take priority over micro-transactions to ensure they clear faster and reduce fraud exposure window.

---

## Configuration Reference

### activemq.xml Skeleton

```xml
<broker xmlns="http://activemq.apache.org/schema/core"
        brokerName="priority-broker"
        useJmx="true">

  <destinationPolicy>
    <policyMap>
      <policyEntries>
        <!-- All queues get priority support -->
        <policyEntry queue=">"
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

  <!-- Redelivery with exponential backoff -->
  <destinationInterceptors>
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
  </destinationInterceptors>

  <transportConnectors>
    <transportConnector name="openwire"
                        uri="tcp://0.0.0.0:61616"/>
    <transportConnector name="stomp"
                        uri="stomp://0.0.0.0:61613"/>
  </transportConnectors>
</broker>
```

### Key Flags Summary

| Flag | Purpose | When to Set |
|---|---|---|
| `prioritizedMessages="true"` | Enable priority sorting in broker | Always for priority workloads |
| `sortedStore="true"` | Preserve priority ordering to disk | When persistence is enabled |
| `optimizedDispatch="true"` | Balance prefetch vs priority | High-volume priority queues |
| `prefetchPerLevel` | Limit in-memory cache per level | Memory-constrained environments |

---

## ActiveMQ Classic vs Artemis

ActiveMQ Classic (5.x) is the traditional broker. ActiveMQ Artemis (2.x) is the next-generation broker based on HornetQ.

**Priority differences:**

- Artemis uses a different cursor implementation — priority sorting is built into the `PagedQueueImpl` and is more efficient at scale
- Artemis supports `prioritizedMessages` via `address-setting`:
  ```xml
  <address-setting match="orders.>">
    <max-size-bytes>1GB</max-size-bytes>
    <page-size-bytes>10485760</page-size-bytes>
    <prioritized-messages>true</prioritized-messages>
  </address-setting>
  ```
- Artemis performs priority sorting at the address level (not queue level), which means routing messages to queues by priority is redundant — priorities work across all queues within an address
- Artemis uses a file-based paging system; priority ordering during page eviction is more predictable than Classic's KahaDB

If starting new, use Artemis. Classic is in maintenance mode.

---

## Operational Pitfalls

### Pitfall 1: Priority Without Prefetch Adjustment

Symptoms: priority messages are delayed despite being sent first.
Fix: Set `prefetch=0` or use `optimizedDispatch`.

### Pitfall 2: All Messages at Default Priority

Symptoms: priority overhead paid but all messages are level 4.
Fix: Ensure producers actually set `JMSPriority` header.

### Pitfall 3: DLQ Priority Swamping

Symptoms: DLQ fills with high-priority messages that keep getting processed and re-delivered.
Fix: Use `individualDeadLetterStrategy` and set lower max redeliveries for high-priority queues.

### Pitfall 4: Store Recovery Time

Symptoms: broker restart takes minutes; messages load slowly.
Fix: Use `sortedStore="true"` with KahaDB tuning; consider moving to Artemis for large stores.

### Pitfall 5: Expecting Strict Global Ordering

Symptoms: priority messages arrive out of order with multiple consumers.
Fix: Understand that priority is per-session, not globally ordered. Use `exclusive consumer` for strict ordering.

```xml
<policyEntry queue="strict.order.>" prioritizedMessages="true">
  <exclusiveConsumer />
</policyEntry>
```

---

## Summary

- Priority is a broker-side sorting mechanism on a 0–9 scale, default level 4
- Enable with `prioritizedMessages="true"` in destination policy
- Works natively with OpenWire, STOMP, AMQP; limited with MQTT
- Prefetch must be managed to avoid priority inversion
- Multi-queue routing is simpler and more scalable than single-queue priority
- ActiveMQ Artemis is the recommended platform for new deployments
- Priority is a dispatch hint, not a total ordering guarantee across distributed consumers
