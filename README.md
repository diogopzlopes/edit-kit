# Diogo Lopes Edit Kit

Kit de edição de vídeo com IA para **Claude Code e Codex**, construído sobre o
HyperFrames. Você grava, entrega o arquivo e o agente corta o tempo morto, propõe
os cortes de erros, planeja a história e monta motion graphics com HyperFrames e
GSAP. Feito para criadores brasileiros: transcrição em português com Deepgram,
legendas com acentuação correta, números em `R$` e datas em `dd/mm`, e foco em
Reels, TikTok e Shorts.

## O que vem no kit

- **[Playbook de edição](docs/EDITING-PLAYBOOK.md):** como editar com IA, o estilo
  de reel medido (ritmo, layouts, legendas, B-roll e som) e como cada comentário
  seu vira uma regra permanente na skill.
- **15 skills**, espelhadas para os dois assistentes, com scripts e referências.
- **Transcrição em português** com Deepgram nova-3 (`pt-BR` por padrão), com
  diarização, pontuação e reforço de termos (nomes de marcas e ferramentas).
- **Corte de silêncio e de erros** que entende português: gaguejos com acento
  ("não não"), muletas isoladas ("hum", "né", "tipo") e retakes.
- **406 cards de motion graphics** (rascunhos) em dois estilos, com tokens CSS e
  campos de texto editáveis. Todas as fontes suportam acentos do português.
- **Dois templates de cena:** papel milimetrado escuro e popout de vidro à esquerda.
- **Short-form:** Reels, TikTok e Shorts, com planejamento de gancho e payoff,
  legendas precisas, B-roll em movimento e revisão de áudio.
- Retiming de transcrição, revisão de EDL, validação de sincronia com a fala,
  preflight e um projeto inicial sintético que não precisa de vídeo nem de chave.

## Ferramentas e serviços

**O kit usa o Deepgram para transcrever.** Cada aluno usa a própria chave (o
Deepgram dá créditos grátis ao criar a conta). Também dá para pedir ao assistente
para usar Whisper (API da OpenAI ou local) ou entregar uma transcrição pronta com
tempo por palavra. Gerar vídeos e imagens com IA (Kie.ai) é opcional.

O projeto inicial roda sem nenhuma API paga. Veja o
[guia de ferramentas, contas e chaves de API](docs/TOOLS-AND-API-KEYS.md).

## Instalação

**Jeito mais fácil:** siga o [COMECE-AQUI.md](COMECE-AQUI.md). Você instala o Claude
Code, abre esta pasta e digita `/instalar`; a IA instala o resto e renderiza um
vídeo de teste.

**Manual:** instale o **Node.js 22 ou mais novo**, Git, FFmpeg (com ffprobe) e Chrome ou
Chromium. Confira se `node`, `ffmpeg` e `ffprobe` funcionam no terminal. Depois
rode no PowerShell, no Terminal do macOS ou no Linux:

```sh
git clone https://github.com/diogopzlopes/edit-kit.git
cd edit-kit
npm ci
npm run setup
npm test
```

O `setup` confere as ferramentas e cria o `.env` se ele ainda não existir. Coloque
nele a sua `DEEPGRAM_API_KEY` e só as outras chaves que for usar.
[Instalação e problemas comuns](docs/SETUP.md).

## Renderize o primeiro exemplo

```sh
npm run demo
cd video-projects/demo
npx hyperframes lint
npx hyperframes preview
```

Navegue pela animação de oito segundos no Studio. Depois feche o preview com
Ctrl+C e renderize:

```sh
npx hyperframes render --quality draft --output renders/demo.mp4
```

A demo usa o GSAP local e não tem narração. Na primeira renderização o HyperFrames
pode baixar fontes substitutas. A [transcrição sintética](examples/editing/source-pt.json)
serve para testar as ferramentas de corte; é um dado inventado.

## Transcreva sua gravação

```sh
npm run new-video -- meu-video
npm run transcribe -- video-projects/meu-video/assets/raw.mp4 --keyterm "Claude Code"
```

Isso gera `raw.json` com o tempo de cada palavra. Use `--keyterm` para nomes de
marcas, pessoas e ferramentas, e `--language en` se a fala for em inglês.

## Edite sua gravação

Abra esta pasta no Claude Code ou no Codex e peça:

> Use o edit-video para editar minha gravação em [caminho local]. Mantenha meus
> exemplos e os pontos principais. Tire o tempo morto, me mostre os cortes de erro
> propostos e use o estilo de papel milimetrado escuro com alguns cards de vidro.
> Gere um rascunho revisado.

Claude Code: `/edit-video`. Codex: `$edit-video`. Para uma etapa só, use
`cut-silences`, `cut-mistakes`, `video-storytelling` ou `style-library`.
Veja o [passo a passo](docs/WORKFLOW.md), as [receitas de prompt](docs/PROMPTS.md)
e o [caderno de storytelling](docs/STORYTELLING-WORKBOOK.md).

## Crie um Reel, TikTok ou Short

> Use o short-form-edit para transformar minha gravação em [caminho local] num
> reel 9:16. Crie um gancho e um payoff verdadeiros, preserve o que eu quis dizer,
> corte os erros e coloque legendas precisas, B-roll com movimento e efeitos
> sonoros. Prepare um rascunho para revisão. Use minhas imagens antes de propor
> gerar qualquer coisa com IA.

Claude Code: `/short-form-edit`. Codex: `$short-form-edit`. A skill tem
validadores de tempo de legenda, mapeamento da fonte, cobertura de cenas e reuso
de imagens. Assista e ouça o resultado antes de publicar.
[Guia de short-form](docs/SHORT-FORM.md).

## Faça um showreel de motion design

> Use o motion-showreel para fazer um showreel de 15 segundos para [marca]. Estude
> meu vídeo de referência em [caminho local], se eu passar um. Escolha um motivo
> visual que se transforme em cada capítulo, corte no tempo da música e termine no
> logo. Me mostre o storyboard antes de construir e confirme antes de gerar música
> ou imagens pagas.

Claude Code: `/motion-showreel`. Codex: `$motion-showreel`.

## Explore e personalize

| Recurso | Comece por |
| --- | --- |
| Estilo, regras e lições de edição | [Playbook de edição](docs/EDITING-PLAYBOOK.md) |
| Instruções para os agentes | [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) |
| Português, legendas, `R$` e formatos BR | [Localização Brasil](.claude/skills/short-form-edit/references/brazil-localization.md) |
| Vocabulário de movimento e transição | [MOTION_PHILOSOPHY.md](MOTION_PHILOSOPHY.md) |
| Biblioteca de cards e tokens | [Guia da biblioteca](style-library/GUIDE.md) |
| Metadados pesquisáveis dos cards | [registry.json](style-library/registry.json) |
| Templates de cena | [Guia de templates](style-templates/README.md) |
| Codex e espelhamento das skills | [.codex/README.md](.codex/README.md) |
| Verificação e limites | [Verificação](docs/VERIFICATION.md) |
| Recursos de terceiros | [Avisos](THIRD_PARTY_NOTICES.md) |

Os cards são **rascunhos reutilizáveis**: teste os que escolher com o seu texto e
as suas imagens. Os textos de exemplo dos cards estão em inglês; o agente preenche
em português. Alguns templates carregam GSAP e Google Fonts por CDN; deixe essas
dependências locais ao montar o projeto final.

Pastas novas em `video-projects/` e `raw-media/` são ignoradas pelo Git, então
suas gravações, transcrições e renders ficam só na sua máquina. Crie um projeto
novo para cada vídeo. Os projetos de exemplo que já estão no repositório são
material de terceiros para estudo; não reutilize marcas, logos ou rostos deles.

## Licença

MIT. Veja [LICENSE](LICENSE) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
