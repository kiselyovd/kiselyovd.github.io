import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertCard, generate, scoreAt } from '../scripts/portfolio-artifacts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function alteredFixture(action) {
  const prefix = path.join(os.tmpdir(), 'portfolio-evidence-');
  const temporary = mkdtempSync(prefix);
  try {
    cpSync(path.join(root, 'evidence'), path.join(temporary, 'evidence'), { recursive: true });
    action(temporary);
  } finally {
    assert.ok(path.resolve(temporary).startsWith(path.resolve(prefix)));
    rmSync(temporary, { recursive: true });
  }
}

test('real records retain replay status, source identity and exact metrics', () => {
  const data = generate(root);
  assert.equal(data.owner, 'kiselyovd');
  assert.equal(data.contracts.length, 7);
  const mri = data.contracts.find((item) => item.id === 'brain-mri-segmentation');
  assert.equal(mri.metrics['Foreground Dice'], 0.8808333318562974);
  assert.equal(mri.trainingMembershipVerified, false);
  const synthetic = data.contracts.find((item) => item.id === 'synthetic-vehicle-model');
  assert.equal(synthetic.status, 'reported');
  assert.match(synthetic.scope, /234 checkpoint training frames/);
  assert.equal(
    data.rows.find((row) => row.repo === 'grnti-text-classifier').metrics,
    'Top-1 72.37%',
  );
});

test('a changed numerical report fails instead of silently updating a portfolio score', () => {
  alteredFixture((temporary) => {
    writeFileSync(
      path.join(temporary, 'evidence/artifacts/grnti-text-classifier/report.json'),
      '{}',
    );
    assert.throws(() => generate(temporary), /Report checksum/);
  });
});

test('a missing report cannot become a zero score', () => {
  alteredFixture((temporary) => {
    unlinkSync(path.join(temporary, 'evidence/artifacts/cardio-risk-rf/report.json'));
    assert.throws(() => generate(temporary), /ENOENT/);
  });
  assert.throws(() => scoreAt({}, '/missing'));
});

test('the actual emitted production root renders generated evidence and personal identity', () => {
  const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  assert.match(html, /Daniil Kiselyov/);
  for (const row of generate(root).rows) {
    assert.ok(html.includes(row.metrics), row.repo);
    assert.ok(html.includes(row.reportUrl), 'Production score must link to its pinned report');
    assert.ok(html.includes(`data-artifact-repo="${row.repo}"`));
  }
  assert.match(html, /https:\/\/huggingface.co\/spaces\/kiselyovd\/grnti-text-classifier-demo/);
  assert.doesNotMatch(html, /Metric audit pending|5\.5y|5\.5 years|5\.5 лет/);
});

test('a different HF score cannot pass the cross-surface contract', () => {
  const registry = JSON.parse(
    readFileSync(path.join(root, 'evidence/portfolio-sources.json'), 'utf8'),
  );
  const source = registry.sources.find((item) => item.id === 'grnti-text-classifier');
  const manifest = JSON.parse(readFileSync(path.join(root, source.snapshot), 'utf8'));
  const report = JSON.parse(readFileSync(path.join(root, source.reportSnapshot), 'utf8'));
  const card = readFileSync(path.join(root, source.hubCardSnapshot), 'utf8');
  assertCard(manifest, report, card);
  assert.throws(
    () => assertCard(manifest, report, card.replace('72.37%', '99.99%')),
    /HF card drift/,
  );
});
