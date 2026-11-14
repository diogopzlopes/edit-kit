# Brazilian Portuguese localization

Default audience for this kit: Brazilian viewers on Instagram Reels, TikTok, and
YouTube Shorts, with speech in Brazilian Portuguese. The user's brief wins when it
names another language or market.

## Transcription

- Default: `node scripts/transcribe-deepgram.mjs <source>` (Deepgram nova-3,
  `language=pt-BR`, smart formatting, diarization). Use `--language en` for English
  speech, `--language multi` when the speaker switches between Portuguese and
  English inside sentences, and `--detect-language` when unsure.
- Pass `--keyterm` for every proper noun the speaker says: brand, product, people,
  tools ("HyperFrames", "Claude Code", "n8n"). English tool names spoken with a
  Brazilian accent are the most common transcription error.
- Check the transcript for anglicisms written phonetically ("dêploy", "promptis")
  and fix the caption text, never the timing.
- Deepgram does not return hesitations ("éé", "hum") in Portuguese; they appear as
  gaps. See the cut-mistakes skill.

## Captions

- Portuguese runs about 15-25% longer than English for the same idea. Reduce
  words per caption chunk (2-4 words for reels, never more than two lines) rather
  than shrinking the type.
- Every caption and card font must render the full Latin Extended set used in
  Portuguese: `á à â ã é ê í ó ô õ ú ç` and their capitals. Check `Ç`, `Ã`, `Õ`
  in uppercase titles; some display fonts drop or misplace the tilde. Google Fonts
  URLs must include the `latin-ext` subset or no `subset` restriction at all.
- Leave extra line height (at least 1.1) on uppercase captions so accents on
  capitals (`É`, `Ã`) do not collide with the line above or get clipped by
  `overflow: hidden` boxes.
- Keep accents in captions even when the transcript has none. "Voce" instead of
  "você" reads as a mistake to a Brazilian viewer.
- Never break a word with a hyphen across caption chunks. Keep short function
  words ("de", "a", "o", "que", "em") with the word that follows them.
- Highlight the stressed content word, not the article: "o **segredo**", not
  "**o** segredo".

## Numbers, money, and dates

Format every on-screen value with `Intl` in `pt-BR`:

```js
new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(1997) // "R$ 1.997,00"
new Intl.NumberFormat("pt-BR").format(12500.5)                                       // "12.500,5"
new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(1500000)             // "1,5 mi"
new Intl.DateTimeFormat("pt-BR").format(new Date(2026, 10, 14))                     // "14/11/2026"
```

- Thousands use `.` and decimals use `,`: `R$ 1.997`, `4,8 estrelas`, `97,3%`.
- Use `mil`, `mi`, `bi` for compact counts (`12 mil seguidores`, `1,5 mi de views`).
- Dates are `dd/mm` or `dd/mm/aaaa`; weekdays and months are lowercase in running
  text (`segunda-feira`, `14 de novembro`).
- Time is 24-hour: `19h`, `19h30`, `às 20h`.
- Counting animations must format every intermediate frame with the same `Intl`
  formatter so `1.000` never flashes as `1000`.
- Placeholder statistics in library cards are illustrative. Replace them with the
  user's verified numbers in Brazilian format before rendering.

## Formats and platforms

- Primary delivery: 1080x1920, 9:16, 30 fps, H.264 + AAC, for Reels and TikTok.
  Export the same master for YouTube Shorts.
- Safe area: keep captions and key graphics between y=220 and y=1580 and away from
  the right 140 px; Reels and TikTok both stack buttons on the right and the
  caption/description over the bottom.
- Reels covers crop the center 1080x1350 (4:5) on the profile grid. Keep the
  hook text inside that area on the cover frame.
- Calls to action in natural Brazilian Portuguese, short and direct:
  "Comenta EDITAR que eu te mando", "Salva pra não perder", "Segue pra parte 2",
  "Link na bio". Avoid literal translations ("Clique no link abaixo para saber mais").
- Use informal "você" and the speaker's own register. Do not "correct" spoken
  colloquialisms ("pra", "tá", "a gente") in captions; they match the audio.
