import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { updateUserRoleAction } from "@/app/actions/users";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Gerenciar usuários" };

const NOTICES: Record<string, string> = {
  atualizado: "O papel do usuário foi atualizado.",
  unchanged: "O usuário já tem esse papel.",
  missing: "A conta não foi encontrada.",
  self: "Por segurança, você não pode alterar o próprio papel.",
  "last-admin": "Não é possível rebaixar o último Administrador.",
  error: "Não foi possível atualizar o papel. Tente novamente.",
  "entrada-invalida": "A solicitação de alteração de papel é inválida.",
};

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/usuarios">) {
  return (
    <Suspense fallback={<p className="muted" aria-live="polite">Carregando usuários…</p>}>
      <AuthorizedUsers searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthorizedUsers({
  searchParams,
}: Pick<PageProps<"/admin/usuarios">, "searchParams">) {
  const currentAdmin = await requireAdmin();
  const { q, notice } = await searchParams;
  const searchTerm = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const users = await getDb().user.findMany({
    where: searchTerm
      ? { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }] }
      : undefined,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 250,
  });
  const noticeText = typeof notice === "string" ? NOTICES[notice] : undefined;

  return (
    <section className="admin-users wrap">
      <div className="section-title-row">
        <div>
          <p className="tag">Acesso restrito</p>
          <h1>Gerenciar usuários</h1>
          <p className="muted">Altere o papel de clientes. Esta tela nunca exibe senha ou hash.</p>
        </div>
        <Link className="btn sm ghost" href="/admin">Voltar ao painel</Link>
      </div>
      {noticeText && <p className={notice === "atualizado" ? "ok" : "error"} role="status">{noticeText}</p>}

      <form className="admin-inline-search user-search" action="/admin/usuarios" method="get" role="search">
        <label htmlFor="user-search">Pesquisar por nome ou e-mail</label>
        <div>
          <input id="user-search" name="q" type="search" maxLength={100} defaultValue={searchTerm} placeholder="Nome ou e-mail" />
          <button className="btn sm" type="submit">Pesquisar</button>
          {searchTerm && <Link className="btn sm ghost" href="/admin/usuarios">Limpar</Link>}
        </div>
      </form>

      <div className="panel">
        <div className="section-title-row">
          <h2>Contas cadastradas</h2>
          <span className="pill">{users.length}{users.length === 250 ? "+" : ""} resultados</span>
        </div>
        {users.length === 0 ? (
          <p className="muted">{searchTerm ? "Nenhuma conta corresponde à pesquisa." : "Ainda não há contas cadastradas."}</p>
        ) : (
          <div className="tbl">
            <table>
              <thead><tr><th>Usuário</th><th>Papel</th><th>Cadastrado em</th><th>Ação</th></tr></thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentAdmin.id;
                  return (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong><br /><span className="muted">{user.email}</span></td>
                      <td>{user.role === "ADMIN" ? "Administrador" : user.role === "EMPLOYEE" ? "Funcionário" : "Cliente"}</td>
                      <td>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(user.createdAt)}</td>
                      <td>
                        <form action={updateUserRoleAction} className="user-role-form">
                          <input type="hidden" name="userId" value={user.id} />
                          <select name="role" defaultValue={user.role} aria-label={`Papel de ${user.name}`} disabled={isSelf}>
                            <option value="USER">Cliente</option>
                            <option value="EMPLOYEE">Funcionário</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                          <button className="btn sm" type="submit" disabled={isSelf}>Salvar</button>
                          {isSelf && <small className="muted">Sua conta</small>}
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {users.length === 250 && <p className="muted">Exibindo até 250 contas por vez. Use a pesquisa para localizar outras.</p>}
      </div>
    </section>
  );
}
