import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { BRAND, SITE_DESCRIPTION } from "@/lib/config";
import { Suspense } from "react";
import { AccountLinks } from "@/components/AccountLinks";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${BRAND} · Livraria digital`, template: `%s · ${BRAND}` },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header
          account={
            <Suspense fallback={<Link href="/entrar">Entrar</Link>}>
              <AccountLinks />
            </Suspense>
          }
        />
        <main className="wrap main">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            © {BRAND} · Livros digitais para ler no site ou baixar.
            <nav className="footer-links" aria-label="Documentos legais">
              <Link href="/termos">Termos de Uso</Link>
              <Link href="/privacidade">Política de Privacidade</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
