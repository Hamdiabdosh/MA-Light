import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, EyeOff, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — MA-Light" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="absolute left-4 top-4 border-border bg-surface-2 text-muted-foreground hover:text-accent"
      >
        <a href="/">
          <Home className="h-4 w-4" />
          Home
        </a>
      </Button>

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
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-3 py-3 pl-4 pr-11 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-accent"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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

