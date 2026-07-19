import unittest
from unittest.mock import AsyncMock, patch, MagicMock
import json
import sys

class DummyHTTPException(Exception):
    def __init__(self, status_code, detail=None):
        self.status_code = status_code
        self.detail = detail

def dummy_decorator(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

fastapi_mock = MagicMock()
fastapi_mock.HTTPException = DummyHTTPException
fastapi_mock.Depends = lambda x: None
fastapi_mock.FastAPI.return_value.post = dummy_decorator
fastapi_mock.FastAPI.return_value.get = dummy_decorator
fastapi_mock.FastAPI.return_value.put = dummy_decorator

sys.modules['fastapi'] = fastapi_mock
sys.modules['fastapi.middleware.cors'] = MagicMock()
sys.modules['pymongo'] = MagicMock()
sys.modules['pymongo.errors'] = MagicMock()
sys.modules['fastapi.security'] = MagicMock()
sys.modules['jose'] = MagicMock()
sys.modules['passlib'] = MagicMock()
sys.modules['passlib.context'] = MagicMock()
sys.modules['auth'] = MagicMock()
sys.modules['openai'] = MagicMock()

class MockMeta(type):
    def __getattr__(cls, name):
        return MagicMock()

class BaseMockModel(metaclass=MockMeta):
    find = MagicMock()
    insert = MagicMock()

class DummyPydanticObjectId:
    pass

sys.modules['pydantic'] = MagicMock()
sys.modules['pydantic'].BaseModel = BaseMockModel
sys.modules['pydantic'].Field = MagicMock()
sys.modules['pydantic'].EmailStr = str
sys.modules['pydantic'].HttpUrl = str

sys.modules['dotenv'] = MagicMock()

class DummyLink:
    def __class_getitem__(cls, item):
        return cls

sys.modules['beanie'] = MagicMock()
sys.modules['beanie'].Document = BaseMockModel
sys.modules['beanie'].Link = DummyLink
sys.modules['beanie'].BackLink = DummyLink
sys.modules['beanie'].PydanticObjectId = DummyPydanticObjectId
sys.modules['beanie.operators'] = MagicMock()
sys.modules['bson'] = MagicMock()
sys.modules['bson.errors'] = MagicMock()

sys.modules['motor'] = MagicMock()
sys.modules['motor.motor_asyncio'] = MagicMock()
class HTTPStatusError(Exception):
    def __init__(self, response):
        self.response = response
class RequestError(Exception): pass
httpx_mock = MagicMock()
httpx_mock.HTTPStatusError = HTTPStatusError
httpx_mock.RequestError = RequestError
sys.modules['httpx'] = httpx_mock

from fastapi import HTTPException
from main import (
    _normalize_degree, _score_universities, _build_candidate_pool,
    _hydrate_ai_results, get_university_recommendations, models
)

class DummyUniversity:
    def __init__(self, uid, name, country, qs, tuition, accept, website="", email="", url="", city=""):
        self.id = uid
        self.university_name = name
        self.country = country
        self.qs_ranking = qs
        self.yearly_tuition_usd = tuition
        self.acceptance_rate = accept
        self.website = website
        self.admissions_email = email
        self.admissions_url = url
        self.city = city
        # NO legacy fields: programs, study_levels, fields!

class DummySpecialization:
    def __init__(self, name):
        self.name = name

class DummyProgram:
    def __init__(self, name, level, spec_name=None, url=None, deadline=None):
        self.program_name = name
        self.degree_level = level
        self.specialization = DummySpecialization(spec_name) if spec_name else None
        self.canonical_program = None
        self.course_page_url = url
        self.application_deadline = deadline

class TestRecommendationEngineRootCause(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        # 1. University without legacy fields
        self.db_unis = [
            DummyUniversity(1, "Tech University", "USA", 100, 20000, 40.0, "https://tech.edu"),
            DummyUniversity(2, "Arts College", "UK", 200, 15000, 60.0, "https://arts.ac.uk"),
            DummyUniversity(3, "Empty Uni", "Canada", 300, 10000, 80.0, "https://empty.ca"), # university with no programs
            DummyUniversity(4, "No Web Uni", "USA", 150, 10000, 50.0, "") # required website handling (missing)
        ]

        # 2. UniversityProgram scoring & missing specialization
        self.prog_map = {
            1: [DummyProgram("Computer Science", "Master", "AI", "https://tech.edu/cs", "Dec 1")],
            2: [DummyProgram("Fine Arts", "Bachelor")], # missing specialization
            3: [], # no programs
            4: [DummyProgram("Biology", "Master", "Genetics", "https://noweb.edu/bio", "Nov 1")]
        }

        self.profile_dict = {
            "degree_applying_for": "Master",
            "intended_major": "Computer Science",
            "countries": ["USA", "Canada"],
            "need_scholarship": False
        }

        self.profile_mock = MagicMock()
        self.profile_mock.model_dump.return_value = self.profile_dict
        self.profile_mock.countries = ["USA", "Canada"]
        self.profile_mock.continents = []
        self.user_mock = MagicMock()

    def test_normalize_degree(self):
        self.assertEqual(_normalize_degree("Master of Science"), "master")
        self.assertEqual(_normalize_degree("bachelor of arts"), "bachelor")

    def test_score_universities(self):
        # University with zero programs does not crash scoring; missing specialization is handled.
        top = _score_universities(self.db_unis, self.prog_map, self.profile_dict)
        self.assertTrue(len(top) > 0)
        self.assertEqual(top[0].university_name, "Tech University")

        # Verify Empty Uni is processed safely
        empty = next((u for u in top if u.university_name == "Empty Uni"), None)
        self.assertIsNotNone(empty)

    def test_build_candidate_pool(self):
        # Tests candidate pool missing specialization and no programs
        top = _score_universities(self.db_unis, self.prog_map, self.profile_dict)
        pool = _build_candidate_pool(top, self.prog_map)
        tech = next(p for p in pool if p["name"] == "Tech University")
        self.assertEqual(tech["sample_programs"][0]["field"], "AI")

        arts = next(p for p in pool if p["name"] == "Arts College")
        self.assertEqual(arts["sample_programs"][0]["field"], "Fine Arts") # Missing spec uses program_name safely

    def test_ai_hydration_and_rejection_and_website_handling(self):
        # AI returns Tech Uni, No Web Uni, and a Hallucination
        ai_raw = [
            {"name": "Tech University", "chances": 80, "category": "TARGET", "reason": "Good"},
            {"name": "No Web Uni", "chances": 60, "category": "TARGET", "reason": "OK"}, # Has no website
            {"name": "Hogwarts", "chances": 100, "category": "TARGET", "reason": "Magic"} # Hallucinated
        ]

        # Put No Web Uni in top candidates manually
        top_candidates = self.db_unis
        hydrated = _hydrate_ai_results(ai_raw, top_candidates, self.prog_map, self.profile_dict)

        # 1. Hallucinated university rejected
        self.assertFalse(any(u["university_name"] == "Hogwarts" for u in hydrated))

        # 2. No Web Uni is excluded because university_website is required
        self.assertFalse(any(u["university_name"] == "No Web Uni" for u in hydrated))

        # 3. Tech Uni is successfully hydrated
        self.assertEqual(len(hydrated), 1)
        self.assertEqual(hydrated[0]["university_name"], "Tech University")
        self.assertEqual(hydrated[0]["university_website"], "https://tech.edu")
        self.assertEqual(hydrated[0]["course_page_url"], "https://tech.edu/cs")

    @patch("main.models.University")
    async def test_empty_database_candidates(self, mock_university):
        mock_university.find.return_value.to_list = AsyncMock(return_value=[])
        with self.assertRaises(HTTPException) as cm:
            await get_university_recommendations(self.profile_mock, self.user_mock)
        self.assertEqual(cm.exception.status_code, 404)

    @patch("main._load_university_programs")
    @patch("main.models.University")
    async def test_database_program_load_errors_not_swallowed(self, mock_university, mock_load):
        # database/program-loading exception becomes a 500 and never reaches OpenAI
        mock_university.find.return_value.to_list = AsyncMock(return_value=self.db_unis)
        mock_load.side_effect = Exception("DB Program Load Error")

        with self.assertRaises(HTTPException) as cm:
            await get_university_recommendations(self.profile_mock, self.user_mock)

        self.assertEqual(cm.exception.status_code, 500)
        self.assertIn("error occurred while matching", cm.exception.detail)

    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @patch("main.httpx.AsyncClient")
    @patch("main._load_university_programs")
    @patch("main.models.University")
    async def test_no_valid_ai_results(self, mock_university, mock_load, mock_client):
        # no valid AI results produce the existing controlled error
        mock_university.find.return_value.to_list = AsyncMock(return_value=self.db_unis)
        mock_load.return_value = self.prog_map

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json = MagicMock(return_value={
            "choices": [{"message": {"content": json.dumps({
                "universities": [
                    {"name": "Hogwarts", "chances": 100, "category": "TARGET", "reason": "Magic"} # completely hallucinated
                ]
            })}}]
        })
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_resp)

        with self.assertRaises(HTTPException) as cm:
            await get_university_recommendations(self.profile_mock, self.user_mock)
        self.assertEqual(cm.exception.status_code, 500)
        self.assertIn("Failed to generate recommendations", cm.exception.detail)

    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @patch("main.httpx.AsyncClient")
    @patch("main._load_university_programs")
    @patch("main.models.University")
    async def test_http_failure_produces_502(self, mock_university, mock_load, mock_client):
        # HTTP failure produces 502
        mock_university.find.return_value.to_list = AsyncMock(return_value=self.db_unis)
        mock_load.return_value = self.prog_map

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(side_effect=RequestError("Network error"))

        with self.assertRaises(HTTPException) as cm:
            await get_university_recommendations(self.profile_mock, self.user_mock)
        self.assertEqual(cm.exception.status_code, 502)
        self.assertIn("temporarily unavailable", cm.exception.detail)

    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @patch("main.models.RecommendationSession")
    @patch("main.httpx.AsyncClient")
    @patch("main._load_university_programs")
    @patch("main.models.University")
    async def test_session_insertion_failure(self, mock_university, mock_load, mock_client, mock_session):
        # session insertion failure remains a 500 and is not confused with an OpenAI failure
        mock_university.find.return_value.to_list = AsyncMock(return_value=self.db_unis)
        mock_load.return_value = self.prog_map

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json = MagicMock(return_value={
            "choices": [{"message": {"content": json.dumps({
                "universities": [
                    {"name": "Tech University", "chances": 60, "category": "TARGET", "reason": "Good match"}
                ]
            })}}]
        })
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_resp)

        # Force session insertion to fail
        mock_session_instance = MagicMock()
        mock_session_instance.insert = AsyncMock(side_effect=Exception("DB Save Error"))
        mock_session.return_value = mock_session_instance

        with self.assertRaises(HTTPException) as cm:
            await get_university_recommendations(self.profile_mock, self.user_mock)
        self.assertEqual(cm.exception.status_code, 500)
        self.assertIn("Failed to generate recommendations", cm.exception.detail)

    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @patch("main.models.RecommendationSession")
    @patch("main.httpx.AsyncClient")
    @patch("main._load_university_programs")
    @patch("main.models.University")
    async def test_successful_recommendation(self, mock_university, mock_load, mock_client, mock_session):
        # Test exact output contracts
        mock_university.find.return_value.to_list = AsyncMock(return_value=self.db_unis)
        mock_load.return_value = self.prog_map

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json = MagicMock(return_value={
            "choices": [{"message": {"content": json.dumps({
                "universities": [
                    {"name": "Tech University", "chances": 60, "category": "TARGET", "reason": "Good match"}
                ]
            })}}]
        })
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_resp)

        mock_session_instance = MagicMock()
        mock_session_instance.insert = AsyncMock()
        mock_session_instance.id = "session123"
        mock_session.return_value = mock_session_instance

        result = await get_university_recommendations(self.profile_mock, self.user_mock)
        self.assertEqual(result["total_count"], 1)

        # Test exact dictionary contracts explicitly
        uni = result["recommended_universities"][0]
        self.assertIn("university_name", uni)
        self.assertEqual(uni["university_name"], "Tech University")

        self.assertIn("country", uni)
        self.assertEqual(uni["country"], "USA")

        self.assertIn("degree", uni)
        self.assertIn("major", uni)

        self.assertIn("admission_chance", uni)
        self.assertEqual(uni["admission_chance"], 60.0)

        self.assertIn("category", uni)
        self.assertEqual(uni["category"], "TARGET")

        self.assertIn("university_website", uni)
        self.assertEqual(uni["university_website"], "https://tech.edu")

        self.assertIn("reason_for_match", uni)
        self.assertEqual(uni["reason_for_match"], "Good match")

if __name__ == "__main__":
    unittest.main()
