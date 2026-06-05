import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Harar Electrical Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const categories = useSuspenseQuery(categoriesQuery).data;
  const { data: products = [], isLoading } = useQuery(productsQuery());

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete product"),
  });

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    remove.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-label mb-2">Catalog</div>
          <h1 className="font-display text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product listings ({products.length} total)
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-background shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <Input
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm border-border bg-surface-2"
      />

      <div className="rounded-2xl border border-border bg-surface-2">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search ? "No products match your search." : "No products yet."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="border-border">
                  <TableCell className="font-medium">
                    {p.icon && <span className="mr-2">{p.icon}</span>}
                    {p.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category_id ? (categoryMap.get(p.category_id) ?? "—") : "—"}
                  </TableCell>
                  <TableCell>
                    {p.show_price && p.price != null ? `${p.price.toLocaleString()} ETB` : "—"}
                  </TableCell>
                  <TableCell>{p.is_featured ? "✓" : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.badge ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/admin/products/$id/edit" params={{ id: p.id }}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
