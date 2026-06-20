import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from database import MONGODB_URL, DATABASE_NAME

async def reset():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    await db['users'].drop()
    await db['student_profiles'].drop()
    print("Database users and profiles cleared.")

if __name__ == "__main__":
    asyncio.run(reset())
