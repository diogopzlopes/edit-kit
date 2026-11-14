# Comece aqui

São três passos. A IA cuida do resto.

## 1. Coloque a pasta do kit num lugar simples

Coloque esta pasta num caminho **sem acentos, sem espaços e fora do OneDrive**:

- Windows: dentro da sua pasta de usuário, `$HOME\edit-kit` (a pasta com o seu nome, que tem Documentos e Downloads)
- Mac e Linux: dentro da sua pasta pessoal, `edit-kit`

Evite "Área de Trabalho", "Meus Documentos" e pastas sincronizadas: elas
atrapalham a instalação. Se você baixou um zip, extraia e renomeie a pasta para
`edit-kit` (o zip às vezes vem como `edit-kit-main`).

## 2. Instale o Claude Code

Você precisa de uma assinatura paga do Claude (Pro ou superior). O plano grátis não
inclui o Claude Code.

**Windows:** abra o **PowerShell** (procure "PowerShell" no menu Iniciar), cole a
linha abaixo e aperte Enter:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Mac:** abra o **Terminal** (Cmd + Espaço, digite "Terminal"), cole e aperte Enter:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Linux:** mesmo comando do Mac, no terminal.

A instalação não mostra progresso; espere terminar. Depois **feche e abra o
terminal de novo**.

Prefere não usar o terminal? O [app Claude para desktop](https://claude.com/download)
também roda o Claude Code: abra o app, escolha a pasta do kit e siga o passo 3 a
partir do `/instalar`.

## 3. Abra o kit e peça a instalação

No terminal, entre na pasta do kit e abra o Claude Code:

**Windows:**

```powershell
cd $HOME\edit-kit
claude
```

**Mac e Linux:**

```bash
cd ~/edit-kit
claude
```

Na primeira vez, ele pede para você entrar na sua conta pelo navegador e pergunta
se confia nesta pasta: responda que sim. Depois digite:

```
/instalar
```

A IA confere o que falta no seu computador e instala com você: Node.js, FFmpeg, as
dependências do kit e o navegador de renderização. No fim, ela renderiza um vídeo
de teste para provar que tudo funciona.

Durante a instalação:

- **Vai aparecer janela pedindo permissão** (Windows) ou pedido de senha do
  computador (Mac/Linux). Isso é normal. No Mac e no Linux, a senha não aparece
  enquanto você digita.
- **Ela vai pedir para você fechar e abrir o Claude Code** depois de instalar alguns
  programas. Faça isso e digite `/instalar` de novo: ela continua de onde parou.
- **Nunca cole chaves ou senhas no chat.** Quando chegar a hora da chave do
  Deepgram, a IA abre o arquivo `.env` para você colar lá.

## Depois da instalação

Leia o [README](README.md) e comece seu primeiro vídeo:

```bash
npm run new-video -- meu-primeiro-video
```

Coloque sua gravação em `video-projects/meu-primeiro-video/assets/raw.mp4` e peça:

> Use o edit-video para editar minha gravação.

Algo deu errado? Digite `/instalar` de novo, ou rode `npm run setup` para ver o
diagnóstico com o comando certo para o seu sistema.
