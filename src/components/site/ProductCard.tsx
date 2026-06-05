import { Link } from "@tanstack/react-router";
import { MessageCircle, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/queries";
import { defaultProductsSearch } from "@/lib/products-search";
import { waProductLink } from "@/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const hasImg = product.images && product.images.length > 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-2 transition-all hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-gold">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-surface-3 text-6xl">
        {hasImg ? (
          <img src={product.images![0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span>{product.icon ?? "💡"}</span>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-destructive-foreground">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {[product.brand, product.power, product.voltage].filter(Boolean).join(" • ")}
        </p>
        {product.show_price && product.price != null && (
          <div className="mt-3 font-display text-xl text-accent">
            {Number(product.price).toLocaleString()} ETB
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            search={defaultProductsSearch}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-3 px-3 py-2.5 text-xs font-semibold transition-colors hover:border-gold hover:text-accent"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
          <a
            href={waProductLink(product.name)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-whatsapp px-3 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
