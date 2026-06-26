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
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

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
    country_id: Optional[int] = None
    qs_ranking: Optional[int] = None
    website: Optional[str] = None
    city: Optional[str] = None
    yearly_tuition_fee: Optional[int] = None
    acceptance_rate: Optional[float] = None
    description: Optional[str] = None

class University(UniversityBase):
    id: UUID
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
