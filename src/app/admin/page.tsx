import type { Metadata } from "next";
import { AUTHORS, BOOKS, formatBRL } from "@/lib/data";
import { SalesChart } from "@/components/SalesChart";

export const metadata: Metadata = { title: "Painel da livraria" };

// Pedidos de exemplo: [pedido, cliente, índice do livro, pagamento, valor, aprovado]
const ORDERS: [string, string, number, string, number, boolean][] = [
  ["#1187", "Camila R.", 0, "Pix", 24.9, true],
  ["#1186", "Rafael M.", 2, "Cartão 3x", 39.9, true],
  ["#1185", "Joana P.", 5, "Boleto", 14.9, false],
  ["#1184", "Lucas T.", 7, "Pix", 34.9, true],
];

// TODO Entrega 4: proteger esta rota (só administradores) e ligar ao banco de dados.
export default function AdminPage() {
  return (
    <div className="admin">
      <nav className="side" aria-label="Administração">
        <a href="#resumo" aria-current="page">Resumo</a>
        <a href="#livros">Livros</a>
        <a href="#pedidos">Vendas</a>
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <h1 id="resumo" style={{ fontSize: 26 }}>
          Painel da livraria
        </h1>

        <div className="kpis">
          <div className="kpi">
            <small>Vendas em outubro</small>
            <b>R$ 4.310</b>
            <span>+15,9% sobre setembro</span>
          </div>
          <div className="kpi">
            <small>Pedidos</small>
            <b>187</b>
            <span>+22 sobre setembro</span>
          </div>
          <div className="kpi">
            <small>Livros ativos</small>
            <b>64</b>
            <span>3 novos esta semana</span>
          </div>
          <div className="kpi">
            <small>Clientes</small>
            <b>1.026</b>
            <span>+48 no mês</span>
          </div>
        </div>

        <div className="two">
          <div className="panel">
            <h2 style={{ fontSize: 17 }}>Vendas por mês (R$)</h2>
            <SalesChart />
          </div>

          <div className="panel" id="livros">
            <h2 style={{ fontSize: 17 }}>Cadastrar livro</h2>
            <form className="form">
              <label className="full">
                Título
                <input type="text" placeholder="Ex.: O Farol de Santo Amaro" />
              </label>
              <label>
                Autor
                <select defaultValue="">
                  <option value="" disabled>
                    Selecione
                  </option>
                  {AUTHORS.map((a) => (
                    <option key={a.slug}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Preço (R$)
                <input type="text" inputMode="decimal" placeholder="24,90" />
              </label>
              <label className="drop">
                Capa (JPG ou PNG)
                <input type="file" accept="image/png,image/jpeg" />
              </label>
              <label className="drop">
                Arquivo (EPUB ou PDF)
                <input type="file" accept=".epub,application/epub+zip,application/pdf" />
              </label>
              <div className="full">
                <button className="btn sm" type="button">
                  Publicar livro
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panel" id="pedidos">
          <h2 style={{ fontSize: 17 }}>Últimos pedidos</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Livro</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(([id, client, book, method, value, ok]) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{client}</td>
                    <td>{BOOKS[book].title}</td>
                    <td>{method}</td>
                    <td>{formatBRL(value)}</td>
                    <td>
                      <span className={ok ? "pill" : "pill w"}>{ok ? "Aprovado" : "Aguardando"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
