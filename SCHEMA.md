# Humanity-AI.Quest — Database Schema

Ground-truth reference for the D1 database (`env.DB`) and the API surface.

**37 tables · 33 endpoint files** (see [Endpoints](#endpoints)).

> **Keep this in sync.** There are no `.sql` migration files — every table is created by
> `CREATE TABLE IF NOT EXISTS` and every added column by an idempotent `ALTER TABLE … ADD COLUMN`
> inside a try/catch, at request time. To regenerate this list after a schema change:
>
> ```bash
> grep -rhoE "CREATE TABLE IF NOT EXISTS [a-z_]+" functions/ | awk '{print $NF}' | sort -u
> grep -rhE  "ALTER TABLE [a-z_]+ ADD COLUMN" functions/
> ```

---

## Table index

| Domain | Tables | Defined in |
|---|---|---|
| Auth & identity | `users`, `sessions` | `_shared.js` (`ensureAuthSchema`) |
| Agent & conversations | `conversations`, `messages`, `interactions`, `conversation_notes` | `_conversations.js`, `admin/conversations.js` |
| Ideas & ledger | `ideas`, `idea_status_log` | `auth/me.js`, `ideas.js` |
| Movement | `signatures`, `quests`, `quest_pitches`, `quest_questions`, `surveys`, `survey_statements`, `survey_votes`, `events`, `event_rsvps` | `_movement.js` |
| Member CRM | `member_notes`, `member_contacts`, `member_followups`, `member_tags`, `member_membership` | `admin/members.js` |
| CMS | `site_content`, `site_content_history` | `admin/content.js` |
| Comms | `email_templates` | `_email.js` |
| Admin audit | `admin_actions` | `admin/audit.js` (also written by many endpoints) |
| Agent protocol & firewall | `agent_registrations`, `agent_revocations`, `firewall_events`, `mcp_connections`, `plugin_releases`, `member_verification`, `vouches`, `invites`, `contributions`, `ledger_roots`, `content_versions` | `_protocol.js` |

---

## Auth & identity

### `users`
Registered accounts. Self-migrating via `ensureAuthSchema(env)`, which **must** be called at the
top of `auth/login.js`, `auth/signup.js` and `auth/me.js` (it has been silently dropped before).

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',                 -- 'user' | 'admin'
  acl_level INTEGER DEFAULT 0,              -- 0..5, see ACL levels
  status TEXT DEFAULT 'active',             -- 'active' | 'suspended' | 'banned'
  ban_reason TEXT,
  phone TEXT,
  country TEXT,
  newsletter INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));
```
Back-filled on older databases via `ALTER TABLE`: `ban_reason`, `phone`, `country`, `newsletter`,
`created_at`, `updated_at` (also re-asserted in `admin/members.js`).

### `sessions`
Login sessions, 30-day expiry. 64-hex token in the `hrc_session` cookie or `Authorization: Bearer`.

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## Agent & conversations

### `conversations`
One row per agent chat thread. `user_id` is NULL for anonymous visitors.

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_type TEXT DEFAULT 'anon',            -- 'anon' | 'registered'
  kind TEXT DEFAULT 'agent',
  mode TEXT,                                -- dialogue | co-ideator | debate | explain
  flagged INTEGER DEFAULT 0,
  flag_category TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conv_user ON conversations(user_id);
```
Back-filled via `ALTER TABLE` in `admin/conversations.js`: `flag_category`, `kind`, `mode`.

### `messages`
One row per turn. The admin "Comments" view reads `role = 'user'` rows from here.

```sql
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,                       -- 'user' | 'assistant'
  content TEXT NOT NULL,
  flagged INTEGER DEFAULT 0,
  flag_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_conv ON messages(conversation_id);
```

### `interactions`
Append-only **pointer index** — the unified per-participant activity log powering the member
timeline. Never source of truth; writes are best-effort and must never break the primary write.
`participant` is a lowercased email, a `user_id`, or an anonymous token.

```sql
CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                       -- agent | idea | survey_vote | signature | quest_pitch | quest_question | event_rsvp
  user_id TEXT,
  participant TEXT,
  ref_type TEXT,                            -- polymorphic: petition | survey | quest | event | idea
  ref_id TEXT,
  summary TEXT,                             -- truncated to 280 chars
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_inter_participant ON interactions(participant);
CREATE INDEX idx_inter_ref ON interactions(ref_type, ref_id);
CREATE INDEX idx_inter_kind ON interactions(kind);
CREATE INDEX idx_inter_created ON interactions(created_at);
```

### `conversation_notes`
Admin notes attached to a conversation.

```sql
CREATE TABLE IF NOT EXISTS conversation_notes (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'comment',         -- 'comment' | 'next_action'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Ideas & ledger

### `ideas`
User-submitted ideas, hash-chained into the patent ledger (`ledger_hash` / `prev_hash`).

```sql
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',          -- submitted | in_review | approved | rejected | deferred | implemented | deleted
  clause_refs TEXT,                         -- JSON array of clause ids
  conversation_id TEXT,                     -- set when submitted from agent chat
  ledger_hash TEXT,
  prev_hash TEXT,
  tags TEXT,                                -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `idea_status_log`
Lifecycle trail. `visible_to_user = 1` surfaces the entry to the submitter.

```sql
CREATE TABLE IF NOT EXISTS idea_status_log (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  admin_id TEXT,
  comment TEXT,
  visible_to_user INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Movement

### `signatures`
Petition signatures. One per email.

```sql
CREATE TABLE IF NOT EXISTS signatures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'human',       -- 'human' | 'developer'
  country TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE signatures ADD COLUMN newsletter INTEGER DEFAULT 0;
```

### `quests`, `quest_pitches`, `quest_questions`

```sql
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, bounty TEXT,
  status TEXT DEFAULT 'Open',               -- Open | In Review | Awarded | Closed
  summary TEXT, problem TEXT, tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quest_pitches (
  id TEXT PRIMARY KEY, quest_id TEXT NOT NULL,
  name TEXT, email TEXT, approach TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quest_questions (
  id TEXT PRIMARY KEY, quest_id TEXT NOT NULL,
  author TEXT, question TEXT NOT NULL, answer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `surveys`, `survey_statements`, `survey_votes`
Pol.is-style deliberation. **`UNIQUE(statement_id, voter)` is sacred — one person, one vote per
statement.** Votes are deliberately anonymous (`voter` is a cookie token, not a user id).

```sql
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY, title TEXT, intro TEXT,
  status TEXT DEFAULT 'open',               -- draft | live | open | analysis | archived
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE surveys ADD COLUMN location TEXT DEFAULT 'surveys_page';  -- surveys_page | petition | community | standalone
ALTER TABLE surveys ADD COLUMN slug TEXT;
ALTER TABLE surveys ADD COLUMN description TEXT;
ALTER TABLE surveys ADD COLUMN settings TEXT;
ALTER TABLE surveys ADD COLUMN sort_order INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS survey_statements (
  id TEXT PRIMARY KEY, survey_id TEXT NOT NULL,
  text TEXT NOT NULL, author TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE survey_statements ADD COLUMN type TEXT DEFAULT 'vote';    -- vote | crowdfunding | signature
ALTER TABLE survey_statements ADD COLUMN sort_order INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS survey_votes (
  id TEXT PRIMARY KEY, survey_id TEXT NOT NULL, statement_id TEXT NOT NULL,
  value TEXT NOT NULL,                      -- agree | disagree | pass
  voter TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(statement_id, voter)
);
```

### `events`, `event_rsvps`

```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, title TEXT, when_text TEXT, type TEXT, blurb TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL, name TEXT, email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Member CRM
All keyed by **lowercased email** (`member_email`) — the canonical member identity across
signatures, pitches, RSVPs and accounts.

```sql
CREATE TABLE IF NOT EXISTS member_notes (
  id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
  note TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_contacts (
  id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
  channel TEXT, direction TEXT DEFAULT 'inbound',   -- inbound | outbound
  summary TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_followups (
  id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
  title TEXT NOT NULL, due_date TEXT, status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_tags (
  id TEXT PRIMARY KEY, member_email TEXT NOT NULL, tag TEXT NOT NULL,
  UNIQUE(member_email, tag)
);
CREATE TABLE IF NOT EXISTS member_membership (
  member_email TEXT PRIMARY KEY, monthly_pledge TEXT,
  is_founding INTEGER DEFAULT 0, status TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## CMS

```sql
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  content TEXT,
  updated_by TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_key, section_key)
);
CREATE TABLE IF NOT EXISTS site_content_history (
  id TEXT PRIMARY KEY, content_id TEXT NOT NULL,
  old_content TEXT, new_content TEXT, updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Content is an **override layer**: the site renders `db value ?? code fallback`, so editing here
never touches source. Only text wrapped in `<E>` / `useCmsField` in `src/App.jsx` is editable —
a key is orphaned (not lost) if the component stops using it.

---

## Comms

```sql
CREATE TABLE IF NOT EXISTS email_templates (
  key TEXT PRIMARY KEY,                     -- 'welcome' | 'signature_thanks'
  subject TEXT NOT NULL, html TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Rendered with `{{variable}}` substitution and sent via ZeptoMail (`_email.js`). No-ops until
`ZEPTOMAIL_TOKEN` / `EMAIL_FROM` are set.

---

## Admin audit

```sql
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action_type TEXT,                         -- ban | suspend | activate | set_admin | revoke_admin | delete | set_status | clone | …
  target_type TEXT,                         -- user | idea | conversation | survey | signature | event
  target_id TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Polymorphic audit log written by most admin endpoints. It is also created defensively in
`_conversations.js`, `_movement.js`, `admin/members.js` and `admin/users.js`, because it was
written to for a long time before anything created it.

---

## Agent protocol & constitutional firewall
Defined in `functions/api/_protocol.js` — the agent-credential, verification and firewall layer.

```sql
CREATE TABLE IF NOT EXISTS agent_registrations (
  id TEXT PRIMARY KEY, credential TEXT UNIQUE NOT NULL,
  sponsor_id TEXT NOT NULL REFERENCES users(id),
  agent_label TEXT, client_type TEXT, client_version TEXT, plugin_version TEXT,
  scopes TEXT NOT NULL DEFAULT 'read',
  state TEXT NOT NULL DEFAULT 'active',
  issued_by TEXT REFERENCES users(id),
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL, last_seen_at DATETIME
);
CREATE TABLE IF NOT EXISTS agent_revocations (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES agent_registrations(id),
  credential TEXT NOT NULL, reason TEXT NOT NULL, clause_id TEXT,
  revoked_by TEXT REFERENCES users(id),
  cascade_from TEXT REFERENCES agent_revocations(id),
  revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP, published_at DATETIME
);
CREATE TABLE IF NOT EXISTS firewall_events (
  id TEXT PRIMARY KEY, credential TEXT,
  registration_id TEXT REFERENCES agent_registrations(id),
  sponsor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL, verdict TEXT NOT NULL, reason TEXT, clause_id TEXT,
  client_type TEXT, plugin_version TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mcp_connections (
  id TEXT PRIMARY KEY, credential TEXT, user_id TEXT REFERENCES users(id),
  client_type TEXT, client_version TEXT, plugin_version TEXT, protocol_version TEXT,
  first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  call_count INTEGER DEFAULT 0, error_count INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS plugin_releases (
  id TEXT PRIMARY KEY, version TEXT UNIQUE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'draft', changelog TEXT, git_tag TEXT,
  promoted_by TEXT REFERENCES users(id), promoted_at DATETIME,
  halted_at DATETIME, halted_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_verification (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  state TEXT NOT NULL DEFAULT 'pending', method TEXT,
  vouch_count INTEGER DEFAULT 0,
  override_by TEXT REFERENCES users(id), override_reason TEXT,
  standing_since DATETIME, flagged_at DATETIME, flagged_reason TEXT,
  verified_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS vouches (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES users(id),
  voucher_id TEXT NOT NULL REFERENCES users(id),
  statement TEXT, withdrawn_at DATETIME, withdrawn_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, voucher_id)
);
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY, email TEXT NOT NULL,
  invited_by TEXT REFERENCES users(id), code TEXT UNIQUE NOT NULL, note TEXT,
  redeemed_by TEXT REFERENCES users(id), redeemed_at DATETIME,
  expires_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY, seq INTEGER,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL, subject_type TEXT, subject_id TEXT,
  summary TEXT, body_hash TEXT,
  ai_role TEXT NOT NULL DEFAULT 'none', ai_model TEXT, credential TEXT,
  hrc_verdict TEXT, hrc_clauses TEXT,
  prev_hash TEXT, entry_hash TEXT,
  sealed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ledger_roots (
  id TEXT PRIMARY KEY, root_hash TEXT NOT NULL,
  entry_count INTEGER NOT NULL, published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS content_versions (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL, version INTEGER NOT NULL,
  body TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
  author_id TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id), approved_at DATETIME,
  rejected_reason TEXT, hrc_verdict TEXT, published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, version)
);
```

---

## Endpoints

Cloudflare Pages Functions under `functions/api/**` (file-based routing). Files prefixed `_` are
shared modules, not routes.

| Area | Routes |
|---|---|
| Auth | `auth/signup`, `auth/login`, `auth/logout`, `auth/me` |
| Agent | `chat` |
| Public content | `content`, `count`, `ideas`, `sign` |
| Movement | `quests`, `quests/[id]`, `quests/[id]/pitch`, `quests/[id]/questions`, `events`, `events/[id]/rsvp`, `surveys`, `surveys/[id]`, `surveys/[id]/vote`, `surveys/[id]/results`, `surveys/[id]/statements` |
| Admin | `admin/users`, `admin/members`, `admin/segments`, `admin/conversations`, `admin/comments`, `admin/ideas`, `admin/notes`, `admin/surveys`, `admin/signatures`, `admin/quests`, `admin/events`, `admin/content`, `admin/audit` |

---

## Key design decisions

- **No manual migrations.** Idempotent `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE … ADD COLUMN`
  in try/catch, executed at request time. Canonical DDL modules: `_shared.js` (auth),
  `_conversations.js`, `_movement.js`, `_protocol.js`.
- **Errors return HTTP 200** with an `{ error }` body by design, so the frontend always parses.
- **No enforced foreign keys.** `REFERENCES` appears in some DDL but relationships are by
  convention. `interactions` and `admin_actions` are polymorphic pointer/audit logs.
- **Email is canonical identity**, always `.toLowerCase().trim()`, with a unique index on
  `LOWER(email)`.
- **Voting is anonymous and single.** `survey_votes.voter` is a cookie token, and
  `UNIQUE(statement_id, voter)` must be preserved.
- **Index writes are best-effort.** A failure writing `interactions` or `admin_actions` must never
  break the primary write.

---

## ACL levels

```
0 = Regular user (default)
1 = Viewer (read-only admin dashboard)
2 = Moderator (flag/moderate, CRM writes)
3 = Editor (content, surveys)
4 = Manager (ban/suspend users, approve ideas, audit log)
5 = Super Admin (full access; can promote other admins up to L4)
```

**ACL check rule:** `user.role === 'admin' AND user.acl_level >= minLevel` — **both** conditions
must be true.

Implemented in `requireACL(user, minLevel)` in `_shared.js` as the negated guard
`if (user.role !== "admin" || user.acl_level < minLevel) return 403;`, which is logically
identical. Do not "simplify" that `||` to `&&` — that inverts the rule and lets any admin, even
L1, perform L5 actions.
