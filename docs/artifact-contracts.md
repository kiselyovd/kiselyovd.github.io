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
