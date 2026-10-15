"""Cheap guard tests; actual loading/inference is a separate manual CI job."""

import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("smoke", ROOT / "automation/smoke_artifact.py")
assert SPEC and SPEC.loader
SMOKE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SMOKE)


class SmokeGuardTests(unittest.TestCase):
    def test_all_six_targets_have_checksum_bound_personal_native_contracts(self):
        for target in SMOKE.TARGETS:
            contract = SMOKE.load_contract(target)
            self.assertTrue(contract["hub"]["files"])

    def test_corrupted_native_artifact_stops_before_deserialization(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "weights.joblib"
            path.write_bytes(b"different model")
            with self.assertRaisesRegex(ValueError, "checksum"):
                SMOKE.verify_file(path, "0" * 64)

    def test_invalid_inference_output_is_rejected(self):
        for values in ([[float("nan"), 0.5]], [[1.2, -0.2]], [[0.3, 0.3]], [[1.0]]):
            with self.subTest(values=values), self.assertRaises(ValueError):
                SMOKE.check_probabilities(values, 1, 2)


if __name__ == "__main__":
    unittest.main()
