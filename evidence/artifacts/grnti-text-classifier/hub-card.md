---
language: ru
license: mit
library_name: transformers
pipeline_tag: text-classification
base_model: FacebookAI/xlm-roberta-base
datasets:
  - ai-forever/ru-scibench-grnti-classification
tags: [xlm-roberta, russian-nlp, grnti, multiclass]
widget:
  - text: "\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435 \u043a\u0432\u0430\u043d\u0442\u043e\u0432\u043e\u0439 \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u0434\u0438\u043d\u0430\u043c\u0438\u043a\u0438 \u0432 \u043a\u0440\u0438\u0441\u0442\u0430\u043b\u043b\u0430\u0445."
model-index:
  - name: kiselyovd/grnti-text-classifier
    results:
      - task:
          type: text-classification
          name: GRNTI subject classification
        dataset:
          name: ru-scibench-grnti-classification pinned source test
          type: ai-forever/ru-scibench-grnti-classification
          revision: a984f8a65b2e9fae7a347bf7761b0eaad79c73a1
        metrics:
          - type: accuracy
            value: 0.7236652236652237
            name: Top-1 accuracy
          - type: accuracy
            value: 0.9675324675324676
            name: Top-5 accuracy
          - type: f1
            value: 0.7230108137637654
            name: Macro F1
---

# Scientific-Text Classification

XLM-RoBERTa assigns Russian scientific titles/abstracts to 28 GRNTI subjects.

**[Classify your own abstract](https://huggingface.co/spaces/kiselyovd/grnti-text-classifier-demo)** · [Browse source subjects](https://kiselyovd.github.io/grnti-text-classifier/showcase/) · [Code & evaluation](https://github.com/kiselyovd/grnti-text-classifier)

## Evaluation

<!-- ARTIFACT-MANIFEST:START -->
### Current artifact and evaluation

**Native checkpoint replay on 2,772 pinned source test abstracts**

| Metric | Value |
|---|---:|
| Top-1 accuracy | 72.37% |
| Top-5 accuracy | 96.75% |
| Macro F1 | 72.30% |

Current pinned source test split. Original training dataset revision and membership were not recorded; held-out independence is not re-established by this replay.

[Evaluation record](https://github.com/kiselyovd/grnti-text-classifier/blob/main/reports/replay-native.json) · [Pinned model](https://huggingface.co/kiselyovd/grnti-text-classifier/tree/24fbe75c27112612a464935c95465def6af788ef)
<!-- ARTIFACT-MANIFEST:END -->

The replay stores logits, source IDs and targets. Original training membership is unrecorded. Historical ruBERT baseline values (72.9% top-1 / 95.9% top-5 / 72.8% macro F1) were not replayed here. [Protocol and source checksums](https://github.com/kiselyovd/grnti-text-classifier/blob/main/docs/EVALUATION.md).

## Use the native checkpoint

```python
from transformers import pipeline

classifier = pipeline(
    "text-classification", model="kiselyovd/grnti-text-classifier",
    revision="24fbe75c27112612a464935c95465def6af788ef",
    trust_remote_code=False, top_k=5,
)
print(classifier("Исследование квантовой электродинамики в кристаллах.",
                 truncation=True, max_length=256))
```

The training/inference recipe is **256 tokens**, although the tokenizer capacity is 512. Scores are uncalibrated softmax values. Exact five- and six-digit checkpoint code strings are preserved; `680000` and `683500` share the same stored name and remain separate classes.

## Numerical evidence

![Per-class F1 from saved replay](https://raw.githubusercontent.com/kiselyovd/grnti-text-classifier/main/docs/images/per_class_f1.png)

![Row-normalised confusion matrix from saved replay](https://raw.githubusercontent.com/kiselyovd/grnti-text-classifier/main/docs/images/confusion_matrix.png)

## Scope and component terms

The model targets Russian scientific subject assignment. Domain shift, overlapping subjects and text truncation limit its use. Visitor examples are illustrations rather than benchmark labels.

Code and the author-declared weights are MIT. The source corpus and XLM-RoBERTa-base separately declare MIT; dependencies retain their terms. [Component details and citation](https://github.com/kiselyovd/grnti-text-classifier/blob/main/docs/EVALUATION.md#component-terms).
