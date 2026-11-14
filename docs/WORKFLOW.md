# Da gravação à edição final

## 1. Crie o projeto e transcreva

Na raiz do repositório, rode `npm run new-video -- meu-video`. Coloque sua gravação
em `video-projects/meu-video/assets/raw.mp4` e preserve esse original.

```sh
node scripts/transcribe-deepgram.mjs video-projects/meu-video/assets/raw.mp4 --keyterm "Nome da sua marca"
```

Isso envia o áudio para o Deepgram usando sua chave e seus créditos, em português
do Brasil por padrão. Você pode escolher Whisper da OpenAI, Whisper local ou outro
serviço; veja a [configuração dos serviços e a normalização da transcrição](TOOLS-AND-API-KEYS.md).
Também dá para usar uma transcrição JSON pronta com `words: [{text, start, end}]`
e `audio_duration_secs`.

## 2. Tire o tempo morto

```sh
node .agents/skills/cut-silences/scripts/cut-silences.mjs video-projects/meu-video/assets/raw.json --video video-projects/meu-video/assets/raw.mp4 --out-dir video-projects/meu-video/assets --output video-projects/meu-video/assets/silenced.mp4 --apply
```

A transcrição retimada é `raw.silence-transcript.json`. Ajuste os parâmetros de
pausa e respiração na skill; não tire pausas que carregam sentido.

## 3. Revise os erros

```sh
node .agents/skills/cut-mistakes/scripts/find-cut-candidates.mjs video-projects/meu-video/assets/raw.silence-transcript.json --out-dir video-projects/meu-video/assets
```

O detector entende português: gaguejos com acento ("não não"), retakes, falsos
começos e muletas isoladas ("hum", "né", "tipo"). Leia cada proposta junto com a
fala. Repetição intencional ("é muito, muito simples") não é erro. Grave as
decisões revisadas em `approved-cuts.json` assim:
`{ "cuts": [{ "start": 1.2, "end": 1.5, "reason": "gaguejo" }] }`.
Esses tempos estão na linha do tempo **já sem silêncios**. Uma lista vazia é válida.

```sh
node .agents/skills/cut-mistakes/scripts/apply-cuts.mjs video-projects/meu-video/assets/raw.silence-transcript.json --cuts video-projects/meu-video/assets/approved-cuts.json --video video-projects/meu-video/assets/silenced.mp4 --out-dir video-projects/meu-video/assets --output video-projects/meu-video/assets/clean.mp4 --apply
```

Use `raw.mistakes-transcript.json` junto com `clean.mp4`. Copie essa transcrição
para `assets/transcript.json` do projeto para validar os beats. Nunca use os tempos
originais com o vídeo já cortado. No Claude Code, troque `.agents` por `.claude`.

## 4. Desenhe a camada visual

Leia a skill video-storytelling e a filosofia de movimento. Preencha um roteiro de
beats com a frase falada que serve de âncora, a ideia na tela, o visual, o tempo de
entrada e o callback. Escolha um estilo e copie os cards com seus CSS e assets para
a composição. Preserve o rosto de quem fala e use um wrapper sem tempo para
reenquadrar a câmera. Escreva todo texto na tela em português, com acentos e
números no formato brasileiro (`R$ 1.997`, `12,5%`, `14/11`). O template de papel
milimetrado é só o fundo; o conteúdo da história vai por cima.

## 5. Confira, faça o preview e renderize

```sh
node scripts/preflight.mjs video-projects/meu-video
node scripts/validate-beat-sync.mjs video-projects/meu-video
cd video-projects/meu-video
npx hyperframes lint
npx hyperframes preview
```

Rode o beat-sync só quando houver sub-composições externas com âncora; ele falha
quando não há nenhuma. Em composições inline, confira o tempo manualmente. Revise
no Studio e renderize um rascunho. Confira os frames codificados nos momentos
principais e nas transições, e ouça as emendas de áudio. Corrija os problemas e
escreva o VERIFY.md antes da renderização final. Publicar é uma ação separada, que
só acontece quando você pedir.
