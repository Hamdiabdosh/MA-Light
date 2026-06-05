import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/showroom", label: "Showroom Rooms" },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Keep it simple for now; future work can add toast notifications.
      console.error("[Admin] signOut failed:", error);
    }
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-72 shrink-0 border-r border-border bg-surface-1 p-5">
          <div className="mb-6">
            <div className="font-display text-xl text-accent">MA-Light</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Admin Panel</div>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((l) => (
              <a
                key={l.to}
                href={l.to}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <div className="font-display text-lg">MA-Light — Admin</div>
              <div className="text-xs text-muted-foreground">Manage products, reviews, and showroom</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-accent"
            >
              Logout
            </button>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

