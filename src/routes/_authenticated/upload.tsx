import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { candidatesQuery, currentUserId, jdsQuery } from "@/lib/queries";
import { matchScore, matchedSkills, parseList, scoreTone } from "@/lib/match";
import { extractResume, readResumeFile, type ExtractedResume } from "@/lib/resume";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Resume upload & job recommendations — TalentGrid" },
      {
        name: "description",
        content:
          "Upload a student resume as PDF or text, auto-extract skills, and instantly get the best-fit job openings ranked by skill match.",
      },
      { property: "og:title", content: "Resume upload & job recommendations — TalentGrid" },
      {
        property: "og:description",
        content: "Upload a resume and get ranked job recommendations in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

const field =
  "w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function UploadPage() {
  const queryClient = useQueryClient();
  const jds = useQuery(jdsQuery);
  useQuery(candidatesQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ExtractedResume | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    branch: "",
    batch: "",
    cgpa: "",
    skills: "",
    resume_text: "",
  });

  async function handleFile(file: File) {
    setParsing(true);
    try {
      const text = await readResumeFile(file);
      if (!text.trim()) throw new Error("No readable text found in this file.");
      const data = extractResume(text);
      setParsed(data);
      setFileName(file.name);
      setForm({
        name: data.name,
        email: data.email,
        branch: data.branch,
        batch: data.batch,
        cgpa: data.cgpa,
        skills: data.skills.join(", "),
        resume_text: text,
      });
      toast.success(`Resume read · ${data.skills.length} skills detected`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setParsing(false);
    }
  }

  const skills = parseList(form.skills);
  const profile = { skills, resume_text: form.resume_text };

  const recommendations = (jds.data ?? [])
    .map((jd) => ({
      jd,
      score: matchScore(profile, jd.skills),
      hits: matchedSkills(profile, jd.skills),
      gaps: jd.skills.filter(
        (s) => !matchedSkills(profile, jd.skills).some((h) => h.toLowerCase() === s.toLowerCase()),
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const best = recommendations[0];

  const saveCandidate = useMutation({
    mutationFn: async () => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("candidates").insert({
        user_id,
        name: form.name,
        email: form.email,
        branch: form.branch,
        batch: form.batch,
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        skills,
        resume_text: form.resume_text,
        match_score: best ? best.score : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Candidate saved to the directory");
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      eyebrow="Automated screening"
      title="Resume upload & job fit"
      subtitle="Drop a resume file — skills are read automatically and the best-matching openings are recommended instantly."
      actions={
        <button
          onClick={() => saveCandidate.mutate()}
          disabled={!form.name || saveCandidate.isPending}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          {saveCandidate.isPending ? "Saving…" : "Save to directory"}
        </button>
      }
    >
      <section className="rise grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="flex flex-col gap-5">
          <div className="glass p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
              Upload resume
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              onClick={() => inputRef.current?.click()}
              className={`mt-3 grid cursor-pointer place-items-center rounded-2xl border border-dashed px-4 py-9 text-center transition ${
                dragging ? "border-cyan bg-secondary/40" : "border-border"
              }`}
            >
              <div className="text-sm font-semibold text-card-foreground">
                {parsing ? "Reading resume…" : "Drop a PDF or .txt resume"}
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {fileName || "or click to browse from your device"}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            {parsed ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md glass-soft px-1.5 py-0.5 text-[11px] font-medium text-lime"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="glass space-y-3 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
              Extracted details — edit if needed
            </div>
            <input
              className={field}
              placeholder="Student name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={field}
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
              className={`${field} min-h-24`}
              placeholder="Resume text"
              value={form.resume_text}
              onChange={(e) => setForm({ ...form, resume_text: e.target.value })}
            />
          </div>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
              Recommended jobs
            </div>
            <div className="text-xs font-medium text-muted-foreground">Ranked by skill fit</div>
          </div>

          {best && skills.length ? (
            <div className="mt-3 rounded-2xl glass-soft p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
                Best match
              </div>
              <div className="mt-1 text-lg font-semibold text-card-foreground">{best.jd.title}</div>
              <div className="text-xs font-medium text-muted-foreground">
                {[best.jd.company, best.jd.location, best.jd.package].filter(Boolean).join(" · ")}
              </div>
              <div className={`mt-2 font-mono text-2xl font-bold ${scoreTone(best.score)}`}>
                {best.score}% fit
              </div>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {skills.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Upload a resume to see matching openings.
              </li>
            ) : recommendations.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Add job descriptions on the matching page first.
              </li>
            ) : (
              recommendations.map(({ jd, score, hits, gaps }) => (
                <li
                  key={jd.id}
                  className="rounded-xl glass-soft px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-card-foreground">
                        {jd.title}
                      </div>
                      <div className="truncate text-xs font-medium text-muted-foreground">
                        {[jd.company, jd.location, jd.package].filter(Boolean).join(" · ") || "—"}
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
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hits.map((h) => (
                      <span
                        key={`h-${h}`}
                        className="rounded-md glass-soft px-1.5 py-0.5 text-[11px] font-medium text-lime"
                      >
                        {h}
                      </span>
                    ))}
                    {gaps.map((g) => (
                      <span
                        key={`g-${g}`}
                        className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground line-through"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
