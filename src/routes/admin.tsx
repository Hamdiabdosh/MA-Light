import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

type AdminAuthState = {
  userId: string | null;
  isAdmin: boolean;
};

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Harar Electrical Solutions" }] }),
  component: AdminRoute,
});

function AdminRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  // Login is a child route of /admin in the file tree — render it without the guard.
  if (isLoginPage) {
    return <Outlet />;
  }

  return <ProtectedAdminRoute />;
}

function ProtectedAdminRoute() {
  const navigate = Route.useNavigate();

  const authQuery = useQuery({
    queryKey: ["admin-auth"],
    retry: false,
    queryFn: async (): Promise<AdminAuthState> => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const userId = sessionData.session?.user?.id ?? null;
      if (!userId) return { userId: null, isAdmin: false };

      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (roleError) throw roleError;

      return {
        userId,
        isAdmin: Boolean(isAdmin),
      };
    },
  });

  useEffect(() => {
    if (authQuery.isLoading) return;

    if (!authQuery.data?.userId) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [authQuery.data?.userId, authQuery.isLoading, navigate]);

  if (authQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  if (!authQuery.data?.userId) return null;

  if (authQuery.error) {
    const message =
      authQuery.error.message ||
      "Database permission error — run supabase/fix-rls-has-role.sql in the Supabase SQL Editor.";
    return (
      <AdminLayout>
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface-2 p-8 text-center">
          <div className="text-destructive">{message}</div>
          <p className="mt-3 text-sm text-muted-foreground">
            If this mentions permissions or 403, run{" "}
            <code className="text-accent">bun scripts/fix-rls-has-role.ts</code> or the SQL in{" "}
            <code className="text-accent">supabase/fix-rls-has-role.sql</code>.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!authQuery.data.isAdmin) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface-2 p-8 text-center">
          <div className="text-4xl">⛔</div>
          <h1 className="mt-4 font-display text-3xl">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">You don’t have admin permissions.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

