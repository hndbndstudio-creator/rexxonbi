import { createFileRoute } from "@tanstack/react-router";
import { LegalPage as MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — Rexxon AI" },
      { name: "description", content: "The terms that govern your use of Rexxon AI's website and services." },
          { property: "og:url", content: "https://rexxon.ai/terms" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms of Service — Rexxon AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/terms" },
    ],
  }),
});

function TermsPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Terms of Service" intro="Last updated: May 2026.">
      <h2>Acceptance</h2>
      <p>By using Rexxon AI you agree to these terms. If you don't agree, don't use the service.</p>
      <h2>Your Account</h2>
      <p>You are responsible for safeguarding your credentials and for all activity under your account.</p>
      <h2>Acceptable Use</h2>
      <p>Don't abuse the service — no reverse engineering, no scraping at scale, no illegal activity, no infringing content.</p>
      <h2>Subscriptions & Billing</h2>
      <p>Paid plans renew automatically. Cancel any time from your billing settings; service continues through the end of the paid period.</p>
      <h2>Disclaimer</h2>
      <p>The service is provided "as is". Intelligence outputs are decision support — verify before acting on material decisions.</p>
      <h2>Contact</h2>
      <p>Questions: <a href="mailto:legal@rexxon.ai">legal@rexxon.ai</a></p>
    </MarketingPage>
  );
}
