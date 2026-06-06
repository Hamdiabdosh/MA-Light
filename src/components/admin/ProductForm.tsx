import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, type Product } from "@/lib/queries";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  show_price: z.boolean(),
  brand: z.string().optional(),
  power: z.string().optional(),
  voltage: z.string().optional(),
  warranty: z.string().optional(),
  availability: z.string().optional(),
  badge: z.string().optional(),
  is_featured: z.boolean(),
  icon: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type SpecRow = { key: string; value: string };

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function specsToRows(specs: Record<string, string> | null | undefined): SpecRow[] {
  if (!specs || Object.keys(specs).length === 0) return [{ key: "", value: "" }];
  return Object.entries(specs).map(([key, value]) => ({ key, value }));
}

function rowsToSpecs(rows: SpecRow[]): Record<string, string> | null {
  const specs: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    const value = row.value.trim();
    if (key && value) specs[key] = value;
  }
  return Object.keys(specs).length > 0 ? specs : null;
}

type ProductFormProps = {
  product?: Product;
  onSuccess: () => void;
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const qc = useQueryClient();
  const categories = useSuspenseQuery(categoriesQuery).data;
  const isEdit = Boolean(product);
  const draftId = useMemo(() => crypto.randomUUID(), []);
  const productId = product?.id ?? draftId;

  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => specsToRows(product?.specs));
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      category_id: product?.category_id ?? "",
      description: product?.description ?? "",
      price: product?.price ?? undefined,
      show_price: product?.show_price ?? true,
      brand: product?.brand ?? "",
      power: product?.power ?? "",
      voltage: product?.voltage ?? "",
      warranty: product?.warranty ?? "",
      availability: product?.availability ?? "In Stock",
      badge: product?.badge ?? "",
      is_featured: product?.is_featured ?? false,
      icon: product?.icon ?? "",
    },
  });

  const watchName = form.watch("name");

  useEffect(() => {
    if (!slugTouched && watchName) {
      form.setValue("slug", toSlug(watchName));
    }
  }, [watchName, slugTouched, form]);

  const save = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        ...values,
        description: values.description || null,
        brand: values.brand || null,
        power: values.power || null,
        voltage: values.voltage || null,
        warranty: values.warranty || null,
        availability: values.availability || "In Stock",
        badge: values.badge || null,
        icon: values.icon || null,
        price: values.price ?? null,
        specs: rowsToSpecs(specRows),
        images: images.length > 0 ? images : null,
      };

      if (isEdit && product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert({ ...payload, id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated." : "Product created.");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save product"),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-border bg-surface-2 p-4 md:p-8"
    >
      <div>
        <h1 className="font-display text-2xl md:text-3xl">{isEdit ? "Edit Product" : "Add Product"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit ? "Update product details and images." : "Create a new product listing."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="border-border bg-surface-3 focus-visible:ring-gold"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            className="border-border bg-surface-3 focus-visible:ring-gold"
            {...form.register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.watch("category_id")}
            onValueChange={(v) => form.setValue("category_id", v, { shouldValidate: true })}
          >
            <SelectTrigger className="border-border bg-surface-3 focus:ring-gold">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category_id && (
            <p className="text-xs text-destructive">{form.formState.errors.category_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            className="border-border bg-surface-3 focus-visible:ring-gold"
            {...form.register("description")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (ETB)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              className="border-border bg-surface-3 focus-visible:ring-gold"
              {...form.register("price")}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
            <Label htmlFor="show_price">Show price on site</Label>
            <Switch
              id="show_price"
              checked={form.watch("show_price")}
              onCheckedChange={(v) => form.setValue("show_price", v)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" className="border-border bg-surface-3" {...form.register("brand")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="power">Power</Label>
            <Input id="power" className="border-border bg-surface-3" {...form.register("power")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voltage">Voltage</Label>
            <Input
              id="voltage"
              className="border-border bg-surface-3"
              {...form.register("voltage")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty</Label>
            <Input
              id="warranty"
              className="border-border bg-surface-3"
              {...form.register("warranty")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              className="border-border bg-surface-3"
              {...form.register("availability")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge">Badge (optional)</Label>
            <Input id="badge" className="border-border bg-surface-3" {...form.register("badge")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input id="icon" className="border-border bg-surface-3" {...form.register("icon")} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
            <Label htmlFor="is_featured">Featured product</Label>
            <Switch
              id="is_featured"
              checked={form.watch("is_featured")}
              onCheckedChange={(v) => form.setValue("is_featured", v)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Specifications</Label>
        {specRows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Key"
              value={row.key}
              onChange={(e) => {
                const next = [...specRows];
                next[i] = { ...next[i], key: e.target.value };
                setSpecRows(next);
              }}
              className="border-border bg-surface-3"
            />
            <Input
              placeholder="Value"
              value={row.value}
              onChange={(e) => {
                const next = [...specRows];
                next[i] = { ...next[i], value: e.target.value };
                setSpecRows(next);
              }}
              className="border-border bg-surface-3"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSpecRows(specRows.filter((_, j) => j !== i))}
              disabled={specRows.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add spec
        </Button>
      </div>

      <ImageUploadZone
        images={images}
        onImagesChange={setImages}
        onUploadingChange={setUploading}
        folder={`ma-light/products/${productId}`}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="submit"
          disabled={save.isPending || uploading}
          className="bg-gold text-background shadow-gold hover:bg-gold/90"
        >
          {save.isPending ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
