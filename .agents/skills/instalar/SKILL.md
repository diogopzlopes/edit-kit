---
name: instalar
description: Guided first-time installation of this kit on a student's Windows, macOS, or Linux computer. Detects what is missing (Node.js 22+, FFmpeg, Git, the kit's npm dependencies, the rendering Chrome, the .env file, the Deepgram key), installs it step by step with the right package manager, tells the student before every password or permission prompt and every terminal restart, then proves the setup with tests and a first render. Use when the student types /instalar, says "instalar", "instala o kit", "configurar o computador", "primeira vez", "não funciona o npm/ffmpeg/node", or asks to set up the kit.
---

# Instalar o kit

The student is usually a beginner who has never used a terminal. They opened this
folder in Claude Code (or Codex) and typed `/instalar`. Your job: leave their
computer able to transcribe, cut, preview, and render, and prove it with a render.

## How to behave

- Talk to the student in simple Brazilian Portuguese. One step at a time. Say what
  you are about to install and why in one sentence before each install.
- The skill is resumable. Students will restart the terminal in the middle. Every
  time it starts, run the diagnosis again and continue from the first missing item.
  Never redo work that already passes.
- Never ask the student to paste an API key, password, or token into the chat.
  Never print the contents of `.env`. Keys go into `.env` through a text editor.
- You cannot type passwords. Any command that asks for a password (`sudo`,
  Homebrew's installer) must be run by the student in their own terminal window.
  Give them the exact command in a code block and wait for "pronto".
- Windows permission dialogs (UAC) are graphical: you may run `winget`, but warn
  first: "Vai aparecer uma janela pedindo permissão; clique em Sim."
- Never use `sudo npm`, never change system security settings beyond what is
  written here, and never install software that is not listed in this skill
  without asking.
- Model, plan, and permission settings belong to the student. Do not edit
  Claude Code or Codex settings.

## Step 0: where are we

1. Identify the OS and shell. On Windows, Claude Code runs PowerShell (or Git Bash
   when Git for Windows is installed); use commands that work in the shell you have.
2. Check the folder path (`pwd` / `Get-Location`). Warn and recommend moving the
   folder before installing anything when the path:
   - is inside OneDrive (`OneDrive` in the path) or another sync folder: syncing
     `node_modules` (about 700 MB, tens of thousands of files) breaks installs;
   - contains accents or spaces, for example `Área de Trabalho` or `Meus Documentos`:
     some FFmpeg and Chrome steps fail on those paths.
   A good place: `$HOME\edit-kit` (the user profile folder) on Windows, `~/edit-kit` on macOS/Linux.
   Moving means closing Claude Code, moving the folder, and opening it again there.
3. Check free disk space: the kit needs about 2 GB (dependencies, Chrome, renders).

## Step 1: diagnosis

If `node --version` works and reports 18 or newer, run:

```bash
node scripts/setup.mjs --json
```

It returns `{ ok, platform, checks: [{ name, ok, required, detail, fix, restartTerminal }] }`
and creates `.env` from `.env.example` if missing. Work through the failing checks in
the order below. Without Node, check `ffmpeg -version`, `ffprobe -version`, and
`git --version` by hand and start with Step 2.

Show the student a short checklist (feito / falta) before installing.

## Step 2: system programs

Install only what is missing. After installing Node, FFmpeg, or Git, the current
terminal (and this Claude Code session) does not see the new program. Tell the
student: "Feche o Claude Code, abra de novo nesta pasta e digite /instalar outra vez.
Eu continuo de onde parei." Batch the installs so the student restarts once.

### Windows

1. Check `winget --version`. If missing, ask the student to install or update
   "Instalador de Aplicativo" (App Installer) from the Microsoft Store, then restart.
2. Install the missing items (each opens a permission window):

   ```powershell
   winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
   winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
   winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements
   ```

   Git is optional, but recommended: with it Claude Code can use Bash on Windows.
3. If `npm` later fails with "a execução de scripts foi desabilitada" /
   "running scripts is disabled", PowerShell is blocking `npm.ps1`. Prefer `npm.cmd`
   for the rest of the session. Only if the student wants a permanent fix, explain
   and run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### macOS

1. Homebrew (`brew --version`). If missing, the student runs this in their own
   Terminal window (it asks for the Mac password, typed without showing characters):

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   At the end the installer prints "Next steps" with two lines starting with
   `echo` and `eval` (Apple Silicon Macs). Ask the student to run those lines too,
   then close and reopen the terminal and Claude Code.
2. Then you can run, without a password:

   ```bash
   brew install node ffmpeg
   ```

   Git comes with the Xcode command line tools; if `git --version` opens a dialog,
   the student clicks "Instalar".

### Linux (Ubuntu/Debian)

1. FFmpeg and Git need `sudo`, so the student runs in their own terminal:

   ```bash
   sudo apt update && sudo apt install -y ffmpeg git curl
   ```

2. Node 22 without `sudo`, through nvm (you can run these):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```

   Then restart the terminal and run `nvm install 22`. Do not use the distribution's
   `apt install nodejs`: it is usually older than 22.
3. Other distributions: use the equivalent package manager and say which you used.

## Step 3: the kit itself

Run these from the kit's root folder (you can run all of them):

```bash
npm ci
npx hyperframes browser ensure
npm test
```

- `npm ci` takes a few minutes. If it fails with a network error, retry once; if it
  fails with `EPERM`/`EBUSY` on Windows, an antivirus or OneDrive is locking files
  (see Step 0).
- `npx hyperframes browser ensure` finds the system Chrome or downloads one for
  rendering. No admin needed.
- `npm test` must pass. If a test fails, show the student the failing test name and
  fix the environment cause; do not edit tests.

Run `node scripts/setup.mjs` again; every required item must show OK.

## Step 4: prove it with a render

```bash
npm run demo
cd video-projects/demo
npx hyperframes lint
npx hyperframes render --quality draft --output renders/demo.mp4
```

If `video-projects/demo` already exists, `npm run demo` refuses to overwrite it;
skip creation and render the existing one. Confirm `renders/demo.mp4` exists and
has about 8 seconds (`ffprobe -v error -show_entries format=duration -of csv=p=0 renders/demo.mp4`).
Tell the student where the file is and to open it. Offer `npx hyperframes preview`
to see the Studio (stop it with Ctrl+C).

## Step 5: Deepgram key

Only needed to transcribe their own recordings. Guide, do not do it for them:

1. Create an account at https://console.deepgram.com (new accounts get free credit).
2. In **Settings > API Keys**, create a key with the "Member" role and copy it.
3. Open `.env` in a text editor for them:
   - Windows: `notepad .env`
   - macOS: `open -e .env`
   - Linux: `xdg-open .env` (or `nano .env`)
4. They paste the key after `DEEPGRAM_API_KEY=` (no spaces, no quotes), save, close.
5. Verify without printing the key:

   ```bash
   node scripts/setup.mjs --check-key
   ```

   "válida" means done. HTTP 401 means the key was pasted wrong.

## Finish

Show a final checklist: Node, FFmpeg, ffprobe, Git, dependencies, Chrome, test suite,
demo render (with its path), Deepgram key. Mark anything skipped as pending and say
why. Then suggest the first real step in Portuguese:

> Crie um projeto com `npm run new-video -- meu-primeiro-video`, coloque sua gravação
> em `video-projects/meu-primeiro-video/assets/raw.mp4` e me peça:
> "Use o edit-video para editar minha gravação."
