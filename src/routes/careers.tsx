import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Globe2, Heart, MapPin, Rocket, Sparkles, Users } from "lucide-react";
import { BlogNav } from "./blog";
import { SiteFooter } from "@/components/site-footer";

type Job = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  description: string;
};

const JOBS: Job[] = [
  // Engineering
  {
    slug: "senior-backend-engineer",
    title: "Senior backend engineer",
    team: "Engineering",
    location: "Remote (Americas / EU)",
    type: "Full-time",
    description:
      "Own the signal ingestion pipeline — Postgres, edge functions, queueing — that powers real-time market intelligence for thousands of teams.",
  },
  {
    slug: "staff-backend-engineer-data",
    title: "Staff backend engineer, data platform",
    team: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Design the multi-tenant data warehouse, vector store and entity-resolution graph behind Rexxon's intelligence layer.",
  },
  {
    slug: "senior-full-stack-engineer",
    title: "Senior full-stack engineer",
    team: "Engineering",
    location: "Remote (Americas / EU)",
    type: "Full-time",
    description:
      "Ship end-to-end product surfaces across React 19, TanStack Start and Supabase. You'll touch the dashboard, signal feed and AI workflows weekly.",
  },
  {
    slug: "ai-engineer-llm",
    title: "AI engineer, LLM systems",
    team: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Build retrieval, evals and orchestration for the AI layer that turns raw signals into briefings, summaries and recommendations.",
  },
  {
    slug: "qa-engineer",
    title: "QA engineer",
    team: "Engineering",
    location: "Remote (EU / Americas)",
    type: "Full-time",
    description:
      "Own end-to-end test coverage, regression suites and release confidence for the Rexxon platform. Playwright, Vitest, synthetic monitoring.",
  },
  {
    slug: "senior-qa-automation-engineer",
    title: "Senior QA automation engineer",
    team: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Design the automated testing strategy across web, API and data pipelines. Build the harness our engineers ship against every day.",
  },
  {
    slug: "senior-devops-engineer",
    title: "Senior DevOps / platform engineer",
    team: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Run our Cloudflare + Supabase infra, CI/CD, observability and on-call rotation. Quietly make everything ten times faster.",
  },
  {
    slug: "security-engineer",
    title: "Security engineer",
    team: "Engineering",
    location: "Remote (Americas / EU)",
    type: "Full-time",
    description:
      "Drive SOC 2 Type II, ISO 27001 and application security across the stack. Partner with product on threat modeling and least-privilege design.",
  },

  // Design & Product
  {
    slug: "senior-product-designer",
    title: "Senior product designer",
    team: "Design",
    location: "Remote (Americas / EU)",
    type: "Full-time",
    description:
      "Define the visual and interaction language of Rexxon's intelligence surfaces. Heavy data, heavy density, must feel effortless.",
  },
  {
    slug: "product-manager-intelligence",
    title: "Product manager, intelligence",
    team: "Product",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Own the signal-to-action loop: how teams discover, prioritize and act on market intelligence inside Rexxon.",
  },

  // Sales
  {
    slug: "account-executive-mid-market",
    title: "Account executive, mid-market",
    team: "Sales",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Run full-cycle deals from $25k–$150k ACV with RevOps, strategy and ops leaders at 200–2,000 employee companies.",
  },
  {
    slug: "account-executive-enterprise",
    title: "Account executive, enterprise",
    team: "Sales",
    location: "Remote (US / EMEA)",
    type: "Full-time",
    description:
      "Land and expand strategic accounts at the Fortune 1000. Multi-threaded, 6–9 month cycles, $150k+ ACV.",
  },
  {
    slug: "sales-development-representative",
    title: "Sales development representative",
    team: "Sales",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Be the first conversation prospects have with Rexxon. Outbound to revenue, strategy and ops leaders using our own signal engine.",
  },
  {
    slug: "senior-sales-engineer",
    title: "Senior sales engineer",
    team: "Sales",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Technical co-pilot in every enterprise deal. Run demos, scope integrations and translate prospect data into a story.",
  },

  // GTM
  {
    slug: "head-of-marketing",
    title: "Head of marketing",
    team: "Marketing",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Own brand, demand and product marketing. Build the category narrative around business market intelligence.",
  },
  {
    slug: "content-marketing-lead",
    title: "Content marketing lead",
    team: "Marketing",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Lead the editorial engine — research, blog, playbooks, case studies — that fuels our inbound and AI-search presence.",
  },
  {
    slug: "lifecycle-marketing-manager",
    title: "Lifecycle marketing manager",
    team: "Marketing",
    location: "Remote (Americas / EU)",
    type: "Full-time",
    description:
      "Own activation, retention and expansion comms across email, in-app and product surfaces.",
  },

  // Customer
  {
    slug: "customer-success-manager",
    title: "Customer success manager",
    team: "Customer",
    location: "Remote (US / EMEA)",
    type: "Full-time",
    description:
      "Drive activation, ROI and expansion for our top-quartile accounts. Become the trusted intelligence partner inside each customer.",
  },
  {
    slug: "solutions-architect",
    title: "Solutions architect",
    team: "Customer",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Architect data, integration and workflow rollouts for strategic customers. Bridge between product, engineering and the customer's stack.",
  },

  // Ops
  {
    slug: "head-of-finance",
    title: "Head of finance",
    team: "Operations",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Own FP&A, accounting and investor reporting as we scale through Series B and beyond.",
  },
  {
    slug: "people-operations-lead",
    title: "People operations lead",
    team: "Operations",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Build the systems, rituals and culture of a remote-first, high-trust company across 4 time zones.",
  },
];

const TEAMS = Array.from(new Set(JOBS.map((j) => j.team)));

const BENEFITS = [
  { icon: Globe2, title: "Remote-first, async by default", body: "Work from anywhere with overlap windows, not 9-to-5 zoom. We trust outcomes." },
  { icon: Heart, title: "Top-tier health & wellness", body: "Premium medical, dental and vision globally. $200/mo wellness stipend." },
  { icon: Rocket, title: "Real equity, real upside", body: "Meaningful early-stage equity with a 10-year exercise window." },
  { icon: Sparkles, title: "Learning & home office", body: "$2,000/yr learning budget. $1,500 home office setup. Best tools, no friction." },
  { icon: Users, title: "Quarterly offsites", body: "We meet in person every quarter — past offsites: Lisbon, Mexico City, Tokyo." },
  { icon: Briefcase, title: "Unlimited PTO (4 weeks min)", body: "We mean unlimited. Leadership tracks the minimum, not the maximum." },
];

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () => ({
    meta: [
      { title: "Careers — Build the future of business market intelligence | Rexxon AI" },
      {
        name: "description",
        content:
          "Join Rexxon AI. We're hiring across engineering, sales, design, marketing and operations to build the leading business market intelligence platform.",
      },
      { property: "og:title", content: "Careers at Rexxon AI" },
      {
        property: "og:description",
        content:
          "Remote-first, well-funded, building the leading business market intelligence platform. Open roles across engineering, sales, design and ops.",
      },
      { name: "twitter:title", content: "Careers at Rexxon AI" },
      {
        name: "twitter:description",
        content: "Help build the leading business market intelligence platform. Remote-first.",
      },
      { rel: "canonical", href: "https://rexxon.ai/careers" } as never,
    ],
  }),
});

function CareersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open roles at Rexxon AI",
    itemListElement: JOBS.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: j.title,
      url: `https://rexxon.ai/careers#${j.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogNav />

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Careers · We're hiring</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
          Build the system of record for <span className="text-brand">market intelligence</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Rexxon AI is a remote-first, well-funded company building the leading business market
          intelligence SaaS. We're a small, senior team — every hire moves the needle.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold">$42M</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Series A · 2025</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold">38</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Team across 14 countries</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold">{JOBS.length}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Open roles</p>
          </div>
        </div>
      </header>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Why Rexxon</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Open roles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Don't see your role? Email{" "}
              <a className="text-brand hover:underline" href="mailto:careers@rexxon.ai">
                careers@rexxon.ai
              </a>{" "}
              — we hire exceptional people opportunistically.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {TEAMS.map((team) => {
            const jobs = JOBS.filter((j) => j.team === team);
            return (
              <div key={team}>
                <div className="flex items-baseline justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-semibold">{team}</h3>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {jobs.length} open
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {jobs.map((j) => (
                    <li key={j.slug} id={j.slug}>
                      <a
                        href={`mailto:careers@rexxon.ai?subject=${encodeURIComponent(j.title)}`}
                        className="group flex flex-col gap-3 py-5 transition-colors hover:bg-card/40 md:flex-row md:items-center md:justify-between md:gap-6"
                      >
                        <div className="md:flex-1">
                          <p className="text-base font-semibold group-hover:text-brand">{j.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{j.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground md:flex-nowrap md:justify-end">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {j.location}
                          </span>
                          <span className="rounded-md border border-border px-2 py-1">{j.type}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold">Not the right role, but love what we're building?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We're always open to extraordinary people. Tell us what you'd build here.
          </p>
          <a
            href="mailto:careers@rexxon.ai?subject=General%20application"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
