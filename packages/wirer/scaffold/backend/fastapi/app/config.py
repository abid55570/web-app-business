"""Settings — env-driven via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "sqlite+aiosqlite:///./app.db"

    # JWT
    jwt_secret: str = "change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7  # 7 days

    # Bcrypt
    bcrypt_rounds: int = 12

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
    ]

    # WhatsApp (optional)
    whatsapp_token: str | None = None
    whatsapp_phone_number_id: str | None = None

    # App
    debug: bool = False


settings = Settings()
