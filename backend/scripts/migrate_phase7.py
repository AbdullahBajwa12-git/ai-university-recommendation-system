import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db
from models import ALL_MODELS, University, AcademicDomain, CoreProgram, Specialization, UniversityProgram, TuitionInfo, AdmissionReqs

async def migrate_phase7(dry_run=True):
    print(f"Starting Phase 7 Migration {'(DRY RUN)' if dry_run else '(LIVE)'}...")
    load_dotenv()

    # Initialize Beanie
    await init_db(models=ALL_MODELS)

    # 1. Create Default Academic Domain
    domain = await AcademicDomain.find_one(AcademicDomain.name == "General")
    if not domain:
        domain = AcademicDomain(name="General", description="Auto-generated during migration")
        if not dry_run:
            await domain.insert()
        print("Created AcademicDomain: General")

    # 2. Iterate Universities and Extract Programs
    universities = await University.find_all().to_list()
    print(f"Found {len(universities)} universities to migrate.")

    programs_created = 0

    for uni in universities:
        # Assign normalized identity if not exists
        if not uni.normalized_identity:
            uni.normalized_identity = f"{uni.university_name.lower().strip()}|{uni.country.lower().strip()}"
            if not dry_run:
                await uni.save()

        for prog in uni.programs:
            # Create/Find CoreProgram
            core_prog = await CoreProgram.find_one(CoreProgram.canonical_name == prog.program_name)
            if not core_prog:
                core_prog = CoreProgram(
                    domain=domain,
                    canonical_name=prog.program_name,
                    aliases=[prog.program_name]
                )
                if not dry_run:
                    await core_prog.insert()

            # Create/Find Specialization
            spec = await Specialization.find_one(Specialization.name == prog.field)
            if not spec:
                spec = Specialization(
                    core_program=core_prog,
                    name=prog.field,
                    aliases=[prog.field]
                )
                if not dry_run:
                    await spec.insert()

            # Map Admission Requirements
            admission_reqs = AdmissionReqs(
                min_cgpa=prog.min_cgpa,
                min_ielts_overall=prog.min_ielts,
                min_gre=prog.min_gre
            )

            # Map Tuition Info
            tuition_info = TuitionInfo(
                amount=float(prog.tuition_fee_usd) if prog.tuition_fee_usd else 0.0,
                currency="USD",
                amount_usd=float(prog.tuition_fee_usd) if prog.tuition_fee_usd else 0.0
            ) if prog.tuition_fee_usd else None

            # Create UniversityProgram
            new_prog = UniversityProgram(
                university=uni,
                canonical_program=core_prog,
                specialization=spec,
                program_name=prog.program_name,
                degree_level=prog.study_level,
                duration_months=prog.duration_months,
                tuition=tuition_info,
                admission_requirements=admission_reqs,
                course_page_url=prog.course_page_url,
                application_deadline=prog.deadline
            )

            if not dry_run:
                # Upsert to avoid duplicates during repeated runs
                existing = await UniversityProgram.find_one(
                    UniversityProgram.university.id == uni.id,
                    UniversityProgram.canonical_program.id == core_prog.id,
                    UniversityProgram.specialization.id == spec.id,
                    UniversityProgram.degree_level == prog.study_level
                )
                if not existing:
                    await new_prog.insert()
                    programs_created += 1
            else:
                programs_created += 1

    print(f"\nMigration Summary {'(DRY RUN)' if dry_run else '(LIVE)'}:")
    print(f"Universities processed: {len(universities)}")
    print(f"UniversityPrograms generated: {programs_created}")

    if not dry_run:
        print("\nNOTE: Legacy fields (programs, study_levels, fields) were kept on the University model per architectural decision 3. They can be removed in a later pass.")

if __name__ == "__main__":
    dry_run_flag = "--live" not in sys.argv
    asyncio.run(migrate_phase7(dry_run=dry_run_flag))
