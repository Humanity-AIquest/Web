import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, MessageCircle, Lightbulb, FileText, Shield,
  Trash2, Flag, CheckCircle, XCircle, ChevronDown, ChevronRight,
  Loader2, Search, Filter, Edit2, Save, X, AlertTriangle,
  RefreshCw, Eye, EyeOff, Clock, User, Ban, UserCheck,
  ChevronUp, MoreHorizontal, Check, Tag, Plus, Zap, SortAsc,
  ArrowUpDown, Settings2, Bookmark, Mic, Volume2, ExternalLink, Key,
  Star, StarOff, Play, Square, Globe
} from 'lucide-react';
import { useTTS, ListenButton, TTS_PLUGINS, testSpeakPlugin, stopTestSpeech } from './useTTS';

/* ============================================================
   ADMIN DASHBOARD — Humanity-AI.Quest
   ACL levels: 0=user, 1=viewer, 2=moderator, 3=editor, 4=manager, 5=super admin
   ============================================================ */

// ─── shared API helper ────────────────────────────────────────
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

// ─── ACL helpers ─────────────────────────────────────────────
const aclLevel = (auth) => auth?.user?.acl_level ?? 0;

// ─── Tag helpers ─────────────────────────────────────────────
const TAG_OPTIONS = [
  { value: 'process_hrc',  label: 'Process for HRC',   color: 'aurora',  bg: 'rgba(91,233,221,0.18)',  fg: 'var(--aurora)' },
  { value: 'more_info',    label: 'More info needed',   color: 'gold',    bg: 'rgba(232,177,79,0.18)',  fg: 'var(--gold)' },
  { value: 'warn_user',    label: 'Warn user',          color: 'orange',  bg: 'rgba(251,146,60,0.18)',  fg: '#fb923c' },
  { value: 'suspend_user', label: 'Suspend user',       color: 'red',     bg: 'rgba(220,60,60,0.18)',   fg: '#f87171' },
];

const parseTags = (str) => {
  if (!str) return [];
  return str.split(',').map(t => t.trim()).filter(Boolean);
};

const getTagOption = (value) => TAG_OPTIONS.find(o => o.value === value);

const tagLabel = (value) => getTagOption(value)?.label || value.replace(/_/g, ' ');
const tagBg    = (value) => getTagOption(value)?.bg || 'rgba(167,139,250,0.15)';
const tagFg    = (value) => getTagOption(value)?.fg || '#a78bfa';

// ─── shared sub-components ───────────────────────────────────
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
  <span style={{ fontSize: 10, color: 'var(--dust)', fontWeight: 500 }}>L{level}+</span>
);

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger = true }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,16,31,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--void-2)', border: '1px solid var(--line-2)', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%' }}>
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

// ─── style helpers ────────────────────────────────────────────
const btnStyle = (variant = 'ghost', small = false) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: small ? '3px 10px' : '6px 14px',
    borderRadius: 8, fontSize: small ? 11 : 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { ...base, background: 'var(--bone)', color: 'var(--void)' },
    aurora:  { ...base, background: 'rgba(91,233,221,0.15)', color: 'var(--aurora)', border: '1px solid rgba(91,233,221,0.25)' },
    blue:    { ...base, background: 'rgba(59,130,246,0.2)',  color: '#60a5fa',        border: '1px solid rgba(59,130,246,0.35)' },
    gold:    { ...base, background: 'rgba(232,177,79,0.15)', color: 'var(--gold)',    border: '1px solid rgba(232,177,79,0.25)' },
    danger:  { ...base, background: 'rgba(220,60,60,0.2)',   color: '#f87171',        border: '1px solid rgba(220,60,60,0.3)' },
    orange:  { ...base, background: 'rgba(251,146,60,0.15)', color: '#fb923c',        border: '1px solid rgba(251,146,60,0.25)' },
    ghost:   { ...base, background: 'rgba(242,234,211,0.06)', color: 'var(--bone-dim)', border: '1px solid var(--line)' },
    green:   { ...base, background: 'rgba(52,211,153,0.12)', color: '#34d399',        border: '1px solid rgba(52,211,153,0.25)' },
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

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

const Empty = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'var(--dust)' }}>
    <Icon size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
    <span style={{ fontSize: 14 }}>{label}</span>
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div style={{ ...cardStyle, border: '1px solid rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: '#f87171', fontSize: 13 }}>{message}</span>
    {onRetry && <button onClick={onRetry} style={btnStyle('danger', true)}><RefreshCw size={12} /> Retry</button>}
  </div>
);

/* ============================================================
   TAG DROPDOWN — hover multi-select with checkmarks
   Used by ConversationsTab and IdeasTab
   ============================================================ */
const TagDropdown = ({ itemId, currentTagStr, level, onTagChange, onDelete, loading }) => {
  const [open, setOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const timerRef = useRef(null);

  const tags = parseTags(currentTagStr);
  const isTagged = tags.length > 0;
  const customTags = tags.filter(t => !TAG_OPTIONS.find(o => o.value === t));

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  const toggleTag = (e, value) => {
    e.stopPropagation();
    const newTags = tags.includes(value)
      ? tags.filter(t => t !== value)
      : [...tags, value];
    onTagChange(newTags);
  };

  const addCustomTag = (e) => {
    e.stopPropagation();
    const tag = customTag.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!tag || tags.includes(tag)) { setCustomTag(''); return; }
    onTagChange([...tags, tag]);
    setCustomTag('');
  };

  const removeCustomTag = (e, tag) => {
    e.stopPropagation();
    onTagChange(tags.filter(t => t !== tag));
  };

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        disabled={loading}
        style={{
          ...btnStyle(isTagged ? 'blue' : 'ghost', true),
          position: 'relative',
        }}
        title={isTagged ? `Tags: ${tags.map(tagLabel).join(', ')}` : 'Add tags'}
      >
        {loading ? <Spinner size={11} /> : <Tag size={11} />}
        Tags{isTagged ? ` (${tags.length})` : ''}
        <ChevronDown size={9} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: '100%', marginTop: 3, zIndex: 150,
            background: 'var(--void-2)', border: '1px solid var(--line-2)', borderRadius: 10,
            minWidth: 230, padding: 6, boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          }}
          onMouseEnter={() => clearTimeout(timerRef.current)}
          onMouseLeave={handleMouseLeave}
          onClick={e => e.stopPropagation()}
        >
          {/* Predefined tags */}
          {TAG_OPTIONS.map(opt => {
            const checked = tags.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={e => toggleTag(e, opt.value)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 9,
                  padding: '7px 10px', background: 'transparent', border: 'none',
                  color: checked ? 'var(--bone)' : 'var(--bone-dim)', fontSize: 13,
                  cursor: 'pointer', borderRadius: 6, textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,233,221,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${checked ? opt.fg : 'rgba(107,117,147,0.5)'}`,
                  background: checked ? opt.bg : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checked && <Check size={10} color={opt.fg} />}
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
                {checked && (
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: opt.bg, color: opt.fg, fontWeight: 700 }}>
                    ON
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom tags + input */}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 6, padding: '6px 8px 4px' }}>
            <div style={{ fontSize: 10, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
              Custom Tag
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <input
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomTag(e); }}
                onClick={e => e.stopPropagation()}
                placeholder="e.g. hrc-12"
                style={{ ...inputStyle, padding: '4px 8px', fontSize: 12, flex: 1 }}
              />
              <button onClick={addCustomTag} style={{ ...btnStyle('aurora', true), padding: '4px 8px' }}>
                <Plus size={11} />
              </button>
            </div>
            {customTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {customTags.map(ct => (
                  <span key={ct} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 6px 2px 8px', borderRadius: 9999, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: 600 }}>
                    {ct.replace(/_/g, ' ')}
                    <button onClick={e => removeCustomTag(e, ct)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', padding: 0, display: 'flex' }}>
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Delete option (L4+) */}
          {onDelete && level >= 4 && (
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                  padding: '7px 10px', background: 'transparent', border: 'none',
                  color: '#f87171', fontSize: 13, cursor: 'pointer', borderRadius: 6, textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 size={12} /> Delete <AclTag level={4} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tag pills shown on the left side of a conversation row
const TagPills = ({ tagStr }) => {
  const tags = parseTags(tagStr);
  if (tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
      {tags.map(t => (
        <span key={t} style={{
          display: 'inline-block', fontSize: 9, fontWeight: 700,
          padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap',
          background: tagBg(t), color: tagFg(t), letterSpacing: '0.03em',
          textTransform: 'uppercase', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
        }} title={tagLabel(t)}>
          {tagLabel(t)}
        </span>
      ))}
    </div>
  );
};

/* ============================================================
   TAB 1 — USERS
   ============================================================ */
const UsersTab = ({ auth, level }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ ...inputStyle, paddingLeft: 32 }} />
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
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cosmos)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--aurora)', fontWeight: 700, flexShrink: 0 }}>
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name || '—'}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{u.email || '—'}</td>
                  <td style={tdStyle}>{statusBadge(u.role || 'user')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {statusBadge(u.status || 'active')}
                      {u.ban_reason && <span style={{ fontSize: 10, color: '#f87171', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.ban_reason}</span>}
                    </div>
                  </td>
                  <td style={tdStyle}>{fmtDate(u.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {level >= 4 && u.status !== 'active' && (
                        <button onClick={() => setConfirm({ action: 'activate', user: u })} disabled={!!actionLoading} style={btnStyle('green', true)}>
                          {actionLoading === u.id + 'activate' ? <Spinner /> : <UserCheck size={12} />} Activate <AclTag level={4} />
                        </button>
                      )}
                      {level >= 4 && u.status !== 'suspended' && u.status !== 'banned' && (
                        <button onClick={() => setConfirm({ action: 'suspend', user: u })} disabled={!!actionLoading} style={btnStyle('orange', true)}>
                          {actionLoading === u.id + 'suspend' ? <Spinner /> : <Clock size={12} />} Suspend <AclTag level={4} />
                        </button>
                      )}
                      {level >= 4 && u.status !== 'banned' && (
                        <button onClick={() => setConfirm({ action: 'ban', user: u })} disabled={!!actionLoading} style={btnStyle('danger', true)}>
                          {actionLoading === u.id + 'ban' ? <Spinner /> : <Ban size={12} />} Ban <AclTag level={4} />
                        </button>
                      )}
                      {level >= 5 && (u.acl_level ?? 0) < 1 && (
                        <button onClick={() => setConfirm({ action: 'promote', user: u })} disabled={!!actionLoading} style={btnStyle('aurora', true)}>
                          {actionLoading === u.id + 'promote' ? <Spinner /> : <Shield size={12} />} Promote <AclTag level={5} />
                        </button>
                      )}
                      {level >= 5 && (u.acl_level ?? 0) >= 1 && (
                        <button onClick={() => setConfirm({ action: 'revoke_admin', user: u })} disabled={!!actionLoading} style={btnStyle('danger', true)}>
                          {actionLoading === u.id + 'revoke_admin' ? <Spinner /> : <XCircle size={12} />} Revoke <AclTag level={5} />
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,16,31,0.8)', backdropFilter: 'blur(6px)' }}
          onClick={() => setConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--void-2)', border: '1px solid var(--line-2)', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#f87171" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Confirm: {confirm.action.replace('_', ' ')} "{confirm.user.display_name || confirm.user.email}"</span>
            </div>
            {confirm.action === 'ban' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--dust)', display: 'block', marginBottom: 6 }}>Ban reason (visible to user)</label>
                <input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban…" style={inputStyle} />
              </div>
            )}
            <p style={{ color: 'var(--bone-dim)', fontSize: 13, marginBottom: 20 }}>
              {confirm.action === 'ban'          && 'This user will lose access to the platform.'}
              {confirm.action === 'suspend'       && 'This user will be temporarily unable to sign in.'}
              {confirm.action === 'activate'      && 'This user account will be restored to active.'}
              {confirm.action === 'promote'       && 'This user will gain admin (L4) privileges.'}
              {confirm.action === 'revoke_admin'  && 'Admin privileges will be removed from this user.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={btnStyle('ghost')}>Cancel</button>
              <button onClick={() => doAction(confirm.action, confirm.user, confirm.action === 'ban' ? { ban_reason: banReason } : {})} style={btnStyle('danger')}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   TAB 2 — CONVERSATIONS (with multi-tag hover dropdown)
   ============================================================ */
const ConversationsTab = ({ auth, level }) => {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [expandedMsgs, setExpandedMsgs] = useState([]);
  const [expandedNotes, setExpandedNotes] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [tagLoading, setTagLoading] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [noteType, setNoteType] = useState('comment');
  const tts = useTTS();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/admin/conversations?filter=' + filter, 'GET', null, auth.token);
      setConvs(data.conversations ?? data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [auth.token, filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = convs.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.first_message || '').toLowerCase().includes(q);
  });

  const toggleExpand = async (convId) => {
    if (expanded === convId) { setExpanded(null); return; }
    setExpanded(convId);
    setMsgsLoading(true);
    setExpandedMsgs([]); setExpandedNotes([]);
    try {
      const data = await apiCall(`/api/admin/conversations?id=${convId}`, 'GET', null, auth.token);
      setExpandedMsgs(data.messages || []);
      setExpandedNotes(data.notes || []);
    } catch (e) { setExpandedMsgs([]); }
    finally { setMsgsLoading(false); }
  };

  const handleTagChange = async (conv, newTags) => {
    setTagLoading(conv.id);
    try {
      if (newTags.length === 0) {
        await apiCall('/api/admin/conversations', 'POST', { conversation_id: conv.id, action: 'unflag' }, auth.token);
        setConvs(prev => prev.map(x => x.id === conv.id ? { ...x, flagged: 0, flag_category: null } : x));
      } else {
        const tagsStr = newTags.join(',');
        await apiCall('/api/admin/conversations', 'POST', { conversation_id: conv.id, action: 'flag', flag_category: tagsStr }, auth.token);
        setConvs(prev => prev.map(x => x.id === conv.id ? { ...x, flagged: 1, flag_category: tagsStr } : x));
      }
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setTagLoading(null); }
  };

  const doDelete = async (conv) => {
    if (!window.confirm('Permanently delete this conversation and all messages?')) return;
    try {
      await apiCall('/api/admin/conversations', 'POST', { conversation_id: conv.id, action: 'delete' }, auth.token);
      setConvs(prev => prev.filter(x => x.id !== conv.id));
      if (expanded === conv.id) setExpanded(null);
    } catch (e) { alert(`Error: ${e.message}`); }
  };

  const addNote = async (convId) => {
    if (!noteInput.trim()) return;
    try {
      await apiCall('/api/admin/conversations', 'POST', {
        conversation_id: convId, action: 'add_note', note: noteInput.trim(), note_type: noteType
      }, auth.token);
      setNoteInput('');
      const data = await apiCall(`/api/admin/conversations?id=${convId}`, 'GET', null, auth.token);
      setExpandedNotes(data.notes || []);
    } catch (e) { alert(`Error: ${e.message}`); }
  };

  const filterOpts = [
    { value: 'all', label: 'All' },
    { value: 'flagged', label: 'Tagged' },
    { value: 'anonymous', label: 'Anon' },
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
              style={btnStyle(filter === o.value ? 'aurora' : 'ghost', true)}>
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
          {filtered.map(c => {
            const cTags = parseTags(c.flag_category);
            return (
              <div key={c.id} style={{ ...cardStyle, padding: 0 }}>
                {/* header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleExpand(c.id)}>

                  {/* Left: tag pills */}
                  {cTags.length > 0 && (
                    <div style={{ flexShrink: 0 }}>
                      <TagPills tagStr={c.flag_category} />
                    </div>
                  )}

                  {/* Center: conversation info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      {statusBadge(c.user_type === 'registered' ? 'user' : 'anon')}
                      {c.user_name && <span style={{ fontSize: 12, color: 'var(--bone-dim)' }}>{c.user_name}</span>}
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>{c.message_count ?? 0} msgs</span>
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>{fmtDate(c.started_at)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.first_message || '(no preview)'}
                    </p>
                  </div>

                  {/* Right: tag dropdown + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <TagDropdown
                      itemId={c.id}
                      currentTagStr={c.flag_category}
                      level={level}
                      loading={tagLoading === c.id}
                      onTagChange={(newTags) => handleTagChange(c, newTags)}
                      onDelete={() => doDelete(c)}
                    />
                    {expanded === c.id ? <ChevronDown size={16} color="var(--dust)" /> : <ChevronRight size={16} color="var(--dust)" />}
                  </div>
                </div>

                {/* expanded: messages + notes */}
                {expanded === c.id && (
                  <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {msgsLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Spinner size={18} /></div>
                    ) : expandedMsgs.length === 0 ? (
                      <span style={{ fontSize: 13, color: 'var(--dust)' }}>No messages in this conversation.</span>
                    ) : (
                      expandedMsgs.map((m, i) => (
                        <div key={i} style={{
                          padding: '8px 12px', borderRadius: 8,
                          background: m.role === 'user' ? 'rgba(91,233,221,0.06)' : 'rgba(232,177,79,0.06)',
                          border: `1px solid ${m.role === 'user' ? 'rgba(91,233,221,0.12)' : 'rgba(232,177,79,0.12)'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: m.role === 'user' ? 'var(--aurora)' : 'var(--gold)', textTransform: 'uppercase' }}>{m.role}</span>
                            <span style={{ fontSize: 11, color: 'var(--dust)' }}>{fmtDate(m.created_at)}</span>
                          </div>
                          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--bone-dim)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</p>
                          {m.role === 'assistant' && (
                            <ListenButton id={`convmsg-${i}`} text={m.content} tts={tts} />
                          )}
                        </div>
                      ))
                    )}

                    {/* Admin Notes */}
                    {expandedNotes.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dust)', textTransform: 'uppercase', letterSpacing: 1 }}>Admin Notes</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                          {expandedNotes.map((n, i) => (
                            <div key={i} style={{
                              padding: '8px 12px', borderRadius: 8,
                              background: n.note_type === 'next_action' ? 'rgba(251,191,36,0.08)' : 'rgba(148,163,184,0.08)',
                              borderLeft: `3px solid ${n.note_type === 'next_action' ? 'var(--gold)' : 'var(--dust)'}`,
                            }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                <Badge label={n.note_type === 'next_action' ? 'Next Action' : 'Comment'} color={n.note_type === 'next_action' ? 'gold' : 'dust'} />
                                <span style={{ fontSize: 11, color: 'var(--dust)' }}>{n.admin_name || 'Admin'} · {fmtDate(n.created_at)}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)' }}>{n.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Note */}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <button onClick={() => setNoteType('comment')} style={btnStyle(noteType === 'comment' ? 'aurora' : 'ghost', true)}>Comment</button>
                          <button onClick={() => setNoteType('next_action')} style={btnStyle(noteType === 'next_action' ? 'gold' : 'ghost', true)}>Next Action</button>
                        </div>
                        <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                          placeholder={noteType === 'next_action' ? 'Add a next action for HRC improvement...' : 'Add an admin comment...'}
                          style={inputStyle}
                          onKeyDown={e => { if (e.key === 'Enter') addNote(c.id); }}
                        />
                      </div>
                      <button onClick={() => addNote(c.id)} style={btnStyle('aurora', true)} disabled={!noteInput.trim()}>Add</button>
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
   TAB 3 — IP DEV AGENT (Ideas)
   ============================================================ */
const IDEA_STATUSES = ['submitted', 'under_review', 'accepted', 'implemented', 'deferred', 'rejected', 'deleted'];

const IdeasTab = ({ auth, level }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');
  const [tagLoading, setTagLoading] = useState(null);
  const tts = useTTS();

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
    return !q || (i.title || '').toLowerCase().includes(q) || (i.display_name || '').toLowerCase().includes(q);
  });

  const startEdit = (idea) => {
    setEditing(prev => ({ ...prev, [idea.id]: { status: idea.status || 'submitted', comment: idea.admin_comment || '' } }));
    setExpanded(idea.id);
  };

  const saveEdit = async (idea) => {
    const e = editing[idea.id];
    if (!e) return;
    setSaving(idea.id);
    try {
      // Use PUT with correct body format for ideas backend
      await apiCall('/api/admin/ideas', 'PUT', { idea_id: idea.id, status: e.status, comment: e.comment }, auth.token);
      setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, status: e.status, admin_comment: e.comment } : x));
      setEditing(prev => { const n = { ...prev }; delete n[idea.id]; return n; });
    } catch (err) { alert(`Error: ${err.message}`); }
    finally { setSaving(null); }
  };

  const handleTagChange = async (idea, newTags) => {
    setTagLoading(idea.id);
    try {
      const tagsStr = newTags.join(',');
      await apiCall('/api/admin/ideas', 'POST', { idea_id: idea.id, action: 'set_tags', tags: tagsStr }, auth.token);
      setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, tags: tagsStr } : x));
    } catch (e) {
      // Fallback: store tags client-side if backend doesn't support yet
      setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, tags: newTags.join(',') } : x));
    }
    finally { setTagLoading(null); }
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
            const ideaTags = parseTags(idea.tags || '');
            return (
              <div key={idea.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Tag pills */}
                  {ideaTags.length > 0 && (
                    <div style={{ flexShrink: 0, paddingTop: 2 }}>
                      <TagPills tagStr={idea.tags} />
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {statusBadge(idea.status || 'submitted')}
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>by {idea.display_name || 'Anonymous'}</span>
                      <span style={{ fontSize: 12, color: 'var(--dust)' }}>{fmtDate(idea.created_at)}</span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--bone)', lineHeight: 1.4 }}>
                      {idea.title || '(Untitled)'}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <TagDropdown
                      itemId={idea.id}
                      currentTagStr={idea.tags || ''}
                      level={level}
                      loading={tagLoading === idea.id}
                      onTagChange={(newTags) => handleTagChange(idea, newTags)}
                    />
                    <button onClick={e => { e.stopPropagation(); startEdit(idea); }} style={btnStyle('aurora', true)}>
                      <Edit2 size={12} /> Review
                    </button>
                    {expanded === idea.id ? <ChevronDown size={16} color="var(--dust)" /> : <ChevronRight size={16} color="var(--dust)" />}
                  </div>
                </div>

                {expanded === idea.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {idea.content && (
                      <div>
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--bone-dim)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{idea.content}</p>
                        <ListenButton id={`idea-${idea.id}`} text={`${idea.title}. ${idea.content}`} tts={tts} variant="pill" />
                      </div>
                    )}
                    {idea.clause_refs && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--dust)' }}>HRC refs:</span>
                        {String(idea.clause_refs).split(',').map(r => (
                          <Badge key={r} label={r.trim()} color="aurora" />
                        ))}
                      </div>
                    )}
                    <div style={{ background: 'rgba(7,16,31,0.4)', borderRadius: 10, padding: 14, border: '1px solid var(--line-2)' }}>
                      <div style={{ fontSize: 11, color: 'var(--dust)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 10 }}>Admin Review</div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {IDEA_STATUSES.map(s => (
                          <button key={s}
                            onClick={() => isEditing && setEditing(prev => ({ ...prev, [idea.id]: { ...prev[idea.id], status: s } }))}
                            style={{ ...btnStyle(isEditing && ed.status === s ? 'aurora' : 'ghost', true), opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'default' }}>
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
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 70, opacity: isEditing ? 1 : 0.6 }}
                      />
                      {isEditing && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => saveEdit(idea)} disabled={saving === idea.id} style={btnStyle('primary')}>
                            {saving === idea.id ? <Spinner /> : <Save size={13} />} Save
                          </button>
                          <button onClick={() => setEditing(prev => { const n = { ...prev }; delete n[idea.id]; return n; })} style={btnStyle('ghost')}>Cancel</button>
                        </div>
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
   SHARED — NotesList (used by Comments and Actions tabs)
   Fetches conversation_notes of a given type
   ============================================================ */
const NotesList = ({ auth, level, noteType }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [expandedConv, setExpandedConv] = useState(null);
  const [expandedMsgs, setExpandedMsgs] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(null);
  const tts = useTTS();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall(`/api/admin/notes?type=${noteType}`, 'GET', null, auth.token);
      setNotes(data.notes ?? []);
    } catch (e) {
      // Graceful fallback if endpoint doesn't exist yet
      setError('Notes endpoint not yet available. Notes are visible inside each Conversation.');
    }
    finally { setLoading(false); }
  }, [auth.token, noteType]);

  useEffect(() => { load(); }, [load]);

  const expandConv = async (convId) => {
    if (expandedConv === convId) { setExpandedConv(null); setExpandedMsgs([]); return; }
    setExpandedConv(convId);
    setMsgsLoading(true);
    setExpandedMsgs([]);
    try {
      const data = await apiCall(`/api/admin/conversations?id=${convId}`, 'GET', null, auth.token);
      setExpandedMsgs(data.messages || []);
    } catch (e) { setExpandedMsgs([]); }
    finally { setMsgsLoading(false); }
  };

  const handleTagChange = async (note, newTags) => {
    setTagLoading(note.conversation_id);
    try {
      if (newTags.length === 0) {
        await apiCall('/api/admin/conversations', 'POST', { conversation_id: note.conversation_id, action: 'unflag' }, auth.token);
        setNotes(prev => prev.map(n => n.conversation_id === note.conversation_id ? { ...n, flagged: 0, flag_category: null } : n));
      } else {
        const tagsStr = newTags.join(',');
        await apiCall('/api/admin/conversations', 'POST', { conversation_id: note.conversation_id, action: 'flag', flag_category: tagsStr }, auth.token);
        setNotes(prev => prev.map(n => n.conversation_id === note.conversation_id ? { ...n, flagged: 1, flag_category: tagsStr } : n));
      }
    } catch (e) { alert(`Error: ${e.message}`); }
    finally { setTagLoading(null); }
  };

  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return !q || (n.note || '').toLowerCase().includes(q) || (n.first_message || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'hrc') {
        // Process for HRC conversations first
        const aHrc = (a.flag_category || '').includes('process_hrc') ? 0 : 1;
        const bHrc = (b.flag_category || '').includes('process_hrc') ? 0 : 1;
        if (aHrc !== bHrc) return aHrc - bHrc;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const iconEl = noteType === 'next_action' ? <Zap size={32} /> : <MessageCircle size={32} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${noteType === 'next_action' ? 'actions' : 'comments'}…`} style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setSort('latest')} style={btnStyle(sort === 'latest' ? 'aurora' : 'ghost', true)}>
            <SortAsc size={11} /> Latest
          </button>
          <button onClick={() => setSort('hrc')} style={btnStyle(sort === 'hrc' ? 'aurora' : 'ghost', true)}>
            <Bookmark size={11} /> HRC First
          </button>
        </div>
        <button onClick={load} style={btnStyle('ghost', true)}><RefreshCw size={13} /></button>
      </div>

      {error && (
        <div style={{ ...cardStyle, border: '1px solid rgba(232,177,79,0.3)', background: 'rgba(232,177,79,0.06)', padding: '14px 16px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>
            {noteType === 'next_action' ? 'Next Actions' : 'Comments'} are stored per conversation.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--bone-dim)', lineHeight: 1.6 }}>
            Open the <strong style={{ color: 'var(--bone)' }}>Conversations</strong> tab, expand any conversation, and add notes using the Comment / Next Action buttons.
            Once the <code style={{ fontSize: 11, background: 'var(--cosmos)', padding: '1px 5px', borderRadius: 3, color: 'var(--aurora)' }}>/api/admin/notes</code> endpoint is deployed, this view will auto-populate.
          </p>
        </div>
      )}

      {!error && loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      )}

      {!error && !loading && filtered.length === 0 && (
        <Empty icon={noteType === 'next_action' ? Zap : MessageCircle}
          label={noteType === 'next_action' ? 'No next actions yet' : 'No admin comments yet'} />
      )}

      {!error && !loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => (
            <div key={n.id} style={{ ...cardStyle, padding: 0 }}>
              {/* Note header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                {/* Tag pills */}
                {parseTags(n.flag_category).length > 0 && (
                  <div style={{ flexShrink: 0 }}>
                    <TagPills tagStr={n.flag_category} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Source conversation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                    <Badge label={noteType === 'next_action' ? 'Action' : 'Comment'} color={noteType === 'next_action' ? 'gold' : 'dust'} />
                    <span style={{ fontSize: 11, color: 'var(--dust)' }}>{n.admin_name || 'Admin'} · {fmtDate(n.created_at)}</span>
                    {n.conv_user_name && <span style={{ fontSize: 11, color: 'var(--dust)' }}>on conv by {n.conv_user_name}</span>}
                    {n.user_type && statusBadge(n.user_type === 'registered' ? 'user' : 'anon')}
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--bone)', fontWeight: 500, lineHeight: 1.4 }}>{n.note}</p>
                  {n.first_message && (
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--dust)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{n.first_message}"
                    </p>
                  )}
                  <ListenButton id={`note-${n.id}`} text={n.note} tts={tts} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <TagDropdown
                    itemId={n.conversation_id}
                    currentTagStr={n.flag_category}
                    level={level}
                    loading={tagLoading === n.conversation_id}
                    onTagChange={(newTags) => handleTagChange(n, newTags)}
                  />
                  <button
                    onClick={() => expandConv(n.conversation_id)}
                    style={btnStyle('ghost', true)}
                    title="View full conversation"
                  >
                    {expandedConv === n.conversation_id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    View
                  </button>
                </div>
              </div>

              {/* Expanded conversation */}
              {expandedConv === n.conversation_id && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {msgsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><Spinner size={18} /></div>
                  ) : expandedMsgs.length === 0 ? (
                    <span style={{ fontSize: 13, color: 'var(--dust)' }}>No messages found.</span>
                  ) : (
                    expandedMsgs.map((m, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: 8,
                        background: m.role === 'user' ? 'rgba(91,233,221,0.06)' : 'rgba(232,177,79,0.06)',
                        border: `1px solid ${m.role === 'user' ? 'rgba(91,233,221,0.12)' : 'rgba(232,177,79,0.12)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: m.role === 'user' ? 'var(--aurora)' : 'var(--gold)', textTransform: 'uppercase' }}>{m.role}</span>
                          <span style={{ fontSize: 11, color: 'var(--dust)' }}>{fmtDate(m.created_at)}</span>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--bone-dim)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</p>
                        {m.role === 'assistant' && (
                          <ListenButton id={`notesmsg-${i}`} text={m.content} tts={tts} />
                        )}
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
   TAB 4 — COMMENTS (admin notes of type='comment')
   ============================================================ */
const CommentsTab = ({ auth, level }) => (
  <NotesList auth={auth} level={level} noteType="comment" />
);

/* ============================================================
   TAB 5 — ACTIONS (admin notes of type='next_action')
   ============================================================ */
const ActionsTab = ({ auth, level }) => (
  <NotesList auth={auth} level={level} noteType="next_action" />
);

/* ============================================================
   TAB 6 — CMS  (live-preview with inline edit overlays)
   ============================================================ */
/* ============================================================
   TAB 6 — CMS (live inline editor over the REAL site via iframe)
   The iframe loads the actual site in edit mode (?cms=1). Clicking any
   highlighted <E> text posts an "edit" message here; saving writes to
   /api/admin/content and pushes the new text back into the iframe live.
   ============================================================ */
// Registry of editable text that is NOT directly clickable in the live preview
// (form placeholders, button labels, agent/modal copy, banners). Each must be
// wired in App.jsx via <E> or useCmsField with the same page/key.
const CMS_FIELDS = [
  // Banners & footer
  { group: 'Banners & footer', page: 'home', key: 'beta_notice', label: 'Beta banner (top of home)', default: 'Beta Preview — This platform is in early development. Some features are not yet available.' },
  { group: 'Banners & footer', page: 'global', key: 'footer_tagline', label: 'Footer tagline', default: 'Gifted to humanity. Owned by no one. Protected by all of us.' },
  // Buttons & CTAs
  { group: 'Buttons & CTAs', page: 'home', key: 'cta_primary', label: 'Home · primary button', default: 'Sign Petition' },
  { group: 'Buttons & CTAs', page: 'home', key: 'cta_secondary', label: 'Home · secondary button', default: 'Back this project' },
  { group: 'Buttons & CTAs', page: 'home', key: 'cta_agent', label: 'Home · agent button', default: 'Ask the agent' },
  // Forms
  { group: 'Forms', page: 'petition', key: 'form_name_ph', label: 'Petition · name placeholder', default: 'Your name' },
  { group: 'Forms', page: 'petition', key: 'form_email_ph', label: 'Petition · email placeholder', default: 'you@email.com' },
  { group: 'Forms', page: 'petition', key: 'form_submit', label: 'Petition · submit button', default: 'Add my name' },
  { group: 'Forms', page: 'petition', key: 'form_heading', label: 'Petition · form heading', default: 'Add your name — ten seconds, no cost' },
  { group: 'Forms', page: 'surveys', key: 'statement_ph', label: 'Surveys · statement placeholder', default: 'Your statement…' },
  { group: 'Forms', page: 'surveys', key: 'add_btn', label: 'Surveys · add button', default: 'Add' },
  { group: 'Forms', page: 'events', key: 'rsvp_btn', label: 'Events · RSVP button', default: 'RSVP' },
  { group: 'Forms', page: 'events', key: 'confirm_btn', label: 'Events · confirm button', default: 'Confirm' },
  { group: 'Forms', page: 'events', key: 'rsvp_name_ph', label: 'Events · RSVP name placeholder', default: 'Your name' },
  { group: 'Forms', page: 'events', key: 'rsvp_email_ph', label: 'Events · RSVP email placeholder', default: 'you@email.com' },
  // Agent & dialog
  { group: 'Agent & dialog', page: 'agent', key: 'greeting', label: 'HRC Agent · greeting message', default: "I am the HRC Agent. I carry humanity's constitution for AI.\n\nAsk me anything about the 52 clauses, or share an idea you'd like to develop and I'll help refine it through the lens of the constitution. Every conversation is yours alone." },
  { group: 'Agent & dialog', page: 'agent', key: 'input_ph', label: 'HRC Agent · input placeholder', default: 'Ask the constitution. Share your idea.' },
];
const CMS_GROUPS = ['Forms', 'Agent & dialog', 'Buttons & CTAs', 'Banners & footer'];

// One editable field row in a category panel — manages its own draft.
const CmsFieldRow = ({ auth, field, value, onSaved }) => {
  const [draft, setDraft] = useState(value ?? field.default);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => { setDraft(value ?? field.default); }, [value, field.default]);
  const dirty = draft !== (value ?? field.default);
  const save = async () => {
    setSaving(true);
    try {
      await apiCall('/api/admin/content', 'PUT', { page_key: field.page, section_key: field.key, content: draft, content_type: 'text' }, auth.token);
      setOk(true); setTimeout(() => setOk(false), 1800);
      onSaved(field.page, field.key, draft);
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ ...cardStyle, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--bone)', fontWeight: 600 }}>{field.label}</span>
        <code style={{ fontSize: 10, color: 'var(--dust)', whiteSpace: 'nowrap' }}>{field.page}/{field.key}</code>
      </div>
      <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
        style={{ ...inputStyle, width: '100%', resize: 'vertical', fontSize: 13, lineHeight: 1.5 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
        <button onClick={save} disabled={saving || !dirty} style={btnStyle('primary', true)}>
          {saving ? <Spinner /> : <Save size={11} />} Save
        </button>
        {ok && <span style={{ fontSize: 11, color: 'var(--aurora)' }}>Saved to live site</span>}
      </div>
    </div>
  );
};

const CmsTab = ({ auth, level }) => {
  const iframeRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [activeGroup, setActiveGroup] = useState(null);
  const [saved, setSaved] = useState({});

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const loadSaved = useCallback(async () => {
    try {
      const data = await apiCall('/api/admin/content', 'GET', null, auth.token);
      const rows = Array.isArray(data.sections) ? data.sections : (data.content || []);
      const m = {};
      rows.forEach(s => { m[`${s.page_key}__${s.section_key}`] = s.content; });
      setSaved(m);
    } catch { /* empty is fine — defaults show */ }
  }, [auth.token]);
  useEffect(() => { loadSaved(); }, [loadSaved]);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== origin) return;
      const d = e.data;
      if (!d || d.source !== 'hai-cms') return;
      if (d.type === 'ready') setReady(true);
      if (d.type === 'edit') { setEditing({ page: d.page, key: d.key, original: d.text }); setDraft(d.text || ''); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [origin]);

  const postToFrame = (msg) => {
    try { iframeRef.current?.contentWindow?.postMessage({ source: 'hai-cms-admin', ...msg }, origin); } catch {}
  };

  const onFieldSaved = (page, key, text) => {
    setSaved(prev => ({ ...prev, [`${page}__${key}`]: text }));
    postToFrame({ type: 'update', page, key, text });
    setSavedMsg(`Saved ${page}/${key}`); setTimeout(() => setSavedMsg(''), 2200);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiCall('/api/admin/content', 'PUT', { page_key: editing.page, section_key: editing.key, content: draft, content_type: 'text' }, auth.token);
      onFieldSaved(editing.page, editing.key, draft);
      setEditing(null);
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  if (level < 3) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--dust)' }}>L3+ (editor) access required to use the CMS.</div>;
  }

  const groupFields = activeGroup ? CMS_FIELDS.filter(f => f.group === activeGroup) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Category buttons — surface text that isn't directly clickable in the preview */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(7,16,31,0.5)', borderRadius: 8, padding: 3, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
          {CMS_GROUPS.map(g => (
            <button key={g} onClick={() => setActiveGroup(activeGroup === g ? null : g)} style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
              fontWeight: activeGroup === g ? 600 : 400,
              background: activeGroup === g ? 'rgba(255,214,10,0.15)' : 'transparent',
              color: activeGroup === g ? 'var(--aurora)' : 'var(--dust)',
            }}>{g}</button>
          ))}
        </div>
        <button onClick={() => setReloadNonce(n => n + 1)} style={btnStyle('ghost', true)} title="Reload preview"><RefreshCw size={13} /></button>
        <span style={{ fontSize: 11, color: 'var(--dust)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {savedMsg ? <span style={{ color: 'var(--aurora)' }}>{savedMsg}</span> : '✏ Click highlighted text in the preview, or pick a category to edit forms & buttons'}
        </span>
      </div>

      {/* Category field list */}
      {activeGroup && (
        <div style={{ ...cardStyle, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--bone)' }}>{activeGroup}</span>
            <button onClick={() => setActiveGroup(null)} style={btnStyle('ghost', true)}><X size={12} /> Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {groupFields.map(f => (
              <CmsFieldRow key={`${f.page}__${f.key}`} auth={auth} field={f} value={saved[`${f.page}__${f.key}`]} onSaved={onFieldSaved} />
            ))}
          </div>
        </div>
      )}

      {/* Live site preview (navigate with the site's own menu; click highlighted text to edit) */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, border: '1px solid var(--line-2)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'rgba(7,16,31,0.9)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div style={{ flex: 1, background: 'var(--cosmos)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--bone-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={11} /> humanity-ai.quest — use the site menu to change page
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: ready ? 'var(--aurora)' : 'var(--dust)' }}>
              {ready ? 'LIVE' : 'LOADING…'}
            </span>
          </div>
          <iframe
            key={reloadNonce}
            ref={iframeRef}
            title="Live site preview"
            src={`${origin}/?cms=1`}
            style={{ width: '100%', height: '70vh', border: 'none', background: 'var(--void)', display: 'block' }}
          />
        </div>

        {editing && (
          <div style={{ width: 320, flexShrink: 0, ...cardStyle, position: 'sticky', top: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--dust)', marginBottom: 4 }}>Editing text field</div>
            <code style={{ color: 'var(--aurora)', background: 'var(--cosmos)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
              {editing.page} / {editing.key}
            </code>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} autoFocus rows={6}
              style={{ ...inputStyle, width: '100%', resize: 'vertical', marginTop: 10, fontSize: 13, lineHeight: 1.5 }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={save} disabled={saving || draft === editing.original} style={btnStyle('primary', true)}>
                {saving ? <Spinner /> : <Save size={12} />} Save to live site
              </button>
              <button onClick={() => setEditing(null)} style={btnStyle('ghost', true)}><X size={12} /> Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   TAB 7 — TTS PLUGIN MANAGER
   ============================================================ */
const LS_PREFIX = 'hrc_tts_';
const getLS = (key, def) => { try { const v = localStorage.getItem(LS_PREFIX + key); return v != null ? JSON.parse(v) : def; } catch { return def; } };
const setLS = (key, val) => { try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch {} };

const Stars = ({ n }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={11} fill={i <= n ? 'var(--gold)' : 'none'} color={i <= n ? 'var(--gold)' : 'var(--dust)'} />
    ))}
  </span>
);

const TtsPluginManager = ({ auth }) => {
  const [activePlugin, setActivePlugin] = useState(() => getLS('plugin', 'webspeech'));
  const [keys, setKeys] = useState({});
  const [extras, setExtras] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [testingId, setTestingId] = useState(null);

  // Load stored keys/extras on mount
  useEffect(() => {
    const saved = {};
    const savedExtras = {};
    TTS_PLUGINS.forEach(p => {
      if (p.needsKey) saved[p.id] = getLS(`${p.id}_key`, '');
      if (p.regionLabel) savedExtras[p.id + '_region'] = getLS(`${p.id}_region`, '');
      if (p.secretLabel) savedExtras[p.id + '_secret'] = getLS(`${p.id}_secret`, '');
      if (p.id === 'streamelements') savedExtras['se_voice'] = getLS('seVoice', 'Brian');
      if (p.id === 'elevenlabs') savedExtras['el_voice'] = getLS('elVoice', 'EXAVITQu4vr4xnSDxMaL');
    });
    setKeys(saved);
    setExtras(savedExtras);
  }, []);

  const activate = (pluginId) => {
    setLS('plugin', pluginId);
    setActivePlugin(pluginId);
  };

  const saveKey = (pluginId, key) => {
    setLS(`${pluginId}_key`, key);
    setKeys(prev => ({ ...prev, [pluginId]: key }));
  };

  const saveExtra = (storageKey, value) => {
    setLS(storageKey, value);
    setExtras(prev => ({ ...prev, [storageKey]: value }));
  };

  const testPlugin = (plugin) => {
    // If already testing this plugin — stop it
    if (testingId === plugin.id) {
      stopTestSpeech();
      setTestingId(null);
      return;
    }
    // Stop any in-progress test first
    stopTestSpeech();
    setTestingId(plugin.id);

    const voiceName =
      plugin.id === 'streamelements' ? (extras['se_voice'] || 'Brian') :
      plugin.id === 'elevenlabs'     ? (extras['el_voice'] || 'EXAVITQu4vr4xnSDxMaL') : null;

    testSpeakPlugin(
      plugin.id,
      `Hello! This is Humanity AI Quest speaking through ${plugin.name}. ` +
      'The listen feature is a central part of the experience — natural language listening and conversation. How does this sound to you?',
      {
        rate: 1.0,
        volume: 1.0,
        voiceName,
        onEnd:   () => setTestingId(null),
        onError: () => setTestingId(null),
      }
    ).catch(() => setTestingId(null));
  };

  const typeColor = (type) => {
    if (type.includes('Browser')) return { bg: 'rgba(91,233,221,0.12)', fg: 'var(--aurora)' };
    if (type.includes('Open')) return { bg: 'rgba(52,211,153,0.12)', fg: '#34d399' };
    if (type.includes('Paid')) return { bg: 'rgba(251,146,60,0.12)', fg: '#fb923c' };
    if (type.includes('Non-commercial')) return { bg: 'rgba(167,139,250,0.12)', fg: '#a78bfa' };
    return { bg: 'rgba(232,177,79,0.12)', fg: 'var(--gold)' };
  };

  const SE_VOICES = ['Brian','Ivy','Emma','Russell','Amy','Joey','Justin','Nicole','Geraint','Salli'];
  const EL_VOICES = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg,rgba(91,233,221,0.08) 0%,rgba(12,24,40,0.6) 100%)', border: '1px solid rgba(91,233,221,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(91,233,221,0.12)', border: '1px solid rgba(91,233,221,0.25)', flexShrink: 0 }}>
            <Mic size={20} color="var(--aurora)" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--bone)' }}>TTS Plugin Manager</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--bone-dim)', lineHeight: 1.5 }}>
              Select and configure the best text-to-speech engine for the site. The Listen feature is a central part of the Humanity-AI experience.
              Currently active: <strong style={{ color: 'var(--aurora)' }}>{TTS_PLUGINS.find(p => p.id === activePlugin)?.name || activePlugin}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Plugin grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TTS_PLUGINS.map(plugin => {
          const isActive = activePlugin === plugin.id;
          const isExpanded = expanded === plugin.id;
          const isTesting = testingId === plugin.id;
          const tc = typeColor(plugin.type);

          return (
            <div key={plugin.id} style={{
              ...cardStyle,
              border: isActive
                ? '1px solid rgba(91,233,221,0.4)'
                : '1px solid var(--line)',
              background: isActive
                ? 'linear-gradient(135deg,rgba(91,233,221,0.07) 0%,rgba(12,24,40,0.5) 100%)'
                : cardStyle.background,
              transition: 'all 0.2s',
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Active indicator */}
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: `2px solid ${isActive ? 'var(--aurora)' : 'rgba(107,117,147,0.4)'}`,
                  background: isActive ? 'var(--aurora)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--void)' }} />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--bone)' }}>{plugin.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: tc.bg, color: tc.fg, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {plugin.type}
                    </span>
                    {plugin.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: 'rgba(232,177,79,0.12)', color: 'var(--gold)', letterSpacing: '0.03em' }}>
                        ★ {plugin.badge}
                      </span>
                    )}
                    <Stars n={plugin.stars} />
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--bone-dim)', lineHeight: 1.5 }}>{plugin.description}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--dust)' }}>
                    <span style={{ fontWeight: 600 }}>Voices:</span> {plugin.voices}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => testPlugin(plugin)}
                    disabled={testingId !== null && testingId !== plugin.id}
                    style={btnStyle(isTesting ? 'aurora' : 'ghost', true)}
                    title={isTesting ? 'Stop test' : 'Test this plugin'}
                  >
                    {isTesting ? <Square size={11} fill="var(--aurora)" /> : <Play size={11} />}
                    {isTesting ? 'Stop' : 'Test'}
                  </button>
                  {!isActive && (
                    <button onClick={() => activate(plugin.id)} style={btnStyle('primary', true)}>
                      <CheckCircle size={11} /> Activate
                    </button>
                  )}
                  {isActive && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--aurora)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(91,233,221,0.3)', background: 'rgba(91,233,221,0.08)' }}>
                      ✓ Active
                    </span>
                  )}
                  {(plugin.needsKey || plugin.id === 'streamelements' || plugin.id === 'elevenlabs') && (
                    <button onClick={() => setExpanded(isExpanded ? null : plugin.id)} style={btnStyle('ghost', true)}>
                      <Settings2 size={11} /> {isExpanded ? 'Hide' : 'Configure'}
                    </button>
                  )}
                </div>
              </div>

              {/* Pros/cons */}
              <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <div style={{ flex: 1 }}>
                  {plugin.pros.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#34d399', marginBottom: 2 }}>
                      <CheckCircle size={9} /> {p}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  {plugin.cons.map(c => (
                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#f87171', marginBottom: 2 }}>
                      <X size={9} /> {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Config panel */}
              {isExpanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* StreamElements config */}
                  {plugin.id === 'streamelements' && (
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Voice</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {SE_VOICES.map(v => (
                          <button key={v} onClick={() => saveExtra('se_voice', v)} style={btnStyle(extras['se_voice'] === v ? 'aurora' : 'ghost', true)}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ElevenLabs config */}
                  {plugin.id === 'elevenlabs' && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                          API Key <a href={plugin.keyUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--aurora)', fontSize: 10, marginLeft: 6 }}>Get free key ↗</a>
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="password"
                            value={keys[plugin.id] || ''}
                            onChange={e => saveKey(plugin.id, e.target.value)}
                            placeholder={plugin.keyPlaceholder}
                            style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Voice</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {EL_VOICES.map(v => (
                            <button key={v.id} onClick={() => saveExtra('el_voice', v.id)} style={btnStyle(extras['el_voice'] === v.id ? 'aurora' : 'ghost', true)}>
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Generic API key plugins */}
                  {plugin.needsKey && plugin.id !== 'elevenlabs' && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                          {plugin.keyLabel}
                          {plugin.keyUrl && (
                            <a href={plugin.keyUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--aurora)', fontSize: 10, marginLeft: 6, fontWeight: 400 }}>
                              Get key ↗
                            </a>
                          )}
                        </label>
                        <input
                          type="password"
                          value={keys[plugin.id] || ''}
                          onChange={e => saveKey(plugin.id, e.target.value)}
                          placeholder={plugin.keyPlaceholder || 'Paste API key here'}
                          style={{ ...inputStyle, fontSize: 12 }}
                        />
                      </div>
                      {plugin.regionLabel && (
                        <div>
                          <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{plugin.regionLabel}</label>
                          <input
                            type="text"
                            value={extras[plugin.id + '_region'] || ''}
                            onChange={e => saveExtra(`${plugin.id}_region`, e.target.value)}
                            placeholder={plugin.regionPlaceholder || 'e.g. eastus'}
                            style={{ ...inputStyle, fontSize: 12 }}
                          />
                        </div>
                      )}
                      {plugin.secretLabel && (
                        <div>
                          <label style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{plugin.secretLabel}</label>
                          <input
                            type="password"
                            value={extras[plugin.id + '_secret'] || ''}
                            onChange={e => saveExtra(`${plugin.id}_secret`, e.target.value)}
                            placeholder={plugin.secretPlaceholder || 'Paste secret here'}
                            style={{ ...inputStyle, fontSize: 12 }}
                          />
                        </div>
                      )}
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--dust)', fontStyle: 'italic' }}>
                        ⚠ API keys are stored only in your browser (localStorage). Keys marked "coming soon" will route through your backend for secure use.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Web Speech API voice picker (always visible) */}
      {activePlugin === 'webspeech' && (
        <div style={{ ...cardStyle, border: '1px solid rgba(91,233,221,0.2)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--bone)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Volume2 size={14} color="var(--aurora)" /> Web Speech Voice Selection
          </h4>
          <VoicePickerPanel tts={tts} />
        </div>
      )}
    </div>
  );
};

/* Voice picker panel for Web Speech API */
const VoicePickerPanel = ({ tts }) => {
  const { voices, selectedVoice, setVoice } = tts;
  const enVoices = voices.filter(v => /^en/.test(v.lang));
  const [filter, setFilter] = useState('');

  const filtered = enVoices.filter(v =>
    !filter || v.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter voices…"
        style={{ ...inputStyle, marginBottom: 10 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--dust)' }}>
            {voices.length === 0 ? 'No voices loaded — voices are available after a page interaction.' : 'No voices match filter.'}
          </span>
        )}
        {filtered.map(v => {
          const isSelected = v.name === selectedVoice;
          const isNeural = /(natural|neural|online)/i.test(v.name);
          return (
            <button
              key={v.name}
              onClick={() => setVoice(v.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${isSelected ? 'rgba(91,233,221,0.35)' : 'transparent'}`,
                background: isSelected ? 'rgba(91,233,221,0.08)' : 'rgba(242,234,211,0.03)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isSelected ? 'var(--aurora)' : 'rgba(107,117,147,0.4)'}`,
                background: isSelected ? 'var(--aurora)' : 'transparent',
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: isSelected ? 'var(--aurora)' : 'var(--bone-dim)' }}>{v.name}</span>
                <span style={{ fontSize: 10, color: 'var(--dust)', marginLeft: 6 }}>{v.lang}</span>
              </div>
              {isNeural && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 9999, background: 'rgba(91,233,221,0.1)', color: 'var(--aurora)', fontWeight: 700 }}>NEURAL</span>
              )}
              {v.localService === false && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 9999, background: 'rgba(232,177,79,0.1)', color: 'var(--gold)', fontWeight: 700 }}>ONLINE</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   MAIN EXPORT — AdminDashboard
   ============================================================ */
export const AdminDashboard = ({ auth }) => {
  const [activeTab, setActiveTab] = useState('users');
  const level = aclLevel(auth);

  if (level < 1) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--dust)' }}>
        <Shield size={40} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: 15 }}>Admin access required (L1+).</p>
      </div>
    );
  }

  const tabs = [
    { id: 'users',         label: 'Users',          icon: Users,         minLevel: 1 },
    { id: 'conversations', label: 'Conversations',   icon: MessageCircle, minLevel: 1 },
    { id: 'ideas',         label: 'IP Dev Agent',    icon: Lightbulb,     minLevel: 1 },
    { id: 'comments',      label: 'Comments',        icon: MessageCircle, minLevel: 1 },
    { id: 'actions',       label: 'Actions',         icon: Zap,           minLevel: 1 },
    { id: 'cms',           label: 'CMS',             icon: FileText,      minLevel: 3 },
    { id: 'tts',           label: 'TTS Plugins',     icon: Mic,           minLevel: 3 },
  ].filter(t => level >= t.minLevel);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', padding: '0 0 60px' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--void-2)', borderBottom: '1px solid var(--line-2)', padding: '20px 24px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(91,233,221,0.12)', border: '1px solid rgba(91,233,221,0.2)' }}>
              <Shield size={18} color="var(--aurora)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--bone)' }}>Admin Dashboard</h1>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--dust)' }}>
                Signed in as <strong style={{ color: 'var(--bone-dim)' }}>{auth?.user?.display_name || auth?.user?.email}</strong>
                {' · '}
                <Badge label={level >= 5 ? 'Super Admin' : level >= 4 ? 'Manager' : level >= 3 ? 'Editor' : level >= 2 ? 'Moderator' : 'Viewer'} color={level >= 5 ? 'gold' : 'aurora'} />
              </p>
            </div>
          </div>

          {/* Tab strip */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: active ? 'var(--aurora)' : 'var(--dust)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--aurora)' : '2px solid transparent',
                  transition: 'all 0.2s', whiteSpace: 'nowrap', marginBottom: -1,
                }}>
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
        {activeTab === 'users'         && <UsersTab           auth={auth} level={level} />}
        {activeTab === 'conversations' && <ConversationsTab  auth={auth} level={level} />}
        {activeTab === 'ideas'         && <IdeasTab          auth={auth} level={level} />}
        {activeTab === 'comments'      && <CommentsTab       auth={auth} level={level} />}
        {activeTab === 'actions'       && <ActionsTab        auth={auth} level={level} />}
        {activeTab === 'cms'           && <CmsTab            auth={auth} level={level} />}
        {activeTab === 'tts'           && <TtsPluginManager  auth={auth} level={level} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
