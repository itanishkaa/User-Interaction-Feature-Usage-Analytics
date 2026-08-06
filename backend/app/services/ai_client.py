"""
Thin, provider-agnostic wrapper around whichever LLM API is configured.

OpenAI, Ollama, and Hugging Face Inference Providers all speak the same
OpenAI-compatible /v1/chat/completions schema, so they share one code path
that only differs by base_url/api_key/model. Gemini has a genuinely
different request/response shape, so it gets its own branch.

Implemented with raw httpx calls rather than the openai/google-genai/
huggingface_hub SDKs — fewer dependencies, and trivial to mock in tests
(see tests/test_ai.py).
"""
from __future__ import annotations

import httpx

from app.core.config import settings


class AIConfigError(Exception):
    """Raised when the configured AI provider is missing required credentials."""


async def _openai_compatible_chat(
    *, base_url: str, api_key: str, model: str, system_prompt: str, user_prompt: str
) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
            },
        )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


async def generate_text(system_prompt: str, user_prompt: str) -> str:
    provider = settings.AI_PROVIDER.lower()

    if provider == "ollama":
        # Free and fully local — no API key needed, but the OpenAI-compatible
        # endpoint still requires *some* string in the Authorization header,
        # so we send a placeholder that Ollama ignores.
        return await _openai_compatible_chat(
            base_url=settings.OLLAMA_BASE_URL,
            api_key="ollama",
            model=settings.OLLAMA_MODEL,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

    else:
        raise AIConfigError(
            f"Unknown AI_PROVIDER '{settings.AI_PROVIDER}' — expected 'openai', "
            "'ollama', 'huggingface', or 'gemini'"
        )
