// Deepgram helpers shared by the transcription script and the tests.
// No network access here: request building and response normalization only.

export const DEEPGRAM_ENDPOINT = "https://api.deepgram.com/v1/listen";

export const DEFAULTS = Object.freeze({
  model: "nova-3",
  language: "pt-BR",
  diarize: true,
  smartFormat: true,
  // Deepgram only transcribes filler words ("um", "uh") in English. For other
  // languages hesitations such as "éé" or "hum" are left out of the words list.
  fillerWords: null, // null = on for English, off otherwise
});

const MIME = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".webm": "audio/webm",
};

export function mimeFor(ext) {
  return MIME[ext.toLowerCase()] ?? "application/octet-stream";
}

/** Build the /v1/listen URL for a pre-recorded request. */
export function buildListenUrl(opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const url = new URL(DEEPGRAM_ENDPOINT);
  const p = url.searchParams;
  p.set("model", o.model);
  if (o.language === "multi" || o.detectLanguage) {
    if (o.language === "multi") p.set("language", "multi");
    else p.set("detect_language", "true");
  } else if (o.language) {
    p.set("language", o.language);
  }
  p.set("punctuate", "true");
  if (o.smartFormat) p.set("smart_format", "true");
  if (o.diarize) p.set("diarize", "true");
  p.set("utterances", "true");
  const fillers = o.fillerWords ?? /^en\b/i.test(o.language ?? "");
  if (fillers) p.set("filler_words", "true");
  // Nova-3 keyterm prompting: brand names, people, jargon ("HyperFrames", "Claude").
  for (const term of o.keyterms ?? []) if (term) p.append("keyterm", term);
  return url;
}

/**
 * Convert a Deepgram pre-recorded response into the kit's common transcript:
 *   { text, audio_duration_secs, language, provider, model,
 *     words: [{ text, start, end, type: "word", confidence, speaker }] }
 * Times stay in seconds on the source timeline. `text` uses the punctuated,
 * smart-formatted spelling so captions keep accents, commas and capitals.
 */
export function normalizeDeepgram(response, { duration, model, language } = {}) {
  const channel = response?.results?.channels?.[0];
  const alt = channel?.alternatives?.[0];
  if (!alt || !Array.isArray(alt.words)) {
    throw new Error("Deepgram response has no results.channels[0].alternatives[0].words");
  }
  const words = [];
  for (const w of alt.words) {
    const start = Number(w.start);
    const end = Number(w.end);
    const text = String(w.punctuated_word ?? w.word ?? "").trim();
    if (!text || !Number.isFinite(start) || !Number.isFinite(end)) continue;
    const word = { text, start: round(start), end: round(Math.max(end, start)), type: "word" };
    if (Number.isFinite(w.confidence)) word.confidence = round(w.confidence);
    if (w.speaker !== undefined && w.speaker !== null) word.speaker = `speaker_${w.speaker}`;
    words.push(word);
  }
  const audioDuration = Number.isFinite(duration)
    ? duration
    : Number(response?.metadata?.duration ?? words.at(-1)?.end ?? 0);
  return {
    provider: "deepgram",
    model: model ?? null,
    language: channel.detected_language ?? language ?? null,
    request_id: response?.metadata?.request_id ?? null,
    text: alt.transcript ?? words.map((w) => w.text).join(" "),
    audio_duration_secs: round(audioDuration),
    words,
  };
}

function round(n) {
  return Math.round(Number(n) * 1000) / 1000;
}
