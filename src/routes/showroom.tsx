import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { roomsQuery, roomProductsQuery } from "@/lib/queries";
import { defaultProductsSearch } from "@/lib/products-search";
import { waProductLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/showroom")({
  loader: ({ context }) => context.queryClient.ensureQueryData(roomsQuery),
  head: () => ({ meta: [{ title: "Virtual Showroom — Harar Electrical Solutions" }] }),
  component: ShowroomPage,
});

function ShowroomPage() {
  const rooms = useSuspenseQuery(roomsQuery).data;
  const [activeId, setActiveId] = useState<string | null>(rooms[0]?.id ?? null);
  useEffect(() => {
    if (!activeId && rooms[0]) setActiveId(rooms[0].id);
  }, [rooms, activeId]);
  const active = rooms.find((r) => r.id === activeId);
  const { data: products, isLoading } = useQuery(roomProductsQuery(activeId));

  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Virtual Showroom"
            title="See products in real rooms"
            sub="Browse curated setups for every space"
          />
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm transition-colors ${
                  activeId === r.id
                    ? "border-gold bg-gold/10 text-accent"
                    : "border-border text-muted-foreground hover:border-gold/40"
                }`}
              >
                <span>{r.icon}</span> {r.name}
              </button>
            ))}
          </div>

          {active && (
            <div className="mt-8 rounded-2xl border border-border bg-surface-2 p-8">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="text-5xl">{active.icon}</div>
                <div>
                  <h2 className="font-display text-2xl">{active.name}</h2>
                  <p className="text-sm text-muted-foreground">{active.subtitle}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-44 animate-pulse rounded-xl bg-surface-3" />
                    ))
                  : products?.map((p) => (
                      <div key={p.id} className="rounded-xl border border-border bg-surface-3 p-5">
                        <div className="text-3xl">{p.icon ?? "💡"}</div>
                        <div className="mt-3 text-sm font-semibold">{p.name}</div>
                        {p.show_price && p.price != null && (
                          <div className="mt-1 text-sm text-accent">
                            {Number(p.price).toLocaleString()} ETB
                          </div>
                        )}
                        <div className="mt-4 flex gap-2">
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            search={defaultProductsSearch}
                            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-center text-xs font-semibold hover:border-gold"
                          >
                            Details
                          </Link>
                          <a
                            href={waProductLink(p.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-whatsapp px-3 py-2 text-xs font-semibold text-white"
                          >
                            <MessageCircle className="h-3 w-3" /> Chat
                          </a>
                        </div>
                      </div>
                    ))}
                {products && products.length === 0 && !isLoading && (
                  <div className="col-span-full p-6 text-center text-sm text-muted-foreground">
                    No products linked to this room yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
