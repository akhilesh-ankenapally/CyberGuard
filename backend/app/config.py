from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATASET_PATH = BASE_DIR / 'dataset' / 'cyberguard_dataset.json'


class Settings(BaseSettings):
    app_name: str = 'CyberGuard API'
    environment: str = 'development'
    aws_region: str = 'us-east-1'
    dynamodb_table: str = 'CyberGuardThreats'
    s3_bucket: str = 'cyberguard-assets'
    enable_aws: bool = True
    dataset_path: Path = DEFAULT_DATASET_PATH
    dataset_key: str = 'datasets/cyberguard_dataset.json'
    model_key: str = 'artifacts/cyberguard-model.json'
    cors_origins: list[str] = ['*']

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')


@lru_cache

def get_settings() -> Settings:
    return Settings()