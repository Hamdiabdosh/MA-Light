import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: "Add Product — Harar Electrical Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  component: AdminNewProductPage,
});

function AdminNewProductPage() {
  const navigate = Route.useNavigate();

  return <ProductForm onSuccess={() => navigate({ to: "/admin/products" })} />;
}
