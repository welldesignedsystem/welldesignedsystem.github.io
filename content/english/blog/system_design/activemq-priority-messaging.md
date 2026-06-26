+++
date = '2026-06-25T12:00:00+10:00'
draft = false
title = 'Amazon MQ and Priority-Based Messaging'
tags = ['Amazon MQ', 'ActiveMQ', 'AWS', 'Messaging', 'JMS', 'Priority', 'Queue']
summary = 'Deep dive into priority-based messaging on Amazon MQ (ActiveMQ engine) — broker configuration, AWS-specific constraints, monitoring with CloudWatch, IAM, VPC networking, and real-world patterns on AWS.'
+++

Amazon MQ is the AWS managed message broker service. It supports two engines: ActiveMQ and RabbitMQ. This post covers priority-based messaging exclusively on the **ActiveMQ engine**, where Amazon MQ manages the broker infrastructure, patching, and high availability while you control destination policy, redelivery, and client configuration.

---

## Amazon MQ vs Self-Hosted ActiveMQ

Understanding what AWS manages versus what you control is essential before configuring priority.

| Concern            | Self-Hosted ActiveMQ    | Amazon MQ                                 |
| ------------------ | ----------------------- | ----------------------------------------- |
| `activemq.xml`     | Full control            | Partial — via broker configuration API    |
| KahaDB tuning      | Full control            | **Not exposed** — AWS manages persistence |
| OS / JVM           | You manage              | AWS manages                               |
| Network connectors | You configure           | Handled by active/standby topology        |
| TLS certificates   | You manage              | AWS Certificate Manager or auto-managed   |
| Upgrades           | Manual                  | Managed maintenance windows               |
| Scaling            | Manual                  | Instance type selection                   |
| Monitoring         | Self-hosted (JMX, logs) | CloudWatch metrics + broker logs          |

**The key constraint:** Amazon MQ does not give you direct file system access to the broker. You cannot edit `activemq.xml` directly. Configuration is applied through the **Amazon MQ broker configuration** resource (an XML document managed via the AWS Console, CLI, or CloudFormation), and not all settings available in self-hosted ActiveMQ are supported.

---

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

> **Note:** AWS does not provide a native Lambda trigger for Amazon MQ the way it does for Amazon SQS. You need a long-lived consumer process (ECS, EKS, or EC2).

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

Amazon MQ pricing on AWS has three components:

**Broker instance hours** — charged per hour per broker instance. Active/standby means two instances (both are billed). Use Reserved pricing for production brokers running 24/7.

**Storage (EFS)** — charged per GB-month on EFS for active/standby, or per GB-month on EBS for single-instance brokers. Priority queues with deep backlogs and `sortedStore="true"` use more storage due to the priority index overhead.

**Data transfer** — standard AWS data transfer rates apply. Intra-VPC traffic (same AZ) between your application and the broker is free. Cross-AZ traffic (application in AZ-a, broker endpoint in AZ-b) incurs standard cross-AZ data transfer charges.

**Cost optimisation tips:**

- Use `gcInactiveDestinations="true"` with `inactiveTimoutBeforeGC` in the broker config to automatically delete queues that have been empty for a configured period. Stale queues with priority config still allocate resources.
- Set TTLs on low-priority messages to bound storage growth.
- Use Reserved Instance pricing for active/standby broker pairs that run 24/7.

---

## Configuration Reference

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

---

## Summary

- Amazon MQ is the managed ActiveMQ service on AWS — you configure via the broker configuration API, not direct file access
- `<persistenceAdapter>`, `<transportConnectors>`, and `<networkConnectors>` are not configurable — AWS manages these
- `concurrentStoreAndDispatchQueues` is correctly set by AWS on engine versions 5.15.9+; no action needed
- Enable priority with `prioritizedMessages="true"` and `sortedStore="true"` in the destination policy XML
- Upload the configuration via the AWS Console, CLI, or CloudFormation; apply it to the broker (reboot required for most changes)
- Use Secrets Manager for broker credentials; never hardcode
- Clients connect on TLS ports only — use `ActiveMQSslConnectionFactory` and failover URLs
- Monitor with CloudWatch metrics (`QueueSize`, `HeapUsage`, `StorePercentUsage`) and set alarms on DLQ growth
- Lambda is not suitable as an Amazon MQ consumer — use ECS Fargate for long-lived consumer processes
- Active/standby with EFS preserves priority state across failover
- Multi-queue tier routing is simpler and more observable than single-queue priority sorting, especially at scale on AWS
