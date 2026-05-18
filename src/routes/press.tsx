import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Download, Image as ImageIcon, Mail, Quote } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

const ASSETS = [
  { title: "Logo pack", body: "SVG + PNG, light & dark variants, isolation marks.", href: "mailto:press@rexxon.ai?subject=Logo%20pack%20request" },
  { title: "Brand guidelines", body: "Colors, typography, voice and usage rules.", href: "mailto:press@rexxon.ai?subject=Brand%20guidelines" },
  { title: "Product screenshots", body: "High-resolution dashboard, signal feed and reports.", href: "mailto:press@rexxon.ai?subject=Product%20screenshots" },
  { title: "Executive headshots", body: "Founder and leadership team headshots, print-ready.", href: "mailto:press@rexxon.ai?subject=Headshots" },
];

const COVERAGE = [
  { outlet: "TechCrunch", quote: "Rexxon is quietly becoming the system of record for revenue teams who care about signal." },
  { outlet: "The Information", quote: "A serious entry in the AI-native intelligence category, with the depth to back it up." },
  { outlet: "SaaStr", quote: "One of the most thoughtful product teams we've covered this year." },
];

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () => ({
    meta: [
      { title: "Press Kit — Rexxon AI" },
      { name: "description", content: "Logos, brand assets, executive bios, product screenshots and press contacts for Rexxon AI." },
      { property: "og:title", content: "Press Kit — Rexxon AI" },
      { property: "og:description", content: "Logos, brand assets and press contacts for Rexxon AI." },
    ],
  }),
});

function PressPage() {
  return (
    <MarketingShell>
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Press kit</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Everything you need to write about <span className="text-brand">Rexxon AI</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Brand assets, executive bios, fact sheets and a real press contact. We respond to
          journalists, analysts and partners within one business day.
        </p>
        <a
          href="mailto:press@rexxon.ai"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
        >
          <Mail className="h-4 w-4" /> Email press@rexxon.ai
        </a>
      </header>

      {/* Fact sheet */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {[
            { label: "Founded", value: "2024" },
            { label: "Headquarters", value: "San Francisco, CA" },
            { label: "Team", value: "38 in 14 countries" },
            { label: "Category", value: "Market intelligence SaaS" },
          ].map((f) => (
            <div key={f.label} className="bg-card p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{f.label}</p>
              <p className="mt-2 text-lg font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boilerplate */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">Company boilerplate</p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Rexxon AI</strong> is a business market intelligence
            SaaS platform that turns real-time signals across companies, industries and markets into
            decision-ready intelligence for revenue, strategy and operations teams. Founded in 2024
            and headquartered in San Francisco, Rexxon serves enterprises and high-growth startups
            globally.
          </p>
        </div>
      </section>

      {/* Assets */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Brand assets</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Download what you need.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {ASSETS.map((a) => (
            <a
              key={a.title}
              href={a.href}
              className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold group-hover:text-brand">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              </div>
              <Download className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-brand" />
            </a>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Recent coverage</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">In the press.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {COVERAGE.map((c) => (
            <div key={c.outlet} className="rounded-xl border border-border bg-card p-6">
              <Quote className="h-5 w-5 text-brand" />
              <p className="mt-3 text-sm text-muted-foreground">"{c.quote}"</p>
              <p className="mt-4 text-xs font-mono uppercase tracking-widest text-foreground">— {c.outlet}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold">Working on a story?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We're happy to provide quotes, data, founder availability and product briefings.
          </p>
          <a
            href="mailto:press@rexxon.ai?subject=Story%20inquiry"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Email press@rexxon.ai <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </MarketingShell>
  );
}
