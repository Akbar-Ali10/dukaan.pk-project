import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading products...
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}