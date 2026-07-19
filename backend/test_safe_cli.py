import os
import sys
import asyncio
import tempfile
import unittest
from unittest.mock import patch, MagicMock, AsyncMock

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from seed_pipeline.__main__ import main, run_pipeline
from seed_pipeline.loader import load_programs
from seed_pipeline.diff_engine import diff_university

def mock_exit_func(code):
    raise SystemExit(code)

class TestSafeCLI(unittest.TestCase):

    def setUp(self):
        self.exit_patcher = patch('sys.exit', side_effect=mock_exit_func)
        self.mock_exit = self.exit_patcher.start()
        self.print_patcher = patch('builtins.print')
        self.mock_print = self.print_patcher.start()

    def tearDown(self):
        self.exit_patcher.stop()
        self.print_patcher.stop()

    def test_dry_run_with_apply_rejected(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--dry-run", "--apply"])
        self.mock_exit.assert_called_once_with(1)

    def test_dry_run_with_live_rejected(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--dry-run", "--live"])
        self.mock_exit.assert_called_once_with(1)

    def test_apply_with_live_rejected(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--apply", "--live"])
        self.mock_exit.assert_called_once_with(1)

    def test_confirm_apply_without_apply_or_live_rejected(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--confirm-apply"])
        self.mock_exit.assert_called_once_with(1)

    def test_apply_without_confirm_apply_blocked(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--apply"])
        self.mock_exit.assert_called_once_with(1)

    def test_live_without_confirm_apply_blocked(self):
        with self.assertRaises(SystemExit):
            main(["--institutions", "i.csv", "--programs", "p.csv", "--live"])
        self.mock_exit.assert_called_once_with(1)

    @patch('seed_pipeline.__main__.run_pipeline')
    @patch('asyncio.run')
    def test_default_dry_run_calls_pipeline(self, mock_asyncio, mock_run):
        main(["--institutions", "i.csv", "--programs", "p.csv"])
        mock_run.assert_called_once()
        self.assertTrue(mock_run.call_args[1]["dry_run"])

    @patch('seed_pipeline.__main__.run_pipeline')
    @patch('asyncio.run')
    def test_explicit_dry_run_calls_pipeline(self, mock_asyncio, mock_run):
        main(["--institutions", "i.csv", "--programs", "p.csv", "--dry-run"])
        mock_run.assert_called_once()
        self.assertTrue(mock_run.call_args[1]["dry_run"])

    @patch('seed_pipeline.__main__.run_pipeline')
    @patch('asyncio.run')
    def test_confirmed_apply_calls_pipeline(self, mock_asyncio, mock_run):
        main(["--institutions", "i.csv", "--programs", "p.csv", "--apply", "--confirm-apply"])
        mock_run.assert_called_once()
        self.assertFalse(mock_run.call_args[1]["dry_run"])

    @patch('seed_pipeline.__main__.run_pipeline')
    @patch('asyncio.run')
    def test_confirmed_live_calls_pipeline(self, mock_asyncio, mock_run):
        main(["--institutions", "i.csv", "--programs", "p.csv", "--live", "--confirm-apply"])
        mock_run.assert_called_once()
        self.assertFalse(mock_run.call_args[1]["dry_run"])

class TestPipelineLogic(unittest.IsolatedAsyncioTestCase):
    @patch('seed_pipeline.loader.University')
    async def test_missing_links_stop_processing(self, mock_university):
        mock_row = {"normalized_identity": "missing_uni", "core_program": "cs"}
        diff_results = [("NEW", mock_row)]

        async def mock_find_one(*args, **kwargs):
            return None

        mock_university.find_one = mock_find_one
        mock_university.normalized_identity = "fake_identity"

        with self.assertRaises(ValueError) as context:
            await load_programs(diff_results, {}, dry_run=False)

        self.assertIn("University not found", str(context.exception))

    @patch('seed_pipeline.diff_engine.University')
    async def test_rerunning_unchanged_data_creates_no_duplicates(self, mock_university):
        mock_row = {
            "normalized_identity": "exist_uni",
            "university_name": "Old Name",
            "country": "USA"
        }

        mock_existing = MagicMock()
        mock_existing.normalized_identity = "exist_uni"
        mock_existing.university_name = "Old Name"
        mock_existing.country = "USA"
        mock_existing.city = None
        mock_existing.continent = None
        mock_existing.qs_ranking = None
        mock_existing.acceptance_rate = None
        mock_existing.website = None
        mock_existing.data_source = None

        async def mock_find_one(*args, **kwargs):
            return mock_existing

        mock_university.find_one = mock_find_one
        mock_university.normalized_identity = "fake_identity"

        action, row = await diff_university(mock_row)
        self.assertEqual(action, "UNCHANGED")

    @patch('seed_pipeline.__main__.load_universities', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.load_programs', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.resolve_taxonomy', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.diff_university', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.diff_program', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.extract_csv')
    @patch('seed_pipeline.__main__.init_db', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.CoreProgram')
    @patch('seed_pipeline.__main__.Specialization')
    @patch('seed_pipeline.__main__.University')
    @patch('sys.exit', side_effect=mock_exit_func)
    @patch('builtins.print')
    async def test_unmapped_taxonomy_aborts_apply(self, mock_print, mock_exit, mock_univ, mock_spec, mock_core, mock_init_db, mock_extract, mock_diff_prog, mock_diff_uni, mock_resolve_tax, mock_load_prog, mock_load_univ):
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as i_f, tempfile.NamedTemporaryFile(mode='w', delete=False) as p_f:
            i_f.write("uni_name\nTest")
            p_f.write("prog_name,institution_id,field_of_study\nTest,test,Weird Field")
            i_csv = i_f.name
            p_csv = p_f.name

        try:
            # We simulate 1 program with UNMATCHED taxonomy
            mock_extract.side_effect = [[], [{"institution_id": "test", "field_of_study": "Weird Field"}]]
            mock_resolve_tax.return_value = {"status": "UNMATCHED", "core_program": None, "specialization": None}

            with self.assertRaises(SystemExit):
                await run_pipeline(institutions_csv=i_csv, programs_csv=p_csv, dry_run=False, dataset_version="ds_dev")

            mock_exit.assert_called_once_with(1)

            # verify load_universities and load_programs were NOT called
            mock_load_univ.assert_not_called()
            mock_load_prog.assert_not_called()

            # verify report file isn't in repo dir
            self.assertFalse(os.path.exists("unmapped_taxonomy_queue.csv"))
        finally:
            os.remove(i_csv)
            os.remove(p_csv)

    @patch('seed_pipeline.__main__.score_program')
    @patch('seed_pipeline.__main__.normalize_program')
    @patch('seed_pipeline.__main__.PipelineProgramSchema')
    @patch('seed_pipeline.__main__.score_university')
    @patch('seed_pipeline.__main__.normalize_university')
    @patch('seed_pipeline.__main__.clean_row')
    @patch('seed_pipeline.__main__.PipelineUniversitySchema')
    @patch('seed_pipeline.__main__.load_universities', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.load_programs', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.resolve_taxonomy', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.diff_university', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.diff_program', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.extract_csv')
    @patch('seed_pipeline.__main__.init_db', new_callable=AsyncMock)
    @patch('seed_pipeline.__main__.CoreProgram')
    @patch('seed_pipeline.__main__.Specialization')
    @patch('seed_pipeline.__main__.University')
    @patch('builtins.print')
    async def test_unchanged_counts_printed(self, mock_print, mock_univ, mock_spec, mock_core, mock_init_db, mock_extract, mock_diff_prog, mock_diff_uni, mock_resolve_tax, mock_load_prog, mock_load_univ, mock_uni_schema, mock_clean_row, mock_norm_uni, mock_score_uni, mock_prog_schema, mock_norm_prog, mock_score_prog):
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as i_f, tempfile.NamedTemporaryFile(mode='w', delete=False) as p_f:
            i_f.write("uni_name\nTest")
            p_f.write("prog_name,institution_id,field_of_study\nTest,test,Math")
            i_csv = i_f.name
            p_csv = p_f.name

        try:
            mock_extract.side_effect = [
                [{"institution_id": "test_uni"}],
                [{"institution_id": "test_uni", "field_of_study": "Math"}]
            ]

            # Bypass validation
            mock_clean_row.return_value = {}
            mock_norm_uni.return_value = {"institution_id": "test_uni", "normalized_identity": "test_uni"}
            mock_score_uni.return_value = 100
            mock_uni_schema.return_value.model_dump.return_value = {"institution_id": "test_uni", "normalized_identity": "test_uni"}
            mock_uni_schema.return_value.normalized_identity = "test_uni"

            mock_norm_prog.return_value = {"institution_id": "test_uni", "field_of_study": "Math"}
            mock_score_prog.return_value = 100
            mock_prog_schema.return_value.model_dump.return_value = {"institution_id": "test_uni", "field_of_study": "Math", "normalized_identity": "test_uni"}

            mock_resolve_tax.return_value = {"status": "MATCHED", "core_program": "Math", "specialization": None}

            # Mock the cache lookup for core program
            class MockCore:
                id = "mock_core_id"
                canonical_name = "Math"
            mock_core.find_all.return_value.__aiter__.return_value = [MockCore()]
            mock_spec.find_all.return_value.__aiter__.return_value = []

            class MockUniDb:
                id = "test_uni_id"
            async def mock_find_one(*args, **kwargs):
                return MockUniDb()
            mock_univ.find_one = mock_find_one
            mock_univ.normalized_identity = "fake_identity"

            # Setup diffs to return UNCHANGED
            mock_diff_uni.return_value = ("UNCHANGED", {"institution_id": "test_uni"})
            mock_diff_prog.return_value = ("UNCHANGED", {"institution_id": "test_uni"})

            await run_pipeline(institutions_csv=i_csv, programs_csv=p_csv, dry_run=True, dataset_version="ds_dev")

            mock_print.assert_any_call("Unchanged Universities: 1")
            mock_print.assert_any_call("Unchanged Programs: 1")

        finally:
            os.remove(i_csv)
            os.remove(p_csv)

if __name__ == "__main__":
    unittest.main()
