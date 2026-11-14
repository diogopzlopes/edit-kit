# Playbook de edição: como editar vídeos com IA

Reels, Shorts e vídeos explicativos podem ser editados por um agente de IA (Claude
Code ou Codex) rodando skills como as deste kit. Você grava falando, entrega o
arquivo, e o agente corta, legenda, encontra o B-roll, monta os motion graphics,
mixa música e efeitos e confere o próprio trabalho.

Esta página explica como isso funciona e o que aprendemos ao construir o kit. Os
números vêm do estudo frame a frame de reels com bom desempenho e de dezenas de
rodadas de edição com comentários.

- [O ciclo que faz funcionar](#o-ciclo-que-faz-funcionar)
- [A edição, passo a passo](#a-edição-passo-a-passo)
- [Estilo de reel (os números)](#estilo-de-reel-os-números)
- [B-roll](#b-roll)
- [Legendas](#legendas)
- [Música e efeitos sonoros](#música-e-efeitos-sonoros)
- [Outros formatos](#outros-formatos)
- [Conferindo a edição](#conferindo-a-edição)
- [Lições que custaram tempo](#lições-que-custaram-tempo)

## O ciclo que faz funcionar

As edições ficam boas porque cada comentário vira uma regra permanente numa skill.
Você nunca precisa dar o mesmo comentário duas vezes.

1. **Grave e entregue o arquivo.** Sem programa de edição.
2. **O agente edita e renderiza um rascunho.**
3. **Você assiste e diz o que não gostou, com suas palavras.** "Não dá pra ler essa
   legenda." "Esse plano não se mexe." "Esses efeitos estão parecendo baratos."
4. **O agente corrige a edição E escreve a correção na skill** como regra, checagem
   ou mudança de script. Peça isso explicitamente: "Corrige e depois coloca isso na
   skill pra nunca mais acontecer."
5. **A próxima edição já começa da skill melhorada.**

Exemplos reais de comentários que viraram regra:

| Comentário | O que a skill faz agora |
|---|---|
| "Legenda branca em cima de site claro não dá pra ler." | Toda legenda fica na mesma caixa escura, e uma checagem de contraste mede os pixels atrás de cada uma. |
| "B-roll em vídeo de IA sempre ganha de imagem de IA." | Usar imagem parada de IA como B-roll é erro de build. Imagens só viram primeiro frame de vídeo de IA. |
| "Todo plano tem que se mexer." | Cada plano é filmagem real, gravação de tela, interface animada ou vídeo de IA, com um push-in lento. Nada de frame congelado. |
| "Esses efeitos de laser parecem baratos." | A paleta de som trocou para toques suaves, cliques secos, papel e ar. Nada de "plop" descendo de tom nem zaps. |
| "No final a boca está atrasada em relação à voz." | Os cortes escolhem frames exatos numa passada só, e uma checagem de sincronia compara cada frame cortado com o bruto. |
| "A legenda nunca pode sumir." | Em planos cheios de texto para ler, a legenda vai para uma área livre em vez de desaparecer. |
| "Você cortou minha pausa natural depois do 'primeiro', ficou corrido." Depois de uma correção que pôs silêncio ali: "Agora você engoliu a palavra 'primeiro'." | A fala é cortada entre frases, no silêncio real, nunca no meio. Uma muleta colada na palavra seguinte fica, porque cortar ela corta as palavras ao redor. |
| "A legenda cobre minha boca no primeiro segundo." | Uma legenda que atravessa um corte se move junto com o corte, e os primeiros 2,5 s são conferidos frame a frame. |

O conhecimento de edição mora nos arquivos das skills, então você pode ler, editar
e compartilhar.

## A edição, passo a passo

Essa é a ordem que as skills `short-form-edit` e `edit-video` seguem.

1. **Transcreva** com tempo por palavra (Deepgram nova-3 em `pt-BR` é o padrão do
   kit; Whisper também funciona). Passe os nomes de marca e ferramenta com `--keyterm`.
2. **Corte os retakes.** Fique com o último take limpo de cada frase. Junte dois
   takes só onde os dois lados estão em silêncio; se os takes se emendam, use um
   take inteiro.
3. **Corte entre frases, nunca no meio.** Uma frase é o que você fala num fôlego.
   Tire o ar morto entre frases e mantenha os seus respiros naturais (depois de uma
   vírgula, depois de "Primeiro,"). Tire uma muleta só quando há silêncio dos dois
   lados: em "Primeiro, o que ele faz é transcrever" é uma frase só, e cortar "o
   que ele faz é" engole a palavra "Primeiro". Nunca acelere a voz.
4. **Planeje a história antes dos visuais:** gancho, prova, os itens, o payoff, o
   CTA. Escreva.
5. **Encontre o B-roll**, um visual por substantivo, na ordem de preferência abaixo.
6. **Monte a composição** no HyperFrames, cada plano ancorado na palavra falada que
   ele ilustra.
7. **Mixe** voz, música e efeitos.
8. **Renderize um rascunho, confira** (frames, sincronia, som, legendas), corrija e
   renderize o final.

## Estilo de reel (os números)

Medidos em 27 reels com bom desempenho no Instagram. Use como ponto de partida para
o seu estilo, não como lei. A fala em português costuma ser um pouco mais lenta
em palavras por segundo do que em inglês, porque as palavras são mais longas.

**Ritmo**
- A fala começa em até 0,1 s. O arquivo termina logo depois da última palavra. Sem
  vinheta de abertura ou encerramento.
- Sem ar morto: pausas entre frases ficam abaixo de uns 0,2 s. Respiros naturais
  depois de vírgula ou de marcador de lista ("Primeiro,") ficam entre 0,2 e 0,4 s.
  O intervalo típico entre palavras é 0,04 s (mediana) e 0,1 s (percentil 90), a
  4,0 a 4,7 palavras por segundo em inglês (espere algo como 3,5 a 4,2 em
  português). A sensação de ritmo vem de tirar o ar morto entre frases.
- Planos de 1,1 a 1,4 s em média, nenhum acima de uns 2,8 s. O primeiro corte cai
  entre 0,6 e 1,0 s, na primeira palavra forte.
- Cada item de uma lista falada ganha o seu plano.

**Layouts** (1080x1920; toda troca é corte seco)
- **Dividido:** B-roll em cima (y de 0 a 880), quem fala embaixo. 30 a 42% do reel.
- **B-roll cheio:** a imagem ocupa o quadro. 50 a 55%.
- **Punch-in:** plano fechado em quem fala para viradas, ênfase e o CTA. 5 a 15%.
- Quem fala aparece cerca de 45% do tempo e nunca some por mais de uns 3,5 s.
- O primeiro frame é dividido, com a ferramenta ou a marca do tema em cima.

**História**
1. Gancho nos 3 primeiros segundos: uma afirmação ou um comando que cita a
   ferramenta ou a pessoa.
2. Uma linha de credibilidade ou contexto.
3. Se houver lista, mostre todos os itens cedo, desfocados, como loop aberto.
4. Cada item: um card de seção, uma definição de uma linha, dois ou três visuais
   literais, um punch-in na frase principal.
5. Resolução que retoma o visual do gancho.
6. CTA: mostre o material primeiro, depois um punch-in com a palavra para comentar
   ("Comenta EDITAR que eu te mando").

## B-roll

**Vídeo ganha de imagem, sempre.** O reel precisa segurar a atenção do primeiro ao
último frame, então todo plano se mexe. Ordem de preferência:

1. Filmagem real da coisa citada: a palestra da pessoa, a demo do produto, o seu
   próprio vídeo longo.
2. Gravação de tela real do site ou app, com zoom na parte falada e cursor visível.
3. Interface animada de mentira: digitando, linhas aparecendo, contador subindo.
   Indique que é exemplo.
4. Vídeo de IA. Metáforas concretas funcionam ("queimar dinheiro" = uma nota
   pegando fogo, "torcer pra dar certo" = um caça-níquel). Clipes genéricos de
   "pessoa no computador" parecem banco de imagem.
5. Recortes curtos de destaque de uma página real (menos de 1 s) em nomes de
   ferramenta, preços e selos.

Regras que vieram de erros:
- Nunca invente números, resultados ou um teste bem-sucedido para enfeitar uma afirmação.
- Uma página inteira encolhida para o tamanho do celular é ilegível. Recorte a
  frase e destaque na palavra falada.
- Interface pequena flutuando no vazio é o sinal mais rápido de "edição de IA".
  Dê zoom até a interface preencher o painel.
- Nunca clique em "Aceitar" em avisos de cookies ou termos enquanto grava. Feche ou
  use outra página.
- Modelos de vídeo de IA costumam trocar de ângulo por volta de 2,5 a 3 s, e o texto
  em telas de IA vira rabisco. Use os primeiros segundos contínuos e deixe telas
  pequenas no quadro.
- Planos de IA seguidos da mesma pessoa precisam combinar (mesma roupa, mesmo
  ambiente). Passe o frame anterior como referência.
- Use cada cena de B-roll uma vez por reel.

## Legendas

- 2 a 4 palavras por bloco em português (1 a 3 em inglês), quebrando nos limites
  de frase. Trocam seco, sem animação de "pop", e aparecem 2 frames antes da
  primeira palavra.
- Montserrat ExtraBold, tudo em maiúsculas, uns 62 a 64 px, com um acento serifado
  pesado (Abril Fatface) em 5 a 20% dos blocos, para palavras suaves. Nunca dois
  blocos serifados seguidos. As duas fontes têm todos os acentos do português;
  confira `Ç`, `Ã` e `É` em maiúsculas e deixe altura de linha de pelo menos 1,1.
- Cor em 25 a 45% dos blocos, sempre no bloco inteiro: vermelho para o jeito errado
  ou uma perda, verde-azulado para o conceito ou palavra-chave, verde para a ação
  ou o payoff.
- **Um visual só para o reel todo:** toda legenda na mesma caixa escura com uma
  borda clara fina, para ler bem em preto, branco e imagem. Misturar legenda com e
  sem caixa ficou com cara de amador.
- **Nunca branco no claro.** Meça os pixels atrás de cada legenda.
- Posição: na emenda no layout dividido, na camisa no punch-in (não no queixo) e
  numa área livre quando o plano é texto para ler.
- **Nunca sobre a boca ou o queixo,** principalmente no primeiro segundo, quando o
  espectador decide se a pessoa na tela é real. Uma legenda que atravessa um corte
  vai para o lugar certo do plano novo no frame do corte.
- Mantenha os acentos e o jeito falado ("pra", "tá", "a gente"). "Voce" sem acento
  parece erro para quem assiste.

## Música e efeitos sonoros

- **Escolha a música pelo clima:** uma batida mais escura e confiante para
  afirmações e notícias, lo-fi ou groove tranquilo para métodos.
- A trilha fica uns 11 dB abaixo da voz (faixa de trabalho de 9 a 14 dB). Abaixe a
  música sob a fala. O primeiro 1 a 2 s costuma ser mais baixo, com a batida
  entrando na segunda frase.
- **Efeitos seguem ações visíveis,** não todo corte: um sopro de ar suave num
  movimento espacial real, um toque abafado quando um logo pousa, um clique seco
  para interface pequena, papel para documentos, um tom quente curto para um check,
  uma parada seca para um X.
- Evite zaps de laser, "plops" descendo de tom, bipes de ficção científica e
  whoosh em todo corte.
- Varie os arquivos de som em itens repetidos (clique, toque, cerâmica) para uma
  lista não soar como loop de percussão.
- Masterize perto de -14 LUFS com true peak em -1,5 dBTP ou menos. **Meça o arquivo
  final codificado,** não só o WAV.
- Nunca faça fade na última palavra falada.

## Outros formatos

**Reel bruto (estilo mais leve):** sem B-roll e sem música. Corte só retakes,
gaguejos e ar morto, mantendo o último take limpo. Uma palavra na tela por vez,
pequena, no meio de baixo, sincronizada com a palavra exata. Quando a pessoa aponta
enquanto fala o nome de uma ferramenta, coloque o logo real onde ela aponta com um
toque discreto. Corte só depois que a palavra termina de soar; transcrições
terminam a palavra 40 a 80 ms antes da consoante acabar.

**Short a partir de vídeo longo:** gravação de tela em cima, rosto embaixo,
legendas com destaque de palavra na emenda. Coloque o valor ou a afirmação nos 3
primeiros segundos, depois as provas na ordem do vídeo longo, e termine numa
conclusão completa. Todo número na tela precisa ser explicável pelo que o Short
mostrou. Apresente as coisas antes de usá-las. Deixe os rótulos abaixo dos 130 px
do topo. Nunca monte um CTA que a pessoa não falou.

**Explicativo narrado (voz de IA):**
- Coloque a linha do tempo inteira num relógio só (um grid de batidas), para
  imagem, música e efeitos se moverem juntos quando uma frase muda. Nunca fixe à
  mão o tempo em que uma palavra deve cair.
- Nivele todas as falas na mesma loudness e limite só os picos. Baixar uma fala
  inteira para caber no pico mais alto deixou uma fala 5 dB mais baixa.
- Retranscreva a narração inteira e compare com o roteiro antes de cada render.
- Não coloque o narrador sobre a imagem de uma pessoa real falando. O público acha
  que é aquela pessoa falando com a voz de IA.
- Termine na frase da tese, falada no fim do último impacto da música, e depois o logo.
- Painéis de interface escuros e formas de onda perdem o público. Coloque imagens
  reais nessas cenas.

## Conferindo a edição

O agente confere o próprio trabalho antes de você ver:
- **Sincronia labial:** compare os frames cortados com o bruto. Só bater a contagem
  de frames não prova que os frames certos foram escolhidos.
- **Tiras de frames** em cada corte (10 frames de cada lado). Pegam painel vazio de
  um frame e legenda piscando no plano errado, que um print isolado não pega.
- **Contraste** atrás de cada legenda.
- **Toda palavra inteira:** transcreva o render final e compare as palavras em cada
  corte com a gravação bruta. A transcrição sozinha não prova nada: o
  reconhecimento de fala adivinha certo uma palavra cortada que o ouvido percebe
  quebrada.
- **O primeiro segundo:** leia os primeiros 2,5 s frame a frame e o primeiro frame
  de cada plano de rosto. Nada cobre a boca.
- **Loudness e true peak** no arquivo entregue.
- **Testes de "IA assistindo"** (um modelo de vídeo vendo o render) ajudam a achar
  problemas candidatos, mas têm ruído e inventam efeitos. Confirme cada reclamação
  nos frames reais antes de agir. Um painel de personas ("esse espectador assistiria
  até o fim? onde parou?") ajuda mais do que uma nota de 1 a 10.
- **Sua revisão é a última barreira.** Já aconteceu de um desvio de sincronia passar
  por todas as checagens automáticas e só ser percebido por quem assistiu.

## Lições que custaram tempo

- Codificar cada segmento separado e concatenar desloca a sincronia labial em cerca
  de um frame em metade das emendas. Selecione os frames exatos numa passada só.
- Baixe o stream de vídeo completo e corte local; buscar por HTTP um trecho de 3 s
  levou mais de 10 minutos.
- Gravadores de tela no navegador capturam pixels CSS, então gravações em tela de
  alta densidade saem pequenas. Capture frame a frame.
- Alguns sites de documentação rolam um container interno; role com a roda do mouse,
  não com `window.scrollTo`.
- Uma caixa de legenda escura some em fundo escuro se não tiver uma borda clara fina.
- Anime transforms (x, y, scale), não `top` ou `left`.
- Cortar uma muleta do meio de uma frase engole as palavras ao redor, e colocar uma
  pausa ali deixa a palavra cortada abafada. A versão que funcionou tinha menos
  cortes, todos entre frases, e ficou 5 s mais longa.
- Meça a loudness na entrega estéreo. Um arquivo mono mede 3 dB a menos e um reel
  saiu alto demais por causa disso.
- A gravação bruta limita a edição. Um clipe sem gancho e sem CTA vai mal por melhor
  que seja o corte. Roteirize o gancho antes de gravar.
- Em português, nomes de ferramentas em inglês são o erro de transcrição mais comum
  ("Clóde Code", "êne oito ene"). Passe esses nomes com `--keyterm` e confira na
  legenda.
