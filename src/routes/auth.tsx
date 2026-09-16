import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — TalentGrid Placement Portal" },
      {
        name: "description",
        content:
          "Sign in to the TalentGrid placement cell portal to screen resumes, match job descriptions and send assessments.",
      },
      { property: "og:title", content: "Sign in — TalentGrid Placement Portal" },
      {
        property: "og:description",
        content: "Secure access for placement officers and faculty coordinators.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, college },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Check your email to confirm your account");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="rise glass w-full max-w-md p-7">
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

        <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
          {mode === "forgot" ? "Password recovery" : "Sign in"}
        </div>
        <h1 className="mt-1 text-xl font-semibold text-card-foreground">
          {mode === "signin"
            ? "Placement cell access"
            : mode === "signup"
              ? "Create your portal account"
              : "Reset your password"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {mode === "signup" ? (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="College / institution"
                className="w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </>
          ) : null}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@college.edu"
            className="w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          {mode !== "forgot" ? (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••••"
              className="w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            {busy
              ? "Working…"
              : mode === "signin"
                ? "Enter portal"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </button>
        </form>

        {mode !== "forgot" ? (
          <>
            <div className="my-4 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <button
              onClick={handleGoogle}
              className="w-full rounded-xl glass-soft px-4 py-2.5 text-sm font-medium text-card-foreground transition hover:brightness-125"
            >
              Continue with Google
            </button>
          </>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          {mode === "signin" ? (
            <>
              <button onClick={() => setMode("forgot")} className="transition hover:text-cyan">
                Forgot password?
              </button>
              <button onClick={() => setMode("signup")} className="transition hover:text-cyan">
                Create account
              </button>
            </>
          ) : (
            <button onClick={() => setMode("signin")} className="transition hover:text-cyan">
              Back to sign in
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-cyan underline hover:brightness-125">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-cyan underline hover:brightness-125">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
