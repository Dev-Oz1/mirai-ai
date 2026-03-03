import time
import httpx
from ..config import settings


class AIService:
    """
    AI Service that supports multiple providers (free and paid)
    """

    @staticmethod
    def generate_text(
            prompt: str,
            max_tokens: int = 1500,
            temperature: float = 0.7,
            use_premium: bool = False
    ) -> str:
        """
        Generate text using AI

        Args:
            prompt: The prompt to send to the AI
            max_tokens: Maximum tokens to generate
            temperature: Creativity (0.0-1.0)
            use_premium: If True and available, use paid AI

        Returns:
            Generated text
        """

        # Use premium AI if requested and API key available
        if use_premium and settings.ANTHROPIC_API_KEY:
            return AIService._generate_with_anthropic(prompt, max_tokens, temperature)

        provider = (settings.AI_PROVIDER or "").strip().lower()
        if provider in {"huggingface", "hf", "hugging_face"}:
            return AIService._generate_with_huggingface(prompt, max_tokens, temperature)

        # Backward-compatible fallback
        return AIService._generate_with_ollama(prompt, max_tokens, temperature)

    @staticmethod
    def _generate_with_huggingface(prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate text using Hugging Face Router chat completions API."""
        if not settings.HUGGINGFACE_API_KEY:
            raise Exception("HUGGINGFACE_API_KEY is not configured")

        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        url = "https://router.huggingface.co/v1/chat/completions"
        models_to_try = []
        if settings.HUGGINGFACE_MODEL:
            models_to_try.append(settings.HUGGINGFACE_MODEL)
        models_to_try.extend([
            "meta-llama/Llama-3.1-8B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3",
        ])

        # Preserve order but remove duplicates
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

        try:
            last_error = None
            with httpx.Client(timeout=90.0) as client:
                for model in models_to_try:
                    payload = {
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "top_p": 0.95,
                    }
                    print(f"Using Hugging Face model: {model}")
                    response = client.post(url, headers=headers, json=payload)

                    if response.status_code == 503:
                        time.sleep(20)
                        response = client.post(url, headers=headers, json=payload)

                    if response.status_code == 404:
                        last_error = f"Model not found on router: {model}"
                        continue

                    if response.status_code in {401, 403}:
                        raise Exception("Hugging Face API key is invalid or lacks access")

                    response.raise_for_status()
                    result = response.json()

                    choices = result.get("choices", []) if isinstance(result, dict) else []
                    if choices and choices[0].get("message", {}).get("content"):
                        return choices[0]["message"]["content"]

                    last_error = f"Empty completion response for model: {model}"

            tried = ", ".join(models_to_try)
            raise Exception(last_error or f"No response from Hugging Face. Tried models: {tried}")

        except Exception as e:
            raise Exception(f"Hugging Face AI generation failed: {str(e)}")

    @staticmethod
    def _generate_with_ollama(prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate text using Ollama (FREE)"""
        try:
            import ollama

            print(f"Using Ollama model: {settings.OLLAMA_MODEL}")

            response = ollama.chat(
                model=settings.OLLAMA_MODEL,
                messages=[
                    {
                        'role': 'user',
                        'content': prompt,
                    },
                ],
                options={
                    'temperature': temperature,
                    'num_predict': max_tokens,
                }
            )

            generated_text = response['message']['content']
            print(f"Generated {len(generated_text)} characters")

            return generated_text

        except Exception as e:
            raise Exception(f"Ollama AI generation failed: {str(e)}")

    @staticmethod
    def _generate_with_anthropic(prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate text using Anthropic Claude (PAID)"""
        try:
            from anthropic import Anthropic

            client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return message.content[0].text

        except Exception as e:
            raise Exception(f"Anthropic AI generation failed: {str(e)}")

    @staticmethod
    def is_premium_available() -> bool:
        """Check if premium AI is available"""
        return bool(settings.ANTHROPIC_API_KEY)
