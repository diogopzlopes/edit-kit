# Configuração do Codex

Abra a pasta deste projeto no Codex. O `AGENTS.md` tem o guia do workspace; o Codex
encontra as skills completas em `.agents/skills/` automaticamente. Use
`$cut-silences`, `$cut-mistakes`, `$video-storytelling` ou linguagem natural.

`.claude/skills/` é a fonte oficial. Depois de mudar algo, rode:

```sh
node scripts/sync-codex-skills.mjs
node scripts/sync-codex-skills.mjs --check
```

O espelho usa arquivos de verdade, então no Windows não precisa de permissão de
symlink. Mantenha `AGENTS.md` e `CLAUDE.md` iguais. A configuração do projeto não
mexe no modelo, na autenticação, no sandbox nem nas aprovações do aluno. As
configurações do projeto carregam depois que você marca o projeto como confiável.
Reinicie o Codex se as skills novas não aparecerem. O Claude Code usa os arquivos
de `.claude/skills/`.

Referências oficiais: [descoberta de skills](https://learn.chatgpt.com/docs/build-skills)
e [configuração do projeto](https://learn.chatgpt.com/docs/config-file/config-basic).
