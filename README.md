# CyberGuard

CyberGuard is a multi-page cybersecurity dashboard for live threat intelligence, protection controls, app behavior analysis, alerts, and activity monitoring.

The product is built to feel like a real security system: dark premium UI, glassmorphism surfaces, animated status indicators, and continuously updating data streams.

## Product Overview

CyberGuard combines a live backend feed with simulated security modules to create a product-level operator experience.

### Main Pages

- Dashboard
	- Live threat feed from `GET /threats`
	- Threat summary cards
	- Platform filters and risk filters
	- Custom message scanning flow
- Protection Center
	- SMS Shield
	- Call Shield
	- App Shield
	- Web Shield
- App Security
	- Permission Risk Analyzer
	- App-level behavior scoring
	- Detailed permission breakdowns and suggested actions
- Alerts / Notifications
	- Threat alert list with read/unread state
	- Push notification simulation
	- Toast notifications for new threats
- Activity Monitor
	- Auto Scan status
	- Real-time protection indicator
	- Live rolling activity log

## Workflow

1. The backend polls or serves the current threat feed from the data store.
2. The dashboard renders the latest feed and highlights incoming threats.
3. When a new threat arrives, the app raises a toast, adds an alert, and logs activity.
4. Users can move to Protection, App Security, Alerts, or Activity without reloading the app.
5. App Security continuously recalculates risk as permission usage changes over time.
6. Threat items can deep-link into App Security for Instagram or WhatsApp analysis.

## Key Features

### Dashboard

- Live threat feed from the backend
- Threat summary cards
- Clickable risk filters: All, Threat, Suspicious, Safe
- Platform pills for WhatsApp, Instagram, Email, and SMS
- Confidence display with animated indicator bars
- Message analysis panel with staged scan states

### Protection Center

- Four shield modules with on/off state
- Status labels for ACTIVE and INACTIVE
- Recent scans, call logs, app permissions, and blocked URLs
- Card-based layout for each security module

### App Security

- App Behavior Intelligence and Permission Risk Analyzer
- Simulated app dataset with permissions and usage patterns
- Dynamic risk scoring from permission intensity and behavior patterns
- Risk levels: Safe, Suspicious, Threat
- Detailed view for the selected app
- Suggested actions such as revoking microphone access or limiting background usage
- Automatic updates every 10-15 seconds

### Alerts / Notifications

- Unified alert list
- Read/unread state
- Push notification test action
- Toast notifications when new threats are detected

### Activity Monitor

- Real-time protection status
- Auto Scan indicator
- Continuous activity feed
- Scanning, blocking, and notification events

## UI / UX Direction

- Dark premium theme with neon accents
- Glassmorphism cards and elevated panels
- Responsive sidebar navigation
- Smooth Framer Motion transitions
- Animated threat highlights and score bars
- Clear security-status language with operator-style labels
- Mobile-friendly layout that still reads like a desktop-grade security console

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- FastAPI backend

## Architecture

- `frontend/` - multi-page React security console
- `backend/` - FastAPI threat analysis API and persistence layer
- `dataset/` - CyberGuard datasets and processed threat samples
- `scripts/` - preprocessing and simulation utilities
- `docker/` - container build files
- `aws-config/` - AWS notes and configuration guidance

## Backend API

- `POST /analyze`
	- Accepts a message payload
	- Runs classification logic
	- Stores the record through the persistence helper
	- Returns a threat record
- `GET /threats`
	- Returns recent threat records
- `POST /stream`
	- Ingests stream events into the threat store
- `GET /health`
	- Basic service health check

## Environment Variables

### Frontend

- `VITE_API_URL=http://localhost:8000`

### Backend

- `ENABLE_AWS=false`
- `AWS_REGION=us-east-1`
- `DYNAMODB_TABLE=CyberGuardThreats`
- `S3_BUCKET=cyberguard-assets`

## Local Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Data Utilities

### Kaggle CSV to CyberGuard JSON

```bash
python scripts/preprocess_kaggle_sms.py --input dataset/spam.csv --output dataset/kaggle_dataset.json --seed 42
```

Output fields include:

- `platform`
- `sender`
- `message`
- `label` (`spam -> Threat`, `ham -> Safe`)

### Python Message Simulation Engine

```bash
python scripts/simulation_engine.py --dataset dataset/kaggle_dataset.json --min-delay 2 --max-delay 5 --count 10
```

Each emitted event includes:

- `platform`
- `sender`
- `message`
- `label`
- `timestamp`
- `confidence`

## Current Notes

- The frontend uses backend polling for the main threat feed.
- Simulated modules are used where real device behavior is not available in the web app.
- The app now uses React Router with persistent sidebar navigation and cross-page state.