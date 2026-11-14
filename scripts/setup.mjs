#!/usr/bin/env node
// Diagnóstico da instalação do kit. Não instala nada sozinho: confere cada
// requisito e mostra o comando exato para o seu sistema.
//
//   npm run setup                 diagnóstico legível + cria .env se faltar
//   npm run setup -- --json       mesmo diagnóstico em JSON (usado pela skill /instalar)
//   npm run setup -- --check-key  também testa a DEEPGRAM_API_KEY no Deepgram (grátis)
//
// Nunca imprime o valor de chaves.
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const checkKey = args.includes('--check-key');
const platform = process.platform; // win32 | darwin | linux

function run(command, argv) {
  const r = spawnSync(command, argv, { encoding: 'utf8', windowsHide: true, shell: platform === 'win32' && command === 'npm' });
  if (r.error || r.status !== 0) return null;
  return `${r.stdout || ''}${r.stderr || ''}`.trim();
}
function firstNumber(text, re) {
  const m = text?.match(re);
  return m ? Number(m[1]) : null;
}

// Comandos de instalação por sistema. "admin" avisa que vai pedir permissão/senha.
const FIX = {
  node: {
    win32: 'winget install -e --id OpenJS.NodeJS.LTS',
    darwin: 'brew install node',
    linux: 'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs',
  },
  ffmpeg: {
    win32: 'winget install -e --id Gyan.FFmpeg',
    darwin: 'brew install ffmpeg',
    linux: 'sudo apt install -y ffmpeg',
  },
  git: {
    win32: 'winget install -e --id Git.Git',
    darwin: 'xcode-select --install',
    linux: 'sudo apt install -y git',
  },
  brew: {
    darwin: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
  },
  deps: { all: 'npm ci' },
  chrome: { all: 'npx hyperframes browser ensure' },
  env: { all: 'npm run setup' },
  deepgram: { all: 'Crie uma chave em https://console.deepgram.com (Settings > API Keys) e cole em DEEPGRAM_API_KEY no arquivo .env' },
};
const fixFor = (name) => FIX[name]?.[platform] ?? FIX[name]?.all ?? null;

const checks = [];
function add(name, label, ok, detail, { required = true, fix = fixFor(name), restart = false } = {}) {
  checks.push({ name, label, ok, required, detail, fix: ok ? null : fix, restartTerminal: ok ? false : restart });
}

// Homebrew (só macOS, é por onde instalamos o resto)
if (platform === 'darwin') {
  const brew = run('brew', ['--version']);
  add('brew', 'Homebrew', !!brew, brew ? brew.split('\n')[0] : 'não encontrado', { restart: true });
}

// Node 22+
const nodeMajor = Number(process.versions.node.split('.')[0]);
add('node', 'Node.js 22+', nodeMajor >= 22, `v${process.versions.node}`, { restart: true });

// npm
const npmVersion = run('npm', ['--version']);
add('npm', 'npm', !!npmVersion, npmVersion ?? 'não encontrado', { fix: fixFor('node'), restart: true });

// FFmpeg e ffprobe (6+; os cortes funcionam no 6 e no 7+)
const ffmpegOut = run('ffmpeg', ['-hide_banner', '-version']);
const ffmpegMajor = firstNumber(ffmpegOut, /ffmpeg version n?(\d+)\./);
const ffmpegOk = !!ffmpegOut && (ffmpegMajor === null || ffmpegMajor >= 6);
add('ffmpeg', 'FFmpeg 6+', ffmpegOk, ffmpegOut ? ffmpegOut.split('\n')[0] : 'não encontrado', { restart: true });
const ffprobeOut = run('ffprobe', ['-hide_banner', '-version']);
add('ffprobe', 'ffprobe', !!ffprobeOut, ffprobeOut ? 'ok' : 'não encontrado (vem junto com o FFmpeg)', { fix: fixFor('ffmpeg'), restart: true });

// Git (opcional: só para clonar/atualizar e para o Claude Code usar Bash no Windows)
const gitOut = run('git', ['--version']);
add('git', 'Git (opcional)', !!gitOut, gitOut ?? 'não encontrado', { required: false, restart: true });

// Dependências do kit
const depsOk = existsSync(join(root, 'node_modules', 'hyperframes', 'package.json')) && existsSync(join(root, 'node_modules', 'gsap'));
add('deps', 'Dependências do kit (npm ci)', depsOk, depsOk ? 'instaladas' : 'pasta node_modules ausente ou incompleta');

// Chrome para renderizar (o HyperFrames encontra o do sistema ou baixa um)
if (depsOk) {
  const hf = join(root, 'node_modules', 'hyperframes', 'package.json');
  const bin = JSON.parse(readFileSync(hf, 'utf8')).bin;
  const binRel = typeof bin === 'string' ? bin : bin?.hyperframes;
  const out = binRel ? spawnSync(process.execPath, [join(root, 'node_modules', 'hyperframes', binRel), 'browser', 'path'], { encoding: 'utf8', windowsHide: true, env: { ...process.env, HYPERFRAMES_TELEMETRY: '0', DO_NOT_TRACK: '1' } }) : null;
  const path = out && out.status === 0 ? out.stdout.trim().split(/\r?\n/).pop() : '';
  const chromeOk = !!path && existsSync(path);
  add('chrome', 'Chrome para renderizar', chromeOk, chromeOk ? path : 'não encontrado');
} else {
  add('chrome', 'Chrome para renderizar', false, 'confira depois de instalar as dependências');
}

// .env e chave do Deepgram (sem imprimir o valor)
const envPath = join(root, '.env');
let createdEnv = false;
if (!existsSync(envPath)) {
  copyFileSync(join(root, '.env.example'), envPath);
  createdEnv = true;
}
add('env', 'Arquivo .env', true, createdEnv ? 'criado a partir do .env.example' : 'já existe (preservado)');
const envText = readFileSync(envPath, 'utf8');
const keyMatch = envText.match(/^[ \t]*DEEPGRAM_API_KEY[ \t]*=[ \t]*["']?([^"'\r\n]*?)["']?[ \t]*$/m);
const deepgramKey = (process.env.DEEPGRAM_API_KEY || keyMatch?.[1] || '').trim();
let keyDetail = deepgramKey ? `configurada (${deepgramKey.length} caracteres)` : 'vazia';
let keyOk = !!deepgramKey;
if (deepgramKey && checkKey) {
  try {
    const res = await fetch('https://api.deepgram.com/v1/projects', { headers: { Authorization: `Token ${deepgramKey}` } });
    keyOk = res.ok;
    keyDetail = res.ok ? 'válida (o Deepgram aceitou a chave)' : `o Deepgram recusou a chave (HTTP ${res.status})`;
  } catch (err) {
    keyOk = false;
    keyDetail = `não deu para falar com o Deepgram: ${err.message}`;
  }
}
add('deepgram', 'Chave do Deepgram', keyOk, keyDetail, { required: false });

const requiredMissing = checks.filter((c) => c.required && !c.ok);
const result = { ok: requiredMissing.length === 0, platform, arch: process.arch, checks };

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const sys = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[platform] ?? platform;
  console.log(`Diagnóstico do kit (${sys}, ${process.arch})\n`);
  for (const c of checks) {
    const mark = c.ok ? 'OK ' : c.required ? 'FALTA' : 'opcional';
    console.log(`  [${mark}] ${c.label}: ${c.detail}`);
    if (c.fix) console.log(`         Para resolver: ${c.fix}${c.restartTerminal ? '  (depois feche e abra o terminal)' : ''}`);
  }
  console.log('');
  if (result.ok) {
    console.log('Tudo pronto. Próximo passo: npm run demo');
    if (!keyOk) console.log('Para transcrever suas gravações, configure a chave do Deepgram (veja docs/TOOLS-AND-API-KEYS.md).');
  } else {
    console.log(`Faltam ${requiredMissing.length} itens. No Claude Code, digite /instalar para a IA resolver com você.`);
  }
}
process.exitCode = result.ok ? 0 : 1;
