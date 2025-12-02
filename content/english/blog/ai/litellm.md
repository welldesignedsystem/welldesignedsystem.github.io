+++
date = '2025-12-02T12:00:00+10:00'
draft = false
title = 'LiteLLM'
tags = ['LiteLLM', 'LLM', 'Edge', 'Inference', 'AI']
summary = "LiteLLM explores lightweight large-language-model approaches focused on efficiency, deployability, and fast iteration—ideal for on-device inference, constrained environments, and rapid prototyping."
+++

Universal translator for AI models. Connects to over 100+ model providers and runtimes with a simple, consistent API.

### Advantages:
- built in cost tracking and usage monitoring
- Automatic fail-over between providers
- Self-hosted option for privacy and control

Alternative to  LiteLLM include OpenRouter

### Prerequisites
Ensure Gemini is accessible and you have an API key.
```bash
gcloud auth application-default login

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={PASTE_KEY_HERE}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello!"
      }]
    }]
  }'
```

## Usage options
### LiteLLM Python SDK
you can use LiteLLM as a Python package to integrate with your applications. Similar to using Langchain or other LLM SDKs.

### LiteLLM Proxy Server
Using LiteLLM this way is also called LLM Gateway.
Advantages:
- Hooks for auth
- Hooks for logging
- Cost tracking
- Rate limiting

#### Generating a Key 
```yaml
  model_list:
    - model_name: gpt-4
      litellm_params:
          model: ollama/llama2
    - model_name: gpt-3.5-turbo
      litellm_params:
          model: ollama/llama2
    
  general_settings: 
    master_key: sk-1234 
    database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # 👈 KEY CHANGE
```
#### Generate Keys
```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["gpt-3.5-turbo", "gpt-4"], "metadata": {"user": "ishaan@berri.ai"}}'
```
#### With RPM Limit
```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "rpm_limit": 1
}'```

#### Start Litellm
```bash
litellm --config /path/to/config.yaml
```
#### Key/User/Team Spend tracking
```bash
  curl 'http://0.0.0.0:4000/key/info?key=<user-key>' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
     
  curl --location 'http://localhost:4000/user/new' \
    --header 'Authorization: Bearer <your-master-key>' \
    --header 'Content-Type: application/json' \
    --data-raw '{user_email: "krrish@berri.ai"}'
    
  curl --location 'http://localhost:4000/team/new' \
    --header 'Authorization: Bearer <your-master-key>' \
    --header 'Content-Type: application/json' \
    --data-raw '{"team_alias": "my-awesome-team"}'     
```

#### Sample Response
```json
{
    "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
    "info": {
        "token": "sk-tXL0wt5-lOOVK9sfY2UacA",
        "spend": 0.0001065, # 👈 SPEND
        "expires": "2023-11-24T23:19:11.131000Z",
        "models": [
            "gpt-3.5-turbo",
            "gpt-4",
            "claude-2"
        ],
        "aliases": {
            "mistral-7b": "gpt-3.5-turbo"
        },
        "config": {}
    }
}
```

### Docker
```yaml
model_list:
  - model_name: gemini-flash
    litellm_params:
      model: gemini/gemini-2.0-flash-exp
      api_key: ${GEMINI_API_KEY}
```
```bash
docker rm -f litellm || true

docker run -d \
  --name litellm \
  -p 4000:4000 \
  --env-file .env \
  -v $(pwd)/litellm_config.yml:/app/config.yml:ro \
  ghcr.io/berriai/litellm:main-latest \
  --config /app/config.yml \
  --port 4000 \
  --host 0.0.0.0 
  
docker logs -f litellm
```
### Testing 
```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-flash",
    "messages": [{"role": "user", "content": "Say hello!"}]
  }'
```

## Using Tags with Langchain
### OpenAI Chat Model with Metadata Tags
```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

os.environ['OPENAI_API_KEY'] = "sk-your-key-here"

chat = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["production", "customer-support", "high-priority"]
        }
    }
)

messages = [
    SystemMessage(content="You are a helpful customer support assistant."),
    HumanMessage(content="How do I reset my password?")
]

response = chat.invoke(messages)
print(response)
```

### LiteLLM proxy with Metadata Tags
```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# No API key needed when using proxy
chat = ChatOpenAI(
    openai_api_base="http://localhost:4000",  # Your proxy URL
    model="gpt-4o",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["proxy", "team-alpha", "feature-flagged"],
            "generation_name": "customer-onboarding",
            "trace_user_id": "user-12345"
        }
    }
)

messages = [
    SystemMessage(content="You are an onboarding assistant."),
    HumanMessage(content="Welcome our new customer!")
]

response = chat.invoke(messages)
print(response)
```

## Routing and Fallbacks
Use this to set budgets for LLM Providers example $100 per day for OpenAI, $100 per day for Azure.

### Budget Routing
```yaml
model_list:
    - model_name: gpt-3.5-turbo
      litellm_params:
        model: openai/gpt-3.5-turbo
        api_key: os.environ/OPENAI_API_KEY

router_settings:
  provider_budget_config: 
    openai: 
      budget_limit: 0.000000000001 # float of $ value budget for time period
      time_period: 1d # can be 1d, 2d, 30d, 1mo, 2mo
    azure:
      budget_limit: 100
      time_period: 1d
    anthropic:
      budget_limit: 100
      time_period: 10d
    vertex_ai:
      budget_limit: 100
      time_period: 12d
    gemini:
      budget_limit: 100
      time_period: 12d
  
  # OPTIONAL: Set Redis Host, Port, and Password if using multiple instance of LiteLLM
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

general_settings:
  master_key: sk-1234
```

### Autorouting
```yaml
model_list:
  # Embedding model for semantic routing
  - model_name: custom-text-embedding-model
    litellm_params:
      model: text-embedding-3-large
      api_key: os.environ/OPENAI_API_KEY

  # Target models that auto_router can route to
  - model_name: litellm-gpt-4.1
    litellm_params:
      model: gpt-4.1
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      id: openai-id

  - model_name: litellm-claude-35
    litellm_params:
      model: claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      id: claude-id

  - model_name: litellm-gpt-4o-mini
    litellm_params:
      model: gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      id: openai-mini-id

  # Auto router configuration
  - model_name: auto_router1
    litellm_params:
      model: auto_router/auto_router_1
      auto_router_config_path: router.json
      auto_router_default_model: gpt-4o-mini
      auto_router_embedding_model: custom-text-embedding-model
```

Corresponding json
```json
{
  "routes": [
    {
      "model_ids": ["claude-id"],
      "description": "Route complex reasoning, analysis, and creative writing tasks to Claude",
      "keywords": [
        "analyze",
        "explain in detail",
        "creative writing",
        "essay",
        "reasoning",
        "think through",
        "complex problem"
      ]
    },
    {
      "model_ids": ["openai-id"],
      "description": "Route coding, technical, and structured output tasks to GPT-4",
      "keywords": [
        "code",
        "function",
        "programming",
        "debug",
        "API",
        "JSON",
        "technical documentation"
      ]
    }
  ],
  "default_model_id": "openai-mini-id"
}
```