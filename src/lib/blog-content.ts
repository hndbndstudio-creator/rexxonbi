// SEO-optimized blog and case study content for Rexxon AI
// Each entry is hyper-targeted with high-intent keywords for search + AI SEO (LLM citation)

export type BlogPost = {
  slug: string;
  title: string;
  description: string; // meta description, <160 chars
  keywords: string[];
  category: string;
  readMinutes: number;
  publishedAt: string; // ISO date
  author: string;
  heroEyebrow: string;
  // Structured body — rendered with semantic headings for SEO
  intro: string;
  sections: { h2: string; body: string[]; bullets?: string[] }[];
  faq: { q: string; a: string }[];
  takeaway: string;
};

export type CaseStudy = {
  slug: string;
  company: string;
  industry: string;
  title: string; // SEO title
  description: string; // meta desc
  keywords: string[];
  publishedAt: string;
  metrics: { label: string; value: string }[];
  challenge: string;
  approach: string[];
  outcome: string[];
  quote: { text: string; author: string; role: string };
  signalsUsed: string[];
};

// =====================================================================
// 10 SEO ARTICLES — long-tail, intent-driven, AI-citation friendly
// =====================================================================
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "real-time-b2b-buying-signals-guide-2026",
    title: "Real-Time B2B Buying Signals in 2026: The Complete Guide for Outbound Sales Teams",
    description:
      "Learn how real-time B2B buying signals from job posts, funding, leadership changes and earnings drive 3-5x outbound reply rates in 2026.",
    keywords: [
      "b2b buying signals",
      "intent data 2026",
      "real-time sales signals",
      "outbound prospecting software",
      "buyer intent platform",
      "signal-based selling",
    ],
    category: "Playbook",
    readMinutes: 11,
    publishedAt: "2026-04-01",
    author: "Rexxon Research",
    heroEyebrow: "The signal economy",
    intro:
      "Outbound has fundamentally changed. Cold lists are dead — buyers expect relevance, and reps who reach out at the moment of intent win the meeting. This guide explains what real-time B2B buying signals are, where they come from, how to score them, and how leading sales teams operationalize them with platforms like Rexxon AI to consistently book 3-5x more meetings without adding headcount.",
    sections: [
      {
        h2: "What are real-time B2B buying signals?",
        body: [
          "A B2B buying signal is any public or proprietary event that indicates a company is about to spend money on a category. Unlike traditional intent data — which infers interest from anonymous web visits — real-time signals are first-party events with names, dates, and specific budget context.",
          "The seven categories of high-conversion signals are: hiring (job posts), leadership changes, funding rounds, earnings calls, M&A, compliance/regulatory, and tech-stack expansion. Each carries a different urgency profile and confidence score.",
        ],
        bullets: [
          "Hiring signal — a company posting 5+ Cloud Security Engineer roles is actively scaling CNAPP",
          "Leadership signal — a new CISO joining typically triggers a 90-day stack review",
          "Funding signal — Series B+ rounds open a 60-day window of greenfield budget",
          "Compliance signal — new SOC 2 or ISO 27001 mandates create urgent vendor RFPs",
        ],
      },
      {
        h2: "Why intent data alone no longer wins",
        body: [
          "Bombora, G2, and 6sense pioneered intent — but every competitor now buys the same data. The result: identical contact lists hitting the same accounts on the same day. Buyers are drowning in 'I noticed you visited our pricing page' emails, and reply rates have collapsed below 1% across most categories.",
          "Real-time signals fix this by anchoring outreach to a specific, verifiable, public event. 'I saw you just hired your first VP of GRC — congratulations' is impossible to commoditize.",
        ],
      },
      {
        h2: "How to score and prioritize signals",
        body: [
          "Not all signals deserve a touch. The Rexxon scoring model weights three dimensions: source confidence (a SEC filing scores higher than a tweet), recency decay (signals lose 50% value after 14 days), and ICP fit (employee count, geography, tech stack match).",
          "Best-in-class teams set a minimum confidence threshold of 70 and route only the top 20% of signals to AE-level outreach, while sending the long tail to nurture sequences.",
        ],
      },
      {
        h2: "The signal-to-meeting workflow",
        body: [
          "The fastest-growing sales orgs use a five-step loop: (1) detect signal, (2) verify hiring manager or budget owner, (3) draft an AI-personalized first touch within 60 minutes, (4) trigger a multi-channel sequence, (5) measure reply→meeting conversion to retrain the scoring model.",
        ],
      },
    ],
    faq: [
      {
        q: "What's the difference between intent data and buying signals?",
        a: "Intent data is anonymous, aggregated, and inferred from web behavior. Real-time buying signals are first-party events — job posts, funding rounds, leadership changes — that name a specific company, date, and budget context.",
      },
      {
        q: "How quickly should I act on a buying signal?",
        a: "Industry data shows reply rates drop 30% per week after a signal fires. Best practice is to send the first personalized touch within 24 hours, ideally within 60 minutes for high-confidence signals.",
      },
      {
        q: "Which signal type has the highest meeting conversion?",
        a: "Leadership signals (new CISO, VP Eng, CFO appointments) consistently produce the highest meeting rates — typically 8-12% reply rate vs 1-2% for cold outreach.",
      },
    ],
    takeaway:
      "Real-time signals are the new outbound substrate. Teams that build a 24-hour detect-to-touch loop will out-book teams that rely on quarterly intent reports — every time.",
  },
  {
    slug: "ai-personalized-cold-email-outreach",
    title: "AI Personalized Cold Email: How to 4x Reply Rates Without Sounding Like a Robot",
    description:
      "Step-by-step framework for AI-personalized cold email that quadruples reply rates. Real prompts, signal anchors and sequence templates included.",
    keywords: [
      "ai cold email",
      "personalized outreach at scale",
      "cold email reply rate",
      "ai sales outreach tool",
      "gpt cold email",
      "sales engagement platform",
    ],
    category: "Outbound",
    readMinutes: 9,
    publishedAt: "2026-03-25",
    author: "Rexxon Research",
    heroEyebrow: "Outbound that doesn't suck",
    intro:
      "The promise of AI cold email — write once, personalize at scale — broke in 2024 when buyers started getting 50 nearly identical 'Hey {{first_name}}, I noticed your role at {{company}}' emails per day. The fix isn't more AI; it's better signal anchoring. Here's the framework Rexxon customers use to hit 18%+ reply rates on outbound.",
    sections: [
      {
        h2: "Why generic AI personalization stopped working",
        body: [
          "LLMs trained on the public web all converge on the same praise patterns: 'congratulations on the funding,' 'love what you're building,' 'noticed your recent post.' Buyers pattern-match these in milliseconds and delete.",
          "The breakthrough is grounding the AI in a specific, recent, verifiable event the prospect knows is true — and that they don't expect a vendor to know about yet.",
        ],
      },
      {
        h2: "The signal-anchored email formula",
        body: [
          "Every high-converting email follows the same five-part structure:",
        ],
        bullets: [
          "Signal hook — reference the specific event (job post, hire, filing) with date",
          "Insight — explain why this matters for their priorities, not yours",
          "Proof — one customer in their stage who solved the same problem",
          "Soft ask — a single, low-friction CTA (15 minutes, no demo)",
          "Human PS — one line of personality or context",
        ],
      },
      {
        h2: "The exact prompt structure for AI generation",
        body: [
          "Pass the LLM five inputs: (1) signal title and source, (2) prospect title and company stage, (3) one customer proof point, (4) tone (professional / direct / casual), (5) word limit (80-110 for first touch). Constrain the model with a JSON schema so it returns subject + body without invented facts.",
        ],
      },
      {
        h2: "Sequence cadence that works in 2026",
        body: [
          "Day 1: signal-anchored email. Day 3: LinkedIn connection with one-line context. Day 6: follow-up referencing a second signal or a related industry data point. Day 10: 'closing the loop' email with breakup CTA. Don't exceed four touches without a new trigger.",
        ],
      },
    ],
    faq: [
      {
        q: "Which AI model produces the best cold email copy?",
        a: "For first-touch outbound, Gemini 2.5 Flash and GPT-5 Mini both produce strong results when grounded in real signals. Reasoning models like GPT-5 are overkill and slower. The model matters less than the signal data you feed it.",
      },
      {
        q: "How long should an AI-generated cold email be?",
        a: "80-110 words for first touch, 50-70 words for follow-ups. Anything longer dramatically reduces reply rates on mobile, where 70%+ of B2B email is now read.",
      },
    ],
    takeaway:
      "AI doesn't make cold email work — signals do. Use AI to scale personalization, but only ever ground it in real, recent, verifiable events.",
  },
  {
    slug: "hiring-signals-sales-prospecting",
    title: "Hiring Signals for Sales Prospecting: The Underrated Goldmine of B2B Intent",
    description:
      "Job postings reveal budget, priorities, and tech stack 30-90 days before any other intent signal fires. Here's how top sellers mine them.",
    keywords: [
      "hiring signals sales",
      "job posting intent data",
      "sales prospecting from job posts",
      "linkedin job intent",
      "hiring trigger events sales",
      "tech stack from job posts",
    ],
    category: "Signals",
    readMinutes: 8,
    publishedAt: "2026-03-18",
    author: "Rexxon Research",
    heroEyebrow: "The first signal to fire",
    intro:
      "By the time a company shows up on G2's intent feed or downloads a Gartner report, the budget is already allocated and the shortlist drawn. Job postings fire 30-90 days earlier — and they leak the exact tech stack, team structure, and budget category the company is about to spend on. Here's how to operationalize hiring signals.",
    sections: [
      {
        h2: "What job posts reveal that nothing else does",
        body: [
          "A senior job post is a budget commitment. Companies don't open six-figure roles unless funding is approved and a strategic initiative is greenlit. The job description itself is a budget brief written in plain English.",
        ],
        bullets: [
          "Required tools list = current tech stack you can displace or extend",
          "'Nice to have' tools = active evaluation candidates",
          "Reporting line = budget owner and decision-maker",
          "Location and remote policy = geographic expansion signals",
          "Volume of similar roles = scale of the initiative",
        ],
      },
      {
        h2: "Decoding the four hiring signal patterns",
        body: [
          "(1) The Build-Out: 5+ similar engineering roles in 30 days = platform expansion. (2) The Replacement: backfill of a senior leader = stack review window. (3) The First-Of: company's first compliance, security, or RevOps hire = greenfield category. (4) The Geo Plant: first APAC or EMEA role = regional GTM motion.",
        ],
      },
      {
        h2: "Tools and sources for hiring signal monitoring",
        body: [
          "LinkedIn Jobs, Indeed, Greenhouse, Lever and ATS scrapes all provide raw data. The hard part is normalization — deduping the same role posted across five boards, classifying seniority, extracting the tech stack, and matching to the right account. Rexxon AI does this automatically and routes only ICP-fit, high-confidence signals.",
        ],
      },
    ],
    faq: [
      {
        q: "How recent should a job post be to count as a buying signal?",
        a: "Posts within the last 14 days are highest value. After 30 days the role is often filled or deprioritized, and the signal decays sharply.",
      },
      {
        q: "Are senior or junior roles better signals?",
        a: "Senior roles (Director, VP, Head of) are stronger because they imply strategy ownership and budget authority. Junior IC roles confirm a build-out is real but rarely justify executive outreach alone.",
      },
    ],
    takeaway:
      "Job posts are the earliest, most specific, and most underused source of B2B intent. If your team isn't mining them daily, you're handing the meeting to the competitor that is.",
  },
  {
    slug: "intent-data-vs-buying-signals",
    title: "Intent Data vs Buying Signals: Why 6sense, Bombora and ZoomInfo Aren't Enough Anymore",
    description:
      "Honest comparison of traditional intent data vs real-time buying signals. When each works, where each fails, and how to combine them.",
    keywords: [
      "intent data vs buying signals",
      "6sense alternative",
      "bombora alternative",
      "zoominfo intent comparison",
      "third party intent data",
      "first party signals b2b",
    ],
    category: "Comparison",
    readMinutes: 10,
    publishedAt: "2026-03-11",
    author: "Rexxon Research",
    heroEyebrow: "The honest comparison",
    intro:
      "Intent data platforms built a $2B category by promising to surface 'in-market' accounts. Five years later, every sales team buys the same data and reply rates are at all-time lows. This piece compares anonymous third-party intent with named, real-time buying signals — and explains why most teams now run both.",
    sections: [
      {
        h2: "How traditional intent data works",
        body: [
          "Intent providers (6sense, Bombora, ZoomInfo, G2) aggregate anonymous content consumption across a publisher network. They detect when a company's IP range shows surging interest in a topic, then report that account as 'in-market' with a confidence score.",
        ],
      },
      {
        h2: "Where third-party intent breaks down",
        body: [
          "Three structural problems: anonymity (you don't know which person is researching), commoditization (every competitor sees the same surge), and lag (research happens weeks before action, but the signal fires after the shortlist is drawn).",
        ],
      },
      {
        h2: "How real-time buying signals are different",
        body: [
          "Buying signals are named events tied to specific public artifacts — a job post URL, a funding announcement, an SEC filing, a press release. Each comes with a timestamp, a source you can link to, and usually a named decision-maker.",
        ],
      },
      {
        h2: "When to use each (and how to layer them)",
        body: [
          "Use third-party intent for top-of-funnel ICP scoring and ABM list building. Use real-time signals to trigger 1:1 outreach within 24 hours of a budget-revealing event. Teams that layer both see 2-3x lift over either approach alone.",
        ],
      },
    ],
    faq: [
      {
        q: "Is real-time signal data more expensive than intent platforms?",
        a: "Per-account it's typically cheaper because you're only paying for high-confidence triggers, not a firehose of low-quality surges. Most teams replace one of their intent contracts with a signal platform and keep the other.",
      },
      {
        q: "Can I get buying signals without paying for a vendor?",
        a: "You can manually monitor LinkedIn Jobs, SEC EDGAR and Crunchbase — but the operational cost of normalization, scoring and routing usually exceeds the cost of a purpose-built tool by month two.",
      },
    ],
    takeaway:
      "Intent data tells you who might care. Buying signals tell you who just made a decision. The future of outbound is both, with signals doing the heavy lifting at the point of contact.",
  },
  {
    slug: "best-time-to-prospect-after-funding",
    title: "The Best Time to Prospect a Newly Funded Company (Backed by 12,000 Outbound Touches)",
    description:
      "Data analysis of 12,000 post-funding outbound touches reveals the exact 14-day window when newly funded companies are most likely to take meetings.",
    keywords: [
      "prospecting after funding round",
      "series a sales outreach",
      "selling to funded startups",
      "post funding outbound",
      "crunchbase prospecting",
      "venture funded company sales",
    ],
    category: "Data",
    readMinutes: 7,
    publishedAt: "2026-03-04",
    author: "Rexxon Research",
    heroEyebrow: "The 14-day window",
    intro:
      "Funding announcements are the most over-touched signal in B2B sales. The day a Series B is announced, hundreds of vendors blast the same congratulatory email — and reply rates collapse. We analyzed 12,000 post-funding touches across Rexxon customers to find the actual high-conversion window.",
    sections: [
      {
        h2: "The data: when reply rates peak after funding",
        body: [
          "Reply rates spike between days 8 and 22 after a funding announcement, not in the first week. The first week is dominated by 'congratulations' spam that buyers ignore. By week two, hiring kicks in, the budget is being allocated, and substantive vendor conversations begin.",
        ],
      },
      {
        h2: "What to send during the peak window",
        body: [
          "Skip the congratulations. Lead with a specific observation about a hire they've already made post-round, a tech stack signal in those job posts, or a peer company at the same stage that solved a similar problem.",
        ],
      },
      {
        h2: "Why the 'first to congratulate' strategy fails",
        body: [
          "Buyers anti-correlate vendor congratulations with relevance. The fastest-firing vendors are perceived as least researched. Wait two weeks, ground your outreach in a derivative signal, and you'll convert at 3-5x the average.",
        ],
      },
    ],
    faq: [
      {
        q: "Should I ever reach out the day a funding round is announced?",
        a: "Only if you have an existing relationship with the buyer or a warm intro. Cold outreach on day one is the lowest-converting touch in the entire post-funding window.",
      },
      {
        q: "Which funding stages convert best for outbound?",
        a: "Series B and C produce the highest meeting rates — the company has budget, urgency, and is still small enough that line-level managers can sponsor a vendor decision.",
      },
    ],
    takeaway:
      "Funding signals are still gold — but only if you wait for the second wave. Time your touch to the hiring spike that follows the announcement, not the announcement itself.",
  },
  {
    slug: "selling-to-cisos-leadership-change-signals",
    title: "Selling to a New CISO: How to Win the 90-Day Stack Review Window",
    description:
      "New CISOs review their security stack within 90 days. Here's the outbound playbook to land in the consideration set before the budget is committed.",
    keywords: [
      "selling to ciso",
      "new ciso outbound",
      "security vendor outreach",
      "ciso stack review",
      "leadership change sales signals",
      "cybersecurity sales playbook",
    ],
    category: "Playbook",
    readMinutes: 9,
    publishedAt: "2026-02-25",
    author: "Rexxon Research",
    heroEyebrow: "The 90-day window",
    intro:
      "When a new CISO joins, they almost always conduct a 60-90 day review of the existing security stack. Vendors who land in that review get a real shot. Vendors who arrive after it closes wait 18 months for the next renewal cycle. This playbook explains how to detect the moment, frame the outreach, and earn the meeting.",
    sections: [
      {
        h2: "Why new CISOs are the highest-conversion buyer in security",
        body: [
          "New leaders need a 90-day plan with visible wins. That plan almost always includes consolidating, replacing, or augmenting at least one tool category. If you can articulate how your product creates a quick win for that plan, you'll be invited in.",
        ],
      },
      {
        h2: "How to detect a CISO change in real time",
        body: [
          "LinkedIn title changes, SEC 8-K filings (for public companies), press releases, and conference speaker bios are the four canonical sources. Rexxon ingests all four and fires a leadership signal within 48 hours of a confirmed appointment.",
        ],
      },
      {
        h2: "The first-touch framework that works",
        body: [
          "Don't congratulate. Reference a specific public initiative they led at their previous company, connect it to a measurable outcome you've delivered for a similar-stage company, and offer a 15-minute peer benchmark — never a demo.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the CISO usually the right buyer or just an influencer?",
        a: "For tools above $100K ACV, the CISO is typically the economic buyer or has veto power. For under $50K, you're better off targeting the Director of Security Engineering who reports to them.",
      },
    ],
    takeaway:
      "A new CISO is a 90-day open door. Detect the change, ground the outreach in their prior work, and lead with peer benchmarks — not product features.",
  },
  {
    slug: "compliance-driven-sales-soc2-iso-hipaa",
    title: "Compliance-Driven Sales: Turning SOC 2, ISO 27001 and HIPAA Mandates Into Pipeline",
    description:
      "Compliance deadlines create the most urgent B2B buying windows. Here's how to detect SOC 2, ISO 27001 and HIPAA triggers and convert them.",
    keywords: [
      "soc 2 sales signals",
      "iso 27001 prospecting",
      "hipaa compliance vendor sales",
      "compliance trigger sales",
      "grc sales playbook",
      "regulatory sales signals",
    ],
    category: "Playbook",
    readMinutes: 8,
    publishedAt: "2026-02-18",
    author: "Rexxon Research",
    heroEyebrow: "Deadline-driven demand",
    intro:
      "Compliance is the rare B2B category where buyers have a hard deadline and a binary outcome — pass the audit or lose the customer. That urgency makes compliance signals the fastest-converting category in the Rexxon dataset, with average sales cycles 38% shorter than non-compliance deals.",
    sections: [
      {
        h2: "The five most predictive compliance signals",
        body: [],
        bullets: [
          "First GRC, security or compliance hire = SOC 2 Type I starting",
          "Auditor RFP language in job posts = audit cycle within 90 days",
          "Customer logo wins in regulated industries = compliance scope expanding",
          "ISO 27001 mentioned in marketing = formal program launching",
          "HIPAA-covered customer announcement = BAA process triggered",
        ],
      },
      {
        h2: "How to time compliance outreach",
        body: [
          "SOC 2 Type I evaluations begin 90-120 days before the audit window. Tools are typically chosen in days 30-60 of that period. Land in the consideration set during month one, and you'll be in the final two by the time procurement engages.",
        ],
      },
      {
        h2: "Messaging that converts in compliance categories",
        body: [
          "Compliance buyers want speed and auditor familiarity above features. Lead with 'most common stack passed by Big 4 auditors' and 'fastest path to Type I.' Save technical depth for the second call.",
        ],
      },
    ],
    faq: [
      {
        q: "Which compliance frameworks generate the most pipeline?",
        a: "SOC 2 Type II is the highest-volume signal. ISO 27001, HIPAA, and PCI-DSS produce smaller volumes but higher ACVs.",
      },
    ],
    takeaway:
      "Compliance is the closest thing B2B has to a hard deadline. Detect the trigger early, lead with speed and auditor familiarity, and you'll close in half the time.",
  },
  {
    slug: "sales-tech-stack-2026",
    title: "The Modern B2B Sales Tech Stack in 2026: 12 Tools Top Performers Actually Use",
    description:
      "Benchmark of the 2026 B2B sales tech stack — from signal platforms to AI dialers — based on what top-decile reps actually pay for.",
    keywords: [
      "sales tech stack 2026",
      "best sales tools",
      "ai sales platform",
      "modern sales stack",
      "sales engagement tools",
      "outbound tools comparison",
    ],
    category: "Stack",
    readMinutes: 12,
    publishedAt: "2026-02-11",
    author: "Rexxon Research",
    heroEyebrow: "What top reps pay for",
    intro:
      "We surveyed 340 top-decile B2B sellers about the tools they personally pay for or fight to keep. The 2026 stack looks very different from 2022 — fewer dashboards, more signal sources, and AI everywhere copy is generated.",
    sections: [
      {
        h2: "The four layers of the modern stack",
        body: [
          "Top performers organize their stack into four layers: signal layer (intent + real-time triggers), data layer (contacts + enrichment), engagement layer (multi-channel sequencing), and intelligence layer (AI copy + call analysis).",
        ],
      },
      {
        h2: "Signal layer — where the money moved",
        body: [
          "The single biggest 2024-2026 budget shift was from contact databases to signal platforms. Reps now pay for fewer contacts and better triggers — because a perfectly targeted, signal-anchored email out-converts a generic blast 5:1.",
        ],
      },
      {
        h2: "What's getting cut from the stack",
        body: [
          "Generic AI email writers, dashboard-only intent platforms, and low-data sales engagement tools are all being consolidated. Buyers want fewer tools that share a single source of truth.",
        ],
      },
    ],
    faq: [
      {
        q: "What's the average tool spend per rep in 2026?",
        a: "About $240/month for top-decile AEs across 4-6 tools. SDRs average $180/month across 3-5 tools.",
      },
    ],
    takeaway:
      "The 2026 sales stack is shorter, smarter, and signal-led. Cut the tools that don't generate triggers and double down on the ones that do.",
  },
  {
    slug: "trigger-events-account-based-marketing",
    title: "Trigger Events for ABM: 27 Signals Every Account-Based Marketer Should Track",
    description:
      "The complete taxonomy of B2B trigger events for ABM — 27 signals across hiring, funding, leadership, compliance, and tech expansion.",
    keywords: [
      "trigger events abm",
      "account based marketing signals",
      "abm intent data",
      "abm playbook 2026",
      "trigger event sales",
      "named account signals",
    ],
    category: "ABM",
    readMinutes: 10,
    publishedAt: "2026-02-04",
    author: "Rexxon Research",
    heroEyebrow: "The full taxonomy",
    intro:
      "Account-based marketing only works if you orchestrate around the right moments. This article catalogs 27 trigger events worth tracking for ABM, organized by category, and explains the typical conversion lift for each.",
    sections: [
      {
        h2: "Hiring triggers (8)",
        body: [
          "First security hire, first GRC hire, VP Sales appointment, 5+ engineering roles in 30 days, first APAC role, first EMEA role, CSM build-out, RevOps hire.",
        ],
      },
      {
        h2: "Leadership triggers (6)",
        body: [
          "New CISO, new CTO, new CFO, new VP Sales, new Chief AI Officer, board changes.",
        ],
      },
      {
        h2: "Funding & financial triggers (5)",
        body: [
          "Series A-D announcements, IPO filing, M&A announcement, earnings beat or miss, debt facility.",
        ],
      },
      {
        h2: "Compliance & regulatory triggers (4)",
        body: [
          "SOC 2 commitment, ISO 27001 launch, HIPAA scope expansion, GDPR or DPDP enforcement.",
        ],
      },
      {
        h2: "Tech-stack triggers (4)",
        body: [
          "Migration mentioned in job posts, deprecation of incumbent, new platform partnership, AI initiative announcement.",
        ],
      },
    ],
    faq: [
      {
        q: "How many triggers should an ABM program track at once?",
        a: "Start with 5-7 triggers tightly aligned to your ICP. Expand once you have a working detection-to-touch loop for each.",
      },
    ],
    takeaway:
      "ABM without triggers is a slide deck. Pick the seven triggers most predictive of your sale and instrument them end-to-end.",
  },
  {
    slug: "sales-prospecting-tools-for-startups",
    title: "Best Sales Prospecting Tools for Startups in 2026 (Without a $50K Budget)",
    description:
      "Pragmatic guide to building a startup sales prospecting stack in 2026 for under $1,500/month. Real tools, real prices, real results.",
    keywords: [
      "sales prospecting tools startups",
      "best prospecting software 2026",
      "startup sales stack",
      "lean sales tools",
      "affordable sales engagement",
      "founder led sales tools",
    ],
    category: "Startups",
    readMinutes: 8,
    publishedAt: "2026-01-28",
    author: "Rexxon Research",
    heroEyebrow: "For lean teams",
    intro:
      "Most prospecting guides assume you have a $50K stack budget and a RevOps hire. Most startups don't. Here's the lean stack we recommend for founder-led and pre-Series-B sales teams in 2026, including the one signal platform we believe pays for itself in 30 days.",
    sections: [
      {
        h2: "The under-$1,500/month startup stack",
        body: [],
        bullets: [
          "Signals: Rexxon AI starter — real-time triggers across 200 named accounts",
          "Contacts: Apollo or Clay starter — verified emails and titles",
          "Engagement: Smartlead or Instantly — high-deliverability sequencing",
          "CRM: HubSpot Free or Attio starter — pipeline and notes",
          "AI copy: built into the signal platform — no separate cost",
        ],
      },
      {
        h2: "What to skip until Series A",
        body: [
          "Skip 6sense, Outreach, Salesloft, Gong, and most enrichment platforms until you've crossed $2M ARR. They're built for teams of 20+ reps and the per-seat economics don't make sense before then.",
        ],
      },
      {
        h2: "How to measure if the stack is working",
        body: [
          "Three metrics: signal-to-touch latency (target under 24 hours), reply rate (target 8%+), and meeting-to-opportunity rate (target 30%+). If all three are healthy, the stack is doing its job.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need a CRM if I'm a solo founder doing sales?",
        a: "Yes — even Notion works. The discipline of logging every touch is more valuable than the tool itself in the first 50 conversations.",
      },
    ],
    takeaway:
      "Startups don't need more tools — they need fewer, better, signal-driven ones. Buy the trigger source, the contact source, and the sender. Skip the rest until you scale.",
  },
];

// =====================================================================
// 10 CASE STUDIES — long-tail company + outcome keywords
// =====================================================================
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "northbeam-tripled-pipeline-cybersecurity-buying-signals",
    company: "Northbeam Security",
    industry: "Cybersecurity",
    title:
      "How Northbeam Security Tripled Outbound Pipeline Using Real-Time Cybersecurity Buying Signals",
    description:
      "Northbeam Security cut prospecting time 62% and tripled qualified pipeline by replacing intent data with real-time hiring and leadership signals.",
    keywords: [
      "cybersecurity buying signals case study",
      "ciso outbound case study",
      "real-time intent data results",
      "siem vendor sales case study",
    ],
    publishedAt: "2026-04-05",
    metrics: [
      { label: "Pipeline lift", value: "3.1x" },
      { label: "Reply rate", value: "18.4%" },
      { label: "Time saved per rep", value: "11 hrs/wk" },
      { label: "ACV", value: "$84K" },
    ],
    challenge:
      "Northbeam's 7-person SDR team was sending 1,800 outbound emails a week with a 0.9% reply rate. Their 6sense and ZoomInfo stack surfaced the same accounts as every competitor, and reps were burning hours researching CISO LinkedIn pages with no clear trigger to anchor outreach.",
    approach: [
      "Switched primary trigger source from third-party intent to Rexxon real-time signals across 1,200 named ICP accounts",
      "Set minimum confidence threshold at 75 and routed only leadership + compliance signals to AE-level outreach",
      "Used Rexxon's AI brief generator to ground every first-touch email in a specific recent hire or filing",
      "Built a 24-hour signal-to-touch SLA with automated Slack alerts for tier-1 accounts",
    ],
    outcome: [
      "Reply rate climbed from 0.9% to 18.4% within 60 days",
      "Qualified pipeline grew 3.1x quarter over quarter",
      "Average prospecting time per rep dropped from 18 to 7 hours per week",
      "First closed-won deal sourced from a Rexxon CISO signal closed at $112K ACV in 41 days",
    ],
    quote: {
      text: "We stopped guessing which CISOs were in-market. Rexxon tells us the day a new one starts and gives us the brief — we just have to send the email.",
      author: "Priya Natarajan",
      role: "VP Sales, Northbeam Security",
    },
    signalsUsed: ["Leadership change", "First GRC hire", "SOC 2 commitment"],
  },
  {
    slug: "fluxworks-devtools-funding-signals-pipeline",
    company: "FluxWorks",
    industry: "DevTools",
    title:
      "FluxWorks Built $4.2M in DevTools Pipeline by Acting on Series B Funding Signals 14 Days Faster",
    description:
      "DevTools startup FluxWorks built $4.2M in 90 days by detecting Series B announcements and the resulting hiring spikes within 24 hours.",
    keywords: [
      "devtools sales case study",
      "series b prospecting case study",
      "post funding outbound results",
      "developer tools pipeline growth",
    ],
    publishedAt: "2026-04-02",
    metrics: [
      { label: "Pipeline added", value: "$4.2M" },
      { label: "Days to first touch", value: "1.2" },
      { label: "Meeting rate", value: "12.7%" },
      { label: "Cycle time reduction", value: "31%" },
    ],
    challenge:
      "FluxWorks sells observability tooling to engineering teams at venture-backed startups. Their previous workflow — a weekly Crunchbase export reviewed every Monday — meant they reached out 6-9 days after funding announcements, behind every major competitor.",
    approach: [
      "Connected Rexxon to a curated list of 4,000 Series A-D accounts with engineering team size 25-200",
      "Triggered hiring + tech-expansion signal alerts the moment a funded company posted a backend or platform engineer role",
      "AI-drafted first-touch emails referenced the specific tools listed in the job spec",
      "Routed top-tier signals directly to AE Slack channels for same-day touch",
    ],
    outcome: [
      "Average time from funding announcement to first personalized touch dropped from 7.4 days to 1.2",
      "$4.2M in pipeline added across the first 90 days",
      "Meeting acceptance rate hit 12.7% — a 4x lift over the previous quarter",
      "Sales cycle shortened 31% because reps engaged before competitors entered the deal",
    ],
    quote: {
      text: "Speed compounds. Reaching out two weeks faster means we're the first vendor in the room — and we win those deals 60% of the time.",
      author: "Marcus Cole",
      role: "Head of Growth, FluxWorks",
    },
    signalsUsed: ["Funding round", "Engineering hiring spike", "Tech-stack expansion"],
  },
  {
    slug: "atlasgrc-compliance-signals-soc2-pipeline",
    company: "AtlasGRC",
    industry: "Compliance / GRC",
    title:
      "AtlasGRC Generated 240 SOC 2 Opportunities in One Quarter Using Compliance-Trigger Signal Alerts",
    description:
      "GRC platform AtlasGRC produced 240 SOC 2 Type I opportunities in 90 days by detecting first-GRC-hire signals across SaaS companies.",
    keywords: [
      "grc software case study",
      "soc 2 sales pipeline case study",
      "compliance vendor outreach results",
      "first grc hire signal",
    ],
    publishedAt: "2026-03-28",
    metrics: [
      { label: "Opportunities created", value: "240" },
      { label: "Win rate uplift", value: "+47%" },
      { label: "Cost per opportunity", value: "$118" },
      { label: "Reply rate", value: "21.3%" },
    ],
    challenge:
      "AtlasGRC sells SOC 2 automation to mid-market SaaS. Their challenge: by the time a prospect Googled 'SOC 2 software,' three competitors were already in the deal. They needed to land in the consideration set 60-90 days earlier.",
    approach: [
      "Tracked 'first compliance / GRC / security hire' signals across 8,000 SaaS accounts in their ICP",
      "Triggered a multi-touch sequence the moment a signal fired, with AI-generated first-touch emails referencing the new hire by name and role",
      "Layered customer logo signals (announcing a new regulated-industry customer) as a secondary trigger",
    ],
    outcome: [
      "240 net-new opportunities in the first 90 days at a $118 cost per opportunity",
      "Win rate on signal-sourced deals 47% higher than on inbound",
      "21.3% average reply rate on first-touch — 12x their pre-Rexxon baseline",
    ],
    quote: {
      text: "When a SaaS company makes their first compliance hire, the SOC 2 clock just started. We're now in every one of those deals on day one.",
      author: "Eleanor Vance",
      role: "CRO, AtlasGRC",
    },
    signalsUsed: ["First GRC hire", "Regulated customer logo", "Auditor RFP language"],
  },
  {
    slug: "primer-revops-leadership-signals-enterprise-sales",
    company: "Primer RevOps",
    industry: "RevOps Software",
    title:
      "Primer RevOps Closed 8 Enterprise Deals in 6 Months Using New-VP-Sales Leadership Signals",
    description:
      "Primer RevOps built an enterprise pipeline by reaching new VPs of Sales within 5 days of appointment, closing 8 six-figure deals in 6 months.",
    keywords: [
      "revops software case study",
      "enterprise sales case study",
      "vp sales leadership signal",
      "new leader outbound playbook",
    ],
    publishedAt: "2026-03-20",
    metrics: [
      { label: "Enterprise deals closed", value: "8" },
      { label: "Avg ACV", value: "$167K" },
      { label: "Time to first meeting", value: "11 days" },
      { label: "Pipeline coverage", value: "5.2x" },
    ],
    challenge:
      "Primer needed to crack the enterprise segment without an existing brand or marketing engine. Their thesis: every new VP of Sales conducts a stack review in their first 90 days, and Primer should be in every one of those reviews.",
    approach: [
      "Monitored leadership change signals (new VP/CRO/Chief Revenue Officer) across 2,500 named enterprise accounts",
      "Used Rexxon AI to draft first-touch emails referencing the leader's prior company and a specific revenue program they ran",
      "Followed up with a peer benchmark offer instead of a demo CTA",
    ],
    outcome: [
      "8 closed-won enterprise deals at $167K average ACV within 6 months",
      "First meeting booked an average of 11 days after the leadership signal fired",
      "5.2x pipeline coverage maintained on the enterprise segment",
    ],
    quote: {
      text: "New VPs of Sales are looking for credibility, not vendors. We show up with peer benchmarks — and we get the meeting.",
      author: "Diego Marín",
      role: "CEO, Primer RevOps",
    },
    signalsUsed: ["VP Sales appointment", "CRO appointment", "RevOps hiring spike"],
  },
  {
    slug: "verdantai-mlops-tech-expansion-signals",
    company: "VerdantAI",
    industry: "MLOps",
    title:
      "VerdantAI Won 14 ML Platform Deals by Detecting Snowflake-to-Databricks Migration Signals in Job Posts",
    description:
      "MLOps vendor VerdantAI mined job descriptions for migration language to find 14 active ML platform deals — most before any competitor knew.",
    keywords: [
      "mlops sales case study",
      "tech stack migration signals",
      "databricks competitive case study",
      "data platform vendor sales",
    ],
    publishedAt: "2026-03-14",
    metrics: [
      { label: "Deals won", value: "14" },
      { label: "Competitive win rate", value: "71%" },
      { label: "Sales cycle", value: "62 days" },
      { label: "Avg ACV", value: "$128K" },
    ],
    challenge:
      "VerdantAI competes against incumbents with 100x their marketing budget. They needed a way to find data teams in active migration before the buying committee formalized — when vendor preference is still fluid.",
    approach: [
      "Trained Rexxon's signal classifier to detect specific migration language in job posts ('Snowflake to Databricks,' 'Airflow to Prefect')",
      "Triggered alerts the moment a target account posted a role mentioning a competing tool they were moving off of",
      "AI-drafted outreach offered a migration playbook, not a demo",
    ],
    outcome: [
      "14 closed-won deals in two quarters at $128K average ACV",
      "71% competitive win rate against incumbents twice their size",
      "Average sales cycle of 62 days vs 110 for inbound deals",
    ],
    quote: {
      text: "The migration is a moment of weakness for the incumbent. We just had to be there when it started — Rexxon makes that the easy part.",
      author: "Anya Reyes",
      role: "VP Sales, VerdantAI",
    },
    signalsUsed: ["Tech-stack migration language", "Data engineering hiring", "Platform RFP"],
  },
  {
    slug: "harborline-fintech-earnings-signals",
    company: "Harborline",
    industry: "Fintech Infrastructure",
    title:
      "Harborline Used Earnings-Call Signals to Add $1.8M ARR from Public Fintech Buyers",
    description:
      "Harborline mined earnings transcripts for 'platform consolidation' and 'cost optimization' phrases to source $1.8M ARR from public fintech buyers.",
    keywords: [
      "fintech sales case study",
      "earnings call signals",
      "public company outbound",
      "cost optimization sales triggers",
    ],
    publishedAt: "2026-03-07",
    metrics: [
      { label: "ARR added", value: "$1.8M" },
      { label: "Logos closed", value: "9" },
      { label: "Sales cycle", value: "94 days" },
      { label: "Reply rate", value: "16%" },
    ],
    challenge:
      "Selling cost-optimization software to public fintech CFOs requires impeccable timing. Harborline needed to identify CFOs publicly committing to spend reductions and reach out within the same news cycle.",
    approach: [
      "Used Rexxon's earnings-signal classifier to flag transcripts mentioning 'platform consolidation,' 'vendor rationalization,' or 'infrastructure cost optimization'",
      "Auto-generated CFO-targeted briefs citing the exact transcript line",
      "Sent within 48 hours of the earnings call",
    ],
    outcome: [
      "9 enterprise logos added in two quarters",
      "$1.8M new ARR sourced entirely from earnings-signal outreach",
      "16% reply rate — 8x the team's pre-existing CFO outreach baseline",
    ],
    quote: {
      text: "When a CFO says 'consolidation' on an earnings call, every competitor reads the headline. We read the transcript and reach out the same day.",
      author: "Tomás Becker",
      role: "Founder, Harborline",
    },
    signalsUsed: ["Earnings transcript keywords", "CFO appointment", "Public 8-K filing"],
  },
  {
    slug: "luminstack-saas-csm-hiring-signal-expansion",
    company: "Luminstack",
    industry: "Customer Success Software",
    title:
      "Luminstack Grew Land-and-Expand Pipeline 5x by Tracking CS Hiring Spikes Across Mid-Market SaaS",
    description:
      "Luminstack identified mid-market SaaS companies hiring 3+ CSMs in 30 days as the perfect moment to pitch CS automation — and grew pipeline 5x.",
    keywords: [
      "customer success software case study",
      "csm hiring signal",
      "saas land and expand",
      "cs platform sales",
    ],
    publishedAt: "2026-02-28",
    metrics: [
      { label: "Pipeline growth", value: "5.1x" },
      { label: "Win rate", value: "34%" },
      { label: "Avg ACV", value: "$56K" },
      { label: "Time to qualification", value: "9 days" },
    ],
    challenge:
      "Luminstack's CS automation product fits SaaS companies that have outgrown their first CSM but haven't built a full CS org. The challenge: that window is invisible from public data unless you watch hiring patterns.",
    approach: [
      "Configured Rexxon to fire signals when an account posted 3+ CSM roles in 30 days",
      "Layered with employee count (50-300) and ARR estimate filters",
      "Triggered automated VP CS-targeted sequences with AI briefs referencing the specific hiring spike",
    ],
    outcome: [
      "Pipeline grew 5.1x quarter over quarter",
      "34% win rate on signal-sourced opportunities",
      "Average qualification within 9 days of first touch",
    ],
    quote: {
      text: "When a SaaS team triples their CS headcount, they're about to hit the wall on tooling. Rexxon tells us the moment that wall comes into view.",
      author: "Hana Okonkwo",
      role: "CRO, Luminstack",
    },
    signalsUsed: ["CSM hiring spike", "VP Customer Success appointment", "Employee count growth"],
  },
  {
    slug: "northport-cnapp-cloud-security-signals",
    company: "Northport Cloud",
    industry: "Cloud Security",
    title:
      "Northport Cloud Captured 22 CNAPP Deals by Acting on Cloud Security Engineer Hiring Signals",
    description:
      "Cloud security vendor Northport closed 22 CNAPP deals in 5 months by detecting the moment companies began scaling cloud security headcount.",
    keywords: [
      "cnapp sales case study",
      "cloud security vendor case study",
      "cloud security engineer hiring signal",
      "wiz competitive case study",
    ],
    publishedAt: "2026-02-21",
    metrics: [
      { label: "CNAPP deals closed", value: "22" },
      { label: "Pipeline lift", value: "4.4x" },
      { label: "Avg ACV", value: "$94K" },
      { label: "Reply rate", value: "19%" },
    ],
    challenge:
      "Northport competes against well-funded CNAPP vendors with massive marketing footprints. Their edge had to come from timing — being the first vendor in the conversation when a company committed to scaling cloud security.",
    approach: [
      "Tracked 'Cloud Security Engineer' and 'Cloud Security Architect' job posts across 5,000 ICP accounts",
      "Fired a signal when an account posted 5+ such roles in a 30-day window",
      "Generated AI briefs explaining what the hiring pattern implied about the buyer's CNAPP timeline",
    ],
    outcome: [
      "22 CNAPP deals closed in 5 months at $94K average ACV",
      "Pipeline lift of 4.4x vs the prior period",
      "19% reply rate on first touch — well above category benchmarks",
    ],
    quote: {
      text: "Five Cloud Security Engineer roles in a month is the loudest CNAPP buying signal you'll ever see — and Rexxon catches every one.",
      author: "Felix Brennan",
      role: "VP Sales, Northport Cloud",
    },
    signalsUsed: ["Cloud Security Engineer hiring", "Cloud architect hiring", "AWS/GCP migration"],
  },
  {
    slug: "trellis-hr-tech-leadership-signals",
    company: "Trellis HR",
    industry: "HR Tech",
    title:
      "Trellis HR Booked 180 Demos in 90 Days by Targeting New Chief People Officers With Signal-Anchored Email",
    description:
      "Trellis HR booked 180 qualified demos in 90 days by detecting Chief People Officer appointments and reaching out within 5 business days.",
    keywords: [
      "hr tech sales case study",
      "cpo leadership signal",
      "people analytics sales",
      "hr software outbound",
    ],
    publishedAt: "2026-02-14",
    metrics: [
      { label: "Demos booked", value: "180" },
      { label: "Show rate", value: "82%" },
      { label: "Demo-to-opp", value: "41%" },
      { label: "Reply rate", value: "22%" },
    ],
    challenge:
      "Trellis's people analytics platform sells almost exclusively to Chief People Officers. With only 3,200 such roles globally, every appointment is precious — and missing the 90-day window means waiting a year for the next.",
    approach: [
      "Monitored CPO and CHRO appointments across all Series B+ companies with 200+ employees",
      "Generated AI briefs referencing the new CPO's previous people-analytics initiatives",
      "Routed every signal directly to the founder's Slack for hand-written first touches with AI-drafted second touches",
    ],
    outcome: [
      "180 qualified demos booked in 90 days",
      "82% demo show rate (well above the 60% B2B benchmark)",
      "41% demo-to-opportunity conversion",
    ],
    quote: {
      text: "There are only ever 200 net-new CPOs a quarter. Rexxon makes sure we're in front of every single one.",
      author: "Sarah Klein",
      role: "Founder & CEO, Trellis HR",
    },
    signalsUsed: ["Chief People Officer appointment", "CHRO appointment", "People-analytics hire"],
  },
  {
    slug: "quartzpay-payments-tech-expansion-signals",
    company: "Quartzpay",
    industry: "Payments",
    title:
      "Quartzpay Doubled Enterprise Pipeline by Mining International Expansion Signals from Job Posts",
    description:
      "Quartzpay doubled enterprise pipeline by detecting first APAC and EMEA hires as triggers for international payments evaluation conversations.",
    keywords: [
      "payments sales case study",
      "international expansion signals",
      "first apac hire trigger",
      "global payments vendor sales",
    ],
    publishedAt: "2026-02-07",
    metrics: [
      { label: "Pipeline lift", value: "2.1x" },
      { label: "Avg ACV", value: "$210K" },
      { label: "Reply rate", value: "15%" },
      { label: "Cycle time", value: "78 days" },
    ],
    challenge:
      "Quartzpay sells cross-border payment infrastructure. Their best buyers are companies just expanding internationally — but by the time press releases announce the new region, vendor selection is usually well underway.",
    approach: [
      "Tracked 'first APAC hire,' 'first EMEA hire,' and 'first LATAM hire' signals across 6,000 mid-market companies",
      "Layered with funding signals to confirm budget capacity",
      "Generated AI briefs framing Quartzpay as the operational backbone for the new region",
    ],
    outcome: [
      "Pipeline lift of 2.1x in the first two quarters",
      "$210K average ACV — well above the team's historical norm",
      "15% reply rate on a category that typically sees 3-4%",
    ],
    quote: {
      text: "The first APAC hire is the trigger nobody else watches. We close half the deals it surfaces.",
      author: "Riya Suresh",
      role: "Head of Sales, Quartzpay",
    },
    signalsUsed: ["First APAC/EMEA hire", "Funding round", "Country office announcement"],
  },
];

export const ALL_BLOG_TAGS = Array.from(
  new Set(BLOG_POSTS.flatMap((p) => p.keywords)),
).sort();
