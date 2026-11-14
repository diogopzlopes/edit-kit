#!/usr/bin/env node
// Gera o ZIP do kit para entregar aos alunos.
//
//   npm run pacote                    tudo o que está versionado no Git
//   npm run pacote -- --sem-exemplos  sem os exemplos de terceiros (~400 MB a menos)
//
// Usa `git archive`, então só entra o que está commitado: nunca vai junto o seu
// .env, o node_modules, renders ou projetos novos em video-projects/. O ZIP abre
// numa pasta chamada `edit-kit`, pronta para o COMECE-AQUI.md.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const semExemplos = args.includes('--sem-exemplos');
const outDirArg = args.find((a, i) => args[i - 1] === '--saida');

// Material de terceiros (rosto, marca AIS, vídeos de showcase) e histórico de projetos.
const EXEMPLOS = [
  'video-projects',
  'examples/showcase',
  'assets',
  'docs/images',
  'docs/superpowers',
  'DESIGN.ais-example.md',
];

function git(argv) {
  const r = spawnSync('git', argv, { cwd: root, encoding: 'utf8' });
  if (r.error) throw new Error('git não encontrado. O pacote é gerado a partir do repositório Git do kit.');
  if (r.status !== 0) throw new Error(`git ${argv.join(' ')} falhou:\n${r.stderr}`);
  return r.stdout.trim();
}

const dirty = git(['status', '--porcelain', '--untracked-files=no']);
if (dirty) {
  console.warn('Aviso: há mudanças não commitadas. Elas NÃO entram no ZIP:');
  console.warn(dirty.split('\n').map((l) => `  ${l}`).join('\n'));
}

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const commit = git(['rev-parse', '--short', 'HEAD']);
const date = new Date().toISOString().slice(0, 10);
const outDir = resolve(outDirArg ?? join(root, 'dist'));
mkdirSync(outDir, { recursive: true });
const name = `edit-kit-v${version}-${date}${semExemplos ? '-sem-exemplos' : ''}.zip`;
const outPath = join(outDir, name);

const pathspec = semExemplos ? ['--', '.', ...EXEMPLOS.map((p) => `:(exclude)${p}`)] : [];
git(['archive', '--format=zip', '-9', '--prefix=edit-kit/', '-o', outPath, 'HEAD', ...pathspec]);

// Conferência: o que precisa estar e o que nunca pode estar.
// Lista pelo próprio Git (funciona sem `unzip`, inclusive no Windows).
const tracked = git(['ls-tree', '-r', '--name-only', 'HEAD']).split('\n').filter(Boolean);
const excluded = (f) => semExemplos && EXEMPLOS.some((p) => f === p || f.startsWith(`${p}/`));
const files = tracked.filter((f) => !excluded(f));
const must = ['COMECE-AQUI.md', '.claude/skills/instalar/SKILL.md', '.agents/skills/instalar/SKILL.md', 'package-lock.json', '.env.example'];
const missing = must.filter((f) => !files.includes(f));
const forbidden = files.filter((f) => /(^|\/)\.env$|(^|\/)node_modules\/|\.(pem|key)$/.test(f));
if (missing.length || forbidden.length) {
  if (missing.length) console.error(`Faltando no ZIP: ${missing.join(', ')}`);
  if (forbidden.length) console.error(`Não deveria estar no ZIP: ${forbidden.join(', ')}`);
  process.exit(1);
}
console.log(`${files.length} arquivos conferidos.`);

const mb = (statSync(outPath).size / 1048576).toFixed(1);
console.log(`ZIP pronto: ${relative(process.cwd(), outPath) || outPath} (${mb} MB, versão ${version}, commit ${commit})`);
