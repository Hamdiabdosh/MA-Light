import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { allReviewsQuery } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Filter = "all" | "pending" | "approved";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Harar Electrical Admin" }] }),
  component: AdminReviewsPage,
});

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 0;
  return <span className="text-accent">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

function AdminReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const { data: reviews = [], isLoading } = useQuery(allReviewsQuery);

  const pendingCount = useMemo(
    () => reviews.filter((r) => !r.is_approved).length,
    [reviews],
  );

  const filtered = useMemo(() => {
    if (filter === "pending") return reviews.filter((r) => !r.is_approved);
    if (filter === "approved") return reviews.filter((r) => r.is_approved);
    return reviews;
  }, [reviews, filter]);

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review approved.");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not approve review"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted.");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete review"),
  });

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete review from "${name}"?`)) return;
    remove.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-label mb-2">Moderation</div>
        <h1 className="font-display text-4xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or remove customer reviews before they appear on the site.
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="bg-surface-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge className="border-gold bg-gold/10 text-accent">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="rounded-2xl border border-border bg-surface-2">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading reviews…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No reviews found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="border-border">
                      <TableCell className="font-medium">{r.reviewer_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.location ?? "—"}</TableCell>
                      <TableCell>
                        <Stars rating={r.rating} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {r.review_text}
                      </TableCell>
                      <TableCell>
                        {r.is_approved ? (
                          <Badge className="border-green-600/30 bg-green-600/10 text-green-400">
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="border-gold bg-gold/10 text-accent">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!r.is_approved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approve.mutate(r.id)}
                              disabled={approve.isPending}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(r.id, r.reviewer_name)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
