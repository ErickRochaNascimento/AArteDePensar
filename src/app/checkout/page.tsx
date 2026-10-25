import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/components/CheckoutClient";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Finalizar compra" };

// O checkout exige login; o carrinho em si continua no navegador.
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <p className="muted" aria-live="polite">
          Carregando…
        </p>
      }
    >
      <AuthenticatedCheckout />
    </Suspense>
  );
}

async function AuthenticatedCheckout() {
  await requireUser("/checkout");
  return <CheckoutClient />;
}
