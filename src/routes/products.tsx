import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery, type Product } from "@/lib/queries";
import { defaultProductsSearch, type ProductsSearch } from "@/lib/products-search";

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    category: (search.category as string) ?? "",
    q: (search.q as string) ?? "",
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  head: () => ({ meta: [{ title: "All Products — Harar Electrical Solutions" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const cats = useSuspenseQuery(categoriesQuery).data;
  const activeCat = cats.find((c) => c.slug === category);
  const { data: products, isLoading } = useQuery(
    productsQuery({ categoryId: activeCat?.id, search: q }),
  );

  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="Digital Showroom" title="All Products" sub="Browse our full catalog" />
          <div className="mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-gold/30 bg-surface-2 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) =>
                navigate({ search: (p: ProductsSearch) => ({ ...p, q: e.target.value }), replace: true })
              }
              placeholder="Search products… e.g. flood light, cable, switch"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => navigate({ search: (p: ProductsSearch) => ({ ...p, category: "" }) })}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                !category ? "border-gold bg-gold/10 text-accent" : "border-border text-muted-foreground hover:border-gold/40"
              }`}
            >
              All
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ search: (p: ProductsSearch) => ({ ...p, category: c.slug }) })}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  category === c.slug
                    ? "border-gold bg-gold/10 text-accent"
                    : "border-border text-muted-foreground hover:border-gold/40"
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface-2 p-16 text-center">
              <div className="text-5xl">🔍</div>
              <div className="mt-4 font-display text-2xl">No products found</div>
              <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
              <Link to="/products" search={defaultProductsSearch} className="mt-6 inline-block text-sm text-accent">
                Reset filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
