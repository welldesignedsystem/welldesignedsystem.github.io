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

---

## The SOAP Envelope

Every SOAP message is an XML document with a fixed structure:

```xml
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ex="http://example.com/payments">

  <soap:Header>
    <ex:AuthToken>abc-123</ex:AuthToken>
  </soap:Header>

  <soap:Body>
    <ex:ProcessPayment>
      <ex:Amount>99.95</ex:Amount>
      <ex:Currency>AUD</ex:Currency>
    </ex:ProcessPayment>
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

### Reading a WSDL snippet

```xml
<portType name="PaymentPort">
  <operation name="ProcessPayment">
    <input  message="tns:ProcessPaymentRequest"/>
    <output message="tns:ProcessPaymentResponse"/>
    <fault  message="tns:PaymentFault"/>
  </operation>
</portType>
```

Every operation has an explicit `input`, `output`, and `fault` — contracts don't leave error paths as an afterthought.

---

## Binding Styles

When WSDL describes *how* to serialise a message over the wire, you choose a **binding style**:

| Style | What goes in the body | Use when |
|---|---|---|
| `document / literal` | Entire XML document, validated by schema | Modern standard; tooling-friendly |
| `rpc / literal` | Wrapper element named after the operation | Legacy; still common in older systems |
| `rpc / encoded` | SOAP encoding rules (deprecated) | Avoid — interop nightmare |

**Default to `document/literal wrapped`** in any new SOAP service. It gives you full schema validation and plays nicely with every major SOAP stack.

---

## Fault Handling

A SOAP fault is the protocol-level equivalent of an HTTP error status — but with much richer structure.

```xml
<soap:Body>
  <soap:Fault>
    <faultcode>soap:Client</faultcode>
    <faultstring>Invalid currency code</faultstring>
    <detail>
      <ex:PaymentFault>
        <ex:Code>INVALID_CURRENCY</ex:Code>
        <ex:Message>AUX is not a recognised currency</ex:Message>
      </ex:PaymentFault>
    </detail>
  </soap:Fault>
</soap:Body>
```

`faultcode` has two top-level values you need to know:
- **`soap:Client`** — the caller sent a bad request (don't retry as-is)
- **`soap:Server`** — the server had an internal error (may be safe to retry)

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

A signed body means integrity is guaranteed at the **message** level, not just the transport level — the message can pass through intermediaries and arrive provably unmodified.

---

## MEPs — Message Exchange Patterns

SOAP operations aren't always request/response. The four standard MEPs:

| Pattern | Description | Example |
|---|---|---|
| Request–Response | Client sends, server replies | Most service calls |
| One-Way | Client fires and forgets | Audit log submission |
| Solicit–Response | Server initiates, client replies | Rare; mostly async callbacks |
| Notification | Server pushes with no reply | Event streams |

In practice, almost everything you'll encounter is **Request–Response**. One-Way shows up in async messaging over JMS or MQ transports.

---

## Transport Independence

SOAP is transport-agnostic. While HTTP(S) is standard, SOAP messages can travel over:

- **JMS / MQ** — reliable async messaging in enterprise buses
- **SMTP** — email-based workflows (mostly historical)
- **Raw TCP** — custom transports in embedded/legacy contexts

This is why enterprises adopted SOAP for ESB (Enterprise Service Bus) architectures — you could route the same message format across wildly different channels.

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

---

## Key Takeaways

- SOAP is a **protocol with formal guarantees** — envelope structure, typed contracts via WSDL, and a rich WS-* extension ecosystem
- Always use **document/literal wrapped** binding style in new services
- **WS-Security** provides message-level integrity and confidentiality that survives multi-hop routing
- SOAP faults are structured — use `faultcode` to distinguish client vs server errors
- SOAP and REST are **complementary tools** — SOAP dominates wherever regulatory compliance, formal contracts, or complex enterprise integration patterns are required