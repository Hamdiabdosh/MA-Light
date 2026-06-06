import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Mail, MapPin, Clock, MessageCircle, Star } from "lucide-react";
import { z } from "zod";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { STORE_ADDRESS, STORE_EMAIL, STORE_MAP_URL, STORE_PHONES, waLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — MA-Light" }] }),
  component: ContactPage,
});

const reviewSchema = z.object({
  reviewer_name: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().min(5).max(800),
});

function ContactPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ reviewer_name: "", location: "", rating: 5, review_text: "" });

  const submit = useMutation({
    mutationFn: async (input: typeof form) => {
      const parsed = reviewSchema.parse(input);
      const { error } = await supabase.from("reviews").insert({ ...parsed, is_approved: false });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks! Your review will appear once approved.");
      setForm({ reviewer_name: "", location: "", rating: 5, review_text: "" });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit review"),
  });

  return (
    <Layout>
      <section className="border-b border-border bg-surface-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Get in Touch"
            title="Visit, call, or message us"
            sub="We're here for any question, big or small."
          />
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              ...STORE_PHONES.map((phone) => ({
                i: Phone,
                label: "Call us",
                value: phone,
                href: `tel:${phone.replace(/\s/g, "")}`,
              })),
              {
                i: MessageCircle,
                label: "WhatsApp",
                value: "Chat with us instantly",
                href: waLink("Hello! I'd like more information."),
              },
              { i: Mail, label: "Email", value: STORE_EMAIL, href: `mailto:${STORE_EMAIL}` },
              { i: MapPin, label: "Store Address", value: STORE_ADDRESS },
              { i: Clock, label: "Open Hours", value: "Mon–Sat 8:00 AM – 8:00 PM" },
            ].map(({ i: Icon, label, value, href }) => {
              const body = (
                <>
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
                    <div className="mt-0.5 text-sm font-semibold">{value}</div>
                  </div>
                </>
              );
              return href ? (
                <a
                  key={`${label}-${value}`}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 p-5 transition-colors hover:border-gold/40"
                >
                  {body}
                </a>
              ) : (
                <div key={`${label}-${value}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 p-5">
                  {body}
                </div>
              );
            })}

            <a
              href={STORE_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-2 p-6 text-center transition-colors hover:border-gold/40"
            >
              <MapPin className="h-8 w-8 text-accent" />
              <div>
                <div className="text-sm font-semibold">View store on Google Maps</div>
                <div className="mt-1 text-xs text-muted-foreground">{STORE_ADDRESS}</div>
              </div>
            </a>
          </div>

          {/* Review form */}
          <div className="rounded-2xl border border-border bg-surface-2 p-8">
            <h3 className="font-display text-2xl">Leave us a review</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback will appear publicly once approved.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate(form);
              }}
            >
              <input
                required
                placeholder="Your name"
                value={form.reviewer_name}
                onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-3 px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-3 px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        n <= form.rating ? "fill-gold text-gold" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={5}
                placeholder="Share your experience…"
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-3 px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={submit.isPending}
                className="w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold disabled:opacity-50"
              >
                {submit.isPending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
