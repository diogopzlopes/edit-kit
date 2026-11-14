#!/usr/bin/env node
// Agent 2 — Cut Mistakes & Repeats : candidate finder
// Scans a word-level transcript for likely mistakes the speaker would want gone:
//   - stutters / immediate word repeats ("the the", "I-I-I", "that that")
//   - retakes / duplicate sentences (a line re-recorded; keep the clean take)
//   - false starts (an abandoned phrase that restarts)
//
// This is MECHANICAL detection only. It proposes candidate cut ranges with rich
// context + a confidence + a default recommendation, but it does NOT decide.
// The agent reviews each candidate in context (review-gate) before apply-cuts
// renders anything.
//
// Input: any { words: [{ text, start, end, type? }] } transcript — typically
// Agent 1's <stem>.silence-transcript.json (so cuts land on the silenced timeline).
//
// Output (next to the transcript, or --out-dir):
//   <stem>.cut-candidates.json   structured candidates for the agent to review
//   <stem>.cut-candidates.md     human-readable proposal
//
// Usage:
//   node find-cut-candidates.mjs <transcript.json> [--out-dir dir] [--lang pt|en]
//
// Tokens are Unicode-aware, so accented words ("não", "é", "informação") match.
// --lang (default: the transcript's `language`, else pt) picks the stop words and
// the isolated-filler list ("hum", "né", "tipo"...). Fillers are only proposed
// when there is silence on both sides; they still need review in context.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { argv, exit } from "node:process";

const args = argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
  console.log("Usage: node find-cut-candidates.mjs <transcript.json> [--out-dir dir] [--lang pt|en]");
  exit(args.length === 0 ? 1 : 0);
}
let transcriptArg = null, outDirArg = null, langArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out-dir") outDirArg = args[++i];
  else if (args[i] === "--lang" || args[i] === "--language") langArg = args[++i];
  else if (!transcriptArg) transcriptArg = args[i];
}
const transcriptPath = resolve(transcriptArg);
const transcript = JSON.parse(readFileSync(transcriptPath, "utf8"));
if (!Array.isArray(transcript.words)) { console.error("transcript has no words[]"); exit(1); }
const lang = String(langArg ?? transcript.language ?? "pt").toLowerCase().startsWith("en") ? "en" : "pt";

function cleanToken(text) {
  return (text ?? "").normalize("NFC").toLowerCase().replace(/^[^\p{L}\p{N}$%]+|[^\p{L}\p{N}$%]+$/gu, "");
}
function displayText(ws) {
  return ws.map((w) => w.text).join(" ").replace(/\s+([,.!?;:])/g, "$1");
}
function fmt(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
}

const words = transcript.words
  .filter((w) => (w.type ? w.type === "word" : true))
  .filter((w) => Number.isFinite(Number(w.start)) && Number.isFinite(Number(w.end)))
  .map((w, index) => ({ index, text: w.text, token: cleanToken(w.text), start: Number(w.start), end: Number(w.end) }));

if (words.length === 0) { console.error("no timed words"); exit(1); }

const candidates = [];
let cid = 0;
const ctx = (i, before = 6, after = 6) =>
  displayText(words.slice(Math.max(0, i - before), Math.min(words.length, i + after)));

// ---- 1) stutters / immediate repeats ----
for (let i = 1; i < words.length; i++) {
  const a = words[i - 1], b = words[i];
  if (!b.token || b.token.length < 1) continue;
  const closeGap = b.start - a.end < 0.5;
  if (a.token === b.token && closeGap) {
    candidates.push({
      id: `c${String(++cid).padStart(3, "0")}`,
      type: "stutter",
      confidence: "high",
      recommend: "cut",
      // remove the first utterance, keep the second
      cut: { start: Number(a.start.toFixed(3)), end: Number(b.start.toFixed(3)) },
      removes: a.text,
      keeps: b.text,
      context: ctx(i),
      note: `repeated "${a.token}"`,
    });
  }
}

// ---- 1b) isolated fillers (only with silence on both sides) ----
// Hesitations ("hum", "ahn") default to cut; verbal tics ("né", "tipo") default to
// review because they are often intentional. Never propose a filler that runs
// straight into its neighbours: cutting it clips the words around it.
const FILLERS = {
  en: { hesitation: ["um", "uh", "uhm", "erm", "hmm", "mm"], tic: ["like", "basically", "actually", "literally"] },
  pt: { hesitation: ["hum", "hmm", "hm", "ahn", "ãh", "ah", "eh", "éé", "ééé", "ã", "uhm"], tic: ["né", "tipo", "sabe", "entendeu", "enfim", "daí"] },
};
const hesitations = new Set(FILLERS[lang].hesitation);
const tics = new Set(FILLERS[lang].tic);
const MIN_SILENCE = 0.15;
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  const isHes = hesitations.has(w.token) || /^(h?u+m+|e{2,}|é{2,}|a+h+n*|h?m{2,})$/u.test(w.token);
  const isTic = tics.has(w.token);
  if (!isHes && !isTic) continue;
  const before = i === 0 ? Infinity : w.start - words[i - 1].end;
  const after = i === words.length - 1 ? Infinity : words[i + 1].start - w.end;
  if (before < MIN_SILENCE || after < MIN_SILENCE) continue;
  candidates.push({
    id: `c${String(++cid).padStart(3, "0")}`,
    type: "filler",
    confidence: isHes ? "medium" : "low",
    recommend: isHes ? "cut" : "review",
    cut: { start: Number(w.start.toFixed(3)), end: Number((i === words.length - 1 ? w.end : words[i + 1].start).toFixed(3)) },
    removes: w.text,
    context: ctx(i),
    note: `${isHes ? "hesitation" : "verbal tic"} "${w.token}" isolated by ${before === Infinity ? "start" : before.toFixed(2) + "s"} / ${after === Infinity ? "end" : after.toFixed(2) + "s"} of silence`,
  });
}

// ---- build segments (for retake / false-start detection) ----
const segments = [];
let segStart = 0;
for (let i = 1; i < words.length; i++) {
  const prev = words[i - 1], cur = words[i];
  const gap = cur.start - prev.end;
  const elapsed = cur.end - words[segStart].start;
  const sentenceEnd = /[.!?]$/.test(prev.text ?? "");
  if (gap > 0.85 || (sentenceEnd && elapsed >= 7.5) || elapsed >= 16) {
    segments.push({ id: segments.length + 1, wordStart: segStart, wordEnd: i - 1, start: words[segStart].start, end: prev.end, text: displayText(words.slice(segStart, i)) });
    segStart = i;
  }
}
segments.push({ id: segments.length + 1, wordStart: segStart, wordEnd: words.length - 1, start: words[segStart].start, end: words.at(-1).end, text: displayText(words.slice(segStart)) });

const STOP = {
  en: "a an and are as at be but by for from i if in is it of on or so that this to was we with you your they their there what when where why how like um uh",
  pt: "a o as os um uma uns umas de da do das dos em na no nas nos por pra pras pro pros para com sem que se e ou mas mais muito é ser foi era são está estão tá tão isso isto esse essa este esta aquilo aquele aquela ele ela eles elas eu você vocês nós a gente me te lhe seu sua meu minha nosso nossa já não sim também quando onde como porque porquê então aí assim né tipo coisa vai vou ter tem tinha fazer faz hum ahn éé",
};
const stop = new Set(STOP[lang].split(" "));
function signature(seg) {
  return seg.text.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\s$%]/gu, " ").split(/\s+/).filter((t) => t.length > 2 && !stop.has(t)).slice(0, 18);
}
function jaccard(a, b) {
  const as = new Set(a), bs = new Set(b);
  let overlap = 0;
  for (const x of as) if (bs.has(x)) overlap++;
  return overlap / Math.max(1, new Set([...as, ...bs]).size);
}
const sigs = segments.map(signature);

// ---- 2) retakes / duplicate sentences (keep the later, cleaner take) ----
for (let i = 0; i < segments.length; i++) {
  for (let j = i + 1; j < Math.min(segments.length, i + 9); j++) {
    if (segments[j].start - segments[i].end > 75) break;
    const score = jaccard(sigs[i], sigs[j]);
    const sameOpening = sigs[i].slice(0, 4).filter((t, idx) => t === sigs[j][idx]).length >= 2;
    if (score >= 0.34 || (score >= 0.24 && sameOpening)) {
      const firstLen = segments[i].end - segments[i].start;
      // A short first take that restarts soon after reads as a false start.
      const isFalseStart = sameOpening && firstLen < 6 && segments[j].start - segments[i].end < 12;
      candidates.push({
        id: `c${String(++cid).padStart(3, "0")}`,
        type: isFalseStart ? "false_start" : "retake",
        confidence: score >= 0.45 ? "high" : score >= 0.34 ? "medium" : "low",
        recommend: score >= 0.34 ? "cut" : "review",
        score: Number(score.toFixed(3)),
        // default: remove the earlier take up to the start of the cleaner restart
        cut: { start: Number(segments[i].start.toFixed(3)), end: Number(segments[j].start.toFixed(3)) },
        removes: segments[i].text,
        keeps: segments[j].text,
        gapBetween: Number((segments[j].start - segments[i].end).toFixed(2)),
        note: `seg ${segments[i].id} ~ seg ${segments[j].id} (jaccard ${score.toFixed(2)}${sameOpening ? ", same opening" : ""})`,
      });
    }
  }
}

// sort by time, de-dupe overlapping retake/false-start proposals (keep highest score)
candidates.sort((a, b) => a.cut.start - b.cut.start);

const byType = candidates.reduce((m, c) => ((m[c.type] = (m[c.type] || 0) + 1), m), {});
const totalProposed = candidates.filter((c) => c.recommend === "cut").reduce((s, c) => s + (c.cut.end - c.cut.start), 0);

const stem = basename(transcriptPath, extname(transcriptPath)).replace(/[-.]?(silence-)?transcript.*$/i, "") || "source";
const outDir = outDirArg ? resolve(outDirArg) : dirname(transcriptPath);
mkdirSync(outDir, { recursive: true });

const out = {
  agent: "cut-mistakes",
  source_transcript: transcriptPath,
  language: lang,
  word_count: words.length,
  segment_count: segments.length,
  counts: byType,
  proposed_cut_seconds: Number(totalProposed.toFixed(2)),
  candidates,
};
const jsonPath = join(outDir, `${stem}.cut-candidates.json`);
writeFileSync(jsonPath, JSON.stringify(out, null, 2));

const md = [
  "# Cut-Mistakes Candidates",
  "",
  `Transcript: ${basename(transcriptPath)} · ${words.length} words · ${segments.length} segments`,
  `Found: ${candidates.length} candidates (` + Object.entries(byType).map(([k, v]) => `${v} ${k}`).join(", ") + ")",
  `Default proposed cuts total ~${totalProposed.toFixed(1)}s. **Review before applying.**`,
  "",
  ...candidates.map((c) =>
    [
      `## ${c.id} · ${c.type} · ${c.confidence} · recommend: ${c.recommend}`,
      `cut ${fmt(c.cut.start)}–${fmt(c.cut.end)} (${(c.cut.end - c.cut.start).toFixed(2)}s) — ${c.note}`,
      "",
      `- removes: ${c.removes}`,
      c.keeps ? `- keeps:   ${c.keeps}` : null,
      c.context ? `- context: …${c.context}…` : null,
      "",
    ].filter(Boolean).join("\n")),
].join("\n");
writeFileSync(join(outDir, `${stem}.cut-candidates.md`), md);

console.log(JSON.stringify({ candidates: candidates.length, counts: byType, proposedCutSeconds: Number(totalProposed.toFixed(2)), outputs: { json: jsonPath, md: join(outDir, `${stem}.cut-candidates.md`) } }, null, 2));
