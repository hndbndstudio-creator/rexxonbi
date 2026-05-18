import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () => ({
    meta: [
      { title: "Press Kit — Rexxon AI" },
      { name: "description", content: "Logos, brand assets, executive bios and press contacts for Rexxon AI." },
      { property: "og:title", content: "Press Kit — Rexxon AI" },
      { property: "og:description", content: "Logos, brand assets and press contacts for Rexxon AI." },
    ],
  }),
});

function PressPage() {
  return (
    <MarketingPage
      eyebrow="Press"
      title="Press kit & brand assets."
      intro="Everything journalists, analysts and partners need to write about Rexxon AI."
    >
      <h2>About Rexxon AI</h2>
      <p>
        Rexxon AI is a business market intelligence SaaS platform that turns real-time signals
        across companies, industries and markets into decision-ready intelligence for revenue,
        strategy and operations teams.
      </p>
      <h2>Brand Assets</h2>
      <ul>
        <li><a href="mailto:press@rexxon.ai?subject=Logo%20Request">Download logo pack (SVG, PNG)</a></li>
        <li><a href="mailto:press@rexxon.ai?subject=Brand%20Guidelines">Brand guidelines PDF</a></li>
        <li><a href="mailto:press@rexxon.ai?subject=Product%20Screenshots">Product screenshots</a></li>
      </ul>
      <h2>Media Contact</h2>
      <p>
        For interviews, quotes or product briefings, reach our team at{" "}
        <a href="mailto:press@rexxon.ai">press@rexxon.ai</a>. We respond within one business day.
      </p>
    </MarketingPage>
  );
}
