from typing import Optional, List, Any, Annotated
from datetime import datetime, timezone
from uuid import UUID, uuid4
from beanie import Document, Link, Indexed
from pydantic import Field, EmailStr, BaseModel as PydanticBaseModel
from pymongo import IndexModel, ASCENDING

# ── USERS ───────────────────────────────────────────────────────────────────

class User(Document):
    id: UUID = Field(default_factory=uuid4)
    full_name: Optional[str] = None
    email: EmailStr = Indexed(unique=True)
    password_hash: Optional[str] = None
    role: str = "student"  # admin | student
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

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

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    class Settings:
        name = "student_recommendation_profiles"

# ── RECOMMENDATION SESSION ───────────────────────────────────────────────────

class RecommendedUniversityItem(Document):
    """A single AI-recommended university stored in a session."""
    session_id: UUID
    university_name: str
    country: str
    city: Optional[str] = None
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    class Settings:
        name = "recommendation_sessions"

# ── SAVED UNIVERSITIES ───────────────────────────────────────────────────────

class SavedUniversity(Document):
    """User-bookmarked university from a recommendation session."""
    id: UUID = Field(default_factory=uuid4)
    user: Link[User]
    user_id: Optional[str] = None
    university_id: Optional[str] = None
    university_name: str
    country: str
    city: Optional[str] = None
    degree: str
    major: str
    admission_chance: float
    world_rank: Optional[int] = None
    scholarship_available: Optional[bool] = None
    university_email: Optional[str] = None
    university_website: Optional[str] = None
    category: Optional[str] = None
    tuition_fee: Optional[int] = None
    acceptance_rate: Optional[float] = None
    course_page_url: Optional[str] = None
    deadline: Optional[str] = None
    description: Optional[str] = None
    reason_for_match: Optional[str] = None
    session_id: Optional[UUID] = None
    saved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    class Settings:
        name = "saved_universities"
        indexes = [
            IndexModel(
                [("user_id", ASCENDING), ("university_id", ASCENDING)],
                unique=True,
                partialFilterExpression={
                    "user_id": {"$type": "string"},
                    "university_id": {"$type": "string"}
                }
            )
        ]

# ── COUNTRIES & FIELDS ──────────────────────────────────────────────────────

class Country(Document):
    name: str = Indexed(unique=True)

    class Settings:
        name = "countries"

class FieldOfStudy(Document):
    name: str = Indexed(unique=True)

    class Settings:
        name = "fields_of_study"

# ── ACADEMIC TAXONOMY ────────────────────────────────────────────────────────

class AcademicDomain(Document):
    name: str = Indexed(unique=True)
    description: Optional[str] = None

    class Settings:
        name = "academic_domains"

class CoreProgram(Document):
    domain: Link[AcademicDomain]
    canonical_name: str = Indexed(unique=True)
    aliases: List[str] = Field(default_factory=list)

    class Settings:
        name = "core_programs"
        indexes = [[("aliases", 1)]]

class Specialization(Document):
    core_program: Link[CoreProgram]
    name: str
    aliases: List[str] = Field(default_factory=list)

    class Settings:
        name = "specializations"
        indexes = [[("aliases", 1)]]

# ── UNIVERSITIES ────────────────────────────────────────────────────────────

class ProgramEntry(PydanticBaseModel):
    program_name: str
    study_level: str
    field: str
    duration_months: Optional[int] = None
    tuition_fee_usd: Optional[int] = None
    min_cgpa: Optional[float] = None
    min_ielts: Optional[float] = None
    min_gre: Optional[int] = None
    course_page_url: Optional[str] = None
    deadline: Optional[str] = None

class University(Document):
    university_name: Annotated[str, Indexed()]
    normalized_identity: Optional[str] = Indexed(unique=True) # Normalized for duplicate prevention
    country: Annotated[str, Indexed()]
    city: Optional[str] = None
    continent: Optional[str] = None
    qs_ranking: Optional[int] = None
    acceptance_rate: Optional[float] = None
    institution_type: Optional[str] = None
    data_source: Optional[str] = None
    source_batch_id: Optional[str] = None
    verified_by: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    yearly_tuition_usd: Optional[int] = None # Legacy
    website: Optional[str] = None
    admissions_url: Optional[str] = None
    admissions_email: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: Optional[datetime] = None

    class Settings:
        name = "universities"
        indexes = [
            [("country", 1)],
            [("qs_ranking", 1)],
            [("study_levels", 1)],
            [("fields", 1)],
            [("yearly_tuition_usd", 1)],
            [("acceptance_rate", 1)],
        ]

class TuitionInfo(PydanticBaseModel):
    amount: float
    currency: str = "USD"
    amount_usd: Optional[float] = None
    original_amount: Optional[float] = None
    original_currency: Optional[str] = None
    fee_period: str = "ANNUAL"

class AdmissionReqs(PydanticBaseModel):
    min_cgpa: Optional[float] = None
    cgpa_scale: Optional[float] = 4.0
    min_ielts_overall: Optional[float] = None
    min_toefl: Optional[int] = None
    min_gre: Optional[int] = None
    min_gmat: Optional[int] = None
    min_sat: Optional[int] = None
    interview_required: Optional[bool] = None

class UniversityProgram(Document):
    university: Link[University]
    canonical_program: Link[CoreProgram]
    specialization: Optional[Link[Specialization]] = None

    program_name: str
    degree_level: str = Indexed()
    track: str = "DEFAULT"
    study_mode: str = "ON_CAMPUS"
    instruction_language: str = "English"
    duration_months: Optional[int] = None
    intakes: List[str] = Field(default_factory=list)

    tuition: Optional[TuitionInfo] = None
    admission_requirements: Optional[AdmissionReqs] = None

    course_page_url: Optional[str] = None
    application_deadline: Optional[str] = None

    source_batch_id: Optional[str] = None
    dataset_version: Optional[str] = None
    seed_version: Optional[str] = None
    import_timestamp: Optional[str] = None

    class Settings:
        name = "university_programs"
        indexes = [
            IndexModel([("university.$id", 1), ("canonical_program.$id", 1), ("specialization.$id", 1), ("degree_level", 1), ("track", 1)], unique=True),
            [("tuition.amount_usd", 1)],
            [("admission_requirements.min_cgpa", 1)]
        ]

# ── AI & APPLICATIONS ───────────────────────────────────────────────────────

class AdmissionPrediction(Document):
    student_profile: Link[StudentProfile]
    program: Link[UniversityProgram]
    admission_probability: float
    category: str  # SAFE | MODERATE | REACH
    explanation: str
    model_used: str = "GPT-4o"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    class Settings:
        name = "admission_predictions"

class Application(Document):
    student_profile: Link[StudentProfile]
    program: Link[UniversityProgram]
    status: str = "Applied"  # Applied|Pending|Accepted|Rejected
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    class Settings:
        name = "applications"

# ── SCHOLARSHIPS ─────────────────────────────────────────────────────────────

class Scholarship(Document):
    """Denormalized scholarship record (no hard links) for the catalog."""
    title: str
    provider: Optional[str] = None
    university_name: Optional[str] = None
    country: Optional[str] = None
    level: Optional[str] = None
    field_of_study: Optional[str] = None
    funding_type: Optional[str] = None
    amount: Optional[str] = None
    deadline: Optional[str] = None
    eligibility: Optional[str] = None
    apply_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: Optional[datetime] = None

    class Settings:
        name = "scholarships"

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
    AcademicDomain,
    CoreProgram,
    Specialization,
    University,
    UniversityProgram,
    AdmissionPrediction,
    Application,
    Scholarship,
]
