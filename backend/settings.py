from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Vidhi Legal Intelligence Platform"
    database_url: str = ""
    openai_api_key: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
