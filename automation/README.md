# Reviewed artifact metadata release

This is the GitHub → HF → docs path for a registered evaluation version. The native model weights, processors and dataset shards are identified by immutable revisions/checksums and remain outside the metadata publication whitelist.

1. Source repositories commit their manifest, numerical report/arrays and provenance. The portfolio registry records that immutable source and a reviewed card snapshot. `artifacts:check` validates the whole contract.
2. Run **Publish reviewed HF artifacts** with `publish=false`. It stages only the card, manifest and explicitly referenced numerical/provenance files. The candidate artifact includes `publication-plan.json` with every path and SHA256. No authentication is used in preparation.
3. After review, run the same workflow with `publish=true`. It verifies the exact personal HF account, expected target/parent revision and current native checksums, makes one atomic metadata commit and reads every published file back as raw bytes. Unrelated remote files and native weights cannot change. A changed candidate or concurrent human edit stops publication; an exact repeat is a no-op.
4. A successful publication triggers the existing documentation deployment. Its production-root, artifact and browser checks remain required before Pages deploys. The publication receipt records source GitHub revision, publisher/workflow revision, HF commit, file checksums and readback result.

For local preparation in the existing environment:

```bash
python automation/publish_artifact.py --target grnti-text-classifier --output release-candidate
```

`--local-repository PATH` can read the exact pinned Git objects instead of re-downloading small public reports. No working-tree folders are uploaded. The release path never executes downloaded model code or inference.

## One-time credential setup

The workflow consumes repository secret **`HF_PORTFOLIO_TOKEN`** from `kiselyovd/kiselyovd.github.io`. Create a fine-grained token in the **kiselyovd** HF account with repository-content write access restricted to these resources:

- Models: `kiselyovd/grnti-text-classifier`, `kiselyovd/chest-xray-classifier`, `kiselyovd/brain-mri-segmentation`, `kiselyovd/cardio-risk-rf`, `kiselyovd/vehicle-keypoints`, `kiselyovd/citysample-vehicle-keypoints-24pt`.
- Dataset: `kiselyovd/citysample-vehicle-keypoints-24pt`.

Add it directly through [GitHub Actions repository secrets](https://github.com/kiselyovd/kiselyovd.github.io/settings/secrets/actions). Never paste it into a chat or commit it. Preparation, drift checks and tests work without this credential. Publication refuses implicit cached credentials and aborts if the authenticated HF account is different. Hardware, billing, account settings and new repository creation are outside this publisher.

The separate GRNTI Space source remains in its project repository, with a pinned native model contract and production-root CI. Space builds and model evidence releases have distinct runtime proofs.
