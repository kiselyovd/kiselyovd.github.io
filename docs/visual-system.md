# Project previews and evidence figures

The seven non-Dungeon previews share the portfolio's existing Inter typography, cyan accent, dark background and light alternative. The layout gives the project name and purpose space on the left, with a real project figure on the right. Dungeon remains under its own active development and is excluded from this change.

`evidence/previews/projects.json` records authored copy, the exact source repository/revision/path/checksum, and an explicit evidence crop. It contains no benchmark scores. The reviewed original figure bytes are stored beside it so rendering does not download models or rerun evaluation. `automation/render_social_previews.py` renders the images with Pillow. The pinned Inter font is included under its SIL Open Font License; original font URLs and hashes are in `evidence/previews/fonts/source.json`.

```bash
python -m pip install -r automation/requirements-dev.txt
python automation/render_social_previews.py
python automation/render_social_previews.py --check
python -m unittest discover -s automation/tests -v
```

Outputs live in `public/previews/<repository>/`: `social-preview.png` for the common dark appearance and `social-preview-light.png` for light backgrounds. Both are opaque 1280×640 PNGs below 1,000,000 bytes. `evidence/previews/rendered.json` binds the renderer, registry and output bytes. CI rejects changed sources, missing variants, oversized files, unsafe paths and stale rendered metadata. Rendering itself rejects text clipping and crops outside the source image.

The source projects receive these two assets in `docs/images/` and a provenance receipt in `reports/provenance/social-preview.json`. Their README uses a separate result figure. GitHub's social preview setting is updated after review; public image readback is checked against the selected dark asset. A receipt or screenshot alone is not evidence that the setting saved successfully.

## Figure provenance

| Project | Actual visual | Scope and terms |
|---|---|---|
| Vehicle Keypoints | Recorded model predictions on a multi-vehicle CarFusion frame | Curated illustration; CMU CarFusion research terms |
| Brain MRI | Native predicted mask and reference mask on a committed LGG sample | Research illustration; Buda LGG CC BY-NC-SA 4.0; upstream model terms remain separate |
| Chest X-ray | Correct predictions and errors from the native replay | Kermany/Zhang/Goldbaum CC BY 4.0; no clinical claim |
| Cardio | SHAP source-feature attribution | Recorded validation sample; no prospective or causal claim; dataset license remains unknown |
| GRNTI | Native prediction on an author-written abstract | Uncalibrated example scores, separate from benchmark evaluation |
| UE5 Vehicle Synth | Projected ground-truth vehicle geometry | UE/Epic rendered-asset terms remain separate from MIT code |
| ML Project Template | Real scaffold explorer | Source project code and screenshot |

Do not replace research limitations with a headline score or embed release versions, dataset counts, benchmark scores or dates into preview copy. Probabilities visible inside a recorded example are part of that specific output, not advertised benchmark metrics. Retain the original figure-selection/source receipts when generating a derivative preview.
