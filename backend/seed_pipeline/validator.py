from typing import Optional, Tuple, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ValidationError

class PipelineUniversitySchema(BaseModel):
    institution_id: str
    university_name: str
    country: str
    data_source: str

    city: Optional[str] = None
    continent: Optional[str] = None
    qs_ranking: Optional[int] = None
    institution_type: Optional[str] = None
    acceptance_rate: Optional[float] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    verified_by: Optional[str] = None
    last_verified_at: Optional[datetime] = None

    # Injected by pipeline
    data_quality_score: Optional[int] = None
    normalized_identity: Optional[str] = None

class PipelineProgramSchema(BaseModel):
    program_id: str
    institution_id: str
    program_name: str
    field_of_study: str
    study_level: str

    duration_months: Optional[int] = None
    tuition_amount: Optional[float] = None
    tuition_currency: str = "USD"
    original_tuition_amount: Optional[float] = None
    original_currency: Optional[str] = None
    min_cgpa: Optional[float] = None
    min_ielts: Optional[float] = None
    min_gre: Optional[int] = None
    data_source: Optional[str] = None
    verified_by: Optional[str] = None
    last_verified_at: Optional[datetime] = None

    # Injected by pipeline
    tuition_amount_usd: Optional[float] = None
    data_quality_score: Optional[int] = None
    core_program_id: Optional[str] = None
    specialization_id: Optional[str] = None

def validate_university(row: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Validates a university row.
    Returns (valid_data, error_dict).
    If valid, error_dict is None.
    If invalid, valid_data is None.
    """
    try:
        obj = PipelineUniversitySchema(**row)
        if obj.data_quality_score is not None and obj.data_quality_score < 60:
            return None, {"row": row, "error": "data_quality_score < 60"}
        return obj.model_dump() if hasattr(obj, "model_dump") else obj.dict(), None
    except ValidationError as e:
        return None, {"row": row, "error": str(e)}

def validate_program(row: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Validates a program row.
    Returns (valid_data, error_dict).
    """
    try:
        obj = PipelineProgramSchema(**row)
        if obj.data_quality_score is not None and obj.data_quality_score < 60:
            return None, {"row": row, "error": "data_quality_score < 60"}
        return obj.model_dump() if hasattr(obj, "model_dump") else obj.dict(), None
    except ValidationError as e:
        return None, {"row": row, "error": str(e)}
