"""
seed_universities_full.py
-------------------------
Idempotent script to seed universities and their programs into MongoDB.

Usage:
  cd backend
  python seed_universities_full.py --validate-only
  python seed_universities_full.py --dry-run
  python seed_universities_full.py
"""

import asyncio
import csv
import argparse
from pathlib import Path
import sys
from urllib.parse import urlparse, urlunparse
import math
from decimal import Decimal, InvalidOperation
from dataclasses import dataclass, field
from typing import List, Dict, Set, Any

# ---------------------------------------------------------------------------
# Live seed path (Beanie). Not touched by Phase 5A-2.
# ---------------------------------------------------------------------------
async def run_db_seed(universities_data):
    from database import init_db
    from models import ALL_MODELS, University

    print("Connecting to MongoDB...")
    await init_db(models=ALL_MODELS)

    created_count = 0
    skipped_count = 0

    for uni_dict in universities_data:
        uni_name = uni_dict["university_name"]
        uni_country = uni_dict["country"]

        existing = await University.find_one(
            University.university_name == uni_name,
            University.country == uni_country
        )
        if existing:
            print(f"  [SKIP] {uni_name} ({uni_country}) (already exists)")
            skipped_count += 1
            continue

        uni = University(**uni_dict)
        await uni.insert()
        print(f"  [ADDED] {uni_name} ({uni.country}) with {len(uni.programs)} programs")
        created_count += 1

    total = await University.count()
    return created_count, skipped_count, total

# ---------------------------------------------------------------------------
# CSV parsing helpers (live seed path)
# ---------------------------------------------------------------------------
def safe_int(val):
    if not val or val.strip() == "":
        return None
    try:
        return int(float(val.strip()))
    except Exception:
        return None

def safe_float(val):
    if not val or val.strip() == "":
        return None
    try:
        return float(val.strip())
    except Exception:
        return None

def safe_str(val):
    if not val or val.strip() == "":
        return None
    return val.strip()

# ---------------------------------------------------------------------------
# Shared helpers: normalization
# ---------------------------------------------------------------------------
def normalize(val):
    """Phase 5A-1 normalization for CSV string values (string input only)."""
    if not val:
        return ""
    return " ".join(val.strip().split()).casefold()

def normalize_identity_text(value):
    """
    Safe normalization for DB identity fields.
    Returns "" for None, non-string, or complex types.
    Only plain string values produce a valid identity token.
    """
    if value is None:
        return ""
    if isinstance(value, bool):
        return ""
    if not isinstance(value, str):
        return ""
    stripped = " ".join(value.strip().split()).casefold()
    return stripped

def safe_display(value, max_len=140):
    """
    Convert any value to a safe, printable ASCII-compatible string.
    Truncates at max_len characters and appends '...' when cut.
    Never crashes on complex types.
    """
    if value is None:
        return "None"
    try:
        s = str(value)
    except Exception:
        return "<unrepresentable>"
    # Collapse control characters and excessive whitespace
    s = s.replace("\n", " ").replace("\r", " ").replace("\t", " ")
    # Ensure printable ASCII subset where possible (leave non-ASCII as-is,
    # they will be visible in most terminals; just don't crash)
    if len(s) > max_len:
        return s[:max_len] + "..."
    return s

# ---------------------------------------------------------------------------
# Shared helpers: URL normalization for comparison
# ---------------------------------------------------------------------------
def normalize_url_for_comparison(url_str):
    """
    Normalize a URL for field comparison:
      - trim outer whitespace
      - lowercase scheme and hostname
      - preserve path, query, fragment case
      - preserve port when present
    Returns the normalized string, or the stripped original on parse failure.
    """
    if not url_str:
        return ""
    url_str = url_str.strip()
    try:
        p = urlparse(url_str)
        scheme = p.scheme.lower() if p.scheme else ""
        netloc = p.netloc.lower() if p.netloc else ""
        # urlparse puts host+port in netloc; lowercasing it lowercases both,
        # which is correct for hostname. Port is numeric so case is irrelevant.
        normalized = urlunparse((scheme, netloc, p.path, p.params, p.query, p.fragment))
        return normalized
    except Exception:
        return url_str

# ---------------------------------------------------------------------------
# Shared helpers: numeric validation (CSV)
# ---------------------------------------------------------------------------
def strict_int_parser(val):
    try:
        d = Decimal(val)
    except InvalidOperation:
        raise ValueError(f"Invalid numeric value: {val}")
    if not d.is_finite() or d != d.to_integral_value():
        raise ValueError(f"Invalid integer value: {val}")
    return int(d)

def finite_float_parser(val):
    f = float(val)
    if not math.isfinite(f):
        raise ValueError(f"Non-finite float value: {val}")
    return f

def validate_numeric(val, row_num, file_name, field_name, type_func, errors):
    if not val or val.strip() == "":
        return
    try:
        type_func(val.strip())
    except (ValueError, OverflowError):
        errors.append(
            f"{file_name} row {row_num}: invalid numeric value for '{field_name}': '{val}'"
        )

def check_url(url_val, row_num, file_name, field_name, warnings):
    if not url_val or not url_val.strip():
        return
    url_val = url_val.strip()
    parsed = urlparse(url_val)
    if not parsed.scheme or not parsed.netloc:
        warnings.append(
            f"{file_name} row {row_num}: URL has no valid scheme or hostname "
            f"for '{field_name}': '{url_val}'"
        )
    elif parsed.scheme == "http":
        warnings.append(
            f"{file_name} row {row_num}: URL uses HTTP instead of HTTPS "
            f"for '{field_name}': '{url_val}'"
        )

# ---------------------------------------------------------------------------
# Shared helpers: safe DB numeric parsing for comparison
# ---------------------------------------------------------------------------
def safe_db_int(db_val):
    """
    Convert a MongoDB field value to int for comparison.
    Returns (int_value, True) on success, (None, False) on failure.
    Rejects bool, NaN, Infinity, fractional values.
    """
    if db_val is None:
        return None, True  # cleanly absent
    if isinstance(db_val, bool):
        return None, False
    if isinstance(db_val, int):
        return db_val, True
    if isinstance(db_val, float):
        if not math.isfinite(db_val):
            return None, False
        if db_val != int(db_val):
            return None, False
        return int(db_val), True
    if isinstance(db_val, str):
        try:
            d = Decimal(db_val)
            if not d.is_finite() or d != d.to_integral_value():
                return None, False
            return int(d), True
        except Exception:
            return None, False
    return None, False

def safe_db_float(db_val):
    """
    Convert a MongoDB field value to float for comparison.
    Returns (float_value, True) on success, (None, False) on failure.
    Rejects bool, NaN, Infinity.
    """
    if db_val is None:
        return None, True  # cleanly absent
    if isinstance(db_val, bool):
        return None, False
    if isinstance(db_val, (int, float)):
        if isinstance(db_val, float) and not math.isfinite(db_val):
            return None, False
        return float(db_val), True
    if isinstance(db_val, str):
        try:
            f = float(db_val)
            if not math.isfinite(f):
                return None, False
            return f, True
        except Exception:
            return None, False
    return None, False

# ---------------------------------------------------------------------------
# ValidationResult dataclass
# ---------------------------------------------------------------------------
@dataclass
class ValidationResult:
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    uni_rows_inspected: int = 0
    prog_rows_inspected: int = 0
    valid_uni_count: int = 0
    valid_prog_count: int = 0
    uni_name_country_map: Dict[str, Set[str]] = field(default_factory=dict)
    valid_unis: List[Dict[str, Any]] = field(default_factory=list)
    valid_progs: List[Dict[str, Any]] = field(default_factory=list)

# ---------------------------------------------------------------------------
# Shared CSV parsing and validation (Phase 5A-1 logic preserved exactly)
# ---------------------------------------------------------------------------
def parse_and_validate_csvs(SCRIPT_DIR, uni_csv, prog_csv) -> ValidationResult:
    sys.path.append(str(SCRIPT_DIR))
    from constants import ALL_DESTINATIONS

    res = ValidationResult()

    exp_uni_headers = [
        "university_name", "country", "city", "continent", "qs_ranking",
        "acceptance_rate", "yearly_tuition_usd", "website", "admissions_url",
        "admissions_email", "description"
    ]
    exp_prog_headers = [
        "university_name", "program_name", "study_level", "field",
        "duration_months", "tuition_fee_usd", "min_cgpa", "min_ielts",
        "min_gre", "course_page_url", "deadline"
    ]

    # 1. Validate universities
    seen_uni_identities = set()

    uni_headers_ok = True
    uni_file_name = uni_csv.name
    try:
        with open(uni_csv, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                res.errors.append(f"{uni_file_name}: file is empty or missing headers")
                uni_headers_ok = False
            else:
                for req in exp_uni_headers:
                    if req not in headers:
                        res.errors.append(f"{uni_file_name}: missing required header '{req}'")
                        uni_headers_ok = False
    except Exception as e:
        res.errors.append(f"Failed to read {uni_file_name}: {e}")
        uni_headers_ok = False

    if uni_headers_ok:
        with open(uni_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=2):
                res.uni_rows_inspected += 1
                name = row.get("university_name", "")
                country = row.get("country", "")

                missing_req = False
                if not name or not name.strip():
                    res.errors.append(
                        f"{uni_file_name} row {i}: missing required field 'university_name'"
                    )
                    missing_req = True
                if not country or not country.strip():
                    res.errors.append(
                        f"{uni_file_name} row {i}: missing required field 'country'"
                    )
                    missing_req = True

                norm_name = normalize(name)
                norm_country = normalize(country)

                if norm_name and norm_country:
                    identity = f"{norm_name}|{norm_country}"
                    if identity in seen_uni_identities:
                        res.errors.append(
                            f"{uni_file_name} row {i}: duplicate university '{name}' in '{country}'"
                        )
                    else:
                        seen_uni_identities.add(identity)
                        if norm_name not in res.uni_name_country_map:
                            res.uni_name_country_map[norm_name] = set()
                        res.uni_name_country_map[norm_name].add(norm_country)

                if country and country.strip() not in ALL_DESTINATIONS:
                    res.errors.append(
                        f"{uni_file_name} row {i}: invalid country '{country}'"
                    )

                validate_numeric(row.get("qs_ranking"), i, uni_file_name,
                                  "qs_ranking", strict_int_parser, res.errors)
                validate_numeric(row.get("acceptance_rate"), i, uni_file_name,
                                  "acceptance_rate", finite_float_parser, res.errors)
                validate_numeric(row.get("yearly_tuition_usd"), i, uni_file_name,
                                  "yearly_tuition_usd", strict_int_parser, res.errors)

                check_url(row.get("website"), i, uni_file_name, "website", res.warnings)
                check_url(row.get("admissions_url"), i, uni_file_name,
                           "admissions_url", res.warnings)

                if not missing_req:
                    res.valid_uni_count += 1
                    res.valid_unis.append(row)

    # 2. Validate programs
    prog_file_name = prog_csv.name
    seen_prog_identities = set()

    prog_headers_ok = True
    try:
        with open(prog_csv, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                res.errors.append(f"{prog_file_name}: file is empty or missing headers")
                prog_headers_ok = False
            else:
                for req in exp_prog_headers:
                    if req not in headers:
                        res.errors.append(
                            f"{prog_file_name}: missing required header '{req}'"
                        )
                        prog_headers_ok = False
    except Exception as e:
        res.errors.append(f"Failed to read {prog_file_name}: {e}")
        prog_headers_ok = False

    if prog_headers_ok:  # only proceed if headers are valid
        with open(prog_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=2):
                res.prog_rows_inspected += 1
                uni_name = row.get("university_name", "")
                prog_name = row.get("program_name", "")
                study_level = row.get("study_level", "")
                fld = row.get("field", "")

                missing_req = False
                if not uni_name or not uni_name.strip():
                    res.errors.append(
                        f"{prog_file_name} row {i}: missing required field 'university_name'"
                    )
                    missing_req = True
                if not prog_name or not prog_name.strip():
                    res.errors.append(
                        f"{prog_file_name} row {i}: missing required field 'program_name'"
                    )
                    missing_req = True
                if not study_level or not study_level.strip():
                    res.errors.append(
                        f"{prog_file_name} row {i}: missing required field 'study_level'"
                    )
                    missing_req = True
                if not fld or not fld.strip():
                    res.errors.append(
                        f"{prog_file_name} row {i}: missing required field 'field'"
                    )
                    missing_req = True

                norm_uni = normalize(uni_name)
                norm_prog = normalize(prog_name)
                norm_level = normalize(study_level)
                norm_field = normalize(fld)

                if norm_uni and norm_prog and norm_level and norm_field:
                    identity = f"{norm_uni}|{norm_prog}|{norm_level}|{norm_field}"
                    if identity in seen_prog_identities:
                        res.errors.append(
                            f"{prog_file_name} row {i}: duplicate program '{prog_name}' "
                            f"({study_level}, {fld}) for university '{uni_name}'"
                        )
                    else:
                        seen_prog_identities.add(identity)

                if norm_uni and uni_headers_ok:
                    if norm_uni not in res.uni_name_country_map:
                        res.errors.append(
                            f"{prog_file_name} row {i}: program references unknown university '{uni_name}'"
                        )

                validate_numeric(row.get("duration_months"), i, prog_file_name,
                                  "duration_months", strict_int_parser, res.errors)
                validate_numeric(row.get("tuition_fee_usd"), i, prog_file_name,
                                  "tuition_fee_usd", strict_int_parser, res.errors)
                validate_numeric(row.get("min_cgpa"), i, prog_file_name,
                                  "min_cgpa", finite_float_parser, res.errors)
                validate_numeric(row.get("min_ielts"), i, prog_file_name,
                                  "min_ielts", finite_float_parser, res.errors)
                validate_numeric(row.get("min_gre"), i, prog_file_name,
                                  "min_gre", strict_int_parser, res.errors)

                check_url(row.get("course_page_url"), i, prog_file_name,
                           "course_page_url", res.warnings)

                if not missing_req:
                    res.valid_prog_count += 1
                    res.valid_progs.append(row)

    # 3. Check for cross-country name ambiguity
    for norm_name, countries in res.uni_name_country_map.items():
        if len(countries) > 1:
            res.warnings.append(
                f"University name '{norm_name}' exists in multiple countries "
                f"({', '.join(countries)}). Program mapping may be ambiguous."
            )

    return res

# ---------------------------------------------------------------------------
# --validate-only entry point (Phase 5A-1 behavior preserved exactly)
# ---------------------------------------------------------------------------
def run_validation(SCRIPT_DIR, uni_csv, prog_csv):
    res = parse_and_validate_csvs(SCRIPT_DIR, uni_csv, prog_csv)

    if res.errors:
        print("\nERRORS")
        for idx, e in enumerate(res.errors, 1):
            print(f"{idx}. {e}")

    if res.warnings:
        print("\nWARNINGS")
        for idx, w in enumerate(res.warnings, 1):
            print(f"{idx}. {w}")

    print("\n" + "="*40)
    print("VALIDATION SUMMARY")
    print("="*40)
    print(f"Universities CSV rows inspected: {res.uni_rows_inspected}")
    print(f"Programs CSV rows inspected: {res.prog_rows_inspected}")
    print(f"University records with required identity fields: {res.valid_uni_count}")
    print(f"Program records with required identity fields: {res.valid_prog_count}")
    print(f"Number of blocking errors: {len(res.errors)}")
    print(f"Number of warnings: {len(res.warnings)}")

    if res.errors:
        print("Final result: FAILED")
        sys.exit(1)
    else:
        print("Final result: PASSED")
        sys.exit(0)

# ---------------------------------------------------------------------------
# Field comparison helper for dry-run
# ---------------------------------------------------------------------------
def compare_field(field_name, db_val, csv_str, parser=None, is_url=False,
                  is_email=False, is_text=False):
    """
    Compare a single field between the database document and the CSV row.

    Returns:
        (is_actionable_diff, db_display, csv_display, is_preserve_only)

    Blank CSV rules:
      - CSV blank + DB blank/None  -> no difference, no preserve
      - CSV blank + DB populated   -> preserve only (not an actionable diff)
    Populated CSV rules:
      - CSV populated + DB blank   -> actionable difference
      - CSV populated + DB differs -> actionable difference
      - CSV populated + DB equal   -> no difference
    """
    csv_is_blank = csv_str is None or (isinstance(csv_str, str) and csv_str.strip() == "")

    if csv_is_blank:
        db_is_blank = (
            db_val is None
            or db_val == ""
            or (isinstance(db_val, list) and len(db_val) == 0)
        )
        if db_is_blank:
            return False, None, None, False
        else:
            return False, safe_display(db_val), "<blank>", True

    # CSV is populated beyond here
    csv_clean = csv_str.strip()

    # --- Numeric fields ---
    if parser is not None:
        try:
            csv_parsed = parser(csv_clean)
        except Exception:
            # Malformed CSV numeric (should have been caught by validation, but be safe)
            return True, safe_display(db_val), safe_display(csv_clean), False

        if isinstance(csv_parsed, float):
            # Float comparison
            db_float, db_ok = safe_db_float(db_val)
            if not db_ok:
                return True, "<invalid DB value>", safe_display(csv_parsed), False
            if db_float is None:
                return True, "None", safe_display(csv_parsed), False
            if not math.isclose(db_float, csv_parsed, rel_tol=1e-9, abs_tol=1e-9):
                return True, safe_display(db_float), safe_display(csv_parsed), False
            return False, None, None, False
        else:
            # Integer comparison
            db_int, db_ok = safe_db_int(db_val)
            if not db_ok:
                return True, "<invalid DB value>", safe_display(csv_parsed), False
            if db_int is None:
                return True, "None", safe_display(csv_parsed), False
            if db_int != csv_parsed:
                return True, safe_display(db_int), safe_display(csv_parsed), False
            return False, None, None, False

    # --- URL fields ---
    if is_url:
        db_str = "" if db_val is None else (db_val if isinstance(db_val, str) else "")
        norm_db = normalize_url_for_comparison(db_str)
        norm_csv = normalize_url_for_comparison(csv_clean)
        if norm_db != norm_csv:
            return True, safe_display(db_val), safe_display(csv_clean), False
        return False, None, None, False

    # --- Email fields ---
    if is_email:
        db_str = "" if db_val is None else (db_val if isinstance(db_val, str) else str(db_val))
        if db_str.strip().casefold() != csv_clean.casefold():
            return True, safe_display(db_str.strip()), safe_display(csv_clean), False
        return False, None, None, False

    # --- Text fields ---
    if is_text:
        db_str = "" if db_val is None else (db_val if isinstance(db_val, str) else str(db_val))
        if db_str.strip() != csv_clean:
            return True, safe_display(db_str.strip()), safe_display(csv_clean), False
        return False, None, None, False

    # --- Generic fallback ---
    db_str = "" if db_val is None else str(db_val)
    if db_str != csv_clean:
        return True, safe_display(db_str), safe_display(csv_clean), False
    return False, None, None, False

# ---------------------------------------------------------------------------
# --dry-run entry point: direct Motor read-only comparison
# ---------------------------------------------------------------------------
async def run_dry_run_comparison(SCRIPT_DIR, uni_csv, prog_csv):
    import os
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    load_dotenv(SCRIPT_DIR.parent / ".env")

    # Correction 1: mandatory config - no fallback values
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME")

    if not mongodb_url or not mongodb_url.strip():
        print("ERROR: MongoDB configuration is missing for dry-run comparison.")
        sys.exit(1)
    if not database_name or not database_name.strip():
        print("ERROR: MongoDB configuration is missing for dry-run comparison.")
        sys.exit(1)

    print("\nDRY RUN - NO APPLICATION DATA WAS WRITTEN")
    print("  Direct Motor read path used.")
    print("  Beanie initialization was not called.")
    print("  No MongoDB write command was issued.")
    print("  Note: Beanie init (not called here) may create indexes as metadata.")
    print("\nParsing and validating CSVs...")

    res = parse_and_validate_csvs(SCRIPT_DIR, uni_csv, prog_csv)

    print("\n" + "="*40)
    print("DRY RUN INPUT SUMMARY")
    print("="*40)
    print(f"Universities CSV rows inspected: {res.uni_rows_inspected}")
    print(f"Programs CSV rows inspected: {res.prog_rows_inspected}")
    print(f"Blocking validation errors: {len(res.errors)}")
    print(f"Validation warnings: {len(res.warnings)}")

    if res.errors:
        print("\nERROR: Blocking validation errors found. "
              "Please run --validate-only to see full details.")
        sys.exit(1)

    print("\nConnecting to MongoDB for read-only comparison...")

    # Correction 2: safe client lifecycle
    client = None
    comparison_succeeded = False

    try:
        client = AsyncIOMotorClient(
            mongodb_url,
            uuidRepresentation="standard",
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command("ping")

        db = client[database_name]
        coll = db["universities"]
        db_unis = await coll.find({}).to_list(length=None)

        malformed_db_unis = 0
        malformed_db_progs = 0
        duplicate_identity_count = 0

        db_uni_index = {}

        for doc in db_unis:
            if not isinstance(doc, dict):
                malformed_db_unis += 1
                continue

            name = doc.get("university_name")
            country = doc.get("country")

            n_name = normalize_identity_text(name)
            n_country = normalize_identity_text(country)

            if not n_name or not n_country:
                malformed_db_unis += 1
                continue

            ident = f"{n_name}|{n_country}"

            if ident not in db_uni_index:
                db_uni_index[ident] = []
            db_uni_index[ident].append(doc)

            # Count and validate embedded programs for reporting
            progs_raw = doc.get("programs")
            if progs_raw is None:
                pass
            elif not isinstance(progs_raw, list):
                malformed_db_progs += 1
            else:
                for p in progs_raw:
                    if not isinstance(p, dict):
                        malformed_db_progs += 1
                        continue
                    pn = normalize_identity_text(p.get("program_name"))
                    sl = normalize_identity_text(p.get("study_level"))
                    fld = normalize_identity_text(p.get("field"))
                    if not pn or not sl or not fld:
                        malformed_db_progs += 1

        for docs in db_uni_index.values():
            if len(docs) > 1:
                duplicate_identity_count += 1

        print("\n" + "="*40)
        print("DATABASE READ SUMMARY")
        print("="*40)
        print(f"University documents read: {len(db_unis)}")
        print(f"Malformed university documents skipped: {malformed_db_unis}")
        print(f"Duplicate database university identities: {duplicate_identity_count}")
        print(f"Malformed embedded programs skipped: {malformed_db_progs}")

        # --- University comparison ---
        new_uni = 0
        exist_exact_uni = 0
        exist_diff_uni = 0
        ambiguous_uni = 0

        uni_diff_reports = []
        uni_preserve_reports = []

        for row in res.valid_unis:
            name = row.get("university_name", "")
            country = row.get("country", "")
            n_name = normalize(name)
            n_country = normalize(country)
            ident = f"{n_name}|{n_country}"

            docs = db_uni_index.get(ident, [])
            if len(docs) == 0:
                new_uni += 1
            elif len(docs) > 1:
                ambiguous_uni += 1
            else:
                doc = docs[0]
                diffs = []
                preserves = []

                fields_to_check = [
                    ("city",               False, False, True,  None),
                    ("continent",          False, False, True,  None),
                    ("qs_ranking",         False, False, False, strict_int_parser),
                    ("acceptance_rate",    False, False, False, finite_float_parser),
                    ("yearly_tuition_usd", False, False, False, strict_int_parser),
                    ("website",            True,  False, False, None),
                    ("admissions_url",     True,  False, False, None),
                    ("admissions_email",   False, True,  False, None),
                    ("description",        False, False, True,  None),
                ]

                for f, is_url, is_email, is_text, parser in fields_to_check:
                    c_val = row.get(f, "")
                    d_val = doc.get(f)
                    is_diff, db_disp, csv_disp, is_preserve = compare_field(
                        f, d_val, c_val, parser, is_url, is_email, is_text
                    )
                    if is_diff:
                        diffs.append(f"     - {f}: DB={db_disp}, CSV={csv_disp}")
                    if is_preserve:
                        preserves.append(f"     - {f}: DB={db_disp}, CSV={csv_disp}")

                if diffs:
                    exist_diff_uni += 1
                    uni_diff_reports.append(
                        f"  -> '{name}' ({country}):\n" + "\n".join(diffs)
                    )
                else:
                    exist_exact_uni += 1

                if preserves:
                    uni_preserve_reports.append(
                        f"  -> '{name}' ({country}):\n" + "\n".join(preserves)
                    )

        print("\n" + "="*40)
        print("UNIVERSITY COMPARISON")
        print("="*40)
        print(f"NEW UNIVERSITY: {new_uni}")
        print(f"EXISTING - EXACT MATCH: {exist_exact_uni}")
        print(f"EXISTING - DIFFERENT FIELDS: {exist_diff_uni}")
        print(f"AMBIGUOUS DATABASE MATCH: {ambiguous_uni}")

        if uni_diff_reports:
            print("\nDetailed actionable differences:")
            for rep in uni_diff_reports:
                print(rep)

        if uni_preserve_reports:
            print("\nDB VALUE PRESERVED - CSV IS BLANK:")
            for rep in uni_preserve_reports:
                print(rep)

        # --- Program comparison ---
        new_prog_parent_new = 0
        new_prog = 0
        exist_exact_prog = 0
        exist_diff_prog = 0
        ambig_db_prog = 0
        ambig_parent = 0

        prog_diff_reports = []
        prog_preserve_reports = []

        for row in res.valid_progs:
            uni_name = row.get("university_name", "")
            prog_name = row.get("program_name", "")
            study_level = row.get("study_level", "")
            fld = row.get("field", "")

            n_uni = normalize(uni_name)
            n_prog = normalize(prog_name)
            n_level = normalize(study_level)
            n_field = normalize(fld)

            countries = res.uni_name_country_map.get(n_uni, set())
            if len(countries) > 1:
                ambig_parent += 1
                continue
            elif len(countries) == 0:
                continue

            n_country = list(countries)[0]
            parent_ident = f"{n_uni}|{n_country}"

            if parent_ident not in db_uni_index:
                new_prog_parent_new += 1
                continue

            docs = db_uni_index[parent_ident]
            if len(docs) > 1:
                ambig_parent += 1
                continue

            parent_doc = docs[0]
            progs_raw = parent_doc.get("programs")
            if not isinstance(progs_raw, list):
                # No valid programs list - count as new program
                new_prog += 1
                continue

            matched_db_progs = []
            for p in progs_raw:
                if not isinstance(p, dict):
                    continue
                pn = normalize_identity_text(p.get("program_name"))
                sl = normalize_identity_text(p.get("study_level"))
                pf = normalize_identity_text(p.get("field"))
                if pn == n_prog and sl == n_level and pf == n_field:
                    matched_db_progs.append(p)

            if len(matched_db_progs) == 0:
                new_prog += 1
            elif len(matched_db_progs) > 1:
                ambig_db_prog += 1
            else:
                db_p = matched_db_progs[0]
                diffs = []
                preserves = []

                prog_fields_to_check = [
                    ("duration_months", False, False, False, strict_int_parser),
                    ("tuition_fee_usd", False, False, False, strict_int_parser),
                    ("min_cgpa",        False, False, False, finite_float_parser),
                    ("min_ielts",       False, False, False, finite_float_parser),
                    ("min_gre",         False, False, False, strict_int_parser),
                    ("course_page_url", True,  False, False, None),
                    ("deadline",        False, False, True,  None),
                ]

                for f, is_url, is_email, is_text, parser in prog_fields_to_check:
                    c_val = row.get(f, "")
                    d_val = db_p.get(f)
                    is_diff, db_disp, csv_disp, is_preserve = compare_field(
                        f, d_val, c_val, parser, is_url, is_email, is_text
                    )
                    if is_diff:
                        diffs.append(f"     - {f}: DB={db_disp}, CSV={csv_disp}")
                    if is_preserve:
                        preserves.append(f"     - {f}: DB={db_disp}, CSV={csv_disp}")

                if diffs:
                    exist_diff_prog += 1
                    prog_diff_reports.append(
                        f"  -> '{prog_name}' at '{uni_name}':\n" + "\n".join(diffs)
                    )
                else:
                    exist_exact_prog += 1

                if preserves:
                    prog_preserve_reports.append(
                        f"  -> '{prog_name}' at '{uni_name}':\n" + "\n".join(preserves)
                    )

        print("\n" + "="*40)
        print("PROGRAM COMPARISON")
        print("="*40)
        print(f"NEW PROGRAM - PARENT UNIVERSITY IS NEW: {new_prog_parent_new}")
        print(f"NEW PROGRAM: {new_prog}")
        print(f"EXISTING - EXACT MATCH: {exist_exact_prog}")
        print(f"EXISTING - DIFFERENT FIELDS: {exist_diff_prog}")
        print(f"AMBIGUOUS DATABASE PROGRAM MATCH: {ambig_db_prog}")
        print(f"AMBIGUOUS PARENT UNIVERSITY: {ambig_parent}")

        if prog_diff_reports:
            print("\nDetailed actionable differences:")
            for rep in prog_diff_reports[:50]:
                print(rep)
            if len(prog_diff_reports) > 50:
                print(f"... and {len(prog_diff_reports) - 50} more differences.")

        if prog_preserve_reports:
            print("\nDB VALUE PRESERVED - CSV IS BLANK:")
            for rep in prog_preserve_reports[:50]:
                print(rep)
            if len(prog_preserve_reports) > 50:
                print(f"... and {len(prog_preserve_reports) - 50} more preserves.")

        comparison_succeeded = True

    except Exception:
        # Correction 3: no raw exception text printed
        print("ERROR: Unable to connect to MongoDB for dry-run comparison.")
        sys.exit(1)
    finally:
        if client is not None:
            client.close()

    if comparison_succeeded:
        print("\n" + "="*40)
        print("FINAL SAFETY SUMMARY")
        print("="*40)
        print("DRY RUN PASSED")
        print("No application-data write command was issued.")
        print("Beanie initialization was not called.")
        print("Motor client closed.")

    sys.exit(0)

# ---------------------------------------------------------------------------
# main()
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Seed universities from CSV")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true",
                       help="Compare CSVs against MongoDB without writing")
    group.add_argument("--validate-only", action="store_true",
                       help="Validate CSVs without DB access")
    parser.add_argument("--csv-dir", type=str, default="data",
                        help="Directory containing CSV files")
    args = parser.parse_args()

    SCRIPT_DIR = Path(__file__).resolve().parent
    data_dir = SCRIPT_DIR / args.csv_dir
    uni_csv = data_dir / "universities_sample.csv"
    prog_csv = data_dir / "programs_sample.csv"

    if not uni_csv.exists() or not prog_csv.exists():
        print(f"ERROR: Could not find CSVs in {data_dir}")
        if args.validate_only or args.dry_run:
            sys.exit(1)
        return

    if args.validate_only:
        run_validation(SCRIPT_DIR, uni_csv, prog_csv)
        return

    if args.dry_run:
        asyncio.run(run_dry_run_comparison(SCRIPT_DIR, uni_csv, prog_csv))
        return

    # --- Live seed path (unchanged) ---
    sys.path.append(str(SCRIPT_DIR))
    from constants import ALL_DESTINATIONS

    print(f"Loading programs from {prog_csv.name}...")
    programs_by_uni = {}
    total_programs_parsed = 0

    with open(prog_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            uni_name = row["university_name"].strip()
            if uni_name not in programs_by_uni:
                programs_by_uni[uni_name] = []

            p_entry = {
                "program_name": safe_str(row.get("program_name")),
                "study_level": safe_str(row.get("study_level")),
                "field": safe_str(row.get("field")),
                "duration_months": safe_int(row.get("duration_months")),
                "tuition_fee_usd": safe_int(row.get("tuition_fee_usd")),
                "min_cgpa": safe_float(row.get("min_cgpa")),
                "min_ielts": safe_float(row.get("min_ielts")),
                "min_gre": safe_int(row.get("min_gre")),
                "course_page_url": safe_str(row.get("course_page_url")),
                "deadline": safe_str(row.get("deadline"))
            }
            programs_by_uni[uni_name].append(p_entry)
            total_programs_parsed += 1

    print(f"Loading universities from {uni_csv.name}...")
    universities_data = []
    seen_unis = set()
    invalid_countries = set()
    missing_fields_count = 0
    duplicates_count = 0
    total_unis_parsed = 0

    with open(uni_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_unis_parsed += 1
            uni_name = safe_str(row.get("university_name"))
            country = safe_str(row.get("country"))

            if not uni_name or not country:
                missing_fields_count += 1
                continue

            if uni_name in seen_unis:
                duplicates_count += 1
                continue

            if country not in ALL_DESTINATIONS:
                invalid_countries.add(country)

            seen_unis.add(uni_name)

            uni_programs = programs_by_uni.get(uni_name, [])
            study_levels = sorted(list(set(
                p["study_level"] for p in uni_programs if p["study_level"]
            )))
            fields = sorted(list(set(
                p["field"] for p in uni_programs if p["field"]
            )))

            uni_dict = {
                "university_name": uni_name,
                "country": country,
                "city": safe_str(row.get("city")),
                "continent": safe_str(row.get("continent")),
                "qs_ranking": safe_int(row.get("qs_ranking")),
                "acceptance_rate": safe_float(row.get("acceptance_rate")),
                "yearly_tuition_usd": safe_int(row.get("yearly_tuition_usd")),
                "website": safe_str(row.get("website")),
                "admissions_url": safe_str(row.get("admissions_url")),
                "admissions_email": safe_str(row.get("admissions_email")),
                "description": safe_str(row.get("description")),
                "programs": uni_programs,
                "study_levels": study_levels,
                "fields": fields,
                "is_active": True
            }
            universities_data.append(uni_dict)

    print("Executing DB Seed...")
    created, skipped, total = asyncio.run(run_db_seed(universities_data))
    print("\n" + "="*40)
    print("Seed Summary")
    print("="*40)
    print(f"Created: {created}")
    print(f"Skipped: {skipped}")
    print(f"Total in DB: {total}")

if __name__ == "__main__":
    main()