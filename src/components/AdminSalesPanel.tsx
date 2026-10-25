"use client";

import { useMemo, useState, type FormEvent } from "react";
import { SalesChart } from "@/components/SalesChart";

type Props = { initialStart: string; initialEnd: string };
const MAX_RANGE_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function AdminSalesPanel({ initialStart, initialEnd }: Props) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [applied, setApplied] = useState({ start: initialStart, end: initialEnd });
  const [error, setError] = useState("");
  const rangeDays = useMemo(() => daysBetween(start, end), [start, end]);
  const invalid = !start || !end || rangeDays < 0 || rangeDays > MAX_RANGE_DAYS;

  const rangeError = !start || !end
    ? "Informe as datas de início e fim."
    : rangeDays < 0
      ? "A data inicial deve ser anterior ou igual à data final."
      : rangeDays > MAX_RANGE_DAYS
        ? "O intervalo máximo permitido entre início e fim é de 90 dias."
        : "";

  function applyPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rangeError) {
      setError(rangeError);
      return;
    }
    setError("");
    setApplied({ start, end });
  }

  return (
    <div className="admin-sales">
      <section className="panel">
        <div className="sales-panel-heading">
          <div>
            <h2>Vendas</h2>
            <p className="muted">Confira o gráfico e as vendas recentes do período escolhido.</p>
          </div>
          <span className="pill w">Checkout previsto para a Entrega 5</span>
        </div>
        <form className="sales-period" onSubmit={applyPeriod}>
          <label>
            Início
            <input type="date" value={start} max={end || undefined} onChange={(event) => setStart(event.target.value)} required />
          </label>
          <label>
            Fim
            <input type="date" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} required />
          </label>
          <button className="btn sm" type="submit" disabled={invalid}>Aplicar período</button>
          <small className="muted">O intervalo entre as datas não pode ultrapassar 90 dias.</small>
        </form>
        {(error || (invalid && rangeError)) && <p className="error" role="alert">{error || rangeError}</p>}
      </section>

      <section className="panel" aria-live="polite">
        <h3>Gráfico de vendas</h3>
        <p className="muted">Período aplicado: {formatDate(applied.start)} a {formatDate(applied.end)}</p>
        <SalesChart />
        <p className="notice" role="status">
          Ainda não há vendas registradas. Os pedidos e o checkout serão implementados na Entrega 5;
          este painel não exibe dados demonstrativos como se fossem vendas reais.
        </p>
      </section>

      <section className="panel">
        <h3>Vendas recentes</h3>
        <p className="muted">Período aplicado: {formatDate(applied.start)} a {formatDate(applied.end)}</p>
        <div className="tbl">
          <table>
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Livro</th><th>Pagamento</th><th>Valor</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td className="sales-empty-cell" colSpan={6}>Nenhuma venda real registrada neste período.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
