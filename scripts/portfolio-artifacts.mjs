/** Generate portfolio values from immutable, checksum-bound upstream artifacts. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

function local(root, relative) {
  const resolved = path.resolve(root, relative);
  assert.ok(resolved.startsWith(`${path.resolve(root)}${path.sep}`), 'Evidence path escapes root');
  return resolved;
}

export function scoreAt(report, pointer) {
  assert.ok(pointer.startsWith('/'), 'Metric requires an explicit JSON pointer');
  const value = pointer
    .slice(1)
    .split('/')
    .reduce((node, key) => node[key], report);
  assert.ok(
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1,
    'Metric must be a finite fraction',
  );
  return value;
}

export function generate(root = projectRoot) {
  const registry = JSON.parse(readFileSync(local(root, 'evidence/portfolio-sources.json'), 'utf8'));
  assert.equal(registry.owner, 'kiselyovd');
  assert.equal(new Set(registry.sources.map((source) => source.id)).size, 7);
  const contracts = [];
  for (const source of registry.sources) {
    assert.match(source.revision, /^[a-f0-9]{40}$/);
    const bytes = readFileSync(local(root, source.snapshot));
    assert.equal(hash(bytes), source.sha256, `Manifest checksum: ${source.id}`);
    const manifest = JSON.parse(bytes);
    assert.equal(manifest.hub.repo_id.split('/')[0], registry.owner);
    assert.match(manifest.hub.revision, /^[a-f0-9]{40}$/);
    for (const file of manifest.hub.files) assert.match(file.sha256, /^[a-f0-9]{64}$/);
    const result = manifest.evaluation;
    assert.ok(
      ['reported', 'replayed_reconstructed', 'verified_held_out', 'unavailable'].includes(
        result.status,
      ),
    );
    if (result.status === 'verified_held_out')
      assert.equal(result.training_membership_verified, true);
    let report = null;
    if (result.status === 'unavailable') {
      assert.equal(result.metrics.length, 0, 'Unavailable evidence cannot advertise zero scores');
    } else {
      const numerical = readFileSync(local(root, source.reportSnapshot));
      assert.equal(hash(numerical), result.report_sha256, `Report checksum: ${source.id}`);
      report = JSON.parse(numerical);
      if (result.status !== 'reported') {
        assert.ok(
          manifest.hub.files.some(
            (file) => file.role === 'weights' && file.sha256 === report.artifact.sha256,
          ),
        );
      }
    }
    const card = readFileSync(local(root, source.hubCardSnapshot));
    assert.equal(hash(card), source.hubCardSha256, `Card snapshot checksum: ${source.id}`);
    assertCard(manifest, report, card.toString('utf8'));
    const metrics = Object.fromEntries(
      result.metrics.map((metric) => [metric.name, scoreAt(report, metric.pointer)]),
    );
    contracts.push({
      id: source.id,
      repo: source.repository,
      revision: source.revision,
      hubRepo: manifest.hub.repo_id,
      hubRevision: manifest.hub.revision,
      status: result.status,
      scope: result.scope,
      trainingMembershipVerified: result.training_membership_verified,
      metrics,
      reportUrl: result.report
        ? `https://github.com/kiselyovd/${source.repository}/blob/${source.revision}/${result.report}`
        : null,
      manifestUrl: `https://github.com/kiselyovd/${source.repository}/blob/${source.revision}/${source.manifest}`,
      demoUrl: manifest.demo?.url ?? null,
    });
  }
  const rows = registry.rows.map((row) => {
    const contract = contracts.find((item) => item.id === row.artifact);
    assert.ok(contract, `Unknown row source: ${row.artifact}`);
    assert.ok(Object.hasOwn(contract.metrics, row.metric), `Missing metric for ${row.artifact}`);
    return {
      repo: contract.repo,
      task: row.task,
      model: row.model,
      metrics: `${row.metricLabel} ${(contract.metrics[row.metric] * 100).toFixed(2)}%`,
      hfSlug: contract.hubRepo.split('/')[1],
      status: contract.status,
      scope: contract.scope,
      reportUrl: contract.reportUrl,
      manifestUrl: contract.manifestUrl,
      demoUrl: contract.demoUrl,
      downloads: row.downloads ?? false,
    };
  });
  return { owner: registry.owner, contracts, rows };
}

export function assertCard(manifest, report, text) {
  const result = manifest.evaluation;
  if (result.status === 'unavailable') {
    assert.ok(text.includes(manifest.dataset.crosswalk_sha256), 'Dataset crosswalk drift');
    return;
  }
  const lines = [
    '<!-- ARTIFACT-MANIFEST:START -->',
    '### Current artifact and evaluation',
    '',
    `**${result.label}**`,
    '',
    '| Metric | Value |',
    '|---|---:|',
    ...result.metrics.map(
      (metric) => `| ${metric.name} | ${(scoreAt(report, metric.pointer) * 100).toFixed(2)}% |`,
    ),
    '',
    result.scope,
    '',
    `[Evaluation record](https://github.com/kiselyovd/${manifest.project}/blob/main/${result.report}) · [Pinned model](https://huggingface.co/${manifest.hub.repo_id}/tree/${manifest.hub.revision})`,
    '<!-- ARTIFACT-MANIFEST:END -->',
  ];
  assert.ok(
    text.replaceAll('\r\n', '\n').includes(lines.join('\n')),
    `HF card drift: ${manifest.project}`,
  );
}

async function fetchBytes(url, limit) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  assert.ok(response.ok, `Source unavailable: ${url}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    assert.ok(size <= limit, 'Evidence download exceeds metadata budget');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function boundedFetch(url, limit = 2 * 1024 ** 2) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetchBytes(url, limit);
    } catch (error) {
      if (attempt === 3 || error.code === 'ERR_ASSERTION') throw error;
      console.warn(`Transient evidence request failed; retry ${attempt}/3`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
}

export async function verifyRemote(root = projectRoot) {
  const registry = JSON.parse(readFileSync(local(root, 'evidence/portfolio-sources.json'), 'utf8'));
  for (const source of registry.sources) {
    const url = `https://raw.githubusercontent.com/kiselyovd/${source.repository}/${source.revision}/${source.manifest}`;
    const bytes = await boundedFetch(url);
    assert.equal(hash(bytes), source.sha256, `Upstream differs: ${source.id}`);
    const manifest = JSON.parse(bytes);
    let report = null;
    if (manifest.evaluation.status !== 'unavailable') {
      const numerical = await boundedFetch(
        `https://raw.githubusercontent.com/kiselyovd/${source.repository}/${source.revision}/${manifest.evaluation.report}`,
      );
      assert.equal(
        hash(numerical),
        manifest.evaluation.report_sha256,
        'Pinned upstream report drift',
      );
      report = JSON.parse(numerical);
    }
    const hub = manifest.hub;
    const prefix = hub.repo_type === 'dataset' ? 'datasets/' : '';
    const card = await boundedFetch(
      `https://huggingface.co/${prefix}${hub.repo_id}/raw/main/README.md`,
    );
    assertCard(manifest, report, card.toString('utf8'));
    const metadata = JSON.parse(
      await boundedFetch(
        `https://huggingface.co/api/${hub.repo_type}s/${hub.repo_id}/revision/${hub.revision}?blobs=true`,
      ),
    );
    const files = new Map(metadata.siblings.map((file) => [file.rfilename, file]));
    for (const file of hub.files) {
      const actual = files.get(file.path);
      assert.ok(actual, `Pinned Hub file absent: ${file.path}`);
      if (actual.lfs?.sha256)
        assert.equal(actual.lfs.sha256, file.sha256, `Hub weights/data checksum: ${source.id}`);
      else {
        assert.ok(
          actual.size <= 2 * 1024 ** 2,
          'Missing large-file checksum; no weight-store download',
        );
        const small = await boundedFetch(
          `https://huggingface.co/${prefix}${hub.repo_id}/resolve/${hub.revision}/${file.path}`,
        );
        assert.equal(hash(small), file.sha256, `Hub config checksum: ${source.id}`);
      }
    }
    console.log(`GitHub report → HF card → native artifact: ${source.id}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = local(projectRoot, 'src/data/ml-artifacts.json');
  const generated = `${JSON.stringify(generate(), null, 2)}\n`;
  if (process.argv.includes('--write')) writeFileSync(output, generated);
  else
    assert.equal(
      readFileSync(output, 'utf8'),
      generated,
      'Portfolio drift: regenerate artifact data',
    );
  if (process.argv.includes('--remote')) await verifyRemote();
  console.log('Seven pinned artifact contracts and portfolio rows verified');
}
