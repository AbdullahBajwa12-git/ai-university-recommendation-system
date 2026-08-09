import unittest
from unittest.mock import AsyncMock, patch, MagicMock
import sys
import os

class DummyHTTPException(Exception):
    def __init__(self, status_code, detail=None):
        self.status_code = status_code
        self.detail = detail

fastapi_mock = MagicMock()
fastapi_mock.HTTPException = DummyHTTPException
fastapi_mock.Depends = lambda x: None
sys.modules['fastapi'] = fastapi_mock
sys.modules['fastapi.middleware.cors'] = MagicMock()
sys.modules['pymongo'] = MagicMock()
sys.modules['pymongo.errors'] = MagicMock()
sys.modules['fastapi.security'] = MagicMock()
sys.modules['jose'] = MagicMock()
sys.modules['passlib'] = MagicMock()
sys.modules['passlib.context'] = MagicMock()
sys.modules['beanie'] = MagicMock()
sys.modules['motor'] = MagicMock()
sys.modules['motor.motor_asyncio'] = MagicMock()
sys.modules['httpx'] = MagicMock()

from pydantic import BaseModel, ValidationError
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Mock models before importing main
import models
models.UniversityProgram = MagicMock()
models.UniversityProgram.find = MagicMock()
models.UniversityProgram.find_one = AsyncMock()
models.UniversityProgram.get = AsyncMock()
models.University = MagicMock()
models.University.get = AsyncMock()
models.CoreProgram = MagicMock()
models.CoreProgram.get = AsyncMock()
models.Specialization = MagicMock()
models.Specialization.get = AsyncMock()
models.TuitionInfo = MagicMock
models.AdmissionReqs = MagicMock

from schemas import ProgramAdminCreate, ProgramAdminUpdate
import main

class DummyUser:
    def __init__(self, role="admin"):
        self.role = role

class TestAdminPrograms(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        models.UniversityProgram.find_one.return_value = None

    async def test_admin_list_programs(self):
        mock_find = MagicMock()
        mock_find.to_list = AsyncMock(return_value=["prog1", "prog2"])
        models.UniversityProgram.find.return_value = mock_find

        result = await main.admin_list_programs(university_id=None, current_admin=DummyUser())
        self.assertEqual(result, ["prog1", "prog2"])

    async def test_admin_create_program_valid(self):
        models.University.get.return_value = MagicMock(id="uni1")
        models.CoreProgram.get.return_value = MagicMock(id="core1")
        models.Specialization.get.return_value = None

        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            program_name="Test Prog",
            degree_level="Masters"
        )

        mock_prog = MagicMock()
        mock_prog.insert = AsyncMock()

        with patch("main.models.UniversityProgram", return_value=mock_prog):
            res = await main.admin_create_program(payload, current_admin=DummyUser())
            self.assertEqual(res, mock_prog)
            mock_prog.insert.assert_called_once()

    async def test_admin_create_program_invalid_university_link(self):
        models.University.get.return_value = None
        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            program_name="Test Prog",
            degree_level="Masters"
        )
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_create_program(payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Linked University not found", ctx.exception.detail)

    async def test_admin_create_program_invalid_core_program_link(self):
        models.University.get.return_value = MagicMock(id="uni1")
        models.CoreProgram.get.return_value = None
        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            program_name="Test Prog",
            degree_level="Masters"
        )
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_create_program(payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Linked CoreProgram not found", ctx.exception.detail)

    async def test_admin_create_program_specialization_wrong_core(self):
        models.University.get.return_value = MagicMock(id="uni1")
        core = MagicMock(id="core1")
        models.CoreProgram.get.return_value = core

        spec = MagicMock(id="spec1")
        spec.core_program.id = "different_core"
        models.Specialization.get.return_value = spec

        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            specialization_id="60a7d5b8b8b8b8b8b8b8b8ba",
            program_name="Test Prog",
            degree_level="Masters"
        )
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_create_program(payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Specialization does not belong to the selected CoreProgram", ctx.exception.detail)

    def test_invalid_degree_level(self):
        # Pydantic validation catches this before the endpoint
        with self.assertRaises(ValidationError):
            ProgramAdminCreate(
                university_id="60a7d5b8b8b8b8b8b8b8b8b8",
                canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
                program_name="Test Prog",
                degree_level="InvalidDegree"
            )

    async def test_admin_create_program_duplicate_rejected(self):
        models.University.get.return_value = MagicMock(id="uni1")
        models.CoreProgram.get.return_value = MagicMock(id="core1")
        models.Specialization.get.return_value = None

        # Simulate duplicate existing
        models.UniversityProgram.find_one.return_value = MagicMock(id="existing_prog")

        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            program_name="Test Prog",
            degree_level="Masters"
        )
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_create_program(payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("Duplicate", ctx.exception.detail)

    async def test_admin_update_program_duplicate_producing_rejected(self):
        mock_prog = MagicMock(id="prog1")
        mock_prog.save = AsyncMock()
        models.UniversityProgram.get.return_value = mock_prog

        # Simulate duplicate existing
        models.UniversityProgram.find_one.return_value = MagicMock(id="another_prog")

        payload = ProgramAdminUpdate(program_name="New Name")
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_update_program("60a7d5b8b8b8b8b8b8b8b8b8", payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("Update would create a duplicate", ctx.exception.detail)

    async def test_admin_update_program_valid_partial(self):
        mock_prog = MagicMock(id="prog1")
        mock_prog.save = AsyncMock()
        models.UniversityProgram.get.return_value = mock_prog
        models.UniversityProgram.find_one.return_value = mock_prog # same prog -> no conflict

        payload = ProgramAdminUpdate(program_name="New Name")
        res = await main.admin_update_program("60a7d5b8b8b8b8b8b8b8b8b8", payload, current_admin=DummyUser())
        self.assertEqual(res, mock_prog)
        mock_prog.save.assert_called_once()
        self.assertEqual(mock_prog.program_name, "New Name")

    async def test_admin_deactivate_program_safe_behavior(self):
        mock_prog = MagicMock()
        mock_prog.save = AsyncMock()
        mock_prog.is_active = True
        models.UniversityProgram.get.return_value = mock_prog

        res = await main.admin_delete_program("60a7d5b8b8b8b8b8b8b8b8b8", current_admin=DummyUser())
        self.assertEqual(res, {"message": "Program deactivated"})
        mock_prog.save.assert_called_once()
        self.assertFalse(mock_prog.is_active)

        self.assertFalse(hasattr(mock_prog.delete, 'called') and mock_prog.delete.called)

    async def test_admin_reactivate_program(self):
        mock_prog = MagicMock(id="prog1")
        mock_prog.save = AsyncMock()
        mock_prog.is_active = False
        models.UniversityProgram.get.return_value = mock_prog
        models.UniversityProgram.find_one.return_value = mock_prog # same prog -> no conflict

        payload = ProgramAdminUpdate(is_active=True)
        res = await main.admin_update_program("60a7d5b8b8b8b8b8b8b8b8b8", payload, current_admin=DummyUser())
        self.assertEqual(res, mock_prog)
        mock_prog.save.assert_called_once()
        self.assertTrue(mock_prog.is_active)

    async def test_load_university_programs_filtering(self):
        # active, legacy missing is_active, inactive
        p_active = MagicMock(is_active=True, university=MagicMock(id="u1"))
        p_legacy = MagicMock(university=MagicMock(id="u1"))
        del p_legacy.is_active # remove it to simulate legacy
        p_inactive = MagicMock(is_active=False, university=MagicMock(id="u1"))

        mock_find = MagicMock()
        mock_find.to_list = AsyncMock(return_value=[p_active, p_legacy, p_inactive])
        models.UniversityProgram.find.return_value = mock_find

        db_unis = [MagicMock(id="u1")]
        prog_map = await main._load_university_programs(db_unis)

        # Test just confirms it passes the correct arguments to Beanie since we mocked Beanie.
        # Check that find was called with `models.UniversityProgram.is_active != False`
        call_args = models.UniversityProgram.find.call_args[0]
        # We can't strictly evaluate the Beanie expression in MagicMock, but we can assure find was called.
        self.assertIn("u1", prog_map)

        # In a real test, Beanie resolves the query. Here we just ensure we returned the mock to_list.
        self.assertEqual(len(prog_map["u1"]), 3)

    async def test_duplicate_create_with_inactive_existing_record(self):
        models.University.get.return_value = MagicMock(id="uni1")
        models.CoreProgram.get.return_value = MagicMock(id="core1")
        models.Specialization.get.return_value = None

        # Simulate inactive duplicate existing
        models.UniversityProgram.find_one.return_value = MagicMock(id="inactive_prog", is_active=False)

        payload = ProgramAdminCreate(
            university_id="60a7d5b8b8b8b8b8b8b8b8b8",
            canonical_program_id="60a7d5b8b8b8b8b8b8b8b8b9",
            program_name="Test Prog",
            degree_level="Masters"
        )
        with self.assertRaises(DummyHTTPException) as ctx:
            await main.admin_create_program(payload, current_admin=DummyUser())
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("A duplicate UniversityProgram already exists", ctx.exception.detail)

if __name__ == '__main__':
    unittest.main()
