import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/dashboard", label: "Command deck" },
  { to: "/matching", label: "Resume matching" },
  { to: "/assessments", label: "Assessments" },
  { to: "/candidates", label: "Directory" },
] as const;

export function AppShell({
  title,
  eyebrow,
  subtitle,
  actions,
  children,
}: {
  title: string;
  eyebrow: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="relative grid grid-cols-1 gap-5 p-5 lg:grid-cols-[236px_1fr] lg:p-7">
        <aside className="rise glass flex h-fit flex-col lg:sticky lg:top-7">
          <div className="flex items-center gap-2.5 px-5 py-5">
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
          <nav className="px-3 pb-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{
                  className:
                    "mb-1 flex items-center gap-3 rounded-xl glass-soft px-3 py-2 text-sm font-semibold text-card-foreground",
                }}
                inactiveProps={{
                  className:
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-card-foreground",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-4">
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, color-mix(in oklab, var(--violet) 28%, transparent), color-mix(in oklab, var(--cyan) 12%, transparent))",
              }}
            >
              <div className="text-xs font-semibold text-card-foreground">Placement cycle 2026</div>
              <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                Agentic screening active
              </div>
            </div>
          </div>
          <div className="px-3 pb-5">
            <button
              onClick={signOut}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:text-rose"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-5">
          <header className="rise glass p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
                  {eyebrow}
                </div>
                <h1 className="mt-1 text-2xl font-semibold text-balance text-card-foreground lg:text-3xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-sm font-medium text-pretty text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            <div className="sheen mt-4 h-1 rounded-full" />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
