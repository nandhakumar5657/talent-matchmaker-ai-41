import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — TalentGrid Placement OS" },
      {
        name: "description",
        content:
          "Learn how TalentGrid protects student and institutional data, processes resumes client-side, and ensures privacy compliance.",
      },
      { property: "og:title", content: "Privacy Policy — TalentGrid Placement OS" },
      {
        property: "og:description",
        content: "Transparent data protection and privacy policies for TalentGrid.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Data Protection &amp; Transparency
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-card-foreground lg:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Last updated: September 2026 · Effective for all TalentGrid users and campus placement cells
        </p>

        <div className="sheen my-6 h-1 rounded-full" />

        <div className="space-y-6 text-sm font-medium leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-card-foreground">1. Overview &amp; Purpose</h2>
            <p className="mt-2">
              TalentGrid is an automated screening and campus recruitment evaluation platform designed
              specifically for educational institutions, placement officers, and student applicants.
              We prioritize data minimization, transparency, and high security across all features.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">2. Information We Collect</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>
                <strong className="text-card-foreground">Placement Officer / User Accounts:</strong> Name,
                institutional email address, institution name, and secure authentication tokens.
              </li>
              <li>
                <strong className="text-card-foreground">Candidate Data:</strong> Student name, email address,
                degree branch, graduating batch, CGPA, and extracted technical skill tags.
              </li>
              <li>
                <strong className="text-card-foreground">Job Descriptions &amp; Evaluations:</strong> Job role details,
                required skills, candidate match scores, and dispatched assessment statuses.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">3. How Resumes Are Processed</h2>
            <p className="mt-2">
              TalentGrid utilizes local, browser-side in-memory text parsing (via <code className="rounded bg-secondary/50 px-1 py-0.5 text-xs font-mono text-cyan">pdfjs-dist</code>)
              to extract relevant skill keywords. Uploaded documents are not processed by third-party data brokers,
              nor are they used to train public foundational AI models without consent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">4. Data Sharing &amp; Third-Party Services</h2>
            <p className="mt-2">
              We <strong className="text-card-foreground">never sell, rent, or monetize</strong> student or institutional data.
              Data is stored securely within authenticated cloud infrastructure (Supabase with Row-Level Security)
              solely accessible to authorized placement coordinators.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">5. Data Retention &amp; Student Rights</h2>
            <p className="mt-2">
              Institutions retain full ownership of candidate and recruitment records. Placement coordinators can update
              or delete candidate entries, resumes, and assessment links at any time directly through the Candidate Directory.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">6. Security Measures</h2>
            <p className="mt-2">
              All communications between your browser and our servers are encrypted with HTTPS / TLS 1.3.
              Access to student directories and assessment records strictly requires verified authentication.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-card-foreground">7. Contact &amp; Inquiries</h2>
            <p className="mt-2">
              For questions regarding this policy or data processing practices, reach out to your institution&apos;s
              placement cell administration or the TalentGrid engineering team.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link to="/" className="text-xs font-semibold text-cyan hover:underline">
            ← Back to Landing Page
          </Link>
          <Link to="/terms" className="text-xs font-semibold text-muted-foreground hover:text-card-foreground">
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
