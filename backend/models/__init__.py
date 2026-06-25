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
    password_hash: Optional[str] = None
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
