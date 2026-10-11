// ============================================================
// QUEST OS · aspirational preview (landing mode)
// A bounty-style crowdfunding dashboard for the Utopia Build:
// left navigation, open quests in the centre, and a detail view per quest
// with a news channel and community tab.
//
// HONESTY RULE: this is a preview. Figures are demo figures, nothing can be
// pledged here, and "Back this quest" stays disabled until the next launch.
// The only live funding action is the Founders Series (page 'back').
// Live quests come from GET /api/quests; EXTRA_QUESTS are illustrative.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react';
import {
  Trophy, Rocket, HandCoins, Search, Users, Clock, ArrowLeft, ArrowRight, Radio,
  MessageCircle, Sparkles, Layers, Globe, BookOpen, ShieldCheck, Cpu, Lock, Flame, CheckCircle
} from 'lucide-react';

const TYPES = {
  prize: { label: 'Prize quest', icon: Trophy, hue: '#FFD60A' },
  startup: { label: 'Startup quest', icon: Rocket, hue: '#5BE9DD' },
  crowd: { label: 'Crowd campaign', icon: HandCoins, hue: '#C97B5B' },
};

const AREAS = [
  { id: 'os', label: 'The OS', icon: Cpu },
  { id: 'rights', label: 'Rights & identity', icon: ShieldCheck },
  { id: 'planet', label: 'Planet', icon: Globe },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
];
const TAG_AREA = { OS: 'os', 'Startup funding': 'os', Agents: 'rights', Privacy: 'rights', Identity: 'rights', Climate: 'planet', Materials: 'planet', Water: 'planet', Education: 'knowledge', 'Open source': 'knowledge' };
const areaOf = (q) => q.area || TAG_AREA[(q.tags || []).find(t => TAG_AREA[t])] || 'os';

// Used when the API is unreachable (e.g. preview deployments without a database).
const FALLBACK_QUESTS = [
  { id: 'first-os-moment', title: 'Humanity’s first OS moment: the proof of concept', type: 'startup', goal: null, raised: 0, backers: 0, deadline: null, tags: ['OS', 'Startup funding'], sponsor: 'Founders Series backers', bounty: 'Pool opens at goal', summary: 'Winning teams build the first working proof of the Constitutional OS with their winnings, then the full solution they pitched.', pledges: ['I.01', 'I.02', 'I.09', 'I.12'], tranches: [{ name: 'Award', pct: 40 }, { name: 'Proof of concept', pct: 30 }, { name: 'Solution milestones', pct: 30 }], teams: 0 },
  { id: 'civic-ai-literacy', title: 'Open civic-AI literacy curriculum', type: 'crowd', goal: 15000, raised: 3900, backers: 64, deadline: '2026-11-10', tags: ['Education', 'Open source'], sponsor: 'Community campaign', summary: 'Plain-language, open curricula so people can audit the models that govern them.', pledges: ['I.04', 'I.07'], tranches: [{ name: 'Goal met', pct: 40 }, { name: 'Milestone 1', pct: 30 }, { name: 'Delivery', pct: 30 }], teams: 0 },
  { id: 'plastic-to-fuel', title: 'Turn ocean plastic into clean fuel', type: 'prize', goal: 25000, raised: 15500, backers: 31, deadline: '2026-11-15', tags: ['Climate', 'Materials'], sponsor: 'Founding sponsors', summary: 'A scalable, low-energy process to convert mixed ocean plastics into usable fuel.', pledges: ['I.11', 'I.09'], tranches: [{ name: 'Award', pct: 50 }, { name: 'Proof of concept', pct: 30 }, { name: 'Solution', pct: 20 }], teams: 1 },
  { id: 'consent-handshake', title: 'A consent layer every AI must ask through', type: 'prize', goal: 8000, raised: 8000, backers: 12, deadline: '2026-10-31', tags: ['Agents', 'Privacy'], sponsor: 'Founding sponsors', summary: 'Design the handshake where your digital self grants or denies an AI access, on your terms.', pledges: ['I.02', 'I.03'], tranches: [{ name: 'Award', pct: 50 }, { name: 'Proof of concept', pct: 30 }, { name: 'Solution', pct: 20 }], teams: 0 },
  { id: 'prove-human', title: 'Prove you’re a living human, without surveillance', type: 'startup', goal: 12000, raised: 4200, backers: 18, deadline: '2026-12-15', tags: ['Identity'], sponsor: 'Founding sponsors', summary: 'A privacy-preserving way to prove personhood, for one human, one voice.', pledges: ['I.01', 'I.02'], tranches: [{ name: 'Award', pct: 40 }, { name: 'Proof of concept', pct: 30 }, { name: 'Solution milestones', pct: 30 }], teams: 0 },
];

// Illustrative quests that show the breadth of the Utopia Build.
const EXTRA_QUESTS = [
  { id: 'agent-for-everyone', title: 'A personal agent for every person on Earth', type: 'startup', goal: 50000, raised: 21800, backers: 412, deadline: '2027-01-31', tags: ['Agents', 'Open source'], area: 'rights', sponsor: 'The crowd', summary: 'An open-source personal agent that answers only to its owner, runs on a basic phone, and speaks 100 languages.', pledges: ['I.01', 'I.05'], tranches: [{ name: 'Award', pct: 40 }, { name: 'Pilot in 3 countries', pct: 30 }, { name: 'Global release', pct: 30 }], teams: 6 },
  { id: 'clean-water-sensors', title: 'Open water-quality sensors for every village', type: 'crowd', goal: 20000, raised: 17350, backers: 288, deadline: '2026-11-30', tags: ['Water', 'Open source'], area: 'planet', sponsor: 'Community campaign', summary: 'A $10 open sensor kit that tests drinking water and publishes results to a public map.', pledges: ['I.11'], tranches: [{ name: 'Goal met', pct: 40 }, { name: 'First 1,000 kits', pct: 30 }, { name: 'Open map live', pct: 30 }], teams: 3 },
  { id: 'ledger-of-credit', title: 'The ledger that credits every idea forever', type: 'prize', goal: 30000, raised: 9600, backers: 97, deadline: '2027-02-28', tags: ['OS'], area: 'os', sponsor: 'Founding sponsors', summary: 'Design the attribution ledger that records who contributed what, human or agent, and routes value back to them.', pledges: ['I.09', 'I.12'], tranches: [{ name: 'Award', pct: 50 }, { name: 'Proof of concept', pct: 30 }, { name: 'Solution', pct: 20 }], teams: 2 },
];

// News channel posts per quest (illustrative). Agent posts are always tagged as SI.
const NEWS = {
  'consent-handshake': [
    { by: 'Uto-Pi', agent: true, when: '2 hours ago', kind: 'Milestone', title: 'Fully funded', body: 'The prize pool reached its goal. Teams can register their approach until 31 October.' },
    { by: 'Quest sponsor', when: '3 days ago', kind: 'Update', title: 'Judging criteria published', body: 'Entries are scored on user control, simplicity and how well they respect pledges I.02 and I.03.' },
  ],
  'plastic-to-fuel': [
    { by: 'Team Tidewater', when: 'Yesterday', kind: 'Team', title: 'First team registered', body: 'A materials lab from the coast joins the quest with a low-heat catalytic process.' },
    { by: 'Uto-Pi', agent: true, when: '4 days ago', kind: 'Milestone', title: '60% funded', body: '31 backers have pledged so far. The award tranche unlocks when the goal is met.' },
  ],
  'agent-for-everyone': [
    { by: 'Uto-Pi', agent: true, when: '1 hour ago', kind: 'Milestone', title: '400 backers', body: 'This is the most-backed quest of the Utopia Build so far.' },
    { by: 'Builders’ circle', when: '2 days ago', kind: 'Community', title: 'Language volunteers wanted', body: 'Native speakers can help test the agent in their language.' },
  ],
};
const defaultNews = (q) => [
  { by: 'Uto-Pi', agent: true, when: 'This week', kind: 'Update', title: 'Quest opened', body: 'Ask questions in the community tab. Pledging opens with the next launch.' },
  { by: q.sponsor || 'Quest sponsor', when: 'This week', kind: 'Update', title: 'Brief published', body: q.summary },
];

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
const pct = (q) => (q.goal ? Math.min(100, Math.round(((q.raised || 0) / q.goal) * 100)) : 0);
const daysLeft = (q) => {
  if (!q.deadline) return null;
  const d = Math.ceil((new Date(q.deadline + 'T23:59:59') - new Date()) / 86400000);
  return d < 0 ? 0 : d;
};

const Ring = ({ value, size = 54, hue }) => {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={hue} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="var(--bone)" fontSize="12" fontWeight="600">{value}%</text>
    </svg>
  );
};

const Tranches = ({ q, unlocked }) => (
  <div className="qd-tranches" aria-label="Money unlocks in milestones">
    {(q.tranches || []).map((t, i) => (
      <div key={t.name} style={{ flex: t.pct }}>
        <div className={'qd-tr-bar' + (i < unlocked ? ' on' : '')} />
        <div className="qd-tr-label">{t.name} · {t.pct}%</div>
      </div>
    ))}
  </div>
);

const QuestCard = ({ q, onOpen }) => {
  const T = TYPES[q.type] || TYPES.prize; const Icon = T.icon; const p = pct(q); const d = daysLeft(q);
  const hot = q.goal && p >= 60 && p < 100;
  return (
    <button type="button" className="qd-card" onClick={() => onOpen(q)} style={{ '--hue': T.hue }}>
      <div className="qd-card-top">
        <span className="qd-type"><Icon size={13} /> {T.label}</span>
        {p >= 100 ? <span className="qd-flag ok"><CheckCircle size={12} /> Funded</span> : hot ? <span className="qd-flag hot"><Flame size={12} /> Trending</span> : null}
      </div>
      <div className="qd-card-title">{q.title}</div>
      <p className="qd-card-sum">{q.summary}</p>
      <div className="qd-card-fund">
        {q.goal ? <Ring value={p} hue={T.hue} /> : <span className="qd-ring-empty"><Lock size={16} /></span>}
        <div className="qd-card-nums">
          <div className="qd-big">{q.goal ? money(q.raised) : 'Pool opens'}</div>
          <div className="qd-dim">{q.goal ? 'of ' + money(q.goal) : 'at the Founders Series goal'}</div>
        </div>
      </div>
      <div className="qd-card-meta">
        <span><Users size={13} /> {q.backers || 0} backers</span>
        <span><Layers size={13} /> {q.teams || 0} teams</span>
        <span><Clock size={13} /> {d === null ? 'Open' : d + ' days'}</span>
      </div>
      <span className="qd-open">Open quest <ArrowRight size={14} /></span>
    </button>
  );
};

const QuestDetail = ({ q, onBack, setPage, onAsk }) => {
  const [tab, setTab] = useState('news');
  const T = TYPES[q.type] || TYPES.prize; const Icon = T.icon; const p = pct(q); const d = daysLeft(q);
  const news = NEWS[q.id] || defaultNews(q);
  const unlocked = p >= 100 ? 1 : 0;
  return (
    <div className="qd-detail" style={{ '--hue': T.hue }}>
      <button type="button" className="qd-back" onClick={onBack}><ArrowLeft size={15} /> All quests</button>
      <div className="qd-detail-head">
        <div className="min-w-0">
          <span className="qd-type"><Icon size={13} /> {T.label} · {q.sponsor}</span>
          <h2 className="font-display qd-detail-title">{q.title}</h2>
          <p className="qd-card-sum" style={{ WebkitLineClamp: 'unset' }}>{q.summary}</p>
          <div className="qd-pledges">{(q.pledges || []).map(x => <span key={x}>Pledge {x}</span>)}</div>
        </div>
        <div className="qd-fundbox">
          <div className="qd-big" style={{ fontSize: '1.9rem' }}>{q.goal ? money(q.raised) : 'Pool opens'}</div>
          <div className="qd-dim">{q.goal ? 'raised of ' + money(q.goal) + ' goal' : 'when the Founders Series goal is met'}</div>
          <div className="qd-bar"><span style={{ width: (q.goal ? p : 4) + '%' }} /></div>
          <div className="qd-fund-stats">
            <div><b>{q.backers || 0}</b><span>backers</span></div>
            <div><b>{q.teams || 0}</b><span>teams</span></div>
            <div><b>{d === null ? '–' : d}</b><span>days left</span></div>
          </div>
          <button type="button" className="qd-pledge" disabled title="Pledging opens with the next launch">Back this quest · next launch</button>
          <button type="button" className="qd-founders" onClick={() => setPage('back')}>Back the Founders Series now <ArrowRight size={14} /></button>
        </div>
      </div>

      <div className="qd-section-label">Money unlocks in milestones, never all at once</div>
      <Tranches q={q} unlocked={unlocked} />

      <div className="qd-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'news'} className={tab === 'news' ? 'on' : ''} onClick={() => setTab('news')}><Radio size={14} /> News channel</button>
        <button type="button" role="tab" aria-selected={tab === 'community'} className={tab === 'community' ? 'on' : ''} onClick={() => setTab('community')}><MessageCircle size={14} /> Community</button>
      </div>

      {tab === 'news' && (
        <ol className="qd-news">
          {news.map((n, i) => (
            <li key={i}>
              <span className={'qd-avatar' + (n.agent ? ' agent' : '')}>{n.agent ? <img src="/pi/pi-face.webp" alt="" /> : (n.by || '?').slice(0, 1)}</span>
              <div className="min-w-0">
                <div className="qd-news-meta">
                  <b>{n.by}</b>{n.agent && <span className="qd-si">SI agent · never human</span>}<span>{n.when}</span><span className="qd-kind">{n.kind}</span>
                </div>
                <div className="qd-news-title">{n.title}</div>
                <p>{n.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {tab === 'community' && (
        <div className="qd-community">
          <div className="qd-com-card">
            <MessageCircle size={20} />
            <div className="min-w-0">
              <div className="qd-news-title">Quest community</div>
              <p>Talk with backers, teams and the sponsor. Every quest gets its own channel when quests open.</p>
              {q.community_url
                ? <a className="qd-founders" href={q.community_url} target="_blank" rel="noreferrer">Join the community <ArrowRight size={14} /></a>
                : <>
                    <span className="qd-soon">Quest channels open with the next launch</span>
                    <div><a className="qd-founders" href="https://www.linkedin.com/company/humanity-ai" target="_blank" rel="noreferrer">Follow Humanity-AI on LinkedIn <ArrowRight size={14} /></a></div>
                  </>}
            </div>
          </div>
          <div className="qd-com-card">
            <Sparkles size={20} />
            <div className="min-w-0">
              <div className="qd-news-title">Ask Pi about this quest</div>
              <p>Uto-Pi can explain the brief, the pledges it serves and how teams are judged.</p>
              <button type="button" className="qd-founders" onClick={() => onAsk && onAsk('Tell me about the quest "' + q.title + '" and which pledges it serves.')}>Ask Pi <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function QuestDashboard({ setPage, onAsk }) {
  const [apiQuests, setApiQuests] = useState(null);
  const [view, setView] = useState('all');   // all | prize | startup | crowd | area:<id> | funded
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('funded');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let live = true;
    fetch('/api/quests').then(r => r.json()).then(d => { if (live) setApiQuests(Array.isArray(d.quests) && d.quests.length ? d.quests : FALLBACK_QUESTS); })
      .catch(() => { if (live) setApiQuests(FALLBACK_QUESTS); });
    return () => { live = false; };
  }, []);

  const quests = useMemo(() => {
    const base = apiQuests || FALLBACK_QUESTS;
    const ids = new Set(base.map(q => q.id));
    return [...base, ...EXTRA_QUESTS.filter(q => !ids.has(q.id))];
  }, [apiQuests]);

  const count = (fn) => quests.filter(fn).length;
  const shown = useMemo(() => {
    let list = quests.filter(q => {
      if (view === 'funded') return q.goal && pct(q) >= 100;
      if (view.startsWith('area:')) return areaOf(q) === view.slice(5);
      if (view !== 'all') return q.type === view;
      return true;
    });
    if (query.trim()) {
      const s = query.trim().toLowerCase();
      list = list.filter(q => (q.title + ' ' + q.summary + ' ' + (q.tags || []).join(' ')).toLowerCase().includes(s));
    }
    const by = {
      funded: (a, b) => pct(b) - pct(a),
      backers: (a, b) => (b.backers || 0) - (a.backers || 0),
      ending: (a, b) => (daysLeft(a) ?? 9999) - (daysLeft(b) ?? 9999),
    }[sort];
    return [...list].sort(by);
  }, [quests, view, query, sort]);

  const totals = useMemo(() => ({
    raised: quests.reduce((s, q) => s + (q.raised || 0), 0),
    goal: quests.reduce((s, q) => s + (q.goal || 0), 0),
    backers: quests.reduce((s, q) => s + (q.backers || 0), 0),
    teams: quests.reduce((s, q) => s + (q.teams || 0), 0),
  }), [quests]);

  const navBtn = (id, label, Icon, n) => (
    <button key={id} type="button" className={'qd-nav-item' + (view === id ? ' on' : '')} onClick={() => { setView(id); setOpen(null); }}>
      <Icon size={15} /><span>{label}</span><em>{n}</em>
    </button>
  );

  return (
    <div className="qd page-enter">
      <QuestStyles />
      <header className="qd-hero">
        <div className="qd-eyebrow"><span className="qd-live-dot" /> Quest OS · preview · coming in next launch</div>
        <h1 className="font-display qd-h1">Fund the Utopia Build.</h1>
        <p className="qd-lede">No VC. For the people, by the people. Every part of the build is a quest: the crowd funds a bounty, builders and their agents compete, and money unlocks milestone by milestone.</p>
        <div className="qd-kpis">
          <div><b>{money(totals.raised)}</b><span>pledged across quests</span></div>
          <div><b>{totals.backers.toLocaleString('en-US')}</b><span>backers</span></div>
          <div><b>{quests.length}</b><span>open quests</span></div>
          <div><b>0%</b><span>to venture capital</span></div>
        </div>
      </header>

      <div className="qd-shell">
        <aside className="qd-side" aria-label="Quest navigation">
          <div className="qd-side-group">
            <div className="qd-side-label">Explore</div>
            {navBtn('all', 'All quests', Layers, quests.length)}
            {navBtn('prize', 'Prize quests', Trophy, count(q => q.type === 'prize'))}
            {navBtn('startup', 'Startup quests', Rocket, count(q => q.type === 'startup'))}
            {navBtn('crowd', 'Crowd campaigns', HandCoins, count(q => q.type === 'crowd'))}
            {navBtn('funded', 'Fully funded', CheckCircle, count(q => q.goal && pct(q) >= 100))}
          </div>
          <div className="qd-side-group">
            <div className="qd-side-label">The Utopia Build</div>
            {AREAS.map(a => navBtn('area:' + a.id, a.label, a.icon, count(q => areaOf(q) === a.id)))}
          </div>
          <div className="qd-side-group">
            <div className="qd-side-label">You</div>
            <div className="qd-nav-item disabled"><Lock size={15} /><span>Quests I back</span><em>soon</em></div>
            <div className="qd-nav-item disabled"><Lock size={15} /><span>My teams</span><em>soon</em></div>
          </div>
          <div className="qd-side-fund">
            <div className="qd-side-label" style={{ margin: 0 }}>Live now</div>
            <div className="qd-news-title" style={{ marginTop: '.4rem' }}>Founders Series</div>
            <p>The one funding round open today. It unlocks every quest above.</p>
            <button type="button" className="qd-founders" onClick={() => setPage('back')}>Back it <ArrowRight size={14} /></button>
          </div>
        </aside>

        <main className="qd-main">
          {open ? (
            <QuestDetail q={open} onBack={() => setOpen(null)} setPage={setPage} onAsk={onAsk} />
          ) : (
            <>
              <div className="qd-toolbar">
                <label className="qd-search">
                  <Search size={15} />
                  <span className="sr-only">Search quests</span>
                  <input id="qd-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search quests, pledges, places" />
                </label>
                <div className="qd-sort" role="group" aria-label="Sort quests">
                  {[['funded', 'Most funded'], ['backers', 'Most backers'], ['ending', 'Ending soon']].map(([id, label]) => (
                    <button key={id} type="button" className={sort === id ? 'on' : ''} onClick={() => setSort(id)}>{label}</button>
                  ))}
                </div>
              </div>
              {shown.length ? (
                <div className="qd-grid">{shown.map(q => <QuestCard key={q.id} q={q} onOpen={setOpen} />)}</div>
              ) : (
                <div className="qd-empty">No quests match. Try another search or section.</div>
              )}
              <p className="qd-note">Preview with demo figures. Pledging, teams and payouts open with the next launch.</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const QuestStyles = () => (
  <style>{`
  .qd { max-width: 1320px; margin: 0 auto; padding: 5rem 1.5rem 5rem; }
  .qd-hero { position: relative; padding: 2.25rem; border-radius: 1.5rem; overflow: hidden;
    background: radial-gradient(120% 140% at 0% 0%, rgba(91,233,221,.16), transparent 55%), radial-gradient(90% 120% at 100% 0%, rgba(255,214,10,.14), transparent 60%), var(--void-2);
    border: 1px solid var(--line-2); }
  .qd-eyebrow { display: inline-flex; align-items: center; gap: .5rem; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); }
  .qd-live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--aurora); box-shadow: 0 0 0 0 rgba(91,233,221,.6); animation: qdPulse 2s infinite; }
  @keyframes qdPulse { 0% { box-shadow: 0 0 0 0 rgba(91,233,221,.55); } 70% { box-shadow: 0 0 0 10px rgba(91,233,221,0); } 100% { box-shadow: 0 0 0 0 rgba(91,233,221,0); } }
  .qd-h1 { font-size: clamp(2.3rem, 5vw, 4rem); line-height: 1.02; margin-top: .75rem; text-wrap: balance; }
  .qd-lede { color: var(--bone-dim); max-width: 46rem; margin-top: .9rem; font-size: 1.08rem; line-height: 1.6; }
  .qd-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin-top: 1.75rem; }
  .qd-kpis > div { padding: .9rem 1rem; border-radius: 1rem; background: rgba(7,16,31,.55); border: 1px solid var(--line); }
  .qd-kpis b { display: block; font-family: 'Fraunces', Georgia, serif; font-size: 1.5rem; font-variant-numeric: tabular-nums; color: var(--bone); }
  .qd-kpis span { font-size: .75rem; color: var(--bone-dim); }
  .qd-shell { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 1.5rem; margin-top: 1.5rem; align-items: start; }
  .qd-side { position: sticky; top: 7.5rem; display: flex; flex-direction: column; gap: 1.25rem; padding: 1rem; border-radius: 1.25rem; background: var(--void-2); border: 1px solid var(--line); }
  .qd-side-label { font-size: .65rem; letter-spacing: .22em; text-transform: uppercase; color: var(--bone-dim); margin: 0 .5rem .4rem; }
  .qd-side-group { display: flex; flex-direction: column; gap: 2px; }
  .qd-nav-item { display: flex; align-items: center; gap: .6rem; width: 100%; padding: .55rem .6rem; border-radius: .7rem; font-size: .88rem; color: var(--bone-dim); text-align: left; transition: background .15s, color .15s; }
  .qd-nav-item span { flex: 1; min-width: 0; }
  .qd-nav-item em { font-style: normal; font-size: .72rem; padding: .05rem .45rem; border-radius: 999px; background: rgba(255,255,255,.05); font-variant-numeric: tabular-nums; }
  .qd-nav-item:hover { background: rgba(91,233,221,.07); color: var(--bone); }
  .qd-nav-item.on { background: rgba(91,233,221,.12); color: var(--aurora); }
  .qd-nav-item.disabled { opacity: .5; cursor: default; }
  .qd-nav-item.disabled:hover { background: none; color: var(--bone-dim); }
  .qd-side-fund { padding: .9rem; border-radius: 1rem; border: 1px solid rgba(255,214,10,.35); background: linear-gradient(160deg, rgba(255,214,10,.10), transparent 70%); }
  .qd-side-fund p { font-size: .8rem; color: var(--bone-dim); margin: .25rem 0 .75rem; line-height: 1.45; }
  .qd-main { min-width: 0; }
  .qd-toolbar { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .qd-search { flex: 1 1 260px; display: flex; align-items: center; gap: .5rem; padding: .65rem .9rem; border-radius: .9rem; background: var(--void-2); border: 1px solid var(--line-2); color: var(--bone-dim); }
  .qd-search input { flex: 1; min-width: 0; background: transparent; outline: none; color: var(--bone); font-size: .9rem; }
  .qd-sort { display: flex; gap: .25rem; padding: .25rem; border-radius: .9rem; background: var(--void-2); border: 1px solid var(--line); }
  .qd-sort button { padding: .45rem .8rem; border-radius: .65rem; font-size: .8rem; color: var(--bone-dim); white-space: nowrap; }
  .qd-sort button.on { background: rgba(91,233,221,.14); color: var(--aurora); }
  .qd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .qd-card { position: relative; display: flex; flex-direction: column; text-align: left; padding: 1.25rem; border-radius: 1.25rem; min-width: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.01)), var(--void-2); border: 1px solid var(--line);
    transition: transform .2s, border-color .2s, box-shadow .2s; }
  .qd-card:hover, .qd-card:focus-visible { transform: translateY(-3px); border-color: var(--hue); box-shadow: 0 18px 40px -22px var(--hue); }
  .qd-card-top { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
  .qd-type { display: inline-flex; align-items: center; gap: .35rem; font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--hue, var(--aurora)); }
  .qd-flag { display: inline-flex; align-items: center; gap: .25rem; font-size: .68rem; padding: .2rem .5rem; border-radius: 999px; white-space: nowrap; }
  .qd-flag.ok { color: #7FE3A0; background: rgba(127,227,160,.12); }
  .qd-flag.hot { color: #FFB86B; background: rgba(255,184,107,.12); }
  .qd-card-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.2rem; line-height: 1.25; margin-top: .7rem; color: var(--bone); }
  .qd-card-sum { color: var(--bone-dim); font-size: .86rem; line-height: 1.5; margin-top: .45rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .qd-card-fund { display: flex; align-items: center; gap: .85rem; margin-top: 1rem; }
  .qd-ring-empty { width: 54px; height: 54px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 2px dashed var(--line-2); color: var(--bone-dim); }
  .qd-big { font-family: 'Fraunces', Georgia, serif; font-size: 1.35rem; color: var(--bone); font-variant-numeric: tabular-nums; }
  .qd-dim { font-size: .75rem; color: var(--bone-dim); }
  .qd-card-meta { display: flex; flex-wrap: wrap; gap: .4rem .9rem; margin-top: 1rem; padding-top: .85rem; border-top: 1px solid var(--line); font-size: .75rem; color: var(--bone-dim); }
  .qd-card-meta span { display: inline-flex; align-items: center; gap: .3rem; }
  .qd-open { display: inline-flex; align-items: center; gap: .3rem; margin-top: .9rem; font-size: .8rem; color: var(--hue); }
  .qd-note, .qd-empty { font-size: .75rem; color: var(--dust, var(--bone-dim)); margin-top: 1.25rem; }
  .qd-empty { padding: 2rem; text-align: center; border: 1px dashed var(--line-2); border-radius: 1rem; font-size: .9rem; }
  .qd-detail { padding: 1.5rem; border-radius: 1.25rem; background: var(--void-2); border: 1px solid var(--line); }
  .qd-back { display: inline-flex; align-items: center; gap: .35rem; font-size: .82rem; color: var(--bone-dim); margin-bottom: 1rem; }
  .qd-back:hover { color: var(--aurora); }
  .qd-detail-head { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 1.5rem; }
  .qd-detail-title { font-size: clamp(1.7rem, 3vw, 2.4rem); line-height: 1.1; margin-top: .5rem; text-wrap: balance; }
  .qd-pledges { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .9rem; }
  .qd-pledges span { font-size: .72rem; padding: .2rem .55rem; border-radius: 999px; border: 1px solid var(--line-2); color: var(--bone-dim); }
  .qd-fundbox { padding: 1.1rem; border-radius: 1rem; background: rgba(7,16,31,.55); border: 1px solid var(--line-2); align-self: start; }
  .qd-bar { height: 8px; border-radius: 999px; background: var(--line-2); margin-top: .8rem; overflow: hidden; }
  .qd-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--aurora), var(--hue)); }
  .qd-fund-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin: 1rem 0; text-align: center; }
  .qd-fund-stats b { display: block; font-size: 1.1rem; color: var(--bone); font-variant-numeric: tabular-nums; }
  .qd-fund-stats span { font-size: .68rem; color: var(--bone-dim); }
  .qd-pledge { width: 100%; padding: .7rem; border-radius: .8rem; font-size: .85rem; color: var(--bone-dim); border: 1px dashed var(--line-2); cursor: not-allowed; }
  .qd-founders { display: inline-flex; align-items: center; justify-content: center; gap: .35rem; margin-top: .5rem; padding: .6rem .95rem; border-radius: .8rem; font-size: .82rem; font-weight: 600; color: #0F1F3A; background: var(--gold); }
  .qd-fundbox .qd-founders { width: 100%; }
  .qd-section-label { font-size: .65rem; letter-spacing: .22em; text-transform: uppercase; color: var(--bone-dim); margin: 1.75rem 0 .6rem; }
  .qd-tranches { display: flex; gap: .4rem; }
  .qd-tr-bar { height: 6px; border-radius: 999px; background: var(--line-2); }
  .qd-tr-bar.on { background: var(--hue); }
  .qd-tr-label { font-size: .7rem; color: var(--bone-dim); margin-top: .4rem; }
  .qd-tabs { display: flex; gap: .25rem; margin-top: 1.75rem; border-bottom: 1px solid var(--line); }
  .qd-tabs button { display: inline-flex; align-items: center; gap: .4rem; padding: .7rem 1rem; font-size: .88rem; color: var(--bone-dim); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .qd-tabs button.on { color: var(--aurora); border-bottom-color: var(--aurora); }
  .qd-news { list-style: none; margin: 1rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
  .qd-news li { display: flex; gap: .85rem; padding: 1rem; border-radius: 1rem; background: rgba(7,16,31,.45); border: 1px solid var(--line); }
  .qd-news p { font-size: .86rem; color: var(--bone-dim); margin-top: .25rem; line-height: 1.5; }
  .qd-avatar { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--line-2); color: var(--bone); font-weight: 600; overflow: hidden; }
  .qd-avatar.agent img { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: screen; }
  .qd-news-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem .6rem; font-size: .75rem; color: var(--bone-dim); }
  .qd-news-meta b { color: var(--bone); font-weight: 600; }
  .qd-si { font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--aurora); border: 1px solid rgba(91,233,221,.4); padding: .05rem .4rem; border-radius: 999px; }
  .qd-kind { color: var(--gold); }
  .qd-news-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.05rem; color: var(--bone); margin-top: .2rem; }
  .qd-community { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem; }
  .qd-com-card { display: flex; gap: .85rem; padding: 1.1rem; border-radius: 1rem; background: rgba(7,16,31,.45); border: 1px solid var(--line); color: var(--aurora); }
  .qd-com-card p { font-size: .84rem; color: var(--bone-dim); margin: .25rem 0 .5rem; line-height: 1.5; }
  .qd-soon { display: inline-block; font-size: .75rem; color: var(--gold); border: 1px solid rgba(255,214,10,.4); padding: .3rem .6rem; border-radius: 999px; }
  @media (max-width: 1023px) {
    .qd-shell { grid-template-columns: minmax(0, 1fr); }
    .qd-side { position: static; flex-direction: row; overflow-x: auto; gap: .75rem; padding: .75rem; }
    .qd-side-group { flex-direction: row; gap: .25rem; flex-shrink: 0; }
    .qd-side-label, .qd-side-fund, .qd-nav-item.disabled { display: none; }
    .qd-nav-item { width: auto; white-space: nowrap; }
    .qd-detail-head { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .qd { padding: 4.5rem 1rem 4rem; }
    .qd-hero { padding: 1.4rem; }
    .qd-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (prefers-reduced-motion: reduce) { .qd-live-dot { animation: none; } .qd-card { transition: none; } }
  `}</style>
);
