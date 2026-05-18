import { createFileRoute } from "@tanstack/react-router";
import { LegalPage as MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Cookie Policy — Rexxon AI" },
      { name: "description", content: "How Rexxon AI uses cookies and similar technologies." },
          { property: "og:url", content: "https://rexxon.ai/cookies" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cookie Policy — Rexxon AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/cookies" },
    ],
  }),
});

function CookiesPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Cookie Policy" intro="Last updated: May 2026.">
      <h2>What Cookies We Use</h2>
      <ul>
        <li><strong>Essential</strong> — authentication, session, security. Cannot be disabled.</li>
        <li><strong>Analytics</strong> — anonymous usage metrics to improve the product.</li>
        <li><strong>Preferences</strong> — remember your theme, language and workspace choices.</li>
      </ul>
      <h2>Managing Cookies</h2>
      <p>You can clear or block cookies via your browser settings. Disabling essential cookies will break the service.</p>
      <h2>Questions</h2>
      <p>Email <a href="mailto:privacy@rexxon.ai">privacy@rexxon.ai</a>.</p>
    </MarketingPage>
  );
}
