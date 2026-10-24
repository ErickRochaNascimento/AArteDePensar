"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/config";

export function Header() {
  const { items } = useCart();

  return (
    <header className="site-header">
      <div className="top">
        <Link className="logo" href="/">
          {BRAND}
        </Link>
        <form className="search" action="/" method="get" role="search">
          <label className="sr-only" htmlFor="q">
            Buscar livros
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="O que você quer ler hoje? (título ou autor)"
          />
          <button type="submit" className="search-btn">
            Buscar
          </button>
        </form>
        <nav className="links" aria-label="Conta">
          <Link href="/meus-livros">Meus Livros</Link>
          <Link href="/entrar">Entrar</Link>
          <Link href="/checkout">
            Carrinho (<b>{items.length}</b>)
          </Link>
        </nav>
      </div>
      <nav className="sub" aria-label="Seções">
        <Link href="/#catalogo">Categorias</Link>
        <Link href="/#mais-vendidos">Mais vendidos</Link>
        <Link href="/#autores">Autores</Link>
      </nav>
    </header>
  );
}
