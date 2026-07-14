import asyncio
from typing import Dict, Any, Tuple, Optional
from models import University, UniversityProgram

# Concurrency requirement
DIFF_SEMAPHORE = asyncio.Semaphore(20)

async def diff_university(row: Dict[str, Any]) -> Tuple[str, Any]:
    """
    Identifies existing university records and compares relevant fields.
    Returns ("NEW", row), ("UPDATE", row), or ("UNCHANGED", None).
    """
    async with DIFF_SEMAPHORE:
        identity = row.get("normalized_identity")
        if not identity:
            return "NEW", row

        existing = await University.find_one(University.normalized_identity == identity)

        if not existing:
            return "NEW", row

        # Compare standard fields
        changed = False
        fields = [
            "university_name", "country", "city", "continent",
            "qs_ranking", "acceptance_rate", "website", "data_source"
        ]

        for f in fields:
            val = row.get(f)
            if val is not None and val != getattr(existing, f, None):
                changed = True
                break

        if changed:
            return "UPDATE", row
        return "UNCHANGED", None

async def diff_program(row: Dict[str, Any], university_db_id: Any, core_program_db_id: Any, specialization_db_id: Optional[Any] = None) -> Tuple[str, Any]:
    """
    Identifies existing program records using DB lookup and compares relevant fields.
    Returns ("NEW", row), ("UPDATE", row), or ("UNCHANGED", None).
    """
    async with DIFF_SEMAPHORE:
        degree_level = row.get("study_level")
        track = row.get("track", "DEFAULT")

        query = {
            "university.$id": university_db_id,
            "canonical_program.$id": core_program_db_id,
            "degree_level": degree_level,
            "track": track
        }

        if specialization_db_id:
            query["specialization.$id"] = specialization_db_id
        else:
            query["specialization"] = None

        existing = await UniversityProgram.find_one(query)

        if not existing:
            return "NEW", row

        changed = False
        fields = ["program_name", "duration_months", "course_page_url"]
        for f in fields:
            val = row.get(f)
            if val is not None and val != getattr(existing, f, None):
                changed = True
                break

        # Sub-document checks
        if row.get("tuition_amount") is not None:
            existing_tuition = getattr(existing, "tuition", None)
            if not existing_tuition:
                changed = True
            elif row.get("tuition_amount") != getattr(existing_tuition, "amount", None):
                changed = True

        if changed:
            return "UPDATE", row
        return "UNCHANGED", None
