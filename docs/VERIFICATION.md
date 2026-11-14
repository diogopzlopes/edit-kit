# Verificação do kit

## Como conferir uma instalação

```sh
npm ci
npm run check
npm test
npm run test:media
```

Depois crie um projeto inicial novo (`npm run demo`), rode lint e preview,
renderize e confira o resultado.

- `npm run check` valida a sintaxe do JavaScript, o frontmatter das skills e os
  recursos citados, o espelhamento entre `.claude/skills` e `.agents/skills`, a
  contagem do registro, os IDs únicos, os campos declarados e as dependências locais
  dos 406 cards. Dois cards montam alguns campos em JavaScript; a declaração é
  conferida, não o DOM executado.
- `npm test` cobre: retiming de silêncio, corte de gaguejo revisado, edição sem
  cortes, cortes fora dos limites, tempo dos beats, desvio de legenda, mapeamento
  da fonte, cobertura de cenas, reuso de imagens e, em português, a normalização da
  resposta do Deepgram, o pedido padrão em `pt-BR`, gaguejos com acento ("não não"),
  muletas isoladas ("hum") e âncoras de beat com acento.
- `npm run test:media` gera um padrão de teste de oito segundos com um tom,
  renderiza as duas etapas de corte e monta o HTML de revisão da EDL.

## O que foi conferido nesta versão

- Transcrição: o script do Deepgram foi testado de ponta a ponta contra um servidor
  local que simula a API (extração de áudio, envio, parâmetros `nova-3`/`pt-BR`,
  `keyterm`, gravação do JSON normalizado e limpeza do mp3 temporário). Nenhuma
  chamada paga ao Deepgram foi feita nos testes; faça uma transcrição curta com a
  sua chave para conferir sua conta.
- O detector de erros e o validador de beats passaram a comparar palavras com
  acento corretamente. Antes, "não" virava "n" e "é" sumia.

## Escopo e limites

Este é um kit de trabalho, não uma promessa de julgamento editorial automático.
Os 406 cards continuam como rascunho e não foram aprovados um por um. Teste cada
card escolhido com o seu texto em português, conferindo quebra de linha e acentos
em maiúsculas. O projeto inicial é só motion graphics, sem fala. O teste de mídia
confere tempo e integridade dos streams com um tom, não a qualidade subjetiva dos
cortes de fala. Os templates precisam de adaptação; o popout de vidro precisa da
sua gravação. O HyperFrames pode baixar fontes substitutas na primeira renderização.
A verificação cruzada de plataformas roda no GitHub Actions (Windows, macOS e Linux).
