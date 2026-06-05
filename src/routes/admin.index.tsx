import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Image, Package, Plus, Star, Tags } from "lucide-react";
import { pendingReviewsCountQuery, statsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — MA-Light Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useSuspenseQuery(statsQuery).data;
  const { data: pendingReviews = 0 } = useQuery(pendingReviewsCountQuery);

  const metrics = [
    { label: "Total Products", value: stats.products, icon: Package },
    { label: "Total Categories", value: stats.categories, icon: Tags },
    { label: "Approved Reviews", value: stats.reviews, icon: Star },
    {
      label: "Pending Reviews",
      value: pendingReviews,
      icon: Star,
      highlight: pendingReviews > 0,
    },
  ];

  const quickActions = [
    { label: "Add Product", href: "/admin/products/new", icon: Plus },
    { label: "Manage Gallery", href: "/admin/gallery", icon: Image },
    { label: "Pending Reviews", href: "/admin/reviews", icon: Star },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="section-label mb-2">Overview</div>
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Store metrics and quick actions at a glance.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl border p-6 ${
              highlight
                ? "border-gold bg-gold/10 shadow-gold"
                : "border-border bg-surface-2"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {label}
              </div>
              <div
                className={`grid h-9 w-9 place-items-center rounded-lg ${
                  highlight ? "bg-gold/20 text-accent" : "bg-surface-3 text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div
              className={`mt-4 font-display text-4xl ${highlight ? "text-accent" : "text-foreground"}`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl">Quick Actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Common admin tasks</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold transition-transform hover:-translate-y-0.5"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
