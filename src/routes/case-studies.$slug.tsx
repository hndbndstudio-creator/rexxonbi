import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Building2, Quote, Tag } from "lucide-react";
import { CASE_STUDIES, type CaseStudy } from "@/lib/blog-content";

type Metric = CaseStudy["metrics"][number];
import { BlogNav, BlogFooter, formatDate } from "./blog";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const study = CASE_STUDIES.find((c) => c.slug === params.slug);
    if (!study) throw notFound();
    return { study };
  },
  component: CaseStudyPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-24 text-center">
      <h1 className="text-2xl font-semibold">Case study not found</h1>
      <Link to="/case-studies" className="mt-4 inline-block text-brand">Back to case studies</Link>
    </div>
  ),
  head: ({ loaderData }) => {
    const c = loaderData?.study;
    if (!c) return { meta: [{ title: "Case study not found — Rexxon AI" }] };
    return {
      meta: [
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { title: c.title.length > 60 ? c.title.slice(0, 57) + "…" : `${c.title} | Rexxon AI`.length > 60 ? c.title : `${c.title} | Rexxon AI` },
        { name: "description", content: c.description },
        { name: "keywords", content: c.keywords.join(", ") },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://rexxon.ai/case-studies/${c.slug}` },
        { property: "og:image", content: "https://rexxon.ai/og-image.jpg" },
        { property: "article:published_time", content: c.publishedAt },
        { property: "article:section", content: c.industry },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: c.title },
        { name: "twitter:description", content: c.description },
        { name: "twitter:image", content: "https://rexxon.ai/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://rexxon.ai/case-studies/${c.slug}` }],
    };
  },
});

function CaseStudyPage() {
  const { study: c } = Route.useLoaderData();
  const others = CASE_STUDIES.filter((x) => x.slug !== c.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    datePublished: c.publishedAt,
    author: { "@type": "Organization", name: "Rexxon AI" },
    publisher: { "@type": "Organization", name: "Rexxon AI" },
    keywords: c.keywords.join(", "),
    about: { "@type": "Organization", name: c.company },
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogNav />

      <article className="mx-auto max-w-3xl px-4 md:px-6 pt-12 pb-16">
        <Link to="/case-studies" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All case studies
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" /> {c.company}
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-brand">{c.industry}</span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{c.title}</h1>
        <p className="mt-4 text-muted-foreground">{c.description}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4">
          {c.metrics.map((m: Metric) => (
            <div key={m.label}>
              <p className="text-2xl font-semibold text-foreground">{m.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">The challenge</h2>
          <p className="mt-3 text-foreground/90 leading-relaxed">{c.challenge}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">The approach</h2>
          <ul className="mt-3 space-y-2.5">
            {c.approach.map((a: string, i: number) => (
              <li key={i} className="flex gap-2 text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">The outcome</h2>
          <ul className="mt-3 space-y-2.5">
            {c.outcome.map((o: string, i: number) => (
              <li key={i} className="flex gap-2 text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>

        <blockquote className="mt-10 rounded-2xl border border-brand/30 bg-brand/5 p-6">
          <Quote className="h-5 w-5 text-brand" />
          <p className="mt-3 text-lg leading-relaxed text-foreground">"{c.quote.text}"</p>
          <footer className="mt-4 text-sm text-muted-foreground">
            — {c.quote.author}, {c.quote.role}
          </footer>
        </blockquote>

        <section className="mt-10">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Signals used</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.signalsUsed.map((s: string) => (
              <span key={s} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">{s}</span>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-2">
          {c.keywords.map((k: string) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" /> {k}
            </span>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">Get the same outcome</p>
          <h3 className="mt-2 text-2xl font-semibold">Build pipeline from real-time signals</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your Rexxon workspace and trigger signal-anchored outreach in minutes.</p>
          <Link to="/signup" className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">Published {formatDate(c.publishedAt)}</p>
      </article>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">More customer stories</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} to="/case-studies/$slug" params={{ slug: o.slug }} className="group rounded-xl border border-border bg-card p-5 hover:border-brand/50">
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{o.industry}</span>
              <h4 className="mt-2 font-semibold leading-snug group-hover:text-brand">{o.title}</h4>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </div>
  );
}
