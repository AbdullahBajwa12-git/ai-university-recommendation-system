import asyncio
import os
from pymongo import AsyncMongoClient
from beanie import init_beanie
from database import MONGODB_URL, DATABASE_NAME
import models

async def seed_data():
    client = AsyncMongoClient(MONGODB_URL)
    await init_beanie(database=client[DATABASE_NAME], document_models=models.ALL_MODELS)

    # 1. Seed Countries
    countries = ["USA", "Canada", "Germany", "UK", "Australia"]
    for c_name in countries:
        if not await models.Country.find_one(models.Country.name == c_name):
            await models.Country(name=c_name).insert()
            print(f"Added Country: {c_name}")

    # 2. Seed Fields
    fields = ["Computer Science", "Data Science", "AI", "Business", "Engineering"]
    for f_name in fields:
        if not await models.FieldOfStudy.find_one(models.FieldOfStudy.name == f_name):
            await models.FieldOfStudy(name=f_name).insert()
            print(f"Added Field: {f_name}")

    # 3. Seed some Universities
    usa = await models.Country.find_one(models.Country.name == "USA")
    if not await models.University.find_one(models.University.university_name == "Stanford University"):
        await models.University(
            university_name="Stanford University",
            country=usa,
            qs_ranking=3,
            website="stanford.edu",
            city="Stanford",
            yearly_tuition_fee=56000,
            acceptance_rate=4.0
        ).insert()
        print("Added University: Stanford")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
