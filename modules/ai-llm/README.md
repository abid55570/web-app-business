# ai-llm

Implements `ai-llm@v1`. Server-side proxy to Anthropic + OpenAI. Single
chat endpoint, every call logged for cost attribution, per-(user, day)
request cap.

FastAPI-only in v1. Django adapter ships in wave 2.

## Public endpoints (`/api`)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| POST | `/ai/chat` | signed-in | `{ provider?, model?, messages, maxTokens?, temperature? }` → `{ message, inputTokens, outputTokens, latencyMs }`. |
| GET | `/ai/usage/my` | signed-in | `{ userId, usedLast24h }`. |

## Admin (`/api/admin`)

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/ai/usage?userId=&limit=` | Full usage history with optional user filter. |

## Events emitted

- `ai.completion`    `{ id, userId, provider, model, inputTokens, outputTokens }`
- `ai.rate-limited`  `{ userId, used, cap }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `daily_request_cap` | `200` | 0 disables limiting. Override via `AI_DAILY_REQUEST_CAP` env. |
| `default_provider` | `"anthropic"` | Override via `AI_DEFAULT_PROVIDER` env. |
| `default_model` | `"claude-3-5-sonnet-latest"` | Override via `AI_DEFAULT_MODEL` env. |

## Env

- `ANTHROPIC_API_KEY` — required when provider=anthropic.
- `OPENAI_API_KEY` — required when provider=openai.

## Replacing the stub

The shipped `service.call_provider()` returns a deterministic echo so
tests pass without API keys. In production, replace with:

```python
from anthropic import AsyncAnthropic
import os

_client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

async def call_provider(*, provider, model, messages, max_tokens, temperature, **_):
    resp = await _client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[m.model_dump() for m in messages],
    )
    return (
        Message(role="assistant", content=resp.content[0].text),
        resp.usage.input_tokens,
        resp.usage.output_tokens,
    )
```

## Pairs with

- `tenants` (optional) — switch `daily_request_cap` per plan.
- `audit-log` (optional) — log `ai.completion` for compliance.
- `feature-flags` (optional) — gate the chat UI behind a rollout flag.
