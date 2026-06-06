import { useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/showroom", label: "Showroom Rooms" },
] as const;

function isActiveLink(pathname: string, to: string) {
  if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function AdminSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-6">
        <div className="font-display text-xl text-accent">MA-Light</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Admin Panel
        </div>
      </div>

      <nav className="space-y-1">
        {sidebarLinks.map((l) => {
          const active = isActiveLink(pathname, l.to);
          return (
            <a
              key={l.to}
              href={l.to}
              onClick={onNavigate}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Admin] signOut failed:", error);
    }
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-surface-1 p-5 md:flex md:flex-col">
          <AdminSidebarNav pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border md:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <div className="font-display text-lg">MA-Light — Admin</div>
                <div className="hidden text-xs text-muted-foreground sm:block">
                  Manage products, reviews, and showroom
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-accent sm:self-auto"
            >
              Logout
            </button>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 border-border bg-surface-1 p-5">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebarNav
            pathname={pathname}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
