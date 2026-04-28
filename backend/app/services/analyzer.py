from __future__ import annotations

import random
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from ..models import ModelPayload, Platform, ThreatLevel, ThreatRecord
from .dataset_service import filter_dataset, load_dataset

THREAT_KEYWORDS = [
    ('Threat', ['urgent', 'expires', 'blocked', 'verify', 'tap here', 'claim', 'refund', 'wire transfer', 'password reset', 'login now']),
    ('Suspicious', ['delivery', 'invoice', 'analytics', 'collab', 'payment', 'review', 'security alert', 'otp', 'reset']),
]

SAFE_HINTS = ['photo', 'summary', 'team', 'project', 'meeting', 'report', 'thanks']

PLATFORM_SENDERS: dict[Platform, list[str]] = {
    'WhatsApp': ['Unknown Contact', 'Priya', 'Mom', 'Delivery Bot', 'Support Desk'],
    'Instagram': ['Brand Partner', 'Creator Hub', 'Unknown DM', 'Verified Seller', 'Influencer Team'],
    'Email': ['security@bank-alerts.com', 'billing@cloudsuite.io', 'hr@company-mail.com', 'noreply@service-update.org'],
    'SMS': ['Bank Alert', 'Courier Service', 'System OTP', 'Promo Desk', 'Verification Code'],
}

PLATFORM_MESSAGES: dict[Platform, list[str]] = {
    'WhatsApp': ['Urgent account warning, tap here to verify', 'Can you review this attachment?', 'Free gift card available'],
    'Instagram': ['Tap to see your payout update', 'We noticed a suspicious login', 'Brand collaboration invite'],
    'Email': ['Invoice attached for your review', 'Security alert: sign-in from a new device', 'Quarterly report enclosed'],
    'SMS': ['Your OTP is 482193 for login', 'Package held at depot, confirm address now', 'Prize alert: claim your refund here'],
}


def generate_explanation(message: str) -> str:
    normalized = message.lower()
    if 'free' in normalized or 'win' in normalized or 'offer' in normalized:
        return 'Contains phishing keywords'
    if 'http' in normalized or 'www' in normalized:
        return 'Contains suspicious link'
    if 'urgent' in normalized or 'call now' in normalized:
        return 'Creates urgency (scam pattern)'
    return 'No major threat patterns detected'


def _build_explanation(level: ThreatLevel, message: str) -> str:
    if level == 'Threat':
        return 'Detected high-risk urgency cues, suspicious link language, or credential pressure.'
    if level == 'Suspicious':
        return 'Message contains brand, delivery, or login language commonly used in phishing flows.'
    if len(message) > 120:
        return 'Long-form message with moderate risk features and ambiguous sender intent.'
    return 'No material indicators of impersonation, urgency, or credential harvesting were found.'


def analyze_message(message: str, platform: Platform, sender: str = 'User Input') -> ThreatRecord:
    normalized = message.lower()
    risk_level: ThreatLevel = 'Safe'
    confidence = 84

    for level, keywords in THREAT_KEYWORDS:
        if any(keyword in normalized for keyword in keywords):
            risk_level = level  # type: ignore[assignment]
            confidence = 93 if level == 'Threat' else 76
            break

    if risk_level == 'Safe' and any(hint in normalized for hint in SAFE_HINTS):
        confidence = 88
    if platform == 'Email' and risk_level == 'Safe' and 'invoice' in normalized:
        risk_level = 'Suspicious'
        confidence = 77

    if 'http://' in normalized or 'https://' in normalized or re.search(r'\bbit\.ly\b|\bgoo\.gl\b', normalized):
        risk_level = 'Threat' if risk_level != 'Threat' else risk_level
        confidence = max(confidence, 94)

    confidence = min(99, max(confidence + random.randint(-3, 4), 60))
    if risk_level == 'Threat':
        confidence = max(confidence, 91)
    elif risk_level == 'Suspicious':
        confidence = max(confidence, 72)

    return ThreatRecord(
        id=f'{platform}-{uuid.uuid4().hex[:10]}',
        message=message,
        platform=platform,
        sender=sender,
        risk_level=risk_level,
        confidence=confidence,
        timestamp=datetime.now(timezone.utc),
        explanation=_build_explanation(risk_level, message),
        source='backend',
    )


def build_model_payload(dataset_path: Path) -> ModelPayload:
    dataset = load_dataset(dataset_path)
    return ModelPayload(
        dataset_size=len(dataset),
        keyword_rules=[rule for _, keywords in THREAT_KEYWORDS for rule in keywords[:1]],
        generated_at=datetime.now(timezone.utc),
    )


def generate_stream_message(dataset_path: Path, platform: Platform | None = None) -> tuple[str, Platform, str]:
    dataset = load_dataset(dataset_path)
    if dataset:
        scoped = filter_dataset(dataset, platform)
        if scoped:
            sample = random.choice(scoped)
            sample_platform = sample.get('platform', platform or random.choice(list(PLATFORM_MESSAGES)))
            message = str(sample.get('message', '')) or random.choice(PLATFORM_MESSAGES[sample_platform])
            sender = str(sample.get('sender', random.choice(PLATFORM_SENDERS[sample_platform])))
            return message, sample_platform, sender

    selected_platform = platform or random.choice(list(PLATFORM_MESSAGES))
    message = random.choice(PLATFORM_MESSAGES[selected_platform])
    sender = random.choice(PLATFORM_SENDERS[selected_platform])
    return message, selected_platform, sender