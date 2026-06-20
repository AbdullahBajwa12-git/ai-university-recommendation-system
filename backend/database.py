import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection string - default to 'db' service for Docker
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://db:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_university_advisor")

# 🚨 BEANIE-MOTOR FIX 🚨
# Beanie 2.1.0 tries to call 'database.client' as if it's a method in newer Motor versions.
# This monkeypatch allows Beanie to function with Motor 3.x.
def patch_motor():
    def client_prop(self):
        return self.delegate.client
    AsyncIOMotorDatabase.client = property(client_prop)

patch_motor()

async def init_db(models: list):
    """
    Initialize Beanie ODM with Motor client and models.
    """
    client = AsyncIOMotorClient(MONGODB_URL, uuidRepresentation='standard')
    await init_beanie(database=client[DATABASE_NAME], document_models=models)
