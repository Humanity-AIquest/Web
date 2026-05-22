/**
 * useTTS.jsx — Shared Text-to-Speech module for Humanity-AI.Quest
 *
 * Features:
 * - Smart voice selection: prefers neural/natural voices (Google, Microsoft Online, Apple)
 * - Full markdown stripping so dashes/headings are never spoken literally
 * - Per-utterance ID tracking so each Listen button knows if IT is playing
 * - Rate/pitch tuned for natural, personable delivery
 */
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

/* ─── Text cleaner ──────────────────────────────────────────────
   Converts markdown → plain speech-friendly text.
   Rules applied in order so interactions don't compound.
   ─────────────────────────────────────────────────────────────── */
export function cleanForTTS(raw) {
  if (!raw) return '';
  return raw
    // Fenced code blocks → skip entirely
    .replace(/```[\s\S]*?```/g, '')
    // Inline code → bare text
    .replace(/`([^`]+)`/g, '$1')
    // ATX headings (### Heading) → just "Heading"
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Setext headings (underline style)
    .replace(/^[=\-]{3,}\s*$/gm, '')
    // Horizontal rules --- / *** / ___
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Blockquotes > text → text
    .replace(/^\s*>\s+/gm, '')
    // Bold+italic ***text*** / **text** / *text*
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    // Underline __text__ / _text_
    .replace(/_{1,2}([^_\n]+)_{1,2}/g, '$1')
    // Strikethrough ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Markdown links [label](url) → label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Plain URLs
    .replace(/https?:\/\/\S+/g, '')
    // Bullet list items (- / * / + at line start) → remove dash, keep text
    .replace(/^\s*[-*+]\s+/gm, '')
    // Numbered list items (1. / 12.) → remove number, keep text
    .replace(/^\s*\d+\.\s+/gm, '')
    // Em-dash → natural comma pause
    .replace(/—/g, ', ')
    // Double-dash → comma pause
    .replace(/--/g, ', ')
    // Pipe chars (tables)
    .replace(/\|/g, ' ')
    // Multiple consecutive punctuation
    .replace(/([.?!])\s*([.?!])+/g, '$1')
    // Double newlines → sentence boundary
    .replace(/\n{2,}/g, '. ')
    // Single newlines → space
    .replace(/\n/g, ' ')
    // Remaining markdown special chars
    .replace(/[#*_>`~\\]/g, '')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    // Strip leading punctuation artifacts
    .replace(/^\s*[,;.]\s*/, '')
    .trim();
}

/* ─── Voice selector ────────────────────────────────────────────
   Returns the best available voice for English TTS.
   Priority: Microsoft Neural (Edge) → Google (Chrome) → Apple → any en-US
   ─────────────────────────────────────────────────────────────── */
export function pickBestVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const tests = [
    // Edge neural voices — best quality
    v => /Microsoft.*(Aria|Jenny|Guy|Sonia|Libby|Ryan).*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*(Aria|Jenny|Guy|Zira)/i.test(v.name) && /^en/.test(v.lang),
    // Chrome Google voices — very natural
    v => /Google.*English/i.test(v.name) && v.lang === 'en-US',
    v => /Google.*English/i.test(v.name) && /^en/.test(v.lang),
    // Apple voices
    v => v.name === 'Samantha' && /^en/.test(v.lang),
    v => /^(Karen|Moira|Veena|Tessa)$/.test(v.name) && /^en/.test(v.lang),
    // Any voice with "natural" or "neural" in name
    v => /(natural|neural|premium)/i.test(v.name) && /^en/.test(v.lang),
    // Non-local (usually better) en-US
    v => v.lang === 'en-US' && !v.localService,
    v => /^en/.test(v.lang) && !v.localService,
    // Fallback: any English voice
    v => v.lang === 'en-US',
    v => /^en/.test(v.lang),
  ];

  for (const test of tests) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0] || null;
}

/* ─── useTTS hook ───────────────────────────────────────────────
   Call inside any component that needs TTS.
   Returns { speakingId, speak(id, text), stop() }
   ─────────────────────────────────────────────────────────────── */
export function useTTS() {
  const [speakingId, setSpeakingId] = useState(null);
  const voiceRef = useRef(null);
  const loadedRef = useRef(false);

  // Load voice — voices may not be ready immediately
  useEffect(() => {
    const load = () => {
      voiceRef.current = pickBestVoice();
      loadedRef.current = true;
    };
    load();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (id, rawText) => {
    if (!window.speechSynthesis) return;
    // Toggle off if same message is playing
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    // Stop anything currently playing
    window.speechSynthesis.cancel();

    const text = cleanForTTS(rawText);
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply best voice (retry if voices weren't ready yet)
    if (!voiceRef.current) voiceRef.current = pickBestVoice();
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.lang = 'en-US';
    utterance.rate = 1.08;   // Slightly faster than default — natural conversational pace
    utterance.pitch = 1.02;  // Slight warmth
    utterance.volume = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  };

  return { speakingId, speak, stop };
}

/* ─── ListenButton component ────────────────────────────────────
   Reusable button wired to a useTTS() instance.

   Props:
     id       — unique string ID for this piece of content
     text     — raw text to speak (markdown ok, will be cleaned)
     tts      — result of useTTS()
     variant  — 'inline' (default, small) | 'pill' (larger, for page sections)
   ─────────────────────────────────────────────────────────────── */
export const ListenButton = ({ id, text, tts, variant = 'inline' }) => {
  const active = tts.speakingId === id;

  if (variant === 'pill') {
    return (
      <button
        onClick={() => tts.speak(id, text)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s',
          background: active ? 'rgba(91,233,221,0.15)' : 'rgba(242,234,211,0.06)',
          color: active ? 'var(--aurora)' : 'var(--bone-dim)',
          border: `1px solid ${active ? 'rgba(91,233,221,0.3)' : 'var(--line)'}`,
        }}
        title={active ? 'Stop' : 'Listen to this content'}
      >
        {active ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {active ? 'Stop' : 'Listen'}
      </button>
    );
  }

  // Default: 'inline' — sits inside a message bubble
  return (
    <button
      onClick={() => tts.speak(id, text)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        marginTop: 8, padding: '3px 10px', borderRadius: 9999,
        fontSize: 11, fontWeight: 500, cursor: 'pointer',
        transition: 'all 0.2s',
        background: active ? 'rgba(91,233,221,0.12)' : 'rgba(242,234,211,0.05)',
        color: active ? 'var(--aurora)' : 'var(--bone-dim)',
        border: `1px solid ${active ? 'rgba(91,233,221,0.25)' : 'rgba(242,234,211,0.12)'}`,
      }}
      title={active ? 'Stop' : 'Listen to this message'}
    >
      {active ? <VolumeX size={11} /> : <Volume2 size={11} />}
      {active ? 'Stop' : 'Listen'}
    </button>
  );
};

export default ListenButton;
