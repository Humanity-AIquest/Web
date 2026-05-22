/**
 * useTTS.jsx — Full-Featured TTS for Humanity-AI.Quest
 *
 * Architecture:
 * - testSpeakPlugin(id, text, opts) — standalone test, doesn't touch active hook state
 * - useTTS() hook — manages playing state, progress, speed, volume for site-wide TTS
 * - ListenButton — trigger + inline MiniPlayer with scrollIntoView + word tracking
 *
 * Defaults: 2× speed, max 4×
 * Scroll: active message scrolls into view and tracks as TTS advances
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Square, ChevronDown } from 'lucide-react';

/* ─── Text cleaner ───────────────────────────────────────────── */
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

/* ─── Voice picker ──────────────────────────────────────────── */
export function pickBestVoice(voices) {
  if (!voices || !voices.length) return null;
  const tests = [
    v => /Microsoft.*(Aria|Jenny|Guy|Sonia|Libby|Ryan).*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*Online.*Natural/i.test(v.name) && /^en/.test(v.lang),
    v => /Microsoft.*(Aria|Jenny|Guy|Zira)/i.test(v.name) && /^en/.test(v.lang),
    v => /Google.*English/i.test(v.name) && v.lang === 'en-US',
    v => /Google.*English/i.test(v.name) && /^en/.test(v.lang),
    v => v.name === 'Samantha' && /^en/.test(v.lang),
    v => /(natural|neural|premium)/i.test(v.name) && /^en/.test(v.lang),
    v => v.lang === 'en-US' && !v.localService,
    v => /^en/.test(v.lang) && !v.localService,
    v => v.lang === 'en-US',
    v => /^en/.test(v.lang),
  ];
  for (const fn of tests) { const v = voices.find(fn); if (v) return v; }
  return voices[0] || null;
}

/* ─── localStorage helpers ───────────────────────────────────── */
const PFX = 'hrc_tts_';
export const getLS = (k, d) => { try { const v = localStorage.getItem(PFX + k); return v != null ? JSON.parse(v) : d; } catch { return d; } };
export const setLS = (k, v) => { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch {} };

/* ─── Plugin manifest ───────────────────────────────────────── */
export const TTS_PLUGINS = [
  {
    id: 'webspeech', name: 'Web Speech API', type: 'Browser Native', stars: 4, free: true, needsKey: false,
    voices: 'Neural voices in Edge & Chrome (Aria, Jenny, Google US English)',
    description: 'Zero-setup browser TTS. Picks the best neural voice automatically. Works offline.',
    pros: ['No API key', 'Works offline', 'Neural voices in Edge/Chrome', 'Instant start'],
    cons: ['Voice quality varies by browser', 'No guaranteed voice'],
    badge: 'Recommended',
  },
  {
    id: 'streamelements', name: 'StreamElements TTS', type: 'Free API', stars: 3, free: true, needsKey: false,
    voices: 'Brian, Ivy, Emma, Justin, Joey, Nicole, Russell, Amy, Geraint, Salli',
    description: 'Free public TTS API with consistent natural English voices across all browsers.',
    pros: ['No API key', 'Consistent voice quality', 'Multiple accents'],
    cons: ['Rate limited', 'English only', 'Requires internet'],
    badge: 'No Key Needed',
    voiceOptions: ['Brian','Ivy','Emma','Russell','Amy','Joey','Justin','Nicole','Geraint','Salli'],
    voiceKey: 'seVoice', defaultVoice: 'Brian',
  },
  {
    id: 'elevenlabs', name: 'ElevenLabs', type: 'API (Free Tier)', stars: 5, free: true, needsKey: true,
    keyLabel: 'API Key', keyPlaceholder: 'Your ElevenLabs API key',
    keyUrl: 'https://elevenlabs.io/app/api-key',
    voices: 'Rachel, Adam, Bella, Antoni, Elli + 900 more',
    description: 'Most natural AI voices available. Free tier: 10,000 chars/month. Gold standard quality.',
    pros: ['Exceptional quality', '900+ voices', 'Emotion & tone control', 'Free 10k/mo'],
    cons: ['Requires API key', 'Limited free quota'],
    badge: 'Best Quality',
  },
  {
    id: 'azure', name: 'Microsoft Azure TTS', type: 'API (Free Tier)', stars: 5, free: true, needsKey: true,
    keyLabel: 'Speech API Key', keyPlaceholder: 'Azure Speech subscription key',
    keyUrl: 'https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices',
    regionLabel: 'Region', regionPlaceholder: 'eastus',
    voices: 'Aria, Jenny, Guy, Sara, Brian + 400 neural voices',
    description: 'Same neural voices as Microsoft Edge. Free: 500,000 chars/month.',
    pros: ['500k chars/month free', 'Same as Edge voices', 'SSML support', '400+ voices'],
    cons: ['Azure setup required', 'Billing account needed'],
    badge: 'Enterprise Grade',
  },
  {
    id: 'openai', name: 'OpenAI TTS', type: 'API (Paid)', stars: 5, free: false, needsKey: true,
    keyLabel: 'OpenAI API Key', keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    voices: 'Alloy, Echo, Fable, Onyx, Nova, Shimmer',
    description: 'Strikingly natural voices. Very low cost ($0.015/1k chars). Best quality-to-cost ratio.',
    pros: ['Most natural sound', '6 distinct voices', 'Fast streaming', 'Very affordable'],
    cons: ['No free tier', 'Requires OpenAI account'],
    badge: 'Most Natural',
  },
  {
    id: 'googlecloud', name: 'Google Cloud TTS', type: 'API (Free Tier)', stars: 4, free: true, needsKey: true,
    keyLabel: 'Google Cloud API Key', keyPlaceholder: 'AIza...',
    keyUrl: 'https://console.cloud.google.com/apis/credentials',
    voices: 'WaveNet, Neural2, Standard (220+ voices, 40+ languages)',
    description: 'Google WaveNet voices — 1,000,000 Standard chars/month free.',
    pros: ['1M chars/month free', 'WaveNet quality', '40+ languages', 'Neural2 voices'],
    cons: ['Google Cloud setup', 'Billing account required'],
    badge: 'Google Quality',
  },
  {
    id: 'amazon', name: 'Amazon Polly', type: 'API (Free Tier)', stars: 4, free: true, needsKey: true,
    keyLabel: 'AWS Access Key ID', keyPlaceholder: 'AKIA...',
    secretLabel: 'AWS Secret Key', secretPlaceholder: 'Your AWS secret',
    keyUrl: 'https://console.aws.amazon.com/iam/home',
    voices: 'Joanna, Matthew, Amy, Brian, Ivy + Neural voices',
    description: 'AWS Neural TTS. Free: 5M chars/month for first 12 months.',
    pros: ['5M chars free (year 1)', 'Neural voices', 'SSML support', 'Reliable'],
    cons: ['Expires after 12 months', 'AWS setup required'],
    badge: 'AWS Powered',
  },
  {
    id: 'voicerss', name: 'VoiceRSS', type: 'API (Free Tier)', stars: 3, free: true, needsKey: true,
    keyLabel: 'VoiceRSS API Key', keyPlaceholder: 'Your VoiceRSS key',
    keyUrl: 'https://www.voicerss.org/registration.aspx',
    voices: '50+ languages, multiple English accents',
    description: 'Simple REST API for TTS. Free: 350 requests/day. Best multilingual support.',
    pros: ['350 req/day free', 'Very simple API', '50+ languages'],
    cons: ['350/day limit', 'Lower voice quality'],
    badge: 'Multilingual',
  },
  {
    id: 'responsivevoice', name: 'ResponsiveVoice', type: 'CDN (Non-commercial)', stars: 4, free: true, needsKey: false,
    voices: '51 languages, 158 voices',
    description: 'Popular JS TTS library. Free non-commercial. Consistent across all browsers. Used by millions.',
    pros: ['158 voices', '51 languages', 'Browser-consistent', 'Widely used'],
    cons: ['Non-commercial only', 'CDN script required'],
    badge: '51 Languages',
  },
  {
    id: 'kokoro', name: 'Kokoro TTS (WASM)', type: 'Open Source', stars: 4, free: true, needsKey: false,
    voices: 'American & British English, multiple styles',
    description: 'State-of-the-art open source model. Runs entirely in your browser via WebAssembly.',
    pros: ['Open source', 'No server costs', 'Runs offline after load', 'High quality'],
    cons: ['~100MB first load', 'First-load latency'],
    badge: 'Open Source',
  },
];

/* ─── ResponsiveVoice CDN loader ────────────────────────────── */
let rvLoading = false, rvLoaded = false, rvCallbacks = [];
function loadResponsiveVoice() {
  return new Promise((resolve, reject) => {
    if (rvLoaded && window.responsiveVoice) { resolve(); return; }
    rvCallbacks.push({ resolve, reject });
    if (rvLoading) return;
    rvLoading = true;
    const s = document.createElement('script');
    s.src = 'https://code.responsivevoice.org/responsivevoice.js?key=FREE';
    s.onload = () => { rvLoaded = true; rvLoading = false; rvCallbacks.forEach(c => c.resolve()); rvCallbacks = []; };
    s.onerror = () => { rvLoading = false; rvCallbacks.forEach(c => c.reject(new Error('ResponsiveVoice CDN failed'))); rvCallbacks = []; };
    document.head.appendChild(s);
  });
}

/* ─── Standalone test function (does NOT affect useTTS state) ── */
let _testAudio = null;
export function stopTestSpeech() {
  if (_testAudio) { try { _testAudio.pause(); _testAudio = null; } catch(e){} }
  try { window.speechSynthesis?.cancel(); } catch(e){}
}

export async function testSpeakPlugin(pluginId, text, { rate = 2, volume = 1, voiceName = null, onEnd = () => {}, onError = () => {} } = {}) {
  stopTestSpeech();
  const clean = cleanForTTS(text);
  if (!clean) return;

  switch (pluginId) {

    case 'streamelements': {
      const voice = getLS('seVoice', 'Brian');
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(clean.slice(0, 400))}`;
      const audio = new Audio(url);
      audio.volume = volume;
      audio.onended = () => { _testAudio = null; onEnd(); };
      audio.onerror = () => { _testAudio = null; onError(new Error('StreamElements playback failed')); };
      _testAudio = audio;
      audio.play().catch(err => { _testAudio = null; onError(err); });
      break;
    }

    case 'responsivevoice': {
      try {
        await loadResponsiveVoice();
        const voice = getLS('rvVoice', 'UK English Female');
        window.responsiveVoice.cancel();
        window.responsiveVoice.speak(clean.slice(0, 500), voice, {
          rate: Math.min(rate, 1.5), volume,
          onend: onEnd, onerror: () => onError(new Error('ResponsiveVoice error')),
        });
      } catch(err) { onError(err); }
      break;
    }

    case 'voicerss': {
      const key = getLS('voicerss_key', '');
      if (!key) { onError(new Error('No VoiceRSS API key set')); return; }
      const url = `https://api.voicerss.org/?key=${key}&hl=en-us&src=${encodeURIComponent(clean.slice(0, 500))}&c=MP3&f=44khz_16bit_stereo`;
      const audio = new Audio(url);
      audio.volume = volume;
      audio.onended = () => { _testAudio = null; onEnd(); };
      audio.onerror = () => { _testAudio = null; onError(new Error('VoiceRSS failed — check key')); };
      _testAudio = audio;
      audio.play().catch(err => { _testAudio = null; onError(err); });
      break;
    }

    case 'elevenlabs': {
      const key = getLS('elevenlabs_key', '');
      const voiceId = getLS('elVoice', '21m00Tcm4TlvDq8ikWAM');
      if (!key) { onError(new Error('No ElevenLabs API key set')); return; }
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
          method: 'POST',
          headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
          body: JSON.stringify({ text: clean.slice(0, 2000), model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true } }),
        });
        if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`);
        const blob = await res.blob();
        const src = URL.createObjectURL(blob);
        const audio = new Audio(src);
        audio.volume = volume;
        audio.onended = () => { URL.revokeObjectURL(src); _testAudio = null; onEnd(); };
        audio.onerror = () => { URL.revokeObjectURL(src); _testAudio = null; onError(new Error('ElevenLabs playback failed')); };
        _testAudio = audio;
        audio.play().catch(err => { _testAudio = null; onError(err); });
      } catch(err) { onError(err); }
      break;
    }

    // All other plugins (azure, openai, google, amazon, kokoro) + default webspeech
    default: {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(clean.slice(0, 800));
      const voices = window.speechSynthesis.getVoices();
      const vName = voiceName || getLS('voiceName', null);
      const voice = vName ? voices.find(v => v.name === vName) : pickBestVoice(voices);
      if (voice) utt.voice = voice;
      utt.lang = 'en-US';
      utt.rate = Math.min(rate, 2); // Web Speech max is ~2
      utt.volume = volume;
      utt.pitch = 1.0;
      utt.onend = onEnd;
      utt.onerror = () => onError(new Error('Web Speech error'));
      window.speechSynthesis.speak(utt);
      break;
    }
  }
}

/* ─── useTTS hook ────────────────────────────────────────────── */
export function useTTS() {
  const [speakingId, setSpeakingId]   = useState(null);
  const [progress,   setProgress]     = useState(0);
  const [elapsed,    setElapsed]       = useState(0);
  const [duration,   setDuration]     = useState(0);
  const [rate,       setRateState]    = useState(() => getLS('rate', 2));
  const [volume,     setVolumeState]  = useState(() => getLS('volume', 1));
  const [voices,     setVoices]       = useState([]);
  const [selVoice,   setVoiceState]   = useState(() => getLS('voiceName', null));
  const [wordIdx,    setWordIdx]       = useState(0);
  const [wordTotal,  setWordTotal]    = useState(0);

  const voiceRef   = useRef(null);
  const audioRef   = useRef(null);
  const timerRef   = useRef(null);
  const startRef   = useRef(0);
  const durRef     = useRef(0);
  const idRef      = useRef(null);
  const wordsRef   = useRef([]);    // word positions for tracking

  // Load Web Speech voices
  useEffect(() => {
    const load = () => {
      if (!window.speechSynthesis) return;
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        const best = pickBestVoice(v);
        voiceRef.current = best;
        if (!getLS('voiceName', null) && best) setVoiceState(best.name);
      }
    };
    load();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis?.cancel();
      if (audioRef.current) { try { audioRef.current.pause(); } catch(e){} audioRef.current = null; }
      clearInterval(timerRef.current);
    };
  }, []);

  const setRate   = useCallback((r) => { setRateState(r);  setLS('rate', r); }, []);
  const setVolume = useCallback((v) => { setVolumeState(v); setLS('volume', v); }, []);
  const setVoice  = useCallback((n) => { setVoiceState(n);  setLS('voiceName', n); voiceRef.current = voices.find(v => v.name === n) || voiceRef.current; }, [voices]);
  const setPlugin = useCallback((id) => setLS('plugin', id), []);

  const estDur = (text, r) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    return (words / (150 * Math.max(r, 0.5))) * 60;
  };

  const startTimer = useCallback((dur) => {
    clearInterval(timerRef.current);
    startRef.current = Date.now();
    durRef.current = dur;
    setProgress(0); setElapsed(0); setDuration(dur);
    timerRef.current = setInterval(() => {
      const el = (Date.now() - startRef.current) / 1000;
      setElapsed(el);
      if (dur > 0) setProgress(Math.min(99, (el / dur) * 100));
    }, 150);
  }, []);

  const stopTimer = useCallback((done = false) => {
    clearInterval(timerRef.current);
    if (done) { setProgress(100); setElapsed(durRef.current); }
  }, []);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) { try { audioRef.current.pause(); } catch(e){} audioRef.current = null; }
    clearInterval(timerRef.current);
    setSpeakingId(null); setProgress(0); setElapsed(0); setWordIdx(0);
    idRef.current = null;
  }, []);

  // ── Web Speech ──
  const speakWebSpeech = useCallback((id, text) => {
    const r = getLS('rate', 2);
    const vol = getLS('volume', 1);
    const vName = getLS('voiceName', null);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const allVoices = window.speechSynthesis.getVoices();
    const voice = vName ? allVoices.find(v => v.name === vName) : voiceRef.current;
    if (voice) utt.voice = voice;
    utt.lang = 'en-US';
    utt.rate = Math.min(r, 2);  // Web Speech capped at ~2
    utt.volume = vol;
    utt.pitch = 1.0;

    // Word boundary tracking
    const words = text.split(/\s+/).filter(Boolean);
    setWordTotal(words.length);
    setWordIdx(0);
    wordsRef.current = words;

    utt.onboundary = (e) => {
      if (e.name === 'word') {
        // Estimate word index from charIndex
        const spoken = text.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length;
        setWordIdx(spoken);
        const el = (Date.now() - startRef.current) / 1000;
        setElapsed(el);
        if (durRef.current > 0) setProgress(Math.min(99, (el / durRef.current) * 100));
      }
    };
    utt.onend = () => { stopTimer(true); setSpeakingId(null); idRef.current = null; };
    utt.onerror = () => { stopTimer(false); setSpeakingId(null); idRef.current = null; };

    startTimer(estDur(text, r));
    setSpeakingId(id); idRef.current = id;
    window.speechSynthesis.speak(utt);
  }, [startTimer, stopTimer]);

  // ── StreamElements (direct Audio src — no fetch, no CORS) ──
  const speakStreamElements = useCallback((id, text) => {
    const voice = getLS('seVoice', 'Brian');
    const vol   = getLS('volume', 1);
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text.slice(0, 500))}`;
    const audio = new Audio(url);
    audio.volume = vol;
    const dur = estDur(text, 1.0);
    startTimer(dur);
    setSpeakingId(id); idRef.current = id;
    audio.onended = () => { audioRef.current = null; stopTimer(true); setSpeakingId(null); idRef.current = null; };
    audio.onerror = () => {
      audioRef.current = null; stopTimer(false);
      // Fallback to Web Speech
      speakWebSpeech(id, text);
    };
    audioRef.current = audio;
    audio.play().catch(() => { stopTimer(false); speakWebSpeech(id, text); });
  }, [startTimer, stopTimer, speakWebSpeech]);

  // ── ElevenLabs — streaming endpoint, turbo model, silent fallback ──
  const speakElevenLabs = useCallback(async (id, text) => {
    const key     = getLS('elevenlabs_key', '');
    const voiceId = getLS('elVoice', '21m00Tcm4TlvDq8ikWAM'); // Rachel — warm, conversational
    const vol     = getLS('volume', 1);
    // No key → silent fallback to WebSpeech (no disruptive alert)
    if (!key) { speakWebSpeech(id, text); return; }
    startTimer(estDur(text, 0.95));
    setSpeakingId(id); idRef.current = id;
    try {
      // /stream endpoint begins returning audio before generation is complete → faster first audio
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({
          text: text.slice(0, 4500),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const src = URL.createObjectURL(blob);
      const audio = new Audio(src);
      audio.volume = vol;
      audio.onended = () => { URL.revokeObjectURL(src); audioRef.current = null; stopTimer(true); setSpeakingId(null); idRef.current = null; };
      audio.onerror = () => { URL.revokeObjectURL(src); audioRef.current = null; stopTimer(false); speakWebSpeech(id, text); };
      audioRef.current = audio;
      await audio.play();
    } catch(err) {
      // Silent fallback — never interrupt the user with an alert
      stopTimer(false); setSpeakingId(null); idRef.current = null;
      speakWebSpeech(id, text);
    }
  }, [startTimer, stopTimer, speakWebSpeech]);

  // ── ResponsiveVoice ──
  const speakResponsiveVoice = useCallback(async (id, text) => {
    const vol   = getLS('volume', 1);
    const r     = getLS('rate', 2);
    const voice = getLS('rvVoice', 'UK English Female');
    startTimer(estDur(text, 1.0));
    setSpeakingId(id); idRef.current = id;
    try {
      await loadResponsiveVoice();
      window.responsiveVoice.cancel();
      window.responsiveVoice.speak(text.slice(0, 1000), voice, {
        rate: Math.min(r, 1.5), volume: vol,
        onend: () => { stopTimer(true); setSpeakingId(null); idRef.current = null; },
        onerror: () => { stopTimer(false); setSpeakingId(null); idRef.current = null; },
      });
    } catch(err) {
      stopTimer(false);
      speakWebSpeech(id, text);
    }
  }, [startTimer, stopTimer, speakWebSpeech]);

  // ── Main speak dispatcher ──
  const speak = useCallback((id, rawText) => {
    if (idRef.current === id) { stopAll(); return; }
    if (idRef.current && idRef.current !== id) stopAll();
    const text = cleanForTTS(rawText);
    if (!text) return;

    const plugin = getLS('plugin', 'webspeech');
    if      (plugin === 'streamelements')   speakStreamElements(id, text);
    else if (plugin === 'elevenlabs')       speakElevenLabs(id, text);
    else if (plugin === 'responsivevoice') speakResponsiveVoice(id, text);
    else                                   speakWebSpeech(id, text);
  }, [stopAll, speakWebSpeech, speakStreamElements, speakElevenLabs, speakResponsiveVoice]);

  return {
    speakingId, progress, elapsed, duration,
    rate, setRate, volume, setVolume,
    voices, selectedVoice: selVoice, setVoice,
    wordIdx, wordTotal,
    setPlugin,
    speak, stop: stopAll,
  };
}

/* ─── Speeds & format helper ────────────────────────────────── */
export const TTS_SPEEDS = [0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20];
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ─── MiniPlayer (shown below active message) ────────────────── */
const MiniPlayer = ({ tts }) => {
  const { progress, elapsed, duration, rate, setRate, volume, setVolume, stop, wordIdx, wordTotal } = tts;
  const [showSpeed, setShowSpeed] = useState(false);

  return (
    <div style={{
      marginTop: 10, padding: '10px 12px',
      background: 'rgba(91,233,221,0.06)',
      border: '1px solid rgba(91,233,221,0.18)',
      borderRadius: 10,
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 9999, background: 'rgba(91,233,221,0.12)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          background: 'linear-gradient(90deg,var(--aurora),rgba(91,233,221,0.5))',
          width: `${progress}%`, transition: 'width 0.15s linear',
        }} />
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Stop */}
        <button onClick={stop} title="Stop" style={{
          width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(91,233,221,0.35)', background: 'rgba(91,233,221,0.1)', cursor: 'pointer',
        }}>
          <Square size={9} color="var(--aurora)" fill="var(--aurora)" />
        </button>

        {/* Time */}
        <span style={{ fontSize: 11, color: 'var(--dust)', fontVariantNumeric: 'tabular-nums', minWidth: 75 }}>
          {fmt(elapsed)}{duration > 0 ? ` / ${fmt(duration)}` : ''}
        </span>

        {/* Word tracking */}
        {wordTotal > 0 && (
          <span style={{ fontSize: 10, color: 'rgba(91,233,221,0.5)' }}>
            word {Math.min(wordIdx + 1, wordTotal)}/{wordTotal}
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Speed */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSpeed(s => !s)} style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
            border: '1px solid rgba(91,233,221,0.25)', background: 'rgba(91,233,221,0.08)',
            color: 'var(--aurora)', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {rate}× <ChevronDown size={9} />
          </button>
          {showSpeed && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: 4,
              background: 'var(--void-2)', border: '1px solid var(--line-2)', borderRadius: 8,
              overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 200,
            }}>
              {TTS_SPEEDS.map(s => (
                <button key={s} onClick={() => { setRate(s); setShowSpeed(false); }} style={{
                  display: 'block', width: '100%', padding: '6px 18px', fontSize: 12, fontWeight: 500,
                  border: 'none', cursor: 'pointer', textAlign: 'center',
                  background: rate === s ? 'rgba(91,233,221,0.12)' : 'transparent',
                  color: rate === s ? 'var(--aurora)' : 'var(--bone-dim)',
                }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <button onClick={() => setVolume(volume > 0 ? 0 : 1)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: volume > 0 ? 'var(--aurora)' : 'var(--dust)',
        }}>
          {volume > 0 ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>
    </div>
  );
};

/* ─── ListenButton ─────────────────────────────────────────── */
export const ListenButton = ({ id, text, tts, variant = 'inline' }) => {
  const active = tts.speakingId === id;
  const wrapRef = useRef(null);

  // Scroll into view when this message starts playing
  useEffect(() => {
    if (active && wrapRef.current) {
      wrapRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  const btn = (
    <button
      onClick={() => tts.speak(id, text)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: variant === 'pill' ? 6 : 4,
        padding: variant === 'pill' ? '6px 14px' : '3px 10px',
        marginTop: variant === 'inline' ? 8 : 0,
        borderRadius: 9999, fontSize: variant === 'pill' ? 13 : 11, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.2s',
        background: active ? 'rgba(91,233,221,0.14)' : 'rgba(242,234,211,0.05)',
        color: active ? 'var(--aurora)' : 'var(--bone-dim)',
        border: `1px solid ${active ? 'rgba(91,233,221,0.3)' : 'rgba(242,234,211,0.12)'}`,
      }}
      title={active ? 'Stop' : 'Listen to this content'}
    >
      {active
        ? <><Square size={variant === 'pill' ? 12 : 10} fill="var(--aurora)" /> Playing</>
        : <><Volume2 size={variant === 'pill' ? 13 : 10} /> Listen</>}
    </button>
  );

  return (
    <div ref={wrapRef} style={{ display: variant === 'pill' ? 'inline-flex' : 'block', flexDirection: 'column' }}>
      {btn}
      {active && <MiniPlayer tts={tts} />}
    </div>
  );
};

export default ListenButton;
