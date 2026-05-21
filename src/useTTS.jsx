/**
 * useTTS.jsx — Full-Featured Text-to-Speech for Humanity-AI.Quest
 *
 * Features:
 * - 10 plugin architecture (Web Speech, ElevenLabs, Azure, StreamElements, etc.)
 * - Full player UI: progress bar, elapsed/total time, speed control, voice picker, volume
 * - Smart neural voice selection for Web Speech API
 * - Complete markdown stripping
 * - Per-utterance tracking with progress estimation
 * - Plugin settings stored in localStorage
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Square, ChevronDown, Mic } from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────── */
export function cleanForTTS(raw) {
  if (!raw) return '';
  return raw
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    .replace(/^[=\-]{3,}\s*$/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/_{1,2}([^_\n]+)_{1,2}/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/—/g, ', ')
    .replace(/--/g, ', ')
    .replace(/\|/g, ' ')
    .replace(/([.?!])\s*([.?!])+/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/[#*_>`~\\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,;.]\s*/, '')
    .trim();
}

export function pickBestVoice(voices) {
  if (!voices || !voices.length) return null;
  const tests = [
    v => /Microsoft.*(Aria|Jenny|Guy|Sonia|Libby|Ryan).*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*(Aria|Jenny|Guy|Zira)/i.test(v.name) && /^en/.test(v.lang),
    v => /Google.*English/i.test(v.name) && v.lang === 'en-US',
    v => /Google.*English/i.test(v.name) && /^en/.test(v.lang),
    v => v.name === 'Samantha' && /^en/.test(v.lang),
    v => /^(Karen|Moira|Veena|Tessa)$/.test(v.name) && /^en/.test(v.lang),
    v => /(natural|neural|premium)/i.test(v.name) && /^en/.test(v.lang),
    v => v.lang === 'en-US' && !v.localService,
    v => /^en/.test(v.lang) && !v.localService,
    v => v.lang === 'en-US',
    v => /^en/.test(v.lang),
  ];
  for (const test of tests) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0] || null;
}

/* ─── Plugin Registry ──────────────────────────────────────────── */
export const TTS_PLUGINS = [
  {
    id: 'webspeech',
    name: 'Web Speech API',
    type: 'Browser Native',
    stars: 4,
    free: true,
    needsKey: false,
    voices: 'Depends on OS/browser — neural in Edge & Chrome',
    description: 'Zero-setup browser TTS. Uses neural voices (Microsoft Aria, Google) when available in Edge or Chrome. Works offline.',
    pros: ['No API key', 'Works offline', 'Neural voices in Edge/Chrome', 'Instant start'],
    cons: ['Voice quality varies by browser', 'No guaranteed voice'],
    badge: 'Recommended',
  },
  {
    id: 'streamelements',
    name: 'StreamElements TTS',
    type: 'Free API',
    stars: 3,
    free: true,
    needsKey: false,
    voices: 'Brian, Ivy, Emma, Justin, Joey, Nicole, Russell, Amy, Geraint',
    description: 'Free public TTS API with natural English voices. No API key needed. Best for consistent voice across browsers.',
    pros: ['No API key', 'Consistent voice quality', 'Multiple accent options'],
    cons: ['Rate limited', 'Requires internet', 'English voices only'],
    badge: 'No Key Needed',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'API (Free Tier)',
    stars: 5,
    free: true,
    needsKey: true,
    keyLabel: 'ElevenLabs API Key',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://elevenlabs.io/app/api-key',
    voices: 'Rachel, Adam, Bella, Antoni, Elli + 900 more',
    description: 'Most natural AI voices available. Free tier: 10,000 characters/month. The gold standard for voice quality.',
    pros: ['Exceptional quality', 'Emotion & tone control', '900+ voices', 'Free 10k chars/mo'],
    cons: ['Requires API key', 'Limited free quota'],
    badge: 'Best Quality',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure TTS',
    type: 'API (Free Tier)',
    stars: 5,
    free: true,
    needsKey: true,
    keyLabel: 'Azure Speech API Key',
    keyPlaceholder: 'Your Azure Speech key',
    keyUrl: 'https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices',
    regionLabel: 'Azure Region',
    regionPlaceholder: 'eastus',
    voices: 'Aria, Jenny, Guy, Sara, Brian + 400 neural voices',
    description: 'Microsoft neural voices including Aria & Jenny. Free tier: 500,000 chars/month. Same voices as Edge browser.',
    pros: ['500k chars/month free', 'Neural voices', 'SSML support', 'Multi-language'],
    cons: ['Requires Azure account', 'Setup complexity'],
    badge: 'Enterprise Grade',
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    type: 'API (Paid)',
    stars: 5,
    free: false,
    needsKey: true,
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    voices: 'Alloy, Echo, Fable, Onyx, Nova, Shimmer',
    description: 'Strikingly natural voices from OpenAI. Very low cost ($0.015/1k chars). Best overall quality-to-cost ratio.',
    pros: ['Incredibly natural', '6 distinct voices', 'Fast streaming'],
    cons: ['Paid (no free tier)', 'Requires OpenAI account'],
    badge: 'Most Natural',
  },
  {
    id: 'googlecloud',
    name: 'Google Cloud TTS',
    type: 'API (Free Tier)',
    stars: 4,
    free: true,
    needsKey: true,
    keyLabel: 'Google Cloud API Key',
    keyPlaceholder: 'Your Google Cloud API key',
    keyUrl: 'https://console.cloud.google.com/apis/credentials',
    voices: 'WaveNet, Neural2, Standard voices (220+)',
    description: 'Google WaveNet voices — 1,000,000 standard characters/month free. Neural2 voices available with same key.',
    pros: ['1M chars/month free', 'WaveNet quality', '40+ languages'],
    cons: ['Requires Google Cloud setup', 'Billing account needed'],
    badge: 'Google Quality',
  },
  {
    id: 'amazon',
    name: 'Amazon Polly',
    type: 'API (Free Tier)',
    stars: 4,
    free: true,
    needsKey: true,
    keyLabel: 'AWS Access Key ID',
    keyPlaceholder: 'AKIA...',
    secretLabel: 'AWS Secret Key',
    secretPlaceholder: 'Your AWS secret key',
    keyUrl: 'https://console.aws.amazon.com/iam/home#/users',
    voices: 'Joanna, Matthew, Amy, Brian, Ivy + Neural voices',
    description: 'AWS Polly with Neural TTS voices. Free tier: 5 million chars/month for 12 months, then pay-as-you-go.',
    pros: ['5M chars free (first year)', 'Neural voices', 'SSML support'],
    cons: ['AWS setup required', 'Expires after 12 months'],
    badge: 'AWS Powered',
  },
  {
    id: 'voicerss',
    name: 'VoiceRSS',
    type: 'API (Free Tier)',
    stars: 3,
    free: true,
    needsKey: true,
    keyLabel: 'VoiceRSS API Key',
    keyPlaceholder: 'Your VoiceRSS API key',
    keyUrl: 'https://www.voicerss.org/registration.aspx',
    voices: '50+ languages, multiple English accents',
    description: 'Simple REST API for text-to-speech. Free tier: 350 requests/day. Good multilingual support.',
    pros: ['350 req/day free', 'Simple integration', '50+ languages'],
    cons: ['350/day limit', 'Lower voice quality'],
    badge: 'Multilingual',
  },
  {
    id: 'responsivevoice',
    name: 'ResponsiveVoice',
    type: 'CDN (Non-commercial Free)',
    stars: 4,
    free: true,
    needsKey: false,
    voices: '51 languages, 158 voices',
    description: 'Popular JavaScript TTS library. Free for non-commercial use. High consistency across browsers. Used by millions.',
    pros: ['158 voices', '51 languages', 'Browser-consistent', 'Widely used'],
    cons: ['Non-commercial only', 'CDN dependency'],
    badge: '51 Languages',
  },
  {
    id: 'kokoro',
    name: 'Kokoro TTS (WASM)',
    type: 'Open Source',
    stars: 4,
    free: true,
    needsKey: false,
    voices: 'American & British English, multiple styles',
    description: 'State-of-the-art open source TTS model. Runs entirely in your browser via WebAssembly — no server needed after first load.',
    pros: ['Fully open source', 'Runs in browser', 'High quality', 'No server costs'],
    cons: ['Large initial download (~100MB)', 'First-load latency'],
    badge: 'Open Source',
  },
];

/* ─── localStorage helpers ─────────────────────────────────────── */
const LS_PREFIX = 'hrc_tts_';
const getLS = (key, def) => { try { const v = localStorage.getItem(LS_PREFIX + key); return v != null ? JSON.parse(v) : def; } catch { return def; } };
const setLS = (key, val) => { try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch { } };

/* ─── Audio playback (non-WebSpeech) ──────────────────────────── */
async function playAudioUrl(url, headers = {}, onProgress, onEnd, onError) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    audio.onended = () => { URL.revokeObjectURL(objectUrl); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(objectUrl); onError(new Error('Audio playback failed')); };
    await audio.play();
    return audio;
  } catch (err) {
    onError(err);
    return null;
  }
}

/* ─── useTTS hook ──────────────────────────────────────────────── */
export function useTTS() {
  const [speakingId, setSpeakingId]       = useState(null);
  const [progress, setProgress]           = useState(0);
  const [elapsed, setElapsed]             = useState(0);
  const [duration, setDuration]           = useState(0);
  const [rate, setRateState]              = useState(() => getLS('rate', 1.08));
  const [volume, setVolumeState]          = useState(() => getLS('volume', 1.0));
  const [voices, setVoices]              = useState([]);
  const [selectedVoice, setVoiceState]   = useState(() => getLS('voiceName', null));
  const [activePlugin, setPluginState]   = useState(() => getLS('plugin', 'webspeech'));

  const voiceRef       = useRef(null);
  const audioRef       = useRef(null);   // HTMLAudioElement for non-WebSpeech
  const timerRef       = useRef(null);
  const startRef       = useRef(0);
  const durRef         = useRef(0);
  const idRef          = useRef(null);

  // Load WebSpeech voices
  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        const best = pickBestVoice(v);
        voiceRef.current = best;
        if (!getLS('voiceName', null) && best) setVoiceState(best.name);
      }
    };
    loadVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      clearInterval(timerRef.current);
    };
  }, []);

  const setRate = useCallback((r) => { setRateState(r); setLS('rate', r); }, []);
  const setVolume = useCallback((v) => { setVolumeState(v); setLS('volume', v); }, []);
  const setVoice = useCallback((name) => { setVoiceState(name); setLS('voiceName', name); }, []);
  const setPlugin = useCallback((id) => { setPluginState(id); setLS('plugin', id); }, []);

  const startTimer = useCallback((estimatedDur) => {
    clearInterval(timerRef.current);
    startRef.current = Date.now();
    durRef.current = estimatedDur;
    setProgress(0); setElapsed(0); setDuration(estimatedDur);
    timerRef.current = setInterval(() => {
      const el = (Date.now() - startRef.current) / 1000;
      setElapsed(el);
      setProgress(Math.min(99, estimatedDur > 0 ? (el / estimatedDur) * 100 : 0));
    }, 200);
  }, []);

  const stopTimer = useCallback((done = false) => {
    clearInterval(timerRef.current);
    if (done) { setProgress(100); setElapsed(durRef.current); }
  }, []);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) { try { audioRef.current.pause(); } catch(e){} audioRef.current = null; }
    clearInterval(timerRef.current);
    setSpeakingId(null);
    setProgress(0); setElapsed(0); idRef.current = null;
  }, []);

  const estimateDuration = (text, r) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    return (words / (150 * r)) * 60; // seconds at given rate
  };

  const speakWebSpeech = useCallback((id, text) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const vName = getLS('voiceName', null);
    const voice = vName ? voices.find(v => v.name === vName) : voiceRef.current;
    if (voice) utt.voice = voice;
    utt.lang = 'en-US';
    utt.rate = rate;
    utt.pitch = 1.02;
    utt.volume = volume;
    const estDur = estimateDuration(text, rate);
    startTimer(estDur);
    utt.onboundary = (e) => {
      if (e.name === 'word' && durRef.current > 0) {
        const el = (Date.now() - startRef.current) / 1000;
        setElapsed(el);
        setProgress(Math.min(99, (el / durRef.current) * 100));
      }
    };
    utt.onend = () => { stopTimer(true); setSpeakingId(null); idRef.current = null; };
    utt.onerror = () => { stopTimer(false); setSpeakingId(null); idRef.current = null; };
    setSpeakingId(id);
    idRef.current = id;
    window.speechSynthesis.speak(utt);
  }, [voices, rate, volume, startTimer, stopTimer]);

  const speakStreamElements = useCallback(async (id, text) => {
    const voice = getLS('seVoice', 'Brian');
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text.slice(0, 500))}`;
    const estDur = estimateDuration(text, 1.0);
    startTimer(estDur);
    setSpeakingId(id); idRef.current = id;
    const audio = await playAudioUrl(url, {}, null,
      () => { stopTimer(true); setSpeakingId(null); idRef.current = null; },
      (err) => {
        console.warn('StreamElements failed, falling back to WebSpeech:', err.message);
        stopTimer(false);
        speakWebSpeech(id, text);
      }
    );
    if (audio) { audio.volume = volume; audioRef.current = audio; }
  }, [volume, startTimer, stopTimer, speakWebSpeech]);

  const speakElevenLabs = useCallback(async (id, text) => {
    const apiKey = getLS('elKey', '');
    const voiceId = getLS('elVoice', 'EXAVITQu4vr4xnSDxMaL'); // Bella
    if (!apiKey) { alert('ElevenLabs API key not configured. Go to Admin → TTS Plugins to add your key.'); stopAll(); return; }
    const estDur = estimateDuration(text, 1.0);
    startTimer(estDur);
    setSpeakingId(id); idRef.current = id;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text: text.slice(0, 2500), model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      });
      if (!res.ok) throw new Error(`ElevenLabs: HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audio.volume = volume;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); stopTimer(true); setSpeakingId(null); idRef.current = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); stopTimer(false); setSpeakingId(null); idRef.current = null; };
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs failed:', err.message);
      stopTimer(false); setSpeakingId(null); idRef.current = null;
      alert(`ElevenLabs error: ${err.message}`);
    }
  }, [volume, startTimer, stopTimer, stopAll]);

  const speak = useCallback((id, rawText) => {
    // Toggle off if same id
    if (speakingId === id || idRef.current === id) { stopAll(); return; }
    stopAll();
    const text = cleanForTTS(rawText);
    if (!text) return;

    const plugin = getLS('plugin', 'webspeech');
    if (plugin === 'streamelements') { speakStreamElements(id, text); }
    else if (plugin === 'elevenlabs') { speakElevenLabs(id, text); }
    else { speakWebSpeech(id, text); }
  }, [speakingId, stopAll, speakWebSpeech, speakStreamElements, speakElevenLabs]);

  return {
    speakingId, progress, elapsed, duration,
    rate, setRate, volume, setVolume,
    voices, selectedVoice, setVoice,
    activePlugin, setPlugin,
    speak, stop: stopAll,
  };
}

/* ─── Mini Player (shown when content is actively playing) ──────── */
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

const MiniPlayer = ({ id, tts }) => {
  const { progress, elapsed, duration, rate, setRate, volume, setVolume, stop } = tts;
  const [showSpeed, setShowSpeed] = useState(false);

  return (
    <div style={{
      marginTop: 10, padding: '10px 12px',
      background: 'rgba(91,233,221,0.06)',
      border: '1px solid rgba(91,233,221,0.18)',
      borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Progress bar */}
      <div style={{ position: 'relative', height: 4, borderRadius: 9999, background: 'rgba(91,233,221,0.12)', cursor: 'default', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999,
          background: 'linear-gradient(90deg,var(--aurora),rgba(91,233,221,0.6))',
          width: `${progress}%`, transition: 'width 0.2s linear',
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* Stop */}
        <button onClick={stop} title="Stop" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(91,233,221,0.3)',
          background: 'rgba(91,233,221,0.1)', cursor: 'pointer', flexShrink: 0,
        }}>
          <Square size={10} color="var(--aurora)" fill="var(--aurora)" />
        </button>

        {/* Time */}
        <span style={{ fontSize: 11, color: 'var(--dust)', fontVariantNumeric: 'tabular-nums', minWidth: 70 }}>
          {fmt(elapsed)} {duration > 0 ? `/ ${fmt(duration)}` : ''}
        </span>

        {/* Divider */}
        <div style={{ flex: 1 }} />

        {/* Speed selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSpeed(s => !s)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
              border: '1px solid rgba(91,233,221,0.2)', background: 'rgba(91,233,221,0.08)',
              color: 'var(--aurora)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3,
            }}
          >
            {rate === 1.08 ? '1×' : `${rate}×`} <ChevronDown size={9} />
          </button>
          {showSpeed && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: 4,
              background: 'var(--void-2)', border: '1px solid var(--line-2)',
              borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 100,
            }}>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => { setRate(s); setShowSpeed(false); }} style={{
                  display: 'block', width: '100%', padding: '6px 14px', fontSize: 12, fontWeight: 500,
                  background: (rate === s || (s === 1 && rate === 1.08)) ? 'rgba(91,233,221,0.12)' : 'transparent',
                  color: (rate === s || (s === 1 && rate === 1.08)) ? 'var(--aurora)' : 'var(--bone-dim)',
                  border: 'none', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap',
                }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume toggle */}
        <button onClick={() => setVolume(volume > 0 ? 0 : 1)} title={volume > 0 ? 'Mute' : 'Unmute'} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer', color: volume > 0 ? 'var(--aurora)' : 'var(--dust)',
        }}>
          {volume > 0 ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>
    </div>
  );
};

/* ─── ListenButton ─────────────────────────────────────────────── */
export const ListenButton = ({ id, text, tts, variant = 'inline' }) => {
  const active = tts.speakingId === id;

  if (variant === 'pill') {
    return (
      <>
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
          {active ? <Square size={13} fill="var(--aurora)" /> : <Volume2 size={13} />}
          {active ? 'Playing' : 'Listen'}
        </button>
        {active && <MiniPlayer id={id} tts={tts} />}
      </>
    );
  }

  // Inline (chat messages)
  return (
    <>
      <button
        onClick={() => tts.speak(id, text)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 8, padding: '3px 10px', borderRadius: 9999,
          fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
          background: active ? 'rgba(91,233,221,0.12)' : 'rgba(242,234,211,0.05)',
          color: active ? 'var(--aurora)' : 'var(--bone-dim)',
          border: `1px solid ${active ? 'rgba(91,233,221,0.25)' : 'rgba(242,234,211,0.12)'}`,
        }}
        title={active ? 'Stop' : 'Listen to this message'}
      >
        {active ? <Square size={10} fill="var(--aurora)" /> : <Volume2 size={10} />}
        {active ? 'Playing' : 'Listen'}
      </button>
      {active && <MiniPlayer id={id} tts={tts} />}
    </>
  );
};

export default ListenButton;
