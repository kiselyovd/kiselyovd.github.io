import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildScaffold, validateSlug } from '../src/lib/scaffold.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(root, 'src/data/template-showcase.json'), 'utf8'));

function built(relative) {
  const file = path.join(root, 'dist', relative);
  assert.ok(existsSync(file), 'Run the production build before the root tests');
  return readFileSync(file, 'utf8');
}

test('the emitted production root links both genuine showcases', () => {
  const html = built('index.html');
  assert.match(html, /<body\b/);
  assert.match(html, /Daniil Kiselyov/);
  assert.match(html, /href="\/showcase\/dungeon-master-ai\/"/);
  assert.match(html, /href="\/showcase\/ml-project-template\/"/);
});

test('Template production HTML renders the actual page, source identity, and usable default command', () => {
  const html = built('showcase/ml-project-template/index.html');
  assert.match(html, /<h1>ML Project Template<\/h1>/);
  assert.match(html, /data-owner="kiselyovd"/);
  assert.match(html, /project_slug=research-demo/);
  assert.match(html, /framework=pytorch/);
  assert.match(html, /github_user=kiselyovd/);
  assert.match(html, /https:\/\/kiselyovd.github.io\/showcase\/ml-project-template/);
});

test('Dungeon production HTML keeps the product name, default actor, real screenshot, and platform facts', () => {
  const html = built('showcase/dungeon-master-ai/index.html');
  assert.match(html, /<h1>Dungeon Master AI<\/h1>/);
  assert.match(html, /data-default-actor="Hero"/);
  assert.match(html, /data-owner="kiselyovd"/);
  assert.match(html, /src="\/portfolio\/dm-ai-combat.jpg"/);
  assert.ok(existsSync(path.join(root, 'dist/portfolio/dm-ai-combat.jpg')));
  assert.match(html, /v0.12.0-real-engine/);
  assert.match(html, /macOS Apple silicon/);
});

test('all canonical presets use the source framework and source-derived file pruning', () => {
  assert.equal(data.presets.length, 5);
  for (const preset of data.presets) {
    const result = buildScaffold(data, { slug: 'fixture-project', preset: preset.id, serving: true, python: '3.13' });
    assert.equal(result.framework, preset.framework);
    assert.match(result.command, new RegExp(`task_type=${preset.task_type}`));
    assert.equal(result.packageName, 'fixture_project');
    const key = preset.framework === 'sklearn' ? 'prune_for_tabular' : 'prune_for_non_tabular';
    for (const sourcePath of data.prune_rules[key]) assert.ok(result.removed.includes(sourcePath.replaceAll('__PACKAGE__', 'fixture_project')));
  }
});

test('serving=false removes the service, its test, and compose; all offered Python versions work', () => {
  for (const python of data.python_versions) {
    const result = buildScaffold(data, { slug: 'demo-api', preset: 'tabular', serving: false, python });
    assert.ok(result.removed.includes('docker-compose.yml'));
    assert.ok(result.removed.includes('tests/test_serving.py'));
    assert.ok(result.removed.some((file) => file.startsWith('src/demo_api/serving/')));
    assert.match(result.command, /has_serving=false/);
    assert.match(result.command, new RegExp(`python_version=${python}`));
    assert.equal(result.command.includes('\n'), false, 'The copied command must also be directly usable when selected manually');
  }
});

test('invalid source slugs and unsupported presets cannot produce shell commands', () => {
  for (const slug of ['a', 'Wrong Name', '../escape', "demo';exit", 'x'.repeat(51)]) {
    assert.equal(validateSlug(slug), false);
    assert.throws(() => buildScaffold(data, { slug, preset: 'classification', serving: true, python: '3.13' }));
  }
  assert.throws(() => buildScaffold(data, { slug: 'valid-project', preset: 'unknown', serving: true, python: '3.13' }));
});

test('production portfolio links live inference and preserves enterprise before research', () => {
  const html = built('index.html');
  assert.ok(html.includes('https://huggingface.co/spaces/kiselyovd/vehicle-keypoints-demo'));
  assert.ok(html.includes('https://kiselyovd.github.io/vehicle-keypoints/phase0/synthetic-pretraining/'));
  assert.ok(html.indexOf('id="work"') < html.indexOf('id="flagship"'));
  assert.ok(html.indexOf('id="flagship"') < html.indexOf('id="portfolio"'));
  assert.ok(html.indexOf('https://huggingface.co/spaces/kiselyovd/vehicle-keypoints-demo') < html.indexOf('data-i18n="port.col.repo"'));
});
