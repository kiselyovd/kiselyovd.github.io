"""Render identity previews from reviewed project figures, without reading metrics."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PALETTES = {
    "dark": {
        "background": "#050505",
        "surface": "#0f0f10",
        "text": "#fafafa",
        "muted": "#b8b8b8",
        "accent": "#06b6d4",
    },
    "light": {
        "background": "#ffffff",
        "surface": "#f4f4f5",
        "text": "#09090b",
        "muted": "#52525b",
        "accent": "#0e7490",
    },
}


def sha(path: Path) -> str:
    """Identify exact source and rendered bytes."""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def child(root: Path, relative: str) -> Path:
    """Keep registry paths inside the checked source tree."""
    target = (root / relative).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError("Preview source escapes root")
    return target


def registry(root: Path) -> dict:
    """Validate authored copy, pinned source identities and font bytes."""
    data = json.loads((root / "evidence/previews/projects.json").read_text(encoding="utf-8"))
    if data["owner"] != "kiselyovd" or len({p["id"] for p in data["projects"]}) != 7:
        raise ValueError("Expected seven personal non-Dungeon previews")
    for project in data["projects"]:
        if project["id"] == "dungeon-master-ai":
            raise ValueError("Dungeon is explicitly outside this change")
        source = project["source"]
        if len(source["revision"]) != 40 or sha(child(root, project["visual"])) != source["sha256"]:
            raise ValueError(f"Source checksum mismatch: {project['id']}")
        copy = " ".join(project[key] for key in ("title", "category", "tagline", "links"))
        if any(
            token in copy.lower() for token in ("accuracy", "dice", "map50", "%", "2026", "v0.")
        ):
            raise ValueError("Identity copy must not contain changing scores, versions or dates")
    fonts = root / "evidence/previews/fonts"
    for record in json.loads((fonts / "source.json").read_text(encoding="utf-8")):
        if sha(child(fonts, record["path"])) != record["sha256"]:
            raise ValueError("Font checksum mismatch")
    return data


def font(root: Path, size: int, weight: int = 400) -> ImageFont.FreeTypeFont:
    """Use the same pinned Inter face on Windows and CI."""
    face = ImageFont.truetype(str(root / "evidence/previews/fonts/Inter.ttf"), size)
    face.set_variation_by_axes([14, weight])
    return face


def render(root: Path, project: dict, theme: str) -> Image.Image:
    """Compose a fixed safe-area layout around an unchanged evidence crop."""
    palette = PALETTES[theme]
    canvas = Image.new("RGB", (1280, 640), palette["background"])
    draw = ImageDraw.Draw(canvas)

    def text(position, value, size, color, weight=400, maximum=(540, 200)):
        face = font(root, size, weight)
        box = draw.multiline_textbbox(position, value, font=face, spacing=9)
        if box[2] - position[0] > maximum[0] or box[3] - position[1] > maximum[1]:
            raise ValueError(f"Preview copy exceeds safe area: {project['id']} / {value}")
        draw.multiline_text(position, value, font=face, fill=color, spacing=9)

    text((72, 68), project["category"], 20, palette["accent"], 600)
    text((72, 153), project["title"], 52, palette["text"], 650, (552, 166))
    text((72, 330), project["tagline"], 26, palette["muted"], maximum=(550, 140))
    text((72, 548), "github.com/kiselyovd", 19, palette["muted"])
    text((654, 548), project["links"], 18, palette["accent"], 500, (554, 40))

    source = Image.open(child(root, project["visual"])).convert("RGB")
    if project.get("crop"):
        bounds = project["crop"]
        if not (
            0 <= bounds[0] < bounds[2] <= source.width
            and 0 <= bounds[1] < bounds[3] <= source.height
        ):
            raise ValueError("Invalid evidence crop")
        source = source.crop(bounds)
    draw.rectangle((654, 146, 1208, 494), fill=palette["surface"])
    image = ImageOps.contain(source, (554, 348), Image.Resampling.LANCZOS)
    canvas.paste(image, (654 + (554 - image.width) // 2, 146 + (348 - image.height) // 2))
    # This caption identifies the evidence. Its numbers, if any, are not headline metrics.
    text((654, 505), project["caption"], 16, palette["muted"], maximum=(554, 30))
    return canvas


def run(root: Path, check: bool = False) -> None:
    """Render outputs or check their reviewed bytes and input lineage."""
    data = registry(root)
    outputs = root / "public/previews"
    receipt_path = root / "evidence/previews/rendered.json"
    renderer_hash = sha(Path(__file__))
    if check:
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        if receipt["renderer_sha256"] != renderer_hash or receipt["registry_sha256"] != sha(
            root / "evidence/previews/projects.json"
        ):
            raise ValueError("Preview renderer or metadata changed; regenerate and review outputs")
        for record in receipt["outputs"]:
            path = child(root, record["path"])
            with Image.open(path) as image:
                if image.size != (1280, 640) or image.mode != "RGB":
                    raise ValueError("Preview dimensions/mode mismatch")
            if path.stat().st_size >= 1_000_000 or sha(path) != record["sha256"]:
                raise ValueError("Preview output changed or exceeds GitHub limit")
        if len(receipt["outputs"]) != 14:
            raise ValueError("Missing dark/light preview")
        print("14 reviewed previews: source hashes, safe metadata, dimensions and bytes match")
        return
    records = []
    for project in data["projects"]:
        for theme in PALETTES:
            image = render(root, project, theme)
            folder = outputs / project["id"]
            folder.mkdir(parents=True, exist_ok=True)
            path = folder / (
                "social-preview.png" if theme == "dark" else "social-preview-light.png"
            )
            image.save(path, optimize=True)
            if path.stat().st_size >= 1_000_000:
                raise ValueError("Preview exceeds GitHub file-size limit")
            records.append(
                {
                    "project": project["id"],
                    "theme": theme,
                    "path": path.relative_to(root).as_posix(),
                    "sha256": sha(path),
                    "bytes": path.stat().st_size,
                }
            )
    receipt_path.write_text(
        json.dumps(
            {
                "renderer_sha256": renderer_hash,
                "registry_sha256": sha(root / "evidence/previews/projects.json"),
                "outputs": records,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print("Rendered 14 previews from seven reviewed figures")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    run(ROOT, args.check)
