# Instalação e problemas comuns

Comece pelo guia de [ferramentas, contas e chaves de API](TOOLS-AND-API-KEYS.md)
para configurar o Deepgram, as alternativas com Whisper e os serviços opcionais.

Use Node 22+ (exigido pela versão fixada do HyperFrames), FFmpeg com ffprobe e
Chrome/Chromium. Rode `npm ci` na raiz do repositório antes de qualquer comando de
projeto. O `npm run setup` confere as ferramentas; `npx hyperframes doctor`
diagnostica o renderizador. Se o Chromium não estiver disponível, siga
`npx hyperframes browser --help`. No Windows, feche e abra o terminal depois de
instalar o FFmpeg para atualizar o PATH.

### Instalando as dependências

- **Windows:** `winget install OpenJS.NodeJS.LTS Git.Git Gyan.FFmpeg`
- **macOS:** `brew install node git ffmpeg`
- **Ubuntu/Debian:** `sudo apt install git ffmpeg` e o Node 22 pelo
  [nodejs.org](https://nodejs.org) ou pelo `nvm`.

O repositório fixa o HyperFrames 0.7.109 e o GSAP 3.14.2. Mantenha o
`package-lock.json` junto com o `package.json`. Atualize de propósito e depois
refaça os testes de renderização.

O `npm run new-video -- aula-um` copia o projeto inicial sintético e o GSAP local
para uma pasta nova e independente. Nomes que já existem são recusados, então nada
é sobrescrito. Use só letras minúsculas, números e hífen no nome. Troque o projeto
inicial pela sua gravação e pelas composições planejadas. O template de vidro à
esquerda precisa do seu `assets/source.mp4` com áudio.

O Codex lê o `AGENTS.md` e encontra `.agents/skills/`. Marque o projeto como
confiável no Codex se quiser carregar as configurações dele. Reinicie se as skills
não aparecerem. O Claude Code lê o `CLAUDE.md` e `.claude/skills/`. Nenhum dos dois
precisa de servidor MCP especial para editar localmente. O `npm run check` valida a
distribuição do kit; ele não confere seus projetos em `video-projects`.

Para atualizar uma skill, edite `.claude/skills/<nome>/`, rode `npm run sync:skills`
e depois `npm run check:skills`. Não precisa de permissão de symlink no Windows.

Erros do Deepgram: `401` normalmente é chave inválida; `402`/`403` é saldo ou
permissão insuficiente. Confira a chave sem imprimi-la. Nenhuma chave é necessária
para `npm test`, preview ou renderização do projeto inicial. Para fontes sem fala,
forneça uma faixa de áudio separada antes de usar os renderizadores de corte: eles
esperam um stream de vídeo e um de áudio.
