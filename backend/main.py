import os
import json
import httpx
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from beanie import PydanticObjectId
from uuid import UUID
from datetime import datetime, timedelta

import models
import schemas
import auth
from database import init_db
from constants import STUDY_DESTINATIONS, ALL_DESTINATIONS
from beanie.operators import In
from pymongo.errors import DuplicateKeyError
from bson.errors import InvalidId
from bson import ObjectId

# ── LIFECYCLE ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(models.ALL_MODELS)
    yield

app = FastAPI(title="AI University Advisor API (MongoDB)", version="2.0.0", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://studyroute-kappa.vercel.app",
        "https://studyroute.online",
        "https://www.studyroute.online"
    ],
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

# ── ADMIN: SCHOLARSHIP CRUD ───────────────────────────────────────────────────

@app.get("/api/v1/admin/scholarships", response_model=List[schemas.ScholarshipOut])
async def admin_list_scholarships(current_admin: models.User = Depends(auth.get_current_admin)):
    # Admins see all scholarships, active and inactive.
    return await models.Scholarship.find_all().sort(-models.Scholarship.created_at).to_list()

@app.post("/api/v1/admin/scholarships", response_model=schemas.ScholarshipOut, status_code=201)
async def admin_create_scholarship(
    payload: schemas.ScholarshipCreate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    scholarship = models.Scholarship(**payload.model_dump())
    await scholarship.insert()
    return scholarship

@app.patch("/api/v1/admin/scholarships/{scholarship_id}", response_model=schemas.ScholarshipOut)
async def admin_update_scholarship(
    scholarship_id: PydanticObjectId,
    payload: schemas.ScholarshipUpdate,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    scholarship = await models.Scholarship.get(scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    data = payload.model_dump(exclude_unset=True)
    if data:
        data["updated_at"] = datetime.utcnow()
        await scholarship.set(data)
    return scholarship

@app.delete("/api/v1/admin/scholarships/{scholarship_id}")
async def admin_delete_scholarship(
    scholarship_id: PydanticObjectId,
    current_admin: models.User = Depends(auth.get_current_admin),
):
    # Soft delete: preserve the record but hide it from students (is_active=False).
    scholarship = await models.Scholarship.get(scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    await scholarship.set({"is_active": False, "updated_at": datetime.utcnow()})
    return {"message": "Scholarship deactivated"}

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
    norm_name = data.university_name.strip().lower()
    norm_country = data.country.strip().lower()

    if data.university_id:
        try:
            uid = ObjectId(data.university_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid university_id format")

        db_u = await models.University.get(uid)
        if not db_u:
            raise HTTPException(status_code=404, detail="University not found in database")

        if db_u.university_name.strip().lower() != norm_name or db_u.country.strip().lower() != norm_country:
            raise HTTPException(status_code=400, detail="University identity mismatch")

        existing = await models.SavedUniversity.find_one(
            models.SavedUniversity.user.id == current_user.id,
            models.SavedUniversity.university_id == data.university_id
        )
        if existing:
            return existing

    if not data.university_id:
        existing_list = await models.SavedUniversity.find(
            models.SavedUniversity.user.id == current_user.id
        ).to_list()
        for record in existing_list:
            if record.university_name.strip().lower() == norm_name and record.country.strip().lower() == norm_country:
                return record

    saved = models.SavedUniversity(
        user=current_user,
        user_id=str(current_user.id),
        university_id=data.university_id,
        university_name=data.university_name,
        country=data.country,
        city=data.city,
        degree=data.degree,
        major=data.major,
        admission_chance=data.admission_chance,
        category=data.category,
        world_rank=data.world_rank,
        scholarship_available=data.scholarship_available,
        university_email=data.university_email,
        university_website=data.university_website,
        course_page_url=data.course_page_url,
        tuition_fee=data.tuition_fee,
        acceptance_rate=data.acceptance_rate,
        deadline=data.deadline,
        reason_for_match=data.reason_for_match,
        session_id=data.session_id,
    )

    try:
        await saved.insert()
    except DuplicateKeyError:
        if data.university_id:
            existing = await models.SavedUniversity.find_one(
                models.SavedUniversity.user_id == str(current_user.id),
                models.SavedUniversity.university_id == data.university_id
            )
            if existing:
                return existing
        raise HTTPException(status_code=500, detail="Failed to save university")

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

# ── PUBLIC SCHOLARSHIPS ───────────────────────────────────────────────────────

@app.get("/api/v1/scholarships", response_model=List[schemas.ScholarshipOut])
async def list_scholarships(
    country: Optional[str] = None,
    level: Optional[str] = None,
    field: Optional[str] = None,
    search: Optional[str] = None,
):
    # Students only ever see active scholarships. Filtering is done in-memory
    # (small dataset) to stay Motor-safe and simple.
    items = await models.Scholarship.find(models.Scholarship.is_active == True).to_list()

    def matches(s):
        if country and (s.country or "").lower() != country.lower():
            return False
        if level and (s.level or "").lower() != level.lower():
            return False
        if field and field.lower() not in (s.field_of_study or "").lower():
            return False
        if search:
            q = search.lower()
            haystack = " ".join([
                s.title or "", s.provider or "", s.university_name or "",
                s.country or "", s.field_of_study or "", s.description or "",
            ]).lower()
            if q not in haystack:
                return False
        return True

    return [s for s in items if matches(s)]

def sanitize_url(url: str | None) -> str:
    if not url:
        return ""
    return url.strip(" \"'")

# ── AI RECOMMENDATION ENDPOINT ───────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are an expert university admissions counselor. "
    "I will provide a 'candidate_pool' JSON of pre-filtered universities and a 'student_profile'. "
    "Your task is to select 12 to 20 universities strictly from the provided 'candidate_pool' that best match the student. "
    "If the 'candidate_pool' has fewer than 12 universities, select as many valid matches as possible. "
    "Include a mix of SAFE, TARGET, and REACH universities if possible. "
    "Even for weak profiles, include top global universities from the pool as REACH options with low chances (5-20%). "
    "For each university you select, you must provide: "
    "'name' (string, exactly matching the candidate_pool name), "
    "'country' (string, exactly matching the candidate_pool country), "
    "'chances' (integer 0-100, your estimated admission probability), "
    "'category' (string, one of 'SAFE', 'TARGET', or 'REACH'), "
    "'reason' (string, 3-5 sentences EXPLICITLY referencing the student's actual credentials: "
    "mention their CGPA, test scores, intended major, research/work experience, "
    "and explain concretely WHY this university is a good fit). "
    "CRITICAL RULES: "
    "1. You MUST NOT invent, hallucinate, or recommend any university outside the provided 'candidate_pool'. "
    "2. You MUST NOT invent any URLs, deadlines, tuition fees, or ranks. "
    "3. Output ONLY valid JSON with a top-level key 'universities' containing an array of your selected objects. "
    "Each object must have exactly these fields: 'name', 'country', 'chances', 'category', 'reason'."
)

@app.post("/api/v1/ai/recommend", response_model=schemas.RecommendationResponse)
async def get_university_recommendations(
    profile_data: schemas.StudentRecommendationProfileIn,
    current_user: models.User = Depends(auth.get_current_user)
):
    profile_dict = profile_data.model_dump(exclude_none=True)

    # 1. Target Countries Validation
    target_countries = []
    continents = profile_dict.get('continents', [])
    for c in continents:
        if c in STUDY_DESTINATIONS:
            target_countries.extend(STUDY_DESTINATIONS[c])
            
    countries_pref = profile_dict.get('countries', [])
    target_countries.extend(countries_pref)
    
    target_countries = list(set(target_countries))
    valid_targets = [c for c in target_countries if c in ALL_DESTINATIONS]
    
    if not valid_targets:
        valid_targets = ALL_DESTINATIONS

    # 2. Database Filtering & Ranking
    db_unis = await models.University.find(In(models.University.country, valid_targets)).to_list()
    
    student_degree = profile_dict.get('degree_applying_for', '').lower()
    student_major = profile_dict.get('intended_major', '').lower()
    
    scored_unis = []
    for u in db_unis:
        score = 0
        # Country match (already filtered, but explicit preference gets more points)
        if u.country in countries_pref:
            score += 15
        else:
            score += 5
            
        # Degree match
        if student_degree and any(student_degree in sl.lower() for sl in u.study_levels):
            score += 25
            
        # Field relevance
        if student_major and any(student_major in f.lower() for f in u.fields):
            score += 25
            
        # Ranking boost (slight weight)
        if u.qs_ranking:
            score += max(0, 10 - (u.qs_ranking // 50))
            
        scored_unis.append((score, u))
        
    scored_unis.sort(key=lambda x: x[0], reverse=True)
    top_candidates = [u for score, u in scored_unis[:50]]
    
    print(f"[DEBUG] Found {len(db_unis)} DB universities. Pre-filtered to {len(top_candidates)} candidates.")

    if not top_candidates:
        raise HTTPException(status_code=404, detail="No matching universities found in the database for your preferences.")

    # Prepare candidate pool for OpenAI
    candidate_pool = []
    for u in top_candidates:
        programs_snippet = [{"name": p.program_name, "level": p.study_level, "field": p.field} for p in u.programs[:5]]
        candidate_pool.append({
            "name": u.university_name,
            "country": u.country,
            "rank": u.qs_ranking,
            "tuition": u.yearly_tuition_usd,
            "acceptance_rate": u.acceptance_rate,
            "sample_programs": programs_snippet
        })

    # 3. Build Prompt
    p = profile_dict
    user_message = f"""
Student Profile:
- Name: {p.get('full_name', 'N/A')}
- Education: {p.get('current_degree_level', 'N/A')}
- CGPA: {p.get('cgpa', 'N/A')}
- IELTS: {p.get('ielts', 'N/A')}, GRE: {p.get('gre', 'N/A')}
- Target Degree: {p.get('degree_applying_for', 'N/A')}
- Target Major: {p.get('intended_major', 'N/A')}
- Need Scholarship: {p.get('need_scholarship', False)}

Candidate Pool:
{json.dumps(candidate_pool, indent=2)}
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
        "temperature": 0.2,
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
        
        # 4. Validating and Hydrating output
        final_universities = []
        top_cand_dict = {u.university_name.lower(): u for u in top_candidates}
        
        for ai_u in raw_unis:
            ai_name = ai_u.get("name", "")
            if not ai_name or ai_name.lower() not in top_cand_dict:
                continue # Hallucination, drop it
                
            db_u = top_cand_dict[ai_name.lower()]
            
            # Find matching program for course URL and deadline
            course_url = None
            deadline = None
            for prog in db_u.programs:
                if student_major and (student_major in prog.field.lower() or student_major in prog.program_name.lower()):
                    if prog.course_page_url:
                        course_url = prog.course_page_url
                    if prog.deadline:
                        deadline = prog.deadline
                    break
                    
            if not course_url:
                course_url = db_u.admissions_url or db_u.website
                
            if not deadline:
                deadline = "Verify on official website"

            final_universities.append({
                "university_id":      str(db_u.id),
                "university_name":    db_u.university_name,
                "country":            db_u.country,
                "city":               db_u.city,
                "degree":             p.get("degree_applying_for", "N/A"),
                "major":              p.get("intended_major", "N/A"),
                "admission_chance":   float(ai_u.get("chances", 50)),
                "category":           ai_u.get("category", "TARGET").upper(),
                "world_rank":         db_u.qs_ranking,
                "scholarship_available": bool(db_u.yearly_tuition_usd == 0 or p.get('need_scholarship', False)),
                "university_email":   sanitize_url(db_u.admissions_email),
                "university_website": sanitize_url(db_u.website),
                "course_page_url":    sanitize_url(course_url),
                "tuition_fee":        db_u.yearly_tuition_usd,
                "acceptance_rate":    db_u.acceptance_rate,
                "deadline":           deadline,
                "reason_for_match":   ai_u.get("reason", "Good match for your profile."),
            })

        print(f"[DEBUG] AI returned {len(raw_unis)} unis. Validated & Hydrated {len(final_universities)}.")

        if not final_universities:
            raise HTTPException(status_code=500, detail="AI failed to generate valid recommendations from the candidate pool.")

        session = models.RecommendationSession(
            user=current_user,
            profile_snapshot=profile_dict,
            universities=final_universities,
            total_count=len(final_universities),
        )
        await session.insert()

        return {
            "session_id": str(session.id),
            "student_profile": profile_dict,
            "recommended_universities": final_universities,
            "total_count": len(final_universities),
            "created_at": session.created_at,
        }

    except httpx.HTTPStatusError as e:
        print(f"OpenAI request failed with status {e.response.status_code}")
        raise HTTPException(status_code=502, detail="The recommendation service is temporarily unavailable. Please try again.")
    except Exception as e:
        print(f"AI recommendation error: {type(e).__name__} - {str(e)}")
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

@app.delete("/api/v1/recommendations/history/{session_id}")
async def delete_recommendation_history(
    session_id: UUID,
    current_user: models.User = Depends(auth.get_current_user)
):
    session = await models.RecommendationSession.find_one(
        models.RecommendationSession.id == session_id,
        models.RecommendationSession.user.id == current_user.id
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await session.delete()
    return {"message": "History deleted successfully"}


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
