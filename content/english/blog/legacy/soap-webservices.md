+++
date = '2026-01-23T13:00:00+10:00'
draft = false
title = 'SOAP-Based Web Services Notes'
tags = ['SOAP', 'WebServices', 'XML', 'WSDL', 'Integration', 'API', 'Enterprise']
summary = "SOAP-based web services remain a foundational pillar of enterprise integration—covering the messaging envelope, WSDL contracts, binding styles, security via WS-Security, and how to reason about SOAP versus REST when designing distributed systems."
+++

SOAP (Simple Object Access Protocol) web services are a mature, contract-driven approach to building interoperable distributed systems. Despite REST's dominance in modern APIs, SOAP still powers a huge share of enterprise backends—banking, healthcare, telco, and government—and understanding it deeply remains a valuable skill.

## Overall idea

SOAP is a **protocol**, not a style. It defines a strict envelope-based message format, a service description language (WSDL), and a suite of WS-* extensions for security, reliability, and transactions. The key insight: SOAP trades flexibility for **formal guarantees**.

The running example throughout these notes is a **Payment Service** that can process payments and look up transaction status. This is a classic enterprise SOAP use case—financial operations demand formal contracts, auditable messages, and message-level security.

---

## The SOAP Envelope

Every SOAP message is an XML document with a fixed structure. Below are a complete request and its corresponding response for the `ProcessPayment` operation.

**Request:**

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments"
  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">

  <soap:Header>
    <!-- WS-Security token identifying the calling system -->
    <wsse:Security soap:mustUnderstand="1">
      <wsse:UsernameToken>
        <wsse:Username>payment-gateway</wsse:Username>
        <wsse:Password Type="PasswordDigest">aGFzaGVkcGFzc3dvcmQ=</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
    <!-- Correlation ID for distributed tracing -->
    <ex:CorrelationId>txn-2026-00841</ex:CorrelationId>
  </soap:Header>

  <soap:Body>
    <ex:ProcessPayment>
      <ex:Amount>99.95</ex:Amount>
      <ex:Currency>AUD</ex:Currency>
      <ex:AccountFrom>ACC-001122</ex:AccountFrom>
      <ex:AccountTo>ACC-998877</ex:AccountTo>
      <ex:Reference>INV-2026-0042</ex:Reference>
    </ex:ProcessPayment>
  </soap:Body>

</soap:Envelope>
```

**Response:**

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments">

  <soap:Header>
    <ex:CorrelationId>txn-2026-00841</ex:CorrelationId>
  </soap:Header>

  <soap:Body>
    <ex:ProcessPaymentResponse>
      <ex:TransactionId>TXN-20260123-98732</ex:TransactionId>
      <ex:Status>APPROVED</ex:Status>
      <ex:ApprovedAmount>99.95</ex:ApprovedAmount>
      <ex:Currency>AUD</ex:Currency>
      <ex:Timestamp>2026-01-23T13:00:00+10:00</ex:Timestamp>
    </ex:ProcessPaymentResponse>
  </soap:Body>

</soap:Envelope>
```

| Part | Purpose |
|---|---|
| `Envelope` | Root element — signals this is a SOAP message |
| `Header` | Optional metadata: auth tokens, correlation IDs, routing hints |
| `Body` | The actual request or response payload |
| `Fault` | Standardised error structure, inside `Body` on failure |

The `Header` is where most of the interesting enterprise patterns live. WS-Security puts credentials here. WS-Addressing puts routing instructions here. WS-ReliableMessaging puts sequence numbers here.

---

## WSDL — The Contract

A **WSDL** (Web Services Description Language) file is a machine-readable contract that describes everything a client needs to call a service.

```
WSDL
├── types          → XML Schema definitions for request/response shapes
├── message        → Named collections of typed parts
├── portType       → Abstract interface — operations and their messages
├── binding        → Concrete protocol details (SOAP 1.1 or 1.2, encoding)
└── service        → Endpoint URL(s)
```

Think of `portType` as the interface and `binding` as the implementation. This separation means the same abstract interface can, in theory, be bound to different transports.

### Complete WSDL example — two operations

The Payment Service exposes two operations: `ProcessPayment` (submit a new payment) and `GetTransactionStatus` (look up an existing one by ID).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions
  xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:tns="http://example.com/payments"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  targetNamespace="http://example.com/payments"
  name="PaymentService">

  <!-- ═══════════════════════════════════════════════
       1. TYPES — XML Schema for all message shapes
  ═══════════════════════════════════════════════ -->
  <types>
    <xsd:schema targetNamespace="http://example.com/payments">

      <!-- ── ProcessPayment request ── -->
      <xsd:element name="ProcessPayment">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="Amount"      type="xsd:decimal"/>
            <xsd:element name="Currency"    type="xsd:string"/>   <!-- ISO 4217, e.g. AUD -->
            <xsd:element name="AccountFrom" type="xsd:string"/>
            <xsd:element name="AccountTo"   type="xsd:string"/>
            <xsd:element name="Reference"   type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <!-- ── ProcessPayment response ── -->
      <xsd:element name="ProcessPaymentResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="TransactionId"   type="xsd:string"/>
            <xsd:element name="Status"          type="xsd:string"/>  <!-- APPROVED | DECLINED | PENDING -->
            <xsd:element name="ApprovedAmount"  type="xsd:decimal"/>
            <xsd:element name="Currency"        type="xsd:string"/>
            <xsd:element name="Timestamp"       type="xsd:dateTime"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <!-- ── GetTransactionStatus request ── -->
      <xsd:element name="GetTransactionStatus">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="TransactionId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <!-- ── GetTransactionStatus response ── -->
      <xsd:element name="GetTransactionStatusResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="TransactionId" type="xsd:string"/>
            <xsd:element name="Status"        type="xsd:string"/>
            <xsd:element name="Amount"        type="xsd:decimal"/>
            <xsd:element name="Currency"      type="xsd:string"/>
            <xsd:element name="AccountFrom"   type="xsd:string"/>
            <xsd:element name="AccountTo"     type="xsd:string"/>
            <xsd:element name="CreatedAt"     type="xsd:dateTime"/>
            <xsd:element name="UpdatedAt"     type="xsd:dateTime"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <!-- ── Shared fault type used by both operations ── -->
      <xsd:element name="PaymentFault">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="Code"    type="xsd:string"/>  <!-- e.g. INVALID_CURRENCY, NOT_FOUND -->
            <xsd:element name="Message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

    </xsd:schema>
  </types>

  <!-- ═══════════════════════════════════════════════
       2. MESSAGES — named wrappers around schema elements
  ═══════════════════════════════════════════════ -->
  <message name="ProcessPaymentRequest">
    <part name="parameters" element="tns:ProcessPayment"/>
  </message>
  <message name="ProcessPaymentResponse">
    <part name="parameters" element="tns:ProcessPaymentResponse"/>
  </message>

  <message name="GetTransactionStatusRequest">
    <part name="parameters" element="tns:GetTransactionStatus"/>
  </message>
  <message name="GetTransactionStatusResponse">
    <part name="parameters" element="tns:GetTransactionStatusResponse"/>
  </message>

  <!-- Fault message is shared across operations -->
  <message name="PaymentFault">
    <part name="fault" element="tns:PaymentFault"/>
  </message>

  <!-- ═══════════════════════════════════════════════
       3. PORT TYPE — abstract interface (like a Java interface)
  ═══════════════════════════════════════════════ -->
  <portType name="PaymentPort">

    <operation name="ProcessPayment">
      <documentation>Submit a new payment between two accounts.</documentation>
      <input  message="tns:ProcessPaymentRequest"/>
      <output message="tns:ProcessPaymentResponse"/>
      <fault  name="PaymentFault" message="tns:PaymentFault"/>
    </operation>

    <operation name="GetTransactionStatus">
      <documentation>Retrieve the current status of a previously submitted transaction.</documentation>
      <input  message="tns:GetTransactionStatusRequest"/>
      <output message="tns:GetTransactionStatusResponse"/>
      <fault  name="PaymentFault" message="tns:PaymentFault"/>
    </operation>

  </portType>

  <!-- ═══════════════════════════════════════════════
       4. BINDING — concrete protocol: SOAP 1.1, document/literal
  ═══════════════════════════════════════════════ -->
  <binding name="PaymentBinding" type="tns:PaymentPort">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>

    <operation name="ProcessPayment">
      <soap:operation soapAction="http://example.com/payments/ProcessPayment"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
      <fault name="PaymentFault">
        <soap:fault name="PaymentFault" use="literal"/>
      </fault>
    </operation>

    <operation name="GetTransactionStatus">
      <soap:operation soapAction="http://example.com/payments/GetTransactionStatus"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
      <fault name="PaymentFault">
        <soap:fault name="PaymentFault" use="literal"/>
      </fault>
    </operation>

  </binding>

  <!-- ═══════════════════════════════════════════════
       5. SERVICE — the actual network endpoint
  ═══════════════════════════════════════════════ -->
  <service name="PaymentService">
    <port name="PaymentPort" binding="tns:PaymentBinding">
      <soap:address location="https://api.example.com/payments/v1"/>
    </port>
  </service>

</definitions>
```

### Reading the WSDL

- **types** defines the schema. Both operations share the `PaymentFault` fault element — define shared types once.
- **messages** are thin wrappers — each just points to one schema element using the `document/literal` pattern.
- **portType** is the abstract interface. Notice each operation explicitly names its input, output, *and* fault — error paths are first-class citizens.
- **binding** wires the abstract interface to SOAP 1.1 over HTTP. The `soapAction` header tells intermediaries and firewalls which operation is being invoked without parsing the body.
- **service** gives the single network address. A service can expose multiple ports (e.g. HTTP and JMS) each with a different binding.

---

## Binding Styles

When WSDL describes *how* to serialise a message over the wire, you choose a **binding style**:

| Style | What goes in the body | Use when |
|---|---|---|
| `document / literal` | Entire XML document, validated by schema | Modern standard; tooling-friendly |
| `rpc / literal` | Wrapper element named after the operation | Legacy; still common in older systems |
| `rpc / encoded` | SOAP encoding rules (deprecated) | Avoid — interop nightmare |

**Default to `document/literal wrapped`** in any new SOAP service. It gives you full schema validation and plays nicely with every major SOAP stack.

The WSDL above uses `document/literal`. Notice how the `<input>` body in the binding just says `use="literal"` with no encoding rules — the schema in `<types>` is the single source of truth for message shape.

---

## Fault Handling

A SOAP fault is the protocol-level equivalent of an HTTP error status — but with much richer structure. Here are two complete fault examples, one for each `faultcode` class.

**`soap:Client` fault** — the caller sent a bad request (don't retry as-is):

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments">

  <soap:Header>
    <ex:CorrelationId>txn-2026-00841</ex:CorrelationId>
  </soap:Header>

  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>Validation failed on incoming request</faultstring>
      <detail>
        <ex:PaymentFault>
          <ex:Code>INVALID_CURRENCY</ex:Code>
          <ex:Message>
            'AUX' is not a recognised ISO 4217 currency code.
            Valid examples: AUD, USD, EUR, GBP.
          </ex:Message>
        </ex:PaymentFault>
      </detail>
    </soap:Fault>
  </soap:Body>

</soap:Envelope>
```

**`soap:Server` fault** — the server had an internal error (may be safe to retry):

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments">

  <soap:Header>
    <ex:CorrelationId>txn-2026-00999</ex:CorrelationId>
  </soap:Header>

  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>An internal error occurred processing the payment</faultstring>
      <detail>
        <ex:PaymentFault>
          <ex:Code>DOWNSTREAM_TIMEOUT</ex:Code>
          <ex:Message>
            The upstream clearing house did not respond within 30 seconds.
            Please retry using the same CorrelationId to check idempotency.
          </ex:Message>
        </ex:PaymentFault>
      </detail>
    </soap:Fault>
  </soap:Body>

</soap:Envelope>
```

`faultcode` has two top-level values you need to know:
- **`soap:Client`** — the caller sent a bad request (don't retry as-is)
- **`soap:Server`** — the server had an internal error (may be safe to retry)

The `<detail>` element is your extensibility point. Map it to the `PaymentFault` schema element defined in the WSDL's `<types>` section so clients can deserialise it automatically from generated stubs.

---

## WS-Security

WS-Security (WSS) is the most commonly encountered WS-* extension. It lets you attach security tokens directly to the SOAP header — useful when the transport (e.g. an ESB hop) isn't end-to-end TLS.

Common patterns:

```
Username Token        → Basic username/password, often with digest hashing
X.509 Certificate     → Asymmetric signing and encryption of the message body
SAML Assertion        → Federated identity; token issued by a trusted IdP
Kerberos Token        → Enterprise SSO via Kerberos tickets
```

### Username Token example (digest password)

This is the most common pattern for service-to-service authentication where PKI isn't in place:

```xml
<soap:Header>
  <wsse:Security
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
    xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
    soap:mustUnderstand="1">

    <wsse:UsernameToken wsu:Id="UsernameToken-1">
      <wsse:Username>payment-gateway</wsse:Username>
      <!-- PasswordDigest = Base64(SHA-1(nonce + created + password)) -->
      <wsse:Password
        Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">
        aGFzaGVkcGFzc3dvcmQ=
      </wsse:Password>
      <!-- Nonce prevents replay attacks -->
      <wsse:Nonce
        EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">
        bm9uY2V2YWx1ZQ==
      </wsse:Nonce>
      <!-- Created ties the nonce to a point in time; server rejects stale tokens -->
      <wsu:Created>2026-01-23T13:00:00Z</wsu:Created>
    </wsse:UsernameToken>

  </wsse:Security>
</soap:Header>
```

### X.509 Signature example (message-level integrity)

When a message hops through an ESB or intermediary you can't always trust the transport. Signing the body with an X.509 certificate proves the payload arrived unmodified:

```xml
<soap:Header>
  <wsse:Security
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
    xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    soap:mustUnderstand="1">

    <!-- The certificate used to sign -->
    <wsse:BinarySecurityToken
      wsu:Id="X509Token-1"
      EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary"
      ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3">
      MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIBCgKCAQEA...
    </wsse:BinarySecurityToken>

    <ds:Signature>
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
        <!-- Points to the Body element by ID -->
        <ds:Reference URI="#Body-1">
          <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
          <ds:DigestValue>cGF5bG9hZGRpZ2VzdA==</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
      <ds:SignatureValue>c2lnbmF0dXJldmFsdWU=</ds:SignatureValue>
      <ds:KeyInfo>
        <wsse:SecurityTokenReference>
          <wsse:Reference URI="#X509Token-1"/>
        </wsse:SecurityTokenReference>
      </ds:KeyInfo>
    </ds:Signature>

  </wsse:Security>
</soap:Header>

<!-- The Body carries a wsu:Id so the Signature Reference can point to it -->
<soap:Body wsu:Id="Body-1"
  xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
  <ex:ProcessPayment>
    <ex:Amount>99.95</ex:Amount>
    <ex:Currency>AUD</ex:Currency>
    <ex:AccountFrom>ACC-001122</ex:AccountFrom>
    <ex:AccountTo>ACC-998877</ex:AccountTo>
    <ex:Reference>INV-2026-0042</ex:Reference>
  </ex:ProcessPayment>
</soap:Body>
```

A signed body means integrity is guaranteed at the **message** level, not just the transport level — the message can pass through intermediaries and arrive provably unmodified.

---

## MEPs — Message Exchange Patterns

SOAP operations aren't always request/response. The four standard MEPs:

| Pattern | Description | Example |
|---|---|---|
| Request–Response | Client sends, server replies | `ProcessPayment` above |
| One-Way | Client fires and forgets | Audit log submission |
| Solicit–Response | Server initiates, client replies | Rare; mostly async callbacks |
| Notification | Server pushes with no reply | Event streams |

### One-Way example — Audit Log Submission

A one-way operation has only an `<input>` in the WSDL `portType` — no `<output>` or `<fault>`. The HTTP response is a `202 Accepted` with an empty body.

**WSDL portType addition:**

```xml
<portType name="PaymentPort">

  <!-- ... existing operations ... -->

  <operation name="SubmitAuditEvent">
    <documentation>
      Fire-and-forget audit submission. No response is returned.
      Guaranteed delivery is handled by WS-ReliableMessaging at the transport layer.
    </documentation>
    <input message="tns:SubmitAuditEventRequest"/>
    <!-- No <output> or <fault> — this is a one-way operation -->
  </operation>

</portType>
```

**WSDL binding addition:**

```xml
<operation name="SubmitAuditEvent">
  <soap:operation soapAction="http://example.com/payments/SubmitAuditEvent"/>
  <input>
    <soap:body use="literal"/>
  </input>
  <!-- No <output> or <fault> binding elements -->
</operation>
```

**Request message:**

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments">

  <soap:Header>
    <ex:CorrelationId>audit-2026-00058</ex:CorrelationId>
  </soap:Header>

  <soap:Body>
    <ex:SubmitAuditEvent>
      <ex:EventType>PAYMENT_APPROVED</ex:EventType>
      <ex:TransactionId>TXN-20260123-98732</ex:TransactionId>
      <ex:Actor>payment-gateway</ex:Actor>
      <ex:Timestamp>2026-01-23T13:00:00+10:00</ex:Timestamp>
    </ex:SubmitAuditEvent>
  </soap:Body>

</soap:Envelope>
```

The server returns HTTP `202 Accepted` with no SOAP body — the client doesn't block waiting for a result.

In practice, almost everything you'll encounter is **Request–Response**. One-Way shows up in async messaging over JMS or MQ transports.

---

## Transport Independence

SOAP is transport-agnostic. While HTTP(S) is standard, SOAP messages can travel over:

- **JMS / MQ** — reliable async messaging in enterprise buses
- **SMTP** — email-based workflows (mostly historical)
- **Raw TCP** — custom transports in embedded/legacy contexts

### JMS binding example

The WSDL `service` element can declare a JMS endpoint alongside the HTTP one — the same abstract `portType` and `binding` are reused:

```xml
<service name="PaymentService">

  <!-- Standard HTTPS endpoint -->
  <port name="PaymentHttpPort" binding="tns:PaymentBinding">
    <soap:address location="https://api.example.com/payments/v1"/>
  </port>

  <!-- Async JMS endpoint for high-volume batch submissions -->
  <port name="PaymentJmsPort" binding="tns:PaymentBinding">
    <!--
      JMS addressing uses a vendor extension element.
      This example uses Apache CXF's JMS transport extension.
    -->
    <jms:address
      xmlns:jms="http://cxf.apache.org/transports/jms"
      destinationStyle="queue"
      jndiConnectionFactoryName="jms/PaymentConnectionFactory"
      jndiDestinationName="jms/PaymentRequestQueue"
      replyToName="jms/PaymentReplyQueue"/>
  </port>

</service>
```

This is why enterprises adopted SOAP for ESB (Enterprise Service Bus) architectures — you could route the same message format across wildly different channels. The payment message above is identical whether it's sent over HTTPS or dropped onto a JMS queue; only the `<service>` endpoint declaration changes.

---

## SOAP vs REST — When to Reach for Each

| | SOAP | REST |
|---|---|---|
| Contract | Formal WSDL, strict schema | Optional OpenAPI, flexible |
| Message format | XML only | JSON, XML, anything |
| Statefulness | Can model stateful conversations | Stateless by design |
| Security | WS-Security (message-level) | OAuth 2.0, TLS (transport-level) |
| Reliability | WS-ReliableMessaging built-in | Application-layer concern |
| Transactions | WS-AtomicTransaction | Application-layer concern |
| Tooling | Strong in Java/.NET enterprise stacks | Universal |
| Use cases | Finance, healthcare, government, telcos | Public APIs, mobile backends, microservices |

Choose SOAP when:
- You need **formal, auditable contracts** (regulatory environments)
- You need **message-level security** across intermediaries
- You're integrating with an existing enterprise system that already speaks SOAP
- You need **built-in WS-ReliableMessaging** guarantees

Choose REST when:
- You're building public-facing APIs
- Your clients are browsers or mobile apps
- Developer experience and iteration speed matter most

---

## Tooling Quick Reference

| Tool | Purpose |
|---|---|
| **wsdl2java** (Apache CXF) | Generate Java client stubs from WSDL |
| **wsimport** (JAX-WS) | Built-in JDK tool for the same |
| **dotnet-svcutil** | .NET equivalent |
| **SoapUI / ReadyAPI** | Manual testing, contract validation, mocking |
| **Postman** | Supports raw SOAP requests |
| **Wireshark** | Packet-level debugging of SOAP over HTTP |
| **XML Spy / Oxygen** | Schema and WSDL editing |

**`wsdl2java` quickstart** (Apache CXF):

```bash
# Generate client stubs from a remote WSDL
wsdl2java -client \
  -d src/main/java \
  -p com.example.payments.client \
  https://api.example.com/payments/v1?wsdl

# Files generated:
#   PaymentPort.java          ← the Java interface (mirrors portType)
#   PaymentService.java       ← service locator (mirrors <service>)
#   ProcessPayment.java       ← request JAXB class
#   ProcessPaymentResponse.java
#   GetTransactionStatus.java
#   GetTransactionStatusResponse.java
#   PaymentFault.java         ← fault JAXB class
#   PaymentFault_Exception.java ← Java exception wrapper
```

**Generated Java usage:**

```java
PaymentService service = new PaymentService();
PaymentPort port = service.getPaymentPort();

// Inject WS-Security via handler (CXF interceptor omitted for brevity)

ProcessPayment request = new ProcessPayment();
request.setAmount(new BigDecimal("99.95"));
request.setCurrency("AUD");
request.setAccountFrom("ACC-001122");
request.setAccountTo("ACC-998877");
request.setReference("INV-2026-0042");

try {
    ProcessPaymentResponse response = port.processPayment(request);
    System.out.println("Transaction ID : " + response.getTransactionId());
    System.out.println("Status         : " + response.getStatus());
} catch (PaymentFault_Exception e) {
    PaymentFault fault = e.getFaultInfo();
    if ("INVALID_CURRENCY".equals(fault.getCode())) {
        // soap:Client fault — fix the request, do not retry
    } else {
        // soap:Server fault — may be safe to retry with backoff
    }
}
```

---

## Key Takeaways

- SOAP is a **protocol with formal guarantees** — envelope structure, typed contracts via WSDL, and a rich WS-* extension ecosystem
- Always use **document/literal wrapped** binding style in new services
- **WS-Security** provides message-level integrity and confidentiality that survives multi-hop routing — Username Tokens for service identity, X.509 signatures for tamper-proof payloads
- SOAP faults are structured — use `faultcode` to distinguish client vs server errors and map `<detail>` to your schema-defined fault type
- SOAP and REST are **complementary tools** — SOAP dominates wherever regulatory compliance, formal contracts, or complex enterprise integration patterns are required
