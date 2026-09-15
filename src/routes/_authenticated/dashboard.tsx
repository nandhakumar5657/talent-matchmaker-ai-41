import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { assessmentsQuery, candidatesQuery, jdsQuery } from "@/lib/queries";
import { initials, scoreTone } from "@/lib/match";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Command deck — TalentGrid" },
      {
        name: "description",
        content: "Live placement pipeline: candidates screened, match scores and assessment status.",
      },
      { property: "og:title", content: "Command deck — TalentGrid" },
      { property: "og:description", content: "Your placement pipeline at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const candidates = useQuery(candidatesQuery);
  const jds = useQuery(jdsQuery);
  const assessments = useQuery(assessmentsQuery);

  const list = candidates.data ?? [];
  const scored = list.filter((c) => c.match_score != null);
  const avg = scored.length
    ? Math.round(scored.reduce((s, c) => s + (c.match_score ?? 0), 0) / scored.length)
    : 0;
  const pending = (assessments.data ?? []).filter((a) => a.status !== "Submitted").length;
  const shortlisted = list.filter((c) => c.status === "Shortlisted" || c.status === "Interview");

  const stats = [
    { label: "Candidates screened", value: String(list.length), note: "in your directory", tone: "text-cyan" },
    { label: "Avg. match score", value: `${avg}%`, note: "across scored resumes", tone: "text-violet" },
    { label: "Job descriptions", value: String((jds.data ?? []).length), note: "open roles", tone: "text-amber" },
    { label: "Assessments pending", value: String(pending), note: "awaiting submission", tone: "text-lime" },
  ];

  return (
    <AppShell
      eyebrow="Placement command center"
      title="Your placement pipeline"
      subtitle="Screening, matching and assessment activity in one view."
      actions={
        <Link
          to="/matching"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          + New match run
        </Link>
      }
    >
      <section className="rise grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass p-4">
            <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-card-foreground">
              {s.value}
            </div>
            <div className={`mt-1 text-xs font-medium ${s.tone}`}>{s.note}</div>
          </div>
        ))}
      </section>

      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="glass p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
            Latest job description
          </div>
          {jds.data?.[0] ? (
            <>
              <h2 className="mt-1 text-lg font-semibold text-card-foreground">{jds.data[0].title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {jds.data[0].skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg glass-soft px-2 py-1 text-xs font-medium text-cyan"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-xl glass-soft p-3">
                <div className="text-sm font-semibold text-card-foreground">
                  {jds.data[0].company || "Company"}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {[jds.data[0].location, jds.data[0].package].filter(Boolean).join(" · ") ||
                    "Details pending"}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No job descriptions yet — add one on the matching page.
            </p>
          )}
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
              Top candidates
            </div>
            <div className="text-xs font-medium text-muted-foreground">Ranked by fit</div>
          </div>
          <ul className="mt-3 space-y-2">
            {[...list]
              .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
              .slice(0, 5)
              .map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className="grid size-10 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-primary-foreground"
                    style={{ backgroundImage: "var(--gradient-brand)" }}
                  >
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {c.name}
                    </div>
                    <div className="truncate text-xs font-medium text-muted-foreground">
                      {[c.branch, c.batch].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{c.status}</span>
                  <div
                    className={`w-14 text-right font-mono text-sm font-semibold ${scoreTone(c.match_score ?? 0)}`}
                  >
                    {c.match_score != null ? `${c.match_score}%` : "—"}
                  </div>
                </li>
              ))}
            {list.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No candidates yet — add resumes in the directory.
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
              Assessment dispatch
            </div>
            <Link to="/assessments" className="text-xs font-medium text-muted-foreground hover:text-cyan">
              Manage
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {(assessments.data ?? []).slice(0, 5).map((a) => {
              const candidate = list.find((c) => c.id === a.candidate_id);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-card-foreground">
                      {candidate?.name ?? "Candidate"}
                    </div>
                    <div className="truncate text-xs font-medium text-muted-foreground">
                      {a.title}
                    </div>
                  </div>
                  <span className="rounded-lg glass-soft px-2 py-1 text-xs font-medium text-cyan">
                    {a.status}
                  </span>
                  <div className="w-12 text-right font-mono text-sm font-semibold text-card-foreground">
                    {a.score ?? "—"}
                  </div>
                </li>
              );
            })}
            {(assessments.data ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">No assessments sent yet.</li>
            ) : null}
          </ul>
        </div>

        <div className="glass p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
            Shortlist
          </div>
          <h2 className="mt-1 text-lg font-semibold text-card-foreground">
            {shortlisted.length} students advancing
          </h2>
          <ul className="mt-3 space-y-2">
            {shortlisted.slice(0, 5).map((c) => (
              <li key={c.id} className="rounded-xl glass-soft px-3 py-2 text-sm text-card-foreground">
                {c.name}
                <span className="ml-2 text-xs text-muted-foreground">{c.status}</span>
              </li>
            ))}
            {shortlisted.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Move candidates to Shortlisted from the directory.
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
