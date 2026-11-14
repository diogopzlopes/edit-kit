#!/usr/bin/env node
// Transcreve um vídeo/áudio com o Deepgram -> JSON com tempo por palavra.
// Transcribe a video/audio file with Deepgram -> word-level JSON for the kit.
//
// Uso / Usage:
//   node scripts/transcribe-deepgram.mjs <arquivo> [opções]
//
// Padrões / Defaults:
//   --output    <arquivo-sem-extensão>.json ao lado da fonte
//   --model     nova-3
//   --language  pt-BR   (use "multi" para fala com mais de um idioma,
//                        ou --detect-language para detecção automática)
//   --diarize   ligado (use --no-diarize para desligar)
//   --keyterm   termo para reforçar (repita: --keyterm HyperFrames --keyterm Claude)
//   --keep-raw  salva também a resposta original em <nome>.deepgram-raw.json
//   --keep-audio mantém o mp3 extraído do vídeo
//
// Extração de áudio: mono 16 kHz mp3 64 kbps via ffmpeg (apagado depois do envio,
// a menos que use --keep-audio). Arquivos de áudio são enviados como estão.
// A duração total vem do ffprobe, para cobrir o silêncio depois da última palavra.
//
// Lê DEEPGRAM_API_KEY do ambiente ou do arquivo .env na raiz do kit.

import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { argv, exit, env } from "node:process";
import { fileURLToPath } from "node:url";
import { DEFAULTS, buildListenUrl, normalizeDeepgram, mimeFor } from "./lib/deepgram.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, "..");
const AUDIO_EXTS = new Set([".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg", ".opus", ".webm"]);

function die(msg, code = 1) {
  console.error(msg);
  exit(code);
}

const USAGE =
  "Uso: node scripts/transcribe-deepgram.mjs <arquivo> [--output caminho] [--model nova-3] " +
  "[--language pt-BR|en|multi] [--detect-language] [--no-diarize] [--keyterm termo]... " +
  "[--filler-words|--no-filler-words] [--keep-raw] [--keep-audio]";

const args = argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(USAGE);
  exit(args.length === 0 ? 1 : 0);
}

const opts = {
  input: null,
  output: null,
  model: DEFAULTS.model,
  language: DEFAULTS.language,
  detectLanguage: false,
  diarize: DEFAULTS.diarize,
  smartFormat: DEFAULTS.smartFormat,
  fillerWords: DEFAULTS.fillerWords,
  keyterms: [],
  keepRaw: false,
  keepAudio: false,
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (a === "--model") opts.model = args[++i];
  else if (a === "--language" || a === "--lang") opts.language = args[++i];
  else if (a === "--detect-language") opts.detectLanguage = true;
  else if (a === "--no-diarize") opts.diarize = false;
  else if (a === "--diarize") opts.diarize = true;
  else if (a === "--no-smart-format") opts.smartFormat = false;
  else if (a === "--filler-words") opts.fillerWords = true;
  else if (a === "--no-filler-words") opts.fillerWords = false;
  else if (a === "--keyterm") opts.keyterms.push(args[++i]);
  else if (a === "--keep-raw") opts.keepRaw = true;
  else if (a === "--keep-audio") opts.keepAudio = true;
  else if (a.startsWith("--")) die(`opção desconhecida: ${a}\n${USAGE}`);
  else if (!opts.input) opts.input = a;
  else die(`argumento inesperado: ${a}`);
}
if (!opts.input) die("nenhum arquivo informado");

const inputPath = resolve(opts.input);
if (!existsSync(inputPath)) die(`arquivo não encontrado: ${inputPath}`);

const inputExt = extname(inputPath).toLowerCase();
const inputDir = dirname(inputPath);
const inputStem = basename(inputPath, extname(inputPath));
const outputPath = resolve(opts.output ?? join(inputDir, `${inputStem}.json`));
if (outputPath === inputPath) die("o arquivo de saída não pode ser o próprio arquivo de entrada");

// --- chave da API (ambiente primeiro, depois .env da raiz) ---
let apiKey = env.DEEPGRAM_API_KEY;
if (!apiKey) {
  const dotenv = join(WORKSPACE_ROOT, ".env");
  if (existsSync(dotenv)) {
    for (const line of readFileSync(dotenv, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*DEEPGRAM_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) {
        apiKey = m[1].replace(/^["']|["']$/g, "");
        break;
      }
    }
  }
}
if (!apiKey) die("DEEPGRAM_API_KEY não configurada (ambiente ou .env na raiz). Veja docs/TOOLS-AND-API-KEYS.md");

// --- duração real da fonte (ffprobe) ---
function probeDuration(path) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
    { encoding: "utf8" },
  );
  const d = Number.parseFloat(r.stdout);
  return r.status === 0 && Number.isFinite(d) ? d : undefined;
}
const sourceDuration = probeDuration(inputPath);

// --- se for vídeo, extrai o áudio com ffmpeg ---
let uploadPath = inputPath;
let tempAudioPath = null;
if (!AUDIO_EXTS.has(inputExt)) {
  tempAudioPath = join(inputDir, `${inputStem}.deepgram-upload.mp3`);
  console.log(`extraindo áudio -> ${tempAudioPath}`);
  const ff = spawnSync(
    "ffmpeg",
    ["-y", "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libmp3lame", "-b:a", "64k", tempAudioPath],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  if (ff.status !== 0) die(`ffmpeg falhou:\n${ff.stderr?.toString() ?? ""}`, ff.status ?? 1);
  uploadPath = tempAudioPath;
}
const cleanup = () => {
  if (tempAudioPath && !opts.keepAudio && existsSync(tempAudioPath)) unlinkSync(tempAudioPath);
};

// --- envio para o Deepgram ---
const url = buildListenUrl(opts);
// DEEPGRAM_API_URL lets tests or a self-hosted Deepgram point elsewhere.
if (env.DEEPGRAM_API_URL) {
  const base = new URL(env.DEEPGRAM_API_URL);
  url.protocol = base.protocol;
  url.host = base.host;
}
const sizeMb = (statSync(uploadPath).size / (1024 * 1024)).toFixed(2);
console.log(`enviando ${basename(uploadPath)} (${sizeMb} MB) | modelo ${opts.model} | idioma ${opts.detectLanguage ? "auto" : opts.language}`);

const t0 = Date.now();
let res;
try {
  res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}`, "Content-Type": mimeFor(extname(uploadPath)) },
    body: readFileSync(uploadPath),
  });
} catch (err) {
  cleanup();
  die(`falha de rede ao chamar o Deepgram: ${err.message}`);
}
const dt = ((Date.now() - t0) / 1000).toFixed(1);

if (!res.ok) {
  const body = await res.text();
  cleanup();
  die(`HTTP ${res.status} depois de ${dt}s\n${body}`);
}

const raw = await res.json();
cleanup();

const transcript = normalizeDeepgram(raw, {
  duration: sourceDuration,
  model: opts.model,
  language: opts.detectLanguage ? undefined : opts.language,
});
writeFileSync(outputPath, JSON.stringify(transcript, null, 2));
if (opts.keepRaw) {
  writeFileSync(join(dirname(outputPath), `${basename(outputPath, ".json")}.deepgram-raw.json`), JSON.stringify(raw, null, 2));
}

console.log(
  `ok ${dt}s | ${transcript.words.length} palavras | ${transcript.audio_duration_secs.toFixed(1)}s de áudio | ${outputPath}`,
);
if (transcript.words.length === 0) {
  console.warn("aviso: nenhuma palavra transcrita. Confira o idioma (--language) e se o áudio tem fala.");
}
