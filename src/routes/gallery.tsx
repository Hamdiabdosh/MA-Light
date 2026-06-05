import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
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
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const filtered = filter ? items.filter((i) => i.project_type === filter) : items;
  const lightboxSlides = useMemo(
    () => filtered.filter((g) => Boolean(g.image_url)).map((g) => ({ src: g.image_url!, key: g.id })),
    [filtered],
  );

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
          <div className="gallery-masonry mt-8">
            {filtered.map((g) => (
              <div key={g.id} className="gallery-masonry-item">
                <button
                  type="button"
                  onClick={() => {
                    if (!g.image_url) return;
                    const nextIndex = lightboxSlides.findIndex((slide) => slide.key === g.id);
                    if (nextIndex >= 0) setLightboxIndex(nextIndex);
                  }}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-surface-2 text-left"
                >
                  {g.image_url ? (
                    <img
                      src={g.image_url}
                      alt={g.title}
                      loading="lazy"
                      className="block w-full transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-surface-3 text-6xl">
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
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={lightboxSlides}
      />
    </Layout>
  );
}
