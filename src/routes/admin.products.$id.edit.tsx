import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/admin/ProductForm";
import { categoriesQuery, productByIdQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/products/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Harar Electrical Admin" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productByIdQuery(params.id)),
    ]);
  },
  component: AdminEditProductPage,
});

function AdminEditProductPage() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const product = useSuspenseQuery(productByIdQuery(id)).data;

  if (!product) {
    return (
      <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/products" })}
          className="mt-4 text-sm text-accent underline"
        >
          Back to products
        </button>
      </div>
    );
  }

  return (
    <ProductForm product={product} onSuccess={() => navigate({ to: "/admin/products" })} />
  );
}
