import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  head: () => ({ meta: [{ title: "Categories — MA-Light" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useSuspenseQuery(categoriesQuery).data;
  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="Shop by Category" title="All Categories" sub="Find exactly what you need" />
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group flex items-center gap-5 rounded-2xl border border-border bg-surface-2 p-6 transition-all hover:-translate-y-1 hover:border-gold"
            >
              <div className="text-5xl">{c.icon ?? "💡"}</div>
              <div className="flex-1">
                <div className="font-display text-2xl">{c.name}</div>
                {c.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-accent transition-transform" />
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
