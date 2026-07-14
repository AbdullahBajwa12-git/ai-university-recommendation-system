import asyncio
import argparse
import sys
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from .extractor import extract_csv
from .cleaner import clean_row
from .normalizer import normalize_university, normalize_program
from .quality_scorer import score_university, score_program
from .validator import PipelineUniversitySchema, PipelineProgramSchema
from .taxonomy_resolver import resolve_taxonomy, queue_for_manual_review
from .diff_engine import diff_university, diff_program
from .loader import load_universities, load_programs
from database import init_db
from models import ALL_MODELS, University, CoreProgram, Specialization

async def run_pipeline(institutions_csv: str, programs_csv: str, dry_run: bool, dataset_version: str):
    await init_db(models=ALL_MODELS)

    print(f"Starting Phase 7B Seed Pipeline {'(DRY RUN)' if dry_run else '(LIVE)'}")
    print(f"Dataset Version: {dataset_version}")

    version_meta = {
        "seed_version": "v1.5",
        "dataset_version": dataset_version,
        "import_timestamp": datetime.now(timezone.utc).isoformat(),
        "source_batch_id": str(uuid.uuid4())
    }

    # 1. Extractor
    print(f"Extracting {institutions_csv}...")
    raw_unis = []
    if institutions_csv and os.path.exists(institutions_csv):
        raw_unis = list(extract_csv(institutions_csv))

    print(f"Extracting {programs_csv}...")
    raw_progs = []
    if programs_csv and os.path.exists(programs_csv):
        raw_progs = list(extract_csv(programs_csv))

    # 2. Transform & Validate Universities
    valid_unis = []
    errors = []
    uni_map = {} # institution_id -> normalized_identity

    for row in raw_unis:
        cleaned = clean_row(row)
        norm = normalize_university(cleaned)
        norm["data_quality_score"] = score_university(norm)

        if norm["data_quality_score"] < 60:
            errors.append(f"University Quality Below Threshold: {norm.get('university_name')}")
            continue

        try:
            valid_obj = PipelineUniversitySchema(**norm)
            valid_data = valid_obj.model_dump()
            valid_data["normalized_identity"] = norm.get("normalized_identity")
            valid_unis.append(valid_data)
            if "institution_id" in row and "normalized_identity" in valid_data:
                uni_map[row["institution_id"]] = valid_data["normalized_identity"]
        except Exception as e:
            errors.append(f"University Validation Error: {e}")

    # 3. Transform & Validate Programs & Taxonomy
    valid_progs = []
    taxonomy_cache = {} # NEW CACHE PER EXECUTION

    for row in raw_progs:
        cleaned = clean_row(row)
        norm = normalize_program(cleaned)
        norm["data_quality_score"] = score_program(norm)

        if norm["data_quality_score"] < 60:
            errors.append(f"Program Quality Below Threshold: {norm.get('program_name')}")
            continue

        # Institution mapping
        inst_id = row.get("institution_id")
        if inst_id in uni_map:
            norm["normalized_identity"] = uni_map[inst_id]
        else:
            errors.append(f"Program Orphaned (Institution ID missing/invalid): {inst_id}")
            continue

        # Taxonomy resolution
        tax = await resolve_taxonomy(norm.get("field_of_study", ""), taxonomy_cache)
        if tax["status"] in ["UNMATCHED", "AMBIGUOUS"]:
            queue_for_manual_review(row, tax["status"])
            continue

        norm["core_program"] = tax["core_program"]
        if tax.get("specialization"):
            norm["specialization"] = tax["specialization"]

        try:
            # Map core_program explicitly for validator
            norm["core_program_id"] = norm["core_program"]
            valid_obj = PipelineProgramSchema(**norm)
            valid_dict = valid_obj.model_dump()
            valid_dict["normalized_identity"] = norm.get("normalized_identity")
            valid_dict["core_program"] = norm.get("core_program")
            valid_dict["specialization"] = norm.get("specialization")
            valid_progs.append(valid_dict)
        except Exception as e:
            errors.append(f"Program Validation Error: {e}")

    # 4. Diff Engine
    uni_diffs = []
    # Concurrency control via gather natively triggers the inner Semaphore
    async def process_u_diff(u):
        try:
            return await diff_university(u)
        except Exception as e:
            errors.append(f"University Diff Error: {e}")
            return None

    u_results = await asyncio.gather(*(process_u_diff(u) for u in valid_unis))
    uni_diffs = [r for r in u_results if r]

    prog_diffs = []

    # Pre-fetch cache for taxonomy DB IDs
    core_db_map = {}
    spec_db_map = {}
    async for c in CoreProgram.find_all():
        core_db_map[c.canonical_name] = c.id
    async for s in Specialization.find_all(fetch_links=True):
        if hasattr(s, "core_program") and s.core_program:
            spec_db_map[f"{s.core_program.canonical_name}::{s.name}"] = s.id

    async def process_p_diff(p):
        try:
            uni_identity = p.get("normalized_identity")
            u_db = await University.find_one(University.normalized_identity == uni_identity)
            u_id = u_db.id if u_db else None

            cp_id = core_db_map.get(p.get("core_program"))
            sp_id = spec_db_map.get(f"{p.get('core_program')}::{p.get('specialization')}") if p.get("specialization") else None

            if not cp_id:
                return "NEW", p

            return await diff_program(p, u_id, cp_id, sp_id)
        except Exception as e:
            errors.append(f"Program Diff Error: {e}")
            return None

    p_results = await asyncio.gather(*(process_p_diff(p) for p in valid_progs))
    prog_diffs = [r for r in p_results if r]

    # 5. Loader
    new_u, upd_u = 0, 0
    new_p, upd_p = 0, 0
    if not dry_run:
        try:
            new_u, upd_u = await load_universities(uni_diffs, version_meta, dry_run=False)
            new_p, upd_p = await load_programs(prog_diffs, version_meta, dry_run=False)
        except Exception as e:
            errors.append(f"Loader Error: {e}")
    else:
        new_u = sum(1 for d in uni_diffs if d[0] == "NEW")
        upd_u = sum(1 for d in uni_diffs if d[0] == "UPDATE")
        new_p = sum(1 for d in prog_diffs if d[0] == "NEW")
        upd_p = sum(1 for d in prog_diffs if d[0] == "UPDATE")

    # Summary
    print("\n--- Pipeline Summary ---")
    print(f"New Universities: {new_u}")
    print(f"Updated Universities: {upd_u}")
    print(f"New Programs: {new_p}")
    print(f"Updated Programs: {upd_p}")
    print(f"Validation/Pipeline Errors: {len(errors)}")
    for e in errors[:5]:
        print(f" - {e}")
    if len(errors) > 5:
        print(f"   ... and {len(errors)-5} more")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 7B ETL Pipeline")
    parser.add_argument("--institutions", type=str, required=True, help="Institutions CSV")
    parser.add_argument("--programs", type=str, required=True, help="Programs CSV")
    parser.add_argument("--live", action="store_true", help="Execute live writes")
    parser.add_argument("--dataset-version", type=str, default="ds_dev", help="Dataset version tag")
    args = parser.parse_args()

    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    asyncio.run(run_pipeline(
        institutions_csv=args.institutions,
        programs_csv=args.programs,
        dry_run=not args.live,
        dataset_version=args.dataset_version
    ))
