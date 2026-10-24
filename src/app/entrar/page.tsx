import type { Metadata } from "next";
import { AuthForms } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Entrar ou criar conta" };

export default function EntrarPage() {
  return <AuthForms />;
}
