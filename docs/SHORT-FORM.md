# Reels, TikTok e YouTube Shorts

Use o `short-form-edit` para uma gravação bruta de alguém falando, um reel, um
TikTok, um Short ou um anúncio curto. O padrão é 1080x1920, 30 fps. Peça uma versão
1920x1080 composta separadamente quando precisar; um corte central não é uma
segunda composição.

## Comece

Rode `npm run new-video -- meu-reel` e peça ao Claude Code (`/short-form-edit`) ou
ao Codex (`$short-form-edit`) para editar sua gravação local nesse projeto. Diga o
público, a ação que você quer (comentar, salvar, seguir, clicar no link da bio), a
duração alvo e as preferências de marca. O projeto inicial é horizontal; a skill
precisa definir as dimensões, o layout e os metadados para 1080x1920 antes de
montar. Mantenha todas as imagens e saídas dentro do projeto novo.

1. Transcreva com o Deepgram (pt-BR), com outra alternativa, ou reaproveite timestamps conferidos.
2. Revise os erros no contexto e monte uma lista única de decisões de edição alinhada aos frames.
3. Explore três aberturas e escolha uma promessa e um payoff verdadeiros.
4. Planeje cenas, legendas exatas, imagens em movimento e efeitos sonoros a partir das palavras mantidas.
5. Monte a composição com as skills de HyperFrames e GSAP. Use um registro de imagens
   (footage ledger) para guardar a origem e evitar repetir a mesma cena sem querer.
6. Valide, faça o preview, renderize um rascunho, confira os frames e ouça a edição inteira.
7. Resolva tempo, áudio e composição antes de exportar o vídeo final.

## Padrões para o Brasil

A referência [brazil-localization.md](../.claude/skills/short-form-edit/references/brazil-localization.md)
define o que a skill segue por padrão:

- **Legendas:** 2 a 4 palavras por bloco (o português é cerca de 20% mais longo que
  o inglês), sempre com acento, palavras curtas ("de", "o", "que") junto da
  seguinte, e espaço de linha para acento em maiúscula (`É`, `Ã`, `Ç`).
- **Números:** `R$ 1.997`, `12,5%`, `1,5 mi de views`, `14/11`, `19h30`, sempre
  formatados com `Intl` em `pt-BR`, inclusive nos números que contam animados.
- **Formato:** 1080x1920 para Reels e TikTok, com legendas entre y=220 e y=1580 e
  longe dos 140 px da direita, onde ficam os botões. A capa do Reels mostra o
  centro 4:5 no grid do perfil.
- **CTA natural:** "Comenta EDITAR que eu te mando", "Salva pra não perder",
  "Segue pra parte 2", "Link na bio".
- **Registro falado:** "pra", "tá", "a gente" ficam como foram ditos.

O Kie.ai é a sugestão do kit para gerar vídeo e imagem. Os alunos precisam de chave
e créditos próprios. Imagens que você já tem podem substituir os assets gerados.
Veja [ferramentas, contas e chaves de API](TOOLS-AND-API-KEYS.md). O exemplo
sintético de validação não precisa de nenhum serviço pago.

## Valide a partir da raiz do repositório

```sh
npm run validate:short-form -- video-projects/meu-reel
npm run validate:footage -- video-projects/meu-reel
node scripts/preflight.mjs video-projects/meu-reel
```

O primeiro validador lê `assets/plan.json`, `assets/transcript.json` e
`assets/edit-decisions.json`. O segundo lê o plano e, para imagens em movimento,
`assets/footage-ledger.json`, confere os hashes e se os arquivos existem. Siga o
[esquema do plano](../.claude/skills/short-form-edit/references/plan-schema.md). Use
a [ficha de análise de referência](../.claude/skills/short-form-edit/references/reference-analysis.md)
quando for estudar um vídeo de referência.

Teste com o exemplo sintético, sem gravação nem chave:

```sh
npm run validate:short-form -- examples/short-form
npm run validate:footage -- examples/short-form
npm test
```

O exemplo tem palavras e tempos inventados, não um reel renderizado. Os validadores
conferem a estrutura e os tempos declarados. Eles não provam que o gancho é bom,
que as afirmações são verdadeiras, que você tem direito às imagens, que o
enquadramento está certo nem que o áudio está sincronizado. Os critérios de
qualidade da skill exigem assistir e ouvir o resultado de verdade.
