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

type Review = {
  id: string;
  reviewer_name: string;
  location: string | null;
  rating: number | null;
  review_text: string | null;
  is_approved: boolean | null;
};

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — MA-Light Admin" }] }),
  component: AdminReviewsPage,
});

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 0;
  return <span className="text-accent">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

function ReviewStatusBadge({ approved }: { approved: boolean | null }) {
  if (approved) {
    return (
      <Badge className="border-green-600/30 bg-green-600/10 text-green-400">Approved</Badge>
    );
  }
  return <Badge className="border-gold bg-gold/10 text-accent">Pending</Badge>;
}

function ReviewActions({
  review,
  onApprove,
  onDelete,
  approvePending,
  removePending,
}: {
  review: Review;
  onApprove: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  approvePending: boolean;
  removePending: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {!review.is_approved && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApprove(review.id)}
          disabled={approvePending}
        >
          <Check className="h-3.5 w-3.5 md:mr-1" />
          <span className="hidden md:inline">Approve</span>
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => onDelete(review.id, review.reviewer_name)}
        disabled={removePending}
      >
        <Trash2 className="h-3.5 w-3.5 md:mr-1" />
        <span className="hidden md:inline">Delete</span>
      </Button>
    </div>
  );
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
        <h1 className="font-display text-3xl md:text-4xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or remove customer reviews before they appear on the site.
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList className="w-max min-w-full bg-surface-2 sm:min-w-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingCount > 0 && (
                <Badge className="border-gold bg-gold/10 text-accent">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="mt-4">
          <div className="rounded-2xl border border-border bg-surface-2">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading reviews…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No reviews found.</div>
            ) : (
              <>
                <div className="divide-y divide-border md:hidden">
                  {filtered.map((r) => (
                    <div key={r.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{r.reviewer_name}</div>
                          {r.location && (
                            <div className="text-sm text-muted-foreground">{r.location}</div>
                          )}
                        </div>
                        <ReviewStatusBadge approved={r.is_approved} />
                      </div>
                      <Stars rating={r.rating} />
                      <p className="text-sm text-muted-foreground">{r.review_text}</p>
                      <ReviewActions
                        review={r}
                        onApprove={(id) => approve.mutate(id)}
                        onDelete={handleDelete}
                        approvePending={approve.isPending}
                        removePending={remove.isPending}
                      />
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
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
                            <ReviewStatusBadge approved={r.is_approved} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <ReviewActions
                                review={r}
                                onApprove={(id) => approve.mutate(id)}
                                onDelete={handleDelete}
                                approvePending={approve.isPending}
                                removePending={remove.isPending}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
