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

      {/* 1 — HERO */}
      <section className="hl-hero">
        <div className="hl-wrap hl-center">
          {PiEmblem && <div className="hl-emblem"><PiEmblem /></div>}
          <div className="hl-pill"><span className="hl-dot" /> <E p="home2" k="eyebrow" as="span">An open-source upgrade for society</E></div>
          <h1 className="hl-h1 font-display">
            <E p="home2" k="h1_a" as="span" className="hl-h1-small">To the Startup Nation in every nation:</E>
            <E p="home2" k="h1v3_a" as="span">Together we built the internet. Join to build the </E><E p="home2" k="h1v3_b" as="span" className="hl-gold" style={{ whiteSpace: 'nowrap' }}>Open-Regulatory OS</E><E p="home2" k="h1v3_c" as="span"> to reinvent it.</E>
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
      </section>

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
                  <div className="hl-step-top"><span className="hl-step-icon"><Icon size={20} /></span><span className="hl-mono">0{i + 1}</span></div>
                  <E p="home2" k={'step_' + s.k + '_t'} as="div" className="font-display hl-step-t">{s.t}</E>
                  <E p="home2" k={'step_' + s.k + '_d'} as="p" className="hl-step-d">{s.d}</E>
                </li>
              );
            })}
          </ol>
          {single ? <BackBtn className="hl-mt" /> : <button type="button" onClick={onOpenAgent} className="btn-secondary hl-mt"><Mic size={15} /> <E p="home2" k="rule_cta" as="span">Tell Pi what you think</E></button>}
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
  .hl { --hl-gold: var(--gold); }
  .hl-wrap { max-width: 1120px; margin: 0 auto; padding-inline: 1.5rem; }
  .hl-narrow { max-width: 820px; }
  .hl-center { text-align: center; }
  .hl-gold { color: var(--gold); }
  .hl-mono { font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--bone-dim); }
  .hl-emblem { margin: -1.5rem auto .5rem; }
  .hl-emblem .v3-emblem-wrap { width: min(300px, 64vw); }
  .hl-emblem .v3-tag { font-size: .55rem; }
  @media (max-width: 640px) { .hl-emblem .v3-tag { display: none; } }
  .hl-hero { padding: 6.5rem 0 5rem; background: radial-gradient(60% 70% at 50% 0%, rgba(232,177,79,.14), transparent 70%); }
  .hl-pill { display: inline-flex; align-items: center; gap: .5rem; padding: .4rem .9rem; border-radius: 999px; border: 1px solid var(--line-2); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--bone-dim); }
  .hl-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 12px var(--gold); }
  .hl-h1 { font-size: clamp(2.4rem, 6vw, 4.6rem); line-height: 1.04; margin: 1.6rem auto 0; max-width: 20ch; text-wrap: balance; }
  .hl-h1-small { display: block; font-size: .42em; line-height: 1.3; color: var(--bone-dim); font-style: italic; margin-bottom: .6rem; }
  .hl-sub { color: var(--bone-dim); font-size: 1.15rem; line-height: 1.6; max-width: 38rem; margin: 1.5rem auto 0; }
  .hl-ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: 2.25rem; }
  .hl-proof { margin-top: 1.75rem; font-size: .9rem; color: var(--bone-dim); }
  .hl-proof b { color: var(--bone); font-variant-numeric: tabular-nums; }
  .hl-section { padding: 5.5rem 0; }
  .hl-alt { background: var(--void-2); border-block: 1px solid var(--line); }
  .hl-label { font-size: .7rem; letter-spacing: .25em; text-transform: uppercase; color: var(--gold); margin-bottom: .9rem; }
  .hl-h2 { font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.1; max-width: 24ch; text-wrap: balance; }
  .hl-h3 { font-size: 1.6rem; line-height: 1.2; }
  .hl-lede { color: var(--bone-dim); font-size: 1.1rem; margin-top: .9rem; max-width: 40rem; line-height: 1.6; }
  .hl-compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 2.5rem; }
  .hl-card { padding: 1.6rem; border-radius: 1.25rem; border: 1px solid var(--line); background: var(--void-2); min-width: 0; }
  .hl-card-top { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
  .hl-tag { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; padding: .25rem .6rem; border-radius: 999px; }
  .hl-tag-bad { color: #F08A7A; background: rgba(240,138,122,.12); }
  .hl-tag-good { color: var(--gold); background: rgba(232,177,79,.14); }
  .hl-card-h { font-size: 1.35rem; margin-top: 1.1rem; }
  .hl-card ul { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: .55rem; }
  .hl-card li { display: flex; align-items: center; gap: .6rem; color: var(--bone); font-size: .95rem; }
  .hl-legacy li { color: var(--bone-dim); }
  .hl-legacy li svg { color: #F08A7A; flex-shrink: 0; }
  .hl-human { border-color: rgba(232,177,79,.45); background: linear-gradient(160deg, rgba(232,177,79,.10), transparent 60%), var(--void-2); }
  .hl-human li svg { color: var(--gold); flex-shrink: 0; }
  .hl-code { margin-top: 1.4rem; padding: .7rem .9rem; border-radius: .7rem; background: var(--void); font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .85rem; color: var(--bone-dim); }
  .hl-code em { font-style: normal; color: #F08A7A; }
  .hl-code em.hl-gold { color: var(--gold); }
  .hl-prime { margin-top: 2rem; padding: 1.3rem 1.4rem; border-radius: 1rem; border: 1px solid rgba(232,177,79,.45); background: linear-gradient(160deg, rgba(232,177,79,.08), transparent 70%); }
  .hl-prime-name { font-size: 1.5rem; margin-top: .3rem; }
  .hl-prime p { color: var(--bone-dim); margin-top: .35rem; line-height: 1.55; }
  .hl-acc { margin-top: 1rem; border-top: 1px solid var(--line); }
  .hl-acc-row { border-bottom: 1px solid var(--line); }
  .hl-acc-head { width: 100%; display: flex; align-items: center; gap: 1rem; padding: 1.05rem .25rem; text-align: left; }
  .hl-acc-n { flex-shrink: 0; width: 3rem; color: var(--gold); }
  .hl-acc-title { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: .2rem .8rem; }
  .hl-acc-title .font-display { font-size: 1.25rem; color: var(--bone); }
  .hl-acc-line { font-size: .92rem; color: var(--bone-dim); }
  .hl-acc-chev { flex-shrink: 0; color: var(--bone-dim); transition: transform .2s; }
  .hl-acc-row.open .hl-acc-chev { transform: rotate(180deg); color: var(--gold); }
  .hl-acc-head:hover .hl-acc-title .font-display { color: var(--gold); }
  .hl-acc-body { padding: 0 .25rem 1.2rem 4.25rem; color: var(--bone-dim); line-height: 1.6; display: grid; gap: .6rem; }
  .hl-link { display: inline-flex; align-items: center; gap: .35rem; margin-top: 1.5rem; color: var(--gold); font-size: .92rem; }
  .hl-steps { list-style: none; padding: 0; margin: 2.5rem 0 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; counter-reset: s; }
  .hl-step { position: relative; padding: 1.4rem; border-radius: 1.1rem; border: 1px solid var(--line); background: var(--void-2); min-width: 0; }
  .hl-step:not(:last-child)::after { content: ''; position: absolute; top: 2.35rem; right: -0.9rem; width: .8rem; height: 1px; background: var(--line-2); }
  .hl-step-top { display: flex; justify-content: space-between; align-items: center; }
  .hl-step-icon { width: 2.6rem; height: 2.6rem; border-radius: .8rem; display: inline-flex; align-items: center; justify-content: center; color: var(--gold); background: rgba(232,177,79,.12); flex-shrink: 0; }
  .hl-step-t { font-size: 1.35rem; margin-top: 1rem; }
  .hl-step-d { color: var(--bone-dim); font-size: .92rem; line-height: 1.55; margin-top: .35rem; }
  .hl-mt { margin-top: 2rem; }
  .hl-cosign { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 420px); gap: 3rem; align-items: start; }
  .hl-sticker { display: flex; gap: 1.1rem; align-items: center; margin-top: 2rem; padding: 1.1rem; border-radius: 1rem; border: 1px dashed var(--line-2); }
  .hl-sticker-art { position: relative; flex-shrink: 0; width: 92px; height: 92px; border-radius: 50%; background: radial-gradient(circle, #1A2A48, var(--void)); border: 3px solid var(--gold); display: flex; align-items: center; justify-content: center; overflow: hidden; transform: rotate(-8deg); }
  .hl-sticker-art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; mix-blend-mode: screen; }
  .hl-sticker-art span { position: relative; font-weight: 800; font-size: .72rem; line-height: 1.05; letter-spacing: .08em; color: var(--gold); text-align: center; }
  .hl-form { display: grid; gap: .8rem; padding: 1.6rem; border-radius: 1.25rem; background: var(--void); border: 1px solid rgba(232,177,79,.45); box-shadow: 0 24px 60px -30px rgba(232,177,79,.35); }
  .hl-check { display: flex; gap: .55rem; align-items: flex-start; font-size: .88rem; color: var(--bone); cursor: pointer; }
  .hl-check input { margin-top: .25rem; }
  .hl-check em { color: var(--bone-dim); font-style: normal; }
  .hl-error { font-size: .88rem; color: var(--terra); }
  .hl-fine { font-size: .75rem; color: var(--bone-dim); }
  .hl-done { text-align: center; justify-items: center; }
  .hl-done p { color: var(--bone-dim); }
  .hl-event { width: 100%; display: flex; align-items: center; gap: 1.2rem; padding: 1.4rem 1.6rem; border-radius: 1.25rem; border: 1px solid var(--line-2); background: var(--void-2); text-align: left; transition: border-color .2s; }
  .hl-event:hover { border-color: var(--gold); }
  .hl-event-text { flex: 1; min-width: 0; display: grid; gap: .2rem; }
  .hl-event-t { font-size: 1.5rem; color: var(--bone); }
  .hl-event-cta { display: inline-flex; align-items: center; gap: .3rem; color: var(--gold); white-space: nowrap; font-size: .95rem; }
  .hl-fm { padding: 1.6rem; border-radius: 1.25rem; border: 1px solid rgba(91,233,221,.35); background: linear-gradient(160deg, rgba(91,233,221,.08), transparent 60%), var(--void-2); scroll-margin-top: 120px; }
  .hl-fm-head { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }
  .hl-fm-head .hl-event-text { flex: 1 1 320px; }
  .hl-fm-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; padding: .85rem 1.3rem; border-radius: 999px; font-weight: 700; font-size: .95rem; color: var(--void); background: var(--aurora); box-shadow: 0 10px 30px -12px rgba(91,233,221,.7); white-space: nowrap; transition: transform .15s, box-shadow .15s; }
  .hl-fm-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 34px -12px rgba(91,233,221,.85); }
  .hl-fm-btn:disabled { opacity: .7; transform: none; }
  .hl-fm-form { display: grid; gap: .9rem; margin-top: 1.4rem; padding-top: 1.4rem; border-top: 1px solid var(--line); }
  .hl-fm-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
  .hl-fm-label { display: block; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--bone-dim); margin-bottom: .4rem; }
  .hl-fm-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
  .hl-fm-cancel { font-size: .88rem; color: var(--bone-dim); text-decoration: underline; text-underline-offset: 3px; }
  .hl-fm-cancel:hover { color: var(--bone); }
  .hl-fm-done { display: grid; gap: 1.3rem; margin-top: 1.4rem; padding-top: 1.4rem; border-top: 1px solid var(--line); }
  .hl-fm-done-head { display: flex; gap: .9rem; align-items: flex-start; }
  .hl-fm-next { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .hl-fm-next > div { padding: 1rem; border-radius: 1rem; background: var(--void); border: 1px solid var(--line); }
  .hl-fm-row { display: flex; flex-wrap: wrap; gap: .5rem; }
  @media (max-width: 640px) { .hl-fm-fields, .hl-fm-next { grid-template-columns: minmax(0, 1fr); } .hl-fm-btn { width: 100%; } }
  @media (max-width: 900px) {
    .hl-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hl-step::after { display: none; }
    .hl-cosign { grid-template-columns: minmax(0, 1fr); gap: 2rem; }
  }
  @media (max-width: 640px) {
    .hl-hero { padding: 4.5rem 0 3.5rem; }
    .hl-section { padding: 4rem 0; }
    .hl-compare, .hl-steps { grid-template-columns: minmax(0, 1fr); }
    .hl-acc-body { padding-left: .25rem; }
    .hl-event { flex-wrap: wrap; }
  }
  `}</style>
);
