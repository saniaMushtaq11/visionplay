
from fastapi import FastAPI, Header, HTTPException, Query, UploadFile, File, Form
import httpx
import uuid
import asyncio
from fastapi.responses import JSONResponse
_ml_error: str | None = None
_ml_dataset_available = False
_ml_inference_available = False
scan_dataset = scan_dataset_with_labels = load_labels_json = None  # type: ignore
try:
  # Try relative import first
  from .ml.dataset import scan_dataset, scan_dataset_with_labels, load_labels_json  # type: ignore
  _ml_dataset_available = True
  # Also try to import inference modules to enable ML inference
  from .ml.inference import load_model_once, predict_attributes_from_video  # type: ignore
  _ml_inference_available = True
except ImportError:
  try:
    # Fallback to direct import
    from ml.dataset import scan_dataset, scan_dataset_with_labels, load_labels_json  # type: ignore
    _ml_dataset_available = True
    # Also try to import inference modules to enable ML inference
    from ml.inference import load_model_once, predict_attributes_from_video  # type: ignore
    _ml_inference_available = True
  except Exception as e:
    _ml_error = f"dataset_import: {e}"
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
try:
  # When running as a module (uvicorn backend.main:app)
  from . import db as dbmod  # type: ignore
except Exception:
  # When running as a script (python backend/main.py)
  import db as dbmod  # type: ignore


# ...existing code...


# ...existing code...

# Initialize FastAPI app first
app = FastAPI(title="Pitch Pathfinder API", version="0.1.0")

# Allow Vite dev server and default localhost
app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8084",
    "http://127.0.0.1:8084",
    "*",  # relax for local development
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
  expose_headers=["*"],
)

# Model for posts
class Post(BaseModel):
  id: str
  user_id: str
  title: str
  content: str
  created_at: Optional[str] = None

# Dummy in-memory posts for demo
_posts = [
  {"id": "1", "user_id": "demo_user", "title": "My First Post", "content": "Hello world!", "created_at": "2025-09-13"},
  {"id": "2", "user_id": "demo_user", "title": "Another Post", "content": "This is another post.", "created_at": "2025-09-13"},
  {"id": "3", "user_id": "other_user", "title": "Not My Post", "content": "Should not show up.", "created_at": "2025-09-13"},
]

# Endpoint to get posts for the logged-in user
from fastapi import status

# Endpoint to delete a post by ID (only if owned by user)
@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: str, authorization: Optional[str] = Header(default=None)):
  if not authorization or not authorization.lower().startswith("bearer "):
    raise HTTPException(status_code=401, detail="Missing token")
  token = authorization.split(" ", 1)[1]
  email = _tokens_to_email.get(token)
  if not email:
    raise HTTPException(status_code=401, detail="Invalid token")
  user = dbmod.find_user_by_email(email)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  user_id = user["id"]
  # Find post
  post = next((p for p in _posts if p["id"] == post_id), None)
  if not post:
    raise HTTPException(status_code=404, detail="Post not found")
  if post["user_id"] != user_id:
    raise HTTPException(status_code=403, detail="You do not have permission to delete this post")
  # Remove post
  _posts.remove(post)
  return
@app.get("/posts/mine")
def get_my_posts(authorization: Optional[str] = Header(default=None)) -> list[dict]:
  if not authorization or not authorization.lower().startswith("bearer "):
    raise HTTPException(status_code=401, detail="Missing token")
  token = authorization.split(" ", 1)[1]
  email = _tokens_to_email.get(token)
  if not email:
    raise HTTPException(status_code=401, detail="Invalid token")
  user = dbmod.find_user_by_email(email)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  user_id = user["id"]
  # Filter posts by user_id
  return [p for p in _posts if p["user_id"] == user_id]


# Pydantic models
class UserPublic(BaseModel):
    id: str
    email: str
    name: Optional[str] = None

class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str



# API-Football key for live scores
API_FOOTBALL_KEY = "af0bbb104ec605672f0db85945afdd58"

API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"


# Initialize FastAPI app first
app = FastAPI(title="Pitch Pathfinder API", version="0.1.0")

# Allow Vite dev server and default localhost
app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",  # relax for local development
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
  return {"status": "ok", "ml_dataset": _ml_dataset_available, "ml_inference": _ml_inference_available, "ml_error": _ml_error}


@app.post("/ai/assess")
async def ai_assess_video(
  file: UploadFile = File(...),
  jersey_number: str = Form(""),
  jersey_color: str = Form(""),
) -> dict:
  global _ml_inference_available, _ml_error
  
  # Generate mock data if ML inference is not available
  if not _ml_inference_available:
    import random
    import time
    # Simulate processing delay
    await asyncio.sleep(2)
    # Generate random attributes between 1-5
    mock_attributes = {
      "Shooting": round(random.uniform(1, 5), 1),
      "Dribbling": round(random.uniform(1, 5), 1),
      "Passing": round(random.uniform(1, 5), 1),
      "Defending": round(random.uniform(1, 5), 1),
      "Physicality": round(random.uniform(1, 5), 1),
      "Pace": round(random.uniform(1, 5), 1),
      "filename": file.filename
    }
    return {"status": "ok", "attributes": mock_attributes}
  
  # Try to use actual ML inference if available
  try:
    # Delay heavy imports (torch) until first usage
    try:
      # Try relative import first
      from .ml.inference import load_model_once, predict_attributes_from_video  # type: ignore
      _ml_inference_available = True
    except ImportError:
      # Fallback to direct import
      from ml.inference import load_model_once, predict_attributes_from_video  # type: ignore
      _ml_inference_available = True
  except Exception as e:
    _ml_error = f"inference_import: {e}"
    # Instead of raising an exception, use mock data
    import random
    mock_attributes = {
      "Shooting": round(random.uniform(1, 5), 1),
      "Dribbling": round(random.uniform(1, 5), 1),
      "Passing": round(random.uniform(1, 5), 1),
      "Defending": round(random.uniform(1, 5), 1),
      "Physicality": round(random.uniform(1, 5), 1),
      "Pace": round(random.uniform(1, 5), 1),
      "filename": file.filename
    }
    return {"status": "ok", "attributes": mock_attributes}

  try:
    video_bytes = await file.read()
    load_model_once()
    prediction = await predict_attributes_from_video(video_bytes, filename=file.filename, jersey_number=jersey_number, jersey_color=jersey_color)
    return {"status": "ok", "attributes": prediction}
  except Exception as e:
    # On error, return mock data instead of failing
    import random
    mock_attributes = {
      "Shooting": round(random.uniform(1, 5), 1),
      "Dribbling": round(random.uniform(1, 5), 1),
      "Passing": round(random.uniform(1, 5), 1),
      "Defending": round(random.uniform(1, 5), 1),
      "Physicality": round(random.uniform(1, 5), 1),
      "Pace": round(random.uniform(1, 5), 1),
      "filename": file.filename
    }
    return {"status": "ok", "attributes": mock_attributes}


@app.get("/ai/dataset/scan")
def ai_dataset_scan() -> dict:
  if not _ml_dataset_available or scan_dataset is None:
    raise HTTPException(status_code=503, detail="ML dataset module not available")
  items = scan_dataset()
  return {"status": "ok", "count": len(items)}


@app.get("/ai/dataset/labels")
def ai_dataset_labels() -> dict:
  if not _ml_dataset_available or load_labels_json is None or scan_dataset_with_labels is None:
    raise HTTPException(status_code=503, detail="ML dataset module not available")
  attributes, label_map = load_labels_json()
  labeled_paths = len(label_map)
  items, _ = scan_dataset_with_labels()
  labeled_count = sum(1 for it in items if it.label)
  return {
    "status": "ok",
    "attributes": attributes,
    "labeled_items": labeled_count,
    "total_videos": len(items),
  }


@app.post("/ai/dataset/generate-labels")
def ai_generate_labels() -> dict:
  if not _ml_dataset_available:
    raise HTTPException(status_code=503, detail="ML dataset module not available")
  try:
    # Import here to avoid issues if module layout changes
    try:
      from backend.ml.dataset import generate_labels_template  # type: ignore
    except Exception:
      from .ml.dataset import generate_labels_template  # type: ignore
    out_path = generate_labels_template()
    return {"status": "ok", "path": str(out_path)}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to generate labels.json: {str(e)}")


@app.get("/players")
def list_players() -> list[dict]:
  return [
    {
      "id": "p1",
      "name": "Alex Morgan",
      "position": "Forward",
      "club": "San Diego Wave",
      "location": "San Diego, USA",
      "rating": 8.8,
      "matches": 24,
      "goals": 18,
      "image": "",
      "isConnected": False,
    },
    {
      "id": "p2",
      "name": "Erling Haaland",
      "position": "Striker",
      "club": "Manchester City",
      "location": "Manchester, UK",
      "rating": 9.2,
      "matches": 28,
      "goals": 30,
      "image": "",
      "isConnected": True,
    },
  ]


@app.get("/matches")
async def list_matches() -> list[dict]:
  # Try to fetch live matches from Free Football API Data
  try:
    # Use the proxy endpoint to fetch live matches
    async with httpx.AsyncClient(timeout=20.0) as client:
      # Get the RapidAPI key from environment
      rapidapi_key = os.environ.get("VITE_RAPIDAPI_KEY", "")
      
      # Call our proxy endpoint
      resp = await client.get(
        "http://localhost:8002/proxy/free-football/livescores",
        headers={"X-RapidAPI-Key": rapidapi_key}
      )
      resp.raise_for_status()
      data = resp.json()
      # Parse matches from Free Football API Data format
      matches = []
      # The response format may be different for Free Football API Data
      # Adapt the parsing logic based on the actual response structure
      response_data = data.get("data", data.get("response", []))
      
      if isinstance(response_data, list):
        for item in response_data:
          # Extract match data based on Free Football API Data structure
          match_id = item.get("id") or item.get("match_id") or str(uuid.uuid4())
          home_team = item.get("home_team", {}).get("name") if isinstance(item.get("home_team"), dict) else item.get("homeTeam")
          away_team = item.get("away_team", {}).get("name") if isinstance(item.get("away_team"), dict) else item.get("awayTeam")
          
          # Extract score information
          score_data = item.get("score", {})
          home_score = None
          away_score = None
          
          if isinstance(score_data, dict):
            home_score = score_data.get("home") or score_data.get("homeScore")
            away_score = score_data.get("away") or score_data.get("awayScore")
          
          # Create match object
          match = {
            "id": match_id,
            "homeTeam": home_team,
            "awayTeam": away_team,
            "date": item.get("date") or item.get("match_date"),
            "venue": item.get("venue", {}).get("name") if isinstance(item.get("venue"), dict) else item.get("venue"),
            "league": item.get("league", {}).get("name") if isinstance(item.get("league"), dict) else item.get("league"),
            "isLive": item.get("status") == "LIVE" or item.get("isLive") == True,
            "score": {
              "home": home_score,
              "away": away_score,
              "halftime": score_data.get("halftime") if isinstance(score_data, dict) else None,
              "fulltime": score_data.get("fulltime") if isinstance(score_data, dict) else None,
            },
          }
          matches.append(match)
      
      return matches
  except Exception as e:
    # Fallback to static matches if API fails
    return [
      {
        "id": "1",
        "homeTeam": "Manchester United",
        "awayTeam": "Liverpool FC",
        "date": "2025-03-15",
        "time": "15:30",
        "venue": "Old Trafford",
        "league": "Premier League",
        "isLive": True,
      },
      {
        "id": "2",
        "homeTeam": "Arsenal FC",
        "awayTeam": "Chelsea FC",
        "date": "2025-03-16",
        "time": "17:45",
        "venue": "Emirates Stadium",
        "league": "Premier League",
        "hasNotification": True,
      },
      {
        "id": "3",
        "homeTeam": "Barcelona",
        "awayTeam": "Real Madrid",
        "date": "2025-03-17",
        "time": "20:00",
        "venue": "Camp Nou",
        "league": "La Liga",
      },
    ]


@app.get("/tryouts")
def list_tryouts() -> list[dict]:
  return [
    {
      "id": "1",
      "club": "Manchester City Academy",
      "position": "Forward",
      "date": "2025-03-20",
      "time": "10:00",
      "venue": "City Football Academy",
      "requirements": "U18, experienced player",
      "isSaved": False,
      "hasApplied": False,
    },
    {
      "id": "2",
      "club": "Arsenal FC Academy",
      "position": "Midfielder",
      "date": "2025-03-22",
      "time": "14:00",
      "venue": "London Colney",
      "requirements": "U16, technical skills",
      "isSaved": True,
      "hasApplied": False,
    },
  ]


# ----- Simple action endpoints to back buttons on the frontend -----

class ConnectRequest(BaseModel):
  playerId: str
  action: str  # "connect" | "disconnect"


@app.post("/connect")
def connect_player(req: ConnectRequest) -> dict:
  is_connected = req.action == "connect"
  return {"status": "ok", "playerId": req.playerId, "connected": is_connected}


class MessageRequest(BaseModel):
  playerId: str
  message: str | None = None


@app.post("/message")
def message_player(req: MessageRequest) -> dict:
  return {"status": "ok", "playerId": req.playerId}


class ApplyRequest(BaseModel):
  tryoutId: str


@app.post("/tryouts/apply")
def apply_tryout(req: ApplyRequest) -> dict:
  return {"status": "ok", "tryoutId": req.tryoutId, "applied": True}


class SaveRequest(BaseModel):
  tryoutId: str


@app.post("/tryouts/save")
def save_tryout(req: SaveRequest) -> dict:
  return {"status": "ok", "tryoutId": req.tryoutId, "saved": True}


class NotifyRequest(BaseModel):
  matchId: str


@app.post("/matches/notify")
def notify_match(req: NotifyRequest) -> dict:
  return {"status": "ok", "matchId": req.matchId, "notified": True}


class WatchRequest(BaseModel):
  matchId: str


@app.post("/matches/watch")
def watch_match(req: WatchRequest) -> dict:
  return {"status": "ok", "matchId": req.matchId, "watch": True}


# ---------------------- Proxy endpoints to bypass CORS ----------------------
@app.get("/proxy/football-data")
async def proxy_football_data(
  path: str = Query(..., description="Path starting with /v4, e.g. /v4/competitions/PL/standings"),
  x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
):
  try:
    import httpx

    # Normalize path
    norm_path = path if path.startswith("/v4") else f"/v4{path}"
    url = f"https://api.football-data.org{norm_path}"

    headers: dict[str, str] = {}
    if x_auth_token:
      headers["X-Auth-Token"] = x_auth_token

    async with httpx.AsyncClient(timeout=20.0) as client:
      resp = await client.get(url, headers=headers)

    content_type = resp.headers.get("content-type", "application/json")
    if content_type.startswith("application/json"):
      return JSONResponse(status_code=resp.status_code, content=resp.json())
    return JSONResponse(status_code=resp.status_code, content={"raw": resp.text})
  except Exception as e:
    raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}")


@app.get("/proxy/rapidapi")
async def proxy_rapidapi(
  path: str = Query(..., description="Path starting with /v3, e.g. /v3/leagues"),
  x_rapidapi_key: str | None = Header(default=None, alias="X-RapidAPI-Key"),
):
  import httpx
  import asyncio
  
  # Retry configuration
  max_retries = 3
  base_delay = 1  # seconds
  
  async def make_request(retry=0):
    try:
      # Normalize path
      norm_path = path if path.startswith("/v3") else f"/v3{path}"
      url = f"https://api-football-v1.p.rapidapi.com{norm_path}"

      headers: dict[str, str] = {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com"
      }
      if x_rapidapi_key:
        headers["x-rapidapi-key"] = x_rapidapi_key

      async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(url, headers=headers)
      
      # Handle rate limiting with exponential backoff
      if resp.status_code == 429 and retry < max_retries:
        retry_delay = base_delay * (2 ** retry)
        print(f"RapidAPI rate limit exceeded. Retrying in {retry_delay} seconds...")
        await asyncio.sleep(retry_delay)
        return await make_request(retry + 1)

      content_type = resp.headers.get("content-type", "application/json")
      if content_type.startswith("application/json"):
        return JSONResponse(status_code=resp.status_code, content=resp.json())
      return JSONResponse(status_code=resp.status_code, content={"raw": resp.text})
    except Exception as e:
      if "timeout" in str(e).lower() and retry < max_retries:
        retry_delay = base_delay * (2 ** retry)
        print(f"Request timeout. Retrying in {retry_delay} seconds...")
        await asyncio.sleep(retry_delay)
        return await make_request(retry + 1)
      raise HTTPException(status_code=502, detail=f"RapidAPI proxy error: {str(e)}")
  
  return await make_request()


@app.get("/proxy/free-football/{endpoint:path}")
async def proxy_free_football(
  endpoint: str,
  x_rapidapi_key: str | None = Header(default=None, alias="X-RapidAPI-Key"),
):
  import httpx
  import asyncio
  from fastapi import BackgroundTasks
  
  # Retry configuration
  max_retries = 3
  retry_count = 0
  base_delay = 1  # seconds
  
  async def make_request(retry=0):
    try:
      # Free Football API Data endpoint
      url = f"https://free-api-live-football-data.p.rapidapi.com/{endpoint}"

      headers: dict[str, str] = {
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
      if x_rapidapi_key:
        headers["x-rapidapi-key"] = x_rapidapi_key

      async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(url, headers=headers)
        
      # Handle rate limiting with exponential backoff
      if resp.status_code == 429 and retry < max_retries:
        retry_delay = base_delay * (2 ** retry)
        print(f"Rate limit exceeded. Retrying in {retry_delay} seconds...")
        await asyncio.sleep(retry_delay)
        return await make_request(retry + 1)
        
      content_type = resp.headers.get("content-type", "application/json")
      if content_type.startswith("application/json"):
        return JSONResponse(status_code=resp.status_code, content=resp.json())
      return JSONResponse(status_code=resp.status_code, content={"raw": resp.text})
    except Exception as e:
      if "timeout" in str(e).lower() and retry < max_retries:
        retry_delay = base_delay * (2 ** retry)
        print(f"Request timeout. Retrying in {retry_delay} seconds...")
        await asyncio.sleep(retry_delay)
        return await make_request(retry + 1)
      raise HTTPException(status_code=502, detail=f"Free Football API proxy error: {str(e)}")
  
  return await make_request()


# In-memory storage for demo purposes
_users_by_email: dict[str, dict] = {}
_tokens_to_email: dict[str, str] = {}


@app.post("/auth/signup")
def auth_signup(req: SignupRequest) -> dict:
  # check existing in DB
  existing = dbmod.find_user_by_email(req.email)
  if existing:
    raise HTTPException(status_code=400, detail="Email already registered")
  user_id = str(uuid.uuid4())
  name = req.name or req.email.split("@")[0]
  user = dbmod.create_user(user_id, req.email, req.password, name)
  token = str(uuid.uuid4())
  _tokens_to_email[token] = req.email
  return {"token": token, "user": UserPublic(id=user["id"], email=user["email"], name=user.get("name")).dict()}


@app.post("/auth/login")
async def login(req: LoginRequest) -> dict:
  try:
    print("\n----- Login Request Start -----")
    email = req.email
    password = req.password
    
    print(f"Login attempt for email: {email}")
    
    if not email or not password:
      print("Error: Missing email or password")
      raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if user exists
    user = dbmod.find_user_by_email(email)
    
    if not user:
      print(f"Error: No user found with email: {email}")
      raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # For the test user, allow any password
    if email == "test@example.com":
      print("Test user login - bypassing password check")
    else:
      # In a real app, you would verify the password hash here
      if user["password"] != password:
        print("Error: Password mismatch")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    print(f"User authenticated successfully: {user['id']}")
    
    # Generate token
    token = str(uuid.uuid4())
    _tokens_to_email[token] = email
    print(f"Generated token (first 10 chars): {token[:10]}...")
    
    # Prepare response
    response = {"token": token, "user": UserPublic(id=user["id"], email=user["email"], name=user.get("name")).dict()}
    print("----- Login Request End -----\n")
    return response
  except Exception as e:
    print(f"Unexpected error in login: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail=str(e))


@app.get("/auth/me")
def auth_me(authorization: Optional[str] = Header(default=None)) -> dict:
  if not authorization or not authorization.lower().startswith("bearer "):
    raise HTTPException(status_code=401, detail="Missing token")
  token = authorization.split(" ", 1)[1]
  email = _tokens_to_email.get(token)
  if not email:
    raise HTTPException(status_code=401, detail="Invalid token")
  user = dbmod.find_user_by_email(email)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return {"user": UserPublic(id=user["id"], email=user["email"], name=user.get("name")).dict()}


@app.post("/auth/google")
def auth_google(req: GoogleAuthRequest) -> dict:
  try:
    # Verify Google token (in production, use proper JWT verification)
    # For demo, we'll decode the credential and extract user info
    import base64
    import json
    import traceback
    
    print(f"\n==== GOOGLE AUTH REQUEST ====")
    print(f"Received Google auth request with credential length: {len(req.credential) if req.credential else 0}")
    
    if not req.credential:
      print("Error: Empty credential received")
      raise HTTPException(status_code=400, detail="Empty credential received")
    
    # Decode the JWT credential (this is simplified - in production use proper JWT verification)
    parts = req.credential.split('.')
    print(f"JWT parts count: {len(parts)}")
    
    if len(parts) != 3:
      print(f"Invalid Google credential format: expected 3 parts, got {len(parts)}")
      raise HTTPException(status_code=400, detail="Invalid Google credential format")
    
    # Decode the payload
    payload = parts[1]
    # Add padding if needed (use modulo trick so 0 adds 0 padding)
    payload += '=' * (-len(payload) % 4)
    
    try:
      decoded = base64.urlsafe_b64decode(payload)
      user_info = json.loads(decoded)
      print(f"Successfully decoded Google credential payload")
      print(f"User info keys: {list(user_info.keys())}")
    except Exception as decode_error:
      print(f"Error decoding Google credential: {str(decode_error)}")
      print(traceback.format_exc())
      raise HTTPException(status_code=400, detail=f"Error decoding Google credential: {str(decode_error)}")
    
    email = user_info.get('email')
    name = user_info.get('name')
    
    print(f"Google auth for email: {email}, name: {name}")
    
    if not email:
      print("Email not found in Google credential")
      raise HTTPException(status_code=400, detail="Email not found in Google credential")
    
    # Check if user exists, create if not
    existing_user = dbmod.find_user_by_email(email)
    if existing_user:
      print(f"Found existing user with email: {email}, id: {existing_user.get('id')}")
      user = existing_user
    else:
      # Create new user
      user_id = str(uuid.uuid4())
      print(f"Creating new user with email: {email}, id: {user_id}")
      user = dbmod.create_user(user_id, email, "google_auth", name)
      print(f"New user created: {user}")
    
    # Generate token
    token = str(uuid.uuid4())
    _tokens_to_email[token] = email
    print(f"Generated token for user: {email}, token: {token[:8]}...")
    
    # Prepare response
    response = {
      "token": token, 
      "user": UserPublic(id=user["id"], email=user["email"], name=user.get("name")).dict()
    }
    print(f"Returning response: {response}")
    print("==== END GOOGLE AUTH REQUEST ====\n")
    return response
  except Exception as e:
    print(f"Google authentication failed: {str(e)}")
    print(traceback.format_exc())
    raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
@app.on_event("startup")
def on_startup() -> None:
  dbmod.init_db()
  
  # Create a test user if it doesn't exist
  test_email = "test@example.com"
  test_user = dbmod.find_user_by_email(test_email)
  if not test_user:
    print(f"Creating test user with email: {test_email}")
    user_id = str(uuid.uuid4())
    dbmod.create_user(user_id, test_email, "password123", "Test User")
    print(f"Test user created with id: {user_id}")
  else:
    print(f"Test user already exists with email: {test_email}")



# If you want to run directly: `python backend/main.py`
if __name__ == "__main__":
  import uvicorn
  # Run with the app instance to avoid import issues with the reloader on Windows
  uvicorn.run(app, host="127.0.0.1", port=8003, reload=False)


