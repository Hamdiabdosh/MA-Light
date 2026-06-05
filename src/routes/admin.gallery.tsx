import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { galleryQuery } from "@/lib/queries";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROJECT_TYPES = ["Residential", "Hotel", "Commercial", "Office"] as const;

type GalleryFormState = {
  title: string;
  description: string;
  icon: string;
  image_url: string;
  project_type: string;
  display_order: number;
};

const emptyForm = (): GalleryFormState => ({
  title: "",
  description: "",
  icon: "🏠",
  image_url: "",
  project_type: "Residential",
  display_order: 0,
});

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Harar Electrical Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  const qc = useQueryClient();
  const items = useSuspenseQuery(galleryQuery).data;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryFormState>(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(item: (typeof items)[0]) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      icon: item.icon ?? "🏠",
      image_url: item.image_url ?? "",
      project_type: item.project_type ?? "Residential",
      display_order: item.display_order ?? 0,
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Title is required");
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        image_url: form.image_url.trim() || null,
        project_type: form.project_type,
        display_order: form.display_order,
      };
      if (editingId) {
        const { error } = await supabase.from("gallery").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Gallery item updated." : "Gallery item added.");
      qc.invalidateQueries({ queryKey: ["gallery"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save gallery item"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Gallery item deleted.");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete gallery item"),
  });

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    remove.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-label mb-2">Portfolio</div>
          <h1 className="font-display text-4xl">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage installation photos and project highlights.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-gold text-background shadow-gold hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-surface-2">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingId ? "Edit Gallery Item" : "Add Gallery Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border-border bg-surface-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border-border bg-surface-3"
                />
              </div>
              <ImageUploadZone
                label="Photo"
                images={form.image_url ? [form.image_url] : []}
                onImagesChange={(urls) => setForm({ ...form, image_url: urls[0] ?? "" })}
                folder="harar-electrical/gallery"
                multiple={false}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon">Fallback icon (emoji)</Label>
                  <Input
                    id="icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="border-border bg-surface-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project type</Label>
                  <Select
                    value={form.project_type}
                    onValueChange={(v) => setForm({ ...form, project_type: v })}
                  >
                    <SelectTrigger className="border-border bg-surface-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number(e.target.value) || 0 })
                  }
                  className="border-border bg-surface-3"
                />
              </div>
              <Button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="w-full bg-gold text-background shadow-gold hover:bg-gold/90"
              >
                {save.isPending ? "Saving…" : editingId ? "Update" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-2 p-12 text-center text-sm text-muted-foreground">
          No gallery items yet. Add your first project.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-border bg-surface-2 p-5"
            >
              <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-surface-3 text-5xl">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  item.icon ?? "📷"
                )}
              </div>
              <h3 className="font-display text-lg">{item.title}</h3>
              <p className="mt-1 text-xs text-accent">{item.project_type}</p>
              {item.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(item)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id, item.title)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
