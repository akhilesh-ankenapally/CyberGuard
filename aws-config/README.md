# AWS Integration Notes

CyberGuard uses AWS in a simulation-friendly way:

- DynamoDB stores threat records with the fields `id`, `message`, `platform`, `sender`, `risk_level`, `confidence`, `timestamp`, and `explanation`.
- S3 stores the dataset file and a JSON model artifact generated at startup.

## Required Environment Variables

- `ENABLE_AWS=true`
- `AWS_REGION=us-east-1`
- `DYNAMODB_TABLE=CyberGuardThreats`
- `S3_BUCKET=cyberguard-assets`

## Suggested DynamoDB Table

- Partition key: `id` (string)

## Suggested S3 Keys

- `datasets/cyberguard_dataset.json`
- `artifacts/cyberguard-model.json`

If AWS credentials are unavailable, the backend falls back to local in-memory storage and the frontend switches to simulation mode.