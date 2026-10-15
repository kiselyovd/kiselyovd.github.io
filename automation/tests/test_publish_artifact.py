"""Offline publication guard, whitelist, readback and idempotency regressions."""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "publisher", SOURCE / "automation/publish_artifact.py"
)
assert SPEC and SPEC.loader
PUB = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PUB)


class FakeHub:
    """An in-memory Hub with immutable native metadata and inspectable commit calls."""

    def __init__(self, plan, name="kiselyovd"):
        self.plan, self.name = plan, name
        self.sha = plan["expected_parent"]
        self.files = {"README.md": b"previous fixture card"}
        self.created = 0

    def whoami(self):
        return {"name": self.name}

    def repo_info(self, **kwargs):
        native = [
            SimpleNamespace(
                rfilename=item["path"],
                lfs=SimpleNamespace(sha256=item["sha256"]),
                blob_id=None,
                size=1,
            )
            for item in self.plan["native_artifact"]["files"]
        ]
        regular = [
            SimpleNamespace(rfilename=name, lfs=None, blob_id=PUB.sha256(data), size=len(data))
            for name, data in self.files.items()
        ]
        return SimpleNamespace(id=self.plan["repo_id"], sha=self.sha, siblings=native + regular)

    def create_commit(self, **kwargs):
        assert kwargs["parent_commit"] == self.sha
        for operation in kwargs["operations"]:
            self.files[operation.path_in_repo] = operation.path_or_fileobj
        self.created += 1
        self.sha = "3" * 40
        return SimpleNamespace(oid=self.sha)

    def read(self, url):
        name = url.split("/resolve/", 1)[1].split("/", 1)[1]
        return self.files[name]


class PublicationTests(unittest.TestCase):
    """A model store, wrong owner or changed evidence cannot pass publication."""

    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="portfolio-release-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "source"
        self.root.mkdir()
        self.output = Path(self.temporary.name) / "candidate"
        registry = json.loads(
            (SOURCE / "evidence/portfolio-sources.json").read_text(encoding="utf-8")
        )
        source = next(
            item.copy() for item in registry["sources"] if item["id"] == "grnti-text-classifier"
        )
        manifest = json.loads((SOURCE / source["snapshot"]).read_text(encoding="utf-8"))
        report = json.loads((SOURCE / source["reportSnapshot"]).read_text(encoding="utf-8"))
        self.arrays = b"fixture numerical arrays, never model weights"
        report["arrays"]["sha256"] = PUB.sha256(self.arrays)
        raw = (json.dumps(report) + "\n").encode()
        manifest["evaluation"]["report_sha256"] = PUB.sha256(raw)
        for name, data in (
            (source["reportSnapshot"], raw),
            (source["snapshot"], (json.dumps(manifest) + "\n").encode()),
            (source["hubCardSnapshot"], (SOURCE / source["hubCardSnapshot"]).read_bytes()),
        ):
            destination = self.root / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        source["sha256"] = PUB.sha256((self.root / source["snapshot"]).read_bytes())
        (self.root / "evidence/portfolio-sources.json").write_text(
            json.dumps({"owner": "kiselyovd", "sources": [source]}), encoding="utf-8"
        )
        with patch.object(PUB, "read_public", return_value=self.arrays):
            self.plan = PUB.prepare(self.root, "grnti-text-classifier", self.output)

    def test_prepare_needs_no_authentication_and_preserves_exact_bytes(self):
        with patch.dict("sys.modules", {"huggingface_hub": None}):
            with patch.object(PUB, "read_public", return_value=self.arrays):
                repeated = PUB.prepare(self.root, "grnti-text-classifier", self.output)
        self.assertEqual(repeated, self.plan)
        self.assertEqual(
            set(self.plan["files"]),
            {
                "README.md",
                "artifact-manifest.json",
                "reports/replay-native.json",
                "reports/replay-native.npz",
            },
        )
        self.assertNotIn("model.safetensors", self.plan["files"])

    def test_card_line_endings_are_preserved_as_published_bytes(self):
        registry_path = self.root / "evidence/portfolio-sources.json"
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
        source = registry["sources"][0]
        card_path = self.root / source["hubCardSnapshot"]
        card = card_path.read_bytes().replace(b"\n", b"\r\n")
        card_path.write_bytes(card)
        source["hubCardSha256"] = PUB.sha256(card)
        registry_path.write_text(json.dumps(registry), encoding="utf-8")
        output = Path(self.temporary.name) / "crlf-candidate"
        with patch.object(PUB, "read_public", return_value=self.arrays):
            PUB.prepare(self.root, "grnti-text-classifier", output)
        self.assertEqual((output / "README.md").read_bytes(), card)

    def test_changed_native_weights_stop_before_commit(self):
        api = FakeHub(json.loads(json.dumps(self.plan)))
        api.plan["native_artifact"]["files"][0]["sha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "native artifact differs"):
            PUB.publish(self.root, self.output, "grnti-text-classifier", api=api)
        self.assertEqual(api.created, 0)

    def test_wrong_hf_account_stops_before_commit(self):
        api = FakeHub(self.plan, "work-account")
        with self.assertRaisesRegex(ValueError, "HF owner guard"):
            PUB.publish(self.root, self.output, "grnti-text-classifier", api=api)
        self.assertEqual(api.created, 0)

    def test_requested_target_is_bound_to_the_candidate(self):
        with self.assertRaisesRegex(ValueError, "requested target"):
            PUB.publish(self.root, self.output, "vehicle-keypoints", api=FakeHub(self.plan))

    def test_changed_candidate_stops_before_commit(self):
        (self.output / "README.md").write_bytes(b"changed")
        with self.assertRaisesRegex(ValueError, "Candidate bytes"):
            PUB.publish(self.root, self.output, "grnti-text-classifier", api=FakeHub(self.plan))

    def test_editing_the_plan_cannot_add_an_unreviewed_file(self):
        plan = self.plan.copy()
        plan["files"] = {**plan["files"], "reports/private.env": PUB.sha256(b"unreviewed")}
        (self.output / "publication-plan.json").write_text(json.dumps(plan), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "reviewed whitelist"):
            PUB.publish(self.root, self.output, "grnti-text-classifier", api=FakeHub(self.plan))

    def test_atomic_publication_exact_readback_and_idempotent_repeat(self):
        api = FakeHub(self.plan)
        receipt = PUB.publish(
            self.root, self.output, "grnti-text-classifier", api=api, reader=api.read
        )
        self.assertTrue(receipt["native_artifacts_unchanged"])
        self.assertTrue(receipt["raw_readback_exact"])
        self.assertEqual(api.created, 1)
        repeat = PUB.publish(
            self.root, self.output, "grnti-text-classifier", api=api, reader=api.read
        )
        self.assertTrue(repeat["idempotent_no_op"])
        self.assertEqual(api.created, 1)

    def test_concurrent_human_edit_is_preserved(self):
        api = FakeHub(self.plan)
        PUB.publish(self.root, self.output, "grnti-text-classifier", api=api, reader=api.read)
        api.files["README.md"] = b"a later human edit"
        with self.assertRaisesRegex(ValueError, "Hub changed since review"):
            PUB.publish(self.root, self.output, "grnti-text-classifier", api=api, reader=api.read)
        self.assertEqual(api.created, 1)

    def test_failed_readback_is_not_a_successful_release(self):
        api = FakeHub(self.plan)
        with self.assertRaisesRegex(RuntimeError, "readback checksum"):
            PUB.publish(
                self.root, self.output, "grnti-text-classifier", api=api, reader=lambda _: b"wrong"
            )
        self.assertFalse((self.output / "publication-receipt.json").exists())


if __name__ == "__main__":
    unittest.main()
