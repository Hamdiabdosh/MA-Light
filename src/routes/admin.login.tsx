import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — MA-Light" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signIn = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-auth"] });
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      navigate({ to: "/admin", replace: true });
    },
    onError: (e: any) => {
      setErrorMessage(e?.message ?? "Login failed");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-2 p-8">
        <div className="text-center">
          <div className="font-display text-3xl text-accent">Admin Login</div>
          <div className="mt-1 text-sm text-muted-foreground">Sign in to manage the store</div>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            signIn.mutate({ email, password });
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-3 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-3 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={signIn.isPending}
            className="w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold disabled:opacity-50"
          >
            {signIn.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

