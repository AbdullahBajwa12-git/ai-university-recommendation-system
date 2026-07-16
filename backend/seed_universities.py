"""Idempotent demo seed for the University Catalog.

Creates a small set of realistic universities (and the countries they belong to)
only if they do not already exist. Safe to run multiple times: existing
countries and universities are detected by name and skipped — nothing is
deleted or overwritten.

Usage (inside the backend container, from /app):
    python seed_universities.py
"""
import asyncio
from pymongo import AsyncMongoClient
from beanie import init_beanie
from database import MONGODB_URL, DATABASE_NAME
import models

# (university_name, country, city, qs_ranking, website, yearly_tuition_fee_usd, acceptance_rate, description)
UNIVERSITIES = [
    ("Massachusetts Institute of Technology", "USA", "Cambridge", 1, "https://www.mit.edu", 58000, 4.0,
     "World-leading institute renowned for engineering, computer science and research."),
    ("Stanford University", "USA", "Stanford", 3, "https://www.stanford.edu", 56000, 4.0,
     "Private research university at the heart of Silicon Valley, strong in CS and AI."),
    ("University of Toronto", "Canada", "Toronto", 21, "https://www.utoronto.ca", 45000, 43.0,
     "Canada's top-ranked university with strong research output across disciplines."),
    ("University of British Columbia", "Canada", "Vancouver", 34, "https://www.ubc.ca", 42000, 52.0,
     "Major public research university known for its global outlook and campus."),
    ("University of Oxford", "UK", "Oxford", 3, "https://www.ox.ac.uk", 40000, 17.0,
     "One of the oldest and most prestigious universities in the world."),
    ("Imperial College London", "UK", "London", 6, "https://www.imperial.ac.uk", 38000, 14.0,
     "Science, engineering, medicine and business focused university in London."),
    ("Technical University of Munich", "Germany", "Munich", 28, "https://www.tum.de", 0, 8.0,
     "Leading European technical university with low/no tuition for most programs."),
    ("ETH Zurich", "Switzerland", "Zurich", 7, "https://www.ethz.ch", 1500, 27.0,
     "Top-ranked science and technology university in continental Europe."),
    ("University of Melbourne", "Australia", "Melbourne", 13, "https://www.unimelb.edu.au", 35000, 70.0,
     "Australia's leading research university with a broad range of programs."),
    ("National University of Singapore", "Singapore", "Singapore", 8, "https://www.nus.edu.sg", 30000, 5.0,
     "Asia's top university, globally recognised for research and innovation."),
    ("Delft University of Technology", "Netherlands", "Delft", 47, "https://www.tudelft.nl", 20000, 65.0,
     "The largest and oldest Dutch public technical university."),
]


async def seed_universities():
    client = AsyncMongoClient(MONGODB_URL, uuidRepresentation="standard")
    await init_beanie(database=client[DATABASE_NAME], document_models=models.ALL_MODELS)

    created_countries = 0
    created_unis = 0
    skipped_unis = 0

    # Ensure each referenced country exists (idempotent by unique name).
    country_names = sorted({row[1] for row in UNIVERSITIES})
    country_cache = {}
    for name in country_names:
        country = await models.Country.find_one(models.Country.name == name)
        if not country:
            country = models.Country(name=name)
            await country.insert()
            created_countries += 1
            print(f"Added Country: {name}")
        country_cache[name] = country

    # Insert universities only if a university with the same name is absent.
    for (uni_name, country_name, city, rank, website, fee, rate, desc) in UNIVERSITIES:
        existing = await models.University.find_one(models.University.university_name == uni_name)
        if existing:
            skipped_unis += 1
            print(f"Skipped (exists): {uni_name}")
            continue
        await models.University(
            university_name=uni_name,
            country=country_cache[country_name],
            city=city,
            qs_ranking=rank,
            website=website,
            yearly_tuition_fee=fee,
            acceptance_rate=rate,
            description=desc,
        ).insert()
        created_unis += 1
        print(f"Added University: {uni_name}")

    total = await models.University.find_all().count()
    print(
        f"\nDone. Countries created: {created_countries}, "
        f"universities created: {created_unis}, skipped: {skipped_unis}. "
        f"Total universities in DB: {total}."
    )


if __name__ == "__main__":
    asyncio.run(seed_universities())
