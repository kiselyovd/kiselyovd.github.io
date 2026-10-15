---
license: other
license_name: vehicle-yolo-component-terms
license_link: https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/LICENSES.md
library_name: ultralytics
pipeline_tag: keypoint-detection
tags:
- carfusion
- pose
- ultralytics
- vehicle-keypoints
- yolo
- keypoint-detection
- pose-estimation
- computer-vision
- sim-to-real
metrics:
- oks
- pck
model-index:
- name: kiselyovd/vehicle-keypoints
  results:
  - task:
      type: keypoint-detection
      name: 14-point vehicle pose estimation
    dataset:
      type: carfusion
      name: carfusion
    metrics:
    - type: oks_map
      value: 0.5038477111813657
    - type: oks_map_50
      value: 0.7036296602254928
    - type: oks_map_75
      value: 0.5956094705857681
    - type: oks_map_medium
      value: 0.004185689310737217
    - type: oks_map_large
      value: 0.5128098889107303
    - type: pck_0.05
      value: 0.7606000740832202
    - type: test_size
      value: 12761
    - type: n_predictions
      value: 42706
widget:
- src: https://raw.githubusercontent.com/kiselyovd/vehicle-keypoints/f057d0d9f17720a876dd31dece585d08c2e58e02/data/sample/images/car_butler1__16_04881.jpg
  example_title: CarFusion road-scene sample
---

# Vehicle Keypoints

A 14-point vehicle-keypoint detector trained on real CarFusion images. Main weights (`weights.pt`) are **YOLO26-pose**; the `baseline/` directory contains a ViTPose-S reference checkpoint.

[Live inference](https://huggingface.co/spaces/kiselyovd/vehicle-keypoints-demo) · [Multi-vehicle annotation explorer](https://kiselyovd.github.io/vehicle-keypoints/showcase/) · [Code & evaluation](https://github.com/kiselyovd/vehicle-keypoints) · [Documentation](https://kiselyovd.github.io/vehicle-keypoints/) · [Synthetic-data study](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/phase0/synthetic-pretraining.md)

![Geometric 3D pose baseline on a real ApolloCar3D image](https://raw.githubusercontent.com/kiselyovd/vehicle-keypoints/main/docs/images/pose3d_overlay.png)

*This is an output of the companion geometric PnP baseline, not the output of `weights.pt` alone. The [3D evaluation protocol](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/usage-guide.md#monocular-3d-pose-pnp-baseline) uses ApolloCar3D and has separate coverage and domain-shift limits.*

## Use the model

```python
from urllib.request import urlopen
from PIL import Image
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

checkpoint = hf_hub_download("kiselyovd/vehicle-keypoints", "weights.pt",
    revision="d277c2d8c9b5ee49d9fed85fe43bdd72b16a0f06", token=False)
model = YOLO(checkpoint)
image = Image.open(urlopen("https://raw.githubusercontent.com/kiselyovd/vehicle-keypoints/f057d0d9f17720a876dd31dece585d08c2e58e02/data/sample/images/car_butler1__16_04881.jpg")).convert("RGB")
results = model.predict(image, device="cpu", imgsz=640, conf=0.25)
for result in results:
    for box, keypoints, score in zip(result.boxes.xywh, result.keypoints.data, result.boxes.conf):
        print(box.tolist(), score.item(), len(keypoints))
```

The bundled example is a real CarFusion road image. Each detection has a box, confidence score, and 14 `(x, y, keypoint confidence)` triples. `result.boxes.xywh` uses center coordinates plus width and height. Dataset annotations use separate visibility codes `0/1/2`.

## Try it and inspect difficult cases

The [live Space](https://huggingface.co/spaces/kiselyovd/vehicle-keypoints-demo) runs the actual pinned checkpoint on uploaded images. The [annotation explorer](https://kiselyovd.github.io/vehicle-keypoints/showcase/) shows six curated scenes, their original labels and recorded outputs; it is separate from the test benchmark.

The additional overlap scene `car_fifth2 / 7_06521` contains three dataset-labelled vehicles. In the pinned CPU replay, the detector returns one foreground-car box and misses the two overlapping vehicles behind it. The Space includes that source scene; run it at `imgsz=640`, `conf=0.25` and inspect the image/result pair. Source records and image hashes are published with the Space, rather than presented as an aggregate failure rate.

## Evaluation

<!-- ARTIFACT-MANIFEST:START -->
### Current artifact and evaluation

**Stored CarFusion evaluation; not re-executed as part of this audit**

| Metric | Value |
|---|---:|
| OKS-mAP | 50.38% |
| OKS-mAP50 | 70.36% |
| PCK@0.05 | 76.06% |

12761 source test frames, OKS sigmas 0.05, PCK threshold 0.05 of bbox diagonal. Historical report is tracked; original training membership and immutable dataset revision were not recorded. Curated demo outputs are separate illustrations.

[Evaluation record](https://github.com/kiselyovd/vehicle-keypoints/blob/main/reports/metrics.json) · [Pinned model](https://huggingface.co/kiselyovd/vehicle-keypoints/tree/d277c2d8c9b5ee49d9fed85fe43bdd72b16a0f06)
<!-- ARTIFACT-MANIFEST:END -->

## Synthetic-data companion

The [synthetic-only 24-point model](https://huggingface.co/kiselyovd/citysample-vehicle-keypoints-24pt) is a separate artifact trained on the [UE5 dataset](https://huggingface.co/datasets/kiselyovd/citysample-vehicle-keypoints-24pt).

In the published matched experiments, adding synthetic frames reduced real-data OKS-mAP by **1.7 pp** from a weak checkpoint and **9.5 pp** from a strong one. The **+2 pp** acceptance criterion was not met for that recipe. See the [protocol and error analysis](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/phase0/synthetic-pretraining.md).

## Visual evidence

![CarFusion 14-point keypoint schema](https://raw.githubusercontent.com/kiselyovd/vehicle-keypoints/main/docs/images/keypoints_skeleton.png)

![Training curves after the horizontal-flip fix](https://raw.githubusercontent.com/kiselyovd/vehicle-keypoints/main/docs/images/flipfix_results.png)

The second image contains training and validation curves. It is not a grid of predicted keypoints.

## Data and limitations

CarFusion is a limited traffic-scene dataset with scene-level partitions. Its canonical schema covers wheels, lights, roof corners, exhaust, and a body-centre reference point. See [dataset preparation and baseline details](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/usage-guide.md).

Research and education use. These artifacts have not been validated for safety-critical autonomous-driving use. The 3D companion has limited detector coverage and substantial domain shift.

## Licenses and sources

Project code is [MIT](https://github.com/kiselyovd/vehicle-keypoints/blob/main/LICENSE). The earlier author weight declaration was MIT; the YOLO component also carries [Ultralytics upstream terms](https://www.ultralytics.com/license) (AGPL-3.0 or applicable Enterprise terms). That author declaration does not remove upstream obligations. CarFusion is a separate CMU dataset; no standard dataset license is inferred from the software license. [Component details](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/LICENSES.md).

- [CarFusion paper and dataset](http://www.cs.cmu.edu/~ILIM/projects/IM/CarFusion/cvpr2018/index.html)
- [Training recipes](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/training.md)
- [Serving and API](https://github.com/kiselyovd/vehicle-keypoints/blob/main/docs/serving.md)
