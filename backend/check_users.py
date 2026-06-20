import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from database import MONGODB_URL, DATABASE_NAME

async def check():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users = await db['users'].find().to_list(100)
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"Email: {u.get('email')}, Name: {u.get('full_name')}")

if __name__ == "__main__":
    asyncio.run(check())
