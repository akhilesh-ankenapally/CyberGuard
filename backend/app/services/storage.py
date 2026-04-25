from __future__ import annotations

import json
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from ..config import Settings, get_settings
from ..models import ThreatRecord

_LOCAL_THREAT_CACHE: list[dict[str, Any]] = []


def _build_item(payload: dict[str, Any]) -> dict[str, Any]:
    # Persist the required threat fields while keeping extra metadata when present.
    item = {
        'id': payload['id'],
        'platform': payload['platform'],
        'sender': payload['sender'],
        'message': payload['message'],
        'risk_level': payload['risk_level'],
        'confidence': payload['confidence'],
        'timestamp': payload['timestamp'],
    }

    if 'explanation' in payload:
        item['explanation'] = payload['explanation']
    if 'source' in payload:
        item['source'] = payload['source']

    return item


def store_threat(data: dict[str, Any], settings: Settings | None = None) -> None:
    """Store a threat event in DynamoDB; fallback to local cache when AWS is disabled/unavailable."""
    cfg = settings or get_settings()
    item = _build_item(data)

    if not cfg.enable_aws:
        _LOCAL_THREAT_CACHE.insert(0, item)
        _LOCAL_THREAT_CACHE[:] = _LOCAL_THREAT_CACHE[:200]
        return

    try:
        table = boto3.resource('dynamodb', region_name=cfg.aws_region).Table(cfg.dynamodb_table)
        table.put_item(Item=item)
    except (BotoCoreError, ClientError, Exception):
        _LOCAL_THREAT_CACHE.insert(0, item)
        _LOCAL_THREAT_CACHE[:] = _LOCAL_THREAT_CACHE[:200]


def get_recent_threats(
    limit: int = 25,
    platform: str | None = None,
    risk_level: str | None = None,
    settings: Settings | None = None,
) -> list[dict[str, Any]]:
    """Fetch recent threats from DynamoDB; fallback to local cache when AWS is disabled/unavailable."""
    cfg = settings or get_settings()

    def apply_filters(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        filtered = items
        if platform:
            filtered = [item for item in filtered if item.get('platform') == platform]
        if risk_level:
            filtered = [item for item in filtered if item.get('risk_level') == risk_level]
        filtered.sort(key=lambda item: str(item.get('timestamp', '')), reverse=True)
        return filtered[:limit]

    if not cfg.enable_aws:
        return apply_filters(list(_LOCAL_THREAT_CACHE))

    try:
        table = boto3.resource('dynamodb', region_name=cfg.aws_region).Table(cfg.dynamodb_table)
        response = table.scan()
        items = response.get('Items', [])
        return apply_filters(items)
    except (BotoCoreError, ClientError, Exception):
        return apply_filters(list(_LOCAL_THREAT_CACHE))


class ThreatRepository:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._use_aws = settings.enable_aws
        self._dynamodb = None
        self._s3 = None

        if self._use_aws:
            try:
                import boto3

                self._dynamodb = boto3.resource('dynamodb', region_name=settings.aws_region)
                self._s3 = boto3.client('s3', region_name=settings.aws_region)
            except Exception:
                self._use_aws = False

    def _serialize(self, record: ThreatRecord) -> dict[str, Any]:
        payload = record.model_dump(mode='json')
        payload['timestamp'] = record.timestamp.isoformat()
        return payload

    def save_threat(self, record: ThreatRecord) -> None:
        payload = self._serialize(record)
        store_threat(payload, settings=self.settings)

    def list_threats(self, limit: int = 25, platform: str | None = None, risk_level: str | None = None) -> list[ThreatRecord]:
        items = get_recent_threats(limit=limit, platform=platform, risk_level=risk_level, settings=self.settings)
        return [self._from_payload(item) for item in items]

    def _from_payload(self, payload: dict[str, Any]) -> ThreatRecord:
        return ThreatRecord(**payload)

    def bootstrap_assets(self, dataset_path, model_payload) -> None:
        if not self._use_aws or self._s3 is None or not dataset_path.exists():
            return

        try:
            self._s3.upload_file(str(dataset_path), self.settings.s3_bucket, self.settings.dataset_key)
            self._s3.put_object(
                Bucket=self.settings.s3_bucket,
                Key=self.settings.model_key,
                Body=json.dumps(model_payload.model_dump(mode='json')).encode('utf-8'),
                ContentType='application/json',
            )
        except (BotoCoreError, ClientError, Exception):
            self._use_aws = False