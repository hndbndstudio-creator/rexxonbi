import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 bg-grid">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-brand">404</p>
        <h2 className="mt-4 text-3xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const SITE_URL = "https://rexxon.ai";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#1e1b4b" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "author", content: "Rexxon AI" },
      { name: "publisher", content: "Rexxon AI" },
      { name: "format-detection", content: "telephone=no" },
      // Default site-wide tags (overridden by child routes)
      { title: "Rexxon AI — Real-time B2B buying signals & AI outreach" },
      { name: "description", content: "Rexxon AI monitors 10M+ companies for real-time buying signals — hiring, funding, leadership changes, earnings — and drafts AI personalized outreach to verified contacts." },
      { name: "keywords", content: "B2B buying signals, intent data, AI cold email, sales prospecting, outbound sales platform, hiring signals, funding alerts, sales intelligence, signal-based selling" },
      // Open Graph
      { property: "og:site_name", content: "Rexxon AI" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Rexxon AI — Real-time B2B buying signals" },
      { property: "og:description", content: "Real-time B2B buying signals with AI-drafted outreach to verified contacts." },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Rexxon AI — real-time B2B buying signals dashboard" },
      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@rexxonai" },
      { name: "twitter:creator", content: "@rexxonai" },
      { name: "twitter:title", content: "Rexxon AI — Real-time B2B buying signals" },
      { name: "twitter:description", content: "Real-time B2B buying signals with AI-drafted outreach to verified contacts." },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      // AI / LLM crawler hints
      { name: "application-name", content: "Rexxon AI" },
      { name: "apple-mobile-web-app-title", content: "Rexxon AI" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Rexxon AI",
              url: SITE_URL,
              logo: `${SITE_URL}/icon-512.png`,
              description: "Real-time B2B buying signals platform with AI-drafted outreach.",
              sameAs: [
                "https://twitter.com/rexxonai",
                "https://www.linkedin.com/company/rexxon-ai",
              ],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "Rexxon AI",
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/blog?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "SoftwareApplication",
              name: "Rexxon AI",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "127",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
