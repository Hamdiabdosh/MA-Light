import { Link } from "@tanstack/react-router";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Product } from "@/lib/queries";
import { defaultProductsSearch } from "@/lib/products-search";
import { waProductLink } from "@/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const hasImg = Boolean(product.images && product.images.length > 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    setTiltEnabled(query.matches);
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled || e.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 16;
    const rotateX = (0.5 - py) * 16;

    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    card.style.setProperty("--spot-x", `${px * 100}%`);
    card.style.setProperty("--spot-y", `${py * 100}%`);
  };

  const onPointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
    card.style.setProperty("--spot-x", "50%");
    card.style.setProperty("--spot-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ "--spot-x": "50%", "--spot-y": "50%" } as CSSProperties}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-gold"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--spot-x) var(--spot-y), oklch(0.88 0.1 85 / 0.12), transparent 62%)",
        }}
        aria-hidden="true"
      />
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-surface-3 text-6xl">
        {hasImg ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer bg-surface-2" aria-hidden="true" />
            )}
            <img
              src={product.images![0]}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
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
