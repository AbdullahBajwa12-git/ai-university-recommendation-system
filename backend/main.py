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
    # AdminUserOut omits password_hash and any credential fields.
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

# ── ADMIN: COUNTRY MANAGEMENT (list / find-or-create) ─────────────────────────

async def _get_or_create_country(name: str):
    """Return an existing Country by name (case-sensitive match) or create one.
    Mirrors the seed script's find-or-create behaviour."""
    name = (name or "").strip()
    if not name:
        return None
    country = await models.Country.find_one(models.Country.name == name)
    if not country:
        country = models.Country(name=name)
        await country.insert()
    return country

@app.get("/api/v1/admin/countries", response_model=List[schemas.CountryOut])
async def admin_list_countries(current_admin: models.User = Depends(auth.get_current_admin)):
    countries = await models.Country.find_all().to_list()
    return sorted(countries, key=lambda c: c.name.lower())

@app.post("/api/v1/admin/countries", response_model=schemas.CountryOut, status_code=201)
async def admin_create_country(
    payload: schemas.CountryCreate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    name = (payload.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Country name is required")
    country = await _get_or_create_country(name)
    return country

# ── ADMIN: UNIVERSITY CRUD ────────────────────────────────────────────────────

@app.get("/api/v1/admin/universities", response_model=List[schemas.University])
async def admin_list_universities(current_admin: models.User = Depends(auth.get_current_admin)):
    universities = await models.University.find_all().to_list()
    countries = await models.Country.find_all().to_list()
    country_map = {str(c.id): c.name for c in countries}
    return [_university_out(uni, country_map.get(_country_ref_id(uni))) for uni in universities]

@app.post("/api/v1/admin/universities", response_model=schemas.University, status_code=201)
async def admin_create_university(
    payload: schemas.UniversityAdminCreate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    country = await _get_or_create_country(payload.country)
    if not country:
        raise HTTPException(status_code=400, detail="Country is required")
    uni = models.University(
        university_name=payload.university_name,
        country=country,
        city=payload.city,
        qs_ranking=payload.qs_ranking,
        website=payload.website,
        yearly_tuition_fee=payload.yearly_tuition_fee,
        acceptance_rate=payload.acceptance_rate,
        description=payload.description,
    )
    await uni.insert()
    return _university_out(uni, country.name)

@app.patch("/api/v1/admin/universities/{university_id}", response_model=schemas.University)
async def admin_update_university(
    university_id: PydanticObjectId,
    payload: schemas.UniversityAdminUpdate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    uni = await models.University.get(university_id)
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    data = payload.model_dump(exclude_unset=True)
    country_name = None
    if "country" in data:
        cval = data.pop("country")
        if cval:
            country = await _get_or_create_country(cval)
            uni.country = country
            country_name = country.name
    for key, value in data.items():
        setattr(uni, key, value)
    await uni.save()

    if country_name is None:
        ref_id = _country_ref_id(uni)
        if ref_id:
            country = await models.Country.get(ref_id)
            country_name = country.name if country else None
    return _university_out(uni, country_name)

@app.delete("/api/v1/admin/universities/{university_id}")
async def admin_delete_university(
    university_id: PydanticObjectId,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    uni = await models.University.get(university_id)
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    # Saved universities and recommendation sessions store denormalized copies
    # (no link), so they are unaffected. UniversityProgram does link here, so
    # block deletion if any program references this university to avoid orphans.
    linked_programs = await models.UniversityProgram.find(
        models.UniversityProgram.university.id == university_id
    ).count()
    if linked_programs:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete: this university has linked programs.",
        )
    await uni.delete()
    return {"message": "University deleted"}

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
        print(f"AI chat error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="The chat service is temporarily unavailable. Please try again.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
