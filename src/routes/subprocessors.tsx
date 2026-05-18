import { createFileRoute } from "@tanstack/react-router";
import { LegalPage as MarketingPage } from "@/components/marketing-page";

const SUBPROCESSORS = [
  { name: "Amazon Web Services", purpose: "Cloud hosting & storage", region: "United States, EU" },
  { name: "Cloudflare", purpose: "CDN, edge compute, DDoS protection", region: "Global" },
  { name: "Supabase", purpose: "Managed Postgres & authentication", region: "United States, EU" },
  { name: "Stripe", purpose: "Payment processing", region: "United States" },
  { name: "OpenAI", purpose: "LLM inference (opt-in workspaces)", region: "United States" },
  { name: "Anthropic", purpose: "LLM inference (opt-in workspaces)", region: "United States" },
  { name: "Resend", purpose: "Transactional email delivery", region: "United States" },
  { name: "Linear", purpose: "Internal product & support tickets", region: "United States" },
];

export const Route = createFileRoute("/subprocessors")({
  component: SubprocessorsPage,
  head: () => ({
    meta: [
      { title: "Subprocessors — Rexxon AI" },
      { name: "description", content: "Current list of subprocessors used by Rexxon AI to deliver the service." },
    ],
  }),
});

function SubprocessorsPage() {
  return (
    <MarketingPage
      eyebrow="Legal"
      title="Subprocessors"
      intro="The vendors we use to deliver the Rexxon AI service. We notify customers in advance of material changes."
    >
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Purpose</th>
            <th>Region</th>
          </tr>
        </thead>
        <tbody>
          {SUBPROCESSORS.map((s) => (
            <tr key={s.name}>
              <td><strong>{s.name}</strong></td>
              <td>{s.purpose}</td>
              <td>{s.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Subscribe to updates by emailing <a href="mailto:legal@rexxon.ai">legal@rexxon.ai</a>.
      </p>
    </MarketingPage>
  );
}
