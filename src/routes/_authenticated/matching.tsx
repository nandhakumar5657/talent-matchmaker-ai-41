import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { candidatesQuery, currentUserId, jdsQuery } from "@/lib/queries";
import { initials, matchScore, matchedSkills, parseList, scoreTone } from "@/lib/match";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/matching")({
  head: () => ({
    meta: [
      { title: "Resume matching — TalentGrid" },
      {
        name: "description",
        content:
          "Score every student resume against a job description and rank candidates by explainable skill fit.",
      },
      { property: "og:title", content: "Resume matching — TalentGrid" },
      { property: "og:description", content: "Rank candidates against any job description." },
    ],
  }),
  component: MatchingPage,
});

function MatchingPage() {
  const queryClient = useQueryClient();
  const jds = useQuery(jdsQuery);
  const candidates = useQuery(candidatesQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    package: "",
    skills: "",
    description: "",
  });

  useEffect(() => {
    if (!selectedId && jds.data?.[0]) setSelectedId(jds.data[0].id);
  }, [jds.data, selectedId]);

  const addJd = useMutation({
    mutationFn: async () => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("job_descriptions").insert({
        user_id,
        title: form.title,
        company: form.company,
        location: form.location,
        package: form.package,
        skills: parseList(form.skills),
        description: form.description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job description saved");
      setForm({ title: "", company: "", location: "", package: "", skills: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["job_descriptions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selected = (jds.data ?? []).find((j) => j.id === selectedId) ?? null;

  const ranked = (candidates.data ?? [])
    .map((c) => ({
      candidate: c,
      score: selected ? matchScore(c, selected.skills) : 0,
      hits: selected ? matchedSkills(c, selected.skills) : [],
    }))
    .sort((a, b) => b.score - a.score);

  const saveScores = useMutation({
    mutationFn: async () => {
      for (const row of ranked) {
        const { error } = await supabase
          .from("candidates")
          .update({ match_score: row.score })
          .eq("id", row.candidate.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Match scores saved to the directory");
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field =
    "w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

  return (
    <AppShell
      eyebrow="Automated screening"
      title="Resume ↔ JD matching"
      subtitle="Every resume is scored on skill coverage plus evidence found in the resume text."
      actions={
        <button
          onClick={() => saveScores.mutate()}
          disabled={!selected || ranked.length === 0 || saveScores.isPending}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          {saveScores.isPending ? "Saving…" : "Run & save scores"}
        </button>
      }
    >
      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="flex flex-col gap-5">
          <div className="glass p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
              Job description
            </div>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-2 w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none"
            >
              <option value="" className="bg-popover text-popover-foreground">
                Select a role
              </option>
              {(jds.data ?? []).map((j) => (
                <option key={j.id} value={j.id} className="bg-popover text-popover-foreground">
                  {j.title} · {j.company}
                </option>
              ))}
            </select>
            {selected ? (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg glass-soft px-2 py-1 text-xs font-medium text-violet"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {selected.description ? (
                  <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>
                ) : null}
                <div className="mt-4 rounded-xl glass-soft p-3">
                  <div className="text-sm font-semibold text-card-foreground">
                    {selected.company || "Company"}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {[selected.location, selected.package].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <form
            className="glass space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              addJd.mutate();
            }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
              New job description
            </div>
            <input
              className={field}
              required
              placeholder="Role title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={field}
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              <input
                className={field}
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <input
              className={field}
              placeholder="Package (e.g. 12 LPA)"
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
            />
            <input
              className={field}
              required
              placeholder="Required skills, comma separated"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <textarea
              className={`${field} min-h-24`}
              placeholder="Role description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button
              type="submit"
              disabled={addJd.isPending}
              className="w-full rounded-xl glass-soft px-4 py-2.5 text-sm font-semibold text-card-foreground transition hover:brightness-125 disabled:opacity-60"
            >
              {addJd.isPending ? "Saving…" : "Save job description"}
            </button>
          </form>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
              Matched candidates
            </div>
            <div className="text-xs font-medium text-muted-foreground">Ranked by fit</div>
          </div>
          <ul className="mt-3 space-y-2">
            {selected
              ? ranked.map(({ candidate, score, hits }) => (
                  <li
                    key={candidate.id}
                    className="rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid size-10 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-primary-foreground"
                        style={{ backgroundImage: "var(--gradient-brand)" }}
                      >
                        {initials(candidate.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-card-foreground">
                          {candidate.name}
                        </div>
                        <div className="truncate text-xs font-medium text-muted-foreground">
                          {[candidate.branch, candidate.batch].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className={`w-14 text-right font-mono text-sm font-semibold ${scoreTone(score)}`}>
                        {score}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score}%`, backgroundImage: "var(--gradient-brand)" }}
                      />
                    </div>
                    {hits.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {hits.map((h) => (
                          <span
                            key={h}
                            className="rounded-md glass-soft px-1.5 py-0.5 text-[11px] font-medium text-lime"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))
              : (
                  <li className="text-sm text-muted-foreground">
                    Select or create a job description to rank candidates.
                  </li>
                )}
            {selected && ranked.length === 0 ? (
              <li className="text-sm text-muted-foreground">Add candidates in the directory first.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
