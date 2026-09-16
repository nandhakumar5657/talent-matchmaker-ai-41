/** Browser-side resume file reading + lightweight field extraction. */

export const SKILL_DICTIONARY = [
  "javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "rust", "php", "ruby", "kotlin", "swift", "scala", "r", "matlab",
  "react", "next.js", "angular", "vue", "svelte", "redux", "html", "css", "tailwind", "bootstrap", "sass",
  "node.js", "express", "django", "flask", "fastapi", "spring boot", "spring", ".net", "graphql", "rest api",
  "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "firebase", "supabase",
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ci/cd", "linux", "git", "github", "devops",
  "machine learning", "deep learning", "data science", "nlp", "computer vision", "tensorflow", "pytorch", "keras",
  "pandas", "numpy", "scikit-learn", "opencv", "power bi", "tableau", "excel", "hadoop", "spark",
  "android", "ios", "flutter", "react native", "figma", "ui/ux",
  "testing", "selenium", "jest", "cypress", "agile", "scrum", "communication", "leadership", "problem solving",
];

export type ExtractedResume = {
  text: string;
  name: string;
  email: string;
  skills: string[];
  cgpa: string;
  branch: string;
  batch: string;
};

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return out;
}

export async function readResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return readPdf(file);
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return file.text();
  }
  throw new Error("Unsupported file. Upload a PDF or a .txt resume.");
}

const BRANCHES = [
  "computer science", "information technology", "electronics", "electrical", "mechanical",
  "civil", "artificial intelligence", "data science", "biotechnology", "chemical", "aerospace",
];

export function extractResume(text: string): ExtractedResume {
  const lower = text.toLowerCase();

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const nameLine = lines.find(
    (l) => /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(l) && l.split(/\s+/).length <= 4 && !/resume|curriculum/i.test(l),
  );
  const name = nameLine ?? (email ? (email.split("@")[0] ?? "").replace(/[._\d]+/g, " ").trim() : "");

  const skills = SKILL_DICTIONARY.filter((s) => {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(lower);
  });

  const cgpaMatch = lower.match(/(?:cgpa|gpa)\D{0,10}(\d(?:\.\d{1,2})?)/);
  const pctMatch = lower.match(/(\d{2}(?:\.\d{1,2})?)\s?%/);
  const cgpa = cgpaMatch?.[1] ?? (pctMatch?.[1] ? (Number(pctMatch[1]) / 10).toFixed(2) : "");

  const branch = BRANCHES.find((b) => lower.includes(b)) ?? "";
  const batch = text.match(/\b(20\d{2})\s*[-–]\s*(20\d{2})\b/)?.[2] ?? text.match(/\b20(?:2\d|3\d)\b/)?.[0] ?? "";

  return {
    text,
    name: name ? name.replace(/\s+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "",
    email,
    skills,
    cgpa,
    branch: branch ? branch.replace(/\b\w/g, (m) => m.toUpperCase()) : "",
    batch,
  };
}
