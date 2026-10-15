"""Guard real preview provenance, clipping and separation from benchmark claims."""

import copy
import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "previews", ROOT / "automation/render_social_previews.py"
)
assert SPEC and SPEC.loader
PREVIEWS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREVIEWS)


class PreviewTests(unittest.TestCase):
    def test_reviewed_outputs_and_sources_match(self):
        PREVIEWS.run(ROOT, check=True)

    def test_overlong_copy_is_rejected_before_it_can_clip(self):
        project = copy.deepcopy(PREVIEWS.registry(ROOT)["projects"][0])
        project["title"] = "Vehicle " * 25
        with self.assertRaisesRegex(ValueError, "safe area"):
            PREVIEWS.render(ROOT, project, "dark")

    def test_crop_cannot_escape_the_actual_evidence_image(self):
        project = copy.deepcopy(PREVIEWS.registry(ROOT)["projects"][0])
        project["crop"] = [0, 0, 9000, 9000]
        with self.assertRaisesRegex(ValueError, "crop"):
            PREVIEWS.render(ROOT, project, "light")

    def test_registry_path_cannot_escape_source_tree(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "escapes"):
                PREVIEWS.child(Path(directory), "../private-input.png")


if __name__ == "__main__":
    unittest.main()
