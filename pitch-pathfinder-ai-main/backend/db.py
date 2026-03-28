# db.py  — MongoDB version
import os
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017").strip()
DB_NAME = os.getenv("DB_NAME", "visionplay")

_client: MongoClient = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGODB_URL)
        _db = _client[DB_NAME]
    return _db

def init_db():
    """Called on startup — connects to MongoDB and creates indexes."""
    db = get_db()
    db["users"].create_index("email", unique=True)
    print(f"Connected to MongoDB: {DB_NAME}")

def find_user_by_email(email: str):
    db = get_db()
    user = db["users"].find_one({"email": email})
    if user:
        user["id"] = str(user.get("_id", user.get("id", "")))
        user.pop("_id", None)
    return user

def create_user(user_id: str, email: str, password: str, name: str = None):
    db = get_db()
    # Check if user already exists
    existing = db["users"].find_one({"email": email})
    if existing:
        existing["id"] = str(existing.get("_id", existing.get("id", "")))
        existing.pop("_id", None)
        return existing
    user = {
        "id": user_id,
        "email": email,
        "password": password,
        "name": name or email.split("@")[0],
    }
    db["users"].insert_one(user)
    user.pop("_id", None)
    return user

def get_all_users():
    db = get_db()
    users = list(db["users"].find({}, {"password": 0}))
    for u in users:
        u["id"] = str(u.get("_id", u.get("id", "")))
        u.pop("_id", None)
    return users

def delete_user(user_id: str):
    db = get_db()
    db["users"].delete_one({"id": user_id})

# ── POSTS ──────────────────────────────────────────────────────────
def get_posts_by_user(user_id: str):
    db = get_db()
    posts = list(db["posts"].find({"user_id": user_id}))
    for p in posts:
        p["id"] = str(p.get("_id", p.get("id", "")))
        p.pop("_id", None)
    return posts

def get_all_posts():
    db = get_db()
    posts = list(db["posts"].find().sort("created_at", -1).limit(50))
    for p in posts:
        p["id"] = str(p.get("_id", p.get("id", "")))
        p.pop("_id", None)
    return posts

def create_post(user_id: str, title: str, content: str):
    db = get_db()
    from datetime import datetime
    post = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "content": content,
        "created_at": datetime.utcnow().isoformat()
    }
    db["posts"].insert_one(post)
    post.pop("_id", None)
    return post

def find_post_by_id(post_id: str):
    db = get_db()
    post = db["posts"].find_one({"id": post_id})
    if post:
        post["id"] = str(post.get("_id", post.get("id", "")))
        post.pop("_id", None)
    return post

def delete_post(post_id: str):
    db = get_db()
    db["posts"].delete_one({"id": post_id})

# ── AI ASSESSMENTS ─────────────────────────────────────────────────
def save_assessment(user_id: str, video_id: str, attributes: dict):
    db = get_db()
    from datetime import datetime
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "video_id": video_id,
        "attributes": attributes,
        "created_at": datetime.utcnow().isoformat()
    }
    db["ai_assessments"].insert_one(doc)
    doc.pop("_id", None)
    return doc

def get_assessments_by_user(user_id: str):
    db = get_db()
    docs = list(db["ai_assessments"].find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(20))
    for d in docs:
        d["id"] = str(d.get("_id", d.get("id", "")))
        d.pop("_id", None)
    return docs

# ── CONNECTIONS ────────────────────────────────────────────────────
def send_connection(from_user_id: str, to_user_id: str):
    db = get_db()
    conn = {
        "id": str(uuid.uuid4()),
        "user_id": from_user_id,
        "connect_with": to_user_id,
        "status": "pending"
    }
    db["connections"].insert_one(conn)
    conn.pop("_id", None)
    return conn

def get_connections(user_id: str):
    db = get_db()
    conns = list(db["connections"].find(
        {"user_id": user_id, "status": "accepted"}
    ))
    for c in conns:
        c["id"] = str(c.get("_id", c.get("id", "")))
        c.pop("_id", None)
    return conns

def accept_connection(connection_id: str):
    db = get_db()
    db["connections"].update_one(
        {"id": connection_id},
        {"$set": {"status": "accepted"}}
    )

# ── EVENTS ────────────────────────────────────────────────────────
def get_all_events():
    db = get_db()
    events = list(db["events"].find({}))
    for e in events:
        e["id"] = str(e.get("_id", e.get("id", "")))
        e.pop("_id", None)
    return events

def create_event(title: str, location: str, date: str, created_by: str = None):
    db = get_db()
    event = {
        "id": str(uuid.uuid4()),
        "title": title,
        "location": location,
        "date": date,
        "created_by": created_by
    }
    db["events"].insert_one(event)
    event.pop("_id", None)
    return event

# ── PROFILES ──────────────────────────────────────────────────────
def get_profile(user_id: str):
    db = get_db()
    profile = db["profiles"].find_one({"user_id": user_id})
    if profile:
        profile["id"] = str(profile.get("_id", profile.get("id", "")))
        profile.pop("_id", None)
    return profile

def save_profile(user_id: str, profile_data: dict):
    db = get_db()
    profile_data["user_id"] = user_id
    db["profiles"].update_one(
        {"user_id": user_id},
        {"$set": profile_data},
        upsert=True
    )
    return get_profile(user_id)
