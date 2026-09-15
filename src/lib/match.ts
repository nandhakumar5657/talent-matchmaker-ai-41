export type SkillSource = { skills: string[]; resume_text?: string };

const normalize = (s: string) => s.trim().toLowerCase();

/**
 * Deterministic resume ↔ JD fit score (0-100):
 * 70% weighted skill coverage, 30% keyword evidence found in the resume text.
 */
export function matchScore(candidate: SkillSource, jdSkills: string[]): number {
  const required = jdSkills.map(normalize).filter(Boolean);
  if (required.length === 0) return 0;

  const candidateSkills = new Set(candidate.skills.map(normalize));
  const resume = normalize(candidate.resume_text ?? "");

  let skillHits = 0;
  let evidenceHits = 0;
  for (const skill of required) {
    if (candidateSkills.has(skill)) skillHits += 1;
    if (resume.includes(skill)) evidenceHits += 1;
  }

  const coverage = skillHits / required.length;
  const evidence = evidenceHits / required.length;
  return Math.round((coverage * 0.7 + evidence * 0.3) * 100);
}

export function matchedSkills(candidate: SkillSource, jdSkills: string[]): string[] {
  const candidateSkills = new Set(candidate.skills.map(normalize));
  const resume = normalize(candidate.resume_text ?? "");
  return jdSkills.filter((s) => candidateSkills.has(normalize(s)) || resume.includes(normalize(s)));
}

export function scoreTone(score: number): string {
  if (score >= 85) return "text-lime";
  if (score >= 70) return "text-cyan";
  if (score >= 50) return "text-amber";
  return "text-muted-foreground";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
