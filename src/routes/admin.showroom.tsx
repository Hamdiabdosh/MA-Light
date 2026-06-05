import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery, roomProductsQuery, roomsQuery, type Room } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type RoomFormState = {
  name: string;
  icon: string;
  subtitle: string;
  display_order: number;
};

const emptyRoomForm = (): RoomFormState => ({
  name: "",
  icon: "🏠",
  subtitle: "",
  display_order: 0,
});

export const Route = createFileRoute("/admin/showroom")({
  head: () => ({ meta: [{ title: "Showroom — Harar Electrical Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(roomsQuery),
  component: AdminShowroomPage,
});

function AdminShowroomPage() {
  const qc = useQueryClient();
  const rooms = useSuspenseQuery(roomsQuery).data;
  const { data: allProducts = [] } = useQuery(productsQuery());

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms[0]?.id ?? null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState<RoomFormState>(emptyRoomForm);
  const [productSearch, setProductSearch] = useState("");
  const [addProductId, setAddProductId] = useState("");

  const { data: roomProducts = [] } = useQuery(roomProductsQuery(selectedRoomId));

  const availableProducts = useMemo(() => {
    const inRoom = new Set(roomProducts.map((p) => p.id));
    const q = productSearch.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (inRoom.has(p.id)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [allProducts, roomProducts, productSearch]);

  function openCreateRoom() {
    setEditingRoomId(null);
    setRoomForm(emptyRoomForm());
    setRoomDialogOpen(true);
  }

  function openEditRoom(room: Room) {
    setEditingRoomId(room.id);
    setRoomForm({
      name: room.name,
      icon: room.icon ?? "🏠",
      subtitle: room.subtitle ?? "",
      display_order: room.display_order ?? 0,
    });
    setRoomDialogOpen(true);
  }

  const saveRoom = useMutation({
    mutationFn: async () => {
      if (!roomForm.name.trim()) throw new Error("Room name is required");
      const payload = {
        name: roomForm.name.trim(),
        icon: roomForm.icon.trim() || null,
        subtitle: roomForm.subtitle.trim() || null,
        display_order: roomForm.display_order,
      };
      if (editingRoomId) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editingRoomId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rooms").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingRoomId ? "Room updated." : "Room added.");
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setRoomDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save room"),
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Room deleted.");
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setSelectedRoomId(null);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete room"),
  });

  const addProduct = useMutation({
    mutationFn: async ({ roomId, productId }: { roomId: string; productId: string }) => {
      const { error } = await supabase
        .from("room_products")
        .insert({ room_id: roomId, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product added to room.");
      qc.invalidateQueries({ queryKey: ["room-products", selectedRoomId] });
      setAddProductId("");
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not add product"),
  });

  const removeProduct = useMutation({
    mutationFn: async ({ roomId, productId }: { roomId: string; productId: string }) => {
      const { error } = await supabase
        .from("room_products")
        .delete()
        .eq("room_id", roomId)
        .eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product removed from room.");
      qc.invalidateQueries({ queryKey: ["room-products", selectedRoomId] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not remove product"),
  });

  function handleDeleteRoom(id: string, name: string) {
    if (!window.confirm(`Delete room "${name}" and all its product links?`)) return;
    deleteRoom.mutate(id);
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Virtual Showroom</div>
        <h1 className="font-display text-4xl">Showroom Rooms</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage showroom rooms and assign products to each space.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Rooms</h2>
            <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openCreateRoom} className="bg-gold text-background">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-surface-2">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    {editingRoomId ? "Edit Room" : "Add Room"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Name</Label>
                    <Input
                      id="room-name"
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                      className="border-border bg-surface-3"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="room-icon">Icon</Label>
                      <Input
                        id="room-icon"
                        value={roomForm.icon}
                        onChange={(e) => setRoomForm({ ...roomForm, icon: e.target.value })}
                        className="border-border bg-surface-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-order">Display order</Label>
                      <Input
                        id="room-order"
                        type="number"
                        value={roomForm.display_order}
                        onChange={(e) =>
                          setRoomForm({ ...roomForm, display_order: Number(e.target.value) || 0 })
                        }
                        className="border-border bg-surface-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-subtitle">Subtitle</Label>
                    <Input
                      id="room-subtitle"
                      value={roomForm.subtitle}
                      onChange={(e) => setRoomForm({ ...roomForm, subtitle: e.target.value })}
                      className="border-border bg-surface-3"
                    />
                  </div>
                  <Button
                    onClick={() => saveRoom.mutate()}
                    disabled={saveRoom.isPending}
                    className="w-full bg-gold text-background"
                  >
                    {saveRoom.isPending ? "Saving…" : editingRoomId ? "Update Room" : "Add Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center text-sm text-muted-foreground">
              No rooms yet. Add your first showroom room.
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                    selectedRoomId === room.id
                      ? "border-gold bg-gold/10"
                      : "border-border bg-surface-2 hover:border-gold/50"
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <span className="text-3xl">{room.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{room.name}</div>
                    {room.subtitle && (
                      <div className="truncate text-sm text-muted-foreground">{room.subtitle}</div>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="icon" onClick={() => openEditRoom(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteRoom(room.id, room.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-6">
          {!selectedRoom ? (
            <p className="text-center text-sm text-muted-foreground">
              Select a room to manage its products.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl">
                  {selectedRoom.icon} {selectedRoom.name}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedRoom.subtitle}</p>
              </div>

              <div className="space-y-2">
                <Label>Products in this room ({roomProducts.length})</Label>
                {roomProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products assigned yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {roomProducts.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-3 py-2"
                      >
                        <span className="text-sm">
                          {p.icon && <span className="mr-2">{p.icon}</span>}
                          {p.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            removeProduct.mutate({ roomId: selectedRoom.id, productId: p.id })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <Label>Add product to room</Label>
                <Input
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="border-border bg-surface-3"
                />
                <Select value={addProductId} onValueChange={setAddProductId}>
                  <SelectTrigger className="border-border bg-surface-3">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No products available
                      </SelectItem>
                    ) : (
                      availableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-gold text-background"
                  disabled={!addProductId || addProductId === "_none" || addProduct.isPending}
                  onClick={() =>
                    addProduct.mutate({ roomId: selectedRoom.id, productId: addProductId })
                  }
                >
                  Add to Room
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
