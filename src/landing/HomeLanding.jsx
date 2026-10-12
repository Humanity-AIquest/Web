// ============================================================
// LANDING HOME — "Hard fork & Hippocratic Covenant"
// From "Humanity-AI Website Strategy & Wireframes V1" (Gemini, Oct 2026):
//   1. Hero (the hook)  2. The core problem  3. The 12 pledges (accordion)
//   4. How a rule is born (Voice → Draft → Vote → Seal)  5. Co-sign + sticker pack
// Plus the October 20 lunchtime Flash Mob from the doc's community strategy.
// Every visible string is CMS-editable through <E p="home2" k="…">.
// ============================================================
import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Calendar, Mic, PenLine, Vote, Lock, CheckCircle, Loader2, X as XIcon, Check, Share2, Copy, Users } from 'lucide-react';
import { PRIME_PROMISE, PLEDGES } from '../v3/pledges.js';

const AGENTI_URL = 'https://agenti-pm.humanity-ai-info.workers.dev/';
const LEGACY = ['Nails', 'Snails', 'Corporate fiduciary duty', 'Quarterly earnings', 'Engagement metrics'];
const HUMAN = ['Children first', 'Your data, owned by you', 'Your voice in every rule', 'Credit for your work, forever', 'A right to switch it off'];

const STEPS = [
  { icon: Mic, k: 'voice', t: 'Voice', d: 'You tell Pi, our SI guide, what you think.' },
  { icon: PenLine, k: 'draft', t: 'Draft', d: 'Pi drafts the amendment in plain language.' },
  { icon: Vote, k: 'vote', t: 'Vote', d: 'Verified humans decide. One person, one voice.' },
  { icon: Lock, k: 'seal', t: 'Seal', d: 'The new version is sealed on the Ledger.' },
];

export default function HomeLanding({ setPage, onOpenAgent, ui, single = false, fundUrl, backLabel = 'Back this Project' }) {
  const { E, Turnstile, postJSON, flashMob, PiEmblem, linkedinUrl } = ui;
  const [stats, setStats] = useState(null);
  const [openPledge, setOpenPledge] = useState(single ? -1 : 0);
  const BackBtn = ({ className = '' }) => (
    <a href={fundUrl} target="_blank" rel="noopener noreferrer" className={'btn-aurora ' + className}>{backLabel} <ArrowRight size={16} /></a>
  );

  useEffect(() => {
    let live = true;
    fetch('/api/count').then(r => r.json()).then(d => { if (live && !d.error) setStats(d); }).catch(() => {});
    return () => { live = false; };
  }, []);

  return (
    <div className="hl">
      <HomeStyles />

      {/* 1 — HERO (sister-brand family: Commons Aqua field, 52-tick constitution dial) */}
      <section className="hl-hero">
        <span className="hl-vmark" aria-hidden="true">humanity-ai.quest</span>
        <div className="hl-wrap hl-hero-grid">
          <div className="hl-hero-copy">
            <div className="hl-pill"><span className="hl-dot" /> <E p="home2" k="eyebrow" as="span">An open-source upgrade for society</E></div>
            <div className="hl-wordmark" aria-hidden="true">Humanity<span>—</span>AI</div>
            <h1 className="hl-h1 font-display">
              <E p="home2" k="h1_a" as="span" className="hl-h1-small">To the Startup Nation in every nation:</E>
              <E p="home2" k="h1v3_a" as="span">Together we built the internet. Join to build the </E><E p="home2" k="h1v3_b" as="span" className="hl-gold">Open-Regulatory OS</E><E p="home2" k="h1v3_c" as="span"> to reinvent it.</E>
            </h1>
            <E p="home2" k="sub" as="p" className="hl-sub">A Hippocratic Oath for AI, written in the open and funded by the people it protects. No VC.</E>
            <div className="hl-ctas">
              {single ? <BackBtn /> : (
                <>
                  <a href="#co-sign" className="btn-aurora"><E p="home2" k="cta_sign" as="span">Co-sign the Covenant</E> <ArrowRight size={16} /></a>
                  <button type="button" onClick={() => setPage('back')} className="btn-secondary"><E p="home2" k="cta_back" as="span">Back the Founders Series</E></button>
                </>
              )}
            </div>
            {!single && stats && stats.count > 0 && (
              <p className="hl-proof"><b>{Number(stats.count).toLocaleString()}</b> people have co-signed{stats.nations > 1 ? <> from <b className="hl-gold">{stats.nations}</b> nations</> : null}.</p>
            )}
          </div>
          <div className="hl-dial-wrap" aria-hidden="true">
            <svg className="hl-dial" viewBox="0 0 200 200">
              {Array.from({ length: 52 }, (_, i) => {
                const a = i / 52 * Math.PI * 2, long = i % 13 === 0, r1 = long ? 80 : 86, r2 = 95;
                return <line key={i} x1={100 + Math.sin(a) * r1} y1={100 - Math.cos(a) * r1} x2={100 + Math.sin(a) * r2} y2={100 - Math.cos(a) * r2} stroke="#05061A" strokeWidth={long ? 2.2 : 1.1} strokeOpacity={long ? 0.85 : 0.5} />;
              })}
              <circle cx="100" cy="5" r="3.6" fill="#FF5A1F" />
            </svg>
            <div className="hl-disc">{PiEmblem ? <div className="hl-emblem"><PiEmblem /></div> : <span className="hl-pi">π</span>}</div>
            <span className="hl-dial-cap">52 clauses · guarded by Uto-Pi</span>
          </div>
        </div>
      </section>
      <a className="hl-agenti-strip" href={AGENTI_URL} target="_blank" rel="noopener noreferrer">
        <span className="hl-agenti-bar" /> <span>Powered by Agenti</span><span className="hl-agenti-q">How is one person doing all this? It runs on Agenti.</span><ArrowRight size={16} />
      </a>

      {/* 2 — THE CORE PROBLEM */}
      <section className="hl-section">
        <div className="hl-wrap">
          <div className="hl-label">The problem</div>
          <h2 className="hl-h2 font-display"><E p="home2" k="problem_h" as="span">Legacy systems protect nails, snails and corporate fiduciary duty. There are no humans in that code.</E></h2>
          <E p="home2" k="problem_sub" as="p" className="hl-lede">It’s broken. Let’s fix it.</E>
          <div className="hl-compare">
            <div className="hl-card hl-legacy">
              <div className="hl-card-top"><span className="hl-tag hl-tag-bad">Legacy OS</span><span className="hl-mono">v1.0 · deprecated</span></div>
              <E p="home2" k="legacy_h" as="div" className="hl-card-h font-display">What it protects today</E>
              <ul>{LEGACY.map((x, i) => <li key={x}><XIcon size={15} /> <E p="home2" k={'legacy_' + i} as="span">{x}</E></li>)}</ul>
              <div className="hl-code"><span>humans:</span> <em>null</em></div>
            </div>
            <div className="hl-card hl-human">
              <div className="hl-card-top"><span className="hl-tag hl-tag-good">Humanity OS</span><span className="hl-mono">v2.0 · hard fork</span></div>
              <E p="home2" k="human_h" as="div" className="hl-card-h font-display">What the fork protects</E>
              <ul>{HUMAN.map((x, i) => <li key={x}><Check size={15} /> <E p="home2" k={'human_' + i} as="span">{x}</E></li>)}</ul>
              <div className="hl-code"><span>humans:</span> <em className="hl-gold">first</em></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — THE 12 PLEDGES */}
      <section className="hl-section hl-alt">
        <div className="hl-wrap hl-narrow">
          <div className="hl-label">The Covenant</div>
          <h2 className="hl-h2 font-display"><E p="home2" k="pledges_h" as="span">Twelve promises. One constant.</E></h2>
          <E p="home2" k="pledges_sub" as="p" className="hl-lede">A Hippocratic Oath for human-regulated AI and data ownership.</E>
          <div className="hl-prime">
            <span className="hl-mono hl-gold">Prime promise</span>
            <div className="font-display hl-prime-name">{PRIME_PROMISE.name}</div>
            <p>{PRIME_PROMISE.text}</p>
          </div>
          <div className="hl-acc">
            {PLEDGES.map((p, i) => {
              const open = openPledge === i;
              return (
                <div key={p.n} className={'hl-acc-row' + (open ? ' open' : '')}>
                  <button type="button" className="hl-acc-head" aria-expanded={open} onClick={() => setOpenPledge(open ? -1 : i)}>
                    <span className="hl-mono hl-acc-n">{p.n}</span>
                    <span className="hl-acc-title"><span className="font-display">{p.name}</span><span className="hl-acc-line">{p.line}</span></span>
                    <ChevronDown size={18} className="hl-acc-chev" />
                  </button>
                  {open && (
                    <div className="hl-acc-body">
                      {(p.promise || []).map((t, j) => <p key={j}>{t}</p>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!single && <button type="button" onClick={() => setPage('constitution')} className="hl-link">Read the full Covenant, with the technical detail <ArrowRight size={14} /></button>}
        </div>
      </section>

      {/* 4 — HOW A RULE IS BORN */}
      <section className="hl-section">
        <div className="hl-wrap">
          <div className="hl-label">The amendment engine</div>
          <h2 className="hl-h2 font-display"><E p="home2" k="rule_h" as="span">How a rule is born.</E></h2>
          <E p="home2" k="rule_sub" as="p" className="hl-lede">Nobody owns the Covenant. Anyone can improve it.</E>
          <ol className="hl-steps">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.k} className="hl-step">
                  <div className="hl-step-top"><span className="hl-step-icon"><Icon size={20} /></span><span className="hl-mono">0{i + 1}</span></div>{i === 3 && <span className="hl-pi-hunt" title="You found Uto-Pi">π</span>}
                  <E p="home2" k={'step_' + s.k + '_t'} as="div" className="font-display hl-step-t">{s.t}</E>
                  <E p="home2" k={'step_' + s.k + '_d'} as="p" className="hl-step-d">{s.d}</E>
                </li>
              );
            })}
          </ol>
          {single ? <BackBtn className="hl-mt" /> : <button type="button" onClick={onOpenAgent} className="btn-secondary hl-mt"><Mic size={15} /> <E p="home2" k="rule_cta" as="span">Tell Pi what you think</E></button>}
        </div>
      </section>

      {/* RUNS ON AGENTI — the family rule: the orange is Agenti */}
      <section className="hl-runs">
        <div className="hl-wrap hl-runs-grid">
          <div>
            <div className="hl-label hl-ink">How is this possible?</div>
            <h2 className="hl-h2 font-display">It runs on Agenti<span className="hl-cursor" aria-hidden="true" /></h2>
            <p className="hl-lede hl-ink-dim">Humanity-AI takes on the giants because a fleet of Agenti agents does the work of a whole company: drafting, translating, answering, counting every signature. One founder, many agents. The orange on this page is the reminder.</p>
          </div>
          <a className="hl-runs-btn" href={AGENTI_URL} target="_blank" rel="noopener noreferrer">Get me Agenti by 2pm <ArrowRight size={18} /></a>
        </div>
      </section>

      {/* 5 (single page) — BACK THIS PROJECT */}
      {single && (
        <section className="hl-section hl-alt">
          <div className="hl-wrap hl-center">
            <div className="hl-label">The Founders Series</div>
            <h2 className="hl-h2 font-display" style={{ margin: '0 auto' }}><E p="home2" k="back_h" as="span">Fund the hard fork.</E></h2>
            <E p="home2" k="back_sub" as="p" className="hl-lede" style={{ margin: '.9rem auto 0' }}>No VC. The people fund the constitution that protects them. The Founders Series pre-funding round is open now.</E>
            <div className="hl-ctas"><BackBtn /></div>
          </div>
        </section>
      )}

      {/* 5 — CO-SIGN + STICKER PACK */}
      {!single && (
      <section id="co-sign" className="hl-section hl-alt">
        <div className="hl-wrap hl-cosign">
          <div>
            <div className="hl-label">Co-sign</div>
            <h2 className="hl-h2 font-display"><E p="home2" k="sign_h" as="span">Add your name to the Ledger.</E></h2>
            <E p="home2" k="sign_sub" as="p" className="hl-lede">One signature. Your name joins the public record of everyone who stood up for humans first.</E>
            <div className="hl-sticker">
              <div className="hl-sticker-art" aria-hidden="true"><img src="/pi/pi-face.webp" alt="" /><span>HUMANS<br />FIRST</span></div>
              <div>
                <E p="home2" k="sticker_h" as="div" className="font-display hl-card-h">Your custom pledge sticker pack</E>
                <E p="home2" k="sticker_d" as="p" className="hl-step-d">Your personal promises, printed to wear and share. Every pack helps fund the open-source build. Sticker packs ship with the next launch.</E>
              </div>
            </div>
          </div>
          <CoSignForm E={E} Turnstile={Turnstile} postJSON={postJSON} setPage={setPage} />
        </div>
      </section>
      )}

      {/* COMMUNITY — October 20 */}
      <section className="hl-section">
        <div className="hl-wrap">
          {single ? (
            <FlashMobRegister ev={flashMob} E={E} Turnstile={Turnstile} postJSON={postJSON} fundUrl={fundUrl} backLabel={backLabel} linkedinUrl={linkedinUrl} />
          ) : (
          <button type="button" onClick={() => setPage('events')} className="hl-event">
            <span className="hl-step-icon"><Calendar size={20} /></span>
            <span className="hl-event-text">
              <span className="hl-mono hl-gold">Tuesday 20 October · lunchtime</span>
              <span className="font-display hl-event-t">{flashMob.title}</span>
              <span className="hl-step-d"><E p="home2" k="event_d" as="span">Step outside your office at lunch and stand with tech creators everywhere. Register and we’ll send you the details.</E></span>
            </span>
            <span className="hl-event-cta">Register <ArrowRight size={15} /></span>
          </button>
          )}
        </div>
      </section>
    </div>
  );
}

// Inline Flash Mob registration: Register → form → thank-you, all inside one card.
const FlashMobRegister = ({ ev, E, Turnstile, postJSON, fundUrl, backLabel, linkedinUrl }) => {
  const [stage, setStage] = useState('idle');       // idle | form | done
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tsToken, setTsToken] = useState('');
  const [tsKey, setTsKey] = useState(0);

  const invite = 'Join me at the ' + ev.title + ' (Tuesday 20 October, lunchtime). Register free: https://humanity-ai.quest/#flash-mob';
  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please add a valid email address.');
    setError(''); setLoading(true);
    try {
      const d = await postJSON('/api/events/' + ev.id + '/rsvp', { name: name.trim(), email: email.trim(), turnstile_token: tsToken });
      setTsKey(k => k + 1);
      if (d.error) { setError(d.error); return; }
      setResult({ first: name.trim().split(' ')[0], email: email.trim().toLowerCase(), already: !!d.already });
      setStage('done');
    } catch (_) {
      setError('We could not reach the server. Check your connection and try again.');
    } finally { setLoading(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(invite); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch (_) {}
  };
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: ev.title, text: invite }); else await copy(); } catch (_) {}
  };
  const field = 'w-full px-4 py-3 rounded-xl text-sm outline-none';
  const fs = { background: 'var(--void)', border: '1px solid var(--line-2)', color: 'var(--bone)' };

  return (
    <div id="flash-mob" className="hl-fm">
      <div className="hl-fm-head">
        <span className="hl-step-icon"><Calendar size={20} /></span>
        <div className="hl-event-text">
          <span className="hl-mono hl-gold">First event · Tuesday 20 October · lunchtime</span>
          <span className="font-display hl-event-t">{ev.title}</span>
          <E p="home2" k="fm_d" as="span" className="hl-step-d">Step outside your office at lunch and stand with tech creators everywhere. Free to join. Register and we will send you the time, the meeting point and what to bring.</E>
        </div>
        {stage === 'idle' && (
          <button type="button" className="hl-fm-btn" onClick={() => setStage('form')}>
            <Users size={16} /> Register for the Flash Mob
          </button>
        )}
      </div>

      {stage === 'form' && (
        <form onSubmit={submit} className="hl-fm-form" noValidate>
          <div className="hl-fm-fields">
            <div>
              <label className="hl-fm-label" htmlFor="fm-name">Your name</label>
              <input id="fm-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" autoFocus className={field} style={fs} />
            </div>
            <div>
              <label className="hl-fm-label" htmlFor="fm-email">Email for the details</label>
              <input id="fm-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" className={field} style={fs} />
            </div>
          </div>
          <Turnstile onToken={setTsToken} resetKey={tsKey} />
          {error && <p className="hl-error" role="alert">{error}</p>}
          <div className="hl-fm-actions">
            <button type="submit" disabled={loading} className="hl-fm-btn">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Confirm my place</>}
            </button>
            <button type="button" className="hl-fm-cancel" onClick={() => { setStage('idle'); setError(''); }}>Cancel</button>
          </div>
          <p className="hl-fine">We use your email only for this event and movement updates. One registration per email.</p>
        </form>
      )}

      {stage === 'done' && result && (
        <div className="hl-fm-done" role="status">
          <div className="hl-fm-done-head">
            <CheckCircle size={30} className="hl-gold" />
            <div>
              <div className="font-display hl-h3">{result.already ? 'You’re already registered, ' : 'You’re in, '}{result.first}.</div>
              <p className="hl-step-d">We’ll send the time and meeting point to <b style={{ color: 'var(--bone)' }}>{result.email}</b> before Tuesday 20 October.</p>
            </div>
          </div>
          <div className="hl-fm-next">
            <div>
              <div className="hl-fm-label">Bring a friend</div>
              <div className="hl-fm-row">
                <button type="button" className="btn-secondary" onClick={share}><Share2 size={15} /> Share invite</button>
                <button type="button" className="btn-secondary" onClick={copy}><Copy size={15} /> {copied ? 'Copied' : 'Copy invite'}</button>
              </div>
            </div>
            <div>
              <div className="hl-fm-label">Fund the movement</div>
              <a href={fundUrl} target="_blank" rel="noopener noreferrer" className="btn-aurora">{backLabel} <ArrowRight size={16} /></a>
            </div>
          </div>
          <button type="button" className="hl-fm-cancel" onClick={() => { setStage('form'); setName(''); setEmail(''); setResult(null); }}>Register someone else</button>
        </div>
      )}
    </div>
  );
};

const CoSignForm = ({ E, Turnstile, postJSON, setPage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [sticker, setSticker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [tsToken, setTsToken] = useState('');
  const [tsKey, setTsKey] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please add a valid email address.');
    setError(''); setLoading(true);
    try {
      const d = await postJSON('/api/sign', { name: name.trim(), email: email.trim(), country: country.trim(), side: 'human', sticker, turnstile_token: tsToken });
      setTsKey(k => k + 1);
      if (d.error) setError(d.error);
      else setDone({ number: d.number, first: name.trim().split(' ')[0] });
    } catch (_) {
      setError('We could not reach the server. Check your connection and try again.');
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="hl-form hl-done">
        <CheckCircle size={36} className="hl-gold" />
        <div className="font-display hl-h3">Thank you, {done.first}.</div>
        <p>You are signatory <b className="hl-gold">#{Number(done.number).toLocaleString()}</b>. Your name is on the Ledger.</p>
        {sticker && <p className="hl-step-d">We’ll email you when sticker packs are ready.</p>}
        <button type="button" onClick={() => setPage('back')} className="btn-aurora">Back the Founders Series <ArrowRight size={16} /></button>
      </div>
    );
  }

  const field = 'w-full px-4 py-3 rounded-xl text-sm outline-none';
  const fs = { background: 'var(--void)', border: '1px solid var(--line-2)', color: 'var(--bone)' };
  return (
    <form onSubmit={submit} className="hl-form" noValidate>
      <E p="home2" k="form_h" as="div" className="font-display hl-h3">Co-sign the Covenant</E>
      <label className="sr-only" htmlFor="cs-name">Your name</label>
      <input id="cs-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} style={fs} />
      <label className="sr-only" htmlFor="cs-email">Email address</label>
      <input id="cs-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" className={field} style={fs} />
      <label className="sr-only" htmlFor="cs-country">Country</label>
      <input id="cs-country" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country (optional)" autoComplete="country-name" className={field} style={fs} />
      <label className="hl-check">
        <input type="checkbox" checked={sticker} onChange={e => setSticker(e.target.checked)} />
        <span>I’d like a custom pledge sticker pack <em>(optional, ships with the next launch)</em></span>
      </label>
      <Turnstile onToken={setTsToken} resetKey={tsKey} />
      {error && <p className="hl-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="btn-aurora w-full justify-center">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Add my name <ArrowRight size={16} /></>}
      </button>
      <p className="hl-fine">Free. We use your email only to confirm your signature and share movement updates.</p>
    </form>
  );
};

const HomeStyles = () => (
  <style>{`
  .hl { --hl-gold: var(--aurora); }
  .hl-wrap { max-width: 1240px; margin: 0 auto; padding-inline: 1.25rem; }
  @media (min-width: 760px) { .hl-wrap { padding-inline: 2.5rem; } }
  .hl-narrow { max-width: 900px; }
  .hl-center { text-align: center; }
  .hl-gold { color: var(--aurora); }
  .hl-mono { font-family: var(--f-mono); font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--bone-dim); }
  .hl .font-display { text-transform: uppercase; }

  /* HERO: Commons Aqua field */
  .hl-hero { position: relative; overflow: hidden; background: var(--aurora); color: var(--void); padding: 4.5rem 0 4rem; }
  .hl-vmark { position: absolute; right: 8px; top: 7rem; writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--f-mono); font-size: 9px; letter-spacing: .32em; text-transform: uppercase; opacity: .45; }
  .hl-hero-grid { display: grid; gap: 2.5rem; align-items: center; }
  @media (min-width: 960px) { .hl-hero-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 3rem; } }
  .hl-hero-copy { min-width: 0; }
  .hl-pill { display: inline-flex; align-items: center; gap: .5rem; font-family: var(--f-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--void); }
  .hl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--agenti); }
  .hl-wordmark { font-family: var(--f-display); font-weight: 900; text-transform: uppercase; line-height: .8; font-size: clamp(3.4rem, 12.5vw, 9.5rem); letter-spacing: -.005em; margin-top: 1.1rem; white-space: nowrap; }
  .hl-wordmark span { color: var(--agenti); }
  .hl-h1 { font-size: clamp(1.8rem, 4.2vw, 3.2rem); line-height: .98; margin: 1.4rem 0 0; max-width: 22ch; text-wrap: balance; color: var(--void); }
  .hl-h1 .hl-gold { color: var(--void); background: linear-gradient(transparent 62%, rgba(255,90,31,.55) 62%); }
  .hl-h1-small { display: block; font-family: var(--f-mono); font-weight: 500; font-size: .32em; line-height: 1.4; letter-spacing: .14em; color: rgba(5,6,26,.7); margin-bottom: .7rem; }
  .hl-sub { color: rgba(5,6,26,.78); font-size: 1.12rem; line-height: 1.6; max-width: 38rem; margin: 1.3rem 0 0; }
  .hl-ctas { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
  .hl-center .hl-ctas { justify-content: center; }
  .hl-hero .btn-aurora { background: var(--void); color: var(--bone); }
  .hl-hero .btn-aurora:hover { box-shadow: 0 10px 30px -10px rgba(5,6,26,.6); }
  .hl-hero .btn-secondary { color: var(--void); border-color: var(--void); }
  .hl-proof { margin-top: 1.5rem; font-size: .92rem; color: rgba(5,6,26,.75); }
  .hl-proof b { color: var(--void); font-variant-numeric: tabular-nums; }
  .hl-dial-wrap { position: relative; width: min(100%, 440px); aspect-ratio: 1; justify-self: center; display: grid; place-items: center; }
  .hl-dial { position: absolute; inset: 0; width: 100%; height: 100%; animation: orbit 90s linear infinite; }
  .hl-disc { width: 70%; aspect-ratio: 1; border-radius: 50%; background: var(--void); display: grid; place-items: center; overflow: hidden; box-shadow: 0 30px 60px -30px rgba(5,6,26,.7); }
  .hl-emblem { width: 100%; }
  .hl-emblem .v3-emblem-wrap { width: 100%; }
  .hl-emblem .v3-tag { font-size: .5rem; }
  .hl-pi { font-family: var(--f-display); font-weight: 900; font-size: 6rem; color: var(--aurora); }
  .hl-dial-cap { position: absolute; bottom: -1.6rem; left: 0; right: 0; text-align: center; font-family: var(--f-mono); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: rgba(5,6,26,.7); }
  @media (max-width: 959px) { .hl-dial-wrap { width: min(80vw, 340px); margin-bottom: 1.5rem; } }

  /* Powered by Agenti strip */
  .hl-agenti-strip { display: flex; align-items: center; gap: .9rem; flex-wrap: wrap; background: var(--agenti); color: var(--void); padding: .9rem 1.25rem; font-family: var(--f-display); font-weight: 900; text-transform: uppercase; font-size: 1.15rem; letter-spacing: .03em; }
  @media (min-width: 760px) { .hl-agenti-strip { padding-inline: 2.5rem; } }
  .hl-agenti-bar { width: 34px; height: 6px; background: var(--void); display: inline-block; }
  .hl-agenti-q { font-family: var(--f-body); font-weight: 500; text-transform: none; font-size: .95rem; letter-spacing: 0; flex: 1 1 260px; }
  .hl-agenti-strip:hover .hl-agenti-q { text-decoration: underline; text-underline-offset: 3px; }

  /* Sections */
  .hl-section { padding: 5rem 0; position: relative; }
  .hl-alt { background: var(--void-2); border-block: 1px solid var(--line); }
  .hl-label { font-family: var(--f-mono); font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; color: var(--aurora); margin-bottom: .9rem; }
  .hl-h2 { font-size: clamp(2.2rem, 6vw, 4.6rem); line-height: .9; max-width: 20ch; text-wrap: balance; }
  .hl-h3 { font-size: 1.9rem; line-height: 1; text-transform: uppercase; }
  .hl-lede { color: var(--bone-dim); font-size: 1.1rem; margin-top: 1rem; max-width: 42rem; line-height: 1.6; }
  .hl-compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 2.5rem; }
  .hl-card { padding: 1.6rem; border: 1px solid var(--line-2); background: var(--void); min-width: 0; }
  .hl-card-top { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
  .hl-tag { font-family: var(--f-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; padding: .25rem .6rem; border: 1px solid currentColor; }
  .hl-tag-bad { color: #FF8A6E; }
  .hl-tag-good { color: var(--aurora); }
  .hl-card-h { font-size: 1.7rem; margin-top: 1.1rem; }
  .hl-card ul { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: .55rem; }
  .hl-card li { display: flex; align-items: center; gap: .6rem; color: var(--bone); font-size: .98rem; }
  .hl-legacy li { color: var(--bone-dim); text-decoration: line-through; text-decoration-color: rgba(255,138,110,.6); }
  .hl-legacy li svg { color: #FF8A6E; flex-shrink: 0; }
  .hl-human { border-color: var(--aurora); border-top: 6px solid var(--aurora); }
  .hl-human li svg { color: var(--aurora); flex-shrink: 0; }
  .hl-code { margin-top: 1.4rem; padding: .7rem .9rem; background: var(--void-2); font-family: var(--f-mono); font-size: .85rem; color: var(--bone-dim); }
  .hl-code em { font-style: normal; color: #FF8A6E; }
  .hl-code em.hl-gold { color: var(--aurora); }
  .hl-prime { margin-top: 2rem; padding: 1.3rem 1.4rem; border: 1px solid var(--aurora); border-left: 6px solid var(--aurora); }
  .hl-prime-name { font-size: 2rem; margin-top: .3rem; }
  .hl-prime p { color: var(--bone-dim); margin-top: .35rem; line-height: 1.55; }
  .hl-acc { margin-top: 1rem; border-top: 2px solid var(--bone); }
  .hl-acc-row { border-bottom: 1px solid var(--line-2); }
  .hl-acc-head { width: 100%; display: flex; align-items: center; gap: 1rem; padding: 1.05rem .25rem; text-align: left; }
  .hl-acc-n { flex-shrink: 0; width: 3rem; color: var(--aurora); }
  .hl-acc-title { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: .2rem .8rem; }
  .hl-acc-title .font-display { font-size: 1.6rem; color: var(--bone); }
  .hl-acc-line { font-size: .92rem; color: var(--bone-dim); }
  .hl-acc-chev { flex-shrink: 0; color: var(--bone-dim); transition: transform .2s; }
  .hl-acc-row.open .hl-acc-chev { transform: rotate(180deg); color: var(--aurora); }
  .hl-acc-head:hover .hl-acc-title .font-display { color: var(--aurora); }
  .hl-acc-body { padding: 0 .25rem 1.2rem 4.25rem; color: var(--bone-dim); line-height: 1.6; display: grid; gap: .6rem; }
  .hl-link { display: inline-flex; align-items: center; gap: .35rem; margin-top: 1.5rem; color: var(--aurora); font-size: .92rem; }
  .hl-steps { list-style: none; padding: 0; margin: 2.5rem 0 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 2px solid var(--bone); }
  .hl-step { position: relative; padding: 1.4rem 1.4rem 1.6rem 0; min-width: 0; }
  .hl-step + .hl-step { padding-left: 1.4rem; border-left: 1px solid var(--line-2); }
  .hl-step:first-child { border-top: 6px solid var(--agenti); margin-top: -2px; }
  .hl-step-top { display: flex; justify-content: space-between; align-items: center; }
  .hl-step-icon { width: 2.6rem; height: 2.6rem; display: inline-flex; align-items: center; justify-content: center; color: var(--void); background: var(--aurora); flex-shrink: 0; }
  .hl-step-t { font-size: 2rem; margin-top: 1rem; }
  .hl-step-d { color: var(--bone-dim); font-size: .95rem; line-height: 1.55; margin-top: .35rem; }
  .hl-pi-hunt { position: absolute; right: .6rem; bottom: .5rem; font-family: var(--f-display); font-weight: 900; font-size: .9rem; color: var(--aurora); opacity: .35; cursor: help; }
  .hl-pi-hunt:hover { opacity: 1; }
  .hl-mt { margin-top: 2rem; }

  /* Runs on Agenti */
  .hl-runs { background: var(--agenti); color: var(--void); padding: 4.5rem 0; }
  .hl-runs-grid { display: grid; gap: 1.8rem; align-items: end; }
  @media (min-width: 900px) { .hl-runs-grid { grid-template-columns: minmax(0, 1fr) auto; } }
  .hl-ink { color: var(--void); }
  .hl-ink-dim { color: rgba(5,6,26,.78); }
  .hl-runs .hl-h2 { color: var(--void); }
  .hl-cursor { display: inline-block; width: .42em; height: .1em; background: var(--void); margin-left: .08em; animation: hl-blink 1s steps(1) infinite; }
  @keyframes hl-blink { 50% { opacity: 0; } }
  .hl-runs-btn { display: inline-flex; align-items: center; gap: 1rem; background: var(--void); color: var(--bone); font-family: var(--f-display); font-weight: 900; text-transform: uppercase; font-size: 1.3rem; letter-spacing: .03em; padding: 1rem 1.3rem; justify-self: start; transition: transform .2s; }
  .hl-runs-btn:hover { transform: translateX(4px); }

  .hl-cosign { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 440px); gap: 3rem; align-items: start; }
  .hl-sticker { display: flex; gap: 1.1rem; align-items: center; margin-top: 2rem; padding: 1.1rem; border: 1px dashed var(--line-2); }
  .hl-sticker-art { position: relative; flex-shrink: 0; width: 92px; height: 92px; border-radius: 50%; background: var(--void); border: 3px solid var(--aurora); display: flex; align-items: center; justify-content: center; overflow: hidden; transform: rotate(-8deg); }
  .hl-sticker-art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; mix-blend-mode: screen; }
  .hl-sticker-art span { position: relative; font-family: var(--f-display); font-weight: 900; font-size: .95rem; line-height: 1; letter-spacing: .04em; color: var(--aurora); text-align: center; }
  .hl-form { display: grid; gap: .8rem; padding: 1.6rem; background: var(--void); border: 1px solid var(--aurora); border-top: 6px solid var(--aurora); }
  .hl-check { display: flex; gap: .55rem; align-items: flex-start; font-size: .88rem; color: var(--bone); cursor: pointer; }
  .hl-check input { margin-top: .25rem; }
  .hl-check em { color: var(--bone-dim); font-style: normal; }
  .hl-error { font-size: .88rem; color: var(--terra); }
  .hl-fine { font-size: .75rem; color: var(--bone-dim); }
  .hl-done { text-align: center; justify-items: center; }
  .hl-done p { color: var(--bone-dim); }
  .hl-event { width: 100%; display: flex; align-items: center; gap: 1.2rem; padding: 1.4rem 1.6rem; border: 1px solid var(--line-2); background: var(--void-2); text-align: left; transition: border-color .2s; }
  .hl-event:hover { border-color: var(--aurora); }
  .hl-event-text { flex: 1; min-width: 0; display: grid; gap: .25rem; }
  .hl-event-t { font-size: 2rem; color: var(--bone); text-transform: uppercase; }
  .hl-event-cta { display: inline-flex; align-items: center; gap: .3rem; color: var(--aurora); white-space: nowrap; font-size: .95rem; }
  .hl-fm { padding: 1.6rem; border: 1px solid var(--aurora); border-top: 6px solid var(--aurora); background: var(--void-2); scroll-margin-top: 120px; }
  .hl-fm-head { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }
  .hl-fm-head .hl-event-text { flex: 1 1 320px; }
  .hl-fm-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; padding: .9rem 1.3rem; font-family: var(--f-display); font-weight: 900; text-transform: uppercase; letter-spacing: .03em; font-size: 1.1rem; color: var(--void); background: var(--aurora); white-space: nowrap; transition: transform .15s; }
  .hl-fm-btn:hover { transform: translateY(-1px); }
  .hl-fm-btn:disabled { opacity: .7; transform: none; }
  .hl-fm-form { display: grid; gap: .9rem; margin-top: 1.4rem; padding-top: 1.4rem; border-top: 1px solid var(--line); }
  .hl-fm-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
  .hl-fm-label { display: block; font-family: var(--f-mono); font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--bone-dim); margin-bottom: .4rem; }
  .hl-fm-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
  .hl-fm-cancel { font-size: .88rem; color: var(--bone-dim); text-decoration: underline; text-underline-offset: 3px; }
  .hl-fm-cancel:hover { color: var(--bone); }
  .hl-fm-done { display: grid; gap: 1.3rem; margin-top: 1.4rem; padding-top: 1.4rem; border-top: 1px solid var(--line); }
  .hl-fm-done-head { display: flex; gap: .9rem; align-items: flex-start; }
  .hl-fm-next { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .hl-fm-next > div { padding: 1rem; background: var(--void); border: 1px solid var(--line); }
  .hl-fm-row { display: flex; flex-wrap: wrap; gap: .5rem; }
  .hl .rounded-xl { border-radius: 0; }
  @media (max-width: 640px) { .hl-fm-fields, .hl-fm-next { grid-template-columns: minmax(0, 1fr); } .hl-fm-btn { width: 100%; } }
  @media (max-width: 900px) {
    .hl-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hl-step:nth-child(3) { padding-left: 0; border-left: 0; }
    .hl-cosign { grid-template-columns: minmax(0, 1fr); gap: 2rem; }
  }
  @media (max-width: 640px) {
    .hl-hero { padding: 3rem 0 3.5rem; }
    .hl-section { padding: 4rem 0; }
    .hl-compare, .hl-steps { grid-template-columns: minmax(0, 1fr); }
    .hl-step, .hl-step + .hl-step { padding-left: 0; border-left: 0; border-bottom: 1px solid var(--line-2); }
    .hl-acc-body { padding-left: .25rem; }
    .hl-event { flex-wrap: wrap; }
  }
  @media (prefers-reduced-motion: reduce) { .hl-dial, .hl-cursor { animation: none; } }
  `}</style>
);
