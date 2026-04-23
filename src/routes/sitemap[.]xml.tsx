import { createFileRoute } from "@tanstack/react-router";
import { BLOG_POSTS, CASE_STUDIES } from "@/lib/blog-content";

const SITE = "https://rexxon.ai";

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/case-studies", changefreq: "weekly", priority: "0.9" },
  { path: "/affiliates", changefreq: "monthly", priority: "0.7" },
  { path: "/login", changefreq: "monthly", priority: "0.5" },
  { path: "/signup", changefreq: "monthly", priority: "0.6" },
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const today = new Date().toISOString().split("T")[0];
        const entries: string[] = [];

        for (const r of STATIC_ROUTES) {
          entries.push(urlEntry(r.path, today, r.changefreq, r.priority));
        }
        for (const post of BLOG_POSTS) {
          entries.push(
            urlEntry(`/blog/${post.slug}`, post.publishedAt.split("T")[0], "monthly", "0.8"),
          );
        }
        for (const cs of CASE_STUDIES) {
          entries.push(
            urlEntry(`/case-studies/${cs.slug}`, cs.publishedAt.split("T")[0], "monthly", "0.8"),
          );
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
