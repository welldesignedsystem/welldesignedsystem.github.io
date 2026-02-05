+++
date = '2026-01-01T12:44:47+10:00'
draft = false
title = 'Model Context Protocol'
tags = ['MCP', 'Agents', 'Design Patterns', 'AI']
summary = "Model Context Protocol - Notes, Best Practices, Design Patterns."
+++

## Introduction
Model Context Protocol is an open standard protocol that aims to provide a universal approach for applications to provide context to language models.
One advantage of this allows different clients to consume servers built by different vendors that too without needing to worry about compatibility issues.

MCP is built around Javascript Object Notation Remote Procedure Call (JSON-RPC 2.0) and so it's transport agnostic. It just defines the schema driven messages for client server communication. 
It is usually implemented as: 
- Streamable HTTP
- STDIO
- Server Sent Events (SSE) + HTTP.
- WebSockets (though not mentioned in the documentation, as persistent real time connectivity may be an overkill) etc.

There might be some Transports that may feel unnatural to implement MCP such as:
- gRPC as it may require extra work to directly support JSON-RPC
- Messaging Queues (without reply queues) as they dont support RPC pattern
- UDP (without custom bidirectional protocol)
- Email - Async, unidirectional and slow.
- Server Sent Events (without HTTP) - Unidirectional and may not support all features of JSON-RPC.
- Webhooks
- Polling based HTTP etc.

## Communication Message Spec 
### Class Diagram Grouped
![Class diagram](https://raw.githubusercontent.com/welldesignedsystem/silver-lamp/refs/heads/main/misc/MCP_Grouped.svg)

### Class Diagram Original
![Class diagram](https://raw.githubusercontent.com/welldesignedsystem/silver-lamp/refs/heads/main/misc/MCP_Original.svg)

## Initialization process
```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Server

    Client->>Server: initialize (request)
    Note right of Client: JSON-RPC request

    Server-->>Client: initialize (response)
    Note left of Server: serverInfo,\ncapabilities

    Client->>Server: initialized (notification)
    Note right of Client: Fire and Forget - no response expected
```

## References
1. [![Learn model context protocol with python](../img/learn_model_context_protocol_with_python_book.png)](https://drive.google.com/file/d/1DvwJ7qGYjk-diFtssDM7GEjlaTbYUjqP/view?usp=drive_link)
    * [Source Code](https://github.com/PacktPublishing/Learn-Model-Context-Protocol-with-Python/tree/main)
2. [Official Documentation](https://github.com/modelcontextprotocol/modelcontextprotocol)