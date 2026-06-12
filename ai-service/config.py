from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/startup_sim"
    REDIS_URL: str = "redis://localhost:6379"
    BACKEND_URL: str = "http://localhost:4000"
    PORT: int = 8000
    TICK_INTERVAL_SECONDS: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
