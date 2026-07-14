import unicodedata
from typing import Dict, Any

COUNTRY_ALIASES = {
    "us": "United States",
    "usa": "United States",
    "u.s.": "United States",
    "u.s.a.": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom",
    "u.k.": "United Kingdom",
    "uae": "United Arab Emirates",
}

def clean_row(row: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = {}
    for k, v in row.items():
        if isinstance(v, str):
            # 1. Strip whitespace and collapse multiple spaces
            v = " ".join(v.strip().split())

            # 2. Null coercion
            if v.lower() in ["", "n/a", "null", "-", "none"]:
                cleaned[k] = None
                continue

            # 3. Unicode normalization (NFKC)
            v = unicodedata.normalize("NFKC", v)

            # 4. CSV injection protection
            if v.startswith(("=", "+", "-", "@")):
                v = "'" + v

            # 5. Country normalization
            if k == "country":
                v_lower = v.lower()
                if v_lower in COUNTRY_ALIASES:
                    v = COUNTRY_ALIASES[v_lower]

            cleaned[k] = v
        else:
            cleaned[k] = v
    return cleaned
