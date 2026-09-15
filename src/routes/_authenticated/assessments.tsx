import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { assessmentsQuery, candidatesQuery, currentUserId } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments — TalentGrid" },
      {
        name: "description",
        content:
          "Send adaptive assessment links to students, track submissions and record scores for shortlisting.",
      },
      { property: "og:title", content: "Assessments — TalentGrid" },
      { property: "og:description", content: "Dispatch and track student assessments." },
    ],
  }),
  component: AssessmentsPage,
});

const STATUSES = ["Invited", "In progress", "Submitted", "Overdue"];

function AssessmentsPage() {
  const queryClient = useQueryClient();
  const assessments = useQuery(assessmentsQuery);
  const candidates = useQuery(candidatesQuery);
  const [form, setForm] = useState({ candidate_id: "", title: "", link: "" });

  const sendAssessment = useMutation({
    mutationFn: async () => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("assessments").insert({
        user_id,
        candidate_id: form.candidate_id || null,
        title: form.title,
        link: form.link,
      });
      if (error) throw error;
      if (form.candidate_id) {
        await supabase.from("candidates").update({ status: "Assessment" }).eq("id", form.candidate_id);
      }
    },
    onSuccess: () => {
      toast.success("Assessment link dispatched");
      setForm({ candidate_id: "", title: "", link: "" });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRow = useMutation({
    mutationFn: async ({
      id,
      status,
      score,
    }: {
      id: string;
      status?: string;
      score?: number | null;
    }) => {
      const patch: { status?: string; score?: number | null } = {};
      if (status !== undefined) patch.status = status;
      if (score !== undefined) patch.score = score;
      const { error } = await supabase.from("assessments").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assessments"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assessments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assessments"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const field =
    "w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

  return (
    <AppShell
      eyebrow="Adaptive evaluation"
      title="Assessment dispatch"
      subtitle="Send test links, track submissions and record scores that drive the shortlist."
    >
      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.5fr]">
        <form
          className="glass space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            sendAssessment.mutate();
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
            Send an assessment
          </div>
          <select
            required
            value={form.candidate_id}
            onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
            className={field}
          >
            <option value="" className="bg-popover text-popover-foreground">
              Select a student
            </option>
            {(candidates.data ?? []).map((c) => (
              <option key={c.id} value={c.id} className="bg-popover text-popover-foreground">
                {c.name}
              </option>
            ))}
          </select>
          <input
            className={field}
            required
            placeholder="Assessment title (e.g. DSA · Round 2)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className={field}
            placeholder="Assessment link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <button
            type="submit"
            disabled={sendAssessment.isPending}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            {sendAssessment.isPending ? "Sending…" : "Send assessment link"}
          </button>
        </form>

        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
              Dispatched · {(assessments.data ?? []).length}
            </div>
            <div className="text-xs font-medium text-muted-foreground">Update status and score</div>
          </div>
          <ul className="mt-3 space-y-2">
            {(assessments.data ?? []).map((a) => {
              const candidate = (candidates.data ?? []).find((c) => c.id === a.candidate_id);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {candidate?.name ?? "Candidate"}
                    </div>
                    <div className="truncate text-xs font-medium text-muted-foreground">
                      {a.title}
                      {a.link ? (
                        <>
                          {" · "}
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan hover:underline"
                          >
                            open link
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <select
                    value={a.status}
                    onChange={(e) => updateRow.mutate({ id: a.id, status: e.target.value })}
                    className="rounded-lg glass-soft px-2 py-1 text-xs font-medium text-card-foreground outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-popover text-popover-foreground">
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={a.score ?? ""}
                    placeholder="—"
                    onBlur={(e) =>
                      updateRow.mutate({
                        id: a.id,
                        score: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-16 rounded-lg glass-soft px-2 py-1 text-right font-mono text-xs text-card-foreground outline-none"
                  />
                  <button
                    onClick={() => removeRow.mutate(a.id)}
                    className="text-xs font-medium text-muted-foreground transition hover:text-rose"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
            {(assessments.data ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">No assessments dispatched yet.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
