"""Load one immutable public model and exercise its native inference contract.

This is an interface smoke test, never a quality replay or clinical example.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = (
    "brain-mri-segmentation",
    "chest-xray-classifier",
    "cardio-risk-rf",
    "grnti-text-classifier",
    "vehicle-keypoints",
    "synthetic-vehicle-model",
)


def load_contract(target: str, root: Path = ROOT) -> dict:
    """Read the same immutable contract the production portfolio consumes."""
    if target not in TARGETS:
        raise ValueError("Unknown smoke target")
    registry = json.loads((root / "evidence/portfolio-sources.json").read_text(encoding="utf-8"))
    source = next(item for item in registry["sources"] if item["id"] == target)
    raw = (root / source["snapshot"]).read_bytes()
    if hashlib.sha256(raw).hexdigest() != source["sha256"]:
        raise ValueError("Unreviewed manifest bytes")
    contract = json.loads(raw)
    hub = contract["hub"]
    if not hub["repo_id"].startswith("kiselyovd/") or len(hub["revision"]) != 40:
        raise ValueError("Expected personal owner and immutable model revision")
    return contract


def verify_file(path: Path, expected: str) -> None:
    """Check bytes before any pickle, model or processor code is loaded."""
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != expected:
        raise ValueError(f"Native checksum mismatch: {path.name}")


def check_probabilities(values, rows: int, classes: int) -> None:
    """Reject malformed, non-finite or non-probabilistic output."""
    if len(values) != rows or any(len(row) != classes for row in values):
        raise ValueError("Probability output shape mismatch")
    for row in values:
        if any(not math.isfinite(float(value)) or not 0 <= value <= 1 for value in row):
            raise ValueError("Invalid probability")
        if abs(sum(row) - 1) > 1e-5:
            raise ValueError("Probability row does not sum to one")


def image_probe():
    """An authored, non-medical RGB pattern with a non-square input shape."""
    import numpy as np
    from PIL import Image

    yy, xx = np.indices((197, 263))
    pixels = np.stack((xx % 256, yy % 256, (xx + yy) % 256), axis=-1).astype("uint8")
    return Image.fromarray(pixels)


def inference(target: str, contract: dict, files: dict[str, Path], offline: bool) -> dict:
    """Exercise the published native path on explicit synthetic interface probes."""
    hub = contract["hub"]
    if target == "cardio-risk-rf":
        import joblib
        import numpy as np
        import pandas as pd

        frame = pd.DataFrame(
            [
                dict(
                    age=45,
                    gender=1,
                    height=170,
                    weight=70,
                    ap_hi=120,
                    ap_lo=80,
                    cholesterol=1,
                    gluc=1,
                    smoke=0,
                    alco=0,
                    active=1,
                ),
                dict(
                    age=60,
                    gender=2,
                    height=175,
                    weight=85,
                    ap_hi=150,
                    ap_lo=95,
                    cholesterol=2,
                    gluc=1,
                    smoke=0,
                    alco=0,
                    active=0,
                ),
            ]
        )
        # Only SHA-verified personal artifacts are deserialized.
        main = joblib.load(files["cardio_risk_lgbm.joblib"])["model"]
        alias = joblib.load(files["sklearn_model.joblib"])
        baseline = joblib.load(files["cardio_risk_rf.joblib"])["model"]
        expected = main.predict_proba(frame)
        check_probabilities(expected.tolist(), 2, 2)
        check_probabilities(baseline.predict_proba(frame).tolist(), 2, 2)
        if not np.array_equal(expected, alias.predict_proba(frame)):
            raise ValueError("Canonical bundle / inference alias parity failed")
        return {"shape": list(expected.shape), "alias_exact": True, "baseline_exercised": True}

    import torch

    torch.set_num_threads(4)
    torch.manual_seed(42)
    options = dict(revision=hub["revision"], token=False, local_files_only=offline)
    if target in {"vehicle-keypoints", "synthetic-vehicle-model"}:
        import numpy as np
        from ultralytics import YOLO

        weight = next(record["path"] for record in hub["files"] if record["role"] == "weights")
        model = YOLO(str(files[weight]), task="pose")
        points = 14 if target == "vehicle-keypoints" else 24
        if list(model.model.yaml["kpt_shape"]) != [points, 3]:
            raise ValueError("Checkpoint keypoint schema mismatch")
        result = model.predict(
            np.asarray(image_probe()),
            device="cpu",
            imgsz=640 if points == 14 else 480,
            conf=0.25,
            verbose=False,
        )[0]
        keys = result.keypoints.data
        if tuple(keys.shape[1:]) != (points, 3) or not torch.isfinite(keys).all():
            raise ValueError("Invalid keypoint output")
        if not torch.isfinite(result.boxes.data).all():
            raise ValueError("Invalid detection output")
        return {"keypoint_shape": list(keys.shape), "detections": len(result.boxes)}

    from transformers import (
        AutoImageProcessor,
        AutoModelForImageClassification,
        AutoModelForSequenceClassification,
        AutoModelForSemanticSegmentation,
        AutoTokenizer,
    )

    if target == "grnti-text-classifier":
        tokenizer = AutoTokenizer.from_pretrained(
            hub["repo_id"], trust_remote_code=False, **options
        )
        model = AutoModelForSequenceClassification.from_pretrained(
            hub["repo_id"], trust_remote_code=False, **options
        ).eval()
        labels = model.config.id2label
        if len(labels) != 28 or len(set(labels.values())) != 28:
            raise ValueError("GRNTI label contract mismatch")
        text = "В работе рассматриваются методы маршрутизации и управления трафиком в компьютерных сетях."
        inputs = tokenizer(text, max_length=256, truncation=True, return_tensors="pt")
        with torch.inference_mode():
            values = model(**inputs).logits.softmax(-1)
        check_probabilities(values.tolist(), 1, 28)
        indices = values[0].topk(5).indices.tolist()
        return {"shape": list(values.shape), "top_five_codes": [labels[index] for index in indices]}

    # Chest has one explicitly reviewed processor module; it was SHA-checked above.
    processor = AutoImageProcessor.from_pretrained(
        hub["repo_id"], trust_remote_code=target == "chest-xray-classifier", **options
    )
    inputs = processor(images=image_probe(), return_tensors="pt")
    size = 224 if target == "chest-xray-classifier" else 256
    if list(inputs["pixel_values"].shape) != [1, 3, size, size]:
        raise ValueError("Native processor input shape mismatch")
    if target == "chest-xray-classifier":
        model = AutoModelForImageClassification.from_pretrained(
            hub["repo_id"], trust_remote_code=False, **options
        ).eval()
        if {str(key): value for key, value in model.config.id2label.items()} != contract[
            "inference"
        ]["labels"]:
            raise ValueError("Chest class order mismatch")
        with torch.inference_mode():
            values = model(**inputs).logits.softmax(-1)
        check_probabilities(values.tolist(), 1, 3)
        return {"shape": list(values.shape), "processor_shape": list(inputs["pixel_values"].shape)}
    model = AutoModelForSemanticSegmentation.from_pretrained(
        hub["repo_id"], trust_remote_code=False, **options
    ).eval()
    with torch.inference_mode():
        logits = model(**inputs).logits
    if list(logits.shape[:2]) != [1, 2] or not torch.isfinite(logits).all():
        raise ValueError("Invalid foreground segmentation logits")
    return {
        "logit_shape": list(logits.shape),
        "processor_shape": list(inputs["pixel_values"].shape),
    }


def run(target: str, out: Path, offline: bool = False) -> None:
    """Check budget, artifact bytes, actual inference and a durable receipt."""
    from huggingface_hub import constants, hf_hub_download

    contract = load_contract(target)
    hub = contract["hub"]
    cache = Path(constants.HF_HUB_CACHE)
    cache.mkdir(parents=True, exist_ok=True)
    out.parent.mkdir(parents=True, exist_ok=True)
    # CI starts with >=30 GiB before packages; reserve here covers model/temp copies.
    # Offline local verification allocates no downloaded model copies.
    if not offline:
        for path in (cache, out.parent):
            if shutil.disk_usage(path).free < 24 * 1024**3:
                raise ValueError("Need 20 GiB reserve plus 4 GiB peak model/download budget")
    files = {}
    for record in hub["files"]:
        path = Path(
            hf_hub_download(
                hub["repo_id"],
                record["path"],
                revision=hub["revision"],
                token=False,
                local_files_only=offline,
            )
        )
        verify_file(path, record["sha256"])
        files[record["path"]] = path
    result = inference(target, contract, files, offline)
    versions = {}
    for package in (
        "torch",
        "transformers",
        "huggingface-hub",
        "ultralytics",
        "scikit-learn",
        "lightgbm",
    ):
        try:
            versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            continue
    receipt = {
        "target": target,
        "repo_id": hub["repo_id"],
        "revision": hub["revision"],
        "native_sha256": {r["path"]: r["sha256"] for r in hub["files"]},
        "input_kind": "authored synthetic interface probes; no benchmark or clinical claim",
        "result": result,
        "packages": versions,
        "status": "passed",
    }
    out.write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    print(f"{target}: pinned bytes verified; native inference passed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", choices=TARGETS)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()
    run(args.target, args.out, args.offline)
