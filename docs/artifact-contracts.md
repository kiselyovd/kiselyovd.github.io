# Portfolio artifact contracts

The portfolio's five model rows are generated from seven versioned artifact contracts: six models and one synthetic dataset. They share numerical reports with the source repositories and HF cards rather than maintaining independent score strings.

`evidence/portfolio-sources.json` records immutable GitHub and HF card revisions. `evidence/artifacts/` preserves their exact reviewed bytes, including report and card checksums. `scripts/portfolio-artifacts.mjs` verifies these inputs and generates `src/data/ml-artifacts.json`. Medical scores use the replay protocol actually recorded; original training membership remains unverified. Historical Vehicle/synthetic results stay labelled as recorded reports.

```bash
npm run artifacts:generate
npm run artifacts:check
npm run build
npm run test:artifacts
npm run test:showcase
npm run artifacts:remote
```

The remote check compares pinned GitHub manifests/reports, the current HF generated card blocks, and native Hub LFS checksums or small config bytes. Large model stores and image columns are never downloaded. Dataset lineage is bound to the exact crosswalk checksum. A missing report, changed score, mutable revision or mismatching native artifact fails the check. Tests deliberately alter reports and HF scores to verify those failures.

The **Artifact integrity** workflow runs on pushes, PRs, manual dispatch and weekly on Monday at 06:17 UTC. It reads public evidence and requires no HF write credential. Deployment also checks the generated production root. Updating evidence requires reviewing the upstream release and replacing the corresponding immutable source snapshots before regeneration.

Experience-year and repository counters were removed. The existing layout, design tokens, enterprise/project ordering and bilingual controls are preserved. Each metric links to its pinned report; its evidence status links to the full manifest.

## Native load and inference smoke

The manually dispatched **Native artifact smoke** workflow verifies all six published model contracts in a frozen, standalone Python 3.12 CPU environment. It checks every manifest-listed native file's SHA256 before loading any weights or processor code, then performs a small native inference. The six matrix jobs require no write credential and publish exact-revision receipts. Packages and temporary model downloads are budgeted before installation, retaining a 20 GiB reserve.

The probes use an authored image pattern, a short Russian text and two synthetic tabular rows. They verify processor dimensions, label order, probability shape/range, foreground logits, detector keypoint schemas and canonical/alias Cardio parity. They do not estimate benchmark quality, validate clinical use, or re-establish historical split independence. Quality replay remains a separate, explicit operation in each source repository.

```bash
python automation/smoke_artifact.py grnti-text-classifier --out smoke-receipts/grnti.json
# Reuse an already populated pinned cache without downloading:
python automation/smoke_artifact.py grnti-text-classifier --offline --out smoke-receipts/grnti.json
```

The shared preview renderer, real-figure provenance and dark/light variants are documented in [the visual-system guide](visual-system.md).

All six native smoke jobs passed in [run 38795274625](https://github.com/kiselyovd/kiselyovd.github.io/actions/runs/38795274625). Their exact native revisions, checksums, package versions and output contracts are preserved in [the durable receipt](../evidence/publications/native-smoke-2026-10-15.json).


## Exact evidence bytes and browser QA

Evidence snapshots retain the bytes read back from their immutable upstream revision. Git text conversion is disabled for `evidence/artifacts/**`; neither binary artifacts nor third-party text evidence may be silently normalised before checksum validation. Author-created source files use the declared LF conventions. A candidate card should use its chosen line endings before publication, then pass a raw-byte readback.

`qa/` is an isolated development-only package with locked Playwright/axe versions. CI uses the emitted Pages build, checks 1280px light and 390px dark/reduced-motion contexts, records actual viewport dimensions, keyboard behavior and axe findings. It also checks the four public project explorers and both free HF Spaces without running GPU inference. Screenshots and actionable violations are retained as the `accessibility-evidence` artifact. Automated rules complement manual browser checks; they are not a complete accessibility certification.
