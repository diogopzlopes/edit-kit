# Templates de cena

- `dark-graph-paper-template/`: fundo animado; não precisa de vídeo. Copie o HTML e
  a configuração para um projeto novo e coloque o conteúdo da sua história por cima.
- `left-glass-popout/`: reenquadramento de câmera com um painel de vidro animado.
  Forneça seu `assets/source.mp4` com vídeo e áudio e ajuste a duração da fonte, o
  recorte, o texto do card e os tempos antes de renderizar.

Estes são pontos de partida de cena inteira; a style-library tem os cards. Os
templates usam o GSAP por CDN público. Para um projeto independente, copie
`node_modules/gsap/dist/gsap.min.js` para a pasta de assets e troque o `src` do
script para `assets/gsap.min.js`, como o projeto inicial faz.
