Pitch Pathfinder Backend (FastAPI)

Setup

1. Create and activate a virtual environment (recommended):
```powershell
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

2. Install dependencies:
```powershell
pip install -r backend/requirements.txt
```

3. Run the API (auto-reload):
```powershell
python backend/main.py
```

The API will be available at `http://127.0.0.1:8000`.

- Health check: `GET /health`
- Players: `GET /players`
- Matches: `GET /matches`
- Tryouts: `GET /tryouts`
- AI Assess: `POST /ai/assess` (multipart file upload `file`)

CORS

CORS is enabled for `http://localhost:5173` to allow the Vite frontend to access the API during development.

ML Inference (placeholder)

- This repo includes a minimal `backend/ml` scaffold. Upload a short video via `POST /ai/assess` to receive placeholder attribute scores. Once the dataset is provided, the model will be trained and this endpoint will return real predictions.

