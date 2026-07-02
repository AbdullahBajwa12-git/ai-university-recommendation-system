"""
seed_universities_full.py
─────────────────────────
Idempotent script to seed universities and their programs into MongoDB.

Usage:
  cd backend
  python seed_universities_full.py --dry-run
  python seed_universities_full.py
"""

import asyncio
import csv
import argparse
from pathlib import Path
import sys

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

def main():
    parser = argparse.ArgumentParser(description="Seed universities from CSV")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without modifying DB")
    parser.add_argument("--csv-dir", type=str, default="data", help="Directory containing CSV files")
    args = parser.parse_args()

    SCRIPT_DIR = Path(__file__).resolve().parent
    data_dir = SCRIPT_DIR / args.csv_dir
    uni_csv = data_dir / "universities_sample.csv"
    prog_csv = data_dir / "programs_sample.csv"

    if not uni_csv.exists() or not prog_csv.exists():
        print(f"❌ Error: Could not find CSVs in {data_dir}")
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
