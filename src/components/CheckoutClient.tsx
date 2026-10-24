"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/data";
import { Cover } from "./Cover";

type PayMethod = "pix" | "card" | "boleto" | "installments";

const OPTIONS: { id: PayMethod; title: string; hint: string }[] = [
  { id: "pix", title: "Pix", hint: "Aprovação na hora" },
  { id: "card", title: "Cartão de crédito", hint: "Visa, Master, Elo e outros" },
  { id: "boleto", title: "Boleto bancário", hint: "Libera após a compensação" },
  { id: "installments", title: "Cartão parcelado", hint: "Em até 6x" },
];

// Pix de exemplo (placeholder). Na Entrega 5 o código vem do Mercado Pago.
const PIX_EXAMPLE = "00020126580014br.gov.bcb.pix0136exemplo";

export function CheckoutClient() {
  const router = useRouter();
  const { items, clear, remove } = useCart();
  const [method, setMethod] = useState<PayMethod>("pix");
  const [copied, setCopied] = useState(false);

  const subtotal = items.reduce((sum, b) => sum + b.price, 0);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_EXAMPLE);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function pay() {
    // TODO Entrega 5: criar o pedido no servidor e iniciar o pagamento no Mercado Pago.
    // A liberação do livro acontece pelo webhook, não por este clique.
    clear();
    router.push("/meus-livros");
  }

  return (
    <div className="checkout">
      <div>
        <h1 style={{ fontSize: 24 }}>Finalizar compra</h1>

        <div style={{ marginBlock: "12px 24px" }}>
          {items.length === 0 ? (
            <p className="muted">
              Seu carrinho está vazio. <Link href="/">Ver livros</Link>
            </p>
          ) : (
            items.map((b) => (
              <div className="line" key={b.id}>
                <Cover book={b} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{b.title}</b>
                  <br />
                  <small className="muted">{b.author} · E-book</small>
                  <br />
                  <button type="button" className="line-remove" onClick={() => remove(b.slug)}>
                    Remover
                  </button>
                </div>
                <b>{formatBRL(b.price)}</b>
              </div>
            ))
          )}
        </div>

        <h2 style={{ fontSize: 19, marginBottom: 12 }}>
          Forma de pagamento{" "}
          <small style={{ fontWeight: 500, color: "var(--muted)" }}>via Mercado Pago</small>
        </h2>
        <div className="pay" role="radiogroup" aria-label="Forma de pagamento">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className="opt"
              role="radio"
              aria-checked={method === o.id}
              onClick={() => setMethod(o.id)}
            >
              <span className="dot" />
              <span>
                <b>{o.title}</b>
                <br />
                <small className="muted">{o.hint}</small>
              </span>
            </button>
          ))}
        </div>

        {method === "pix" && (
          <div className="pixbox">
            <div className="qr" role="img" aria-label="QR Code de exemplo" />
            <div>
              <b>Pague com Pix</b>
              <p className="muted" style={{ margin: "4px 0 8px", fontSize: 14 }}>
                Abra o app do seu banco, escaneie o código ou copie a chave. O livro é liberado
                assim que o pagamento for confirmado.
              </p>
              <button type="button" className="btn sm ghost" onClick={copyPix}>
                {copied ? "Código copiado ✓" : "Copiar código Pix"}
              </button>
            </div>
          </div>
        )}

        {(method === "card" || method === "installments") && (
          <div className="notice">
            <p style={{ margin: 0 }}>
              Os dados do cartão são digitados no ambiente seguro do Mercado Pago. O site não
              recebe nem guarda o número do cartão.
            </p>
            {method === "installments" && (
              <label style={{ marginTop: 12 }}>
                Parcelas
                <select defaultValue="1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatBRL(subtotal / n)} (juros conforme o Mercado Pago)
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {method === "boleto" && (
          <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>
            Geramos o boleto na próxima etapa. O livro aparece em Meus Livros depois da
            compensação, em até 2 dias úteis.
          </p>
        )}
      </div>

      <aside className="summary" aria-label="Resumo do pedido">
        <h2 style={{ fontSize: 19 }}>Resumo</h2>
        <div>
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        <div>
          <span>Entrega</span>
          <span>Digital, grátis</span>
        </div>
        <hr className="hr" />
        <div style={{ fontSize: 19 }}>
          <b>Total</b>
          <b>{formatBRL(subtotal)}</b>
        </div>
        <button type="button" className="btn hi" disabled={items.length === 0} onClick={pay}>
          Pagar {formatBRL(subtotal)}
        </button>
        <small className="muted">Ao pagar, você recebe um e-mail de confirmação.</small>
      </aside>
    </div>
  );
}
