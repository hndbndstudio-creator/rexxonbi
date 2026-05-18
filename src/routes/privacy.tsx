import { createFileRoute } from "@tanstack/react-router";
import { breadcrumbJsonLd } from "@/lib/seo";
import { LegalPage as MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Rexxon AI" },
      { name: "description", content: "How Rexxon AI collects, uses, stores and protects your personal data." },
          { property: "og:url", content: "https://rexxon.ai/privacy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — Rexxon AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/privacy" },
    ],
    scripts: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])],
  }),
});

function PrivacyPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Privacy Policy" intro="Last updated: May 2026.">
      <h2>Overview</h2>
      <p>
        This Privacy Policy explains how Rexxon AI, Inc. ("Rexxon", "we") collects, uses and
        protects information when you use our website and services.
      </p>
      <h2>What We Collect</h2>
      <ul>
        <li>Account information you provide (name, email, company).</li>
        <li>Usage data from our product (events, features used, errors).</li>
        <li>Data you upload or connect to enrich your intelligence workspace.</li>
      </ul>
      <h2>How We Use It</h2>
      <p>To deliver the service, improve product quality, communicate updates and meet legal obligations. We do not sell personal data.</p>
      <h2>Your Rights</h2>
      <p>You can access, export or delete your data anytime. Email <a href="mailto:privacy@rexxon.ai">privacy@rexxon.ai</a>.</p>
      <h2>Contact</h2>
      <p>Data Protection Officer: <a href="mailto:dpo@rexxon.ai">dpo@rexxon.ai</a></p>
    </MarketingPage>
  );
}
