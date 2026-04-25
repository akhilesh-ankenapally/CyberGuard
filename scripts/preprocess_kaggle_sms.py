import argparse
import json
import random
from pathlib import Path

PLATFORMS = ["WhatsApp", "SMS", "Email", "Instagram"]


def map_label(raw_label: str) -> str:
    normalized = raw_label.strip().strip('"').strip("'").lower()
    if normalized == "spam":
        return "Threat"
    if normalized == "ham":
        return "Safe"
    raise ValueError(f"Unsupported label '{raw_label}'. Expected 'spam' or 'ham'.")


def parse_line(line: str, line_number: int) -> tuple[str, str]:
    cleaned = line.strip().strip('\ufeff')
    if cleaned.startswith('"') and cleaned.endswith('"') and len(cleaned) >= 2:
        cleaned = cleaned[1:-1]

    parts = cleaned.split("\t", 1)
    if len(parts) != 2:
        raise ValueError(f"Invalid SMSSpamCollection row at line {line_number}: expected 'label<TAB>message'.")

    label = parts[0].strip().strip('"').strip("'").lower()
    message = parts[1].strip().strip('"').strip("'")
    if not label or not message:
        raise ValueError(f"Invalid SMSSpamCollection row at line {line_number}: empty label or message.")

    return label, message


def preprocess(csv_path: Path, output_path: Path, seed: int) -> None:
    random.seed(seed)

    records: list[dict[str, object]] = []
    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            line = raw_line.strip()
            if not line:
                continue

            raw_label, message = parse_line(raw_line, line_number)
            platform = random.choice(PLATFORMS)

            records.append(
                {
                    "id": len(records) + 1,
                    "platform": platform,
                    "sender": "Unknown",
                    "message": message,
                    "label": map_label(raw_label),
                }
            )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, ensure_ascii=True, indent=2)

    print(f"Processed {len(records)} rows")
    print(f"Saved JSON dataset to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert Kaggle SMS spam CSV to CyberGuard JSON format."
    )
    parser.add_argument(
        "--input",
        dest="input_csv",
        default="dataset/spam.csv",
        help="Path to input Kaggle SMS spam CSV file.",
    )
    parser.add_argument(
        "--output",
        dest="output_json",
        default="dataset/kaggle_dataset.json",
        help="Path to output JSON file.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic platform/sender assignment.",
    )
    args = parser.parse_args()

    preprocess(Path(args.input_csv), Path(args.output_json), args.seed)


if __name__ == "__main__":
    main()
