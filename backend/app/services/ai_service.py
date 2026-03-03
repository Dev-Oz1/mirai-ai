import ollama
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

        # Otherwise use free Ollama
        return AIService._generate_with_ollama(prompt, max_tokens, temperature)

    @staticmethod
    def _generate_with_ollama(prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate text using Ollama (FREE)"""
        try:
            print(f"🤖 Using Ollama model: {settings.OLLAMA_MODEL}")

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
            print(f"✅ Generated {len(generated_text)} characters")

            return generated_text

        except Exception as e:
            print(f"❌ Ollama generation failed: {str(e)}")
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