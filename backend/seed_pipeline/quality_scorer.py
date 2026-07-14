from typing import Dict, Any

def score_university(row: Dict[str, Any]) -> int:
    score = 50
    if row.get("website") or row.get("logo_url"):
        score += 20
    if row.get("qs_ranking"):
        score += 15
    if row.get("verified_by"):
        score += 15
    return min(score, 100)

def score_program(row: Dict[str, Any]) -> int:
    score = 50
    if row.get("tuition_amount"):
        score += 10
    if row.get("min_cgpa") or row.get("min_ielts"):
        score += 20
    if row.get("verified_by"):
        score += 20
    return min(score, 100)
