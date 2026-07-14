import csv
import os
import difflib
from typing import Dict, Any, List

from models import CoreProgram, Specialization

FUZZY_THRESHOLD = 0.85

async def resolve_taxonomy(field_of_study: str, cache: Dict[str, Any]) -> Dict[str, Any]:
    """
    Resolves a raw field of study to CoreProgram/Specialization using MongoDB.
    Uses an explicit per-run cache passed as parameter.
    Returns:
        {
            "status": "MATCHED" | "AMBIGUOUS" | "UNMATCHED",
            "core_program": "Name" | None,
            "specialization": "Name" | None
        }
    """
    if not field_of_study:
        return {"status": "UNMATCHED", "core_program": None, "specialization": None}

    field_lower = field_of_study.strip().lower()

    # 0. Check cache
    if field_lower in cache:
        return cache[field_lower]

    # Pre-fetch for the pipeline cache if empty (to avoid unlimited queries)
    if "___ALL_TAXONOMY___" not in cache:
        core_programs = await CoreProgram.find_all().to_list()
        specializations = await Specialization.find_all(fetch_links=True).to_list()

        taxonomy_data = {
            "core_canonicals": {},
            "core_aliases": {},
            "spec_names": {},
            "spec_aliases": {}
        }

        for cp in core_programs:
            name_lower = cp.canonical_name.lower()
            taxonomy_data["core_canonicals"][name_lower] = cp.canonical_name
            for alias in cp.aliases:
                taxonomy_data["core_aliases"][alias.lower()] = cp.canonical_name

        for sp in specializations:
            name_lower = sp.name.lower()
            core_name = sp.core_program.canonical_name if hasattr(sp, 'core_program') and sp.core_program else ""
            taxonomy_data["spec_names"][name_lower] = {"core": core_name, "spec": sp.name}
            for alias in sp.aliases:
                taxonomy_data["spec_aliases"][alias.lower()] = {"core": core_name, "spec": sp.name}

        cache["___ALL_TAXONOMY___"] = taxonomy_data

    tax_data = cache["___ALL_TAXONOMY___"]

    matches = set()
    result = {"status": "UNMATCHED", "core_program": None, "specialization": None}

    def add_core_match(core_name: str):
        if core_name:
            matches.add(f"CORE::{core_name}")

    def add_spec_match(core_name: str, spec_name: str):
        if core_name and spec_name:
            matches.add(f"SPEC::{core_name}::{spec_name}")

    # LEVEL 1: Exact Canonical Match
    if field_lower in tax_data["core_canonicals"]:
        add_core_match(tax_data["core_canonicals"][field_lower])

    # LEVEL 2: Alias Match
    if field_lower in tax_data["core_aliases"]:
        add_core_match(tax_data["core_aliases"][field_lower])

    # LEVEL 3: Specialization Match
    if field_lower in tax_data["spec_names"]:
        info = tax_data["spec_names"][field_lower]
        add_spec_match(info["core"], info["spec"])

    if field_lower in tax_data["spec_aliases"]:
        info = tax_data["spec_aliases"][field_lower]
        add_spec_match(info["core"], info["spec"])

    # LEVEL 4: Controlled Fuzzy Match
    if not matches:
        all_terms = list(tax_data["core_canonicals"].keys()) + \
                    list(tax_data["core_aliases"].keys()) + \
                    list(tax_data["spec_names"].keys()) + \
                    list(tax_data["spec_aliases"].keys())

        fuzzy_matches = difflib.get_close_matches(field_lower, all_terms, n=3, cutoff=FUZZY_THRESHOLD)

        for fm in fuzzy_matches:
            if fm in tax_data["core_canonicals"]:
                add_core_match(tax_data["core_canonicals"][fm])
            elif fm in tax_data["core_aliases"]:
                add_core_match(tax_data["core_aliases"][fm])
            elif fm in tax_data["spec_names"]:
                info = tax_data["spec_names"][fm]
                add_spec_match(info["core"], info["spec"])
            elif fm in tax_data["spec_aliases"]:
                info = tax_data["spec_aliases"][fm]
                add_spec_match(info["core"], info["spec"])

    if len(matches) > 1:
        result["status"] = "AMBIGUOUS"
    elif len(matches) == 1:
        match_str = matches.pop()
        parts = match_str.split("::")
        result["status"] = "MATCHED"
        if parts[0] == "CORE":
            result["core_program"] = parts[1]
        else:
            result["core_program"] = parts[1]
            result["specialization"] = parts[2]

    cache[field_lower] = result
    return result

def queue_for_manual_review(row: Dict[str, Any], status: str, filepath: str = "unmapped_taxonomy_queue.csv"):
    """
    Appends an unmapped or ambiguous row to the manual review queue CSV.
    """
    record = {
        "field_of_study": row.get("field_of_study", ""),
        "program_name": row.get("program_name", ""),
        "institution_id": row.get("institution_id", ""),
        "reason": status
    }
    file_exists = os.path.isfile(filepath)
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["field_of_study", "program_name", "institution_id", "reason"])
        if not file_exists:
            writer.writeheader()
        writer.writerow(record)
