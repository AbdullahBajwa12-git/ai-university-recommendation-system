import asyncio
from pymongo import AsyncMongoClient
from bson.dbref import DBRef
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://db:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_university_advisor")

async def migrate():
    print("Starting migration...")
    client = AsyncMongoClient(MONGODB_URL, uuidRepresentation="standard")
    db = client[DATABASE_NAME]

    universities = db["universities"]
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_col_name = f"universities_backup_{timestamp}"
    backup = db[backup_col_name]

    # Backup
    count = await universities.count_documents({})
    print(f"Total universities in collection: {count}")

    if count > 0:
        pipeline = [{"$match": {}}, {"$out": backup_col_name}]
        cursor = await universities.aggregate(pipeline)
        async for _ in cursor: pass
        print(f"Backup created in collection '{backup_col_name}'.")

    migrated_count = 0
    malformed_count = 0
    skipped_count = 0

    async for uni in universities.find({}):
        updates = {}
        unsets = {}

        # 1. Country migration
        country = uni.get("country")
        if isinstance(country, DBRef):
            country_doc = await countries.find_one({"_id": country.id})
            if country_doc and "name" in country_doc:
                updates["country"] = country_doc["name"]
            else:
                print(f"Malformed DBRef in university {uni.get('_id')}: country not found")
                malformed_count += 1
                continue
        elif isinstance(country, dict) and "$ref" in country and "$id" in country:
            country_doc = await countries.find_one({"_id": country["$id"]})
            if country_doc and "name" in country_doc:
                updates["country"] = country_doc["name"]
            else:
                print(f"Malformed DBRef dict in university {uni.get('_id')}: country not found")
                malformed_count += 1
                continue

        # 2. Tuition migration
        if "yearly_tuition_fee" in uni:
            updates["yearly_tuition_usd"] = uni["yearly_tuition_fee"]
            unsets["yearly_tuition_fee"] = ""

        if updates or unsets:
            update_op = {}
            if updates:
                update_op["$set"] = updates
            if unsets:
                update_op["$unset"] = unsets

            await universities.update_one({"_id": uni["_id"]}, update_op)
            migrated_count += 1
        else:
            skipped_count += 1

    print(f"Migration completed.")
    print(f"Migrated: {migrated_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Malformed: {malformed_count}")

if __name__ == "__main__":
    asyncio.run(migrate())
