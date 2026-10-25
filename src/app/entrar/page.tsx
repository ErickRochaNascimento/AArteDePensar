import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForms } from "@/components/AuthForms";
import { safeNext } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Entrar ou criar conta" };

export default function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <Suspense fallback={<AuthForms />}>
      <AuthFormsWithNext searchParams={searchParams} />
    </Suspense>
  );
}

// O destino pós-login (?next=) depende da requisição, por isso fica em Suspense.
async function AuthFormsWithNext({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const { next } = await searchParams;
  return <AuthForms next={safeNext(next)} />;
}
