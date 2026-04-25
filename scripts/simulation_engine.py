import argparse
import json
import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

import requests

BACKEND_STREAM_URL = "http://localhost:8000/stream"


@dataclass
class SimulatedMessage:
    platform: str
    sender: str
    message: str
    label: str
    timestamp: str
    confidence: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "platform": self.platform,
            "sender": self.sender,
            "message": self.message,
            "label": self.label,
            "timestamp": self.timestamp,
            "confidence": self.confidence,
        }


class SimulationEngine:
    def __init__(
        self,
        dataset_path: Path,
        min_delay: float = 2.0,
        max_delay: float = 5.0,
        seed: int | None = None,
        backend_url: str | None = None,
    ):
        if min_delay <= 0 or max_delay <= 0 or min_delay > max_delay:
            raise ValueError("Delay range must be positive and min_delay <= max_delay.")

        self.dataset_path = dataset_path
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.random = random.Random(seed)
        self.backend_url = backend_url.rstrip("/") if backend_url else None
        self.dataset = self._load_dataset(dataset_path)

    def _load_dataset(self, dataset_path: Path) -> list[dict[str, Any]]:
        if not dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        with dataset_path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

        if not isinstance(data, list) or not data:
            raise ValueError("Dataset JSON must be a non-empty list.")

        required_fields = {"platform", "sender", "message", "label"}
        for index, row in enumerate(data):
            if not isinstance(row, dict):
                raise ValueError(f"Dataset row at index {index} is not an object.")
            missing = required_fields - set(row.keys())
            if missing:
                raise ValueError(f"Dataset row at index {index} missing fields: {sorted(missing)}")

        return data

    def _confidence_for_label(self, label: str) -> float:
        return round(self.random.uniform(0.7, 0.98), 2)

    def next_message(self) -> SimulatedMessage:
        row = self.random.choice(self.dataset)
        timestamp = datetime.now(timezone.utc).isoformat()
        confidence = self._confidence_for_label(str(row.get("label", "")))

        return SimulatedMessage(
            platform=str(row["platform"]),
            sender=str(row["sender"]),
            message=str(row["message"]),
            label=str(row["label"]),
            timestamp=timestamp,
            confidence=confidence,
        )

    def stream(self) -> Iterator[SimulatedMessage]:
        while True:
            yield self.next_message()
            delay = self.random.uniform(self.min_delay, self.max_delay)
            time.sleep(delay)


def send_to_backend(event: dict[str, Any], backend_url: str = BACKEND_STREAM_URL) -> None:
    try:
        response = requests.post(
            backend_url,
            json={"messages": [event]},
            timeout=5,
        )
        print(f"Sent -> {response.status_code}")
    except Exception as e:
        print(f"Failed to send: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberGuard message simulation engine")
    parser.add_argument("--dataset", default="dataset/kaggle_dataset.json", help="Path to dataset JSON file")
    parser.add_argument("--min-delay", type=float, default=2.0, help="Minimum emission delay in seconds")
    parser.add_argument("--max-delay", type=float, default=5.0, help="Maximum emission delay in seconds")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed")
    parser.add_argument("--count", type=int, default=0, help="Number of messages to emit (0 = infinite)")
    parser.add_argument("--backend-url", default="http://localhost:8000", help="Backend base URL for POST /stream")
    args = parser.parse_args()

    engine = SimulationEngine(
        dataset_path=Path(args.dataset),
        min_delay=args.min_delay,
        max_delay=args.max_delay,
        seed=args.seed,
        backend_url=args.backend_url,
    )

    emitted = 0
    for event in engine.stream():
        event_dict = event.to_dict()
        send_to_backend(event_dict, backend_url=f"{engine.backend_url}/stream" if engine.backend_url else BACKEND_STREAM_URL)
        print(json.dumps(event_dict, ensure_ascii=True))
        emitted += 1
        if args.count > 0 and emitted >= args.count:
            break


if __name__ == "__main__":
    main()
