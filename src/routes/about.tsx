import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Rexxon AI" },
      { name: "description", content: "Rexxon AI is building the system of record for business market intelligence. Learn about our mission, team and values." },
      { property: "og:title", content: "About Rexxon AI" },
      { property: "og:description", content: "Building the system of record for business market intelligence." },
    ],
  }),
});

function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="We're building the system of record for market intelligence."
      intro="Rexxon AI turns real-time signals across companies, industries and markets into decision-ready intelligence for revenue, strategy and operations teams."
    >
      <h2>Our mission</h2>
      <p>
        Most business decisions are still made with stale data. Spreadsheets, week-old reports,
        gut feel. We think every team — from the SDR to the CEO — deserves a live view of the
        market they operate in. That's what Rexxon is.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Signals beat reports.</strong> The freshest data wins.</li>
        <li><strong>AI is the new analyst.</strong> Synthesis should be instant, not weekly.</li>
        <li><strong>Trust is the product.</strong> Sources, citations and provenance, always.</li>
        <li><strong>Remote, async, senior.</strong> Small teams of operators move faster than orgs.</li>
      </ul>
      <h2>Team</h2>
      <p>
        We're a remote-first team of 38 across 14 countries — engineers, designers, analysts and
        operators who previously built and scaled products at companies you've heard of. We meet
        in person every quarter.
      </p>
    </MarketingPage>
  );
}
