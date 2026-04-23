import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-content";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Rexxon AI Blog — B2B Buying Signals, Outbound & AI Sales Insights" },
      {
        name: "description",
        content:
          "In-depth guides on real-time B2B buying signals, AI cold email, sales prospecting, ABM trigger events and the modern outbound stack.",
      },
      { property: "og:title", content: "Rexxon AI Blog — Real-time signals & outbound playbooks" },
      {
        property: "og:description",
        content:
          "Hyper-specific guides on buying signals, AI outreach, intent data, hiring triggers, compliance sales and the 2026 sales tech stack.",
      },
      { name: "twitter:title", content: "Rexxon AI Blog" },
      {
        name: "twitter:description",
        content: "Real-time signals, AI outreach, and outbound playbooks for modern B2B sales.",
      },
      { rel: "canonical", href: "https://rexxon.ai/blog" } as never,
    ],
  }),
});

function BlogIndex() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const featured = sorted[0];
  const rest = sorted.slice(1);

  // BlogPosting list JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Rexxon AI Blog",
    description:
      "Real-time B2B buying signals, AI outbound and sales playbooks for modern revenue teams.",
    blogPost: sorted.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      author: { "@type": "Organization", name: "Rexxon AI" },
      keywords: p.keywords.join(", "),
      url: `https://rexxon.ai/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogNav />

      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Field notes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          The Rexxon AI blog
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Hyper-specific playbooks on real-time B2B buying signals, AI-personalized outbound,
          ABM trigger events, intent data, and the modern sales tech stack.
        </p>
      </header>

      {featured && (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group block overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors hover:border-brand/50 md:p-10"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
              <BookOpen className="h-3.5 w-3.5" /> Featured · {featured.category}
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl group-hover:text-brand">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">{featured.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(featured.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.readMinutes} min read</span>
              <span className="inline-flex items-center gap-1.5 text-brand">Read article <ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/50"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-brand">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                <span>{formatDate(p.publishedAt)}</span>
                <span>{p.readMinutes} min</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </div>
  );
}

export function BlogNav() {
  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold">
          <RexxonLogo size="sm" />
          Rexxon AI
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/blog" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">Blog</Link>
          <Link to="/case-studies" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">Case studies</Link>
          <Link to="/" className="hover:text-foreground">Product</Link>
          <Link to="/login" className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-card">Log in</Link>
        </div>
      </div>
    </nav>
  );
}

export function BlogFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rexxon AI</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/case-studies" className="hover:text-foreground">Case studies</Link>
          <Link to="/affiliates" className="hover:text-foreground">Affiliate program</Link>
          <Link to="/" className="hover:text-foreground">Product</Link>
        </div>
      </div>
    </footer>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
