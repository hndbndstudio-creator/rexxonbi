import { createFileRoute } from "@tanstack/react-router";
import { LegalPage as MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/dpa")({
  component: DpaPage,
  head: () => ({
    meta: [
      { title: "Data Processing Agreement — Rexxon AI" },
      { name: "description", content: "Rexxon AI's Data Processing Agreement for GDPR and global privacy compliance." },
    ],
  }),
});

function DpaPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Data Processing Agreement" intro="GDPR-compliant DPA available for all customers.">
      <h2>Overview</h2>
      <p>
        Our DPA forms part of the Master Services Agreement and governs how Rexxon processes
        personal data on your behalf as a processor under GDPR, UK GDPR and similar laws.
      </p>
      <h2>Get a Signed DPA</h2>
      <p>
        Self-serve customers: a pre-signed DPA is available on request. Email{" "}
        <a href="mailto:legal@rexxon.ai">legal@rexxon.ai</a> with your company details and we'll
        send a counter-signed copy within one business day.
      </p>
      <h2>Subprocessors</h2>
      <p>See our current <a href="/subprocessors">list of subprocessors</a>.</p>
    </MarketingPage>
  );
}
