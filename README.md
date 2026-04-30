# CyberGuard

CyberGuard is an AI-based cybersecurity threat detection system that combines a simulated message stream, a FastAPI backend, AWS DynamoDB persistence, and a mobile-style web dashboard. It is designed to demonstrate how suspicious activity can be detected, classified, explained, stored, and surfaced in a clear operator interface.

## 1. Project Overview

CyberGuard analyzes incoming messages and behavior signals in near real time, classifies each event as Safe or Threat, and stores the result for dashboard visibility. The simulation engine acts like a live threat feed by continuously sending messages to the backend, allowing the system to behave like a real monitoring platform rather than a static demo.

From a cybersecurity perspective, this matters because the system shows how security teams can centralize alerting, triage risky activity quickly, and attach human-readable explanations to automated detections. That combination makes threat monitoring easier to trust, review, and present.

## 2. Key Features

- Real-time threat detection using a simulation engine that sends messages to the backend
- Risk classification with clear Safe / Threat output
- Rule-based threat explanation system for every analyzed message
- Dashboard with recent alerts, threat statistics, and activity tracking
- App permissions and monitoring UI for reviewing risky app behavior
- Settings page with controls, toggles, and notification preferences
- Modern mobile-style responsive UI built for presentation and demo use
- Cloud-based backend and DynamoDB integration for persistent threat records

## 3. System Architecture

Frontend (Vercel)

↓

Backend API (FastAPI on Render)

↓

Database (AWS DynamoDB)

The simulation engine sends generated threat messages to the backend API, which analyzes the message, adds an explanation, and stores the resulting record in DynamoDB. The frontend then fetches the latest data and renders it in the dashboard, activity monitor, and related monitoring views.

## 4. Tech Stack

Frontend:

- React (Vite)
- TypeScript
- Tailwind CSS

Backend:

- Python (FastAPI)

Cloud & Infrastructure:

- Render for backend hosting
- Vercel for frontend hosting
- AWS DynamoDB for database storage

Other:

- Docker for containerization
- Git and GitHub for version control and collaboration

## 5. How It Works

1. The simulation engine generates messages from the dataset.
2. The backend analyzes each message using the threat detection logic.
3. The system assigns a risk level: Safe or Threat.
4. A rule-based explanation is generated for the result.
5. The record is stored in DynamoDB.
6. The frontend fetches the latest data and displays it in the dashboard and monitoring pages.

## 6. Local Setup Instructions

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Simulation Engine

```bash
python scripts/simulation_engine.py --dataset dataset/kaggle_dataset.json --backend-url http://localhost:8000 --count 20
```

## 7. Deployment

The backend is deployed as a Docker container on Render. The frontend is deployed on Vercel and connects to the backend through the configured API URL. Runtime API wiring is controlled through environment variables, so the frontend can point to local, staging, or production backend endpoints without code changes.

## 8. Environment Variables

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_DEFAULT_REGION
- ENABLE_AWS
- VITE_API_URL

## 9. Demo Instructions

Before presenting the project:

1. Wake the backend URL so the first request does not hit a cold start.
2. Run the simulation engine to start sending threat events.
3. Open the frontend link in the browser.
4. Watch the dashboard update with new alerts, statistics, and activity entries.

## 10. Future Improvements

- ML-based threat detection
- User authentication
- Advanced analytics dashboard
- Mobile app version

## Repository Notes

- Backend API routes currently include `/analyze`, `/threats`, `/stats`, `/stream`, and `/health`.
- The simulation engine posts events to `POST /stream`.
- The frontend uses `VITE_API_URL` and falls back to `http://localhost:8000` when it is not set.


