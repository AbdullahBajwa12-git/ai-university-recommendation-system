import os
from pymongo import AsyncMongoClient
from beanie import init_beanie
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection string - default to 'db' service for Docker
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://db:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_university_advisor")

async def init_db(models: list):
    """
    Initialize Beanie ODM with PyMongo Async client and models.
    """
    client = AsyncMongoClient(MONGODB_URL, uuidRepresentation='standard')
    await init_beanie(database=client[DATABASE_NAME], document_models=models)
