import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — TalentGrid" },
      {
        name: "description",
        content: "Choose a new password for your TalentGrid placement portal account.",
      },
      { property: "og:title", content: "Set a new password — TalentGrid" },
      { property: "og:description", content: "Complete your password reset securely." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <form onSubmit={handleSubmit} className="rise glass w-full max-w-md p-7">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
          Password recovery
        </div>
        <h1 className="mt-1 text-xl font-semibold text-card-foreground">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a password of at least 6 characters.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="New password"
          className="mt-5 w-full rounded-xl glass-soft px-3 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
