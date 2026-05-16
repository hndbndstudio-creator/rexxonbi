import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-content";
import { BlogNav, BlogFooter, formatDate } from "./blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-24 text-center">
      <h1 className="text-2xl font-semibold">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-brand">Back to blog</Link>
    </div>
  ),
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Article not found — Rexxon AI" }] };
    return {
      meta: [
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { title: p.title.length > 60 ? p.title.slice(0, 57) + "…" : `${p.title} | Rexxon AI`.length > 60 ? p.title : `${p.title} | Rexxon AI` },
        { name: "description", content: p.description },
        { name: "keywords", content: p.keywords.join(", ") },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://rexxon.ai/blog/${p.slug}` },
        { property: "og:image", content: "https://rexxon.ai/og-image.jpg" },
        { property: "article:published_time", content: p.publishedAt },
        { property: "article:author", content: p.author },
        { property: "article:section", content: p.category },
        { property: "article:tag", content: p.keywords.join(",") },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p.title },
        { name: "twitter:description", content: p.description },
        { name: "twitter:image", content: "https://rexxon.ai/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://rexxon.ai/blog/${p.slug}` }],
    };
  },
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Rexxon AI" },
    keywords: post.keywords.join(", "),
    mainEntityOfPage: `https://rexxon.ai/blog/${post.slug}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <BlogNav />

      <article className="mx-auto max-w-3xl px-4 md:px-6 pt-12 pb-16">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All articles
        </Link>

        <p className="mt-6 text-xs font-mono uppercase tracking-widest text-brand">{post.heroEyebrow} · {post.category}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readMinutes} min read</span>
          <span>By {post.author}</span>
        </div>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground/90">
          <p className="text-lg leading-relaxed text-foreground">{post.intro}</p>

          {post.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{s.h2}</h2>
              <div className="mt-3 space-y-4">
                {s.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 space-y-2">
                    {s.bullets.map((b, k) => (
                      <li key={k} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
            <dl className="mt-4 space-y-5">
              {post.faq.map((f, i) => (
                <div key={i}>
                  <dt className="font-medium text-foreground">{f.q}</dt>
                  <dd className="mt-1 text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-brand/30 bg-brand/5 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-brand">Key takeaway</p>
            <p className="mt-2 text-foreground">{post.takeaway}</p>
          </section>

          <div className="flex flex-wrap gap-2 pt-2">
            {post.keywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" /> {k}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">See it live</p>
          <h3 className="mt-2 text-2xl font-semibold">Turn signals into pipeline this week</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your Rexxon workspace and watch buying signals stream into your dashboard.</p>
          <Link to="/signup" className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Keep reading</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {others.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-xl border border-border bg-card p-5 hover:border-brand/50">
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{p.category}</span>
              <h4 className="mt-2 font-semibold leading-snug group-hover:text-brand">{p.title}</h4>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </div>
  );
}
