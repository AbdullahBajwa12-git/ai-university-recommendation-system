import asyncio
from database import init_db
from models import ALL_MODELS, University, UniversityProgram, CoreProgram, AcademicDomain

async def reset():
    await init_db(models=ALL_MODELS)
    await University.find_all().delete()
    await UniversityProgram.find_all().delete()
    await CoreProgram.find_all().delete()
    await AcademicDomain.find_all().delete()
    print("DB reset complete.")

if __name__ == "__main__":
    asyncio.run(reset())
