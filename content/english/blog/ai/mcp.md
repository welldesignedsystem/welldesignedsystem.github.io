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

### Transports
It is usually implemented as: 
- Streamable HTTP
- STDIO
- Server Sent Events (SSE) + HTTP.
- WebSockets (experimental - as persistent real time connectivity may be an overkill) etc.

All the above are common in that:
- they can operate on streams and support bidirectional communication.
- can handle reconnection handling.
- they can accomodate JSON-RPC messages in their payloads.
- Session Management
- supported in mcp.json file (websockets - experimental).
- **Supergateway** 
  - Open source CLI which acts as bridge or adatptor convertor for MCP servers 
  - e.g. STDIO->Streamable HTTP, STDIO->WS). 
  - It allows running with Docker.

There might be some Transports not ideal for MCP:
- gRPC as it may require extra work to directly support JSON-RPC
- Messaging Queues (without reply queues) as they dont support RPC pattern
- UDP (without custom bidirectional protocol)
- ICMP - No Session Management
- FTP - Block Transfer Protocol
- Email - Async, unidirectional and slow.
- Server Sent Events (without HTTP) - Unidirectional and may not support all features of JSON-RPC.
- Webhooks
- Polling based HTTP etc.

[MCP Implementation and list of Servers](https://github.com/modelcontextprotocol/servers)
## Communication Message Spec 
### Class Diagram Grouped
![Class diagram](https://raw.githubusercontent.com/welldesignedsystem/silver-lamp/refs/heads/main/misc/MCP_Grouped.svg)

### Class Diagram Original
![Class diagram](https://raw.githubusercontent.com/welldesignedsystem/silver-lamp/refs/heads/main/misc/MCP_Original.svg)

## Streamable HTTP
This protocol has replaced the Server Sent Events (SSE) + HTTP transport as the recommended transport for MCP because:
- **Single Endpoint Simplicity**: client and servers communicate via single endpoint (e.g., /mcp) for all interactions, eliminating the need for separate endpoints for requests and notifications.
- **Resumability**: Support for resumable sessions using headers like Last-Event-ID, Mcp-Session-ID allowing clients to recover from disconnections without losing context.
- **Compatibility**: support for Modern HTTP Infrastucture - loadbalancers, proxies, API Gateways, CDNs etc where SSEs may face challenges.
- **Bidirectional Communication**: SSE is unidirectional, Streamable HTTP can be upgraded to support bidirectional communication, allowing servers to send messages to clients without the need for clients to poll for updates. This makes it apt for agent-to-agent or client-server interaction.
- **Future Proofing**: It is modular and extendable and designed for stateless or session based models

### Accept Header: 
  - **Accept: application/json**: 
    - Tells Server that client can handle batch JSON Response. 
    - Entire response is buffered and sent as a complete JSON object once it's fully ready. 
    - The client waits for the whole thing before processing.
- **Accept: text/event-stream**: 
  - Tells Server that client can handle Streamed events (via SSE). 
  - Uses Server-Sent Events (SSE) to stream data incrementally. 
  - As soon as each chunk/event is available, it's sent to the client immediately, allowing for real-time progressive updates

### Challenges of MCP:
- **Things have to be  just right** 
  - Give it too much tools, verbose responses, and it get overwhelmed and lead to slower response times. 
  - Give it too little and it can't do the job.
- Protocol is complex and have layers of serialization, validation and error handling.
- MCP and libraries are fast evolving and changing.
  - e.g. SSE transport was introduced somewhere in Nov 2024 and deprecated in favor of Streamable HTTP in March 2025.
  - [Upgrade Guide](https://gofastmcp.com/development/upgrade-guide)

## MCP Usecase
Context Managent for multiple usecases within a company.

### Architecture Diagram
![MCP](https://github.com/welldesignedsystem/silver-lamp/blob/main/misc/01_mcp.png?raw=true)

#### llms.txt  
llms.txt is a proposed standard for adding a Markdown file at /llms.txt on a website to provide LLM-friendly content so AI models can better understand a site at inference time, it contains
  - brief background info (llms.txt)
  - links to detailed resources. (llms-full.txt)
Similar to - robots.txt (Robots Exclusion Protocol) or sitemap.xml(list of websites important URLs for search engines to find, crawl and index efficiently)

e.g.
- FastMCP
  - [llms.txt](https://gofastmcp.com/llms.txt)
  - [llms-full.txt](https://gofastmcp.com/llms-full.txt)
- Langgraph
  - [llms.txt](https://langchain-ai.github.io/langgraph/llms.txt)
  - [llms-full.txt](https://langchain-ai.github.io/langgraph/llms-full.txt)
- [Directory](https://directory.llmstxt.cloud/)

**Advantages**
- Solves the context window problem - provides a clean, concise alternative.
- Token Efficiency
- Accuracy of question answering about your contents.
- Control over how your content is represented
- Good for Developer docs and APIs. If you have a REST or GraphQL reference llms.txt can point crawler to endpoints, versioned path.

### Exposing LLM.txt as MCP Server
![MCP](https://github.com/welldesignedsystem/silver-lamp/blob/main/misc/02_mcp-llm-txt.png?raw=true)

### Testing MCP Server with LLM.txt Inspector
![MCP](https://github.com/welldesignedsystem/silver-lamp/blob/main/misc/03_llm-txt-inspector-result.png?raw=true)

### Testing MCP Server with PyCharm MCP Plugin
![MCP](https://github.com/welldesignedsystem/silver-lamp/blob/main/misc/04_pycharm_mcp.png?raw=true)

## References
2. [![Learn model context protocol with python](../img/learn_model_context_protocol_with_python_book.png)](https://drive.google.com/file/d/1DvwJ7qGYjk-diFtssDM7GEjlaTbYUjqP/view?usp=drive_link)
    * [Source Code](https://github.com/PacktPublishing/Learn-Model-Context-Protocol-with-Python/tree/main)
2. [Official Documentation](https://github.com/modelcontextprotocol/modelcontextprotocol)