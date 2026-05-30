"""ai-llm@v1 smoke — relay + usage + rate limit + admin gate."""
import pytest


@pytest.mark.asyncio
async def test_chat_returns_assistant_message(client, customer_headers):
    res = await client.post(
        "/api/ai/chat",
        headers=customer_headers,
        json={"messages": [{"role": "user", "content": "hello there"}]},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["message"]["role"] == "assistant"
    assert body["inputTokens"] > 0


@pytest.mark.asyncio
async def test_anon_cannot_chat(client):
    res = await client.post(
        "/api/ai/chat",
        json={"messages": [{"role": "user", "content": "hi"}]},
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_my_usage_increments(client, customer_headers):
    before = await client.get("/api/ai/usage/my", headers=customer_headers)
    base = before.json()["usedLast24h"]
    await client.post(
        "/api/ai/chat",
        headers=customer_headers,
        json={"messages": [{"role": "user", "content": "hi"}]},
    )
    after = await client.get("/api/ai/usage/my", headers=customer_headers)
    assert after.json()["usedLast24h"] == base + 1


@pytest.mark.asyncio
async def test_admin_usage_requires_admin(client, customer_headers):
    forbidden = await client.get(
        "/api/admin/ai/usage", headers=customer_headers
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_rate_limit_returns_429(client, customer_headers, monkeypatch):
    monkeypatch.setenv("AI_DAILY_REQUEST_CAP", "2")
    for _ in range(2):
        await client.post(
            "/api/ai/chat",
            headers=customer_headers,
            json={"messages": [{"role": "user", "content": "x"}]},
        )
    res = await client.post(
        "/api/ai/chat",
        headers=customer_headers,
        json={"messages": [{"role": "user", "content": "x"}]},
    )
    assert res.status_code == 429
    assert res.json()["detail"]["code"] == "AI_RATE_LIMITED"
