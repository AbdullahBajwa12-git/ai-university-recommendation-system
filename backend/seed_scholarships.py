"""Idempotent demo seed for scholarships.

Creates a set of realistic demo scholarships only if a scholarship with the
same title does not already exist. Safe to run multiple times — nothing is
deleted or overwritten.

Usage (inside the backend container, from /app):
    python seed_scholarships.py
"""
import asyncio
from pymongo import AsyncMongoClient
from beanie import init_beanie
from database import MONGODB_URL, DATABASE_NAME
import models

SCHOLARSHIPS = [
    {
        "title": "Lester B. Pearson International Scholarship",
        "provider": "University of Toronto", "university_name": "University of Toronto",
        "country": "Canada", "level": "Undergraduate", "field_of_study": "Any",
        "funding_type": "Fully Funded", "amount": "Full tuition + living (4 years)",
        "deadline": "2026-11-30", "eligibility": "Exceptional international students in final year of secondary school.",
        "apply_url": "https://future.utoronto.ca/pearson/",
        "description": "Recognises international students who demonstrate exceptional academic achievement and creativity.",
    },
    {
        "title": "Knight-Hennessy Scholars",
        "provider": "Stanford University", "university_name": "Stanford University",
        "country": "USA", "level": "Graduate", "field_of_study": "Any",
        "funding_type": "Fully Funded", "amount": "Full tuition + stipend",
        "deadline": "2026-10-08", "eligibility": "Applicants to any Stanford graduate program.",
        "apply_url": "https://knight-hennessy.stanford.edu/",
        "description": "A fully funded graduate scholarship building a community of future global leaders.",
    },
    {
        "title": "DAAD Study Scholarship",
        "provider": "DAAD", "university_name": "Various German Universities",
        "country": "Germany", "level": "Graduate", "field_of_study": "Any",
        "funding_type": "Fully Funded", "amount": "€934/month + allowances",
        "deadline": "2026-07-31", "eligibility": "International graduates seeking a Master's in Germany.",
        "apply_url": "https://www.daad.de/en/",
        "description": "Monthly stipend for international students pursuing a Master's degree in Germany.",
    },
    {
        "title": "Erasmus Mundus Joint Masters Scholarship",
        "provider": "European Commission", "university_name": "Multi-institutional (EU)",
        "country": "Europe", "level": "Graduate", "field_of_study": "Any",
        "funding_type": "Fully Funded", "amount": "Tuition + travel + living",
        "deadline": "2027-01-15", "eligibility": "Students admitted to an Erasmus Mundus Joint Master.",
        "apply_url": "https://erasmus-plus.ec.europa.eu/",
        "description": "Prestigious EU-funded scholarships for joint master's programmes across Europe.",
    },
    {
        "title": "Chevening Scholarship",
        "provider": "UK Government", "university_name": "Various UK Universities",
        "country": "UK", "level": "Graduate", "field_of_study": "Any",
        "funding_type": "Fully Funded", "amount": "Full tuition + stipend",
        "deadline": "2026-11-05", "eligibility": "Emerging leaders with work experience and a UK master's offer.",
        "apply_url": "https://www.chevening.org/",
        "description": "UK government's global scholarship for one-year master's degrees.",
    },
    {
        "title": "Women in STEM Excellence Award",
        "provider": "Imperial College London", "university_name": "Imperial College London",
        "country": "UK", "level": "Undergraduate", "field_of_study": "STEM",
        "funding_type": "Partial", "amount": "£10,000 per year",
        "deadline": "2026-08-15", "eligibility": "Female students entering a STEM programme.",
        "apply_url": "https://www.imperial.ac.uk/study/fees-and-funding/",
        "description": "Supports and encourages women pursuing science, technology, engineering and maths.",
    },
    {
        "title": "Computer Science Merit Scholarship",
        "provider": "University of Waterloo", "university_name": "University of Waterloo",
        "country": "Canada", "level": "Undergraduate", "field_of_study": "Computer Science",
        "funding_type": "Merit-based", "amount": "CAD 10,000",
        "deadline": "2027-02-01", "eligibility": "High-achieving applicants to Computer Science.",
        "apply_url": "https://uwaterloo.ca/",
        "description": "Merit award for outstanding incoming Computer Science students.",
    },
    {
        "title": "Graduate Research Funding (AI & Data Science)",
        "provider": "ETH Zurich", "university_name": "ETH Zurich",
        "country": "Switzerland", "level": "Graduate", "field_of_study": "Artificial Intelligence",
        "funding_type": "Research Grant", "amount": "Tuition waiver + research stipend",
        "deadline": "2026-12-15", "eligibility": "Research master's/PhD applicants in AI or Data Science.",
        "apply_url": "https://ethz.ch/en/studies.html",
        "description": "Research funding for graduate students working on AI and data science projects.",
    },
    {
        "title": "Need-Based Financial Aid Grant",
        "provider": "National University of Singapore", "university_name": "National University of Singapore",
        "country": "Singapore", "level": "Undergraduate", "field_of_study": "Any",
        "funding_type": "Need-based", "amount": "Up to full tuition",
        "deadline": "2027-03-31", "eligibility": "Admitted students demonstrating financial need.",
        "apply_url": "https://nus.edu.sg/oam/",
        "description": "Financial assistance for students who need support to fund their studies.",
    },
    {
        "title": "Undergraduate Excellence Award",
        "provider": "University of Melbourne", "university_name": "University of Melbourne",
        "country": "Australia", "level": "Undergraduate", "field_of_study": "Any",
        "funding_type": "Merit-based", "amount": "AUD 10,000 (one-off)",
        "deadline": "2026-10-31", "eligibility": "Top international undergraduate applicants.",
        "apply_url": "https://study.unimelb.edu.au/",
        "description": "One-off award recognising academic excellence in incoming undergraduates.",
    },
]


async def seed_scholarships():
    client = AsyncMongoClient(MONGODB_URL, uuidRepresentation="standard")
    await init_beanie(database=client[DATABASE_NAME], document_models=models.ALL_MODELS)

    created = 0
    skipped = 0
    for row in SCHOLARSHIPS:
        existing = await models.Scholarship.find_one(models.Scholarship.title == row["title"])
        if existing:
            skipped += 1
            print(f"Skipped (exists): {row['title']}")
            continue
        await models.Scholarship(**row).insert()
        created += 1
        print(f"Added Scholarship: {row['title']}")

    total = await models.Scholarship.find_all().count()
    print(f"\nDone. Created: {created}, skipped: {skipped}. Total scholarships in DB: {total}.")


if __name__ == "__main__":
    asyncio.run(seed_scholarships())
