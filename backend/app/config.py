import os
from functools import lru_cache


class Settings:
    PROJECT_NAME: str = 'Resolutions API'
    API_V1_STR: str = '/api'
    DATABASE_URL: str = os.getenv(
        'DATABASE_URL',
        'postgresql+asyncpg://postgres:postgres@localhost:5432/resolutions_db',
    )
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-me')
    JWT_ALGORITHM: str = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '60')
    )
    BACKEND_CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv('BACKEND_CORS_ORIGINS', 'http://localhost:5173').split(',')
        if origin.strip()
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
