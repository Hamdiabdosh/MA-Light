import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, MessageCircle, Zap, Award, Truck, Shield, Wrench } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ProductCard } from "@/components/site/ProductCard";
import {
  approvedReviewsQuery,
  categoriesQuery,
  featuredProductsQuery,
  galleryQuery,
  roomsQuery,
  statsQuery,
} from "@/lib/queries";
import { defaultProductsSearch } from "@/lib/products-search";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MA-Light — Lighting & Electrical Products" },
      {
        name: "description",
        content:
          "MA-Light — LED lighting, chandeliers, switches, cables and more. Serving Harar since 2008.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredProductsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(roomsQuery);
    context.queryClient.ensureQueryData(galleryQuery);
    context.queryClient.ensureQueryData(approvedReviewsQuery);
    context.queryClient.ensureQueryData(statsQuery);
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <Layout><div className="p-10 text-center text-destructive">{error.message}</div></Layout>
  ),
});

function HomePage() {
  const featured = useSuspenseQuery(featuredProductsQuery).data;
  const categories = useSuspenseQuery(categoriesQuery).data;
  const rooms = useSuspenseQuery(roomsQuery).data;
  const gallery = useSuspenseQuery(galleryQuery).data;
  const reviews = useSuspenseQuery(approvedReviewsQuery).data;
  const stats = useSuspenseQuery(statsQuery).data;

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 grid-overlay opacity-40" />
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-96 w-[40rem] -translate-x-1/2 rounded-full opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            MA-Light Electrical Store
          </div>
          <h1 className="mt-8 font-display text-5xl leading-[1.1] md:text-7xl">
            Quality Electrical &amp; <em className="text-gold">Lighting Solutions</em> for Every Need
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Switches, cables, LED lighting, circuit breakers, chandeliers and more. Serving Harar
            and the surrounding region since 2008.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              search={defaultProductsSearch}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold transition-transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4" /> View Products
            </Link>
            <a
              href={waLink("Hello! I want to inquire about your products.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-6 py-3.5 text-sm font-medium hover:border-gold hover:bg-surface-2"
            >
              <MapPin className="h-4 w-4" /> Visit Store
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-10 md:grid-cols-4 md:gap-12">
            {[
              { n: `${stats.products}+`, l: "Products" },
              { n: "15+", l: "Years Experience" },
              { n: "2,000+", l: "Happy Customers" },
              { n: "50+", l: "Brands" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-display text-3xl text-accent">{s.n}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Browse by Category"
            title="What are you looking for?"
            sub="Tap a category to explore the full range"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="group rounded-2xl border border-border bg-surface-2 p-6 text-center transition-all hover:-translate-y-1 hover:border-gold"
              >
                <div className="text-3xl">{c.icon ?? "💡"}</div>
                <div className="mt-3 text-sm font-semibold">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader label="Digital Showroom" title="Featured Products" />
            <Link to="/products" search={defaultProductsSearch} className="inline-flex items-center gap-1 text-sm text-accent hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* VIRTUAL SHOWROOM TEASER */}
      <section className="border-y border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Virtual Showroom"
            title="See products in real rooms"
            sub="Browse curated setups for every space"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {rooms.slice(0, 2).map((r) => (
              <Link
                key={r.id}
                to="/showroom"
                className="group flex items-center gap-5 rounded-2xl border border-border bg-surface-2 p-6 transition-all hover:border-gold"
              >
                <div className="text-5xl">{r.icon ?? "🛋️"}</div>
                <div className="flex-1">
                  <div className="font-display text-xl">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.subtitle}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader label="Installation Gallery" title="Real projects, real results" />
            <Link to="/gallery" className="inline-flex items-center gap-1 text-sm text-accent">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.slice(0, 4).map((g) => (
              <div
                key={g.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2"
              >
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  {g.icon ?? "🏠"}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                  <div className="text-xs font-semibold">{g.title}</div>
                  {g.project_type && (
                    <div className="mt-0.5 text-[10px] uppercase tracking-widest text-accent">
                      {g.project_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="border-y border-border bg-surface-1 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeader label="Customer Reviews" title="What people say" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface-2 p-6">
                  <div className="tracking-widest text-gold">
                    {"★".repeat(r.rating ?? 5)}
                    <span className="text-surface-3">{"★".repeat(5 - (r.rating ?? 5))}</span>
                  </div>
                  <p className="mt-4 text-sm italic text-muted-foreground">"{r.review_text}"</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-surface-3 text-sm font-semibold text-accent">
                      {r.reviewer_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.reviewer_name}</div>
                      <div className="text-xs text-muted-foreground">{r.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT TEASER */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="section-label mb-3">Our Story</div>
            <h2 className="font-display text-4xl md:text-5xl">MA-Light — your trusted electrical partner</h2>
            <p className="mt-5 text-muted-foreground">
              Since 2008 we've supplied homes, hotels, offices and contractors with genuine,
              high-quality electrical products — backed by expert guidance and after-sales support.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { i: Award, t: "Authorized Dealer", d: "Genuine brands only" },
                { i: Truck, t: "Local Delivery", d: "Harar & surroundings" },
                { i: Shield, t: "Warranty", d: "All major products" },
                { i: Wrench, t: "Expert Advice", d: "Technical guidance" },
              ].map(({ i: Icon, t, d }) => (
                <div key={t} className="rounded-xl border border-border bg-surface-2 p-4">
                  <Icon className="h-5 w-5 text-accent" />
                  <div className="mt-2 text-sm font-semibold">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm text-accent hover:gap-3 transition-all"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-2 text-9xl">
            🏪
            <div className="absolute bottom-5 right-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Est. 2008
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
