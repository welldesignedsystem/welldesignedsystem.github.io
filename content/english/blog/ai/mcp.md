+++
date = '2026-01-01T12:44:47+10:00'
draft = false
title = 'Model Context Protocol'
tags = ['MCP', 'Agents', 'Design Patterns', 'AI']
summary = "Model Context Protocol - Notes, Best Practices, Design Patterns."
+++

## Introduction
Model Context Protocol is an open standard protocol that aims to provide a universal approach for applications to provide context to language models.  

MCP is built around Javascript Object Notation Remote Procedure Call (JSON-RPC 2.0) and so it's transport agnostic. It just defines the schema driven messages for client server communication. 
It is usually implemented as: 
- Streamable HTTP
- WebSockets
- STDIO
- Server Sent Events (SSE) etc.

Having said that there is nothing stopping you from using protocols such as gRPC etc. provided they treated just as the transport layer and the messages are in JSON-RPC 2.0 format.
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
    Note right of Client: JSON-RPC request\ncapabilities, protocolVersion

    Server-->>Client: initialize (response)
    Note left of Server: serverInfo,\ncapabilities

    Client->>Server: initialized (notification)
    Note right of Client: No response expected
```

## References
1. [![Learn model context protocol with python](../img/learn_model_context_protocol_with_python_book.png)](https://drive.google.com/file/d/1DvwJ7qGYjk-diFtssDM7GEjlaTbYUjqP/view?usp=drive_link)
    * [Source Code](https://github.com/PacktPublishing/Learn-Model-Context-Protocol-with-Python/tree/main)
2. [Official Documentation](https://github.com/modelcontextprotocol/modelcontextprotocol)