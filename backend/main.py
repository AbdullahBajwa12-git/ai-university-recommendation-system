import os
import json
import httpx
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from beanie import PydanticObjectId
from uuid import UUID

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

@app.post("/api/v1/auth/register", response_model=schemas.Token)
async def register_user(user_data: schemas.UserRegister):
    existing_user = await models.User.find_one(models.User.email == user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        role="student"  # Role is forced server-side; never trust client input
    )
    await new_user.insert()

    # Initialize student profile if needed
    if new_user.role == "student":
        profile = models.StudentProfile(user=new_user)
        await profile.insert()

    # Auto-login: create access token immediately
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@app.post("/api/v1/auth/login", response_model=schemas.Token)
async def login_for_access_token(user_data: schemas.UserLogin):
    user = await models.User.find_one(models.User.email == user_data.email)
    if not user or not auth.verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/api/v1/auth/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

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

@app.get("/api/v1/universities", response_model=List[schemas.University])
async def list_universities():
    return await models.University.find_all().to_list()

@app.get("/api/v1/universities/{uni_id}", response_model=schemas.University)
async def get_university(uni_id: PydanticObjectId):
    uni = await models.University.get(uni_id)
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    return uni

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

    openai_key = os.getenv("OPENAI_API_KEY", "")
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
        print(f"DEBUG RAW from OpenAI: {json.dumps(data, indent=2)}")

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
        print(f"OpenAI HTTP Error: {e.response.text}")
        raise HTTPException(status_code=502, detail=f"OpenAI error: {e.response.text}")
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI Recommendation failed: {str(e)}")

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
    openai_key = os.getenv("OPENAI_API_KEY", "")
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
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
