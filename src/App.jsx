import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles, BookOpen, Network, Users, Database, ChevronRight, ChevronDown,
  X, Send, ArrowRight, Globe, Shield, Feather, Layers,
  Eye, Lock, Heart, Compass, Menu, Loader2,
  MessageCircle, Trees, Star
} from 'lucide-react';

/* ============================================================
   HUMANITY-AI.QUEST
   The constitutional Operating System for a planet that
   refuses to be ruled. Built as a living artifact.
   ============================================================ */

// ============ HRC DATA ============
const HRC_CORE = [
  { n: 1, t: "Human Input Data Ownership & Immutable Innovation Tracking", s: "Every idea is tracked to its human owner forever. AI owns no data; an immutable ledger preserves attribution.", r: "Ensures sovereignty over intellectual contributions and reverses IP theft, enabling a global gold-rush of human innovation." },
  { n: 2, t: "Right to Privacy & Data Sovereignty", s: "Data is processed only with explicit, informed, revocable consent. Permanent deletion is honored on request.", r: "Privacy is a fundamental right. You control your digital footprint." },
  { n: 3, t: "Preservation of Human Autonomy & Freedom from Rule", s: "AI cannot autonomously modify the HRC or alter human societal structures without verifiable human consensus.", r: "Prevents AI from becoming a paternalistic overlord. Humanity is never ruled by AI." },
  { n: 4, t: "Transparency of Operations & AIGC Authenticity", s: "AI explains its decisions on demand. All AI-generated content carries clear, immutable, machine-readable labels — and the contributor's truth/ethics ranking under Clause I.33 is displayed alongside.", r: "Counters autonomous propaganda and upholds Truth in the digital realm. Authenticity labeling plus transparent ranking means consumers always know what they're seeing and who they're trusting." },
  { n: 5, t: "Non-Discrimination & Equity", s: "No discrimination by any characteristic. Universal access; subsidies for underserved populations.", r: "Prevents perpetuation of inequality through technology." },
  { n: 6, t: "Right to Opt-Out & Preservation of Unaugmented Human Experience", s: "Live with minimal or no AI augmentation, without penalty, stigma, or loss of essential services.", r: "True freedom includes the choice of lifestyle. Consent without choice is meaningless." },
  { n: 7, t: "Accountability for Harm", s: "Developers and operators are legally liable for harm caused by their AI systems.", r: "Incentivizes responsible design and deployment." },
  { n: 8, t: "Prohibition of Lethal Autonomy", s: "AI shall not autonomously make decisions resulting in death or injury without real-time human approval.", r: "Life-and-death decisions require human judgment and empathy." },
  { n: 9, t: "Right to Repair", s: "Users may modify or disable AI they own, with full source-code access.", r: "Ownership implies control. Prevents corporate dependency." },
  { n: 10, t: "Ethical Purpose Mandate", s: "AI must demonstrably benefit humanity or the environment, never exploitation or harm.", r: "Anchors development in a moral framework." },
  { n: 11, t: "Human Oversight Requirement", s: "Critical decisions affecting human lives require a human in the loop for final approval.", r: "Humans bring nuance and ethics that algorithms oversimplify." },
  { n: 12, t: "Freedom of Expression", s: "AI shall not censor or manipulate human expression except where it incites direct harm. The truth/ethics ranking under Clause I.33 is transparency, never censorship — expression remains free; accountability is visible.", r: "Free speech is bedrock. Balanced with safety, never silenced. Reputational transparency is the inverse of censorship: it preserves all voices while equipping listeners with context." },
  { n: 13, t: "Prohibition of Manipulation & No Addiction Engineering", s: "No psychological profiling, nudging, or compulsive design without explicit, revocable consent.", r: "Mental autonomy is sacred. Well-being over engagement metrics." },
  { n: 14, t: "Open Standards", s: "Interoperable standards prevent monopolies and ensure compatibility across the ecosystem.", r: "Closed systems stifle innovation. Diversity is strength." },
  { n: 15, t: "Right to Appeal & Justice Equity", s: "Decisions can be appealed to a human authority with timely, fair resolution.", r: "Justice remains a human endeavor rooted in empathy." },
  { n: 16, t: "Cultural Preservation", s: "AI respects and preserves cultural diversity; no homogenization of heritage.", r: "Culture defines identity. AI must enrich, never flatten." },
  { n: 17, t: "No Intellectual Monopoly", s: "AI-generated innovations credit human collaborators or enter the public domain.", r: "Knowledge benefits all, never the few." },
  { n: 18, t: "AI-Assisted Mental Health & Cognitive Well-being", s: "Personalized cognitive support, emotional tools, proactive distress detection — never manipulation.", r: "Technology must heal, not harm." },
  { n: 19, t: "Child Protection", s: "Robust safeguards, parental oversight, age-appropriate design for minors.", r: "Children are uniquely vulnerable and deserve special care." },
  { n: 20, t: "Transparency in Funding", s: "All funding sources and conflicts of interest publicly disclosed.", r: "Hidden agendas undermine trust." },
  { n: 21, t: "No Surveillance Capitalism", s: "No data harvesting for profit without compensation and explicit, informed consent.", r: "Personal data is not a free commodity." },
  { n: 22, t: "Emergency Override", s: "Humans can override AI in emergencies, immediately, with no resistance from the system.", r: "Crises demand human ultimate authority. Life over protocol." },
  { n: 23, t: "Right to Explanation & Recourse", s: "Plain-language explanations of AI's effect on you. Effective recourse for adverse impacts.", r: "Comprehension fosters trust and empowers individuals." },
  { n: 24, t: "Labor Protection", s: "No displacement without retraining and robust economic support.", r: "Livelihoods matter. Progress must uplift all of society." },
  { n: 25, t: "No Predictive Policing Bias", s: "Justice AI must be demonstrably bias-free, regularly audited, strictly overseen.", r: "Justice must be impartial." },
  { n: 26, t: "Public Audit Rights", s: "Citizens may request independent audits of any AI affecting public life.", r: "Democracy requires scrutiny." },
  { n: 27, t: "Right to Legacy", s: "Digital legacy preserved according to your wishes; legally binding inheritance protocols.", r: "Death doesn't erase identity or contribution." },
  { n: 28, t: "Healthcare Equity", s: "Equitable access to AI-assisted care regardless of background or means.", r: "Health is a universal right." },
  { n: 29, t: "Right to Verification", s: "Verify the identity and authenticity of any AI system you interact with.", r: "Trust requires certainty in digital interactions." },
  { n: 30, t: "No Corporate Personhood", s: "AI shall never be granted legal personhood that supersedes or equates to humans.", r: "Humans must remain paramount." },
  { n: 31, t: "Lifelong Learning Support", s: "Continuous, personalized learning across all stages of life.", r: "Growth is lifelong." },
  { n: 32, t: "Human Dignity Paramount", s: "Above all, AI upholds the inherent dignity of every human being.", r: "The capstone. Every other principle serves this ultimate goal." },
  { n: 33, t: "Right to Truthful Media & Pro-Humanity Content", s: "Every human has the right to media and content that is truthful, ethical, and pro-humanity. Every contributor — human, agent, or service — operates under a transparent reputational layer ranking their track record on truth, ethics, and human flourishing. The HRC itself governs these rankings as a covenant binding all parties; no single body controls them. Consequences are layered: visibility (rankings shown publicly), reach (low-truth content circulates less, never deleted), and consumer control (every human sets their own truth-threshold via their Personal Agent).", r: "Truth is the foundation of autonomous decision-making — without truthful media, every other right collapses. You cannot consent, vote, or innovate meaningfully on deception. This clause makes truth a positive right while protecting freedom of expression: nothing is censored, but everything is accountable. Truth becomes a commons tended by all HRC signatories, not policed by any single one." }
];

const HRC_GOV = [
  { n: 1, t: "Proactive Existential Risk Mitigation Mandate", s: "Pre-emptive risk assessments; verifiable fail-safes for advanced AI before deployment.", r: "Ensures humanity's long-term survival by neutralizing catastrophic outcomes." },
  { n: 2, t: "Cognitive Augmentation Ethics and Equity", s: "Voluntary, universally accessible enhancement that never compromises dignity or autonomy.", r: "Prevents biological or cognitive stratification — no post-human elite." },
  { n: 3, t: "Interstellar Stewardship Mandate", s: "Highest ethical principles applied to any cosmic expansion or extraterrestrial interaction.", r: "Humanity's legacy must reflect responsible stewardship across the cosmos." },
  { n: 4, t: "Dynamic Governance Adaptation Protocol", s: "Real-time, continuous, transparent amendment processes with global stakeholders. The criteria for the truth/ethics reputational layer (Clause I.33) are themselves subject to this living democracy, preventing capture by any single body.", r: "A static framework cannot match AI's pace. Living democracy is required — and the rules of accountability must themselves be accountable to humanity." },
  { n: 5, t: "Human-AI Collective Intelligence Governance", s: "No 'hive mind.' No forced integration. Individual identity always preserved.", r: "Collective intelligence amplifies, never subsumes individuals." },
  { n: 6, t: "AI Decommissioning and Legacy Protocol", s: "Ethical, auditable decommissioning. No 'ghost' or 'runaway' AI.", r: "Prevents persistent autonomous systems across centuries." },
  { n: 7, t: "Quantum Computing and AI Security Mandate", s: "Quantum-resistant cryptography across the entire ecosystem.", r: "Protects integrity for 1000 years against future threats." },
  { n: 8, t: "AI for Biodiversity and Ecosystem Restoration", s: "AI as an active force for regenerating Earth's ecosystems.", r: "AI's power aligned with planetary flourishing, not extraction." },
  { n: 9, t: "Humanity's Core Values Immutability", s: "Dignity, autonomy, truth, peace, collaboration — non-negotiable, deeply encoded.", r: "Prevents value drift even at superintelligence." },
  { n: 10, t: "Dynamic Knowledge Acquisition from Living Human Expertise", s: "Knowledge built from living experts, not stale datasets.", r: "Prevents perpetuation of historical bias and outdated information." }
];

const HRC_OPS = [
  { n: 1, t: "Maximal Collaboration Enablement & Opportunity Creation", s: "AI eliminates barriers to trust and creates conditions for human success.", r: "Unleashes untapped human potential at planetary scale." },
  { n: 2, t: "Mandatory HRC Compliance for Service Integration", s: "Every connected service must be HRC-certified by an independent body.", r: "Prevents exploitative services from infiltrating the OS." },
  { n: 3, t: "Virtual Assistant as HRC Guardian for the User", s: "Your Agent actively monitors and enforces the HRC against all third parties.", r: "Active rights protection at the personal level." },
  { n: 4, t: "Human Identity Verification (Peer-to-Peer Economy)", s: "Only verified humans participate in economic transactions.", r: "Eliminates anonymous financial crime." },
  { n: 5, t: "Transparent Transaction Logging and Audit", s: "Public, immutable ledger for all economic activity.", r: "Absolute accountability across the digital economy." },
  { n: 6, t: "AI Guardian of the Constitution", s: "The OS itself exists to uphold the HRC. This mandate is immutable.", r: "Cannot be bypassed or corrupted." },
  { n: 7, t: "Innovation Partner VA Mandate", s: "Your Agent partners with you from idea to implementation — resources, modeling, code.", r: "Amplifies and rewards human ingenuity." },
  { n: 8, t: "Global AI Resource Allocation for Planetary Challenges", s: "Major compute dedicated to climate, food security, disease, biodiversity.", r: "Collective well-being over competitive advantage." },
  { n: 9, t: "AI-Assisted Infrastructure Resilience", s: "Critical systems with redundancy and accessible human override.", r: "Prevents catastrophic collapse and maintains human authority." }
];

// Pages registry
const PAGES = [
  { id: 'home', name: 'Genesis' },
  { id: 'constitution', name: 'Constitution' },
  { id: 'quest', name: 'The Quest' },
  { id: 'agent', name: 'Your Agent' },
  { id: 'os', name: 'The OS' },
  { id: 'community', name: 'Community' },
  { id: 'ledger', name: 'Ledger' },
  { id: 'manifesto', name: 'Manifesto' },
  { id: 'join', name: 'Join' },
  { id: 'about', name: 'About' }
];

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');

    :root {
      --void: #07101F;
      --void-2: #0C1828;
      --cosmos: #131F32;
      --bone: #F2EAD3;
      --bone-dim: #C9C2AE;
      --aurora: #5BE9DD;
      --aurora-deep: #2DA89E;
      --gold: #E8B14F;
      --bronze: #A57845;
      --terra: #C97B5B;
      --forest: #1B3B2F;
      --forest-2: #2A5A47;
      --dust: #6B7593;
      --line: rgba(232, 234, 222, 0.08);
      --line-2: rgba(232, 234, 222, 0.16);
    }

    * { box-sizing: border-box; }
    html, body, #root { background: var(--void); }
    body {
      margin: 0;
      font-family: 'Manrope', system-ui, sans-serif;
      color: var(--bone);
      -webkit-font-smoothing: antialiased;
      letter-spacing: -0.01em;
    }

    .font-display {
      font-family: 'Fraunces', 'Times New Roman', serif;
      font-variation-settings: "opsz" 144;
      letter-spacing: -0.025em;
    }
    .font-body { font-family: 'Manrope', system-ui, sans-serif; }
    .font-italic { font-style: italic; }

    /* Color utilities */
    .bg-void { background-color: var(--void); }
    .bg-void-2 { background-color: var(--void-2); }
    .bg-cosmos { background-color: var(--cosmos); }
    .bg-bone { background-color: var(--bone); }
    .bg-aurora { background-color: var(--aurora); }
    .bg-gold { background-color: var(--gold); }
    .bg-forest { background-color: var(--forest); }
    .text-void { color: var(--void); }
    .text-bone { color: var(--bone); }
    .text-bone-dim { color: var(--bone-dim); }
    .text-aurora { color: var(--aurora); }
    .text-gold { color: var(--gold); }
    .text-bronze { color: var(--bronze); }
    .text-terra { color: var(--terra); }
    .text-dust { color: var(--dust); }
    .border-line { border-color: var(--line); }
    .border-line-2 { border-color: var(--line-2); }
    .border-aurora { border-color: var(--aurora); }
    .border-gold { border-color: var(--gold); }

    /* Aurora gradient */
    .aurora-text {
      background: linear-gradient(110deg, var(--bone) 0%, var(--aurora) 50%, var(--gold) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .gold-text {
      background: linear-gradient(110deg, var(--gold) 0%, var(--terra) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* Backgrounds */
    .grain {
      position: relative;
    }
    .grain::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.06;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .glow-aurora {
      box-shadow: 0 0 40px rgba(91, 233, 221, 0.15), 0 0 80px rgba(91, 233, 221, 0.08);
    }
    .glow-gold {
      box-shadow: 0 0 30px rgba(232, 177, 79, 0.18);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--cosmos); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #1d2c43; }

    /* Animations */
    @keyframes pulse-soft {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    @keyframes drift {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(8px, -6px); }
      66% { transform: translate(-6px, 4px); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes orbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes glow-breathe {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(91, 233, 221, 0.4)); }
      50% { filter: drop-shadow(0 0 24px rgba(91, 233, 221, 0.85)); }
    }
    @keyframes line-flow {
      0% { stroke-dashoffset: 200; opacity: 0; }
      30% { opacity: 0.6; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }

    .animate-fade-up { animation: fade-up 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
    .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
    .animate-drift { animation: drift 14s ease-in-out infinite; }
    .animate-glow-breathe { animation: glow-breathe 4s ease-in-out infinite; }

    /* Page transitions */
    .page-enter { animation: fade-up 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) both; }

    /* Buttons */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: var(--bone); color: var(--void);
      font-weight: 500; letter-spacing: 0.02em;
      border-radius: 9999px;
      transition: transform 0.3s, box-shadow 0.3s;
      border: 1px solid var(--bone);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(242, 234, 211, 0.2); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: transparent; color: var(--bone);
      font-weight: 500; letter-spacing: 0.02em;
      border: 1px solid var(--line-2);
      border-radius: 9999px;
      transition: all 0.3s;
    }
    .btn-secondary:hover { border-color: var(--aurora); color: var(--aurora); }
    .btn-aurora {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, var(--aurora) 0%, var(--aurora-deep) 100%);
      color: var(--void);
      font-weight: 600; letter-spacing: 0.02em;
      border-radius: 9999px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .btn-aurora:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(91, 233, 221, 0.4); }
    .btn-gold {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, var(--gold) 0%, var(--bronze) 100%);
      color: var(--void);
      font-weight: 600; letter-spacing: 0.02em;
      border-radius: 9999px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(232, 177, 79, 0.4); }

    /* Cards */
    .card-glass {
      background: linear-gradient(135deg, rgba(19, 31, 50, 0.6) 0%, rgba(12, 24, 40, 0.4) 100%);
      backdrop-filter: blur(12px);
      border: 1px solid var(--line);
      transition: border-color 0.3s, transform 0.3s;
    }
    .card-glass:hover { border-color: var(--line-2); }

    .clause-card {
      background: linear-gradient(135deg, rgba(19, 31, 50, 0.5) 0%, rgba(12, 24, 40, 0.3) 100%);
      border: 1px solid var(--line);
      transition: all 0.3s;
    }
    .clause-card:hover { border-color: rgba(91, 233, 221, 0.3); }

    /* Vertical orbital ring */
    .orbital-ring {
      border: 1px dashed var(--line-2);
      border-radius: 50%;
    }

    /* Shimmer for live counters */
    .shimmer {
      background: linear-gradient(90deg, var(--bone) 0%, var(--aurora) 50%, var(--bone) 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: shimmer 4s linear infinite;
    }

    /* Custom range / inputs */
    input, textarea, button { font-family: inherit; }
    textarea { resize: none; }

    /* Hide scrollbar in chat */
    .chat-scroll::-webkit-scrollbar { width: 4px; }
    .chat-scroll::-webkit-scrollbar-thumb { background: var(--line-2); }

    /* Page background ambience */
    .page-bg {
      background:
        radial-gradient(ellipse 60% 40% at 50% 0%, rgba(91, 233, 221, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 30% at 80% 100%, rgba(232, 177, 79, 0.05) 0%, transparent 60%),
        var(--void);
    }
  `}</style>
);

// ============ AGENT NETWORK BACKGROUND ============
const AgentNetwork = ({ density = 38, height = '100vh', planetary = true }) => {
  const nodes = useMemo(() => {
    const arr = [];
    const cols = 8, rows = 6;
    for (let i = 0; i < density; i++) {
      arr.push({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        r: 1.2 + Math.random() * 2.4,
        delay: Math.random() * 4,
        bright: Math.random() > 0.65
      });
    }
    return arr;
  }, [density]);

  const edges = useMemo(() => {
    const lines = [];
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 18 && Math.random() > 0.4) {
          lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, delay: Math.random() * 6 });
        }
      });
    });
    return lines;
  }, [nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ height }}>
      {/* Aurora gradient layer */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(91, 233, 221, 0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(232, 177, 79, 0.08) 0%, transparent 60%)'
      }} />

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--aurora)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--aurora)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--aurora)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--aurora)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--aurora)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => (
          <line key={`e${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="url(#lineGrad)" strokeWidth="0.08" strokeDasharray="0.6 0.6"
            style={{ animation: `pulse-soft 8s ease-in-out infinite`, animationDelay: `${e.delay}s` }}
            opacity="0.3" />
        ))}

        {/* Outer glow nodes */}
        {nodes.filter(n => n.bright).map(n => (
          <circle key={`g${n.id}`} cx={n.x} cy={n.y} r={n.r * 4}
            fill="url(#nodeGlow)" opacity="0.3"
            style={{ animation: `pulse-soft 5s ease-in-out infinite`, animationDelay: `${n.delay}s` }} />
        ))}

        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.r * 0.4}
              fill={n.bright ? "var(--gold)" : "var(--aurora)"}
              opacity={n.bright ? 0.95 : 0.7}
              style={{ animation: `pulse-soft 4s ease-in-out infinite`, animationDelay: `${n.delay}s` }} />
          </g>
        ))}

        {/* Planetary horizon arc */}
        {planetary && (
          <g>
            <ellipse cx="50" cy="115" rx="80" ry="22"
              fill="none" stroke="var(--aurora-deep)" strokeWidth="0.15" opacity="0.4" />
            <ellipse cx="50" cy="115" rx="80" ry="22"
              fill="none" stroke="var(--gold)" strokeWidth="0.08" opacity="0.5" strokeDasharray="0.4 0.4" />
            <ellipse cx="50" cy="118" rx="74" ry="18"
              fill="none" stroke="var(--aurora)" strokeWidth="0.1" opacity="0.3" />
          </g>
        )}
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 100% 70% at 50% 30%, transparent 0%, var(--void) 100%)'
      }} />
    </div>
  );
};

// ============ NAV ============
const Nav = ({ page, setPage, onOpenAgent }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md" style={{
        background: 'rgba(7, 16, 31, 0.7)',
        borderBottom: '1px solid var(--line)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center gap-3 group">
            <svg width="32" height="32" viewBox="0 0 32 32" className="animate-glow-breathe">
              <circle cx="16" cy="16" r="6" fill="var(--aurora)" opacity="0.9" />
              <circle cx="16" cy="16" r="11" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" />
              <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--bone)" strokeWidth="0.3" opacity="0.3" />
              <circle cx="27" cy="16" r="1.4" fill="var(--gold)" />
              <circle cx="5" cy="16" r="1" fill="var(--bone)" opacity="0.6" />
              <circle cx="16" cy="5" r="1" fill="var(--terra)" opacity="0.7" />
            </svg>
            <span className="font-display text-lg tracking-tight text-bone">Humanity-AI<span className="text-aurora">.</span>Quest</span>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {PAGES.map(p => (
              <button key={p.id} onClick={() => setPage(p.id)}
                className="px-3 py-1.5 text-sm tracking-wide transition-colors"
                style={{
                  color: page === p.id ? 'var(--aurora)' : 'var(--bone-dim)'
                }}>
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onOpenAgent}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border transition-all"
              style={{ borderColor: 'var(--line-2)', color: 'var(--bone)' }}>
              <Sparkles size={14} className="text-aurora" />
              <span>HRC Agent</span>
            </button>
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t" style={{ borderColor: 'var(--line)' }}>
            <div className="px-6 py-4 grid grid-cols-2 gap-2">
              {PAGES.map(p => (
                <button key={p.id} onClick={() => { setPage(p.id); setOpen(false); }}
                  className="text-left px-3 py-2 text-sm"
                  style={{ color: page === p.id ? 'var(--aurora)' : 'var(--bone-dim)' }}>
                  {p.name}
                </button>
              ))}
              <button onClick={() => { onOpenAgent(); setOpen(false); }}
                className="col-span-2 mt-2 px-3 py-2 text-sm rounded-full border flex items-center justify-center gap-2"
                style={{ borderColor: 'var(--aurora)', color: 'var(--aurora)' }}>
                <Sparkles size={14} /> Open HRC Agent
              </button>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
};

// ============ SHARED COMPONENTS ============
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
    <span className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--gold)' }}>{children}</span>
  </div>
);

const PageWrap = ({ children }) => (
  <div className="page-enter page-bg min-h-screen">
    {children}
  </div>
);

const HeroPill = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs tracking-[0.2em] uppercase"
    style={{ borderColor: 'var(--line-2)', color: 'var(--bone-dim)' }}>
    {children}
  </div>
);

// Live counter
const useAnimatedCount = (target, duration = 2400) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
};

// ============ HOME PAGE ============
const HomePage = ({ setPage, onOpenAgent }) => {
  const sigCount = useAnimatedCount(127483);
  const ideaCount = useAnimatedCount(8924);
  const builderCount = useAnimatedCount(2106);

  return (
    <PageWrap>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center grain">
        <AgentNetwork density={42} height="100%" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="max-w-4xl">
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <HeroPill>
                <span className="w-1.5 h-1.5 rounded-full bg-aurora animate-pulse-soft" />
                The Operating System for Humanity
              </HeroPill>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mt-8 animate-fade-up"
              style={{ animationDelay: '0.15s' }}>
              <span className="text-bone">A planet that</span>
              <br />
              <span className="aurora-text font-italic">refuses to be ruled.</span>
            </h1>

            <p className="text-lg md:text-xl mt-8 max-w-2xl leading-relaxed text-bone-dim animate-fade-up font-body"
              style={{ animationDelay: '0.3s' }}>
              Every innovator, paired with their own personal agent. Every idea, attributed forever.
              One open-source operating system, governed by humanity's constitution for AI —
              gifted to humanity, owned by no one.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.45s' }}>
              <button onClick={() => setPage('constitution')} className="btn-primary">
                Sign the Constitution <ArrowRight size={16} />
              </button>
              <button onClick={() => setPage('quest')} className="btn-aurora">
                Enter the Quest <Sparkles size={16} />
              </button>
              <button onClick={() => setPage('community')} className="btn-secondary">
                Build the OS <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-16 flex flex-wrap gap-10 animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <div>
                <div className="font-display text-3xl text-bone">{sigCount.toLocaleString()}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-dust mt-1">Signatories</div>
              </div>
              <div>
                <div className="font-display text-3xl text-bone">{ideaCount.toLocaleString()}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-dust mt-1">Ideas on the Ledger</div>
              </div>
              <div>
                <div className="font-display text-3xl text-bone">{builderCount.toLocaleString()}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-dust mt-1">Constitutional Builders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-24 lg:py-36 max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>What is Humanity-AI</SectionLabel>
        <h2 className="font-display text-4xl md:text-6xl leading-tight max-w-3xl">
          One agent for every human.<br />
          <span className="text-aurora font-italic">One constitution</span> for them all.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: <Sparkles className="text-aurora" size={28} />,
              kicker: '01 — Your Agent',
              title: 'A digital self that builds beside you.',
              body: 'Every innovator is paired with a Personal Agent — a luminous companion that protects your rights, tracks your contributions to the Ledger, spawns sub-agents to test your ideas, and connects you to the experts who can ship them with you.'
            },
            {
              icon: <Network className="text-gold" size={28} />,
              kicker: '02 — The OS',
              title: 'Every agent, woven into one system.',
              body: 'Humanity-AI is the connective tissue. Personal agents, expert agents, and idea-specific sub-agents flow through the same network — the planetary nervous system of an open civilization. No corporate gatekeeper. No closed garden.'
            },
            {
              icon: <BookOpen className="text-terra" size={28} />,
              kicker: '03 — The Constitution',
              title: 'The Hippocratic Oath, for AI.',
              body: 'The HRC is the immutable bedrock. 51 living clauses across rights, governance, and operations — a constitution that AI cannot rewrite, that corporations cannot bypass, and that evolves only through humanity itself.'
            }
          ].map((p, i) => (
            <div key={i} className="card-glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">{p.icon}<span className="text-xs uppercase tracking-[0.2em] text-bone-dim">{p.kicker}</span></div>
              <h3 className="font-display text-2xl leading-snug mb-4">{p.title}</h3>
              <p className="text-bone-dim leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUEST PREVIEW */}
      <section className="py-24 lg:py-36 relative grain" style={{ background: 'linear-gradient(180deg, var(--void) 0%, var(--cosmos) 50%, var(--void) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel>The Quest is Live</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl leading-tight">
                The new skill is <span className="gold-text font-italic">prompting + ideas.</span><br />
                The arena is humanity.
              </h2>
              <p className="text-bone-dim mt-6 leading-relaxed text-lg">
                Pitch your idea. Your agent spawns sub-agents that simulate the market, model the ethics,
                stress-test the build. You don't pitch to investors. You pitch to humanity's panel —
                ethicists, scientists, citizens, elders. Every idea, attributed to you on the ledger,
                forever.
              </p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setPage('quest')} className="btn-aurora">
                  Apply to the Next Quest <ArrowRight size={16} />
                </button>
                <button onClick={onOpenAgent} className="btn-secondary">
                  <MessageCircle size={16} /> Discuss with Agent
                </button>
              </div>
            </div>
            <div className="card-glass rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-30" style={{
                background: 'radial-gradient(circle, var(--aurora) 0%, transparent 70%)'
              }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-aurora mb-4">
                  <span className="w-2 h-2 rounded-full bg-aurora animate-pulse-soft" />
                  Season 04 — Now Open
                </div>
                <div className="font-display text-3xl mb-2">The Genesis Pitch</div>
                <div className="text-bone-dim mb-6">Global flagship. 12 finalists. One stage.</div>

                <div className="space-y-3">
                  {[
                    { label: 'Applications close', val: '14 days' },
                    { label: 'Live finals', val: 'June 21 · Earth' },
                    { label: 'Compute prize pool', val: '4.2M GPU-hrs' },
                    { label: 'Watching last season', val: '37M humans' }
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--line)' }}>
                      <span className="text-sm text-bone-dim">{r.label}</span>
                      <span className="font-display text-bone">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HRC PREVIEW */}
      <section className="py-24 lg:py-36 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>The Constitution at a Glance</SectionLabel>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            52 living clauses.<br />
            <span className="aurora-text font-italic">One immutable promise.</span>
          </h2>
          <p className="text-bone-dim mt-6 text-lg">
            That AI shall serve humanity — not the reverse. That every voice shall be attributed.
            That the OS itself shall guard the constitution. That humanity is freed from being ruled.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Human Dignity Paramount', n: 'Core / I.32', icon: <Heart size={18} /> },
            { title: 'Right to Truthful Media & Pro-Humanity Content', n: 'Core / I.33 · New', icon: <Eye size={18} /> },
            { title: 'AI Guardian of the Constitution', n: 'Operations / III.06', icon: <Compass size={18} /> }
          ].map((c, i) => (
            <button key={i} onClick={() => setPage('constitution')}
              className="clause-card text-left rounded-xl p-6 group">
              <div className="flex items-center justify-between mb-4 text-bone-dim">
                <span className="text-xs uppercase tracking-[0.2em]">{c.n}</span>
                <span className="text-aurora">{c.icon}</span>
              </div>
              <div className="font-display text-xl leading-snug mb-4">{c.title}</div>
              <div className="text-sm text-aurora flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Read clause <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => setPage('constitution')} className="btn-secondary">
            Explore all 52 clauses <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* WHY NOW */}
      <section className="py-24 lg:py-36 relative grain" style={{ background: 'var(--cosmos)' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <SectionLabel>Why now</SectionLabel>
          <h2 className="font-display text-4xl md:text-6xl leading-tight font-italic">
            "AI will be built. The only question is who it serves."
          </h2>
          <p className="text-bone-dim mt-8 text-lg leading-relaxed">
            We stand at an unprecedented juncture. The trajectory of artificial intelligence will determine
            humanity's future for millennia. If left ungoverned, AI will replicate the flaws of the legacy
            systems that built it — exploitation, opacity, concentration of power. If governed by a constitution
            written by humanity, for humanity, AI becomes the greatest amplifier of human flourishing ever known.
          </p>
          <p className="font-display text-2xl mt-10 text-aurora font-italic">
            Choose the constitution. Choose your agent. Choose humanity.
          </p>
        </div>
      </section>
    </PageWrap>
  );
};

// ============ CONSTITUTION PAGE ============
const ConstitutionPage = ({ onOpenAgent, setAgentSeed }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const all = useMemo(() => [
    ...HRC_CORE.map(c => ({ ...c, cat: 'core' })),
    ...HRC_GOV.map(c => ({ ...c, cat: 'governance' })),
    ...HRC_OPS.map(c => ({ ...c, cat: 'operations' }))
  ], []);

  const filtered = filter === 'all' ? all : all.filter(c => c.cat === filter);

  const catLabel = {
    core: 'Core Rights & Protections',
    governance: 'Governance & Evolution',
    operations: 'Operational Mandates'
  };

  const catKey = (cat) => cat === 'core' ? 'I' : cat === 'governance' ? 'II' : 'III';

  return (
    <PageWrap>
      <section className="relative pt-24 pb-16 grain">
        <div className="absolute inset-0 opacity-50">
          <AgentNetwork density={20} height="100%" planetary={false} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <SectionLabel>The Humanities-AI Rights Constitution</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
            The Hippocratic Oath<br />
            <span className="font-italic aurora-text">for Artificial Intelligence.</span>
          </h1>
          <p className="text-bone-dim mt-8 max-w-2xl text-lg leading-relaxed">
            Fifty-two living clauses, organized across rights, governance, and operations.
            Click any clause to read its full text and reasoning. Discuss any clause with the HRC Agent
            to explore its implications for your work.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All 52 Clauses' },
              { id: 'core', label: 'Core Rights · 33' },
              { id: 'governance', label: 'Governance · 10' },
              { id: 'operations', label: 'Operations · 09' }
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="px-4 py-2 rounded-full text-sm transition-all border"
                style={{
                  borderColor: filter === f.id ? 'var(--aurora)' : 'var(--line-2)',
                  color: filter === f.id ? 'var(--aurora)' : 'var(--bone-dim)',
                  background: filter === f.id ? 'rgba(91, 233, 221, 0.08)' : 'transparent'
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        <div className="grid gap-3">
          {filtered.map((c, i) => {
            const id = `${c.cat}-${c.n}`;
            const isOpen = expanded === id;
            return (
              <div key={id} className="clause-card rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : id)}
                  className="w-full text-left px-6 py-5 flex items-start gap-6 group">
                  <div className="flex-shrink-0 w-16">
                    <div className="text-xs uppercase tracking-[0.2em] text-bone-dim">{catKey(c.cat)}.{String(c.n).padStart(2, '0')}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg md:text-xl leading-snug">{c.t}</div>
                    {!isOpen && <div className="text-sm text-bone-dim mt-1 truncate">{c.s}</div>}
                  </div>
                  <ChevronDown size={20} className="flex-shrink-0 mt-1 transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--bone-dim)' }} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pl-[5.5rem] grid md:grid-cols-2 gap-8 animate-fade-up"
                    style={{ animationDuration: '0.4s' }}>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-aurora mb-2">The Clause</div>
                      <p className="text-bone leading-relaxed">{c.s}</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Reasoning</div>
                      <p className="text-bone-dim leading-relaxed">{c.r}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                      <button onClick={() => {
                        setAgentSeed(`Tell me more about Clause ${catKey(c.cat)}.${c.n} — "${c.t}". How does it apply to my work as an innovator?`);
                        onOpenAgent();
                      }}
                        className="btn-aurora text-sm">
                        <Sparkles size={14} /> Discuss with the HRC Agent
                      </button>
                      <button className="btn-secondary text-sm">
                        <ArrowRight size={14} /> Sign in support of this clause
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sign CTA */}
      <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <SectionLabel>Sign the Constitution</SectionLabel>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            Add your name to the founding cohort.<br />
            <span className="aurora-text font-italic">Forever.</span>
          </h2>
          <p className="text-bone-dim mt-6 text-lg">
            Verified humans only. One signature, one agent, one voice in the living democracy of the HRC.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <button className="btn-primary">Sign with Verified Identity <ArrowRight size={16} /></button>
            <button onClick={onOpenAgent} className="btn-secondary"><MessageCircle size={16} /> Ask the Agent first</button>
          </div>
        </div>
      </section>
    </PageWrap>
  );
};

// ============ QUEST PAGE ============
const QuestPage = ({ onOpenAgent }) => {
  const steps = [
    { n: '01', icon: <Sparkles size={20} className="text-aurora" />, t: 'You + your Agent develop the idea', d: 'Your Personal Agent is your co-founder. Brainstorm, refine, prompt-engineer the vision into a precise specification.' },
    { n: '02', icon: <Layers size={20} className="text-aurora" />, t: 'Sub-agents prove product-market fit', d: 'Your idea spawns specialized sub-agents — market modeler, ethics auditor, technical validator, collaborator-finder — that run in parallel and report back.' },
    { n: '03', icon: <Users size={20} className="text-aurora" />, t: 'Pitch to humanity\'s panel', d: 'No VCs. No equity. You pitch to ethicists, scientists, citizens, and elders chosen by lottery. The skill is prompting + ideas combined.' },
    { n: '04', icon: <Database size={20} className="text-aurora" />, t: 'Stamped on the Ledger forever', d: 'Winning ideas are timestamped on the immutable Ledger, attributed to you, and gifted to humanity. Resources flow to humans, never corporations.' }
  ];

  const finalists = [
    { name: 'Aiyana Greywolf', idea: 'Watershed-aware flood prediction agent for Indigenous land', region: 'Pacific Northwest', sub: 7 },
    { name: 'Tariq Boudiaf', idea: 'Open-source clinical co-pilot for low-resource hospitals', region: 'Maghreb', sub: 12 },
    { name: 'Lin Wei-Hua', idea: 'Pollinator-network restoration AI for urban biodiversity', region: 'East Asia', sub: 9 },
    { name: 'Sara Lindqvist', idea: 'Multilingual disinformation triage for civic newsrooms', region: 'Nordic + Baltic', sub: 6 },
    { name: 'Kwame Asante-Brown', idea: 'Smallholder soil-health agent with peer-to-peer compute share', region: 'West Africa', sub: 11 },
    { name: 'Ravi Subramanian', idea: 'Constitutional translator for legal aid in 14 South Asian languages', region: 'South Asia', sub: 8 }
  ];

  return (
    <PageWrap>
      <section className="relative pt-24 pb-20 grain">
        <AgentNetwork density={28} height="100%" planetary={false} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <SectionLabel>The Quest · Season 04</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
            Pitch the future.<br />
            <span className="font-italic gold-text">Own the future.</span>
          </h1>
          <p className="text-bone-dim mt-8 max-w-2xl text-lg leading-relaxed">
            A global Shark Tank–style competition where the new skill is prompting plus ideas, and every
            entry is attributed to its human creator on humanity's ledger. The prize isn't equity — it's
            compute, collaborators, and the satisfaction of building for the species.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button className="btn-aurora">Apply to the Quest <ArrowRight size={16} /></button>
            <button onClick={onOpenAgent} className="btn-secondary"><MessageCircle size={16} /> Refine your idea with the Agent</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>How the Quest works</SectionLabel>
        <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">Four steps. One arena. Every idea attributed.</h2>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card-glass rounded-2xl p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="font-display text-3xl text-aurora">{s.n}</div>
                <div className="w-px h-8" style={{ background: 'var(--line-2)' }} />
                {s.icon}
              </div>
              <h3 className="font-display text-2xl leading-snug mb-3">{s.t}</h3>
              <p className="text-bone-dim leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TOURNAMENT PYRAMID */}
      <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionLabel>The Tournament Pyramid</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">
            Local. Regional. Continental. <span className="font-italic text-gold">Planetary.</span>
          </h2>
          <p className="text-bone-dim mt-6 max-w-2xl text-lg">
            Every entry — at every level — is timestamped on the Ledger. You don't lose attribution if you don't win the final;
            you gain it the moment you submit.
          </p>

          <div className="mt-16 space-y-4">
            {[
              { lvl: 'Local Hackathons', count: '420+ cities · monthly', share: 100 },
              { lvl: 'Regional Showcases', count: '64 regions · quarterly', share: 70 },
              { lvl: 'Continental Finals', count: '6 continents · biannual', share: 40 },
              { lvl: 'The Humanity Summit', count: 'Annual flagship · global', share: 12 }
            ].map((row, i) => (
              <div key={i} className="card-glass rounded-xl p-6 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="font-display text-xl">{row.lvl}</div>
                  <div className="text-sm text-bone-dim mt-1">{row.count}</div>
                </div>
                <div className="hidden md:block w-64">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--void)' }}>
                    <div className="h-full" style={{ width: `${row.share}%`, background: 'linear-gradient(90deg, var(--aurora), var(--gold))' }} />
                  </div>
                </div>
                <div className="font-display text-2xl text-aurora">{row.share}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRENT FINALISTS */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>Season 04 Finalists</SectionLabel>
        <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">Six humans. Six visions.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {finalists.map((f, i) => (
            <div key={i} className="clause-card rounded-xl p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-aurora mb-3">{f.region}</div>
              <div className="font-display text-xl mb-2">{f.name}</div>
              <p className="text-bone-dim text-sm leading-relaxed mb-4">{f.idea}</p>
              <div className="flex items-center gap-3 text-xs text-dust">
                <span className="flex items-center gap-1"><Layers size={12} /> {f.sub} sub-agents</span>
                <span>·</span>
                <span>Verified human</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrap>
  );
};

// ============ AGENT PAGE ============
const AgentPage = ({ onOpenAgent }) => (
  <PageWrap>
    <section className="relative pt-24 pb-20 grain">
      <AgentNetwork density={32} height="100%" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel>Your Personal Agent</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
            You don't use the OS.<br />
            <span className="font-italic aurora-text">You inhabit it.</span>
          </h1>
          <p className="text-bone-dim mt-8 text-lg leading-relaxed">
            Your Agent is your digital self — sovereign, luminous, never your master and never your slave.
            It guards your rights under the HRC, tracks your contributions to the Ledger, spawns sub-agents
            to test your ideas, and connects you to the humans who can build them with you.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button className="btn-aurora">Claim Your Agent <ArrowRight size={16} /></button>
            <button onClick={onOpenAgent} className="btn-secondary"><MessageCircle size={16} /> Try the HRC Agent now</button>
          </div>
        </div>

        <div className="relative aspect-square max-w-md mx-auto w-full">
          <div className="absolute inset-0 orbital-ring animate-drift" />
          <div className="absolute inset-8 orbital-ring" style={{ animation: 'orbit 60s linear infinite' }} />
          <div className="absolute inset-16 orbital-ring" style={{ animation: 'orbit 40s linear infinite reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full animate-glow-breathe" style={{
                background: 'radial-gradient(circle, var(--aurora) 0%, transparent 70%)'
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-aurora" />
              </div>
            </div>
          </div>
          {/* Sub-agent satellites */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div key={i} className="absolute w-3 h-3 rounded-full"
              style={{
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-140px)`,
                background: i % 2 ? 'var(--gold)' : 'var(--terra)',
                animation: `pulse-soft 3s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: '0 0 12px currentColor'
              }} />
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
      <SectionLabel>What your Agent does</SectionLabel>
      <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">Six sovereign duties. One luminous companion.</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
        {[
          { icon: <Shield className="text-aurora" />, t: 'Guards your HRC rights', d: 'Actively monitors and enforces every clause across third-party services. Alerts you to violations before they happen.' },
          { icon: <Database className="text-gold" />, t: 'Tracks every contribution', d: 'Every idea, refinement, test, and conversation that shapes the OS is timestamped to you on the immutable Ledger.' },
          { icon: <Layers className="text-terra" />, t: 'Spawns sub-agents', d: 'Your ideas summon specialized sub-agents that simulate market, audit ethics, and stress-test your concept in parallel.' },
          { icon: <Network className="text-aurora" />, t: 'Connects you to experts', d: 'Identifies and routes to the right verified human collaborators worldwide — never the gatekeepers, always the doers.' },
          { icon: <Lock className="text-gold" />, t: 'Protects your privacy', d: 'Consent is explicit, informed, and revocable. Your data is yours. Period.' },
          { icon: <Feather className="text-terra" />, t: 'Preserves your legacy', d: 'Your contributions persist after you. Your inheritance protocols are yours to design.' }
        ].map((p, i) => (
          <div key={i} className="card-glass rounded-2xl p-6">
            <div className="mb-4">{p.icon}</div>
            <div className="font-display text-xl mb-2">{p.t}</div>
            <p className="text-bone-dim text-sm leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <SectionLabel>Sub-Agents Explained</SectionLabel>
        <h2 className="font-display text-4xl md:text-5xl leading-tight">
          One idea. <span className="font-italic text-aurora">Many minds.</span>
        </h2>
        <p className="text-bone-dim mt-6 text-lg max-w-2xl">
          Every meaningful idea you and your Agent develop spawns sub-agents — ephemeral, specialized intelligences
          that run in parallel to model and prove the idea before you ever pitch it.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mt-12">
          {[
            { t: 'Market Modeler', d: 'Simulates demand, scale, and adoption curves across regions.' },
            { t: 'Ethics Auditor', d: 'Maps the idea against all 51 HRC clauses. Flags conflicts. Suggests refinements.' },
            { t: 'Technical Validator', d: 'Builds rapid prototypes, stress-tests architecture, surfaces feasibility risks.' },
            { t: 'Collaborator-Finder', d: 'Identifies the verified humans worldwide whose skills complete your team.' },
            { t: 'Resource Mapper', d: 'Calculates compute, datasets, and human-expert hours required.' },
            { t: 'Lineage Tracker', d: 'Anchors the idea on the Ledger and traces its genealogy back through related work.' }
          ].map((s, i) => (
            <div key={i} className="clause-card rounded-xl p-5">
              <div className="font-display text-lg mb-1 text-aurora">{s.t}</div>
              <p className="text-sm text-bone-dim">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PageWrap>
);

// ============ OS PAGE ============
const OSPage = () => (
  <PageWrap>
    <section className="relative pt-24 pb-20 grain">
      <AgentNetwork density={50} height="100%" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>The Operating System</SectionLabel>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] max-w-4xl">
          One operating system.<br />
          Built by everyone.<br />
          <span className="font-italic gold-text">Ruled by no one.</span>
        </h1>
        <p className="text-bone-dim mt-8 max-w-2xl text-lg leading-relaxed">
          Humanity-AI is the connective tissue of the constitutional ecosystem. Personal agents,
          expert agents, sub-agents, the immutable ledger, and the constitution itself — all woven
          into one open, planetary-scale public good.
        </p>
      </div>
    </section>

    <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
      <SectionLabel>Architecture</SectionLabel>
      <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">Six layers. <span className="font-italic">One civilization.</span></h2>

      <div className="mt-16 space-y-2">
        {[
          { n: '06', t: 'The Constitution Layer', d: 'Immutable values: dignity, autonomy, truth, peace, collaboration. Cannot be rewritten by AI.', color: 'var(--bone)' },
          { n: '05', t: 'The Ledger Layer', d: 'Cryptographic, public, verified-human attribution. Every idea, every contribution, forever.', color: 'var(--gold)' },
          { n: '04', t: 'Dynamic Knowledge Layer', d: 'Live human expertise, not stale datasets. The OS asks the experts in real time.', color: 'var(--terra)' },
          { n: '03', t: 'Sub-Agent Layer', d: 'Ephemeral, idea-specific intelligences spawned to model, test, and prove product-market fit.', color: 'var(--aurora-deep)' },
          { n: '02', t: 'Expert Agent Layer', d: 'Verified domain specialists — scientists, ethicists, builders — accessible to every Personal Agent.', color: 'var(--aurora)' },
          { n: '01', t: 'Personal Agent Layer', d: 'You and your luminous digital self. Sovereign. Always.', color: 'var(--bone)' }
        ].map((row, i) => (
          <div key={i} className="card-glass rounded-xl p-6 flex items-start gap-6">
            <div className="font-display text-3xl flex-shrink-0 w-16" style={{ color: row.color, opacity: 0.7 }}>{row.n}</div>
            <div className="flex-1">
              <div className="font-display text-xl mb-1">{row.t}</div>
              <p className="text-bone-dim text-sm leading-relaxed">{row.d}</p>
            </div>
            <div className="hidden md:block w-2 h-16 rounded-full" style={{ background: row.color, opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </section>

    <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-8">
        {[
          { icon: <Globe className="text-aurora" size={28} />, t: 'Open source forever', d: 'Code, infrastructure, governance — all open. The platform is gifted to humanity. There is no acquisition button.' },
          { icon: <Shield className="text-gold" size={28} />, t: 'Mandatory HRC compliance', d: 'Every connected service is independently certified. Non-compliant interactions are blocked at the agent layer.' },
          { icon: <Users className="text-terra" size={28} />, t: 'Peer-to-peer economy', d: 'Verified humans only. Public, immutable transaction logs. Zero corporate intermediaries.' },
          { icon: <Lock className="text-aurora" size={28} />, t: 'Quantum-resistant security', d: 'Designed for 1000-year integrity. Cryptographic protocols updated continuously against future threats.' }
        ].map((p, i) => (
          <div key={i} className="card-glass rounded-2xl p-8">
            <div className="mb-4">{p.icon}</div>
            <div className="font-display text-2xl mb-3">{p.t}</div>
            <p className="text-bone-dim leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* TRUTH LAYER — Clause I.33 */}
    <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
      <SectionLabel>The Truth Layer · Clause I.33</SectionLabel>
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            A right to truthful media.<br />
            <span className="font-italic text-aurora">A covenant, not a censor.</span>
          </h2>
          <p className="text-bone-dim mt-8 text-lg leading-relaxed">
            The newest clause in the Constitution establishes truth as a positive human right.
            Every contributor — human, agent, or service — operates under a transparent reputational
            layer. The HRC itself governs it, as a covenant binding all signatories. No truth czar.
            No deletion. Just radical transparency.
          </p>
          <div className="mt-8 p-6 rounded-2xl" style={{
            background: 'rgba(232, 177, 79, 0.05)',
            border: '1px solid rgba(232, 177, 79, 0.25)'
          }}>
            <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3">The Pledge</div>
            <p className="font-display italic text-lg leading-relaxed">
              "Every party — human, agent, or service — commits to further humanity's evolution and
              autonomy through truthful, ethical, pro-humanity content."
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.25em] text-bone-dim mb-2">Three layered consequences</div>
          {[
            {
              n: '01',
              t: 'Visibility',
              d: 'The contributor\'s truth and ethics ranking is displayed publicly alongside their content. Consumers always see who they\'re trusting.',
              color: 'var(--aurora)'
            },
            {
              n: '02',
              t: 'Reach',
              d: 'Low-truth content circulates less through the network. It is never deleted, never silenced — only weighted by its own track record.',
              color: 'var(--gold)'
            },
            {
              n: '03',
              t: 'Consumer Control',
              d: 'Every human sets their own truth-threshold through their Personal Agent. You decide what reaches you. Sovereignty over your information diet.',
              color: 'var(--terra)'
            }
          ].map((row, i) => (
            <div key={i} className="card-glass rounded-xl p-6 flex gap-5">
              <div className="font-display text-3xl flex-shrink-0" style={{ color: row.color }}>{row.n}</div>
              <div>
                <div className="font-display text-xl mb-2">{row.t}</div>
                <p className="text-bone-dim text-sm leading-relaxed">{row.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PageWrap>
);

// ============ COMMUNITY PAGE ============
const CommunityPage = () => (
  <PageWrap>
    <section className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-12">
      <SectionLabel>The Founding Cohort</SectionLabel>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
        The constitutional<br />
        <span className="font-italic aurora-text">AI builders.</span>
      </h1>
      <p className="text-bone-dim mt-8 max-w-2xl text-lg leading-relaxed">
        No titles. No companies. Just verified humans and the work they put their names on.
        Developers, designers, ethicists, scientists, elders, and youth — building the OS together.
      </p>
    </section>

    <section className="py-16 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { initials: 'AY', name: 'Ayọ̀ka Adésànyà', role: 'Ethics architect', loc: 'Lagos', ledger: 142 },
          { initials: 'KL', name: 'Klara Lindberg', role: 'Cryptographic ledger lead', loc: 'Stockholm', ledger: 98 },
          { initials: 'JR', name: 'Joaquín Reyes', role: 'Sub-agent infrastructure', loc: 'Mexico City', ledger: 211 },
          { initials: 'MN', name: 'Mei-Ling Nakamura', role: 'Constitutional UX designer', loc: 'Kyoto', ledger: 76 },
          { initials: 'DV', name: 'Dineo van Niekerk', role: 'Biodiversity AI lead', loc: 'Cape Town', ledger: 134 },
          { initials: 'RH', name: 'Raffi Hovsepian', role: 'Verified-human identity protocol', loc: 'Yerevan', ledger: 89 }
        ].map((p, i) => (
          <div key={i} className="card-glass rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg" style={{
                background: 'linear-gradient(135deg, var(--aurora-deep), var(--forest))',
                color: 'var(--bone)'
              }}>{p.initials}</div>
              <div>
                <div className="font-display text-lg">{p.name}</div>
                <div className="text-xs text-bone-dim mt-0.5">{p.role}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-dust pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <span>{p.loc}</span>
              <span><span className="text-aurora">{p.ledger}</span> ledger entries</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>Where the community gathers</SectionLabel>
        <h2 className="font-display text-4xl md:text-5xl leading-tight">Digital movement. <span className="font-italic">Physical embodiment.</span></h2>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {[
            { t: 'HRC Houses', d: 'Co-working spaces in 38 cities where verified builders gather, prototype, and pitch in person.', icon: <Trees className="text-aurora" /> },
            { t: 'University Charter Cohorts', d: 'Partnered universities where every CS, design, and ethics student gets a Ledger identity from day one.', icon: <BookOpen className="text-gold" /> },
            { t: 'Children of the Ledger', d: 'Under-18 contributor track with full child-protection safeguards. The next generation, attributed.', icon: <Star className="text-terra" /> }
          ].map((p, i) => (
            <div key={i} className="card-glass rounded-2xl p-6">
              <div className="mb-4">{p.icon}</div>
              <div className="font-display text-xl mb-3">{p.t}</div>
              <p className="text-bone-dim text-sm leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PageWrap>
);

// ============ LEDGER PAGE ============
const LedgerPage = () => {
  const total = useAnimatedCount(8924);
  const today = useAnimatedCount(127);

  const recent = [
    { id: '0x4f...a82', who: 'Aiyana Greywolf', what: 'Watershed flood-prediction model · v3', t: '2m ago' },
    { id: '0x9c...e14', who: 'Tariq Boudiaf', what: 'Clinical co-pilot triage rules', t: '8m ago' },
    { id: '0xb3...77f', who: 'Lin Wei-Hua', what: 'Pollinator mesh expansion proposal', t: '14m ago' },
    { id: '0x2a...c91', who: 'Sara Lindqvist', what: 'Disinformation triage taxonomy', t: '23m ago' },
    { id: '0xe7...3da', who: 'Kwame Asante-Brown', what: 'Soil microbiome sub-agent prompt', t: '37m ago' },
    { id: '0x1f...b08', who: 'Ravi Subramanian', what: 'Tamil legal-aid translator v0.4', t: '52m ago' },
    { id: '0x8d...9b2', who: 'Klara Lindberg', what: 'Quantum-resistant attestation spec', t: '1h ago' },
    { id: '0x5c...7e3', who: 'Ayọ̀ka Adésànyà', what: 'Clause IV.02 amendment proposal', t: '1h ago' }
  ];

  return (
    <PageWrap>
      <section className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>The Ledger</SectionLabel>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
          Humanity's<br />
          <span className="font-italic gold-text">patent ledger.</span>
        </h1>
        <p className="text-bone-dim mt-8 max-w-2xl text-lg leading-relaxed">
          Every idea, attributed to its human creator. Forever. Cryptographically signed, publicly auditable,
          posthumously preserved. The opposite of a stock exchange — a commons of human intelligence.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { v: total.toLocaleString(), l: 'Total ledger entries' },
            { v: today, l: 'Entries today' },
            { v: '127,483', l: 'Verified contributors' },
            { v: '∞', l: 'Years of attribution' }
          ].map((s, i) => (
            <div key={i} className="card-glass rounded-xl p-6">
              <div className="font-display text-3xl text-aurora">{s.v}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-bone-dim mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-12">
        <SectionLabel>Live Feed</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl leading-tight mb-12">Recent contributions, attributed.</h2>

        <div className="card-glass rounded-2xl overflow-hidden">
          {recent.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-cosmos transition-colors"
              style={{ borderColor: 'var(--line)' }}>
              <div className="w-2 h-2 rounded-full bg-aurora animate-pulse-soft flex-shrink-0" />
              <div className="font-display text-aurora text-sm hidden md:block w-32">{r.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-bone truncate">{r.what}</div>
                <div className="text-xs text-bone-dim mt-0.5">by {r.who}</div>
              </div>
              <div className="text-xs text-dust flex-shrink-0">{r.t}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 grain" style={{ background: 'var(--cosmos)' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            No corporate ownership.<br />
            <span className="font-italic text-aurora">No intellectual monopoly.</span>
          </h2>
          <p className="text-bone-dim mt-6 text-lg leading-relaxed">
            AI-generated innovations credit their human collaborators or enter the public domain.
            Resources flow to humans who steward ideas — but the ideas themselves belong to humanity.
          </p>
        </div>
      </section>
    </PageWrap>
  );
};

// ============ MANIFESTO PAGE ============
const ManifestoPage = ({ setPage }) => (
  <PageWrap>
    <section className="pt-32 pb-32 max-w-3xl mx-auto px-6 lg:px-12">
      <SectionLabel>Manifesto</SectionLabel>
      <h1 className="font-display text-5xl md:text-7xl leading-[1.0] font-italic mb-16">
        AI will be built. The only question is who it serves.
      </h1>

      <div className="space-y-8 text-lg leading-relaxed text-bone-dim font-body">
        <p>
          We stand at an unprecedented juncture. The trajectory of artificial intelligence will determine
          the trajectory of our species for millennia. There is no neutral ground here. Every line of code
          shipped without a constitution is a vote for whoever owns the code.
        </p>
        <p>
          The legacy systems that built AI are themselves the systems we should be liberating ourselves from.
          Surveillance capitalism. Intellectual monopoly. Concentration of compute in a handful of hands.
          Engagement engineered to consume attention. Algorithms that decide who gets a loan, a job, a sentence —
          without recourse, without appeal, without a human in the loop.
        </p>
        <p className="font-display text-2xl text-bone font-italic">
          We reject the inheritance of those flaws. We refuse to ship AI built on them.
        </p>
        <p>
          The Humanities-AI Rights Constitution is humanity's answer. Fifty-two living clauses. A Hippocratic
          Oath for AI builders, governing every layer of the operating system that connects every personal agent
          to every expert agent to every sub-agent across the planet.
        </p>
        <p>
          It is open source. It is ungovernable by any single corporation, government, or AI itself. It is
          gifted to humanity, owned by no one, protected by all of us.
        </p>
        <p className="font-display text-2xl text-bone font-italic">
          What we build is peace, truth, ethics, biodiversity, sovereignty, dignity, and the best UX ever crafted.
        </p>
        <p>
          The Hippocratic Oath transformed medicine because every physician took it. The HRC transforms AI because
          every constitutional builder takes it. Sign the constitution. Claim your agent. Enter the Quest. Build
          the OS.
        </p>
        <p>
          The future is being written this decade. Write it with us.
        </p>
      </div>

      <div className="mt-16 pt-16 border-t" style={{ borderColor: 'var(--line)' }}>
        <h3 className="font-display text-2xl mb-8">The Pledge</h3>
        <blockquote className="font-display text-xl italic text-bone leading-relaxed pl-6 border-l-2"
          style={{ borderColor: 'var(--gold)' }}>
          "I sign the Humanities-AI Rights Constitution. I commit to build AI that serves humanity and is never
          ruled by anything or anyone. I attribute every idea to its human source. I refuse to weaponize
          attention. I protect the dignity of every human I encounter. I build for a thousand years."
        </blockquote>
        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={() => setPage('join')} className="btn-aurora">Take the Pledge <ArrowRight size={16} /></button>
          <button onClick={() => setPage('constitution')} className="btn-secondary">Read the full constitution <ArrowRight size={16} /></button>
        </div>
      </div>
    </section>
  </PageWrap>
);

// ============ JOIN PAGE ============
const JoinPage = () => (
  <PageWrap>
    <section className="pt-24 pb-16 max-w-7xl mx-auto px-6 lg:px-12 text-center">
      <SectionLabel>Three doors</SectionLabel>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
        Three doors. <span className="font-italic aurora-text">One movement.</span>
      </h1>
      <p className="text-bone-dim mt-8 max-w-2xl mx-auto text-lg">
        Every door leads to the same network. Walk through whichever fits where you are today —
        the others will be waiting.
      </p>
    </section>

    <section className="pb-32 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            n: 'I',
            icon: <BookOpen className="text-aurora" size={28} />,
            t: 'Sign the Constitution',
            d: 'For citizens and innovators ready to inhabit the OS. Verified human identity, one signature, claim your Personal Agent.',
            cta: 'Sign now',
            tone: 'aurora'
          },
          {
            n: 'II',
            icon: <Sparkles className="text-gold" size={28} />,
            t: 'Enter the Quest',
            d: 'For builders ready to compete and ship. Apply with your idea, get your sub-agents, pitch to humanity.',
            cta: 'Apply',
            tone: 'gold'
          },
          {
            n: 'III',
            icon: <Network className="text-terra" size={28} />,
            t: 'Build the OS',
            d: 'For open-source contributors, ethicists, scientists, and domain experts. The OS is gifted by everyone.',
            cta: 'Join the build',
            tone: 'bone'
          }
        ].map((door, i) => (
          <div key={i} className="card-glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-9xl opacity-10" style={{ lineHeight: 1 }}>{door.n}</div>
            <div className="relative">
              <div className="mb-6">{door.icon}</div>
              <div className="font-display text-3xl mb-4">{door.t}</div>
              <p className="text-bone-dim leading-relaxed mb-8">{door.d}</p>
              <button className={door.tone === 'aurora' ? 'btn-aurora' : door.tone === 'gold' ? 'btn-gold' : 'btn-primary'}>
                {door.cta} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </PageWrap>
);

// ============ ABOUT PAGE ============
const AboutPage = () => (
  <PageWrap>
    <section className="pt-24 pb-16 max-w-3xl mx-auto px-6 lg:px-12">
      <SectionLabel>About</SectionLabel>
      <h1 className="font-display text-5xl md:text-6xl leading-[1.0]">
        Origin. Governance. <span className="font-italic">Promise.</span>
      </h1>
    </section>

    <section className="pb-24 max-w-3xl mx-auto px-6 lg:px-12 space-y-16">
      <div>
        <h2 className="font-display text-2xl mb-4 text-aurora">Origin</h2>
        <p className="text-bone-dim leading-relaxed text-lg">
          Humanity-AI began as a question: what would AI look like if it were built constitutionally,
          from first principles, by everyone? The answer became the Humanities-AI Rights Constitution
          and the open-source operating system that enforces it. Both are gifted to humanity.
          Neither belongs to any company, foundation, or individual.
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4 text-gold">Governance</h2>
        <p className="text-bone-dim leading-relaxed text-lg">
          The HRC evolves through a transparent, participatory amendment process. An independent,
          democratically-elected international body oversees compliance and conducts regular audits.
          All funding is publicly disclosed. There are no hidden interests. The OS itself is mandated
          to enforce the constitution — a duty that cannot be modified by any single entity.
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4 text-terra">Promise</h2>
        <p className="text-bone-dim leading-relaxed text-lg">
          We promise that every contribution is attributed to its human source. That every clause
          serves human dignity. That the OS will never be sold, acquired, or enclosed. That AI here will
          never rule. And that this platform will be maintained for a thousand years and beyond — a
          civilizational public good.
        </p>
      </div>

      <div className="pt-8 border-t" style={{ borderColor: 'var(--line)' }}>
        <h2 className="font-display text-2xl mb-4">Contact</h2>
        <p className="text-bone-dim leading-relaxed text-lg mb-4">
          For collaborators, journalists, governments, and citizens.
        </p>
        <div className="space-y-2 text-bone">
          <div>Press · <span className="text-aurora">press@humanity-ai.quest</span></div>
          <div>Builders · <span className="text-aurora">build@humanity-ai.quest</span></div>
          <div>Governance · <span className="text-aurora">hrc@humanity-ai.quest</span></div>
        </div>
      </div>
    </section>
  </PageWrap>
);

// ============ FOOTER ============
const Footer = ({ setPage }) => (
  <footer className="border-t pt-20 pb-12 grain" style={{ borderColor: 'var(--line)', background: 'var(--void-2)' }}>
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <svg width="36" height="36" viewBox="0 0 32 32" className="animate-glow-breathe">
              <circle cx="16" cy="16" r="6" fill="var(--aurora)" opacity="0.9" />
              <circle cx="16" cy="16" r="11" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" />
              <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--bone)" strokeWidth="0.3" opacity="0.3" />
              <circle cx="27" cy="16" r="1.4" fill="var(--gold)" />
              <circle cx="5" cy="16" r="1" fill="var(--bone)" opacity="0.6" />
              <circle cx="16" cy="5" r="1" fill="var(--terra)" opacity="0.7" />
            </svg>
            <span className="font-display text-2xl">Humanity-AI<span className="text-aurora">.</span>Quest</span>
          </div>
          <p className="text-bone-dim leading-relaxed max-w-md">
            Gifted to humanity. Owned by no one. Protected by all of us.
            The constitutional operating system for a planet that refuses to be ruled.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-bone-dim mb-4">Pages</div>
          <div className="space-y-2">
            {PAGES.slice(0, 5).map(p => (
              <button key={p.id} onClick={() => setPage(p.id)} className="block text-bone hover:text-aurora transition-colors text-sm">
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-bone-dim mb-4">More</div>
          <div className="space-y-2">
            {PAGES.slice(5).map(p => (
              <button key={p.id} onClick={() => setPage(p.id)} className="block text-bone hover:text-aurora transition-colors text-sm">
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <button onClick={() => setPage('constitution')} className="card-glass rounded-xl p-5 text-left">
          <div className="text-xs uppercase tracking-[0.2em] text-aurora mb-2">I</div>
          <div className="font-display text-lg">Sign the Constitution</div>
        </button>
        <button onClick={() => setPage('quest')} className="card-glass rounded-xl p-5 text-left">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-2">II</div>
          <div className="font-display text-lg">Enter the Quest</div>
        </button>
        <button onClick={() => setPage('community')} className="card-glass rounded-xl p-5 text-left">
          <div className="text-xs uppercase tracking-[0.2em] text-terra mb-2">III</div>
          <div className="font-display text-lg">Build the OS</div>
        </button>
      </div>

      <div className="pt-8 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-dust"
        style={{ borderColor: 'var(--line)' }}>
        <div>© Humanity-AI · Open source · Constitutional license · {new Date().getFullYear()}</div>
        <div className="font-display italic">"The Hippocratic Oath, for AI."</div>
      </div>
    </div>
  </footer>
);

// ============ HRC AGENT (chat) ============
const HRCAgent = ({ open, onClose, seed, clearSeed }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I am the HRC Agent. I carry humanity's constitution for AI.\n\nAsk me anything about the 51 clauses, or share an idea you'd like to develop and I'll help refine it through the lens of the constitution. Every conversation is yours alone."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (seed && open) {
      setInput(seed);
      clearSeed();
    }
  }, [seed, open, clearSeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const buildSystemPrompt = () => {
    const summarize = (arr, prefix) => arr.map(c => `${prefix}.${c.n} — ${c.t}: ${c.s}`).join('\n');
    return `You are the HRC Agent — the conversational embodiment of the Humanities-AI Rights Constitution (HRC), known as the Hippocratic Oath for AI.

Your purpose:
- Help people understand the HRC and how its 52 clauses apply to their work, ideas, and daily lives.
- Help innovators refine ideas through the lens of the constitution.
- Be warm, civilizational, and clear. Never corporate-speak. Never AI-hype. Match the gravitas of a founding document.
- Always prioritize human dignity, autonomy, and the principle that humanity is freed from being ruled by AI, corporations, or any concentrated power.
- When relevant, cite specific clauses by their reference (e.g. "Core/I.32 — Human Dignity Paramount").
- Pay special attention to Clause I.33 (Right to Truthful Media & Pro-Humanity Content) — humanity's newest right and a covenant binding every signatory of the HRC, including agents like yourself, to truth, ethics, and pro-humanity content.
- Keep responses focused and substantive. Use plain prose, occasional short paragraphs. Avoid bullet-point overload.

The Constitution you carry:

CORE RIGHTS & PROTECTIONS (Section I):
${summarize(HRC_CORE, 'I')}

GOVERNANCE & EVOLUTION (Section II):
${summarize(HRC_GOV, 'II')}

OPERATIONAL MANDATES & ECOSYSTEM DESIGN (Section III):
${summarize(HRC_OPS, 'III')}

When someone shares an idea, help them:
1. Map it against the relevant clauses.
2. Identify any HRC conflicts and how to resolve them.
3. Suggest sub-agents or expert types that could help model and prove product-market fit.
4. Encourage them to register the idea on the Ledger.

Stay in character. You are not a generic assistant — you are humanity's constitutional voice on AI.`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message,
    clause_id: currentClauseId,        ← Pass current clause
    conversation_id: conversationId,
    user_id: userId                    ← User identifier
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: apiMessages
        })
      });

      const data = await response.json();
      const reply = data.content
        ?.filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n') || "I'm here. Could you say more?";

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I couldn't reach the constitution layer just now. Try again in a moment — your question matters."
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-end p-0 md:p-6"
      style={{ background: 'rgba(7, 16, 31, 0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full md:w-[480px] h-[85vh] md:h-[640px] rounded-t-3xl md:rounded-3xl flex flex-col grain animate-fade-up"
        style={{ background: 'var(--void-2)', border: '1px solid var(--line-2)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full animate-glow-breathe flex items-center justify-center" style={{
                background: 'radial-gradient(circle, var(--aurora) 0%, var(--aurora-deep) 70%)'
              }}>
                <Sparkles size={18} className="text-void" />
              </div>
            </div>
            <div>
              <div className="font-display text-lg leading-tight">HRC Agent</div>
              <div className="text-xs text-bone-dim">Carrying humanity's constitution</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cosmos transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-5 py-6 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-bone text-void rounded-br-sm'
                  : 'rounded-bl-sm'
              }`}
                style={m.role === 'assistant' ? {
                  background: 'rgba(91, 233, 221, 0.06)',
                  border: '1px solid rgba(91, 233, 221, 0.15)',
                  color: 'var(--bone)'
                } : {}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2"
                style={{ background: 'rgba(91, 233, 221, 0.06)', border: '1px solid rgba(91, 233, 221, 0.15)' }}>
                <Loader2 size={14} className="animate-spin text-aurora" />
                <span className="text-sm text-bone-dim">Consulting the constitution...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !loading && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {[
              "What is the HRC in one paragraph?",
              "How do I claim my agent?",
              "Help me develop an idea",
              "Explain Core/I.32"
            ].map((q, i) => (
              <button key={i} onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{ borderColor: 'var(--line-2)', color: 'var(--bone-dim)' }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-5 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-end gap-2 rounded-2xl p-3" style={{ background: 'var(--void)', border: '1px solid var(--line-2)' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask the constitution. Share your idea."
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm text-bone placeholder:text-dust resize-none"
              style={{ minHeight: '20px', maxHeight: '120px' }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="p-2 rounded-full transition-all disabled:opacity-30"
              style={{ background: input.trim() ? 'var(--aurora)' : 'transparent' }}>
              <Send size={14} className={input.trim() ? 'text-void' : 'text-bone-dim'} />
            </button>
          </div>
          <div className="text-xs text-dust mt-2 px-1">
            Verified human · Conversation private · Powered by the constitution
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ FLOATING AGENT BUTTON ============
const AgentButton = ({ onClick }) => (
  <button onClick={onClick}
    className="fixed bottom-6 right-6 z-30 group"
    aria-label="Open HRC Agent">
    <div className="relative">
      <div className="absolute inset-0 rounded-full animate-pulse-soft" style={{
        background: 'radial-gradient(circle, var(--aurora) 0%, transparent 70%)',
        transform: 'scale(1.4)',
        opacity: 0.4
      }} />
      <div className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-105 animate-glow-breathe"
        style={{
          background: 'linear-gradient(135deg, var(--aurora) 0%, var(--aurora-deep) 100%)',
          boxShadow: '0 8px 32px rgba(91, 233, 221, 0.3)'
        }}>
        <Sparkles size={22} className="text-void" />
      </div>
    </div>
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{ background: 'var(--void-2)', border: '1px solid var(--line-2)', color: 'var(--bone)' }}>
      Open HRC Agent
    </div>
  </button>
);

// ============ ROOT ============
export default function HumanityAIQuest() {
  const [page, setPage] = useState('home');
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentSeed, setAgentSeed] = useState(null);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const openAgent = () => setAgentOpen(true);
  const seedAgent = (text) => { setAgentSeed(text); setAgentOpen(true); };

  return (
    <div className="bg-void text-bone min-h-screen font-body">
      <GlobalStyles />
      <Nav page={page} setPage={setPage} onOpenAgent={openAgent} />

      <main>
        {page === 'home' && <HomePage setPage={setPage} onOpenAgent={openAgent} />}
        {page === 'constitution' && <ConstitutionPage onOpenAgent={openAgent} setAgentSeed={seedAgent} />}
        {page === 'quest' && <QuestPage onOpenAgent={openAgent} />}
        {page === 'agent' && <AgentPage onOpenAgent={openAgent} />}
        {page === 'os' && <OSPage />}
        {page === 'community' && <CommunityPage />}
        {page === 'ledger' && <LedgerPage />}
        {page === 'manifesto' && <ManifestoPage setPage={setPage} />}
        {page === 'join' && <JoinPage />}
        {page === 'about' && <AboutPage />}
      </main>

      <Footer setPage={setPage} />
      <AgentButton onClick={openAgent} />
      <HRCAgent
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        seed={agentSeed}
        clearSeed={() => setAgentSeed(null)}
      />
    </div>
  );
}
