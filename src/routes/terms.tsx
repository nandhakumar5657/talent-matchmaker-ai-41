import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — TalentGrid Placement OS" },
      {
        name: "description",
        content:
          "Terms and conditions for utilizing TalentGrid campus recruitment and automated resume screening services.",
      },
      { property: "og:title", content: "Terms of Service — TalentGrid Placement OS" },
      {
        property: "og:description",
        content: "Terms of service and fair use guidelines for TalentGrid.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-screen p-5 lg:p-7">
      <header className="glass flex items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="grid size-9 place-items-center rounded-xl font-mono text-sm font-bold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            ◈
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-card-foreground">TalentGrid</div>
            <div className="text-[11px] font-medium text-muted-foreground">Placement OS</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-xl glass-soft px-3.5 py-1.5 text-xs font-semibold text-card-foreground transition hover:brightness-125"
          >
            Home
          </Link>
          <Link
            to="/auth"
            className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="rise glass mx-auto mt-6 max-w-4xl p-7 lg:p-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">
          Institutional Agreement
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-card-foreground lg:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Last updated: September 2026 · Governing use of the TalentGrid placement command center
        </p>

        <div className="sheen my-6 h-1 rounded-full" />

        <div className="space-y-6 text-sm font-medium leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-card-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using the TalentGrid portal, you agree to adhere to these Terms of Service.
              This platform is designated for college placement cells, training &amp; placement officers,
              authorized recruiters, and enrolled student candidates.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">2. Purpose of the Platform</h2>
            <p className="mt-2">
              TalentGrid provides workflow automation tools for screening candidate resumes, matching applicant skill
              profiles to job requirements, and tracking student assessment progress. Match scores and recommendation
              percentages are heuristic evaluation metrics designed to aid placement officers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">3. User Responsibilities</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>Users must maintain the confidentiality of their login credentials.</li>
              <li>Placement officers must ensure they have authorization to process student candidate profiles.</li>
              <li>Users agree not to upload harmful, malicious, or infringing content to the portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">4. Intellectual Property</h2>
            <p className="mt-2">
              All branding, matching algorithms, user interface designs, and platform assets are the property of TalentGrid.
              Participating institutions retain full rights and ownership over their proprietary student records and job listings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">5. Service Availability &amp; Disclaimer</h2>
            <p className="mt-2">
              While we strive for high uptime and continuous reliability, TalentGrid is provided on an &quot;as is&quot; basis.
              TalentGrid does not guarantee employment outcomes or third-party hiring decisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">6. Contact</h2>
            <p className="mt-2">
              For administrative inquiries or terms questions, contact the institutional administrator or system support.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link to="/" className="text-xs font-semibold text-cyan hover:underline">
            ← Back to Landing Page
          </Link>
          <Link to="/privacy" className="text-xs font-semibold text-muted-foreground hover:text-card-foreground">
            View Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
