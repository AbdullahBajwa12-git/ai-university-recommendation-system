import os
import asyncio
from datetime import datetime
from pymongo import AsyncMongoClient
from dotenv import load_dotenv

async def backup_database():
    print("Starting MongoDB backup process...")
    load_dotenv()

    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "edu_helper")

    print(f"Connecting to {mongo_url}...")
    client = AsyncMongoClient(mongo_url)

    # Ping the server to check connection
    try:
        await client.admin.command('ping')
        print("Connected successfully.")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    db = client[db_name]

    backup_dir = f"backups/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{db_name}_checkpoint"
    os.makedirs(backup_dir, exist_ok=True)

    collections = await db.list_collection_names()
    print(f"Found {len(collections)} collections to backup.")

    import json
    from bson import json_util

    for coll_name in collections:
        print(f"Backing up collection: {coll_name}...")
        collection = db[coll_name]
        cursor = collection.find({})

        docs = await cursor.to_list(length=None)

        file_path = os.path.join(backup_dir, f"{coll_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(json_util.dumps(docs, indent=2))

        print(f"  -> Saved {len(docs)} documents to {file_path}")

    print(f"\nBackup completed successfully! Checkpoint saved in: {backup_dir}")
    print("This backup must be verified before running any migration scripts.")

if __name__ == "__main__":
    asyncio.run(backup_database())
