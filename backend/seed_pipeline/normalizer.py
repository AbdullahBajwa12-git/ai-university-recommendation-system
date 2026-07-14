from typing import Dict, Any
from .config import EXCHANGE_RATES_TO_USD

def normalize_degree_level(level: str) -> str:
    level_lower = level.lower()
    if level_lower in ["bachelor", "bachelor's", "bsc", "bs", "undergraduate"]:
        return "Bachelors"
    elif level_lower in ["master", "ms", "msc", "mba", "graduate"]:
        return "Masters"
    elif level_lower in ["phd", "doctorate"]:
        return "PhD"
    return level

def normalize_identity(name: str, country: str) -> str:
    return f"{name.lower().strip()}|{country.lower().strip()}"

def normalize_currency(amount: float, currency: str) -> float:
    rate = EXCHANGE_RATES_TO_USD.get(currency.upper(), 1.0)
    return amount * rate

def normalize_university(row: Dict[str, Any]) -> Dict[str, Any]:
    if row.get("university_name") and row.get("country"):
        row["normalized_identity"] = normalize_identity(row["university_name"], row["country"])
    return row

def normalize_program(row: Dict[str, Any]) -> Dict[str, Any]:
    if row.get("study_level"):
        row["study_level"] = normalize_degree_level(row["study_level"])

    if row.get("tuition_amount"):
        curr = row.get("tuition_currency") or "USD"
        try:
            amt = float(row["tuition_amount"])
            row["tuition_amount_usd"] = normalize_currency(amt, curr)
        except ValueError:
            pass
    return row
