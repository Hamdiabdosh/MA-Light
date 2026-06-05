# Cursor Guide — Harar Electrical Solutions

> **Project origin:** Built in Lovable, now continuing in Cursor.
> This guide tells you exactly what exists, what's missing, what to build next, and how to talk to Cursor effectively.

---

## 1. What You're Working With

### Stack
| Layer | Technology |
|---|---|
| Framework | TanStack Start (Vite + React 19 + SSR) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Data fetching | TanStack Query v5 (`useSuspenseQuery`, `useQuery`, `useMutation`) |
| Database | Supabase (PostgreSQL) — already connected |
| Auth | Supabase Auth with role-based access (`app_role` enum: `admin` / `user`) |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toast) |
| Package manager | Bun |

### Running the project
```bash
cd harar-glow-showroom-main
bun install
bun dev
```

### Environment variables (already in `.env`)
```
VITE_SUPABASE_URL=https://izeveedbujrxwubfxvfd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key already present>
```
Add these to `.env` for store contact details:
```
VITE_WHATSAPP_NUMBER=251911000000
VITE_STORE_PHONE=+251 911 000 000
VITE_STORE_EMAIL=info@hararelectrical.et
VITE_STORE_ADDRESS=Kezira Area, Main Road, Harar, Ethiopia
```

---

## 2. Project Structure

```
src/
├── routes/                     # Every file = a page (TanStack Router)
│   ├── __root.tsx              # App shell, QueryClientProvider, SEO meta
│   ├── index.tsx               # Home page ✅ COMPLETE
│   ├── products.tsx            # All products with search + filter ✅ COMPLETE
│   ├── products.$slug.tsx      # Product detail page ✅ COMPLETE
│   ├── categories.index.tsx    # Category listing ✅ COMPLETE
│   ├── categories.$slug.tsx    # Category filtered products ✅ COMPLETE
│   ├── showroom.tsx            # Virtual showroom (room tabs) ✅ COMPLETE
│   ├── gallery.tsx             # Installation gallery ✅ COMPLETE
│   ├── about.tsx               # About us ✅ COMPLETE
│   └── contact.tsx             # Contact + review form ✅ COMPLETE
│
├── components/
│   ├── site/
│   │   ├── Layout.tsx          # Nav + Footer wrapper
│   │   ├── Nav.tsx             # Sticky navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── ProductCard.tsx     # Product card used across pages
│   │   └── SectionHeader.tsx   # Reusable label+title+sub header
│   └── ui/                     # Full shadcn/ui library (accordion, dialog, etc.)
│
├── lib/
│   ├── queries.ts              # ALL TanStack Query queryOptions factories
│   ├── whatsapp.ts             # WA link helpers + store constants
│   └── utils.ts                # cn() utility
│
├── integrations/supabase/
│   ├── client.ts               # Browser Supabase client
│   ├── client.server.ts        # Server Supabase client
│   └── types.ts                # Full auto-generated DB types
│
└── styles.css                  # Tailwind v4 theme — dark luxury, gold accent
```

---

## 3. Design System (read before touching CSS)

The theme lives entirely in `src/styles.css`. Key tokens:

| Token | Purpose | Value |
|---|---|---|
| `bg-background` | Page background | Near-black `oklch(0.13)` |
| `bg-surface-1` | Section backgrounds | Slightly lighter |
| `bg-surface-2` | Cards, inputs | `oklch(0.19)` |
| `bg-surface-3` | Inner card elements | `oklch(0.23)` |
| `text-gold` / `bg-gold` | Primary gold accent | `oklch(0.72 0.13 80)` |
| `text-accent` | Gold light, for text | `oklch(0.88 0.1 85)` |
| `bg-whatsapp` | WhatsApp green | `oklch(0.69 0.18 145)` |
| `font-display` | Headings | DM Serif Display |
| `font-sans` | Body | Sora |
| `shadow-gold` | Card hover shadow | Gold glow |
| `grid-overlay` | Hero background grid | Gold 1px lines |
| `section-label` | Small caps label above titles | Gold, tracked |

**Always use these tokens. Never hardcode hex values.**

---

## 4. Database Schema (already deployed to Supabase)

```
categories       id, name, slug, icon, description, display_order
products         id, category_id (→categories), name, slug, description,
                 price, show_price, brand, power, voltage, warranty,
                 availability, is_featured, badge, images[], icon, specs (jsonb)
rooms            id, name, icon, subtitle, display_order
room_products    room_id (→rooms), product_id (→products)  [join table]
gallery          id, title, description, image_url, icon, project_type, display_order
reviews          id, reviewer_name, location, rating, review_text, is_approved
user_roles       id, user_id (→auth.users), role (admin|user)
```

### Row Level Security rules (enforced in DB)
- **Public (anon):** SELECT on categories, products, rooms, room_products, gallery, approved reviews
- **Authenticated admins only:** INSERT/UPDATE/DELETE on everything
- **Anyone:** INSERT on reviews (with `is_approved = false` forced)

### Helper function
```sql
public.has_role(user_id, 'admin') → boolean
```

---

## 5. All Query Factories (in `src/lib/queries.ts`)

Import these in any route or component — never write raw Supabase calls:

```ts
categoriesQuery                          // all categories ordered
categoryBySlugQuery(slug)                // single category
productsQuery({ categoryId?, search? })  // filtered products
featuredProductsQuery                    // is_featured = true, limit 6
productBySlugQuery(slug)                 // single product
relatedProductsQuery(categoryId, excludeId) // same category, max 4
roomsQuery                               // all rooms ordered
roomProductsQuery(roomId)                // products in a room
galleryQuery                             // all gallery items ordered
approvedReviewsQuery                     // is_approved = true
statsQuery                               // { products, categories, reviews } counts
```

---

## 6. What's Missing — Build This Next

The entire public-facing site is complete. What's missing is:

### A. Admin Panel (highest priority)
No admin routes exist yet. The DB already has `user_roles` and `has_role()` — the auth plumbing is done. You need to build the UI.

### B. Seed Data
The Supabase DB tables exist but are empty. No products, categories, rooms, or gallery items have been inserted yet.

### C. Image Upload
Products have an `images[]` column but there's no upload UI.

---

## 7. Cursor Prompts — Copy & Use

### PROMPT 1 — Seed the database with realistic data

```
In this project, the Supabase database is connected (credentials in .env).
The tables categories, products, rooms, room_products, gallery, and reviews are all empty.

Write a TypeScript seed script at scripts/seed.ts that uses the Supabase client
from src/integrations/supabase/client.ts to insert:

CATEGORIES (6):
- Lighting | slug: lighting | icon: 💡
- Cables & Wires | slug: cables | icon: 🔌
- Switches & Sockets | slug: switches | icon: 🔘
- Circuit Breakers | slug: breakers | icon: 🛡️
- Solar Products | slug: solar | icon: ☀️
- Accessories | slug: accessories | icon: 🔩

PRODUCTS (12 total, spread across categories):
Each product needs: name, slug, description, price (ETB), show_price: true,
brand, power, voltage, warranty, availability: "In Stock", is_featured (mark 6 as true),
icon (emoji), specs: { "IP Rating": "...", "Lifespan": "..." } — realistic electrical specs.
Example prices: LED bulb 280–450 ETB, flood light 2500 ETB, chandelier 8500 ETB,
cable per 100m roll 3200 ETB, MCB breaker 750 ETB, solar street light 12000 ETB.

ROOMS (4): Living Room, Bedroom, Shop/Retail, Office — each with an emoji icon and subtitle.
Link 3–4 products to each room via room_products.

GALLERY (6 items): Mix of Residential, Hotel, Commercial, Office project types.
Each with an icon emoji and display_order.

REVIEWS (6): Realistic Ethiopian names, locations like "Harar" or "Dire Dawa",
ratings 4–5 stars, is_approved: true.

Run with: npx ts-node scripts/seed.ts
```

---

### PROMPT 2 — Admin layout and auth guard

```
Create a protected admin section. The Supabase auth and user_roles table already exist.
The has_role() function is in the DB: public.has_role(user_id, 'admin').

1. Create src/routes/admin.tsx as a layout route that:
   - Checks if the user is logged in via supabase.auth.getUser()
   - Checks if user has admin role by querying: supabase.from('user_roles').select().eq('user_id', uid).eq('role', 'admin')
   - If not authenticated → redirect to /admin/login
   - If authenticated but not admin → show "Access denied" page
   - If admin → render <Outlet /> inside an AdminLayout

2. Create src/routes/admin/login.tsx:
   - Email + password login form
   - Uses supabase.auth.signInWithPassword()
   - On success → redirect to /admin
   - Uses the existing design tokens (dark background, gold accent, surface-2 card)

3. Create src/components/admin/AdminLayout.tsx:
   - Sidebar with links: Dashboard, Products, Categories, Gallery, Reviews, Showroom Rooms
   - Logout button using supabase.auth.signOut()
   - Top bar with "Harar Electrical — Admin" title
   - Uses bg-surface-1 for sidebar, bg-background for main area
   - Renders {children} in the main content area

All styling must use the existing Tailwind tokens defined in styles.css
(bg-surface-1, bg-surface-2, text-accent, bg-gold, border-border, etc.).
Never hardcode colors.
```

---

### PROMPT 3 — Admin dashboard page

```
Create src/routes/admin/index.tsx — the admin dashboard.

It should use TanStack Query with useSuspenseQuery to fetch:
- statsQuery (already in src/lib/queries.ts) → products count, categories count, reviews count
- Also query: supabase.from('reviews').select('*', {count: 'exact', head: true}).eq('is_approved', false)
  for pending reviews count

Display 4 metric cards in a grid:
- Total Products
- Total Categories  
- Approved Reviews
- Pending Reviews (highlighted in gold if > 0)

Below the cards, show a "Quick Actions" section with buttons linking to:
- /admin/products/new (Add Product)
- /admin/gallery (Manage Gallery)
- /admin/reviews (Pending Reviews)

All styling with existing design tokens.
Use the AdminLayout wrapper from src/components/admin/AdminLayout.tsx.
```

---

### PROMPT 4 — Admin products list and delete

```
Create src/routes/admin/products.tsx — the products management table.

Fetch all products with: useQuery(productsQuery()) from src/lib/queries.ts
Also fetch categories with: useSuspenseQuery(categoriesQuery)

Display a table with columns: Name | Category | Price | Featured | Badge | Actions
- Category name resolved by joining with categories data client-side
- Featured shows a ✓ or — 
- Actions: Edit button (links to /admin/products/$id/edit) and Delete button

Delete uses useMutation:
  mutationFn: async (id) => supabase.from('products').delete().eq('id', id)
  onSuccess: queryClient.invalidateQueries({ queryKey: ['products'] })
  Confirm before deleting with window.confirm()

Add a search input that filters the table client-side by product name.
Add an "Add Product" button in the top-right linking to /admin/products/new.

Use the shadcn Table component from src/components/ui/table.tsx.
Use AdminLayout wrapper.
```

---

### PROMPT 5 — Add / Edit product form

```
Create src/routes/admin/products.new.tsx and src/routes/admin/products.$id.edit.tsx.
Both use the same form component: src/components/admin/ProductForm.tsx.

ProductForm props:
  product?: Product (undefined = create mode, defined = edit mode)
  onSuccess: () => void

Fields in the form (use React Hook Form + Zod validation):
- name (text, required)
- slug (text, auto-generated from name using kebab-case, user can override)
- category_id (Select dropdown, options from categoriesQuery)
- description (Textarea)
- price (number input)
- show_price (Switch/checkbox toggle)
- brand, power, voltage, warranty (text inputs in a 2-column grid)
- availability (text, default "In Stock")
- badge (text, optional — e.g. "Best Seller", "New")
- is_featured (Switch toggle)
- icon (text/emoji picker — just a plain text input for now)
- specs (dynamic key-value editor: a list of [key, value] pairs with Add/Remove buttons,
         serialized to jsonb on save)

On submit:
- Create: supabase.from('products').insert(data), then navigate to /admin/products
- Edit: supabase.from('products').update(data).eq('id', product.id), then navigate back

Use useMutation for both. On success invalidate queryKey ['products'].
Show toast on success/error using sonner (already installed).

The new route (products.new.tsx) just renders <ProductForm onSuccess={() => navigate('/admin/products')} />
The edit route (products.$id.edit.tsx) fetches the product by id first, then renders
<ProductForm product={data} onSuccess={...} />

Use AdminLayout. Style with surface-2 card, gold focus rings on inputs, bg-gold submit button.
```

---

### PROMPT 6 — Admin reviews moderation

```
Create src/routes/admin/reviews.tsx — review moderation page.

Fetch ALL reviews (not just approved) using:
  useQuery({ queryKey: ['reviews', 'all'], queryFn: () => supabase.from('reviews').select('*').order('created_at', { ascending: false }) })

Display in a table: Reviewer | Location | Rating (stars) | Text (truncated) | Status | Actions

Status badge: "Approved" (green) or "Pending" (gold/amber)

Actions per review:
- Approve: useMutation → supabase.from('reviews').update({ is_approved: true }).eq('id', id)
- Reject/Delete: useMutation → supabase.from('reviews').delete().eq('id', id)
- On success: invalidate queryKey ['reviews']

Add filter tabs at the top: All | Pending | Approved

Show a count badge on the "Pending" tab.

Use AdminLayout. Use shadcn Badge component for status. Use sonner toasts.
```

---

### PROMPT 7 — Admin gallery management

```
Create src/routes/admin/gallery.tsx — gallery management.

Fetch gallery with galleryQuery from src/lib/queries.ts.

Display as a responsive grid (4 columns). Each card shows:
- The icon (large emoji) or image_url if present
- Title and project_type
- Edit and Delete buttons

Add an "Add Item" button that opens a Dialog (from src/components/ui/dialog.tsx).
The dialog form fields:
- title (required)
- description
- icon (emoji text input)
- project_type (Select: Residential, Hotel, Commercial, Office)
- display_order (number)

On submit: supabase.from('gallery').insert(data)
On delete: supabase.from('gallery').delete().eq('id', id)
Both use useMutation, invalidate queryKey ['gallery'] on success.

Use AdminLayout. Dark card style matching the rest of the site.
```

---

### PROMPT 8 — Admin showroom rooms manager

```
Create src/routes/admin/showroom.tsx — manage virtual showroom rooms and their product assignments.

Left panel: List of all rooms from roomsQuery.
Each room card has: icon, name, subtitle, and an "Edit" and "Delete" button.
An "Add Room" button opens a dialog with fields: name, icon (emoji), subtitle, display_order.

Right panel (shown when a room is selected): 
Shows products currently linked to that room (roomProductsQuery(roomId)).
Each product shown with its name and a "Remove" button.
Below: an "Add Product to Room" dropdown (searchable Select showing all products not yet in the room).
Clicking Add inserts into room_products table.

Mutations:
- Add room: supabase.from('rooms').insert()
- Delete room: supabase.from('rooms').delete().eq('id', id)
- Remove product from room: supabase.from('room_products').delete().eq('room_id', r).eq('product_id', p)
- Add product to room: supabase.from('room_products').insert({ room_id, product_id })

Invalidate ['rooms'] and ['room-products', roomId] on relevant mutations.
Use shadcn Select with search for the product picker.
Use AdminLayout.
```

---

### PROMPT 9 — Image upload for products

```
Add image upload to ProductForm in src/components/admin/ProductForm.tsx.

The products table has an images text[] column. Supabase Storage bucket name: 'product-images'.

Add an image upload section to the form:
1. Show existing images as thumbnails (from product.images array) with a remove button on each
2. An upload area (drag & drop or click to browse) for adding new images
3. When a file is selected: upload to Supabase Storage at path products/{product-id}/{filename}
   using supabase.storage.from('product-images').upload(path, file)
4. On success, get the public URL: supabase.storage.from('product-images').getPublicUrl(path)
5. Append the URL to the images array in the form state

The images array is submitted with the rest of the form data.

Note: Create the storage bucket in Supabase dashboard first — set it to public.
Show upload progress with a simple spinner. Show errors as toasts.
Max file size: 5MB. Accepted types: image/jpeg, image/png, image/webp.
```

---

### PROMPT 10 — Fix TypeScript errors and improve type safety

```
Review the codebase for TypeScript issues:

1. In src/routes/products.tsx the products.map uses `product: ProductsSearch` type 
   which is wrong — it should be `product: Product` imported from src/lib/queries.ts. Fix it.

2. In src/lib/queries.ts, the productsQuery categoryId filter uses .eq() but categoryId 
   comes from a joined query. Verify the filter logic is correct.

3. The Product type in src/lib/queries.ts has specs: Record<string, string> | null
   but the DB types.ts has specs: Json | null. These are inconsistent.
   Update the Product type to use: specs: Record<string, string> | null
   and add a type assertion in the queryFn: return (data ?? []) as Product[]

4. Add missing loader prefetch in src/routes/products.tsx:
   The products route doesn't prefetch in loader — add:
   loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery)

5. Check all routes that use useSuspenseQuery have corresponding loader prefetches
   in the route definition to avoid client-only waterfalls.

Run bun tsc --noEmit to verify no type errors remain.
```

---

### PROMPT 11 — Make the first admin user

```
I need to set up the first admin user for this project.
The Supabase project is at: https://izeveedbujrxwubfxvfd.supabase.co

Write me a SQL snippet I can run in the Supabase SQL editor to:
1. First, show me how to create an admin user via the Supabase Auth dashboard
2. Then insert into user_roles: 
   INSERT INTO public.user_roles (user_id, role) VALUES ('<paste-uid-here>', 'admin');

Also show me the login flow — which page to visit, what to enter.
The login page will be at /admin/login once Prompt 2 is done.
```

---

## 8. Pattern Reference for Cursor

When writing new code, match these exact patterns from the existing codebase:

### Route with data loading
```tsx
export const Route = createFileRoute("/your-page")({
  loader: ({ context }) => context.queryClient.ensureQueryData(yourQuery),
  head: () => ({ meta: [{ title: "Page Title — Harar Electrical Solutions" }] }),
  component: YourPage,
});

function YourPage() {
  const data = useSuspenseQuery(yourQuery).data;
  return <Layout>...</Layout>;
}
```

### Mutation with toast
```tsx
const qc = useQueryClient();
const mutation = useMutation({
  mutationFn: async (input) => {
    const { error } = await supabase.from("table").insert(input);
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success("Done!");
    qc.invalidateQueries({ queryKey: ["your-key"] });
  },
  onError: (e: any) => toast.error(e?.message ?? "Error"),
});
```

### New query in queries.ts
```ts
export const yourQuery = queryOptions({
  queryKey: ["your-key"],
  queryFn: async () => {
    const { data, error } = await supabase.from("table").select("*");
    if (error) throw error;
    return (data ?? []) as YourType[];
  },
});
```

### Styling conventions
```tsx
// Card
<div className="rounded-2xl border border-border bg-surface-2 p-6">

// Gold button
<button className="rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold">

// WhatsApp button
<a className="rounded-lg bg-whatsapp px-6 py-3 text-sm font-semibold text-white">

// Section label
<div className="section-label mb-2">Small Label</div>

// Display heading
<h2 className="font-display text-4xl">Big Heading</h2>

// Muted text
<p className="text-sm text-muted-foreground">Supporting text</p>

// Gold chip/badge
<span className="rounded-full border border-gold bg-gold/10 px-4 py-1.5 text-xs text-accent">
```

---

## 9. Recommended Build Order

1. **Run `bun install` and `bun dev`** — verify the site loads (will show empty sections since DB has no data)
2. **Prompt 1** — Seed the database
3. **Verify** — Home page should now show products, categories, rooms, gallery
4. **Prompt 2** — Admin auth + layout
5. **Prompt 3** — Admin dashboard
6. **Prompt 4** — Products list + delete
7. **Prompt 5** — Add/Edit product form
8. **Prompt 6** — Review moderation
9. **Prompt 7** — Gallery management
10. **Prompt 8** — Showroom room manager
11. **Prompt 9** — Image upload
12. **Prompt 10** — TypeScript cleanup
13. **Prompt 11** — Create your admin user

---

## 10. Common Cursor Tips for This Project

- **Always open `src/lib/queries.ts`** in Cursor before asking it to fetch data — it will reuse existing query factories instead of creating duplicates.
- **Always open `src/styles.css`** before asking for UI components — it will use the right tokens.
- **If Cursor suggests installing a new library**, check if it's already in `package.json` first (shadcn components, Zod, react-hook-form, sonner are all installed).
- **For new routes**, Cursor should follow the `createFileRoute` pattern exactly — TanStack Router is file-based and the `routeTree.gen.ts` regenerates automatically on `bun dev`.
- **Supabase client**: always import from `@/integrations/supabase/client` (not a new instance).
- **Never use `useEffect` for data fetching** — use TanStack Query.
