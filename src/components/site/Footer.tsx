import { Link } from "@tanstack/react-router";
import { defaultProductsSearch } from "@/lib/products-search";
import { STORE_ADDRESS, STORE_EMAIL, STORE_PHONE } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-xl">MA-Light</div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Premium electrical products and lighting since 2008. Serving Harar and the surrounding region.
            Authorized dealer, expert advice, fair prices.
          </p>
        </div>
        <div>
          <div className="section-label mb-3">Explore</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" search={defaultProductsSearch} className="hover:text-accent">Products</Link></li>
            <li><Link to="/showroom" className="hover:text-accent">Virtual Showroom</Link></li>
            <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="section-label mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{STORE_PHONE}</li>
            <li>{STORE_EMAIL}</li>
            <li>{STORE_ADDRESS}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MA-Light. All rights reserved.
      </div>
    </footer>
  );
}
