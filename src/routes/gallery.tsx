import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { galleryQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({ meta: [{ title: "Gallery — MA-Light" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const items = useSuspenseQuery(galleryQuery).data;
  const types = useMemo(
    () => Array.from(new Set(items.map((i) => i.project_type).filter(Boolean))) as string[],
    [items],
  );
  const [filter, setFilter] = useState<string>("");
  const filtered = filter ? items.filter((i) => i.project_type === filter) : items;

  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Installation Gallery"
            title="Real projects, real results"
            sub="We've lit up homes, shops, hotels, and offices across Harar."
          />
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("")}
              className={`rounded-full border px-4 py-1.5 text-xs ${
                !filter ? "border-gold bg-gold/10 text-accent" : "border-border text-muted-foreground"
              }`}
            >
              All
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full border px-4 py-1.5 text-xs ${
                  filter === t
                    ? "border-gold bg-gold/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2"
              >
                {g.image_url ? (
                  <img src={g.image_url} alt={g.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl">
                    {g.icon ?? "🏠"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                  <div className="text-sm font-semibold">{g.title}</div>
                  {g.project_type && (
                    <div className="text-[10px] uppercase tracking-widest text-accent">
                      {g.project_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
