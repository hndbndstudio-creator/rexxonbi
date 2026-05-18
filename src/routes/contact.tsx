import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Rexxon AI" },
      { name: "description", content: "Get in touch with the Rexxon AI team — sales, support, press and partnerships." },
      { property: "og:title", content: "Contact Rexxon AI" },
      { property: "og:description", content: "Sales, support, press and partnership contacts." },
    ],
  }),
});

function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Talk to a human."
      intro="Pick the inbox that fits — a real person reads every message, usually within one business day."
    >
      <h2>Sales</h2>
      <p>Pricing, demos, procurement: <a href="mailto:sales@rexxon.ai">sales@rexxon.ai</a></p>
      <h2>Support</h2>
      <p>Existing customers: <a href="mailto:support@rexxon.ai">support@rexxon.ai</a></p>
      <h2>Press & Analyst Relations</h2>
      <p><a href="mailto:press@rexxon.ai">press@rexxon.ai</a></p>
      <h2>Security & Vulnerability Reports</h2>
      <p><a href="mailto:security@rexxon.ai">security@rexxon.ai</a></p>
      <h2>Partnerships</h2>
      <p><a href="mailto:partners@rexxon.ai">partners@rexxon.ai</a></p>
      <h2>General</h2>
      <p><a href="mailto:hello@rexxon.ai">hello@rexxon.ai</a></p>
    </MarketingPage>
  );
}
