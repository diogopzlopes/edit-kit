# Ferramentas, contas e chaves de API

O kit usa o **Deepgram para transcrição** e sugere o **Kie.ai para gerar vídeos e
imagens**. Só a transcrição é necessária para editar uma gravação, e mesmo ela pode
ser trocada. Cada aluno usa as próprias contas e créditos e configura só o que usar.

## O que você precisa

| Ferramenta ou serviço | Quando precisa | Configuração e custo |
| --- | --- | --- |
| Claude Code ou Codex | Para seguir as skills de edição guiadas pelo agente | Seu próprio acesso ao assistente. Créditos de APIs externas são à parte. |
| Node.js 22+, npm, Git, FFmpeg com ffprobe e Chrome/Chromium | Edição local, preview e renderização | Instale no seu computador. Veja a [instalação](SETUP.md). |
| HyperFrames e GSAP | Composições de vídeo e animação | Instalados pelo `npm ci`. A renderização roda local. |
| Deepgram (nova-3) | Padrão do kit para transcrever a fala | Sua chave do Deepgram. O script incluído envia o áudio para o Deepgram. |
| API Whisper da OpenAI | Alternativa de transcrição na nuvem | Sua chave e faturamento da OpenAI. Peça ao assistente para configurar e normalizar. |
| Whisper local ou whisper.cpp | Alternativa de transcrição no seu computador | Instalação e modelos à parte. Sem custo de API, mas usa disco e processamento. |
| Kie.ai | Opcional: B-roll em movimento, imagens e outros assets gerados | Sua conta, chave e créditos. Suas próprias imagens podem substituir. |
| Suas gravações, logos, fontes, músicas e efeitos | Para montar a edição | Use material que você tem direito de usar. O kit não inclui banco de imagens nem de músicas. |

O projeto inicial e os testes não precisam de nenhuma API paga. Escolha um
serviço só quando a próxima etapa precisar.

## Deepgram: o script incluído

1. Crie uma conta em [console.deepgram.com](https://console.deepgram.com). Contas
   novas recebem créditos grátis, suficientes para muitas horas de teste.
2. Em **Settings > API Keys**, crie uma chave com permissão de membro (`Member`).
3. Coloque a chave no `.env` da raiz do kit:

   ```sh
   DEEPGRAM_API_KEY=sua-chave-aqui
   ```

4. Transcreva:

   ```sh
   npm run transcribe -- video-projects/meu-video/assets/raw.mp4
   ```

   ou, direto:

   ```sh
   node scripts/transcribe-deepgram.mjs video-projects/meu-video/assets/raw.mp4
   ```

O script extrai o áudio com o FFmpeg (mono, 16 kHz, mp3), envia para o Deepgram e
grava `raw.json` ao lado do vídeo, no formato comum do kit. A duração total vem do
ffprobe. O mp3 temporário é apagado depois do envio.

### Opções

| Opção | Para que serve |
| --- | --- |
| `--language pt-BR` | Idioma da fala (padrão). Use `en` para inglês ou `pt-PT` para português de Portugal. |
| `--language multi` | A pessoa mistura português e inglês na mesma frase. |
| `--detect-language` | Deixa o Deepgram descobrir o idioma. |
| `--keyterm "Claude Code"` | Reforça nomes próprios e jargões. Repita para vários termos. É o que mais melhora a transcrição de nomes de ferramentas em inglês falados com sotaque brasileiro. |
| `--model nova-3` | Modelo (padrão `nova-3`). |
| `--no-diarize` | Desliga a separação por falante. |
| `--filler-words` | Pede as hesitações ("um", "uh"). O Deepgram só faz isso em inglês. |
| `--keep-raw` | Salva também a resposta original em `raw.deepgram-raw.json`. |
| `--keep-audio` | Mantém o mp3 extraído. |
| `--output caminho.json` | Muda o arquivo de saída. |

Exemplo com termos de marca:

```sh
npm run transcribe -- video-projects/meu-video/assets/raw.mp4 --keyterm HyperFrames --keyterm "Claude Code" --keyterm n8n
```

Reaproveite uma transcrição já conferida em vez de pagar para transcrever o mesmo
take de novo. Consulte a [documentação do Deepgram](https://developers.deepgram.com/docs/pre-recorded-audio)
para modelos, idiomas e preços atuais.

### Hesitações em português

O Deepgram não escreve "éé", "hum" ou "ahn" em português: essas hesitações ficam
como um intervalo entre palavras. Na prática, o `cut-silences` encurta esse trecho
como qualquer outra pausa. Ouça as pausas longas antes de aprovar o corte, porque
uma hesitação cortada pela metade soa pior do que a inteira. Muletas que são
palavras de verdade ("né", "tipo", "então", "aí") aparecem na transcrição e o
`cut-mistakes` propõe revisar quando estão isoladas por silêncio.

### Erros comuns

- `HTTP 401`: chave inválida ou copiada com espaço. Confira o `.env` sem imprimir a chave.
- `HTTP 402` ou `403`: saldo ou permissão insuficiente na chave. Confira **Usage/Billing** e o papel da chave no console.
- `HTTP 400` com idioma: o código de idioma não existe para o modelo escolhido.
- Zero palavras: o idioma está errado ou o arquivo não tem fala.

## Whisper e outras alternativas

Você pode pedir ao assistente para usar outro serviço. O script
`transcribe-deepgram.mjs` só chama o Deepgram; trocar a chave não troca o serviço.

Na API da OpenAI, use `whisper-1`, `response_format="verbose_json"` e
`timestamp_granularities=["word"]`. Guarde `OPENAI_API_KEY` no `.env`. Confira o
limite de upload antes de mandar gravações longas; divida o áudio se precisar e
guarde o deslocamento de cada pedaço. Veja o [guia da OpenAI](https://developers.openai.com/api/docs/guides/speech-to-text).

Para transcrever local, peça ao assistente para configurar o
[Whisper](https://github.com/openai/whisper) ou o
[whisper.cpp](https://github.com/ggml-org/whisper.cpp). Nenhum dos dois é
instalado pelo `npm ci`.

As ferramentas de corte exigem este formato, com **tempo por palavra em segundos**
na linha do tempo da gravação original:

```json
{
  "text": "Olá, pessoal.",
  "language": "pt-BR",
  "audio_duration_secs": 2.0,
  "words": [
    { "text": "Olá,", "start": 0.2, "end": 0.6, "type": "word" },
    { "text": "pessoal.", "start": 0.7, "end": 1.2, "type": "word" }
  ]
}
```

Peça ao assistente para mapear o campo de palavra do serviço para `text`, manter os
tempos numéricos e pegar a duração total com o ffprobe. Parágrafos, SRT e
transcrições só por segmento não têm o tempo de cada palavra. Peça timestamps por
palavra ou faça alinhamento; nunca invente tempos. Depois de cada corte, as
palavras precisam ser retimadas pela EDL.

Prompts para copiar:

> Use o Whisper da OpenAI em vez do Deepgram nesta gravação. Use minha chave do
> .env, peça timestamps por palavra e normalize o resultado para o formato do kit
> antes de cortar. Preserve o arquivo original e confira o tempo com o áudio.

> Use o Whisper local para transcrever. Confira a instalação e os modelos antes,
> depois normalize os timestamps por palavra para o kit. Mantenha a transcrição
> local e use só as minhas imagens, sem geração paga.

## Kie.ai: vídeos e imagens gerados

O [Kie.ai](https://kie.ai/) é a sugestão do kit para gerar vídeos e imagens. Coloque
`KIE_API_KEY` no `.env` se escolher usar. Siga o
[guia oficial da API](https://docs.kie.ai/) para chaves, modelos, status das
tarefas e créditos.

A skill de short-form descreve um fluxo com o Kie; o kit **não** traz um script
universal de geração. A skill `motion-showreel` traz um cliente pequeno
(`scripts/kie.mjs`) para três assets de showreel: música instrumental Suno, imagens
Seedream a partir de um logo e movimentos de câmera Kling. Só colocar a chave não
cria a integração. Modelos, formatos e custos variam.

Antes de gerar algo pago que você ainda não autorizou, o agente deve mostrar os
assets propostos e o custo estimado. Guarde os IDs das tarefas, reaproveite
resultados bons e salve os escolhidos nos assets do projeto.

> Use o Kie.ai para o B-roll em movimento nas cenas aprovadas. Confira minha
> configuração e a documentação atual, depois me mostre os assets propostos e o
> custo estimado em créditos. Reaproveite minhas imagens sempre que der.

## Outras ferramentas opcionais citadas nas skills

- **Narração:** os guias do HyperFrames citam o Kokoro TTS local. ElevenLabs e
  HeyGen TTS também aparecem; cada um precisa de acesso e integração próprios.
- **Captura de sites:** o Gemini pode descrever imagens. A captura básica não precisa dessa chave.
- **Outra transcrição:** a referência do framework cita o Whisper da Groq. Precisa
  de chave própria e da mesma normalização.
- **Efeitos sonoros:** o `motion-showreel` pode gerar um kit de efeitos com o
  ElevenLabs (`scripts/sfx.mjs`), usando `ELEVENLABS_API_KEY` com acesso a sound
  effects. Sua própria biblioteca de efeitos funciona do mesmo jeito.
- **Exemplos antigos:** ClickUp ou OpenAI só são necessários se o projeto escolhido chamar esses serviços.

Uma skill citar uma ferramenta MCP não instala essa integração. Peça ao assistente
para conferir antes quais conectores ou clientes de API estão disponíveis.

## Configure só o que usar

O `npm run setup` cria o `.env` a partir do [`.env.example`](../.env.example) se ele
não existir. Deixe em branco o que não usar. Um `.env` existente é preservado,
então acrescente você mesmo as chaves novas. Nunca coloque chaves em composições,
prints ou commits. Confira preços e saldo antes de chamadas pagas: o kit não inclui
créditos de transcrição, geração, narração nem do assistente.
