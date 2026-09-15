import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { candidatesQuery, currentUserId } from "@/lib/queries";
import { initials, parseList, scoreTone } from "@/lib/match";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/candidates")({
  head: () => ({
    meta: [
      { title: "Candidate directory — TalentGrid" },
      {
        name: "description",
        content: "Upload student resumes and manage the candidate directory for your placement drives.",
      },
      { property: "og:title", content: "Candidate directory — TalentGrid" },
      { property: "og:description", content: "Every student resume in one searchable directory." },
    ],
  }),
  component: CandidatesPage,
});

const STAGES = ["Screened", "Assessment", "Interview", "Shortlisted", "Rejected"];

function CandidatesPage() {
  const queryClient = useQueryClient();
  const candidates = useQuery(candidatesQuery);
  const [form, setForm] = useState({
    name: "",
    email: "",
    branch: "",
    batch: "",
    cgpa: "",
    skills: "",
    resume_text: "",
  });
  const [search, setSearch] = useState("");

  const addCandidate = useMutation({
    mutationFn: async () => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("candidates").insert({
        user_id,
        name: form.name,
        email: form.email,
        branch: form.branch,
        batch: form.batch,
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        skills: parseList(form.skills),
        resume_text: form.resume_text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resume added to the directory");
      setForm({ name: "", email: "", branch: "", batch: "", cgpa: "", skills: "", resume_text: "" });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("candidates").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidates"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCandidate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Candidate removed");
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (candidates.data ?? []).filter((c) =>
    `${c.name} ${c.branch} ${c.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase()),
  );

  const field =
    "w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

  return (
    <AppShell
      eyebrow="Student directory"
      title="Resume intake"
      subtitle="Add student resumes once — reuse them across every job description and assessment."
    >
      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <form
          className="glass space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            addCandidate.mutate();
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
            Add a resume
          </div>
          <input
            className={field}
            required
            placeholder="Student name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={field}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className={field}
              placeholder="Branch"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
            />
            <input
              className={field}
              placeholder="Batch"
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
            />
            <input
              className={field}
              placeholder="CGPA"
              value={form.cgpa}
              onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
            />
          </div>
          <input
            className={field}
            placeholder="Skills, comma separated"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          <textarea
            className={`${field} min-h-28`}
            placeholder="Paste resume text"
            value={form.resume_text}
            onChange={(e) => setForm({ ...form, resume_text: e.target.value })}
          />
          <button
            type="submit"
            disabled={addCandidate.isPending}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            {addCandidate.isPending ? "Saving…" : "Add candidate"}
          </button>
        </form>

        <div className="glass p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
              Directory · {filtered.length}
            </div>
            <input
              className="w-48 rounded-xl glass-soft px-3 py-1.5 text-xs text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder="Search name or skill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="mt-3 space-y-2">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-primary-foreground"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                >
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-card-foreground">{c.name}</div>
                  <div className="truncate text-xs font-medium text-muted-foreground">
                    {[c.branch, c.batch, c.cgpa ? `${c.cgpa} CGPA` : ""].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className={`font-mono text-sm font-semibold ${scoreTone(c.match_score ?? 0)}`}>
                  {c.match_score != null ? `${c.match_score}%` : "—"}
                </div>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value })}
                  className="rounded-lg glass-soft px-2 py-1 text-xs font-medium text-card-foreground outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="bg-popover text-popover-foreground">
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeCandidate.mutate(c.id)}
                  className="text-xs font-medium text-muted-foreground transition hover:text-rose"
                >
                  Remove
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="text-sm text-muted-foreground">No candidates match this search.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
