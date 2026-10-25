import type { Metadata } from "next";
import { Suspense } from "react";
import { formatBRL } from "@/lib/data";
import { SalesChart } from "@/components/SalesChart";
import { BookAdminForm } from "@/components/BookAdminForm";
import { setBookPublishedAction } from "@/app/actions/catalog";
import { requireAdmin } from "@/lib/auth";
import { listAllBooksForAdmin, listAllCategories, listAuthorOptions } from "@/lib/catalog";

export const metadata: Metadata = { title: "Painel da livraria" };

// Pedidos de exemplo (viram dados reais na Entrega 5).
const ORDERS: [string, string, string, string, number, boolean][] = [
  ["#1187", "Camila R.", "O Farol de Santo Amaro", "Pix", 24.9, true],
  ["#1186", "Rafael M.", "Algoritmos em Casa", "Cartão 3x", 39.9, true],
  ["#1185", "Joana P.", "Pequeno Manual de Foco", "Boleto", 14.9, false],
  ["#1184", "Lucas T.", "Receitas de Quintal", "Pix", 34.9, true],
];

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <p className="muted" aria-live="polite">
          Carregando painel…
        </p>
      }
    >
      <AuthorizedAdminDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthorizedAdminDashboard({
  searchParams,
}: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();

  const { editar, salvo, erro } = await searchParams;
  const [books, authors, categories] = await Promise.all([
    listAllBooksForAdmin(),
    listAuthorOptions(),
    listAllCategories(),
  ]);

  const editing = typeof editar === "string" ? books.find((b) => b.id === editar) : undefined;
  const publishedCount = books.filter((b) => b.published).length;
  const draftCount = books.length - publishedCount;

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
            <small>Vendas em outubro (exemplo)</small>
            <b>R$ 4.310</b>
            <span>+15,9% sobre setembro</span>
          </div>
          <div className="kpi">
            <small>Pedidos (exemplo)</small>
            <b>187</b>
            <span>+22 sobre setembro</span>
          </div>
          <div className="kpi">
            <small>Livros publicados</small>
            <b>{publishedCount}</b>
            <span>{draftCount} em rascunho</span>
          </div>
          <div className="kpi">
            <small>Clientes (exemplo)</small>
            <b>1.026</b>
            <span>+48 no mês</span>
          </div>
        </div>

        <div className="panel">
          <h2 style={{ fontSize: 17 }}>Vendas por mês (R$, exemplo)</h2>
          <SalesChart />
        </div>

        <div className="panel" id="livros">
          <h2 style={{ fontSize: 17 }}>
            {editing ? `Editar livro: ${editing.title}` : "Cadastrar livro"}
          </h2>
          {salvo === "1" && (
            <p className="ok" role="status">
              Livro salvo. Se ele ainda é rascunho, publique-o na lista abaixo.
            </p>
          )}
          {erro === "publicacao" && (
            <p className="error" role="alert">
              Não foi possível alterar a publicação do livro. Tente novamente.
            </p>
          )}
          {typeof editar === "string" && !editing && (
            <p className="error" role="alert">
              Livro não encontrado. Você pode cadastrar um novo abaixo.
            </p>
          )}
          <BookAdminForm
            key={editing?.id ?? "novo"}
            authors={authors}
            categories={categories}
            initial={
              editing
                ? {
                    id: editing.id,
                    slug: editing.slug,
                    title: editing.title,
                    authorId: editing.authorId,
                    year: String(editing.year),
                    category: editing.category,
                    pages: String(editing.pages),
                    price: editing.price.toFixed(2).replace(".", ","),
                    synopsis: editing.synopsis,
                  }
                : undefined
            }
          />
        </div>

        <div className="panel">
          <h2 style={{ fontSize: 17 }}>Livros cadastrados</h2>
          {books.length === 0 ? (
            <p className="muted">
              Nenhum livro cadastrado. Rode <code>npm run db:seed</code> para criar os exemplos ou
              cadastre um acima.
            </p>
          ) : (
            <div className="tbl">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.category}</td>
                      <td>{formatBRL(b.price)}</td>
                      <td>
                        <span className={b.published ? "pill" : "pill w"}>
                          {b.published ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <a className="btn sm ghost" href={`/admin?editar=${b.id}#livros`}>
                            Editar
                          </a>
                          <form action={setBookPublishedAction}>
                            <input type="hidden" name="id" value={b.id} />
                            <input type="hidden" name="publish" value={String(!b.published)} />
                            <button className="btn sm" type="submit">
                              {b.published ? "Retirar" : "Publicar"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel" id="pedidos">
          <h2 style={{ fontSize: 17 }}>Últimos pedidos (exemplo)</h2>
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
                {ORDERS.map(([id, client, title, method, value, ok]) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{client}</td>
                    <td>{title}</td>
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
