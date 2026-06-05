import { createFileRoute } from "@tanstack/react-router";
import { Award, Shield, Truck, Wrench } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MA-Light" },
      {
        name: "description",
        content:
          "Founded in 2008, MA-Light is the region's most trusted supplier of quality electrical products.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeader
            label="Our Story"
            title="MA-Light — trusted electrical partner since 2008"
            sub="From a small accessories shop to the region's most trusted supplier of quality electrical products."
            align="center"
          />
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-2 text-[10rem]">
            🏪
            <div className="absolute bottom-5 right-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Est. 2008
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl">A mission rooted in trust</h2>
            <p className="mt-4 text-muted-foreground">
              We serve homeowners, contractors, hotels, and businesses across Harar, Dire Dawa, and
              beyond. Our team carefully selects every product we stock — from globally recognized
              brands to dependable local options — so every customer leaves with something that
              works, lasts, and is fairly priced.
            </p>
            <p className="mt-4 text-muted-foreground">
              Beyond the counter, we offer technical guidance, project sizing, and after-sales
              support. Whether it's a single bulb or wiring an entire hotel lobby, you'll get the
              same care.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="Why Choose Us" title="Built on four promises" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Award, t: "Authorized Dealer", d: "Official brands only, no counterfeits." },
              { i: Truck, t: "Local Delivery", d: "Fast delivery across Harar and surroundings." },
              { i: Shield, t: "Real Warranty", d: "Every major product backed by warranty." },
              { i: Wrench, t: "Expert Advice", d: "Technical guidance from a knowledgeable team." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-surface-2 p-6">
                <Icon className="h-6 w-6 text-accent" />
                <div className="mt-4 font-display text-xl">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
