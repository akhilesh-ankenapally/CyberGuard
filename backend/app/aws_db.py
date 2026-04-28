import uuid
from datetime import datetime, timezone
from typing import Any
from decimal import Decimal

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from .config import get_settings

# Local fallback cache
_LOCAL_THREAT_CACHE: list[dict[str, Any]] = []

# Create DynamoDB resource ONCE (not every call)
_cfg = get_settings()
_dynamodb = boto3.resource('dynamodb', region_name=_cfg.aws_region)
_table = _dynamodb.Table(_cfg.dynamodb_table)


# ---------------------------
# Helper: convert floats → Decimal
# ---------------------------
def _to_decimal(value: Any) -> Decimal:
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal("0.0")


# ---------------------------
# Build item safely
# ---------------------------
def _build_item(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(payload.get("id") or f"aws-{uuid.uuid4().hex[:10]}"),
        "platform": str(payload.get("platform") or "SMS"),
        "sender": str(payload.get("sender") or "Unknown"),
        "message": str(payload.get("message") or ""),
        "risk_level": str(payload.get("risk_level") or "Suspicious"),
        "confidence": _to_decimal(payload.get("confidence", 0.0)),  # ✅ FIXED
        "timestamp": str(payload.get("timestamp") or datetime.now(timezone.utc).isoformat()),
        "explanation": str(payload.get("explanation", "")),
        "source": str(payload.get("source", "backend")),
    }


# ---------------------------
# STORE THREAT
# ---------------------------
def store_threat(data: dict[str, Any]) -> None:
    cfg = get_settings()
    item = _build_item(data)

    print("📤 Sending to AWS:", item)

    if not cfg.enable_aws:
        print("⚠️ AWS disabled → using local cache")
        _LOCAL_THREAT_CACHE.insert(0, item)
        _LOCAL_THREAT_CACHE[:] = _LOCAL_THREAT_CACHE[:200]
        return

    try:
        _table.put_item(Item=item)
        print("✅ Stored in DynamoDB")
    except (BotoCoreError, ClientError, Exception) as e:
        print("❌ AWS ERROR:", str(e))
        raise e  # DO NOT hide errors


# ---------------------------
# FETCH THREATS
# ---------------------------
def get_threats(
    limit: int = 20,
    platform: str | None = None,
    risk_level: str | None = None
) -> list[dict[str, Any]]:

    cfg = get_settings()

    def apply_filters(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if platform:
            items = [i for i in items if i.get("platform") == platform]
        if risk_level:
            items = [i for i in items if i.get("risk_level") == risk_level]

        # Sort latest first
        items.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return items[:limit]

    if not cfg.enable_aws:
        print("⚠️ Fetching from local cache")
        return apply_filters(list(_LOCAL_THREAT_CACHE))

    try:
        response = _table.scan()
        items = response.get("Items", [])

        # Handle pagination (IMPORTANT)
        while "LastEvaluatedKey" in response:
            response = _table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        print(f"📥 Fetched {len(items)} items from DynamoDB")
        return apply_filters(items)

    except (BotoCoreError, ClientError, Exception) as e:
        print("❌ FETCH ERROR:", str(e))
        raise e  # DO NOT silently fallback