import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentGrid — AI Campus Recruitment & Screening Portal" },
      {
        name: "description",
        content:
          "TalentGrid gives college placement cells one portal to upload resumes, match them to job descriptions and run adaptive assessments that shortlist students by real knowledge.",
      },
      { property: "og:title", content: "TalentGrid — AI Campus Recruitment & Screening Portal" },
      {
        property: "og:description",
        content:
          "Upload resumes, match job descriptions and dispatch adaptive assessments from one command center.",
      },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    eyebrow: "Screening",
    title: "Resume intake",
    body: "Add student resumes in seconds. Skills, branch and CGPA stay searchable across every drive.",
    tone: "text-cyan",
  },
  {
    eyebrow: "Matching",
    title: "JD fit scoring",
    body: "Every resume is scored against the job description with transparent, explainable skill evidence.",
    tone: "text-violet",
  },
  {
    eyebrow: "Evaluation",
    title: "Adaptive assessments",
    body: "Send assessment links, track submissions and shortlist students on knowledge, not guesswork.",
    tone: "text-amber",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen p-5 lg:p-7">
      <header className="glass flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
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
        </div>
        <Link
          to="/auth"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          Sign in
        </Link>
      </header>

      <section className="rise glass mt-5 p-7 lg:p-12">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Agentic AI · Campus recruitment
        </div>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance text-card-foreground lg:text-6xl">
          An intelligent recruitment system for automated screening and adaptive interview
          evaluation
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium text-pretty text-muted-foreground">
          One portal for your placement cell: upload resumes, match them to job descriptions, and
          send assessment links that train and shortlist students on real knowledge.
        </p>
        <div className="mt-7">
          <Link
            to="/auth"
            className="inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Enter the portal
          </Link>
        </div>
        <div className="sheen mt-8 h-1 rounded-full" />
      </section>

      <section className="rise mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title} className="glass p-5">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${p.tone}`}>
              {p.eyebrow}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-card-foreground">{p.title}</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-5 px-2 py-4 text-[11px] font-medium text-muted-foreground">
        TalentGrid Placement OS · secure faculty &amp; coordinator access
      </footer>
    </div>
  );
}
