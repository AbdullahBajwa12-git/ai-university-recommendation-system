from typing import List, Dict, Any, Tuple
from models import University, UniversityProgram, CoreProgram, Specialization, AcademicDomain, TuitionInfo, AdmissionReqs
import csv

async def load_universities(diff_results: List[Tuple[str, Dict[str, Any]]], version_meta: Dict[str, Any], dry_run: bool):
    """
    Persists universities into MongoDB.
    Expects diff_results to be a list of tuples like ("NEW", row) or ("UPDATE", row).
    """
    new_count = 0
    update_count = 0

    if dry_run:
        for action, row in diff_results:
            if action == "NEW": new_count += 1
            elif action == "UPDATE": update_count += 1
        return new_count, update_count

    for action, row in diff_results:
        if action not in ["NEW", "UPDATE"] or row is None:
            continue

        identity = row.get("normalized_identity")

        if action == "NEW":
            new_count += 1
            u = University(
                university_name=row.get("university_name", "Unknown"),
                country=row.get("country", "Unknown"),
                city=row.get("city"),
                continent=row.get("continent"),
                qs_ranking=row.get("qs_ranking"),
                acceptance_rate=row.get("acceptance_rate"),
                website=row.get("website"),
                data_source=row.get("data_source"),
                normalized_identity=identity,
                source_batch_id=version_meta.get("source_batch_id")
            )
            inserted = await u.insert()
            # Attach extra metadata
            await inserted.update({"$set": version_meta})

        elif action == "UPDATE":
            update_count += 1
            existing = await University.find_one(University.normalized_identity == identity)
            if existing:
                existing.university_name = row.get("university_name", existing.university_name)
                existing.country = row.get("country", existing.country)
                existing.city = row.get("city", existing.city)
                existing.continent = row.get("continent", existing.continent)
                existing.qs_ranking = row.get("qs_ranking", existing.qs_ranking)
                existing.acceptance_rate = row.get("acceptance_rate", existing.acceptance_rate)
                existing.website = row.get("website", existing.website)
                existing.data_source = row.get("data_source", existing.data_source)
                existing.source_batch_id = version_meta.get("source_batch_id", existing.source_batch_id)
                await existing.save()
                await existing.update({"$set": version_meta})

    return new_count, update_count

async def load_programs(diff_results: List[Tuple[str, Dict[str, Any]]], version_meta: Dict[str, Any], dry_run: bool):
    """
    Persists university programs into MongoDB.
    """
    new_count = 0
    update_count = 0

    if dry_run:
        for action, row in diff_results:
            if action == "NEW": new_count += 1
            elif action == "UPDATE": update_count += 1
        return new_count, update_count

    try:
        for action, row in diff_results:
            if action not in ["NEW", "UPDATE"]:
                continue

            uni_identity = row.get("normalized_identity")
            if not uni_identity:
                continue

            u_link = await University.find_one(University.normalized_identity == uni_identity)
            if not u_link:
                raise ValueError(f"University not found for identity {uni_identity}")

            c_link = None
            if row.get("core_program"):
                c_link = await CoreProgram.find_one(CoreProgram.canonical_name == row.get("core_program"))

            s_link = None
            if row.get("specialization"):
                s_link = await Specialization.find_one(Specialization.name == row.get("specialization"))

            if not c_link:
                raise ValueError(f"Core Program not found: {row.get('core_program')}")

            tuition = None
            if row.get("tuition_amount") is not None:
                tuition = TuitionInfo(
                    amount=float(row.get("tuition_amount")),
                    currency=row.get("tuition_currency", "USD"),
                    amount_usd=float(row.get("tuition_amount_usd")) if row.get("tuition_amount_usd") is not None else None,
                    original_amount=float(row.get("original_tuition_amount")) if row.get("original_tuition_amount") is not None else None,
                    original_currency=row.get("original_currency")
                )

            reqs = None
            if row.get("min_cgpa") or row.get("min_ielts") or row.get("min_gre"):
                reqs = AdmissionReqs(
                    min_cgpa=float(row.get("min_cgpa")) if row.get("min_cgpa") else None,
                    min_ielts_overall=float(row.get("min_ielts")) if row.get("min_ielts") else None,
                    min_gre=int(row.get("min_gre")) if row.get("min_gre") else None
                )

            if action == "NEW":
                new_count += 1
                p = UniversityProgram(
                    university=u_link,
                    canonical_program=c_link,
                    specialization=s_link,
                    program_name=row.get("program_name", "Unknown Program"),
                    degree_level=row.get("study_level", "Unknown"),
                    track=row.get("track", "DEFAULT"),
                    duration_months=int(row.get("duration_months")) if row.get("duration_months") else None,
                    tuition=tuition,
                    admission_requirements=reqs,
                    source_batch_id=version_meta.get("source_batch_id"),
                    dataset_version=version_meta.get("dataset_version"),
                    seed_version=version_meta.get("seed_version"),
                    import_timestamp=version_meta.get("import_timestamp")
                )
                inserted = await p.insert()
                await inserted.update({"$set": version_meta})

            elif action == "UPDATE":
                update_count += 1
                query = {
                    "university.$id": u_link.id,
                    "canonical_program.$id": c_link.id,
                    "degree_level": row.get("study_level", "Unknown"),
                    "track": row.get("track", "DEFAULT")
                }
                if s_link:
                    query["specialization.$id"] = s_link.id
                else:
                    query["specialization"] = None

                existing = await UniversityProgram.find_one(query)
                if existing:
                    existing.program_name = row.get("program_name", existing.program_name)
                    existing.duration_months = int(row.get("duration_months")) if row.get("duration_months") else existing.duration_months
                    existing.course_page_url = row.get("course_page_url", existing.course_page_url)
                    existing.tuition = tuition
                    existing.admission_requirements = reqs
                    await existing.save()
                    await existing.update({"$set": version_meta})

    except Exception as e:
        print(f"Transaction safety error in load_programs: {e}")
        raise e

    return new_count, update_count
