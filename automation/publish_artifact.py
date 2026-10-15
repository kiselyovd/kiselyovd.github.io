"""Prepare and publish a reviewed metadata/evaluation release; never replace weights."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path, PurePosixPath
from typing import Any

OWNER = "kiselyovd"
MAX_FILE_BYTES = 8 * 1024**2


def sha256(data: bytes) -> str:
    """Hash exact upstream bytes, including third-party text line endings."""
    return hashlib.sha256(data).hexdigest()


def inside(root: Path, name: str) -> Path:
    """Reject absolute paths and traversal in a committed publication plan."""
    if PurePosixPath(name).is_absolute() or ".." in PurePosixPath(name).parts or "\\" in name:
        raise ValueError("Publication path is not repository-relative")
    result = (root / name).resolve()
    if not result.is_relative_to(root.resolve()):
        raise ValueError("Publication path escapes its root")
    return result


def read_public(url: str) -> bytes:
    """Fetch a bounded public record without credentials or model-store downloads."""
    if not url.startswith(
        ("https://raw.githubusercontent.com/kiselyovd/", "https://huggingface.co/")
    ):
        raise ValueError("Unexpected public evidence host")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:  # nosec B310
                data = response.read(MAX_FILE_BYTES + 1)
            if len(data) > MAX_FILE_BYTES:
                raise ValueError("Evidence file exceeds the publication budget")
            return data
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)
    raise RuntimeError("Public evidence fetch did not complete")


def load_target(root: Path, target: str) -> tuple[dict[str, Any], dict[str, Any], bytes, bytes]:
    """Load only a registered personal artifact and checksum-bound publication card."""
    registry = json.loads((root / "evidence/portfolio-sources.json").read_text(encoding="utf-8"))
    if registry["owner"] != OWNER:
        raise ValueError("Unexpected registry owner")
    source = next((item for item in registry["sources"] if item["id"] == target), None)
    if source is None or not re.fullmatch(r"[a-f0-9]{40}", source["revision"]):
        raise ValueError("Target must have a reviewed immutable source")
    manifest_bytes = inside(root, source["snapshot"]).read_bytes()
    card = inside(root, source["hubCardSnapshot"]).read_bytes()
    if sha256(manifest_bytes) != source["sha256"] or sha256(card) != source["hubCardSha256"]:
        raise ValueError("Reviewed manifest/card checksum mismatch")
    manifest = json.loads(manifest_bytes)
    if not re.fullmatch(r"kiselyovd/[A-Za-z0-9_.-]+", manifest["hub"]["repo_id"]):
        raise ValueError("Target Hub repository must belong to kiselyovd")
    if manifest["hub"]["repo_type"] not in {"model", "dataset"}:
        raise ValueError("Unsupported publication type")
    if not re.fullmatch(r"[a-f0-9]{40}", manifest["hub"]["revision"]):
        raise ValueError("Native artifact revision must be immutable")
    if not re.fullmatch(r"[a-f0-9]{40}", source["hubCardRevision"]):
        raise ValueError("Reviewed Hub parent must be immutable")
    return source, manifest, manifest_bytes, card


def prepare(
    root: Path, target: str, output: Path, local_repository: Path | None = None
) -> dict[str, Any]:
    """Build a reviewable whitelist without authenticating or scanning private folders."""
    source, manifest, manifest_bytes, card = load_target(root, target)
    files = {"README.md": card, "artifact-manifest.json": manifest_bytes}
    required = set()
    evaluation = manifest["evaluation"]
    if evaluation["status"] != "unavailable":
        report_bytes = inside(root, source["reportSnapshot"]).read_bytes()
        if sha256(report_bytes) != evaluation["report_sha256"]:
            raise ValueError("Numerical report checksum mismatch")
        report = json.loads(report_bytes)
        files[evaluation["report"]] = report_bytes
        arrays = report.get("prediction_arrays", report.get("arrays"))
        if arrays:
            name = str(
                PurePosixPath(evaluation["report"]).parent / arrays.get("file", arrays.get("path"))
            )
            required.add(name)
    else:
        report, arrays = {}, None
    for field in ("source_receipt", "split_manifest", "crosswalk", "membership_report"):
        if manifest.get("dataset", {}).get(field):
            required.add(manifest["dataset"][field])
    for name in sorted(required):
        relative = PurePosixPath(name)
        if not name.startswith("reports/") or relative.suffix not in {".json", ".jsonl", ".npz"}:
            raise ValueError(
                "Only explicitly referenced numerical/provenance reports are publishable"
            )
        inside(output, name)
        if local_repository:
            data = subprocess.check_output(
                ["git", "show", f"{source['revision']}:{name}"], cwd=local_repository
            )
        else:
            data = read_public(
                f"https://raw.githubusercontent.com/{OWNER}/{source['repository']}/{source['revision']}/{name}"
            )
        if len(data) > MAX_FILE_BYTES:
            raise ValueError("Referenced report exceeds the bounded publication budget")
        files[name] = data
    if arrays:
        array_name = str(
            PurePosixPath(evaluation["report"]).parent / arrays.get("file", arrays.get("path"))
        )
        if sha256(files[array_name]) != arrays["sha256"]:
            raise ValueError("Prediction arrays differ from the reviewed report")
    dataset = manifest.get("dataset", {})
    for field, checksum in (
        ("crosswalk", "crosswalk_sha256"),
        ("membership_report", "membership_report_sha256"),
    ):
        if (
            dataset.get(field)
            and dataset.get(checksum)
            and sha256(files[dataset[field]]) != dataset[checksum]
        ):
            raise ValueError("Dataset provenance checksum mismatch")
    forbidden = {item["path"] for item in manifest["hub"]["files"]}
    if forbidden & files.keys():
        raise ValueError(
            "A metadata release must never replace native weights/processors/data shards"
        )
    plan = {
        "schema_version": 1,
        "owner": OWNER,
        "target": target,
        "repo_id": manifest["hub"]["repo_id"],
        "repo_type": manifest["hub"]["repo_type"],
        "source_repository": f"{OWNER}/{source['repository']}",
        "source_revision": source["revision"],
        "expected_parent": source["hubCardRevision"],
        "native_artifact": manifest["hub"],
        "files": {name: sha256(data) for name, data in sorted(files.items())},
        "scope": "Reviewed cards, manifests, numerical arrays and provenance only; no native artifact replacement.",
    }
    if output.exists() and any(output.iterdir()):
        previous = output / "publication-plan.json"
        if not previous.exists() or json.loads(previous.read_text(encoding="utf-8")) != plan:
            raise ValueError("Candidate directory contains a different or unreviewed payload")
    output.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        destination = inside(output, name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    (output / "publication-plan.json").write_text(
        json.dumps(plan, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    return plan


def file_identities(info: Any) -> dict[str, str]:
    """Compare the whole remote tree, including untouched canonical model files."""
    return {item.rfilename: item.lfs.sha256 if item.lfs else item.blob_id for item in info.siblings}


def expected_payload(
    root: Path, source: dict[str, Any], manifest: dict[str, Any]
) -> dict[str, str | None]:
    """Derive the whitelist from reviewed sources, never from editable candidate contents."""
    allowed = {"README.md": source["hubCardSha256"], "artifact-manifest.json": source["sha256"]}
    result = manifest["evaluation"]
    if result["status"] != "unavailable":
        raw = inside(root, source["reportSnapshot"]).read_bytes()
        if sha256(raw) != result["report_sha256"]:
            raise ValueError("Numerical report checksum mismatch")
        allowed[result["report"]] = result["report_sha256"]
        report = json.loads(raw)
        arrays = report.get("prediction_arrays", report.get("arrays"))
        if arrays:
            name = str(
                PurePosixPath(result["report"]).parent / arrays.get("file", arrays.get("path"))
            )
            allowed[name] = arrays["sha256"]
    dataset = manifest.get("dataset", {})
    for field in ("source_receipt", "split_manifest", "crosswalk", "membership_report"):
        if dataset.get(field):
            allowed[dataset[field]] = dataset.get(f"{field}_sha256")
    return allowed


def publish(
    root: Path, candidate: Path, target: str, *, api: Any = None, reader: Any = read_public
) -> dict[str, Any]:
    """Owner/parent/checksum gates precede one atomic Hub commit and raw-byte readback."""
    plan = json.loads((candidate / "publication-plan.json").read_text(encoding="utf-8"))
    if plan["target"] != target:
        raise ValueError("Candidate target differs from the requested target")
    source, manifest, _, _ = load_target(root, target)
    expected = manifest["hub"]
    if (
        plan["repo_id"] != expected["repo_id"]
        or plan["expected_parent"] != source["hubCardRevision"]
        or plan["source_revision"] != source["revision"]
        or plan["source_repository"] != f"{OWNER}/{source['repository']}"
        or plan["repo_type"] != expected["repo_type"]
    ):
        raise ValueError("Candidate target/parent differs from reviewed registry")
    allowed = expected_payload(root, source, manifest)
    if plan["files"].keys() != allowed.keys():
        raise ValueError("Candidate paths differ from the reviewed whitelist")
    if {item["path"] for item in expected["files"]} & allowed.keys():
        raise ValueError("Native artifact replacement is forbidden in this metadata release")
    content = {}
    for name, digest in plan["files"].items():
        if name not in {"README.md", "artifact-manifest.json"} and not name.startswith("reports/"):
            raise ValueError("Unreviewed publication path")
        content[name] = inside(candidate, name).read_bytes()
        if sha256(content[name]) != digest or (allowed[name] and allowed[name] != digest):
            raise ValueError("Candidate bytes changed after review")
    if api is None:
        token = os.environ.get("HF_TOKEN")
        if not token:
            raise RuntimeError(
                "HF_PORTFOLIO_TOKEN repository secret is required; never paste it into chat"
            )
        from huggingface_hub import HfApi

        api = HfApi(endpoint="https://huggingface.co", token=token)
    if api.whoami().get("name") != OWNER:
        raise ValueError("HF owner guard: authenticated account is not kiselyovd")
    before = api.repo_info(
        repo_id=plan["repo_id"], repo_type=plan["repo_type"], files_metadata=True
    )
    if before.id != plan["repo_id"]:
        raise ValueError("Hub target identity mismatch")
    for name, digest in allowed.items():
        if digest is None:
            original_source = reader(
                f"https://raw.githubusercontent.com/{OWNER}/{source['repository']}/{source['revision']}/{name}"
            )
            if sha256(original_source) != plan["files"][name]:
                raise ValueError("Candidate provenance differs from its pinned source")
    original = file_identities(before)
    siblings = {item.rfilename: item for item in before.siblings}
    prefix = "datasets/" if plan["repo_type"] == "dataset" else ""
    for item in expected["files"]:
        remote = siblings[item["path"]]
        if remote.lfs:
            digest = remote.lfs.sha256
        else:
            if remote.size is None or remote.size > MAX_FILE_BYTES:
                raise ValueError("Large native file has no metadata checksum")
            digest = sha256(
                reader(
                    f"https://huggingface.co/{prefix}{plan['repo_id']}/resolve/{before.sha}/{item['path']}"
                )
            )
        if digest != item["sha256"]:
            raise ValueError("Current Hub native artifact differs from the reviewed manifest")
    no_op = False
    if before.sha != plan["expected_parent"]:
        if not content.keys() <= original.keys():
            raise ValueError("Hub changed since review; refresh the publication plan")
        no_op = all(
            sha256(
                reader(
                    f"https://huggingface.co/{prefix}{plan['repo_id']}/resolve/{before.sha}/{name}"
                )
            )
            == digest
            for name, digest in plan["files"].items()
        )
        if not no_op:
            raise ValueError("Hub changed since review; refresh the publication plan")
        after = before
    else:
        from huggingface_hub import CommitOperationAdd

        result = api.create_commit(
            repo_id=plan["repo_id"],
            repo_type=plan["repo_type"],
            parent_commit=before.sha,
            operations=[
                CommitOperationAdd(path_in_repo=name, path_or_fileobj=data)
                for name, data in content.items()
            ],
            commit_message=f"Publish reviewed artifact evidence from {plan['source_revision'][:12]}",
        )
        after = api.repo_info(
            repo_id=plan["repo_id"],
            repo_type=plan["repo_type"],
            revision=result.oid,
            files_metadata=True,
        )
    changed = {
        name
        for name in original.keys() | file_identities(after).keys()
        if original.get(name) != file_identities(after).get(name)
    }
    if changed - content.keys() or original.keys() - file_identities(after).keys():
        raise RuntimeError("Post-publication tree changed outside the whitelist")
    for name, digest in plan["files"].items():
        actual = reader(
            f"https://huggingface.co/{prefix}{plan['repo_id']}/resolve/{after.sha}/{name}"
        )
        if sha256(actual) != digest:
            raise RuntimeError("Published payload readback checksum mismatch")
    receipt = {
        "repo_id": plan["repo_id"],
        "repo_type": plan["repo_type"],
        "before": before.sha,
        "after": after.sha,
        "source_repository": plan["source_repository"],
        "source_revision": plan["source_revision"],
        "publisher_repository": os.environ.get("GITHUB_REPOSITORY"),
        "publisher_revision": os.environ.get("GITHUB_SHA"),
        "run_id": os.environ.get("GITHUB_RUN_ID"),
        "files": plan["files"],
        "changed": sorted(changed),
        "native_artifacts_unchanged": True,
        "raw_readback_exact": True,
        "idempotent_no_op": no_op,
    }
    (candidate / "publication-receipt.json").write_text(
        json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    return receipt


def main() -> None:
    """Prepare is the default; publish requires an explicit flag and scoped credential."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--target", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--local-repository", type=Path)
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    if (
        os.environ.get("GITHUB_ACTIONS") == "true"
        and os.environ.get("GITHUB_REPOSITORY_OWNER_ID") != "68559447"
    ):
        raise SystemExit("GitHub owner guard failed")
    if args.publish:
        result = publish(args.root, args.output, args.target)
        print(
            json.dumps(
                {
                    key: result[key]
                    for key in (
                        "repo_id",
                        "after",
                        "native_artifacts_unchanged",
                        "raw_readback_exact",
                    )
                }
            )
        )
    else:
        result = prepare(args.root, args.target, args.output, args.local_repository)
        print(
            json.dumps(
                {"target": result["repo_id"], "files": len(result["files"]), "authenticated": False}
            )
        )


if __name__ == "__main__":
    main()
