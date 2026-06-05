import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  display_order: number | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  show_price: boolean | null;
  brand: string | null;
  power: string | null;
  voltage: string | null;
  warranty: string | null;
  availability: string | null;
  is_featured: boolean | null;
  badge: string | null;
  images: string[] | null;
  icon: string | null;
  specs: Record<string, string> | null;
};

export type Room = {
  id: string;
  name: string;
  icon: string | null;
  subtitle: string | null;
  display_order: number | null;
};

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  project_type: string | null;
  display_order: number | null;
};

export type Review = {
  id: string;
  reviewer_name: string;
  location: string | null;
  rating: number | null;
  review_text: string | null;
  is_approved: boolean | null;
  created_at: string;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const categoryBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["categories", slug],
    queryFn: async (): Promise<Category | null> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Category | null;
    },
  });

export const productsQuery = (opts?: { categoryId?: string; search?: string }) =>
  queryOptions({
    queryKey: ["products", opts ?? {}],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
      if (opts?.search && opts.search.trim()) q = q.ilike("name", `%${opts.search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const featuredProductsQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .limit(6);
    if (error) throw error;
    return (data ?? []) as Product[];
  },
});

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["products", "slug", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

export const productByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["products", "id", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

export const relatedProductsQuery = (categoryId: string | null, excludeId: string) =>
  queryOptions({
    queryKey: ["products", "related", categoryId, excludeId],
    enabled: !!categoryId,
    queryFn: async (): Promise<Product[]> => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", excludeId)
        .limit(4);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const roomsQuery = queryOptions({
  queryKey: ["rooms"],
  queryFn: async (): Promise<Room[]> => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Room[];
  },
});

export const roomProductsQuery = (roomId: string | null) =>
  queryOptions({
    queryKey: ["room-products", roomId],
    enabled: !!roomId,
    queryFn: async (): Promise<Product[]> => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("room_products")
        .select("product:products(*)")
        .eq("room_id", roomId);
      if (error) throw error;
      return ((data ?? []).map((r: any) => r.product).filter(Boolean)) as Product[];
    },
  });

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as GalleryItem[];
  },
});

export const approvedReviewsQuery = queryOptions({
  queryKey: ["reviews", "approved"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },
});

export const allReviewsQuery = queryOptions({
  queryKey: ["reviews", "all"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },
});

export const statsQuery = queryOptions({
  queryKey: ["stats"],
  queryFn: async () => {
    const [products, categories, reviews] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", true),
    ]);
    return {
      products: products.count ?? 0,
      categories: categories.count ?? 0,
      reviews: reviews.count ?? 0,
    };
  },
});

export const pendingReviewsCountQuery = queryOptions({
  queryKey: ["reviews", "pending-count"],
  queryFn: async (): Promise<number> => {
    const { count, error } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false);
    if (error) throw error;
    return count ?? 0;
  },
});
