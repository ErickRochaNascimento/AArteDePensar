"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatBRL, type Book } from "@/lib/data";

export function BuyBox({ book }: { book: Book }) {
  const router = useRouter();
  const { add, replaceWith } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <aside className="buy" aria-label="Comprar">
      <small className="muted">E-book · acesso imediato</small>
      <div className="big">{formatBRL(book.price)}</div>
      <button
        type="button"
        className="btn hi"
        onClick={() => {
          replaceWith(book);
          router.push("/checkout");
        }}
      >
        Comprar agora
      </button>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          add(book);
          setAdded(true);
        }}
      >
        {added ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}
      </button>
      <hr className="hr" />
      <div className="perks">
        <span>✓ Ler online no site, sem instalar nada</span>
        <span>✓ Baixar EPUB ou PDF quando quiser</span>
        <span>✓ Fica na sua área Meus Livros</span>
      </div>
      <small className="muted">
        Pagamento por Pix ou cartão. Boleto e parcelamento disponíveis.
      </small>
    </aside>
  );
}
