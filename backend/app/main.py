import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .models import AnalysisRequest, ThreatLevel, ThreatRecord
from .services.analyzer import analyze_message, build_model_payload, generate_stream_message, generate_explanation
from .services.storage import ThreatRepository
from .aws_db import store_threat, get_threats

settings = get_settings()
repository = ThreatRepository(settings)
app = FastAPI(title=settings.app_name, version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def bootstrap_assets() -> None:
    repository.bootstrap_assets(settings.dataset_path, build_model_payload(settings.dataset_path))


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': settings.app_name}


@app.post('/analyze', response_model=ThreatRecord)
def analyze(payload: AnalysisRequest) -> ThreatRecord:
    # Simulate classification for the incoming message.
    record = analyze_message(payload.message, payload.platform, payload.sender)

    # Persist the threat record to DynamoDB via boto3-backed helper.
    data = record.model_dump(mode='json')
    data['timestamp'] = record.timestamp.isoformat()
    data['explanation'] = generate_explanation(data.get('message', ''))
    store_threat(data)
    record = record.model_copy(update={'explanation': data['explanation']})

    return record


@app.get('/threats', response_model=list[ThreatRecord])
def threats(
    limit: int = Query(25, ge=1, le=100),
    platform: str | None = None,
    risk_level: ThreatLevel | None = None,
) -> list[ThreatRecord]:
    items = get_threats(limit=limit, platform=platform, risk_level=risk_level)
    return [ThreatRecord(**item) for item in items]


@app.get('/stats')
def stats() -> dict[str, int]:
    items = get_threats(limit=10000)
    threats_count = sum(1 for item in items if str(item.get('risk_level', '')) == 'Threat')
    safe_count = sum(1 for item in items if str(item.get('risk_level', '')) == 'Safe')
    return {
        'total': len(items),
        'threats': threats_count,
        'safe': safe_count,
    }


@app.post('/stream')
def stream(data: dict) -> dict[str, int | str]:
    messages = data.get('messages', [])
    if not isinstance(messages, list):
        messages = []

    stored = 0
    for msg in messages:
        if not isinstance(msg, dict):
            continue

        label = str(msg.get('label', '')).strip().lower()
        risk_level = msg.get('risk_level') or ('Threat' if label == 'threat' else 'Safe' if label == 'safe' else 'Suspicious')
        payload = {
            'id': str(msg.get('id') or f"stream-{uuid.uuid4().hex[:10]}"),
            'platform': str(msg.get('platform') or 'SMS'),
            'sender': str(msg.get('sender') or 'Unknown'),
            'message': str(msg.get('message') or ''),
            'risk_level': str(risk_level),
            'confidence': float(msg.get('confidence', 0.8)),
            'timestamp': str(msg.get('timestamp') or datetime.now(timezone.utc).isoformat()),
            'explanation': str(msg.get('explanation') or 'Ingestion from live threat intelligence stream.'),
            'source': 'backend',
        }

        payload['explanation'] = generate_explanation(payload.get('message', ''))

        if payload['message']:
            store_threat(payload)
            stored += 1

    return {'status': 'ok', 'stored': stored}