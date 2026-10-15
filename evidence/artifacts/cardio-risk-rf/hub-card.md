---
license: mit
library_name: sklearn
pipeline_tag: tabular-classification
tags:
  - lightgbm
  - random-forest
  - cardiovascular
  - tabular
---

# Cardiovascular Disease Classification

LightGBM and RandomForest classify the Sulianova source label `cardio`: disease presence at medical examination. The released models use 11 features and rounded age in years. [Source and evaluation](https://github.com/kiselyovd/cardio-risk-rf).

## Results

<!-- ARTIFACT-MANIFEST:START -->
### Current artifact and evaluation

**Replayed on the original 10501-row test fold, legacy seed42 protocol**

| Metric | Value |
|---|---:|
| LightGBM ROC-AUC | 79.77% |
| LightGBM average precision | 78.11% |
| RF ROC-AUC | 79.49% |
| RF average precision | 77.94% |

Target is CVD presence at examination. The exact legacy split is 48999/10500/10501; original training row membership is unrecorded. Average precision uses sklearn AP.

[Evaluation record](https://github.com/kiselyovd/cardio-risk-rf/blob/main/reports/replay-native.json) · [Pinned model](https://huggingface.co/kiselyovd/cardio-risk-rf/tree/a0117e88461cf4197a2a604203f68dde23fd069a)
<!-- ARTIFACT-MANIFEST:END -->

[Exact data and split contract](https://github.com/kiselyovd/cardio-risk-rf/blob/main/docs/EVALUATION.md). Average precision is sklearn AP; F1/Brier use the recorded 0.5 threshold. This is a research comparison on one reconstructed cohort; clinical validation and original training row IDs are unrecorded.

## Load the canonical bundle

The canonical `cardio_risk_lgbm.joblib` and `cardio_risk_rf.joblib` files are dict bundles: `model`, `best_params`, `cv_pr_auc`. Use `bundle["model"]`. The separate `sklearn_model.joblib` file is the main estimator as a plain Pipeline for generic HF/sklearn clients; it has the same predictions and a separate checksum.

```python
import hashlib
import joblib
import pandas as pd
from huggingface_hub import hf_hub_download

REPO = "kiselyovd/cardio-risk-rf"
REVISION = "a0117e88461cf4197a2a604203f68dde23fd069a"
path = hf_hub_download(REPO, "cardio_risk_lgbm.joblib", revision=REVISION)
with open(path, "rb") as stream:
    assert hashlib.file_digest(stream, "sha256").hexdigest() == "d0b96ed0fb1209be8ed73ebb41d41225d6d106c2f291a285c6c9fc8950a2ad39"
model = joblib.load(path)["model"]
# Synthetic interface example. Model age is rounded years, not raw source days.
row = pd.DataFrame([dict(
    age=54, gender=2, height=175, weight=80, ap_hi=130, ap_lo=85,
    cholesterol=1, gluc=1, smoke=0, alco=0, active=1,
)]).astype(float)
print(float(model.predict_proba(row)[0, 1]))
```

Deserialize only trusted files after verifying identity. The Pipeline accepts columns in the documented 11-feature order. LightGBM handles missing values; RF applies the fitted median imputer. Scores are model outputs with no prospective time horizon attached.

## Source and protocol

[Original Kaggle source](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset): 70,000 rows. Raw age days are converted using `round(age/365.25)`. The legacy seed 42 float/ceil split yields 48,999 train / 10,500 validation / 10,501 test rows; the released RF records 48,999 training rows. The recipe is preserved for replay rather than changing old membership.

[Source receipt](https://github.com/kiselyovd/cardio-risk-rf/blob/main/reports/provenance/source.json) · [Exact row split](https://github.com/kiselyovd/cardio-risk-rf/blob/main/reports/provenance/split-rows.json) · [Bundle and alias evidence](https://github.com/kiselyovd/cardio-risk-rf/blob/main/reports/provenance/alias.json).

The alias was compared with the canonical main model on all 10,501 test rows: zero probability difference. The retained Framingham/TenYearCHD loader and older 49-row experiment are historical material and do not describe these models.

## Component terms

Project code and the model Hub declaration are MIT. The source-data publisher's license field is Unknown; the software license does not assign rights to the original clinical rows. Upstream library notices remain separate. [Component details](https://github.com/kiselyovd/cardio-risk-rf/blob/main/docs/LICENSES.md) · [CITATION.cff](https://github.com/kiselyovd/cardio-risk-rf/blob/main/CITATION.cff).
