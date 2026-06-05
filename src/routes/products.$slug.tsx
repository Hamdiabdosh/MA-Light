import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { ChevronRight, MessageCircle, Phone, Check } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { productBySlugQuery, relatedProductsQuery } from "@/lib/queries";
import { STORE_PHONE, waProductLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — Harar Electrical Solutions` },
      { name: "description", content: loaderData?.description ?? "" },
    ],
  }),
  component: ProductDetail,
  errorComponent: ({ error }) => (
    <Layout><div className="p-10 text-center text-destructive">{error.message}</div></Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <div className="text-6xl">🔌</div>
        <h1 className="mt-6 font-display text-4xl">Product not found</h1>
        <Link to="/products" className="mt-6 inline-block text-accent">← Back to all products</Link>
      </div>
    </Layout>
  ),
});

function ProductDetail() {
  const product = useSuspenseQuery(productBySlugQuery(Route.useParams().slug)).data!;
  const { data: related } = useQuery(relatedProductsQuery(product.category_id, product.id));
  const specs = Object.entries(product.specs ?? {});

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-accent">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
            <div className="flex aspect-square items-center justify-center bg-surface-3 text-[10rem]">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span>{product.icon ?? "💡"}</span>
              )}
            </div>
          </div>

          <div>
            {product.badge && (
              <span className="inline-block rounded-full bg-destructive px-3 py-1 text-[11px] font-semibold uppercase text-destructive-foreground">
                {product.badge}
              </span>
            )}
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-accent">
              <Check className="h-4 w-4" /> {product.availability ?? "In Stock"}
            </div>

            {product.show_price && product.price != null && (
              <div className="mt-6 font-display text-4xl text-accent">
                {Number(product.price).toLocaleString()} ETB
              </div>
            )}

            {product.description && (
              <p className="mt-4 text-muted-foreground">{product.description}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["Brand", product.brand],
                ["Power", product.power],
                ["Voltage", product.voltage],
                ["Warranty", product.warranty],
                ...specs,
              ]
                .filter(([, v]) => !!v)
                .map(([k, v]) => (
                  <div key={k as string} className="rounded-xl border border-border bg-surface-2 p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm font-semibold">{v as string}</div>
                  </div>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waProductLink(product.name)}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Inquiry
              </a>
              <a
                href={`tel:${STORE_PHONE}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background"
              >
                <Phone className="h-4 w-4" /> Call Store
              </a>
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl">Related products</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
