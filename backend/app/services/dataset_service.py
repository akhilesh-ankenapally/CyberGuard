import json
from pathlib import Path
from typing import Any


def load_dataset(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    if path.suffix.lower() == '.json':
        return json.loads(path.read_text(encoding='utf-8'))
    if path.suffix.lower() == '.csv':
        import csv

        with path.open('r', encoding='utf-8', newline='') as handle:
            return list(csv.DictReader(handle))
    return []


def filter_dataset(dataset: list[dict[str, Any]], platform: str | None = None) -> list[dict[str, Any]]:
    if platform is None:
        return dataset
    return [row for row in dataset if str(row.get('platform', '')).lower() == platform.lower()]
