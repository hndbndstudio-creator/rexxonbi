## CRO + experience review — homepage & dashboard

I audited `src/routes/index.tsx` (1.5k lines, 12 sections) and `src/routes/dashboard.tsx` + `dashboard-shell.tsx`. Below is what's hurting conversion, plus a concrete redesign inspired by Linear, Attio, Clay, Cursor and Vercel's 2026 patterns.

---

### Homepage — what's working
- Strong "live signals" concept and ticker
- Pricing + FAQ + social proof all present
- SEO is clean after last pass

### Homepage — CRO issues found
1. **Hero overload.** Announcement bar + nav + 7xl headline + avatars + dual CTA + live feed + dashboard screenshot competes for attention. Eye has no anchor. Linear/Attio land on *one* idea, *one* CTA above the fold.
2. **No primary CTA hierarchy.** "Start free trial" and "Watch demo" are visually equal. Best-in-class picks one dominant action and demotes the other to a text link.
3. **12 sections is too many.** Logos, stats, how-it-works, signals, features, more features, pricing, FAQ, blog, case studies, final CTA. Scroll fatigue kills conversion ~section 6.
4. **Pricing table is dense.** Three tiers, 8+ bullets each, annual toggle, no "most popular" anchor pricing trick, no per-seat math, no ROI calculator.
5. **Social proof is generic.** Logo wall of names (text, not logos) + 3 testimonials. No quantified outcomes near the CTA ("Booked 47 meetings in 30 days — Linear").
6. **No risk reversal near CTAs.** Trial length, "no credit card", "cancel anytime", SOC2 badge are buried.
7. **Sticky CTA appears after 800px** but is dismissible and not personalized. 2026 pattern: contextual sticky that changes copy per section.
8. **Mobile hero** uses 2.25rem text but still stacks avatars + dual CTA + dashboard image — too tall before first interaction.

### Dashboard — CRO/UX issues
1. **First-run is empty & cold.** New users land on `/birdseye` then `/dashboard` with filters but no guidance on the *first action*. Linear/Attio always show a "Do this next" card.
2. **Filter bar is the first thing** (type select, confidence slider, campaign picker) — power-user UI shown before the user has any signals to filter.
3. **No "Today's top 3"** prioritization. Signals are a flat feed; reps don't know which to action first. Clay/Attio surface a "Hot now" rail.
4. **Sidebar is 12 items deep** (Bird's-Eye, Signals, Today, Campaigns, Accounts, Contacts, Outreach, RFPs, Territory, Analytics, Settings, Admin). 2026 SaaS sidebars are 5–7 with grouping.
5. **No keyboard-first affordance** (⌘K palette, j/k navigation). Table-stakes for 2026 sales tools (Attio, Linear, Cursor).
6. **PageHeader stats** are static counters — could be live + clickable filters.
7. **No empty-state coaching.** When filters return zero results, user hits a dead end.

---

### Proposed redesign

#### Homepage — collapse to 7 high-signal sections

```text
1. Hero            → one headline, one CTA, one ambient product visual
2. Logo strip      → real SVG logos, monochrome, "Trusted by 200+ GTM teams"
3. Outcome proof   → 3 metric cards w/ customer quote ("2.4× meetings booked")
4. Product (tabs)  → Signals · Campaigns · Knowledge · RFPs (interactive tabs, one screenshot each)
5. How it works    → 3 steps, animated rail
6. Pricing         → 3 tiers, "Most popular" on Pro, ROI calc, "14-day trial · no card"
7. Final CTA       → quantified promise + single button + risk reversal row
```

Move FAQ, blog, case studies, secondary features behind footer links or dedicated pages. Result: ~40% less scroll, clearer narrative.

#### Hero specifics (Linear / Attio 2026 pattern)
- Eyebrow: small mono tag "Real-time buying signals"
- H1: tight 2-line headline, ~5xl max on desktop (not 7xl)
- Sub: one sentence, ≤18 words
- **One** primary CTA: "Start free — see signals in 60s". Secondary as text link "Watch 90s demo →"
- Trust row directly under CTA: avatars + "200+ GTM teams · SOC2 · No credit card"
- Right side: live signal card stream (already built) — kept as the product visual, but simplified to 3 cards, not the dashboard PNG.

#### Pricing upgrades
- Add "Most popular" ribbon + brand glow on Pro
- Annual toggle defaults to annual w/ "Save 20%" pill
- Tiny ROI line under price: "Pays for itself at 1 closed deal/mo"
- Remove duplicate feature bullets across tiers; show diffs only.

#### Sticky CTA
- Replace generic sticky bar with **contextual CTA** that changes copy per section in view (e.g., on Pricing → "Start Pro trial", on FAQ → "Talk to sales"). Non-dismissible on mobile after 60% scroll.

---

#### Dashboard — Attio/Linear-style operator UI

**Sidebar consolidation (12 → 7):**
```text
Today         (merges Today + Bird's-Eye summary)
Signals       (with Campaigns as a tab inside)
Accounts      (Contacts as a tab inside)
Outreach      (Sequences + RFPs as tabs)
Analytics
Settings
Admin*        (role-gated)
```

**Signals page redesign:**
- **Top rail: "Hot now" (3 cards)** — highest-confidence unread signals, one-click "Draft outreach" CTA. This is the first thing the eye lands on.
- **Filters collapse into a single pill bar** ("All signals · Confidence 60+ · No campaign") — click to expand. Default state is hidden.
- **Feed** uses Linear-style dense rows w/ inline actions (Claim · Dismiss · Draft) on hover, keyboard j/k navigation, ⌘K command palette to jump anywhere.
- **Empty state** shows 3 sample signals + "Connect your domains to start monitoring" CTA.
- **PageHeader stats** become clickable filter chips (click "12 unread" → filter feed).

**Global additions:**
- ⌘K command palette (route nav + actions: Draft outreach, Create campaign, Add account)
- First-run checklist card on Today: "1. Add 5 target accounts · 2. Create first campaign · 3. Connect inbox" with progress
- Keyboard shortcuts overlay (?)

---

### Technical scope

Files I'll touch:
- `src/routes/index.tsx` — restructure to 7 sections, new hero, pricing polish, contextual sticky CTA
- `src/routes/dashboard.tsx` — add Hot Now rail, collapse filter bar, empty state, clickable header stats
- `src/components/dashboard-shell.tsx` — consolidate sidebar to 7 items, add ⌘K trigger
- `src/components/page-header.tsx` — support clickable stat chips
- New: `src/components/command-palette.tsx` (cmdk-based, package already present via shadcn `command.tsx`)
- New: `src/components/first-run-checklist.tsx`
- New: `src/components/hot-now-rail.tsx`

No backend / schema changes. No new dependencies (cmdk + command UI already installed). All visual + structural.

### What I'll **not** touch unless you say so
- Auth flows, RFP wizard internals, Campaigns CRUD, Knowledge Base, RAG agent
- Database schema, edge functions
- Pricing amounts (only visual hierarchy)

### Suggested rollout
Two passes so you can review between:
1. Homepage redesign (hero, pricing, sticky, section collapse)
2. Dashboard redesign (sidebar, Hot Now, ⌘K, empty states, first-run)

Reply "go" to start with pass 1, or tell me which pass/items to skip or reorder.
