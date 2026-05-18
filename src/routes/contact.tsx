import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Briefcase, HeartHandshake, LifeBuoy, Mail, Newspaper, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

type Channel = {
  icon: typeof Mail;
  title: string;
  body: string;
  email: string;
  cta: string;
  responseTime: string;
};

const CHANNELS: Channel[] = [
  {
    icon: Briefcase,
    title: "Sales",
    body: "Pricing, demos, security reviews, procurement and enterprise contracts.",
    email: "sales@rexxon.ai",
    cta: "Book a demo",
    responseTime: "< 4 business hours",
  },
  {
    icon: LifeBuoy,
    title: "Support",
    body: "Existing customer? Reach our customer team for product help and incidents.",
    email: "support@rexxon.ai",
    cta: "Email support",
    responseTime: "< 2 business hours",
  },
  {
    icon: Newspaper,
    title: "Press & analyst relations",
    body: "Interviews, quotes, embargoed briefings and analyst reports.",
    email: "press@rexxon.ai",
    cta: "Email press",
    responseTime: "< 1 business day",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    body: "Vulnerability reports, security reviews and disclosure inquiries.",
    email: "security@rexxon.ai",
    cta: "Report a vulnerability",
    responseTime: "< 24 hours",
  },
  {
    icon: HeartHandshake,
    title: "Partnerships",
    body: "Integrations, co-marketing, channel partnerships and strategic alliances.",
    email: "partners@rexxon.ai",
    cta: "Email partnerships",
    responseTime: "< 2 business days",
  },
  {
    icon: Mail,
    title: "General inquiries",
    body: "Anything else — we read every message and route it to the right person.",
    email: "hello@rexxon.ai",
    cta: "Say hello",
    responseTime: "< 1 business day",
  },
];

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Rexxon AI" },
      { name: "description", content: "Get in touch with the Rexxon AI team — sales, support, press, security and partnerships. Real humans, fast responses." },
      { property: "og:title", content: "Contact Rexxon AI" },
      { property: "og:description", content: "Sales, support, press, security and partnership contacts." },
          { property: "og:url", content: "https://rexxon.ai/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Rexxon AI — Sales, Support, Press, Security" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/contact" },
    ],
  }),
});

function ContactPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Contact</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Talk to a <span className="text-brand">human</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          No ticket queues, no chatbots first. Pick the inbox that fits — a real teammate replies
          inside one business day, usually faster.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All channels operational
          </span>
          <span>Avg response: 3h 12m</span>
        </div>
      </header>

      {/* Channels */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={`mailto:${c.email}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <c.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.email}</span>
                <span className="font-mono uppercase tracking-widest text-brand">{c.responseTime}</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                {c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Self-serve row */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-xs font-mono uppercase tracking-widest text-brand">Self-serve</p>
            <h2 className="mt-2 text-xl font-semibold">Faster than waiting for a reply.</h2>
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            <Link to="/help" className="group rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-brand/50">
              <LifeBuoy className="h-4 w-4 text-brand" />
              <p className="mt-3 text-sm font-semibold group-hover:text-brand">Help center</p>
              <p className="mt-1 text-xs text-muted-foreground">Guides & answers</p>
            </Link>
            <Link to="/docs" className="group rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-brand/50">
              <BookOpen className="h-4 w-4 text-brand" />
              <p className="mt-3 text-sm font-semibold group-hover:text-brand">Documentation</p>
              <p className="mt-1 text-xs text-muted-foreground">API & integration</p>
            </Link>
            <Link to="/status" className="group rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-brand/50">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <p className="mt-3 text-sm font-semibold group-hover:text-brand">System status</p>
              <p className="mt-1 text-xs text-muted-foreground">Live uptime</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
