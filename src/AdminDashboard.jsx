import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, MessageCircle, Lightbulb, FileText, Shield,
  Trash2, Flag, CheckCircle, XCircle, ChevronDown, ChevronRight,
  Loader2, Search, Filter, Edit2, Save, X, AlertTriangle,
  RefreshCw, Eye, EyeOff, Clock, User, Ban, UserCheck,
  ChevronUp, MoreHorizontal, Check
} from 'lucide-react';

/* ============================================================
   ADMIN DASHBOARD — Humanity-AI.Quest
   ACL levels: L4 = moderator, L5 = super-admin
   ============================================================ */

// ─── shared API helper (mirrors App.jsx) ────────────────────
async function apiCall(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── ACL helpers ────────────────────────────────────────────
// ACL levels: 0=user, 1=viewer, 2=moderator, 3=editor, 4=manager, 5=super admin
const aclLevel = (auth) => {
  return auth?.user?.acl_level ?? 0;
};

// ─── shared sub-components ──────────────────────────────────

const Spinner = ({ size = 16 }) => (
  <Loader2 size={size} className="animate-spin" style={{ color: 'var(--aurora)' }} />
);

const Badge = ({ label, color = 'dust' }) => {
  const colors = {
    dust:    { bg: 'rgba(107,117,147,0.18)', text: 'var(--dust)' },
    aurora:  { bg: 'rgba(91,233,221,0.14)',  text: 'var(--aurora)' },
    gold:    { bg: 'rgba(232,177,79,0.18)',  text: 'var(--gold)' },
    red:     { bg: 'rgba(220,60,60,0.18)',   text: '#f87171' },
    green:   { bg: 'rgba(52,211,153,0.14)',  text: '#34d399' },
    orange:  { bg: 'rgba(251,146,60,0.18)',  text: '#fb923c' },
    bone:    { bg: 'rgba(242,234,211,0.10)', text: 'var(--bone-dim)' },
    violet:  { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  };
  const c = colors[color] || colors.dust;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, letterSpacing: '0.04em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  const map = {
    active:        { label: 'Active',        color: 'green' },
    suspended:     { label: 'Suspended',     color: 'orange' },
    banned:        { label: 'Banned',        color: 'red' },
    admin:         { label: 'Admin',         color: 'aurora' },
    superadmin:    { label: 'Super-Admin',   color: 'gold' },
    user:          { label: 'User',          color: 'bone' },
    anon:          { label: 'Anon',          color: 'dust' },
    flagged:       { label: 'Flagged',       color: 'red' },
    submitted:     { label: 'Submitted',     color: 'dust' },
    under_review:  { label: 'Under Review',  color: 'aurora' },
    accepted:      { label: 'Accepted',      color: 'green' },
    implemented:   { label: 'Implemented',   color: 'gold' },
    deferred:      { label: 'Deferred',      color: 'orange' },
    rejected:      { label: 'Rejected',      color: 'red' },
    deleted:       { label: 'Deleted',       color: 'red' },
  };
  const b = map[status] || { label: status, color: 'dust' };
  return <Badge label={b.label} color={b.color} />;
};

const AclTag = ({ level }) => (
  <span style={{ fontSize: 10, color: 'var(--dust)', fontWeight: 500 }}>
    L{level}+
  </span>
);

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger = true }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(7,16,31,0.75)', backdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--void-2)', border: '1px solid var(--line-2)',
          borderRadius: 16, padding: 28, maxWidth: 380, width: '90%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={20} color={danger ? '#f87171' : 'var(--gold)'} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
        </div>
        <p style={{ color: 'var(--bone-dim)', fontSize: 14, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>Cancel</button>
          <button onClick={onConfirm} style={btnStyle(danger ? 'danger' : 'primary')}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

// ─── inline style helpers ────────────────────────────────────
const btnStyle = (variant = 'ghost', small = false) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: small ? '3px 10px' : '6px 14px',
    borderRadius: 8, fontSize: small ? 11 : 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { ...base, background: 'var(--bone)', color: 'var(--void)' },
    aurora:  { ...base, background: 'rgba(91,233,221,0.15)', color: 'var(--aurora)', border: '1px solid rgba(91,233,221,0.25)' },
    gold:    { ...base, background: 'rgba(232,177,79,0.15)', color: 'var(--gold)',   border: '1px solid rgba(232,177,79,0.25)' },
    danger:  { ...base, background: 'rgba(220,60,60,0.2)',   color: '#f87171',       border: '1px solid rgba(220,60,60,0.3)' },
    orange:  { ...base, background: 'rgba(251,146,60,0.15)', color: '#fb923c',       border: '1px solid rgba(251,146,60,0.25)' },
    ghost:   { ...base, background: 'rgba(242,234,211,0.06)', color: 'var(--bone-dim)', border: '1px solid var(--line)' },
    green:   { ...base, background: 'rgba(52,211,153,0.12)', color: '#34d399',       border: '1px solid rgba(52,211,153,0.25)' },
  };
  return variants[variant] || variants.ghost;
};

const inputStyle = {
  background: 'var(--cosmos)', border: '1px solid var(--line-2)',
  borderRadius: 8, padding: '6px 12px', color: 'var(--bone)',
  fontSize: 13, outline: 'none', width: '100%',
};

const cardStyle = {
  background: 'linear-gradient(135deg,rgba(19,31,50,0.6) 0%,rgba(12,24,40,0.4) 100%)',
  border: '1px solid var(--line)', borderRadius: 12, padding: 16,
};

const tableHeadStyle = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--dust)', fontWeight: 600, padding: '8px 12px',
  borderBottom: '1px solid var(--line)', background: 'rgba(7,16,31,0.4)',
};

const tdStyle = { padding: '10px 12px', fontSize: 13, color: 'var(--bone-dim)', verticalAlign: 'middle' };

// ─── date formatter ─────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return d; }
};

// ─── empty state ─────────────────────────────────────────────
const Empty = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'var(--dust)' }}>
    <Icon size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
    <span style={{ fontSize: 14 }}>{label}</span>
  </div>
);

// ─── error banner ─────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <div style={{ ...cardStyle, border: '1px solid rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: '#f87171', fontSize: 13 }}>{message}</span>
    {onRetry && <button onClick={onRetry} style={btnStyle('danger', true)}><RefreshCw size={12} /> Retry</button>}
  </div>
);

/* ============================================================
   TAB 1 — USERS
   ============================================================ */
const UsersTab = ({ auth, level }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { action, user }
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/users', 'GET', null, auth.token);
      setUsers(data.users ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.display_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const doAction = async (action, user, extra = {}) => {
    setActionLoading(user.id + action);
    try {
      await apiCall('/api/admin/users', 'POST', { user_id: user.id, action, ...extra }, auth.token);
      await load();
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setActionLoading(null); setConfirm(null); setBanReason(''); }
  };

  const requestAction = (action, user) => {
    setConfirm({ action, user });
    setBanReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* search bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <Empty icon={Users} label="No users found" />
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ ...tableHeadStyle, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <td style={{ ...tdStyle, color: 'var(--bone)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--cosmos)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: 'var(--aurora)', fontWeight: 700, flexShrink: 0,
                      }}>
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.display_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>{u.email || '—'}</td>
                  <td style={tdStyle}>{statusBadge(u.role || 'user')}</td>
                  <td style={{ ...tdStyle }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {statusBadge(u.status || 'active')}
                      {u.ban_reason && (
                        <span style={{ fontSize: 10, color: '#f87171', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.ban_reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>{fmtDate(u.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {level >= 4 && u.status !== 'active' && (
                        <button
                          onClick={() => requestAction('activate', u)}
                          disabled={!!actionLoading}
                          style={btnStyle('green', true)}
                          title="Activate (L4+)"
                        >
                          {actionLoading === u.id + 'activate' ? <Spinner /> : <UserCheck size={12} />}
                          Activate <AclTag level={4} />
                        </button>
                      )}
                      {level >= 4 && u.status !== 'suspended' && u.status !== 'banned' && (
                        <button
                          onClick={() => requestAction('suspend', u)}
                          disabled={!!actionLoading}
                          style={btnStyle('orange', true)}
                          title="Suspend (L4+)"
                        >
                          {actionLoading === u.id + 'suspend' ? <Spinner /> : <Clock size={12} />}
                          Suspend <AclTag level={4} />
                        </button>
                      )}
                      {level >= 4 && u.status !== 'banned' && (
                        <button
                          onClick={() => requestAction('ban', u)}
                          disabled={!!actionLoading}
                          style={btnStyle('danger', true)}
                          title="Ban (L4+)"
                        >
                          {actionLoading === u.id + 'ban' ? <Spinner /> : <Ban size={12} />}
                          Ban <AclTag level={4} />
                        </button>
                      )}
                      {level >= 5 && (u.acl_level ?? 0) < 1 && (
                        <button
                          onClick={() => requestAction('promote', u)}
                          disabled={!!actionLoading}
                          style={btnStyle('aurora', true)}
                          title="Promote to Admin (L5 only)"
                        >
                          {actionLoading === u.id + 'promote' ? <Spinner /> : <Shield size={12} />}
                          Promote <AclTag level={5} />
                        </button>
                      )}
                      {level >= 5 && (u.acl_level ?? 0) >= 1 && (
                        <button
                          onClick={() => requestAction('revoke_admin', u)}
                          disabled={!!actionLoading}
                          style={btnStyle('danger', true)}
                          title="Revoke Admin (L5 only)"
                        >
                          {actionLoading === u.id + 'revoke_admin' ? <Spinner /> : <XCircle size={12} />}
                          Revoke <AclTag level={5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(7,16,31,0.8)', backdropFilter: 'blur(6px)',
          }}
          onClick={() => setConfirm(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--void-2)', border: '1px solid var(--line-2)', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#f87171" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                Confirm: {confirm.action.replace('_', ' ')} "{confirm.user.display_name || confirm.user.email}"
              </span>
            </div>
            {confirm.action === 'ban' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--dust)', display: 'block', marginBottom: 6 }}>Ban reason (visible to user)</label>
                <input
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="Reason for ban…"
                  style={inputStyle}
                />
              </div>
            )}
            <p style={{ color: 'var(--bone-dim)', fontSize: 13, marginBottom: 20 }}>
              {confirm.action === 'ban'     && 'This user will lose access to the platform.'}
              {confirm.action === 'suspend' && 'This user will be temporarily unable to sign in.'}
              {confirm.action === 'activate' && 'This user account will be restored to active.'}
              {confirm.action === 'promote' && 'This user will gain admin (L4) privileges.'}
              {confirm.action === 'revoke_admin' && 'Admin privileges will be removed from this user.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={btnStyle('ghost')}>Cancel</button>
              <button
                onClick={() => doAction(confirm.action, confirm.user, confirm.action === 'ban' ? { ban_reason: banReason } : {})}
                style={btnStyle('danger')}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   TAB 2 — CONVERSATIONS
   ============================================================ */
const ConversationsTab = ({ auth, level }) => {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | flagged | anon | registered
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/conversations', 'GET', null, auth.token);
      setConvs(data.conversations ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const filtered = convs.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || (c.first_message || '').toLowerCase().includes(q);
    const matchF = filter === 'all'
      ? true
      : filter === 'flagged' ? c.flagged
      : filter === 'anon' ? !c.user_id
      : !!c.user_id;
    return matchQ && matchF;
  });

  const toggleFlag = async (c) => {
    setActionLoading(c.id);
    try {
      await apiCall('/api/admin/conversations', 'POST', { conversation_id: c.id, action: c.flagged ? 'unflag' : 'flag' }, auth.token);
      setConvs(prev => prev.map(x => x.id === c.id ? { ...x, flagged: !x.flagged } : x));
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setActionLoading(null); }
  };

  const filterOpts = [
    { value: 'all',        label: 'All' },
    { value: 'flagged',    label: 'Flagged' },
    { value: 'anon',       label: 'Anon only' },
    { value: 'registered', label: 'Registered' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterOpts.map(o => (
            <button key={o.value} onClick={() => setFilter(o.value)}
              style={{ ...btnStyle(filter === o.value ? 'aurora' : 'ghost', true) }}>
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <Empty icon={MessageCircle} label="No conversations found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ ...cardStyle, padding: 0 }}>
              {/* header row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  cursor: 'pointer', userSelect: 'none',
                }}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    {statusBadge(c.user_id ? 'user' : 'anon')}
                    {c.flagged && <Badge label="Flagged" color="red" />}
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>{c.message_count ?? 0} msgs</span>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>{fmtDate(c.created_at)}</span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 13, color: 'var(--bone-dim)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.first_message || '(no preview)'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFlag(c); }}
                    style={btnStyle(c.flagged ? 'danger' : 'ghost', true)}
                    title={c.flagged ? 'Unflag' : 'Flag'}
                  >
                    {actionLoading === c.id ? <Spinner /> : <Flag size={12} />}
                    {c.flagged ? 'Unflag' : 'Flag'}
                  </button>
                  {expanded === c.id ? <ChevronDown size={16} color="var(--dust)" /> : <ChevronRight size={16} color="var(--dust)" />}
                </div>
              </div>

              {/* expanded messages */}
              {expanded === c.id && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(c.messages || []).length === 0 ? (
                    <span style={{ fontSize: 13, color: 'var(--dust)' }}>No message detail available.</span>
                  ) : (
                    (c.messages || []).map((m, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: 8,
                        background: m.role === 'user' ? 'rgba(91,233,221,0.06)' : 'rgba(232,177,79,0.06)',
                        border: `1px solid ${m.role === 'user' ? 'rgba(91,233,221,0.12)' : 'rgba(232,177,79,0.12)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: m.role === 'user' ? 'var(--aurora)' : 'var(--gold)', textTransform: 'uppercase' }}>
                            {m.role}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--dust)' }}>{fmtDate(m.created_at)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   TAB 3 — IDEAS
   ============================================================ */
const IDEA_STATUSES = ['submitted', 'under_review', 'accepted', 'implemented', 'deferred', 'rejected', 'deleted'];

const IdeasTab = ({ auth, level }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState({}); // { [id]: { status, comment } }
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/ideas', 'GET', null, auth.token);
      setIdeas(data.ideas ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const filtered = ideas.filter(i => {
    const q = search.toLowerCase();
    return !q || (i.title || '').toLowerCase().includes(q) || (i.submitter_name || '').toLowerCase().includes(q);
  });

  const startEdit = (idea) => {
    setEditing(prev => ({
      ...prev,
      [idea.id]: { status: idea.status || 'submitted', comment: idea.admin_comment || '' },
    }));
    setExpanded(idea.id);
  };

  const saveEdit = async (idea) => {
    const e = editing[idea.id];
    if (!e) return;
    setSaving(idea.id);
    try {
      await apiCall('/api/admin/ideas', 'POST', { idea_id: idea.id, action: 'update_status', status: e.status, admin_comment: e.comment }, auth.token);
      setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, status: e.status, admin_comment: e.comment } : x));
      setEditing(prev => { const n = { ...prev }; delete n[idea.id]; return n; });
    } catch (err) { alert(`Error: ${err.message}`); }
    finally { setSaving(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas…" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <Empty icon={Lightbulb} label="No ideas found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => {
            const isEditing = !!editing[idea.id];
            const ed = editing[idea.id] || {};
            return (
              <div key={idea.id} style={cardStyle}>
                {/* header */}
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {statusBadge(idea.status || 'submitted')}
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>by {idea.submitter_name || 'Anonymous'}</span>
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>{fmtDate(idea.created_at)}</span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--bone)', lineHeight: 1.4 }}>
                      {idea.title || '(Untitled)'}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); startEdit(idea); }}
                      style={btnStyle('aurora', true)}
                    >
                      <Edit2 size={12} /> Review
                    </button>
                    {expanded === idea.id ? <ChevronDown size={16} color="var(--dust)" /> : <ChevronRight size={16} color="var(--dust)" />}
                  </div>
                </div>

                {/* expanded */}
                {expanded === idea.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {idea.body && (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{idea.body}</p>
                    )}

                    {/* admin review panel */}
                    <div style={{ background: 'rgba(7,16,31,0.4)', borderRadius: 10, padding: 14, border: '1px solid var(--line-2)' }}>
                      <div style={{ fontSize: 11, color: 'var(--dust)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 10 }}>
                        Admin Review
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                        {IDEA_STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => isEditing && setEditing(prev => ({ ...prev, [idea.id]: { ...prev[idea.id], status: s } }))}
                            style={{
                              ...btnStyle(isEditing && ed.status === s ? 'aurora' : 'ghost', true),
                              opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'default',
                            }}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={isEditing ? ed.comment : (idea.admin_comment || '')}
                        onChange={e => isEditing && setEditing(prev => ({ ...prev, [idea.id]: { ...prev[idea.id], comment: e.target.value } }))}
                        placeholder="Admin comment (visible to submitter)…"
                        readOnly={!isEditing}
                        rows={3}
                        style={{
                          ...inputStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 70,
                          opacity: isEditing ? 1 : 0.6,
                        }}
                      />
                      {isEditing && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button
                            onClick={() => saveEdit(idea)}
                            disabled={saving === idea.id}
                            style={btnStyle('primary')}
                          >
                            {saving === idea.id ? <Spinner /> : <Save size={13} />} Save
                          </button>
                          <button
                            onClick={() => setEditing(prev => { const n = { ...prev }; delete n[idea.id]; return n; })}
                            style={btnStyle('ghost')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {!isEditing && idea.admin_comment && (
                        <p style={{ fontSize: 12, color: 'var(--aurora)', margin: '8px 0 0', fontStyle: 'italic' }}>
                          "{idea.admin_comment}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   TAB 4 — COMMENTS
   ============================================================ */
const CommentsTab = ({ auth, level }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/comments', 'GET', null, auth.token);
      setComments(data.comments ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const filtered = comments.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || (c.content || '').toLowerCase().includes(q);
    const matchF = filter === 'all'
      ? true
      : filter === 'anon' ? !c.user_id
      : !!c.user_id;
    return matchQ && matchF;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const bulkDelete = async () => {
    setDeleting(true);
    try {
      await apiCall('/api/admin/comments', 'DELETE', { ids: [...selected] }, auth.token);
      setComments(prev => prev.filter(c => !selected.has(c.id)));
      setSelected(new Set());
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setDeleting(false); setConfirm(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comments…" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        {['all', 'anon', 'registered'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={btnStyle(filter === f ? 'aurora' : 'ghost', true)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {level >= 4 && selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.25)' }}>
          <span style={{ fontSize: 13, color: '#f87171' }}>{selected.size} selected</span>
          <button onClick={() => setConfirm(true)} style={btnStyle('danger', true)} disabled={deleting}>
            {deleting ? <Spinner /> : <Trash2 size={12} />} Bulk Delete <AclTag level={4} />
          </button>
          <button onClick={() => setSelected(new Set())} style={btnStyle('ghost', true)}>Clear</button>
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <Empty icon={MessageCircle} label="No comments found" />
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {level >= 4 && (
                  <th style={{ ...tableHeadStyle, width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={selectAll}
                      style={{ cursor: 'pointer', accentColor: 'var(--aurora)' }}
                    />
                  </th>
                )}
                {['User', 'Content', 'Type', 'Date'].map(h => (
                  <th key={h} style={{ ...tableHeadStyle, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  {level >= 4 && (
                    <td style={{ ...tdStyle, width: 36 }}>
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--aurora)' }}
                      />
                    </td>
                  )}
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bone)' }}>{c.user_name || 'Anonymous'}</div>
                    {c.user_email && <div style={{ fontSize: 11, color: 'var(--dust)' }}>{c.user_email}</div>}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 320 }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.content}
                    </p>
                  </td>
                  <td style={tdStyle}>{statusBadge(c.user_id ? 'user' : 'anon')}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        title="Bulk Delete Comments"
        message={`Permanently delete ${selected.size} comment(s)? This cannot be undone.`}
        onConfirm={bulkDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
};

/* ============================================================
   TAB 5 — CMS
   ============================================================ */
const CmsTab = ({ auth, level }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({}); // { [id]: draft }
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/content', 'GET', null, auth.token);
      setSections(data.sections ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const filtered = sections.filter(s => {
    const q = search.toLowerCase();
    return !q || (s.slug || '').toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q);
  });

  const startEdit = (s) => {
    setEditing(prev => ({ ...prev, [s.id]: s.body || '' }));
    setExpanded(s.id);
  };

  const save = async (s) => {
    setSaving(s.id);
    try {
      await apiCall('/api/admin/content', 'POST', { page_key: s.page_key, section_key: s.section_key, content: editing[s.id], content_type: s.content_type || 'text' }, auth.token);
      setSections(prev => prev.map(x => x.id === s.id ? { ...x, body: editing[s.id], updated_at: new Date().toISOString() } : x));
      setEditing(prev => { const n = { ...prev }; delete n[s.id]; return n; });
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setSaving(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content sections…" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <Empty icon={FileText} label="No content sections found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const isEditing = editing[s.id] !== undefined;
            return (
              <div key={s.id} style={cardStyle}>
                {/* header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--bone)' }}>{s.title || s.slug}</span>
                      <code style={{ fontSize: 11, background: 'var(--cosmos)', padding: '1px 6px', borderRadius: 4, color: 'var(--aurora)' }}>
                        {s.slug}
                      </code>
                      {s.revision_count > 0 && (
                        <Badge label={`${s.revision_count} rev${s.revision_count !== 1 ? 's' : ''}`} color="dust" />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dust)', marginTop: 3 }}>
                      Last updated: {fmtDate(s.updated_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); startEdit(s); }} style={btnStyle('aurora', true)}>
                      <Edit2 size={12} /> Edit
                    </button>
                    {expanded === s.id ? <ChevronDown size={16} color="var(--dust)" /> : <ChevronRight size={16} color="var(--dust)" />}
                  </div>
                </div>

                {/* expanded editor */}
                {expanded === s.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                    <textarea
                      value={isEditing ? editing[s.id] : (s.body || '')}
                      onChange={e => isEditing && setEditing(prev => ({ ...prev, [s.id]: e.target.value }))}
                      readOnly={!isEditing}
                      rows={10}
                      style={{
                        ...inputStyle, resize: 'vertical', lineHeight: 1.6, minHeight: 200,
                        fontFamily: 'monospace', fontSize: 12,
                        opacity: isEditing ? 1 : 0.65,
                      }}
                    />

                    {/* revision history */}
                    {(s.revisions || []).length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--dust)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
                          Revision History
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {(s.revisions || []).map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: 'rgba(7,16,31,0.4)', fontSize: 12 }}>
                              <span style={{ color: 'var(--bone-dim)' }}>Rev #{(s.revisions.length - i)}</span>
                              <span style={{ color: 'var(--dust)' }}>{fmtDate(r.created_at)}</span>
                              <span style={{ color: 'var(--dust)' }}>{r.author || 'admin'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isEditing && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => save(s)} disabled={saving === s.id} style={btnStyle('primary')}>
                          {saving === s.id ? <Spinner /> : <Save size={13} />} Save Revision
                        </button>
                        <button onClick={() => setEditing(prev => { const n = { ...prev }; delete n[s.id]; return n; })} style={btnStyle('ghost')}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   MAIN EXPORT — AdminDashboard
   ============================================================ */
export const AdminDashboard = ({ auth }) => {
  const [activeTab, setActiveTab] = useState('users');
  const level = aclLevel(auth);

  // Redirect if not at least L1 (viewer)
  if (level < 1) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        color: 'var(--dust)',
      }}>
        <Shield size={40} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: 15 }}>Admin access required (L1+).</p>
      </div>
    );
  }

  const tabs = [
    { id: 'users',         label: 'Users',         icon: Users,         minLevel: 1 },
    { id: 'conversations', label: 'Conversations',  icon: MessageCircle, minLevel: 1 },
    { id: 'ideas',         label: 'Ideas',          icon: Lightbulb,     minLevel: 1 },
    { id: 'comments',      label: 'Comments',       icon: MessageCircle, minLevel: 1 },
    { id: 'cms',           label: 'CMS',            icon: FileText,      minLevel: 3 },
  ].filter(t => level >= t.minLevel);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      padding: '0 0 60px',
    }}>
      {/* ── top bar ─────────────────────────── */}
      <div style={{
        background: 'var(--void-2)', borderBottom: '1px solid var(--line-2)',
        padding: '20px 24px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(91,233,221,0.12)', border: '1px solid rgba(91,233,221,0.2)',
            }}>
              <Shield size={18} color="var(--aurora)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--bone)' }}>
                Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--dust)' }}>
                Signed in as <strong style={{ color: 'var(--bone-dim)' }}>{auth?.user?.display_name || auth?.user?.email}</strong>
                {' · '}
                <Badge label={level >= 5 ? 'Super Admin' : level >= 4 ? 'Manager' : level >= 3 ? 'Editor' : level >= 2 ? 'Moderator' : 'Viewer'} color={level >= 5 ? 'gold' : 'aurora'} />
              </p>
            </div>
          </div>

          {/* tab strip */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', border: 'none', cursor: 'pointer',
                    background: 'transparent', color: active ? 'var(--aurora)' : 'var(--dust)',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    borderBottom: active ? '2px solid var(--aurora)' : '2px solid transparent',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', marginBottom: -1,
                  }}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── tab content ─────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
        {activeTab === 'users'         && <UsersTab         auth={auth} level={level} />}
        {activeTab === 'conversations' && <ConversationsTab auth={auth} level={level} />}
        {activeTab === 'ideas'         && <IdeasTab         auth={auth} level={level} />}
        {activeTab === 'comments'      && <CommentsTab      auth={auth} level={level} />}
        {activeTab === 'cms'           && <CmsTab           auth={auth} level={level} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
