"""
Central app configuration.

Values are read from environment variables (see .env.example). Sensible
local-dev defaults are provided so the app runs out of the box with SQLite,
but SECRET_KEY should always be overridden in any real deployment.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FeaturePulse"
    API_V1_PREFIX: str = "/api/v1"

    # Database — SQLite for local dev, swap DATABASE_URL for Postgres in prod
    # e.g. postgresql+psycopg2://user:pass@localhost:5432/featurepulse
    DATABASE_URL: str = "sqlite:///./featurepulse.db"

    # JWT
    SECRET_KEY: str = "CHANGE_ME_INSECURE_DEV_ONLY_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_MODEL: str = "llama3.2"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
