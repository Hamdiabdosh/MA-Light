import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { categoryBySlugQuery, productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories/$slug")({
  loader: async ({ context, params }) => {
    const cat = await context.queryClient.ensureQueryData(categoryBySlugQuery(params.slug));
    if (!cat) throw notFound();
    return cat;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Category"} — MA-Light` }],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-2xl p-16 text-center">
        <h1 className="font-display text-4xl">Category not found</h1>
        <Link to="/categories" className="mt-4 inline-block text-accent">← All categories</Link>
      </div>
    </Layout>
  ),
});

function CategoryPage() {
  const cat = useSuspenseQuery(categoryBySlugQuery(Route.useParams().slug)).data!;
  const { data: products, isLoading } = useQuery(productsQuery({ categoryId: cat.id }));
  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-6xl">{cat.icon ?? "💡"}</div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">{cat.name}</h1>
          {cat.description && (
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{cat.description}</p>
          )}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface-2 p-16 text-center text-muted-foreground">
              No products in this category yet.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
