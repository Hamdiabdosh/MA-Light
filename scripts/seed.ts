/**
 * Seed the Supabase database with demo data.
 *
 * IMPORTANT:
 * - Uses the service role client (bypasses RLS), so inserts can write to all tables
 * - Requires `SUPABASE_SERVICE_ROLE_KEY` in your environment
 *
 * Run:
 *   bun scripts/seed.ts
 *   bun scripts/seed.ts --force   # deletes existing seed data first
 */

import { supabaseAdmin } from "../src/integrations/supabase/client.server";

const argForce = process.argv.includes("--force");

type BySlug<T extends { slug: string }> = Record<string, T>;

function throwIfError(error: unknown, context: string): void {
  if (!error) return;
  const e = error as {
    message?: string;
    code?: string;
    details?: string | null;
    hint?: string | null;
  };
  const msg = [
    context,
    e.code ? `[${e.code}]` : "",
    e.message || "(no message)",
    e.details ? `details: ${e.details}` : "",
    e.hint ? `hint: ${e.hint}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  throw new Error(msg);
}

async function assertSchemaReady() {
  const { error } = await supabaseAdmin.from("categories").select("id").limit(1);
  if (error?.code === "PGRST205") {
    throw new Error(
      "Database tables are missing on this Supabase project. Run migrations first:\n" +
        "  1. Open Supabase Dashboard → SQL Editor for lgvoqsyilxkxnagxepen\n" +
        "  2. Run the SQL files in supabase/migrations/ (in order)\n" +
        "  Or: supabase link && supabase db push",
    );
  }
  throwIfError(error, "Failed to connect to Supabase");
}

async function getProductsCount() {
  const { count, error } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true });
  throwIfError(error, "Failed to count products");
  return count ?? 0;
}

async function deleteAllSeedData() {
  // Respect FK order. PostgREST requires a WHERE clause on DELETE.
  const deletions: Array<{
    table: keyof DatabaseTables;
    filter: (q: ReturnType<typeof supabaseAdmin.from>) => ReturnType<typeof supabaseAdmin.from>;
  }> = [
    {
      table: "room_products",
      filter: (q) => q.delete().not("room_id", "is", null),
    },
    {
      table: "products",
      filter: (q) => q.delete().not("id", "is", null),
    },
    {
      table: "categories",
      filter: (q) => q.delete().not("id", "is", null),
    },
    {
      table: "rooms",
      filter: (q) => q.delete().not("id", "is", null),
    },
    {
      table: "gallery",
      filter: (q) => q.delete().not("id", "is", null),
    },
    {
      table: "reviews",
      filter: (q) => q.delete().not("id", "is", null),
    },
  ];

  for (const { table, filter } of deletions) {
    const { error } = await filter(supabaseAdmin.from(table));
    throwIfError(error, `Failed to clear ${table}`);
    console.log(`[seed] cleared ${table}`);
  }
}

// Local type helper for table names
type DatabaseTables = {
  categories: unknown;
  products: unknown;
  rooms: unknown;
  room_products: unknown;
  gallery: unknown;
  reviews: unknown;
};

function kebabCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(
    (k) => !process.env[k as "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"],
  );
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(", ")}. Add them to your .env and re-run.`,
    );
  }

  console.log(`[seed] Target: ${process.env.SUPABASE_URL}`);
  await assertSchemaReady();

  if (argForce) {
    console.log("[seed] --force enabled: deleting existing rows...");
    await deleteAllSeedData();
  } else {
    const existing = await getProductsCount();
    if (existing > 0) {
      console.log(
        `[seed] Skipping: products already exist (count=${existing}). Use --force to reseed.`,
      );
      return;
    }
  }

  console.log("[seed] Inserting categories...");
  const categories = [
    { name: "Lighting", slug: "lighting", icon: "💡", display_order: 1 },
    {
      name: "Cables & Wires",
      slug: "cables",
      icon: "🔌",
      display_order: 2,
    },
    {
      name: "Switches & Sockets",
      slug: "switches",
      icon: "🔘",
      display_order: 3,
    },
    {
      name: "Circuit Breakers",
      slug: "breakers",
      icon: "🛡️",
      display_order: 4,
    },
    { name: "Solar Products", slug: "solar", icon: "☀️", display_order: 5 },
    {
      name: "Accessories",
      slug: "accessories",
      icon: "🔩",
      display_order: 6,
    },
  ];

  const { data: insertedCategories, error: catErr } = await supabaseAdmin
    .from("categories")
    .insert(categories)
    .select();
  throwIfError(catErr, "Failed to insert categories");

  const categoriesBySlug = (insertedCategories ?? []).reduce(
    (acc, c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc[(c as any).slug] = c;
      return acc;
    },
    {} as BySlug<{ slug: string }>,
  );

  console.log("[seed] Inserting products...");
  const products = [
    {
      name: "LED Bulb 9W (Warm White)",
      slug: "led-bulb-9w-warm-white",
      categorySlug: "lighting",
      description:
        "Energy-saving LED bulb with warm white glow for comfortable indoor lighting.",
      price: 380,
      show_price: true,
      brand: "HararLux",
      power: "9W",
      voltage: "220-240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: true,
      badge: "Best Seller",
      icon: "💡",
      specs: { "IP Rating": "IP20", Lifespan: "25,000 hrs" },
      images: [],
    },
    {
      name: "Flood Light 50W (LED)",
      slug: "flood-light-50w-led",
      categorySlug: "lighting",
      description:
        "High brightness LED flood light suitable for outdoor areas and storefronts.",
      price: 2500,
      show_price: true,
      brand: "LuxField",
      power: "50W",
      voltage: "220-240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: true,
      badge: "New",
      icon: "🔆",
      specs: { "IP Rating": "IP65", Lifespan: "30,000 hrs" },
      images: [],
    },
    {
      name: "Premium Chandelier (Hanging LED)",
      slug: "premium-chandelier-hanging-led",
      categorySlug: "lighting",
      description:
        "Elegant chandelier style with a modern LED look for living rooms and hotels.",
      price: 8500,
      show_price: true,
      brand: "GleamArt",
      power: "60W equivalent",
      voltage: "220-240V",
      warranty: "3 years",
      availability: "In Stock",
      is_featured: false,
      badge: "Luxury",
      icon: "✦",
      specs: { "IP Rating": "IP20", Lifespan: "30,000 hrs" },
      images: [],
    },

    {
      name: "Cable Roll 1.5mm² (100m)",
      slug: "cable-roll-1-5mm2-100m",
      categorySlug: "cables",
      description: "Copper electrical cable roll for general indoor wiring.",
      price: 3200,
      show_price: true,
      brand: "CaboPro",
      power: null,
      voltage: "220-240V",
      warranty: "1 year",
      availability: "In Stock",
      is_featured: false,
      badge: null,
      icon: "🧵",
      specs: { Conductor: "Copper", "Jacket Type": "PVC", Gauge: "1.5mm²" },
      images: [],
    },
    {
      name: "Cable Roll 2.5mm² (100m)",
      slug: "cable-roll-2-5mm2-100m",
      categorySlug: "cables",
      description: "Thicker copper cable roll for stable power transmission.",
      price: 4200,
      show_price: true,
      brand: "CaboPro",
      power: null,
      voltage: "220-240V",
      warranty: "1 year",
      availability: "In Stock",
      is_featured: true,
      badge: "Reliable",
      icon: "📏",
      specs: { Conductor: "Copper", "Jacket Type": "PVC", Gauge: "2.5mm²" },
      images: [],
    },

    {
      name: "Wall Socket 13A (Quality)",
      slug: "wall-socket-13a-quality",
      categorySlug: "switches",
      description: "Standard 13A wall socket for home and commercial use.",
      price: 450,
      show_price: true,
      brand: "Aurora",
      power: null,
      voltage: "220-240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: true,
      badge: null,
      icon: "🔘",
      specs: { Rating: "13A", Material: "ABS" },
      images: [],
    },
    {
      name: "Double Switch (2 Gang)",
      slug: "double-switch-2-gang",
      categorySlug: "switches",
      description: "Two-gang wall switch with smooth operation and durable build.",
      price: 800,
      show_price: true,
      brand: "Aurora",
      power: null,
      voltage: "220-240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: false,
      badge: null,
      icon: "🔁",
      specs: { Rating: "10A", Material: "ABS" },
      images: [],
    },

    {
      name: "MCB Breaker 10A (6kA)",
      slug: "mcb-breaker-10a-6ka",
      categorySlug: "breakers",
      description: "Miniature circuit breaker for overload and short-circuit protection.",
      price: 750,
      show_price: true,
      brand: "ShieldOne",
      power: null,
      voltage: "240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: true,
      badge: null,
      icon: "🛡️",
      specs: { "Trip Curve": "B", "Breaking Capacity": "6kA" },
      images: [],
    },
    {
      name: "MCB Breaker 16A (6kA)",
      slug: "mcb-breaker-16a-6ka",
      categorySlug: "breakers",
      description: "Higher-rated MCB for additional circuit capacity.",
      price: 900,
      show_price: true,
      brand: "ShieldOne",
      power: null,
      voltage: "240V",
      warranty: "2 years",
      availability: "In Stock",
      is_featured: false,
      badge: null,
      icon: "🛡️",
      specs: { "Trip Curve": "B", "Breaking Capacity": "6kA" },
      images: [],
    },

    {
      name: "Solar Street Light 30W (All-in-One)",
      slug: "solar-street-light-30w-all-in-one",
      categorySlug: "solar",
      description:
        "All-in-one solar street light with automatic dusk-to-dawn operation.",
      price: 12000,
      show_price: true,
      brand: "SunGuard",
      power: "30W",
      voltage: "12V DC",
      warranty: "3 years",
      availability: "In Stock",
      is_featured: true,
      badge: "Eco",
      icon: "☀️",
      specs: { "IP Rating": "IP65", Lifespan: "3,000 cycles" },
      images: [],
    },
    {
      name: "Solar Panel 200W (Monocrystalline)",
      slug: "solar-panel-200w-monocrystalline",
      categorySlug: "solar",
      description:
        "Efficient monocrystalline solar panel for home backup and solar kits.",
      price: 15000,
      show_price: true,
      brand: "SunGuard",
      power: "200W",
      voltage: "18V (approx.)",
      warranty: "5 years",
      availability: "In Stock",
      is_featured: false,
      badge: null,
      icon: "🧊",
      specs: { Efficiency: "20%", Type: "Monocrystalline" },
      images: [],
    },

    {
      name: "Junction Box + Conduit Kit",
      slug: "junction-box-conduit-kit",
      categorySlug: "accessories",
      description:
        "Practical wiring accessories kit: junction box and conduit for clean installation.",
      price: 650,
      show_price: true,
      brand: "HararFit",
      power: null,
      voltage: null,
      warranty: "1 year",
      availability: "In Stock",
      is_featured: false,
      badge: null,
      icon: "🔩",
      specs: { Material: "PVC + ABS", Use: "Indoor/Outdoor" },
      images: [],
    },
  ].map((p) => ({
    ...p,
    slug: p.slug || kebabCase(p.name),
  }));

  // Resolve category_id from inserted categories
  const productsToInsert = products.map((p) => {
    const category = (categoriesBySlug as any)[p.categorySlug];
    if (!category?.id) {
      throw new Error(
        `[seed] Missing category_id for product "${p.name}" (categorySlug="${p.categorySlug}")`,
      );
    }

    return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    show_price: p.show_price,
    brand: p.brand,
    power: p.power,
    voltage: p.voltage,
    warranty: p.warranty,
    availability: p.availability,
    is_featured: p.is_featured,
    badge: p.badge ?? null,
    icon: p.icon,
    specs: p.specs as any,
    images: p.images,
      category_id: category.id,
    };
  });

  const { error: prodErr } = await supabaseAdmin
    .from("products")
    .insert(productsToInsert);
  throwIfError(prodErr, "Failed to insert products");

  // Re-fetch product IDs by slug for room/gallery/reviews relations
  console.log("[seed] Fetching product IDs...");
  const { data: fetchedProducts, error: fetchProdErr } = await supabaseAdmin
    .from("products")
    .select("id, slug");
  throwIfError(fetchProdErr, "Failed to fetch products");

  const productsBySlug = (fetchedProducts ?? []).reduce((acc, p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[(p as any).slug] = p;
    return acc;
  }, {} as Record<string, { id: string; slug: string }>);

  console.log("[seed] Inserting rooms...");
  const rooms = [
    { name: "Living Room", icon: "🛋️", subtitle: "Warm, premium ambiance", display_order: 1 },
    { name: "Bedroom", icon: "🛏️", subtitle: "Soft lighting and comfort", display_order: 2 },
    { name: "Shop / Retail", icon: "🏪", subtitle: "Bright displays for customers", display_order: 3 },
    { name: "Office", icon: "🏢", subtitle: "Clean, reliable electrical setup", display_order: 4 },
  ];

  const { data: insertedRooms, error: roomErr } = await supabaseAdmin
    .from("rooms")
    .insert(rooms)
    .select();
  throwIfError(roomErr, "Failed to insert rooms");

  const roomsByName = (insertedRooms ?? []).reduce((acc, r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[(r as any).name] = r;
    return acc;
  }, {} as Record<string, { id: string; name: string }>);

  console.log("[seed] Linking products to rooms...");
  const roomProducts = [
    // Living Room (3-4)
    { room: "Living Room", products: ["led-bulb-9w-warm-white", "premium-chandelier-hanging-led", "flood-light-50w-led"] },
    // Bedroom
    { room: "Bedroom", products: ["led-bulb-9w-warm-white", "wall-socket-13a-quality", "double-switch-2-gang"] },
    // Shop/Retail
    { room: "Shop / Retail", products: ["flood-light-50w-led", "mcb-breaker-16a-6ka", "wall-socket-13a-quality"] },
    // Office
    { room: "Office", products: ["led-bulb-9w-warm-white", "mcb-breaker-10a-6ka", "cable-roll-2-5mm2-100m", "junction-box-conduit-kit"] },
  ];

  const roomProductsToInsert = roomProducts.flatMap((rp) =>
    rp.products.map((slug) => {
      const room = (roomsByName as any)[rp.room];
      const product = (productsBySlug as any)[slug];
      if (!room?.id) {
        throw new Error(`[seed] Missing room_id for room="${rp.room}"`);
      }
      if (!product?.id) {
        throw new Error(
          `[seed] Missing product_id for slug="${slug}" (room="${rp.room}")`,
        );
      }
      return { room_id: room.id, product_id: product.id };
    }),
  );

  const { error: rpErr } = await supabaseAdmin
    .from("room_products")
    .insert(roomProductsToInsert);
  throwIfError(rpErr, "Failed to link room products");

  console.log("[seed] Inserting gallery items...");
  const gallery = [
    {
      title: "Modern Home Lighting Setup",
      description: "Elegant chandelier + warm bulbs installation.",
      icon: "🏡",
      project_type: "Residential",
      display_order: 1,
      image_url: null,
    },
    {
      title: "Hotel Corridor Illumination",
      description: "Bright, consistent flood lighting for guest comfort.",
      icon: "🏨",
      project_type: "Hotel",
      display_order: 2,
      image_url: null,
    },
    {
      title: "Retail Shop Electrical Kit",
      description: "Sockets, switches, and circuit protection for storefront readiness.",
      icon: "🛍️",
      project_type: "Commercial",
      display_order: 3,
      image_url: null,
    },
    {
      title: "Office Panel & Cable Management",
      description: "Clean conduit routing and reliable breakers.",
      icon: "🧰",
      project_type: "Office",
      display_order: 4,
      image_url: null,
    },
    {
      title: "Outdoor Solar Showcase",
      description: "Solar street light demo for energy-efficient projects.",
      icon: "🌞",
      project_type: "Commercial",
      display_order: 5,
      image_url: null,
    },
    {
      title: "Warm Bedroom Upgrade",
      description: "Soft lighting sources designed for relaxation.",
      icon: "🌙",
      project_type: "Residential",
      display_order: 6,
      image_url: null,
    },
  ];

  const { error: galleryErr } = await supabaseAdmin
    .from("gallery")
    .insert(gallery);
  throwIfError(galleryErr, "Failed to insert gallery");

  console.log("[seed] Inserting reviews...");
  const reviews = [
    {
      reviewer_name: "Amanuel Tesfaye",
      location: "Harar",
      rating: 5,
      review_text:
        "Quick service and excellent product quality. The installer explained everything clearly.",
      is_approved: true,
    },
    {
      reviewer_name: "Selamawit Bekele",
      location: "Dire Dawa",
      rating: 5,
      review_text:
        "Beautiful lighting results and fair pricing. I’m very satisfied with the chandelier.",
      is_approved: true,
    },
    {
      reviewer_name: "Mekonnen Alemu",
      location: "Harar",
      rating: 4,
      review_text:
        "Good cables and breakers. My shop wiring feels stable and safe now.",
      is_approved: true,
    },
    {
      reviewer_name: "Hirut Mohammed",
      location: "Jigjiga",
      rating: 4,
      review_text:
        "Professional support from selection to installation. Solar street light works great.",
      is_approved: true,
    },
    {
      reviewer_name: "Yonas Tadesse",
      location: "Harar",
      rating: 5,
      review_text:
        "Reliable sockets and switches. Everything matched the electrical plan perfectly.",
      is_approved: true,
    },
    {
      reviewer_name: "Abdu Rabi",
      location: "Dire Dawa",
      rating: 4,
      review_text:
        "Solid products with good warranty. Delivery was on time and communication was excellent.",
      is_approved: true,
    },
  ];

  const { error: reviewErr } = await supabaseAdmin
    .from("reviews")
    .insert(reviews);
  throwIfError(reviewErr, "Failed to insert reviews");

  console.log("[seed] Done.");
}

main().catch((e) => {
  console.error("[seed] Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});

