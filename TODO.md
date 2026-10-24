# TODO — Entrega 1: contas e autenticação

## Cadastro com dados persistidos e senha protegida — migration aplicada; cadastro pendente de confirmação

- O schema Prisma define `User` com nome, e-mail único, hash de senha e papel; a migration inicial foi aplicada ao MySQL local, conforme confirmado pelo login funcional.
- O cadastro valida os campos no servidor, normaliza o e-mail, usa Argon2id e cria novas contas com papel padrão `USER`.

## Login, sessão e logout reais — login confirmado; logout pendente de teste

- Os formulários estão conectados às ações server-side; o usuário confirmou que conseguiu entrar.
- Sessões opacas têm o token em cookie `HttpOnly`, expiração e `SameSite=Lax`; só o hash do token é guardado em `sessions`. O logout revoga a sessão e remove o cookie.

## Proteção das áreas do cliente e administrativa — código implementado; acesso pendente de teste

- `/meus-livros` exige sessão válida e mostra nome/e-mail do usuário autenticado.
- `/admin` exige sessão com papel `ADMIN`; cadastro público não permite atribuir esse papel.
- A promoção inicial de administrador está documentada para ser feita manualmente no banco.
