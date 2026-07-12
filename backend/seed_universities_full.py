"""
seed_universities_full.py
─────────────────────────
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
from urllib.parse import urlparse
import math
from decimal import Decimal, InvalidOperation

# Move all DB logic to a function to avoid executing on import
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

def safe_int(val):
    if not val or val.strip() == "":
        return None
    try:
        return int(float(val.strip()))
    except:
        return None

def safe_float(val):
    if not val or val.strip() == "":
        return None
    try:
        return float(val.strip())
    except:
        return None

def safe_str(val):
    if not val or val.strip() == "":
        return None
    return val.strip()

def normalize(val):
    if not val:
        return ""
    return " ".join(val.strip().split()).casefold()

def check_url(url_val, row_num, file_name, field_name, warnings):
    if not url_val or not url_val.strip():
        return
    url_val = url_val.strip()
    parsed = urlparse(url_val)
    if not parsed.scheme or not parsed.netloc:
        warnings.append(f"{file_name} row {row_num}: URL has no valid scheme or hostname for '{field_name}': '{url_val}'")
    elif parsed.scheme == "http":
        warnings.append(f"{file_name} row {row_num}: URL uses HTTP instead of HTTPS for '{field_name}': '{url_val}'")

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
        errors.append(f"{file_name} row {row_num}: invalid numeric value for '{field_name}': '{val}'")

def run_validation(SCRIPT_DIR, uni_csv, prog_csv):
    sys.path.append(str(SCRIPT_DIR))
    from constants import ALL_DESTINATIONS

    errors = []
    warnings = []

    uni_rows_inspected = 0
    prog_rows_inspected = 0
    valid_uni_count = 0
    valid_prog_count = 0

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
    uni_name_country_map = {} # norm(name) -> set of norm(country)
    seen_uni_identities = set() # norm(name) + norm(country)

    uni_headers_ok = True
    uni_file_name = uni_csv.name
    try:
        with open(uni_csv, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                errors.append(f"{uni_file_name}: file is empty or missing headers")
                uni_headers_ok = False
            else:
                for req in exp_uni_headers:
                    if req not in headers:
                        errors.append(f"{uni_file_name}: missing required header '{req}'")
                        uni_headers_ok = False
    except Exception as e:
        errors.append(f"Failed to read {uni_file_name}: {e}")
        uni_headers_ok = False

    if uni_headers_ok:
        with open(uni_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=2):
                uni_rows_inspected += 1
                name = row.get("university_name", "")
                country = row.get("country", "")

                missing_req = False
                if not name or not name.strip():
                    errors.append(f"{uni_file_name} row {i}: missing required field 'university_name'")
                    missing_req = True
                if not country or not country.strip():
                    errors.append(f"{uni_file_name} row {i}: missing required field 'country'")
                    missing_req = True

                norm_name = normalize(name)
                norm_country = normalize(country)

                if norm_name and norm_country:
                    identity = f"{norm_name}|{norm_country}"
                    if identity in seen_uni_identities:
                        errors.append(f"{uni_file_name} row {i}: duplicate university '{name}' in '{country}'")
                    else:
                        seen_uni_identities.add(identity)
                        if norm_name not in uni_name_country_map:
                            uni_name_country_map[norm_name] = set()
                        uni_name_country_map[norm_name].add(norm_country)

                if country and country.strip() not in ALL_DESTINATIONS:
                    errors.append(f"{uni_file_name} row {i}: invalid country '{country}'")

                validate_numeric(row.get("qs_ranking"), i, uni_file_name, "qs_ranking", strict_int_parser, errors)
                validate_numeric(row.get("acceptance_rate"), i, uni_file_name, "acceptance_rate", finite_float_parser, errors)
                validate_numeric(row.get("yearly_tuition_usd"), i, uni_file_name, "yearly_tuition_usd", strict_int_parser, errors)

                check_url(row.get("website"), i, uni_file_name, "website", warnings)
                check_url(row.get("admissions_url"), i, uni_file_name, "admissions_url", warnings)

                if not missing_req:
                    valid_uni_count += 1

    # 2. Validate programs
    prog_file_name = prog_csv.name
    seen_prog_identities = set()

    prog_headers_ok = True
    try:
        with open(prog_csv, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                errors.append(f"{prog_file_name}: file is empty or missing headers")
                prog_headers_ok = False
            else:
                for req in exp_prog_headers:
                    if req not in headers:
                        errors.append(f"{prog_file_name}: missing required header '{req}'")
                        prog_headers_ok = False
    except Exception as e:
        errors.append(f"Failed to read {prog_file_name}: {e}")
        prog_headers_ok = False

    if prog_headers_ok: # only proceed if headers are valid
        with open(prog_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=2):
                prog_rows_inspected += 1
                uni_name = row.get("university_name", "")
                prog_name = row.get("program_name", "")
                study_level = row.get("study_level", "")
                field = row.get("field", "")

                missing_req = False
                if not uni_name or not uni_name.strip():
                    errors.append(f"{prog_file_name} row {i}: missing required field 'university_name'")
                    missing_req = True
                if not prog_name or not prog_name.strip():
                    errors.append(f"{prog_file_name} row {i}: missing required field 'program_name'")
                    missing_req = True
                if not study_level or not study_level.strip():
                    errors.append(f"{prog_file_name} row {i}: missing required field 'study_level'")
                    missing_req = True
                if not field or not field.strip():
                    errors.append(f"{prog_file_name} row {i}: missing required field 'field'")
                    missing_req = True

                norm_uni = normalize(uni_name)
                norm_prog = normalize(prog_name)
                norm_level = normalize(study_level)
                norm_field = normalize(field)

                if norm_uni and norm_prog and norm_level and norm_field:
                    identity = f"{norm_uni}|{norm_prog}|{norm_level}|{norm_field}"
                    if identity in seen_prog_identities:
                        errors.append(f"{prog_file_name} row {i}: duplicate program '{prog_name}' ({study_level}, {field}) for university '{uni_name}'")
                    else:
                        seen_prog_identities.add(identity)

                if norm_uni and uni_headers_ok:
                    if norm_uni not in uni_name_country_map:
                        errors.append(f"{prog_file_name} row {i}: program references unknown university '{uni_name}'")

                validate_numeric(row.get("duration_months"), i, prog_file_name, "duration_months", strict_int_parser, errors)
                validate_numeric(row.get("tuition_fee_usd"), i, prog_file_name, "tuition_fee_usd", strict_int_parser, errors)
                validate_numeric(row.get("min_cgpa"), i, prog_file_name, "min_cgpa", finite_float_parser, errors)
                validate_numeric(row.get("min_ielts"), i, prog_file_name, "min_ielts", finite_float_parser, errors)
                validate_numeric(row.get("min_gre"), i, prog_file_name, "min_gre", strict_int_parser, errors)

                check_url(row.get("course_page_url"), i, prog_file_name, "course_page_url", warnings)

                if not missing_req:
                    valid_prog_count += 1

    # 3. Check for cross-country name ambiguity
    for norm_name, countries in uni_name_country_map.items():
        if len(countries) > 1:
            warnings.append(f"University name '{norm_name}' exists in multiple countries ({', '.join(countries)}). Program mapping may be ambiguous.")

    # 4. Print Summary
    if errors:
        print("\nERRORS")
        for idx, e in enumerate(errors, 1):
            print(f"{idx}. {e}")

    if warnings:
        print("\nWARNINGS")
        for idx, w in enumerate(warnings, 1):
            print(f"{idx}. {w}")

    print("\n" + "="*40)
    print("VALIDATION SUMMARY")
    print("="*40)
    print(f"Universities CSV rows inspected: {uni_rows_inspected}")
    print(f"Programs CSV rows inspected: {prog_rows_inspected}")
    print(f"University records with required identity fields: {valid_uni_count}")
    print(f"Program records with required identity fields: {valid_prog_count}")
    print(f"Number of blocking errors: {len(errors)}")
    print(f"Number of warnings: {len(warnings)}")

    if errors:
        print("Final result: FAILED")
        sys.exit(1)
    else:
        print("Final result: PASSED")
        sys.exit(0)


def main():
    parser = argparse.ArgumentParser(description="Seed universities from CSV")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true", help="Print actions without modifying DB")
    group.add_argument("--validate-only", action="store_true", help="Validate CSVs without DB access")
    parser.add_argument("--csv-dir", type=str, default="data", help="Directory containing CSV files")
    args = parser.parse_args()

    SCRIPT_DIR = Path(__file__).resolve().parent
    data_dir = SCRIPT_DIR / args.csv_dir
    uni_csv = data_dir / "universities_sample.csv"
    prog_csv = data_dir / "programs_sample.csv"

    if not uni_csv.exists() or not prog_csv.exists():
        print(f"ERROR: Could not find CSVs in {data_dir}")
        if args.validate_only:
            sys.exit(1)
        return

    if args.validate_only:
        run_validation(SCRIPT_DIR, uni_csv, prog_csv)
        return
        
    # Import validation constants
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
            study_levels = sorted(list(set(p["study_level"] for p in uni_programs if p["study_level"])))
            fields = sorted(list(set(p["field"] for p in uni_programs if p["field"])))
            
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

    if args.dry_run:
        print("\n" + "="*40)
        print("DRY RUN SUMMARY")
        print("="*40)
        print(f"Universities parsed: {total_unis_parsed}")
        print(f"Programs parsed: {total_programs_parsed}")
        print(f"Valid universities grouped: {len(universities_data)}")
        print(f"Duplicates skipped: {duplicates_count}")
        print(f"Missing required fields: {missing_fields_count}")
        if invalid_countries:
            print(f"[!] Invalid countries found: {', '.join(invalid_countries)}")
        else:
            print("[OK] All countries valid.")
        print("\n[OK] DRY RUN PASSED (No DB changes made)")
        return

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
