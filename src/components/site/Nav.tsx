import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, MessageCircle, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultProductsSearch } from "@/lib/products-search";
import { waLink } from "@/lib/whatsapp";
import { useRouterState } from "@tanstack/react-router";

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
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeLink =
    links.find((link) => pathname === link.to || pathname.startsWith(`${link.to}/`))?.to ?? null;
  const highlightedLink = hoveredLink ?? activeLink;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "border-gold/30 shadow-gold" : "border-border"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-gold text-background shadow-gold">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base">MA-Light</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              Solutions
            </div>
          </div>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li
              key={l.to}
              className="relative"
              onMouseEnter={() => setHoveredLink(l.to)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link
                to={l.to}
                {...("search" in l ? { search: l.search } : {})}
                className="text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-accent"
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
              {highlightedLink === l.to && (
                <motion.span
                  layoutId="nav-ink"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
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
      <div className={`nav-shimmer pointer-events-none absolute inset-x-0 bottom-0 h-px ${scrolled ? "opacity-100" : "opacity-0"}`} />
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
