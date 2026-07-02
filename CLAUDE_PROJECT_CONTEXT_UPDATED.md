# CLAUDE PROJECT CONTEXT UPDATED

Generated from: C:\FYP\edu-helper
Generated at: Sat 06/27/2026  0:28:18.33

Project: AI-Based University Recommendation System
Repo folder: edu-helper

This file gives Claude updated context about the current codebase.
It does not include .env, node_modules, .git, or build output folders.
Secret-looking lines are removed for safety.

## Current completed work

- Docker/build fixed.
- Auth role separation hardened.
- Student Profile connected to backend.
- Preferences persistence added.
- Find Universities wizard auto-fill may be present if committed/current.
- Saved Universities and Recommendation History ID mismatches fixed.
- University Catalog connected to backend and seeded.
- Demo-safe banners added to mock/future-scope pages.
- Admin APIs, admin analytics, and safe user management may be present if committed/current.
- Smoke test script added.

## Git status
```text
## dev...origin/dev
?? CLAUDE_PROJECT_CONTEXT_UPDATED.md
?? make_context.cmd
```

## Latest commits
```text
e7cde7f feat: add wizard autofill analytics and user management
c894992 feat: add admin APIs preferences persistence and smoke tests
9037be7 feat: make demo pages and recommendations safer
f14e6a0 feat: connect university catalog to backend
47f0a7b fix: route recommendations to real finder flow
42bd39b fix: resolve saved and history id route mismatches
6d7c13d feat: connect student profile to backend
f4f2dbb fix: remove stale refresh token cleanup
f63eb56 fix: harden auth role separation
9368650 fix: add react-is dependency for recharts build
8278855 chore: save current working FYP baseline before Claude setup
22d9631 feat: AI university recommendations with OpenAI GPT-4o integration
```

## Key project files


## File: CLAUDE.md

````text
# AI-Based University Recommendation System - Claude Rules

## Project Summary

This is a BSCS Final Year Project named AI-Based University Recommendation System. It helps students planning to study abroad by analyzing academic profile, budget, target degree, program interests, scores, country/continent/worldwide preferences, and credentials, then providing AI-assisted university recommendations.

## Tech Stack

Frontend: React, Vite, TailwindCSS.
Backend: FastAPI, MongoDB, Beanie ODM.
Auth: JWT authentication.
AI: OpenAI API foundation.
Development: Docker Compose, Git, private GitHub repo.

## Main Rule

Do not break the current working project.

## Workflow

Always follow:
Analyze → Plan → List affected files → Wait for approval → Edit → Test → Summary.

## Coding Rules

* Do not rewrite the full project unless explicitly asked.
* Do not refactor unrelated files.
* Do not touch frontend unless the task requires it.
* Do not touch recommendation logic unless the task requires it.
* Do not commit or push unless I explicitly approve.
* Keep changes minimal and testable.
* After edits, show git diff summary and exact test commands.

## Current Priority

Backend stability and security first. UI polish later.

## Security Rules

* Public registration must never trust a client-supplied role.
* Student/admin role separation must be enforced server-side.
* Official university data should come from verified database records wherever possible, not blindly from AI-generated output.

## Git Rules

main is stable.
dev is active development.
Commit only after tests pass.
````

## File: docker-compose.yml

````text


services:

  # ── MongoDB ─────────────────────────────────────────────────────────────────
  db:
    image: mongo:7.0
    container_name: mongodb_fyp
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ── Backend (FastAPI) ────────────────────────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend_fyp
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - MONGODB_URL=mongodb://db:27017     # Override local URL with Docker service name
    volumes:
      - ./backend:/app                     # ← Hot-reload: mounts your local backend folder
    depends_on:
      db:
        condition: service_healthy         # Wait until MongoDB is truly ready

  # ── Frontend (React + Vite → Nginx) ─────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:8000/api/v1   # Baked into the Vite build
    container_name: frontend_fyp
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
````

## File: README.md

````text
# 🎓 EduHelper — AI-Powered University Advisor

EduHelper is a full-stack AI-powered web application that recommends universities to students based on their academic profile using OpenAI's GPT-4o model.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Database** | MongoDB (via Docker) |
| **AI** | OpenAI GPT-4o (direct HTTP API) |
| **ODM** | Beanie (MongoDB async ODM) |
| **Containerisation** | Docker & Docker Compose |

---

## ✅ Prerequisites — Install These First

### 1. Docker & Docker Compose
Docker is the **only** tool you need to install. It will handle Python, Node.js, MongoDB — everything.

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER

# Log out and back in for the group change to take effect
```

**Verify installation:**
```bash
docker --version          # Should show Docker version
docker-compose --version  # Should show docker-compose version
```

### 2. Git
```bash
sudo apt install -y git
git --version
```

### 3. OpenAI API Key
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Copy it — you will need it in the `.env` file

---

## 🚀 Setup & Run — Step by Step

### Step 1: Clone the Repository
```bash
git clone https://github.com/bilalqaisar1/edu-helper.git
cd edu-helper
```

### Step 2: Create Your Environment File
```bash
# Copy the template
cp .env.example .env

# Open and edit it
nano .env
```

Fill in your values:
```env
MONGODB_URL=mongodb://db:27017
DATABASE_NAME=ai_university_advisor
VITE_API_URL=http://localhost:8000/api/v1
```

> ⚠️ **Important:** Never share or commit your `.env` file. It is already in `.gitignore`.

### Step 3: Stop Local MongoDB (if running)
If you have MongoDB installed locally, it will conflict with Docker on port 27017. Stop it first:
```bash
sudo systemctl stop mongod
sudo systemctl disable mongod
```

### Step 4: Build and Run with Docker
```bash
# Build all containers and start the project
docker-compose up --build
```

Wait for this message in the terminal:
```
backend_fyp | INFO: Application startup complete.
```

### Step 5: Open the App
| Service | URL |
|---|---|
| **Frontend (App)** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

## 🔄 Daily Usage Commands

```bash
# Start the project (after first build)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop the project
docker-compose down

# Rebuild after code changes
docker-compose down
docker-compose build --no-cache
docker-compose up

# View backend logs
docker-compose logs -f backend

# View all logs
docker-compose logs -f
```

---

## 📁 Project Structure

```
edu-helper/
├── backend/                # FastAPI Python backend
│   ├── main.py             # API routes & OpenAI integration
│   ├── models.py           # MongoDB document models (Beanie)
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT authentication
│   ├── database.py         # MongoDB connection
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable UI components
│   │   └── hooks/          # Custom React hooks
│   └── Dockerfile
├── docker-compose.yml      # Orchestrates all services
├── .env.example            # Template for environment variables
└── README.md
```

---

## 🌟 Key Features

- **AI University Recommendations** — GPT-4o analyzes your profile and recommends 10+ universities (Safe, Target, and Reach)
- **6-Step Wizard** — Guided form collecting academic, financial, and preference data
- **Save & Compare** — Bookmark universities and compare side-by-side
- **Export** — Download recommendations as PDF or CSV
- **Search History** — View previous recommendation sessions
- **JWT Auth** — Secure registration and login

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| `address already in use: 27017` | Run `sudo systemctl stop mongod` |
| Frontend shows blank page | Run `docker-compose logs frontend` to check for build errors |
| Backend 422 error | Clear the form and try again — some fields may have invalid types |
| Changes not reflected | Run `docker-compose down && docker-compose build --no-cache && docker-compose up` |

---

## 📄 License

MIT License — feel free to use and modify.
````

## File: backend\main.py

````text
import os
import json
import httpx
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from beanie import PydanticObjectId
from uuid import UUID
from datetime import datetime, timedelta

import models
import schemas
import auth
from database import init_db

# ── LIFECYCLE ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(models.ALL_MODELS)
    yield

app = FastAPI(title="AI University Advisor API (MongoDB)", version="2.0.0", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# ── AUTH ENDPOINTS ──────────────────────────────────────────────────────────

async def register_user(user_data: schemas.UserRegister):
    existing_user = await models.User.find_one(models.User.email == user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user_data.email,
        full_name=user_data.full_name,
        role="student"  # Role is forced server-side; never trust client input
    )
    await new_user.insert()

    # Initialize student profile if needed
    if new_user.role == "student":
        profile = models.StudentProfile(user=new_user)
        await profile.insert()


    user = await models.User.find_one(models.User.email == user_data.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/api/v1/auth/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ── ADMIN ENDPOINTS (read-only; protected by get_current_admin) ───────────────

@app.get("/api/v1/admin/stats", response_model=schemas.AdminStats)
async def admin_stats(current_admin: models.User = Depends(auth.get_current_admin)):
    return {
        "total_users": await models.User.find_all().count(),
        "total_students": await models.User.find(models.User.role == "student").count(),
        "total_admins": await models.User.find(models.User.role == "admin").count(),
        "total_universities": await models.University.find_all().count(),
        "total_saved_universities": await models.SavedUniversity.find_all().count(),
        "total_recommendation_sessions": await models.RecommendationSession.find_all().count(),
    }

@app.get("/api/v1/admin/users", response_model=List[schemas.AdminUserOut])
async def admin_users(current_admin: models.User = Depends(auth.get_current_admin)):
    return await models.User.find_all().sort(-models.User.created_at).to_list()

@app.patch("/api/v1/admin/users/{user_id}", response_model=schemas.AdminUserOut)
async def admin_update_user(
    user_id: UUID,
    update: schemas.AdminUserUpdate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    user = await models.User.find_one(models.User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = update.model_dump(exclude_unset=True)

    # Validate role is one of the allowed values.
    if data.get("role") is not None and data["role"] not in ("student", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'admin'")

    # Guard against an admin locking themselves out of the admin area.
    if user.id == current_admin.id:
        if data.get("is_active") is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
        if data.get("role") is not None and data["role"] != "admin":
            raise HTTPException(status_code=400, detail="You cannot change your own role")

    if data:
        await user.set(data)
    return user

@app.get("/api/v1/admin/analytics", response_model=schemas.AdminAnalytics)
async def admin_analytics(current_admin: models.User = Depends(auth.get_current_admin)):
    # Simple, Motor-safe analytics: load lists and group in Python (no aggregation pipelines).
    users = await models.User.find_all().to_list()
    students = sum(1 for u in users if u.role == "student")
    admins = sum(1 for u in users if u.role == "admin")
    active = sum(1 for u in users if u.is_active)
    inactive = sum(1 for u in users if not u.is_active)

    # Recommendation sessions per day for the last 7 days (oldest → newest).
    sessions = await models.RecommendationSession.find_all().to_list()
    today = datetime.utcnow().date()
    day_list = [today - timedelta(days=i) for i in range(6, -1, -1)]
    day_counts = {d.isoformat(): 0 for d in day_list}
    for s in sessions:
        if getattr(s, "created_at", None):
            key = s.created_at.date().isoformat()
            if key in day_counts:
                day_counts[key] += 1
    sessions_by_day = [{"date": d.isoformat(), "count": day_counts[d.isoformat()]} for d in day_list]

    # Universities grouped by country (resolve the Country link via an id→name map).
    universities = await models.University.find_all().to_list()
    countries = await models.Country.find_all().to_list()
    country_map = {str(c.id): c.name for c in countries}
    country_counts = {}
    for u in universities:
        link = getattr(u, "country", None)
        ref = getattr(link, "ref", None)
        name = country_map.get(str(ref.id)) if ref is not None else None
        if name:
            country_counts[name] = country_counts.get(name, 0) + 1
    universities_by_country = sorted(
        [{"country": k, "count": v} for k, v in country_counts.items()],
        key=lambda x: x["count"], reverse=True,
    )

    # Most-saved universities (by name; SavedUniversity stores a denormalized name).
    saved = await models.SavedUniversity.find_all().to_list()
    saved_counts = {}
    for sv in saved:
        saved_counts[sv.university_name] = saved_counts.get(sv.university_name, 0) + 1
    top_saved_universities = sorted(
        [{"university_name": k, "count": v} for k, v in saved_counts.items()],
        key=lambda x: x["count"], reverse=True,
    )[:5]

    return {
        "users_by_role": {"students": students, "admins": admins},
        "users_by_status": {"active": active, "inactive": inactive},
        "sessions_by_day": sessions_by_day,
        "universities_by_country": universities_by_country,
        "top_saved_universities": top_saved_universities,
    }

# ── STUDENT ENDPOINTS ────────────────────────────────────────────────────────

@app.get("/api/v1/student/profile", response_model=schemas.StudentProfile)
async def get_student_profile(current_user: models.User = Depends(auth.get_current_user)):
    profile = await models.StudentProfile.find_one(models.StudentProfile.user.id == current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/api/v1/student/profile", response_model=schemas.StudentProfile)
async def update_student_profile(
    profile_update: schemas.StudentProfileBase,
    current_user: models.User = Depends(auth.get_current_user)
):
    profile = await models.StudentProfile.find_one(models.StudentProfile.user.id == current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_update.model_dump(exclude_unset=True)
    await profile.set(update_data)
    return profile

# ── SAVED UNIVERSITIES ──────────────────────────────────────────────────────

@app.get("/api/v1/universities/saved", response_model=List[schemas.SavedUniversityOut])
async def get_saved_universities(current_user: models.User = Depends(auth.get_current_user)):
    saved_list = await models.SavedUniversity.find(
        models.SavedUniversity.user.id == current_user.id
    ).to_list()
    return saved_list

@app.post("/api/v1/universities/save", response_model=schemas.SavedUniversityOut)
async def save_university(
    data: schemas.SaveUniversityRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    saved = models.SavedUniversity(
        user=current_user,
        university_name=data.university_name,
        country=data.country,
        degree=data.degree,
        major=data.major,
        admission_chance=data.admission_chance,
        world_rank=data.world_rank,
        scholarship_available=data.scholarship_available,
        university_email=data.university_email,
        university_website=data.university_website,
        description=data.description,
        reason_for_match=data.reason_for_match,
        session_id=data.session_id,
    )
    await saved.insert()
    return saved

@app.delete("/api/v1/universities/saved/{saved_id}")
async def delete_saved_university(
    saved_id: UUID,  # SavedUniversity.id is a UUID, not a Mongo ObjectId
    current_user: models.User = Depends(auth.get_current_user)
):
    saved = await models.SavedUniversity.find_one(
        models.SavedUniversity.id == saved_id,
        models.SavedUniversity.user.id == current_user.id
    )
    if not saved:
        raise HTTPException(status_code=404, detail="Saved university not found")
    await saved.delete()
    return {"message": "Removed successfully"}

# ── UNIVERSITY ENDPOINTS ────────────────────────────────────────────────────

def _university_out(uni: "models.University", country_name) -> dict:
    """Flatten a University document into the response shape. country_name is the
    pre-resolved Country.name (Link is resolved by the caller, since fetch_links
    is unavailable with this Motor version)."""
    return {
        "id": uni.id,
        "university_name": uni.university_name,
        "country": country_name,
        "city": uni.city,
        "qs_ranking": uni.qs_ranking,
        "website": uni.website,
        "yearly_tuition_fee": uni.yearly_tuition_fee,
        "acceptance_rate": uni.acceptance_rate,
        "description": uni.description,
        "created_at": uni.created_at,
    }

def _country_ref_id(uni) -> str | None:
    """Return the linked Country's id as a string, if present."""
    link = getattr(uni, "country", None)
    ref = getattr(link, "ref", None)
    return str(ref.id) if ref is not None else None

@app.get("/api/v1/universities", response_model=List[schemas.University])
async def list_universities():
    universities = await models.University.find_all().to_list()
    countries = await models.Country.find_all().to_list()
    country_map = {str(c.id): c.name for c in countries}
    return [
        _university_out(uni, country_map.get(_country_ref_id(uni)))
        for uni in universities
    ]

@app.get("/api/v1/universities/{uni_id}", response_model=schemas.University)
async def get_university(uni_id: PydanticObjectId):
    uni = await models.University.get(uni_id)
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    country_name = None
    ref_id = _country_ref_id(uni)
    if ref_id:
        country = await models.Country.get(ref_id)
        country_name = country.name if country else None
    return _university_out(uni, country_name)

# ── AI RECOMMENDATION ENDPOINT ───────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are an expert university admissions counselor. "
    "Given a student's profile, recommend a diverse list of at least 10 universities. "
    "Include a mix of SAFE, TARGET, and REACH universities. "
    "Even for weak profiles, include top global universities (Ivy League, Top 100 QS) as REACH options with low chances (5-20%). "
    "For each university provide the following information: "
    "university name, country, official website URL (e.g. https://www.mit.edu), "
    "direct admissions page URL (e.g. https://admissions.mit.edu), "
    "the real official admissions contact email address of the university (e.g. admissions@mit.edu), "
    "admission chances as a percentage (0-100), "
    "a DETAILED reason why it matches this specific student (see instructions below), "
    "and the application deadline (specific month and day, e.g. January 15 or December 1). "
    "Output ONLY valid JSON with a top-level key 'universities' containing an array. "
    "Each object must have exactly these fields: "
    "'name' (string), 'country' (string), 'website' (string, full https URL of official homepage), "
    "'admissions_url' (string, full https URL of the admissions/apply page), "
    "'email' (string, real official admissions email address like admissions@university.edu), "
    "'chances' (integer 0-100), 'reason' (string), 'deadline' (string). "
    "IMPORTANT — 'reason' must be 3-5 sentences that EXPLICITLY reference the student's actual credentials: "
    "mention their CGPA, relevant test scores (IELTS/GRE/GMAT if provided), intended major, research or work experience, "
    "and explain concretely WHY this university is a good fit (e.g. strong program ranking, research labs, scholarships, acceptance rate). "
    "Do NOT write a generic reason — it must be personalised to the student's profile. "
    "IMPORTANT: website, admissions_url, and email must be real and accurate — never null, never empty, never fabricated. "
    "IMPORTANT: deadline must be a real, accurate application deadline for the program (e.g. 'January 15' or 'December 1') — never null or empty."
)

@app.post("/api/v1/ai/recommend", response_model=schemas.RecommendationResponse)
async def get_university_recommendations(
    profile_data: schemas.StudentRecommendationProfileIn,
    current_user: models.User = Depends(auth.get_current_user)
):
    profile_dict = profile_data.model_dump(exclude_none=True)

    # Build user message exactly like bnn.py
    p = profile_dict
    user_message = f"""
Student Profile:
- Name: {p.get('full_name', 'N/A')}
- Email: {p.get('email', 'N/A')}
- Country: {p.get('country', 'N/A')}
- Nationality: {p.get('nationality', 'N/A')}
- Current Education Level: {p.get('current_degree_level', 'N/A')}
- CGPA: {p.get('cgpa', 'N/A')}
- IELTS: {p.get('ielts', 'N/A')}, TOEFL: {p.get('toefl', 'N/A')}, GRE: {p.get('gre', 'N/A')}, GMAT: {p.get('gmat', 'N/A')}
- Gap Years: {p.get('year_gap', 0)}
- Number of Publications: {p.get('num_publications', 0)}
- Research Experience: {p.get('research_experience', 'N/A')}
- Work Experience: {p.get('work_experience', 'N/A')}
- Degree Applying For: {p.get('degree_applying_for', 'N/A')}
- Intended Major: {p.get('intended_major', 'N/A')}
- Preferred Continents: {p.get('continents', 'Any')}
- Preferred Countries: {p.get('countries', 'Any')}
- Needs Scholarship: {p.get('need_scholarship', False)}
- Research Focused: {p.get('research_focused', False)}

Recommend at least 10 universities. Include SAFE, TARGET and REACH options.
"""

    if not openai_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_key}"
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(OPENAI_API_URL, headers=headers, json=payload)
        resp.raise_for_status()

        content = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(content)

        raw_unis = data.get("universities", [])

        # Map AI fields → our schema fields
        universities = []
        for u in raw_unis:
            uni_name = u.get("name", "Unknown University")
            # Use real AI-returned URLs; fall back to Google search only if truly missing
            name_encoded = uni_name.replace(" ", "+")
            website = u.get("website") or f"https://www.google.com/search?q={name_encoded}+official+site"
            universities.append({
                "university_name":    uni_name,
                "country":            u.get("country", "N/A"),
                "degree":             p.get("degree_applying_for", "N/A"),
                "major":              p.get("intended_major", "N/A"),
                "admission_chance":   float(u.get("chances", 50)),
                "world_rank":         u.get("world_rank") or u.get("rank"),
                "scholarship_available": u.get("scholarship_available"),
                "university_email":   u.get("email") or "",      # real admissions email address
                "university_website": website,                    # real official website URL
                "description":        u.get("deadline", ""),      # application deadline (shown as 'Deadline: ...' on card)
                "reason_for_match":   u.get("reason", ""),        # detailed, student-specific match reason
            })

        session = models.RecommendationSession(
            user=current_user,
            profile_snapshot=profile_dict,
            universities=universities,
            total_count=len(universities),
        )
        await session.insert()

        return {
            "session_id": str(session.id),
            "student_profile": profile_dict,
            "recommended_universities": universities,
            "total_count": len(universities),
            "created_at": session.created_at,
        }

    except httpx.HTTPStatusError as e:
        # Log minimal, non-sensitive info server-side; never leak the upstream body to the client.
        print(f"OpenAI request failed with status {e.response.status_code}")
        raise HTTPException(status_code=502, detail="The recommendation service is temporarily unavailable. Please try again.")
    except Exception as e:
        print(f"AI recommendation error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations. Please try again.")

# ── RECOMMENDATION HISTORY ───────────────────────────────────────────────────

@app.get("/api/v1/recommendations/history", response_model=List[schemas.RecommendationHistoryItem])
async def get_recommendation_history(current_user: models.User = Depends(auth.get_current_user)):
    sessions = await models.RecommendationSession.find(
        models.RecommendationSession.user.id == current_user.id
    ).sort(-models.RecommendationSession.created_at).to_list()

    return [
        {
            "session_id": str(s.id),
            "intended_major": s.profile_snapshot.get("intended_major"),
            "degree_applying_for": s.profile_snapshot.get("degree_applying_for"),
            "total_count": s.total_count,
            "created_at": s.created_at,
        }
        for s in sessions
    ]

@app.get("/api/v1/recommendations/history/{session_id}", response_model=schemas.RecommendationResponse)
async def get_recommendation_session(
    session_id: UUID,  # RecommendationSession.id is a UUID, not a Mongo ObjectId
    current_user: models.User = Depends(auth.get_current_user)
):
    session = await models.RecommendationSession.find_one(
        models.RecommendationSession.id == session_id,
        models.RecommendationSession.user.id == current_user.id
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": str(session.id),
        "student_profile": session.profile_snapshot,
        "recommended_universities": session.universities,
        "total_count": session.total_count,
        "created_at": session.created_at,
    }

# ── AI CHAT ENDPOINT ────────────────────────────────────────────────────────

@app.post("/api/v1/ai/chat", response_model=schemas.ChatResponse)
async def ai_chat(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    if not openai_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")
    try:
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are a professional university admissions counselor."},
                {"role": "user", "content": request.message}
            ],
            "temperature": 0.3,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_key}"
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(OPENAI_API_URL, headers=headers, json=payload)
        resp.raise_for_status()
        reply = resp.json()["choices"][0]["message"]["content"]
        return {"reply": reply}
    except Exception as e:
        print(f"AI chat error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="The chat service is temporarily unavailable. Please try again.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
````

## File: backend\auth.py

````text
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
import models

# Security configuration
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")



    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
    to_encode.update({"exp": expire})
    return encoded_jwt

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Async MongoDB find
    user = await models.User.find_one(models.User.email == email)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user

async def get_current_admin(current_user: models.User = Depends(get_current_user)):
    """Dependency that requires the authenticated user to have the admin role.

    Additive only — not yet attached to any route.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
````

## File: backend\database.py

````text
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection string - default to 'db' service for Docker
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://db:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_university_advisor")

# 🚨 BEANIE-MOTOR FIX 🚨
# Beanie 2.1.0 tries to call 'database.client' as if it's a method in newer Motor versions.
# This monkeypatch allows Beanie to function with Motor 3.x.
def patch_motor():
    def client_prop(self):
        return self.delegate.client
    AsyncIOMotorDatabase.client = property(client_prop)

patch_motor()

async def init_db(models: list):
    """
    Initialize Beanie ODM with Motor client and models.
    """
    client = AsyncIOMotorClient(MONGODB_URL, uuidRepresentation='standard')
    await init_beanie(database=client[DATABASE_NAME], document_models=models)
````

## File: backend\schemas.py

````text
from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from beanie import PydanticObjectId

# ── User Schemas ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "student"

class UserCreate(UserBase):

class UserRegister(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

    user: User

# ── Admin Schemas ────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_students: int
    total_admins: int
    total_universities: int
    total_saved_universities: int
    total_recommendation_sessions: int

class AdminUserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class AdminAnalytics(BaseModel):
    users_by_role: Dict[str, int]
    users_by_status: Dict[str, int]
    sessions_by_day: List[Dict[str, Any]]
    universities_by_country: List[Dict[str, Any]]
    top_saved_universities: List[Dict[str, Any]]

# ── Student Profile Schemas ──────────────────────────────────────────────────

class StudentProfileBase(BaseModel):
    cgpa: Optional[float] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    ielts_score: Optional[float] = None
    toefl_score: Optional[int] = None
    gre_score: Optional[int] = None
    gmat_score: Optional[int] = None
    work_experience_months: Optional[int] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    preferred_study_level: Optional[str] = None
    preferred_countries: Optional[List[str]] = None
    preferred_fields: Optional[List[str]] = None

class StudentProfileCreate(StudentProfileBase):
    user_id: UUID

class StudentProfile(StudentProfileBase):
    # The StudentProfile document uses a Mongo ObjectId for id and stores the
    # owner as a Link[User], so neither maps to a required UUID. Both are made
    # optional/ObjectId-typed purely so response serialization succeeds; the
    # frontend reads only the academic fields, not these identifiers.
    id: Optional[PydanticObjectId] = None
    user_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ── Student Recommendation Profile (Full Form) ───────────────────────────────

class StudentRecommendationProfileIn(BaseModel):
    # Personal
    full_name: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    nationality: Optional[str] = None

    # Academic
    current_degree_level: Optional[str] = None
    degree_completed: Optional[bool] = None
    current_university: Optional[str] = None
    cgpa: Optional[float] = None
    total_credits: Optional[int] = None
    current_semester: Optional[int] = None
    graduation_year: Optional[int] = None
    year_gap: Optional[int] = None
    num_publications: Optional[int] = None
    num_research_papers: Optional[int] = None
    research_experience: Optional[str] = None
    work_experience: Optional[str] = None

    # Target
    degree_applying_for: Optional[str] = None
    intended_major: Optional[str] = None

    # Language
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    gre: Optional[int] = None
    gmat: Optional[int] = None
    sat: Optional[int] = None

    # Financial
    need_scholarship: Optional[bool] = None
    fully_funded_required: Optional[bool] = None
    partial_scholarship_accepted: Optional[bool] = None

    # Location
    continents: Optional[List[str]] = None
    countries: Optional[List[str]] = None

    # Additional
    public_only: Optional[bool] = None
    private_allowed: Optional[bool] = None
    research_focused: Optional[bool] = None
    industry_focused: Optional[bool] = None
    top_ranked_only: Optional[bool] = None

    @model_validator(mode='before')
    @classmethod
    def empty_string_to_none(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data

# ── AI Recommendation Schemas ────────────────────────────────────────────────

class RecommendedUniversityOut(BaseModel):
    university_name: str
    country: str
    degree: str
    major: str
    admission_chance: float
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None

class AIRecommendationOutput(BaseModel):
    student_profile: Dict[str, Any]
    recommended_universities: List[RecommendedUniversityOut]

class RecommendationResponse(BaseModel):
    session_id: str
    student_profile: Dict[str, Any]
    recommended_universities: List[RecommendedUniversityOut]
    total_count: int
    created_at: datetime

# ── Session History Schemas ──────────────────────────────────────────────────

class RecommendationHistoryItem(BaseModel):
    session_id: str
    intended_major: Optional[str] = None
    degree_applying_for: Optional[str] = None
    total_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# ── Saved University Schemas ─────────────────────────────────────────────────

class SaveUniversityRequest(BaseModel):
    university_name: str
    country: str
    degree: str
    major: str
    admission_chance: float
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None
    session_id: Optional[UUID] = None

class SavedUniversityOut(BaseModel):
    id: UUID
    university_name: str
    country: str
    degree: str
    major: str
    admission_chance: float
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None
    session_id: Optional[UUID] = None
    saved_at: datetime

    class Config:
        from_attributes = True

# ── University & Program Schemas ─────────────────────────────────────────────

class UniversityBase(BaseModel):
    university_name: str
    country: Optional[str] = None      # resolved Country.name (model stores a Link[Country])
    qs_ranking: Optional[int] = None
    website: Optional[str] = None
    city: Optional[str] = None
    yearly_tuition_fee: Optional[int] = None
    acceptance_rate: Optional[float] = None
    description: Optional[str] = None

class University(UniversityBase):
    # University documents use a Mongo ObjectId id (no UUID field on the model).
    id: Optional[PydanticObjectId] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    program_name: str
    university_id: UUID
    field_id: Optional[int] = None
    study_level: Optional[str] = None
    duration_months: Optional[int] = None
    tuition_fee: Optional[int] = None
    minimum_cgpa: Optional[float] = None
    minimum_ielts: Optional[float] = None

class Program(ProgramBase):
    id: UUID

    class Config:
        from_attributes = True

# ── AI & Prediction Schemas ──────────────────────────────────────────────────

class PredictionCreate(BaseModel):
    university_program_id: UUID

class PredictionResponse(BaseModel):
    id: UUID
    admission_probability: float
    category: str  # SAFE | MODERATE | REACH
    explanation: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
````

## File: backend\models\__init__.py

````text
from typing import Optional, List, Any, Annotated
from datetime import datetime
from uuid import UUID, uuid4
from beanie import Document, Link, Indexed
from pydantic import Field, EmailStr

# ── USERS ───────────────────────────────────────────────────────────────────

class User(Document):
    id: UUID = Field(default_factory=uuid4)
    full_name: Optional[str] = None
    email: EmailStr = Indexed(unique=True)
    role: str = "student"  # admin | student
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

# ── STUDENT_PROFILES ────────────────────────────────────────────────────────

class StudentProfile(Document):
    user: Link[User]
    cgpa: Optional[float] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    ielts_score: Optional[float] = None
    toefl_score: Optional[int] = None
    gre_score: Optional[int] = None
    gmat_score: Optional[int] = None
    work_experience_months: Optional[int] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    preferred_study_level: Optional[str] = None
    preferred_countries: Optional[List[str]] = None
    preferred_fields: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "student_profiles"

# ── STUDENT RECOMMENDATION PROFILE ──────────────────────────────────────────

class StudentRecommendationProfile(Document):
    """Extended profile for AI university recommendation form."""
    user: Link[User]

    # Personal
    full_name: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    nationality: Optional[str] = None

    # Academic
    current_degree_level: Optional[str] = None       # Intermediate|Diploma|BS|MS|PhD
    degree_completed: Optional[bool] = None
    current_university: Optional[str] = None
    cgpa: Optional[float] = None
    total_credits: Optional[int] = None
    current_semester: Optional[int] = None
    graduation_year: Optional[int] = None
    year_gap: Optional[int] = None
    num_publications: Optional[int] = None
    num_research_papers: Optional[int] = None
    research_experience: Optional[str] = None
    work_experience: Optional[str] = None

    # Target
    degree_applying_for: Optional[str] = None        # BS|MS|MPhil|PhD
    intended_major: Optional[str] = None

    # Language
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    gre: Optional[int] = None
    gmat: Optional[int] = None
    sat: Optional[int] = None

    # Financial
    need_scholarship: Optional[bool] = None
    fully_funded_required: Optional[bool] = None
    partial_scholarship_accepted: Optional[bool] = None

    # Location
    continents: Optional[List[str]] = None            # ["North America", "Europe", ...]
    countries: Optional[List[str]] = None             # ["USA", "Canada", ...]

    # Additional
    public_only: Optional[bool] = None
    private_allowed: Optional[bool] = None
    research_focused: Optional[bool] = None
    industry_focused: Optional[bool] = None
    top_ranked_only: Optional[bool] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "student_recommendation_profiles"

# ── RECOMMENDATION SESSION ───────────────────────────────────────────────────

class RecommendedUniversityItem(Document):
    """A single AI-recommended university stored in a session."""
    session_id: UUID
    university_name: str
    country: str
    degree: str
    major: str
    admission_chance: float       # 0–100
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None

    class Settings:
        name = "recommended_university_items"

class RecommendationSession(Document):
    """Groups a batch of AI recommendations for history tracking."""
    id: UUID = Field(default_factory=uuid4)
    user: Link[User]
    profile_snapshot: dict = Field(default_factory=dict)    # raw form data
    universities: List[dict] = Field(default_factory=list)  # raw JSON list
    total_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "recommendation_sessions"

# ── SAVED UNIVERSITIES ───────────────────────────────────────────────────────

class SavedUniversity(Document):
    """User-bookmarked university from a recommendation session."""
    id: UUID = Field(default_factory=uuid4)
    user: Link[User]
    university_name: str
    country: str
    degree: str
    major: str
    admission_chance: float
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None
    session_id: Optional[UUID] = None
    saved_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "saved_universities"

# ── COUNTRIES & FIELDS ──────────────────────────────────────────────────────

class Country(Document):
    name: str = Indexed(unique=True)

    class Settings:
        name = "countries"

class FieldOfStudy(Document):
    name: str = Indexed(unique=True)

    class Settings:
        name = "fields_of_study"

# ── UNIVERSITIES ────────────────────────────────────────────────────────────

class University(Document):
    university_name: Annotated[str, Indexed()]
    country: Link[Country]
    qs_ranking: Optional[int] = None
    website: Optional[str] = None
    city: Optional[str] = None
    yearly_tuition_fee: Optional[int] = None
    acceptance_rate: Optional[float] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "universities"

class UniversityProgram(Document):
    university: Link[University]
    field: Link[FieldOfStudy]
    program_name: str
    study_level: str
    duration_months: Optional[int] = None
    tuition_fee: Optional[int] = None
    minimum_cgpa: Optional[float] = None
    minimum_ielts: Optional[float] = None

    class Settings:
        name = "university_programs"

# ── AI & APPLICATIONS ───────────────────────────────────────────────────────

class AdmissionPrediction(Document):
    student_profile: Link[StudentProfile]
    program: Link[UniversityProgram]
    admission_probability: float
    category: str  # SAFE | MODERATE | REACH
    explanation: str
    model_used: str = "GPT-4o"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "admission_predictions"

class Application(Document):
    student_profile: Link[StudentProfile]
    program: Link[UniversityProgram]
    status: str = "Applied"  # Applied|Pending|Accepted|Rejected
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "applications"

# List of models for Beanie initialization
ALL_MODELS = [
    User,
    StudentProfile,
    StudentRecommendationProfile,
    RecommendationSession,
    RecommendedUniversityItem,
    SavedUniversity,
    Country,
    FieldOfStudy,
    University,
    UniversityProgram,
    AdmissionPrediction,
    Application,
]
````

## File: backend\create_admin.py

````text
"""Standalone, idempotent admin bootstrap script.

Creates a single admin user if one with the given email does not already exist.
Re-running is safe: an existing user with the same email is left untouched.

Credentials are read from environment variables:
    ADMIN_EMAIL     (required)
    ADMIN_NAME      (optional, default: Administrator)

Usage (from the backend/ directory):
    python create_admin.py
"""
import asyncio
import os

import models
import auth
from database import init_db


async def main():
    email = os.getenv("ADMIN_EMAIL")
    full_name = os.getenv("ADMIN_NAME", "Administrator")

    if missing:
        print(f"Error: required environment variable(s) not set: {', '.join(missing)}")
        raise SystemExit(1)

    await init_db(models.ALL_MODELS)

    existing = await models.User.find_one(models.User.email == email)
    if existing:
        print(f"Admin already exists: {email} (role={existing.role}) — no changes made.")
        return

    admin = models.User(
        email=email,
        full_name=full_name,
        role="admin",
    )
    await admin.insert()
    print(f"Admin created: {email}")


if __name__ == "__main__":
    asyncio.run(main())
````

## File: backend\seed_universities.py

````text
"""Idempotent demo seed for the University Catalog.

Creates a small set of realistic universities (and the countries they belong to)
only if they do not already exist. Safe to run multiple times: existing
countries and universities are detected by name and skipped — nothing is
deleted or overwritten.

Usage (inside the backend container, from /app):
    python seed_universities.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from database import MONGODB_URL, DATABASE_NAME
import models

# (university_name, country, city, qs_ranking, website, yearly_tuition_fee_usd, acceptance_rate, description)
UNIVERSITIES = [
    ("Massachusetts Institute of Technology", "USA", "Cambridge", 1, "https://www.mit.edu", 58000, 4.0,
     "World-leading institute renowned for engineering, computer science and research."),
    ("Stanford University", "USA", "Stanford", 3, "https://www.stanford.edu", 56000, 4.0,
     "Private research university at the heart of Silicon Valley, strong in CS and AI."),
    ("University of Toronto", "Canada", "Toronto", 21, "https://www.utoronto.ca", 45000, 43.0,
     "Canada's top-ranked university with strong research output across disciplines."),
    ("University of British Columbia", "Canada", "Vancouver", 34, "https://www.ubc.ca", 42000, 52.0,
     "Major public research university known for its global outlook and campus."),
    ("University of Oxford", "UK", "Oxford", 3, "https://www.ox.ac.uk", 40000, 17.0,
     "One of the oldest and most prestigious universities in the world."),
    ("Imperial College London", "UK", "London", 6, "https://www.imperial.ac.uk", 38000, 14.0,
     "Science, engineering, medicine and business focused university in London."),
    ("Technical University of Munich", "Germany", "Munich", 28, "https://www.tum.de", 0, 8.0,
     "Leading European technical university with low/no tuition for most programs."),
    ("ETH Zurich", "Switzerland", "Zurich", 7, "https://www.ethz.ch", 1500, 27.0,
     "Top-ranked science and technology university in continental Europe."),
    ("University of Melbourne", "Australia", "Melbourne", 13, "https://www.unimelb.edu.au", 35000, 70.0,
     "Australia's leading research university with a broad range of programs."),
    ("National University of Singapore", "Singapore", "Singapore", 8, "https://www.nus.edu.sg", 30000, 5.0,
     "Asia's top university, globally recognised for research and innovation."),
    ("Delft University of Technology", "Netherlands", "Delft", 47, "https://www.tudelft.nl", 20000, 65.0,
     "The largest and oldest Dutch public technical university."),
]


async def seed_universities():
    client = AsyncIOMotorClient(MONGODB_URL, uuidRepresentation="standard")
    await init_beanie(database=client[DATABASE_NAME], document_models=models.ALL_MODELS)

    created_countries = 0
    created_unis = 0
    skipped_unis = 0

    # Ensure each referenced country exists (idempotent by unique name).
    country_names = sorted({row[1] for row in UNIVERSITIES})
    country_cache = {}
    for name in country_names:
        country = await models.Country.find_one(models.Country.name == name)
        if not country:
            country = models.Country(name=name)
            await country.insert()
            created_countries += 1
            print(f"Added Country: {name}")
        country_cache[name] = country

    # Insert universities only if a university with the same name is absent.
    for (uni_name, country_name, city, rank, website, fee, rate, desc) in UNIVERSITIES:
        existing = await models.University.find_one(models.University.university_name == uni_name)
        if existing:
            skipped_unis += 1
            print(f"Skipped (exists): {uni_name}")
            continue
        await models.University(
            university_name=uni_name,
            country=country_cache[country_name],
            city=city,
            qs_ranking=rank,
            website=website,
            yearly_tuition_fee=fee,
            acceptance_rate=rate,
            description=desc,
        ).insert()
        created_unis += 1
        print(f"Added University: {uni_name}")

    total = await models.University.find_all().count()
    print(
        f"\nDone. Countries created: {created_countries}, "
        f"universities created: {created_unis}, skipped: {skipped_unis}. "
        f"Total universities in DB: {total}."
    )


if __name__ == "__main__":
    asyncio.run(seed_universities())
````

## File: backend\requirements.txt

````text
fastapi==0.110.0
uvicorn==0.28.0
motor==3.7.1
beanie==2.1.0
pydantic==2.6.4
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
openai==1.13.3
langchain==0.1.13
langchain-openai==0.1.1
pydantic-settings==2.2.1
python-multipart==0.0.9
email-validator==2.1.1
httpx==0.27.0
````

## File: frontend\package.json

````text
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.4.0",
    "@tanstack/react-query": "^5.101.0",
    "autoprefixer": "^10.5.0",
    "axios": "^1.18.0",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.40.0",
    "jspdf": "^4.2.1",
    "lucide-react": "^1.18.0",
    "luxon": "^3.7.2",
    "postcss": "^8.5.15",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-hook-form": "^7.79.0",
    "react-hot-toast": "^2.6.0",
    "react-is": "^19.2.0",
    "react-router-dom": "^7.17.0",
    "recharts": "^3.8.1",
    "shadcn-ui": "^0.9.5",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^3.4.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}
````

## File: frontend\src\routes\AppRoutes.jsx

````text
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/Unauthorized';

// Student Pages
import Dashboard from '../pages/student/Dashboard';
import Profile from '../pages/student/Profile';
import Universities from '../pages/student/UniversityDetails';
import Preferences from '../pages/student/Preferences';
import AdmissionPrediction from '../pages/student/AdmissionPrediction';
import Applications from '../pages/student/Applications';
import ResumeAnalyzer from '../pages/student/ResumeAnalyzer';
import SOPAnalyzer from '../pages/student/SOPAnalyzer';
import Scholarships from '../pages/student/Scholarships';
import AIChatAssistant from '../pages/student/AIChatAssistant';
import FindUniversities from '../pages/student/FindUniversities';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Standalone: shown when a role-guard rejects access */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/find-universities" element={<FindUniversities />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/universities" element={<Universities />} />
          {/* Mock Recommendations page retired — redirect to the real AI flow */}
          <Route path="/recommendations" element={<Navigate to="/find-universities" replace />} />
          <Route path="/predict" element={<AdmissionPrediction />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/sop-analyzer" element={<SOPAnalyzer />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/ai-chat" element={<AIChatAssistant />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
````

## File: frontend\src\context\AuthContext.jsx

````text
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

    try {
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      toast.error(message);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Account created successfully.');
      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Try a different email.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
````

## File: frontend\src\services\apiClient.js

````text
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
````

## File: frontend\src\services\profileService.js

````text
import apiClient from './apiClient';

export const profileService = {
  /**
   * Get the current student's academic profile.
   */
  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },

  /**
   * Update the current student's academic profile.
   * @param {Object} data - Profile fields (empty fields should be omitted by caller)
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/student/profile', data);
    return response.data;
  },
};

export default profileService;
````

## File: frontend\src\services\recommendationService.js

````text
import apiClient from './apiClient';

export const recommendationService = {
  /**
   * Get AI-powered university recommendations
   * @param {Object} data - Full student profile data
   */
  getRecommendations: async (data) => {
    const response = await apiClient.post('/ai/recommend', data);
    return response.data;
  },

  /**
   * Get recommendation history for the current user
   */
  getHistory: async () => {
    const response = await apiClient.get('/recommendations/history');
    return response.data;
  },

  /**
   * Get a specific recommendation session by ID
   * @param {string} sessionId 
   */
  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/recommendations/history/${sessionId}`);
    return response.data;
  },

  /**
   * Save a university to bookmarks
   */
  saveUniversity: async (data) => {
    const response = await apiClient.post('/universities/save', data);
    return response.data;
  },

  /**
   * Get all saved universities
   */
  getSavedUniversities: async () => {
    const response = await apiClient.get('/universities/saved');
    return response.data;
  },

  /**
   * Remove a saved university
   */
  unsaveUniversity: async (id) => {
    const response = await apiClient.delete(`/universities/saved/${id}`);
    return response.data;
  }
};

export default recommendationService;
````

## File: frontend\src\services\universityService.js

````text
import apiClient from './apiClient';

export const universityService = {
  /**
   * Fetch the full university catalog.
   */
  getUniversities: async () => {
    const response = await apiClient.get('/universities');
    return response.data;
  },

  /**
   * Fetch a single university by its id.
   * @param {string} id
   */
  getUniversityById: async (id) => {
    const response = await apiClient.get(`/universities/${id}`);
    return response.data;
  },
};

export default universityService;
````

## File: frontend\src\services\adminService.js

````text
import apiClient from './apiClient';

export const adminService = {
  /**
   * Real platform counts for the admin dashboard.
   */
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  /**
   */
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  /**
   * Real analytics for the admin dashboard charts.
   */
  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  /**
   * @param {string} id
   * @param {{full_name?: string, role?: string, is_active?: boolean}} payload
   */
  updateUser: async (id, payload) => {
    const response = await apiClient.patch(`/admin/users/${id}`, payload);
    return response.data;
  },
};

export default adminService;
````

## File: frontend\src\pages\student\Dashboard.jsx

````text
import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Bookmark,
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
    <div className={cn('p-3 rounded-xl', colorClass)}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Student';
  const { history, saved, isLoadingHistory } = useRecommendations();

  // Last 3 searches for the activity panel
  const recentSearches = history.slice(0, 3);

  // Real, derived metrics (no fabricated numbers)
  const savedCount = saved.length;
  const searchCount = history.length;
  const totalMatched = history.reduce((sum, s) => sum + (s.total_count || 0), 0);
  const lastMatchCount = history[0]?.total_count || 0;
  const chartData = history
    .slice(0, 6)
    .reverse()
    .map((s) => ({
      name: s.intended_major ? s.intended_major.slice(0, 12) : 'Search',
      count: s.total_count || 0,
    }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-500 mt-1">Here's your admissions journey overview.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/find-universities" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all text-sm font-black italic">
            <Sparkles className="h-4 w-4" /> Find Universities Now
          </Link>
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Update Profile</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Saved Universities" value={savedCount} subtext="In your bookmarks" icon={Bookmark} colorClass="bg-amber-500" />
        <StatCard title="AI Searches" value={searchCount} subtext="Recommendation runs" icon={Sparkles} colorClass="bg-indigo-500" />
        <StatCard title="Universities Matched" value={totalMatched} subtext="Across all searches" icon={TrendingUp} colorClass="bg-blue-500" />
        <StatCard title="Latest Search" value={lastMatchCount} subtext="Matches in your last search" icon={FileCheck} colorClass="bg-emerald-500" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Universities Found per Search</h3>
          <div className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '0.75rem' }}
                    formatter={(val) => [`${val} universities`, 'Found']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <p className="text-sm">No searches yet.</p>
                <p className="text-xs mt-1">Run a search to see your match history here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" /> Recent Searches
          </h3>
          <div className="space-y-6">
            {isLoadingHistory ? (
              [1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />)
            ) : recentSearches.length > 0 ? (
              recentSearches.map((session, i) => (
                <div key={session.session_id} className="relative pl-8">
                  {i < recentSearches.length - 1 && (
                    <div className="absolute left-[9px] top-4 bottom-[-20px] w-[2px] bg-gray-100 dark:bg-gray-700" />
                  )}
                  <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full bg-indigo-500 border-4 border-white dark:border-gray-800" />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                    {session.intended_major || 'Any Major'} · {session.degree_applying_for || 'Any Degree'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(session.created_at).toLocaleDateString()} • {session.total_count} universities found
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No searches yet. Start your first recommendation!</p>
            )}
          </div>
          <Link 
            to="/find-universities"
            className="block w-full mt-8 py-3 text-sm font-semibold text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 border-dashed"
          >
            View All History
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="text-emerald-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Safe Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Admission probability &gt; 80%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-emerald-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-amber-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Moderate Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability between 50–80%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-amber-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Reach Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability &lt; 50%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-red-500 hover:underline">Find matches →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
````

## File: frontend\src\pages\student\Profile.jsx

````text
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import {
  GraduationCap, Globe, DollarSign, Award, Save, ChevronRight, Loader2,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import profileService from '../../services/profileService';

const profileSchema = z.object({
  cgpa: z.string().optional(),
  ielts_score: z.string().optional(),
  gre_score: z.string().optional(),
  budget_max: z.string().optional(),
  preferred_study_level: z.string().optional(),
  degree: z.string().optional(),
  graduation_year: z.string().optional(),
  work_experience_months: z.string().optional(),
});

// Fields the form binds to (must match backend StudentProfile schema names).
const FORM_FIELDS = [
  'cgpa', 'ielts_score', 'gre_score', 'budget_max',
  'preferred_study_level', 'degree', 'graduation_year', 'work_experience_months',
];
// Fields the backend stores as float/int — sent as numbers, omitted when empty.
const NUMERIC_FIELDS = [
  'cgpa', 'ielts_score', 'gre_score', 'budget_max',
  'graduation_year', 'work_experience_months',
];

// Backend profile object → string-based form values (inputs need strings).
const toFormValues = (data) => {
  const out = {};
  FORM_FIELDS.forEach((f) => {
    const v = data?.[f];
    out[f] = v === null || v === undefined ? '' : String(v);
  });
  if (!out.preferred_study_level) out.preferred_study_level = 'Masters';
  return out;
};

// Form values → clean PUT payload: drop empties, coerce numeric fields to numbers.
const buildPayload = (data) => {
  const payload = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    if (NUMERIC_FIELDS.includes(key)) {
      const num = Number(value);
      if (!Number.isNaN(num)) payload[key] = num;
    } else {
      payload[key] = value;
    }
  });
  return payload;
};

const Profile = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { cgpa: '', preferred_study_level: 'Masters' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await profileService.getProfile();
        if (active) reset(toFormValues(data));
      } catch (err) {
        // 404 = no profile yet: leave the empty form as-is. Anything else is an error.
        if (active && err.response?.status !== 404) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(buildPayload(data));
      reset(toFormValues(updated));
      toast.success('Profile saved');
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Keep your scores updated for accurate admission predictions.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar nav */}
        <aside className="space-y-1">
          {[
            { label: 'Education Info', icon: GraduationCap, active: true },
            { label: 'Work Experience', icon: Globe, active: false },
            { label: 'Achievements', icon: Award, active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                item.active
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {item.active && <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </aside>

        {/* Form */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
              General Background
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Cumulative GPA</label>
                <Input type="number" step="0.01" placeholder="3.85" error={errors.cgpa?.message} {...register('cgpa')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Study Level</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  {...register('preferred_study_level')}
                >
                  <option>Bachelors</option>
                  <option>Masters</option>
                  <option>PhD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Degree</label>
                <Input type="text" placeholder="B.Sc. Computer Science" {...register('degree')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Graduation Year</label>
                <Input type="number" placeholder="2024" {...register('graduation_year')} />
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 pt-4">
              Standardized Tests
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">IELTS Score</label>
                <Input placeholder="7.5" {...register('ielts_score')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">GRE Score</label>
                <Input placeholder="320" {...register('gre_score')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Max Budget ($/yr)</label>
                <Input type="number" icon={DollarSign} placeholder="50000" {...register('budget_max')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Work Experience (months)</label>
              <Input type="number" placeholder="12" {...register('work_experience_months')} />
            </div>
          </div>

          {/* AI Tip */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 flex gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl h-fit">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h5 className="font-bold text-blue-700 dark:text-blue-300">AI Optimization Tip</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                Add at least 2 extracurricular activities and work experience details to significantly improve your "Reach Schools" probability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
````

## File: frontend\src\pages\student\Preferences.jsx

````text
import React, { useState, useEffect } from 'react';
import {
  Globe, BookOpen, GraduationCap, Wallet, X, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import profileService from '../../services/profileService';

const countries = ['USA', 'Canada', 'Germany', 'Australia', 'UK', 'Netherlands', 'Ireland', 'Sweden'];
const studyLevels = ['Bachelors', 'Masters', 'PhD'];
const fields = ['Computer Science', 'Data Science', 'Artificial Intelligence', 'Business Analytics', 'Electrical Engineering', 'Biotechnology'];

const Preferences = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('Masters');
  const [selectedFields, setSelectedFields] = useState([]);
  const [budget, setBudget] = useState(45000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await profileService.getProfile();
        if (!active) return;
        setSelectedCountries(Array.isArray(data.preferred_countries) ? data.preferred_countries : []);
        setSelectedFields(Array.isArray(data.preferred_fields) ? data.preferred_fields : []);
        if (data.preferred_study_level) setSelectedLevel(data.preferred_study_level);
        if (data.budget_max != null) setBudget(data.budget_max);
      } catch (err) {
        // 404 = no profile yet: keep defaults. Other errors: notify.
        if (active && err.response?.status !== 404) toast.error('Failed to load preferences');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const toggleCountry = (c) => {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c].slice(0, 5),
    );
  };

  const toggleField = (f) => {
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({
        preferred_study_level: selectedLevel,
        budget_max: Number(budget),
        preferred_countries: selectedCountries,
        preferred_fields: selectedFields,
      });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Study Preferences</h2>
        <p className="text-gray-500 mt-1">Customize your preferences to refine AI recommendations.</p>
      </div>

      {/* Countries */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Target Countries</h4>
            <p className="text-sm text-gray-400">Select up to 5 countries.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => toggleCountry(c)}
              className={cn(
                'px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left',
                selectedCountries.includes(c)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedCountries.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium">
                {c}
                <button onClick={() => toggleCountry(c)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Study Level + Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <GraduationCap className="h-5 w-5 text-purple-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Study Level</h4>
          </div>
          <div className="space-y-3">
            {studyLevels.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLevel(l)}
                className={cn(
                  'flex w-full items-center gap-3 p-4 rounded-2xl border transition-all',
                  selectedLevel === l
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                )}
              >
                <div className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedLevel === l ? 'border-purple-500' : 'border-gray-300',
                )}>
                  {selectedLevel === l && <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />}
                </div>
                <span className="font-medium text-sm">{l}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <BookOpen className="h-5 w-5 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Fields of Interest</h4>
          </div>
          <div className="space-y-2">
            {fields.map((f) => (
              <button
                key={f}
                onClick={() => toggleField(f)}
                className={cn(
                  'flex w-full justify-between items-center px-4 py-3 rounded-xl border text-sm transition-all',
                  selectedFields.includes(f)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300',
                )}
              >
                {f}
                {selectedFields.includes(f) && <X className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <Wallet className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Annual Tuition Budget</h4>
            <p className="text-sm text-gray-400">Estimate your yearly capacity.</p>
          </div>
        </div>
        <div className="px-2">
          <input
            type="range" min="0" max="100000" step="1000"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-4 text-sm font-medium text-gray-500">
            <span>$0</span>
            <span className="text-blue-600 text-lg font-bold">${budget.toLocaleString()}</span>
            <span>$100,000+</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="px-12 rounded-2xl gap-2" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default Preferences;
````

## File: frontend\src\pages\student\FindUniversities.jsx

````text
import React, { useState } from 'react';
import { 
  Sparkles, History, Bookmark, Search,
  Download, FileText, BarChart3, ArrowRight,
  TrendingUp, SlidersHorizontal, Trash2, Clock, RotateCcw, X
} from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import UniversityFinderModal from '../../components/modals/UniversityFinderModal';
import UniversityResultCard from '../../components/cards/UniversityResultCard';
import CompareModal from '../../components/modals/CompareModal';
import Button from '../../components/common/Button';
import profileService from '../../services/profileService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { cn } from '../../utils/cn';

// Maps saved StudentProfile/Preferences fields → wizard form field names.
// Only returns keys that have a usable value, so it merges over defaults
// without clobbering anything with null/empty.
const STUDY_LEVEL_TO_DEGREE = { Bachelors: 'BS', Masters: 'MS', PhD: 'PhD' };
const profileToWizard = (p) => {
  const out = {};
  if (p?.cgpa != null) out.cgpa = String(p.cgpa);
  if (p?.graduation_year != null) out.graduation_year = String(p.graduation_year);
  if (p?.ielts_score != null) out.ielts = String(p.ielts_score);
  if (p?.toefl_score != null) out.toefl = String(p.toefl_score);
  if (p?.gre_score != null) out.gre = String(p.gre_score);
  if (p?.gmat_score != null) out.gmat = String(p.gmat_score);
  if (p?.preferred_study_level && STUDY_LEVEL_TO_DEGREE[p.preferred_study_level]) {
    out.degree_applying_for = STUDY_LEVEL_TO_DEGREE[p.preferred_study_level];
  }
  if (Array.isArray(p?.preferred_countries) && p.preferred_countries.length) {
    out.countries = p.preferred_countries;
  }
  if (Array.isArray(p?.preferred_fields) && p.preferred_fields.length) {
    out.intended_major = p.preferred_fields[0];
  }
  return out;
};

const FindUniversities = () => {
  const { 
    history, 
    saved, 
    getRecommendations, 
    isGenerating, 
    saveUniversity,
    unsaveUniversity, 
    isSaving,
    isLoadingHistory,
    isLoadingSaved,
    getSessionDetails,
  } = useRecommendations();

  const { localHistory, saveToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeResults, setActiveResults] = useState(null);
  const [comparingItems, setComparingItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('new'); // 'new', 'history', 'saved'
  const [prefillData, setPrefillData] = useState(null);  // form data from history/profile
  const [prefillSource, setPrefillSource] = useState(null); // 'profile' | 'history' | null
  const [loadingHistoryItem, setLoadingHistoryItem] = useState(null); // session_id being loaded
  const [historyTab, setHistoryTab] = useState('local'); // 'local' | 'remote'

  // Open a fresh wizard, pre-filling from the saved profile/preferences when available.
  // Profile fetch is best-effort: failure or empty data just opens the default form.
  const openFreshWizard = async () => {
    setPrefillData(null);
    setPrefillSource(null);
    setIsModalOpen(true);
    try {
      const profile = await profileService.getProfile();
      const mapped = profileToWizard(profile || {});
      if (Object.keys(mapped).length > 0) {
        setPrefillData(mapped);
        setPrefillSource('profile');
      }
    } catch {
      // Ignore — the wizard works fine with default/empty values.
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const results = await getRecommendations(data);
      if (results) {
        // ✅ Persist the inputs to localStorage history
        saveToHistory(data);
        setActiveResults(results);
        setViewMode('new');
        setIsModalOpen(false);
        setPrefillData(null);
        setPrefillSource(null);
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  };

  // Open the modal pre-filled with a local history item
  const handleLocalHistoryClick = (entry) => {
    const profile = { ...entry.data };
    if (!Array.isArray(profile.continents)) profile.continents = [];
    if (!Array.isArray(profile.countries)) profile.countries = [];
    setPrefillData(profile);
    setPrefillSource('history');
    setIsModalOpen(true);
  };

  // Click a remote (API) history item → fetch full session → pre-fill the modal form
  const handleHistoryClick = async (session) => {
    setLoadingHistoryItem(session.session_id);
    try {
      const details = await getSessionDetails(session.session_id);
      const profile = details.student_profile || {};
      if (!Array.isArray(profile.continents)) profile.continents = [];
      if (!Array.isArray(profile.countries)) profile.countries = [];
      setPrefillData(profile);
      setPrefillSource('history');
      setActiveResults(details);
      setViewMode('new');
      setIsModalOpen(true);
    } catch (e) {
      import('react-hot-toast').then(({ toast }) => toast.error('Failed to load search history'));
    } finally {
      setLoadingHistoryItem(null);
    }
  };

  const toggleCompare = (uni) => {
    const isAlreadyComparing = comparingItems.some(item => item.university_name === uni.university_name);
    if (isAlreadyComparing) {
      setComparingItems(prev => prev.filter(item => item.university_name !== uni.university_name));
    } else {
      if (comparingItems.length >= 3) {
        import('react-hot-toast').then(({ toast }) => toast.error('You can only compare up to 3 universities at a time.'));
        return;
      }
      setComparingItems(prev => [...prev, uni]);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = activeResults?.recommended_universities || saved;
    
    doc.setFontSize(20);
    doc.text('University Recommendations Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let y = 45;
    dataToExport?.forEach((uni, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${uni.university_name} (${uni.country})`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Degree: ${uni.degree} - Major: ${uni.major}`, 20, y + 7);
      doc.text(`Admission Chance: ${uni.admission_chance}%`, 20, y + 14);
      doc.text(`Description: ${uni.description?.slice(0, 80)}...`, 20, y + 21);
      y += 35;
    });
    
    doc.save('university_recommendations.pdf');
  };

  const exportToCSV = () => {
    const dataToExport = activeResults?.recommended_universities || saved;
    const headers = ['University', 'Country', 'Degree', 'Major', 'Admission Chance', 'Rank', 'Website'];
    const rows = dataToExport?.map(u => [
      u.university_name, u.country, u.degree, u.major, u.admission_chance, u.world_rank, u.university_website
    ]) || [];
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "universities.csv");
  };

  const displayUniversities = () => {
    if (viewMode === 'new' && activeResults) return activeResults.recommended_universities || [];
    if (viewMode === 'saved') return saved || [];
    return [];
  };

  // Format a timestamp as a relative string
  const formatRelativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative space-y-8 pb-32">
      {/* AI Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="relative">
              <div className="h-32 w-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
           </div>
           <h2 className="text-3xl font-black mt-8 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">AI is Analyzing Your Profile</h2>
           <p className="text-gray-500 mt-2 text-lg text-center max-w-md px-6">Scanning thousands of global universities to find your perfect matches. This usually takes 10-15 seconds.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Find Your Dream University</h1>
          <p className="text-gray-500 mt-2 text-lg">Personalized AI recommendations matched to your academic excellence.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('saved')}
            className={cn("gap-2 rounded-2xl px-6", viewMode === 'saved' && "bg-primary/10 border-primary text-primary")}
          >
            <Bookmark className="h-4 w-4" /> Saved {saved.length > 0 && `(${saved.length})`}
          </Button>
          <Button
            onClick={openFreshWizard}
            className="gap-2 px-8 rounded-2xl shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-indigo-600"
          >
            <Sparkles className="h-5 w-5" /> Find Universities
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Search History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700">
            {/* History Tab Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <History className="h-4 w-4" /> Search History
              </h3>
              {localHistory.length > 0 && historyTab === 'local' && (
                <button
                  onClick={clearHistory}
                  title="Clear all local history"
                  className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4 gap-1">
              <button
                onClick={() => setHistoryTab('local')}
                className={cn(
                  "flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all",
                  historyTab === 'local'
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Clock className="h-3 w-3 inline mr-1" />Recent
              </button>
              <button
                onClick={() => setHistoryTab('remote')}
                className={cn(
                  "flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all",
                  historyTab === 'remote'
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <History className="h-3 w-3 inline mr-1" />All
              </button>
            </div>

            {/* LOCAL History Tab */}
            {historyTab === 'local' && (
              <>
                {localHistory.length > 0 ? (
                  <div className="space-y-2">
                    {localHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative flex items-start gap-2 p-3 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
                        onClick={() => handleLocalHistoryClick(entry)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {entry.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.data?.cgpa && (
                              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">
                                CGPA {entry.data.cgpa}
                              </span>
                            )}
                            {entry.data?.country && (
                              <span className="text-[9px] text-gray-400 font-medium">
                                {entry.data.country}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatRelativeTime(entry.timestamp)}
                          </p>
                          <p className="text-[10px] text-indigo-500 font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <RotateCcw className="h-2.5 w-2.5" /> Re-fill form ↗
                          </p>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromHistory(entry.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-300 hover:text-red-400"
                          title="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-500 italic">No searches yet.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Your searches will appear here for quick re-use.</p>
                  </div>
                )}
              </>
            )}

            {/* REMOTE (API) History Tab */}
            {historyTab === 'remote' && (
              <>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />)}
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map(session => (
                      <button 
                        key={session.session_id} 
                        onClick={() => handleHistoryClick(session)}
                        disabled={loadingHistoryItem === session.session_id}
                        className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 border border-transparent transition-all group relative"
                      >
                        {loadingHistoryItem === session.session_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-xl">
                            <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {session.intended_major || 'Any Major'} · {session.degree_applying_for || 'Any Degree'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(session.created_at).toLocaleDateString()} • {session.total_count} results
                        </p>
                        <p className="text-[10px] text-indigo-400 font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to restore & rerun ↗
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No previous searches yet.</p>
                )}
              </>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <TrendingUp className="h-8 w-8 mb-4" />
            <h4 className="text-xl font-black leading-tight mb-2">Enhance admission chances by matching accurately</h4>
            <p className="text-xs text-indigo-100 mb-6">Our AI considers GPA, language test scores, and research papers for real-world accuracy.</p>
            <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors">Learn How it Works</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          
          {(activeResults || saved.length > 0 || viewMode === 'saved') ? (
            <>
              {/* Controls */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                    viewMode === 'new' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  )} onClick={() => setViewMode('new')}>
                    Recent Results
                  </span>
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                    viewMode === 'saved' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  )} onClick={() => setViewMode('saved')}>
                    Saved Bookmarks
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {comparingItems.length > 0 && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-full px-6 gap-2 bg-emerald-500"
                      onClick={() => setIsCompareModalOpen(true)}
                    >
                      Compare ({comparingItems.length})
                    </Button>
                  )}
                  <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border">
                    <button onClick={exportToPDF} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all hover:shadow-sm">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={exportToCSV} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all hover:shadow-sm">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Credibility disclaimer */}
              <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1">
                AI-assisted recommendations are for guidance only. Always verify admission requirements,
                deadlines, fees, and scholarships on the official university website.
              </p>

              {/* Grid of Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayUniversities().length > 0 ? (
                  displayUniversities().map((uni, idx) => (
                    <UniversityResultCard 
                      key={idx} 
                      university={uni} 
                      onSave={() => saveUniversity(uni)}
                      onUnsave={() => unsaveUniversity(uni.id)}
                      isSaved={saved.some(s => s.university_name === uni.university_name)}
                      isSaving={isSaving}
                      showCompare={true}
                      onCompareToggle={() => toggleCompare(uni)}
                      isComparing={comparingItems.some(s => s.university_name === uni.university_name)}
                    />
                  ))
                ) : (
                  <div className="md:col-span-2 py-20 text-center">
                    <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No universities found here</h3>
                    <p className="text-gray-500 mb-8">Try searching for new recommendations or save your favorites.</p>
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
               <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
               </div>
               <h2 className="text-3xl font-black mb-4">You haven't run a search yet</h2>
               <p className="text-gray-500 mb-10 max-w-md mx-auto">Complete our 6-step wizard to see AI-powered university matches tailored exactly to your profile.</p>
               <Button
                onClick={openFreshWizard}
                className="rounded-2xl px-12 h-14 text-lg bg-gradient-to-br from-primary to-indigo-600 shadow-2xl shadow-primary/30"
               >
                Start Free Evaluation
               </Button>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <UniversityFinderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setPrefillData(null); setPrefillSource(null); }}
        onSubmit={handleFormSubmit}
        isLoading={isGenerating}
        initialData={prefillData}
        prefillSource={prefillSource}
      />

      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        universities={comparingItems}
      />
    </div>
  );
};

export default FindUniversities;
````

## File: frontend\src\pages\student\UniversityDetails.jsx

````text
import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Search, SlidersHorizontal, DollarSign, TrendingDown, Loader2, AlertCircle, School } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import universityService from '../../services/universityService';

/* ── Display helpers (safe fallbacks for missing backend fields) ── */
const initialsOf = (name) =>
  name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '??';

const fmtTuition = (fee) => {
  if (fee === 0) return 'Free';
  if (fee == null) return 'Not available';
  return `$${fee.toLocaleString()}`;
};

const fmtRate = (r) => (r == null ? 'N/A' : `${r}%`);

const UniversityDetails = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await universityService.getUniversities();
        if (active) setUniversities(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? universities.filter((u) =>
        [u.university_name, u.country, u.city]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q)))
    : universities;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Universities</h2>
        <p className="text-gray-500 mt-1">Browse and filter from global institutions.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, country or city..."
            icon={Search}
            className="bg-gray-50 dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <MapPin className="h-4 w-4" /> Country
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <DollarSign className="h-4 w-4" /> Tuition
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <TrendingDown className="h-4 w-4" /> Acceptance
          </Button>
          <Button variant="secondary" size="sm" className="gap-2 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-20 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Couldn't load universities</h3>
          <p className="text-gray-500 mt-1">Please check the backend is running and try again.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center">
          <School className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {universities.length === 0 ? 'No universities available yet' : 'No matches found'}
          </h3>
          <p className="text-gray-500 mt-1">
            {universities.length === 0
              ? 'The catalog is empty. Seed demo universities to populate it.'
              : 'Try a different search term.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((uni) => (
            <div
              key={uni.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-4xl font-black text-white/90 group-hover:scale-110 transition-transform">
                  {initialsOf(uni.university_name)}
                </span>
                <div className="absolute top-3 right-3">
                  <button className="h-9 w-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                {uni.qs_ranking != null && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-white/90 text-xs font-bold rounded-lg text-gray-900">
                      QS #{uni.qs_ranking}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{uni.university_name || 'Not available'}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="h-3 w-3" />{[uni.city, uni.country].filter(Boolean).join(', ') || 'Not available'}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-dashed border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Tuition/yr</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{fmtTuition(uni.yearly_tuition_fee)}</p>
                  </div>
                  <div className="text-center border-l border-gray-100 dark:border-gray-700 pl-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Acceptance</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{fmtRate(uni.acceptance_rate)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {uni.website ? (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center rounded-xl text-xs font-semibold h-9 px-3 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Visit Website
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" disabled>Website</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityDetails;
````

## File: frontend\src\pages\student\Scholarships.jsx

````text
import React from 'react';
import { Award, MapPin, Calendar, ArrowUpRight, Filter, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';

const scholarships = [
  {
    id: 1,
    name: 'Lester B. Pearson Scholarship',
    school: 'University of Toronto',
    amount: 'Full Ride + Living',
    deadline: 'Dec 15, 2026',
    country: 'Canada',
  },
  {
    id: 2,
    name: 'Knight-Hennessy Scholars',
    school: 'Stanford University',
    amount: 'Full Funding',
    deadline: 'Oct 08, 2026',
    country: 'USA',
  },
  {
    id: 3,
    name: 'DAAD Scholarship',
    school: 'Various German Universities',
    amount: 'Full Tuition',
    deadline: 'Jul 31, 2026',
    country: 'Germany',
  },
  {
    id: 4,
    name: 'Erasmus Mundus Joint Masters',
    school: 'Multi-institutional (EU)',
    amount: 'Full Ride',
    deadline: 'Mar 01, 2027',
    country: 'Europe',
  },
];

const Scholarships = () => {
  return (
    <div className="space-y-8 pb-12">
      <FutureScopeBanner message="Scholarship matching is a planned feature. The scholarships listed below are sample data for demonstration and are not yet sourced from a live database." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Global Scholarships</h2>
          <p className="text-gray-500 mt-1">Funding opportunities matched to your academic profile.</p>
        </div>
        <Button className="gap-2 rounded-xl">Check Eligibility</Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-gray-200"
            placeholder="Search by scholarship name or country..."
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 border-dashed text-gray-500">
          <Filter className="h-4 w-4" /> Filter by Deadline
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarships.map((sch) => (
          <div
            key={sch.id}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top right icon */}
            <div className="absolute top-6 right-6">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">{sch.country}</span>
                <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-1 max-w-[80%]">{sch.name}</h4>
                <p className="text-sm font-medium text-gray-400 mt-1">{sch.school}</p>
              </div>

              <div className="flex gap-6 py-5 border-y border-dashed border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Value</p>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{sch.amount}</p>
                </div>
                <div className="border-l border-gray-100 dark:border-gray-700 pl-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Deadline</p>
                  <p className="font-bold text-red-500 flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5" />{sch.deadline}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-500">
                      U
                    </div>
                  ))}
                  <span className="ml-3 pt-1 text-xs text-gray-400 font-medium">+4 applied</span>
                </div>
                <button className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white text-gray-500 transition-all">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scholarships;
````

## File: frontend\src\pages\student\Applications.jsx

````text
import React from 'react';
import {
  FileText, CheckCircle2, XCircle, Timer, MoreVertical, Plus, MapPin, Clock, ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const apps = [
  {
    id: 1,
    uni: 'University of British Columbia',
    program: 'Master of Data Science',
    location: 'Vancouver, Canada',
    status: 'Pending',
    date: 'June 12, 2026',
    icon: Timer,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: 2,
    uni: 'ETH Zurich',
    program: 'MSc Computer Science',
    location: 'Zurich, Switzerland',
    status: 'Accepted',
    date: 'May 28, 2026',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 3,
    uni: 'National University of Singapore',
    program: 'Master of Computing',
    location: 'Singapore',
    status: 'Rejected',
    date: 'April 15, 2026',
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
];

const statusConfig = {
  Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Applied: 'bg-blue-50 text-blue-600 border-blue-200',
};

const Applications = () => {
  return (
    <div className="space-y-8 pb-12">
      <FutureScopeBanner message="Application tracking is a planned feature. The applications and statistics shown are sample data for demonstration and are not yet stored or tracked by the live system." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Your Applications</h2>
          <p className="text-gray-500 mt-1">Track the status of all your university submissions.</p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      <div className="space-y-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', app.bg)}>
                <app.icon className={cn('h-7 w-7', app.color)} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{app.uni}</h4>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statusConfig[app.status])}>
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{app.program}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />{app.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />Submitted {app.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                View Details <ExternalLink className="h-3 w-3" />
              </Button>
              <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
        {[
          { label: 'Success Rate', value: '33%', sub: '1 out of 3 applications' },
          { label: 'Avg. Response Time', value: '14 Days', sub: 'Across all schools' },
          { label: 'Next Deadline', value: 'July 15', sub: '31 days remaining', highlight: true },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className={cn('text-3xl font-black', s.highlight ? 'text-blue-600' : 'text-gray-900 dark:text-white')}>
              {s.value}
            </p>
            <p className="text-sm text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
````

## File: frontend\src\pages\student\AdmissionPrediction.jsx

````text
import React, { useState } from 'react';
import {
  Zap, BarChart3, ArrowRight, Info, History,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip,
} from 'recharts';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const radarData = [
  { subject: 'GPA', A: 95 },
  { subject: 'GRE', A: 85 },
  { subject: 'Research', A: 40 },
  { subject: 'IELTS', A: 90 },
  { subject: 'Experience', A: 60 },
];

const AdmissionPrediction = () => {
  const [state, setState] = useState('idle'); // idle | calculating | result

  const handlePredict = () => {
    setState('calculating');
    setTimeout(() => setState('result'), 2200);
  };

  return (
    <div className="space-y-8 pb-12">
      <FutureScopeBanner message="Admission prediction is a planned feature. The probability score and analysis shown here are sample values for demonstration only — not generated by a live model yet." />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admission Predictor</h2>
          <p className="text-gray-500 mt-1">ML-driven probability analysis for your target programs.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <History className="h-4 w-4" /> View History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input panel */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" /> Analysis Inputs
          </h4>
          {[
            { label: 'CGPA', value: '3.85 / 4.0' },
            { label: 'GRE Score', value: '324' },
            { label: 'Work Exp.', value: '24 Months' },
            { label: 'Program Strength', value: 'High', highlight: true },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <span className="text-sm font-medium text-gray-500">{item.label}</span>
              <span className={cn('font-bold', item.highlight ? 'text-emerald-500' : 'text-gray-900 dark:text-white')}>
                {item.value}
              </span>
            </div>
          ))}

          <div className="pt-4">
            <Button className="w-full py-6 text-lg rounded-2xl gap-3" onClick={handlePredict} isLoading={state === 'calculating'}>
              Analyze Probability <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-widest font-bold">
              Powered by Predictive Analytics + GPT-4o
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {state === 'idle' && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center bg-gray-50/50 dark:bg-gray-900/20">
              <BarChart3 className="h-14 w-14 text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-400">Ready for Analysis</h3>
              <p className="text-gray-400 text-sm max-w-xs mt-2">
                Click "Analyze Probability" to run your profile against our university database.
              </p>
            </div>
          )}

          {state === 'result' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Score */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Result</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase">MODERATE</span>
                  </div>
                  <h3 className="text-5xl font-black text-amber-500">62.4%</h3>
                  <p className="text-sm text-gray-400 mt-1">Admission Probability</p>
                  <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                    "Your GRE and GPA are strong offsets for limited research experience. Your SOP will be decisive."
                  </p>
                </div>

                {/* Radar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Competency Map</p>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Radar name="Student" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bar breakdown */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Competitive Landscape</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData}>
                      <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="A" radius={[8, 8, 8, 8]} barSize={44}>
                        {radarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionPrediction;
````

## File: frontend\src\pages\student\ResumeAnalyzer.jsx

````text
import React, { useState } from 'react';
import { 
  FileUp, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Lightbulb,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Automatically "analyze" after 2 seconds
      setAnalyzing(true);
      setTimeout(() => {
        setResult({
          score: 82,
          skills: ['Python', 'Machine Learning', 'Leadership', 'Critical Thinking'],
          improvements: [
            'Quantify your impact in the software internship section.',
            'Move the "Awards" section higher to emphasize your scholarship.',
            'Include link to your GitHub repository.'
          ]
        });
        setAnalyzing(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 animate-in fade-in duration-500">
      <FutureScopeBanner message="The Resume Analyzer is a planned feature. The score, extracted skills and suggestions shown are sample data for demonstration — resumes are not yet processed by a live model." />
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">AI Resume Analyzer</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Optimizing your professional profile for university admissions. Get instant feedback on your alignment with target programs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="space-y-8">
          <div className="bg-card p-12 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center relative overflow-hidden">
            {analyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-lg">AI is Deep-Scanning...</p>
                   <p className="text-sm text-muted-foreground animate-pulse">Extracting skills & experience...</p>
                </div>
              </div>
            )}

            <div className="h-20 w-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileUp className="h-10 w-10 text-primary" />
            </div>
            
            <h4 className="text-xl font-bold">Upload Resume</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              PDF or DOCX format. Max size 5MB. Your data is processed securely via OpenAI.
            </p>

            <label className="mt-8">
               <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" />
               <Button variant="primary" className="rounded-full px-8 gap-2 pointer-events-none">
                 Choose File <ArrowRight className="h-4 w-4" />
               </Button>
            </label>
            
            {file && <p className="mt-4 text-xs font-bold text-primary italic">Current: {file.name}</p>}
          </div>

          <div className="bg-secondary/30 p-8 rounded-3xl border space-y-4">
            <h5 className="font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Pro Tips
            </h5>
            <ul className="space-y-3">
              {['Ensure keywords match your target field.', 'Use clear, sans-serif fonts.', 'Focus on achievements, not just tasks.'].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
           {!result && !analyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/20 border rounded-3xl border-dashed">
                 <Search className="h-12 w-12 text-muted/50 mb-4" />
                 <h4 className="font-bold text-muted-foreground">Awaiting Analysis</h4>
                 <p className="text-sm text-muted-foreground mt-1">Upload your resume to see the AI breakdown here.</p>
              </div>
           )}

           {result && (
              <div className="animate-in slide-in-from-top-4 duration-700 space-y-8">
                 {/* Score Card */}
                 <div className="bg-card p-10 rounded-4xl border shadow-xl flex items-center justify-between overflow-hidden relative">
                    <div className="space-y-1">
                       <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Profile Score</p>
                       <h3 className="text-6xl font-black text-primary">{result.score}<span className="text-xl">/100</span></h3>
                    </div>
                    <div className="relative h-24 w-24">
                       <svg className="h-full w-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - result.score / 100)} className="text-primary transition-all duration-1000" />
                       </svg>
                    </div>
                 </div>

                 {/* Skills Extraction */}
                 <div className="bg-card p-8 rounded-3xl border shadow-sm">
                    <h5 className="font-bold mb-6 flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-primary" />
                       Extracted Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                       {result.skills.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-bold border border-primary/10">
                             {skill}
                          </span>
                       ))}
                    </div>
                 </div>

                 {/* Improvement Areas */}
                 <div className="bg-card p-8 rounded-3xl border shadow-sm">
                    <h5 className="font-bold mb-6 flex items-center gap-2 text-destructive">
                       <AlertTriangle className="h-4 w-4" />
                       Actionable Improvements
                    </h5>
                    <div className="space-y-4">
                       {result.improvements.map((imp, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                             <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                             </div>
                             <p className="text-sm text-foreground leading-relaxed">{imp}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
````

## File: frontend\src\pages\student\SOPAnalyzer.jsx

````text
import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Search, Sparkles, ArrowRight, Clock,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const SOPAnalyzer = () => {
  const [sopText, setSopText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!sopText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        clarity: 88,
        structure: 72,
        persuasion: 65,
        suggestions: [
          'The opening paragraph is strong, but the transition to research goals is abrupt.',
          'Use more active verbs in the professional experience section.',
          'Expand the "Why this university?" section with specific faculty names.',
        ],
      });
      setAnalyzing(false);
    }, 2500);
  };

  const scores = result
    ? [
        { label: 'Clarity', val: result.clarity, color: 'bg-emerald-500' },
        { label: 'Structure', val: result.structure, color: 'bg-amber-500' },
        { label: 'Persuasion', val: result.persuasion, color: 'bg-blue-500' },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <FutureScopeBanner message="The SOP Analyzer is a planned feature. The clarity, structure and persuasion scores shown are sample values for demonstration — your text is not yet analysed by a live model." />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Statement of Purpose Analyzer
          </h2>
          <p className="text-gray-500 mt-1">Get AI feedback on your SOP's structure, clarity, and impact.</p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold">
          <Sparkles className="h-3 w-3" /> GPT-4o Intelligence
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[580px]">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <FileText className="h-3 w-3" /> SOP Editor
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{sopText.length} chars</span>
            </div>

            {analyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 rounded-3xl gap-4">
                <div className="h-16 w-16 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <p className="font-bold text-gray-700 dark:text-gray-200">AI is analyzing your SOP...</p>
              </div>
            )}

            <textarea
              className="flex-1 p-7 bg-transparent border-none focus:ring-0 outline-none text-base leading-relaxed resize-none text-gray-800 dark:text-gray-200 placeholder:text-gray-300"
              placeholder="Paste your Statement of Purpose here..."
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
            />
            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => { setSopText(''); setResult(null); }}>Clear</Button>
              <Button size="md" className="px-10 rounded-xl" onClick={handleAnalyze} isLoading={analyzing}>
                Analyze SOP
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !analyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20 text-center">
              <Search className="h-10 w-10 text-gray-200 dark:text-gray-600 mb-3" />
              <h4 className="font-bold text-gray-400">Awaiting Analysis</h4>
              <p className="text-sm text-gray-400 mt-1">Submit your SOP text to receive AI feedback.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Score bars */}
              <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
                <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400">Analytics</h5>
                {scores.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-500" /> Improvements
                </h5>
                {result.suggestions.map((sg, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{sg}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs gap-2 rounded-xl">
                  <Clock className="h-3 w-3" /> Request Full Review (24h)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOPAnalyzer;
````

## File: frontend\src\pages\admin\AdminDashboard.jsx

````text
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Activity, Loader2, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../../utils/cn';
import adminService from '../../services/adminService';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, a] = await Promise.all([adminService.getStats(), adminService.getAnalytics()]);
        if (active) { setStats(s); setAnalytics(a); }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const cards = stats
    ? [
        { name: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: 'Students', value: stats.total_students, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { name: 'Universities', value: stats.total_universities, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { name: 'AI Sessions', value: stats.total_recommendation_sessions, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      ]
    : [];

  const sessionsByDay = (analytics?.sessions_by_day || []).map((d) => ({
    label: (d.date || '').slice(5),  // MM-DD
    count: d.count,
  }));
  const hasSessions = sessionsByDay.some((d) => d.count > 0);

  const byCountry = analytics?.universities_by_country || [];
  const hasCountries = byCountry.length > 0;

  const EmptyChart = ({ text }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
      <p className="text-sm">Not enough data yet</p>
      <p className="text-xs mt-1">{text}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load admin data</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards — real counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat) => (
              <div
                key={stat.name}
                className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={cn('p-4 rounded-2xl', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
                </div>
                <div className="mt-6">
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1">{stat.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts — real analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Recommendation Activity</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">AI searches per day (last 7 days)</p>
              <div className="h-[320px]">
                {hasSessions ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                        formatter={(val) => [`${val} sessions`, 'Generated']}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart text="Recommendation searches will appear here once students run them." />
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Universities by Country</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Catalog distribution</p>
              {hasCountries ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCountry} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="country">
                          {byCountry.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val, name) => [`${val}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-3 max-h-[160px] overflow-y-auto">
                    {byCountry.map((item, index) => (
                      <div key={item.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm text-slate-400">{item.country}</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px]"><EmptyChart text="Seed or add universities to see the distribution." /></div>
              )}
            </div>
          </div>

          {/* Top saved universities */}
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Most Saved Universities</h3>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Across all students</p>
            {analytics?.top_saved_universities?.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_saved_universities.map((u, i) => (
                  <div key={u.university_name} className="flex items-center justify-between border-b border-slate-700/60 pb-2 last:border-0">
                    <span className="text-sm text-slate-300"><span className="text-slate-500 font-mono mr-3">{i + 1}.</span>{u.university_name}</span>
                    <span className="text-sm font-bold text-white font-mono">{u.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No saved universities yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
````

## File: frontend\src\pages\admin\ManageUsers.jsx

````text
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Shield, Edit, Trash2, CheckCircle, XCircle, Loader2, AlertCircle, Save, X, Power,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditName(u.full_name || '');
    setEditRole(u.role);
  };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };

  const saveEdit = async (u) => {
    setSavingId(u.id);
    try {
      await adminService.updateUser(u.id, { full_name: editName.trim(), role: editRole });
      toast.success('User updated');
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (u) => {
    const deactivating = u.is_active;
    if (deactivating && !window.confirm(`Deactivate ${u.full_name || u.email}? They will not be able to sign in.`)) return;
    setSavingId(u.id);
    try {
      await adminService.updateUser(u.id, { is_active: !u.is_active });
      toast.success(deactivating ? 'User deactivated' : 'User reactivated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => [u.full_name, u.email, u.role].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    : users;

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString(); } catch { return '—'; }
  };

  return (
    <div className="space-y-8">
      <FutureScopeBanner message="User data and edits below are live. You can rename, change role, and activate/deactivate users. Permanent deletion is intentionally disabled." />

      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load users</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-700">
                  {['User Details', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-7 py-10 text-center text-slate-500 text-sm">No users found.</td></tr>
                ) : filtered.map((user) => {
                  const isEditing = editingId === user.id;
                  const isSelf = currentUser && currentUser.id === user.id;
                  const busy = savingId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-sm">
                            {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Full name"
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            ) : (
                              <p className="font-bold text-white text-sm">{user.full_name || '—'}</p>
                            )}
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            disabled={isSelf}
                            title={isSelf ? "You can't change your own role" : undefined}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                          >
                            <option value="student">student</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                            user.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600',
                          )}>
                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-2">
                          {user.is_active
                            ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                            : <XCircle className="h-4 w-4 text-slate-600" />}
                          <span className={cn('text-xs font-bold', user.is_active ? 'text-emerald-500' : 'text-slate-600')}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-5 text-slate-400 text-sm">{fmtDate(user.created_at)}</td>
                      <td className="px-7 py-5">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(user)} disabled={busy} title="Save"
                                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </button>
                              <button onClick={cancelEdit} disabled={busy} title="Cancel"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(user)} title="Edit name / role"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                                <Edit className="h-4 w-4 text-slate-300" />
                              </button>
                              <button
                                onClick={() => toggleActive(user)}
                                disabled={busy || (isSelf && user.is_active)}
                                title={isSelf && user.is_active ? "You can't deactivate yourself" : (user.is_active ? 'Deactivate' : 'Reactivate')}
                                className={cn(
                                  'p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                                  user.is_active ? 'bg-slate-800 hover:bg-amber-500/20 text-amber-400' : 'bg-slate-800 hover:bg-emerald-500/20 text-emerald-400',
                                )}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                              </button>
                              <button title="Permanent deletion is disabled" disabled
                                className="p-2 rounded-xl bg-slate-800 opacity-40 cursor-not-allowed">
                                <Trash2 className="h-4 w-4 text-slate-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-5 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {users.length} user{users.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
````

## File: frontend\src\components\modals\UniversityFinderModal.jsx

````text
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, ChevronRight, ChevronLeft, User, GraduationCap, 
  MapPin, Globe, DollarSign, Languages, BrainCircuit,
  Search, CheckCircle2, AlertCircle, RotateCcw
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { cn } from '../../utils/cn';

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Target', icon: BrainCircuit },
  { id: 4, title: 'Scores', icon: Languages },
  { id: 5, title: 'Location', icon: MapPin },
  { id: 6, title: 'Prefs', icon: CheckCircle2 }
];

const UniversityFinderModal = ({ isOpen, onClose, onSubmit, isLoading, initialData, prefillSource }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const defaultVals = {
    continents: [],
    countries: [],
    degree_completed: false,
    need_scholarship: false,
    fully_funded_required: false,
    partial_scholarship_accepted: true,
    public_only: false,
    private_allowed: true,
    research_focused: false,
    industry_focused: false,
    top_ranked_only: false,
    ...initialData,
  };

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: defaultVals,
  });

  // Re-populate form whenever initialData changes (new history item clicked)
  React.useEffect(() => {
    if (initialData) {
      reset({ ...defaultVals, ...initialData });
      setCurrentStep(1);
    }
  }, [initialData]); // eslint-disable-line

  if (!isOpen) return null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const watchContinents = watch('continents') || [];
  const watchCountries = watch('countries') || [];

  const toggleItem = (field, value) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter(item => item !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  const continents = ['North America', 'Europe', 'Asia', 'Australia', 'Africa'];
  const countries = [
    'USA', 'Canada', 'UK', 'Germany', 'Australia', 'Italy', 'France', 
    'Netherlands', 'Sweden', 'Norway', 'Finland', 'China', 'Japan', 
    'South Korea', 'Singapore'
  ];

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Full Name</label>
                <Input {...register('full_name', { required: 'Name is required' })} placeholder="Enter your full name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email</label>
                <Input {...register('email', { required: 'Email is required' })} type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Native Country</label>
                <Input {...register('country')} placeholder="Your current country" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Nationality</label>
                <Input {...register('nationality')} placeholder="Your nationality" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current Degree Level</label>
                <select {...register('current_degree_level')} className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="Intermediate">Intermediate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="BS/Bachelor">BS/Bachelor</option>
                  <option value="MS/MPhil">MS/MPhil</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current University</label>
                <Input {...register('current_university')} placeholder="University Name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current CGPA</label>
                <Input {...register('cgpa')} type="number" step="0.01" placeholder="e.g. 3.8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Graduation Year</label>
                <Input {...register('graduation_year')} type="number" placeholder="e.g. 2025" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Total Credits</label>
                <Input {...register('total_credits')} type="number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Semester</label>
                <Input {...register('current_semester')} type="number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Year Gap</label>
                <Input {...register('year_gap')} type="number" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Publications</label>
                <Input {...register('num_publications')} type="number" placeholder="Number of publications" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Research Papers</label>
                <Input {...register('num_research_papers')} type="number" placeholder="Number of research papers" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-lg font-bold">Target Study Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['BS', 'MS', 'MPhil', 'PhD'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setValue('degree_applying_for', level)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all font-bold",
                        watch('degree_applying_for') === level 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Intended Major</label>
                <Input {...register('intended_major')} placeholder="e.g. Computer Science, Artificial Intelligence" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-xs">Research Experience</label>
                  <textarea 
                    {...register('research_experience')} 
                    className="w-full p-3 rounded-xl border border-input bg-background min-h-[80px] text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Briefly describe your research experience..."
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-xs">Work Experience</label>
                  <textarea 
                    {...register('work_experience')} 
                    className="w-full p-3 rounded-xl border border-input bg-background min-h-[80px] text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Briefly describe your work experience..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-gray-500 italic">Language scores are optional but helpful for accurate recommendations.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">IELTS</label>
                <Input {...register('ielts')} type="number" step="0.5" placeholder="0 - 9.0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">TOEFL</label>
                <Input {...register('toefl')} type="number" placeholder="0 - 120" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">GRE</label>
                <Input {...register('gre')} type="number" placeholder="e.g. 310" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">GMAT</label>
                <Input {...register('gmat')} type="number" placeholder="e.g. 680" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">SAT</label>
                <Input {...register('sat')} type="number" placeholder="e.g. 1400" />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-3">Target Continents</label>
                <div className="flex flex-wrap gap-2">
                  {continents.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => toggleItem('continents', c)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        watchContinents.includes(c) 
                          ? "bg-primary text-white border-primary" 
                          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-3">Preferred Countries</label>
                <div className="flex flex-wrap gap-2">
                  {countries.map(c => (
                    <button
                        key={c} type="button"
                        onClick={() => toggleItem('countries', c)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                          watchCountries.includes(c) 
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200" 
                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500"
                        )}
                      >
                        {c}
                      </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-dashed">
                <label className="block text-sm font-bold mb-3">Financial Info</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <input type="checkbox" {...register('need_scholarship')} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm font-medium">Need Scholarship?</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <input type="checkbox" {...register('fully_funded_required')} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm font-medium">Fully Funded Required?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
            <h3 className="font-bold text-lg">Final Preferences</h3>
            <div className="space-y-3">
              {[
                { id: 'public_only', label: 'Public Universities Only', icon: Building2 },
                { id: 'research_focused', label: 'Research Focused Institutions', icon: Beaker },
                { id: 'industry_focused', label: 'Industry & Career Focused', icon: Briefcase },
                { id: 'top_ranked_only', label: 'Top Tier Ranked Universities Only', icon: Star }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-800 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.icon && <item.icon className="h-5 w-5" />}
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <input type="checkbox" {...register(item.id)} className="w-5 h-5 rounded-md text-primary accent-primary" />
                </label>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">AI Recommendation</p>
                <p className="text-xs text-blue-800/70 dark:text-blue-300">Our AI will analyze your profile and preferences to find your dream universities. This may take 10-15 seconds.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row border border-gray-200/20">
        
        {/* Sidebar Navigation */}
        <div className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800/50 p-8 border-r border-gray-100 dark:border-gray-800 flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-black bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent italic">UniFinder AI</h2>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">Smart Match System</p>
          </div>
          
          <div className="space-y-4 flex-1">
            {STEPS.map(step => (
              <div key={step.id} className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all",
                currentStep === step.id 
                  ? "bg-white dark:bg-gray-700 shadow-md shadow-gray-200/50 dark:shadow-none translate-x-2" 
                  : "opacity-40"
              )}>
                <div className={cn(
                  "p-2 rounded-xl",
                  currentStep === step.id ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800"
                )}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className={cn("text-sm font-bold", currentStep === step.id ? "text-gray-900 dark:text-white" : "text-gray-500 line-through decoration-transparent")}>
                  {step.title}
                </span>
                {currentStep > step.id && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
              </div>
            ))}
          </div>
          
          <div className="mt-auto">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Progress</p>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-xl font-bold">{STEPS[currentStep-1].title} Details</h3>
              <p className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Pre-fill banner — source-aware (search history vs saved profile/preferences) */}
          {initialData && (
            <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                  {prefillSource === 'profile'
                    ? 'Some fields were pre-filled from your saved profile/preferences'
                    : 'Form pre-filled from your search history'}
                </p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">Review the details across all steps, then submit to get fresh recommendations.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {renderStep()}
          </form>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-800/20">
            <Button 
                type="button"
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="gap-2 rounded-2xl px-8"
              >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            
            {currentStep === STEPS.length ? (
              <Button 
                type="button"
                className="gap-2 rounded-2xl px-12 bg-gradient-to-br from-indigo-500 to-purple-600 border-none hover:shadow-indigo-500/30"
                onClick={handleSubmit(handleFormSubmit)}
                isLoading={isLoading}
              >
                Generate My Recommendations <Sparkles className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                className="gap-2 rounded-2xl px-12"
                onClick={nextStep}
                disabled={isLoading}
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional icons not imported or needed
const Building2 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const Beaker = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const Briefcase = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const Star = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>;

export default UniversityFinderModal;
````

## File: frontend\src\components\common\FutureScopeBanner.jsx

````text
import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Demo-safety banner for pages that are not yet backed by the live system.
 * Clarifies that any data/results shown are sample content, not real output.
 */
const FutureScopeBanner = ({ message }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
    <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
      {message ||
        'Preview feature — this module is planned as a future enhancement. The content shown here is sample data for demonstration and is not produced by the live system yet.'}
    </p>
  </div>
);

export default FutureScopeBanner;
````

## File: frontend\src\pages\Unauthorized.jsx

````text
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
    <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
      <ShieldAlert className="h-8 w-8 text-red-500" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access denied</h1>
    <p className="text-gray-500 mt-2 max-w-md">
      You don't have permission to view this page. If you think this is a mistake, contact your administrator.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold h-11 px-6 hover:bg-primary/90 transition-colors"
    >
      Back to Dashboard
    </Link>
  </div>
);

export default Unauthorized;
````

## File: scripts\test-smoke.ps1

````text
<#
  test-smoke.ps1 — quick smoke test for the AI University Recommendation System.

  Verifies the core demo flows against the local Docker stack. Safe and read-only
  except for creating one throwaway student account and writing one test value to
  that account's profile.

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\test-smoke.ps1

  Optional environment variables:

  Exit code 0 = all required checks passed, 1 = at least one required check failed.
#>

param(
    [string]$ApiBase = "http://localhost:8000/api/v1",
    [string]$FrontendUrl = "http://localhost:5173"
)

$script:pass = 0
$script:fail = 0
$script:failed = @()
$script:authHeader = @{}

function Step([string]$name, [scriptblock]$action) {
    try {
        & $action
        Write-Host ("[PASS] " + $name) -ForegroundColor Green
        $script:pass++
    } catch {
        Write-Host ("[FAIL] " + $name + "  ->  " + $_.Exception.Message) -ForegroundColor Red
        $script:fail++
        $script:failed += $name
    }
}

function Skip([string]$name, [string]$why) {
    Write-Host ("[SKIP] " + $name + "  (" + $why + ")") -ForegroundColor Yellow
}

Write-Host "==== Smoke test: AI University Recommendation System ====" -ForegroundColor Cyan
Write-Host ("API base: " + $ApiBase)
Write-Host ""

# 1. Docker containers running
Step "Docker containers running (backend, frontend, mongodb)" {
    $names = docker ps --format "{{.Names}}"
    foreach ($c in @("backend_fyp", "frontend_fyp", "mongodb_fyp")) {
        if ($names -notcontains $c) { throw "$c is not running" }
    }
}

# 2. Backend responds
Step "Backend /openapi.json responds (200)" {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8000/openapi.json" -TimeoutSec 15
    if ($r.StatusCode -ne 200) { throw "status $($r.StatusCode)" }
}

# 3. Frontend responds
Step "Frontend root responds (200)" {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -TimeoutSec 15
    if ($r.StatusCode -ne 200) { throw "status $($r.StatusCode)" }
}

# 4. Register a throwaway student
$stamp = (Get-Date).ToString("yyyyMMddHHmmss")
$email = "smoke_$stamp@example.com"
Step "Register throwaway student ($email)" {
    $resp = Invoke-RestMethod -Uri "$ApiBase/auth/register" -Method Post -ContentType "application/json" -Body $body
}

# 5. GET /auth/me
Step "GET /auth/me returns the student" {
    $me = Invoke-RestMethod -Uri "$ApiBase/auth/me" -Headers $script:authHeader
    if ($me.role -ne "student") { throw "expected role student, got $($me.role)" }
}

# 6. GET /student/profile
Step "GET /student/profile" {
    Invoke-RestMethod -Uri "$ApiBase/student/profile" -Headers $script:authHeader | Out-Null
}

# 7. PUT /student/profile with a small test value
Step "PUT /student/profile (cgpa=3.5) persists" {
    $body = @{ cgpa = 3.5 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$ApiBase/student/profile" -Method Put -Headers $script:authHeader -ContentType "application/json" -Body $body | Out-Null
    $check = Invoke-RestMethod -Uri "$ApiBase/student/profile" -Headers $script:authHeader
    if ([double]$check.cgpa -ne 3.5) { throw "cgpa did not persist (got $($check.cgpa))" }
}

# 8. GET /universities
Step "GET /universities returns a list" {
    $unis = Invoke-RestMethod -Uri "$ApiBase/universities"
    if ($null -eq $unis) { throw "no response" }
}

# 11. GET /recommendations/history
Step "GET /recommendations/history" {
    Invoke-RestMethod -Uri "$ApiBase/recommendations/history" -Headers $script:authHeader | Out-Null
}

# 12. GET /universities/saved
Step "GET /universities/saved" {
    Invoke-RestMethod -Uri "$ApiBase/universities/saved" -Headers $script:authHeader | Out-Null
}

# 9 & 10. Optional OpenAI-backed tests
if ($env:RUN_AI_TESTS -eq "1") {
    Step "POST /ai/chat (OpenAI)" {
        $body = @{ message = "Reply with the single word OK" } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "$ApiBase/ai/chat" -Method Post -Headers $script:authHeader -ContentType "application/json" -Body $body
        if (-not $r.reply) { throw "no reply" }
    }
    Step "POST /ai/recommend (OpenAI)" {
        $body = @{ cgpa = 3.5; intended_major = "Computer Science"; degree_applying_for = "MS" } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "$ApiBase/ai/recommend" -Method Post -Headers $script:authHeader -ContentType "application/json" -Body $body
        if (-not $r.session_id) { throw "no session_id" }
    }
} else {
    Skip "AI chat / recommend" "set RUN_AI_TESTS=1 to run (uses OpenAI credits)"
}

# 13. Admin endpoints (only if credentials supplied)
    Step "Admin login" {
        $resp = Invoke-RestMethod -Uri "$ApiBase/auth/login" -Method Post -ContentType "application/json" -Body $body
        if ($resp.user.role -ne "admin") { throw "account is not an admin (role=$($resp.user.role))" }
    }
    Step "Admin GET /admin/stats returns real counts" {
        $s = Invoke-RestMethod -Uri "$ApiBase/admin/stats" -Headers $h
        if ($null -eq $s.total_users) { throw "missing total_users" }
        Write-Host ("       users=" + $s.total_users + " students=" + $s.total_students + " universities=" + $s.total_universities) -ForegroundColor DarkGray
    }
        $u = Invoke-RestMethod -Uri "$ApiBase/admin/users" -Headers $h
        $first = @($u)[0]
    }
    Step "Student is blocked from /admin/stats (expect 403)" {
        $blocked = $false
        try {
            Invoke-RestMethod -Uri "$ApiBase/admin/stats" -Headers $script:authHeader | Out-Null
        } catch {
            $code = $_.Exception.Response.StatusCode.value__
            if ($code -eq 403) { $blocked = $true } else { throw "expected 403, got $code" }
        }
        if (-not $blocked) { throw "student was NOT blocked" }
    }
} else {
}

# Summary
Write-Host ""
Write-Host "==== SUMMARY ====" -ForegroundColor Cyan
Write-Host ("PASS: " + $script:pass + "   FAIL: " + $script:fail)
if ($script:fail -gt 0) {
    Write-Host ("Failed checks: " + ($script:failed -join ", ")) -ForegroundColor Red
    Write-Host "If backend/frontend is not running, start it with:  docker compose up -d --build" -ForegroundColor Yellow
    exit 1
}
Write-Host "All required checks passed." -ForegroundColor Green
exit 0
````

## Safety instructions for Claude

- Do not read or print .env.
- Do not expose API keys, JWT secrets, tokens, database URLs, or password hashes.
- Do not commit, push, create PR, delete files, run git reset, git clean, or docker compose down -v unless explicitly approved.
- Keep changes minimal and FYP-demo focused.
- Analyze first before broad edits.
- Preserve auth/login/register response shapes.
- Preserve recommendation response shape unless explicitly approved.
- Prefer safe future-scope banners over fake hardcoded outputs.
