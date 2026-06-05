import { Link } from "@tanstack/react-router";
import { Zap, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { defaultProductsSearch } from "@/lib/products-search";
import { waLink } from "@/lib/whatsapp";

const links = [
  { to: "/products" as const, label: "Products", search: defaultProductsSearch },
  { to: "/categories" as const, label: "Categories" },
  { to: "/showroom" as const, label: "Showroom" },
  { to: "/gallery" as const, label: "Gallery" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-gold text-background shadow-gold">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base">Harar Electrical</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              Solutions
            </div>
          </div>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                {...("search" in l ? { search: l.search } : {})}
                className="text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-accent"
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={waLink("Hello! I need help with electrical products.")}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Us
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  {...("search" in l ? { search: l.search } : {})}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
