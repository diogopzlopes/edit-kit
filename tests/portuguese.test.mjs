import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildListenUrl, normalizeDeepgram } from '../scripts/lib/deepgram.mjs';

const root = resolve(import.meta.dirname, '..');
const fixture = join(root, 'examples/editing/source-pt.json');
const run = (script, args) => spawnSync(process.execPath, [join(root, script), ...args], { encoding: 'utf8', cwd: root });
const scratch = () => mkdtempSync(join(tmpdir(), 'kit-pt-test-'));

test('Deepgram URL defaults to nova-3 in Brazilian Portuguese without English-only fillers', () => {
  const url = buildListenUrl({ keyterms: ['HyperFrames', 'Claude'] });
  assert.equal(url.searchParams.get('model'), 'nova-3');
  assert.equal(url.searchParams.get('language'), 'pt-BR');
  assert.equal(url.searchParams.get('smart_format'), 'true');
  assert.equal(url.searchParams.get('diarize'), 'true');
  assert.equal(url.searchParams.get('filler_words'), null);
  assert.deepEqual(url.searchParams.getAll('keyterm'), ['HyperFrames', 'Claude']);
  assert.equal(buildListenUrl({ language: 'en' }).searchParams.get('filler_words'), 'true');
  const auto = buildListenUrl({ detectLanguage: true });
  assert.equal(auto.searchParams.get('detect_language'), 'true');
  assert.equal(auto.searchParams.get('language'), null);
});

test('Deepgram response normalizes to the kit transcript with punctuated words', () => {
  const response = {
    metadata: { request_id: 'req-1', duration: 3.2 },
    results: { channels: [{ alternatives: [{
      transcript: 'Olá, tudo bem?',
      words: [
        { word: 'olá', punctuated_word: 'Olá,', start: 0.24, end: 0.6, confidence: 0.98, speaker: 0 },
        { word: 'tudo', punctuated_word: 'tudo', start: 0.7, end: 0.9, confidence: 0.97, speaker: 0 },
        { word: 'bem', punctuated_word: 'bem?', start: 0.95, end: 1.3, confidence: 0.99, speaker: 0 },
      ],
    }] }] },
  };
  const doc = normalizeDeepgram(response, { duration: 4.04, model: 'nova-3', language: 'pt-BR' });
  assert.equal(doc.provider, 'deepgram');
  assert.equal(doc.audio_duration_secs, 4.04);
  assert.equal(doc.language, 'pt-BR');
  assert.deepEqual(doc.words.map(w => w.text), ['Olá,', 'tudo', 'bem?']);
  assert.deepEqual(doc.words[0], { text: 'Olá,', start: 0.24, end: 0.6, type: 'word', confidence: 0.98, speaker: 'speaker_0' });
  assert.equal(normalizeDeepgram(response).audio_duration_secs, 3.2);
  assert.throws(() => normalizeDeepgram({ results: {} }), /words/);
});

test('silence cutter keeps accented Portuguese words intact', () => {
  const out = scratch();
  const result = run('.agents/skills/cut-silences/scripts/cut-silences.mjs', [fixture, '--out-dir', out]);
  assert.equal(result.status, 0, result.stderr);
  const doc = JSON.parse(readFileSync(join(out, 'source-pt.silence-transcript.json')));
  assert.ok(doc.words.some(w => w.text === 'informação'));
  assert.ok(doc.audio_duration_secs < 8);
});

test('mistake finder detects accented stutters and isolated Portuguese fillers only', () => {
  const out = scratch();
  const result = run('.agents/skills/cut-mistakes/scripts/find-cut-candidates.mjs', [fixture, '--out-dir', out]);
  assert.equal(result.status, 0, result.stderr);
  const doc = JSON.parse(readFileSync(join(out, 'source-pt.cut-candidates.json')));
  assert.equal(doc.language, 'pt');
  const stutter = doc.candidates.find(c => c.type === 'stutter');
  assert.ok(stutter, 'expected "não não" to be a stutter');
  assert.equal(stutter.removes, 'não');
  const fillers = doc.candidates.filter(c => c.type === 'filler');
  assert.deepEqual(fillers.map(c => c.removes), ['Hum']);
  assert.equal(fillers[0].recommend, 'cut');
});

test('beat validator matches an accented anchor phrase', () => {
  const out = scratch(); mkdirSync(join(out, 'assets')); mkdirSync(join(out, 'compositions'));
  writeFileSync(join(out, 'assets/transcript.json'), JSON.stringify({ words: [
    { text: 'A', start: 2.0, end: 2.1 }, { text: 'informação', start: 2.5, end: 3.0 }, { text: 'é', start: 3.05, end: 3.1 } ] }));
  writeFileSync(join(out, 'compositions/beat.html'), '<div data-anchor="informação é"></div>');
  writeFileSync(join(out, 'index.html'), '<div data-duration="1" data-start="2.0" id="card" data-composition-src="compositions/beat.html"></div>');
  const result = run('scripts/validate-beat-sync.mjs', [out, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
