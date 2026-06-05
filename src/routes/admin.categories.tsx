import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, type Category } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CategoryFormState = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyForm = (): CategoryFormState => ({
  name: "",
  slug: "",
  icon: "💡",
  description: "",
  display_order: 0,
});

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Harar Electrical Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const categories = useSuspenseQuery(categoriesQuery).data;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [categories],
  );

  function openCreate() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setSlugTouched(true);
    setForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon ?? "💡",
      description: category.description ?? "",
      display_order: category.display_order ?? 0,
    });
    setOpen(true);
  }

  function updateForm(patch: Partial<CategoryFormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (!slugTouched && patch.name !== undefined) {
        next.slug = toSlug(patch.name);
      }
      return next;
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      if (!form.slug.trim()) throw new Error("Slug is required");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
        display_order: form.display_order,
      };

      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Category updated." : "Category created.");
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save category"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted.");
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete category"),
  });

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? Products in this category will lose their category link.`)) {
      return;
    }
    remove.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-label mb-2">Catalog</div>
          <h1 className="font-display text-4xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize products into browsable categories ({categories.length} total)
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-gold text-background shadow-gold hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-surface-2">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingId ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="border-border bg-surface-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  className="border-border bg-surface-3"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cat-icon">Icon (emoji)</Label>
                  <Input
                    id="cat-icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="border-border bg-surface-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-order">Display order</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({ ...form, display_order: Number(e.target.value) || 0 })
                    }
                    className="border-border bg-surface-3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border-border bg-surface-3"
                />
              </div>
              <Button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="w-full bg-gold text-background shadow-gold hover:bg-gold/90"
              >
                {save.isPending ? "Saving…" : editingId ? "Update" : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c) => (
                <TableRow key={c.id} className="border-border">
                  <TableCell className="text-xl">{c.icon ?? "—"}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>{c.display_order ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id, c.name)}
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
