# Plano — Site Livraria

## Entrega 1 — contas e autenticação

### Escopo e abordagem

Implementar cadastro e login reais para a livraria, persistindo usuários no MySQL, armazenando somente hashes de senha e protegendo `/meus-livros` e `/admin`. Manter Next.js 16 App Router e o visual de autenticação existente. Usar Prisma com MySQL e modelos `User`/`Session`; e-mail único normalizado, nome, hash de senha, papéis `USER`/`ADMIN`, token de sessão guardado como hash e validade da sessão.

Processar cadastro, login e logout no servidor; validar campos, usar Argon2id, mensagens genéricas para credenciais inválidas e cookie de sessão `HttpOnly`, `SameSite=Lax`, `Secure` em HTTPS. Centralizar acesso e autorização em módulos server-only. Contas novas recebem `USER`; promover o primeiro administrador manualmente no banco. Não colocar credenciais no código, Git ou conversa.

### Estrutura, design e limites

- `prisma/schema.prisma`, migrations, `src/lib/db.ts`, `src/lib/session.ts`, `src/lib/auth.ts` e `src/app/actions/auth.ts` definem os dados e a autenticação.
- `src/components/AuthForms.tsx`, `src/app/meus-livros/page.tsx` e `src/app/admin/page.tsx` implementam os fluxos e as proteções.
- Reutilizar fundo claro, verde-petróleo nas ações, dourado nos destaques e tipografia Bricolage Grotesque/Figtree.
- A implementação foi mantida local. O usuário confirmou que o login funciona; logout e bloqueios de acesso ainda podem ser exercitados no navegador.

## Entrega 2 — catálogo MySQL e metadados no Admin

**Status:** escopo escolhido pelo usuário; alterações permanecem somente na pasta local, sem commit ou push.

### Resultado esperado

O catálogo público lê livros e autores do MySQL, em vez de usar os arrays fictícios como fonte de verdade. Um administrador autenticado também pode cadastrar e editar os metadados dos livros pela área `/admin`. As páginas mantêm o layout atual.

### Dados e leitura pública

Adicionar modelos Prisma `Author` e `Book`, relacionados por chave estrangeira e com os campos usados pelo site: nome/título, slugs, biografia, autor, ano, categoria, número de páginas, preço, sinopse, cores da capa e os campos demonstrativos de avaliação que a interface atual exibe. Criar um seed explícito, idempotente, com os seis autores e oito livros de exemplo existentes; esses registros são metadados fictícios, não arquivos de livros. Os exemplos existentes começam publicados. Não executar seed automaticamente em build ou deploy.

Criar uma camada server-only de catálogo que consulte o MySQL e retorne DTOs públicos simples; converter preços Prisma `Decimal` para `number` antes de passá-los aos componentes. A página inicial, busca, categorias, detalhes `/livro/[slug]`, perfis `/autor/[slug]` e recomendações relacionadas passam a usar essas consultas. A busca e os filtros preservam seu comportamento atual; páginas de autores/livros mantêm título e descrição próprios. Consultas não armazenadas em cache ficam em componentes assíncronos protegidos por Suspense, conforme Cache Components do Next.js instalado.

O carrinho permanece local e demonstrativo, mas aceita itens recebidos do catálogo e guarda somente dados de exibição. O cliente não é fonte confiável de preço; o checkout futuro recalculará valores no servidor.

### Cadastro e edição administrativa

A página `/admin` lista livros e permite criar e editar metadados: título, autor selecionado entre os autores cadastrados, ano, categoria, páginas, preço e sinopse. O slug é normalizado no servidor e precisa ser único. Registros novos começam como rascunho; o administrador pode publicar ou retirar do catálogo um livro. O catálogo público exibe somente livros publicados. Não haverá exclusão de registros nesta etapa.

As ações de cadastro, edição e publicação validam novamente a sessão e o papel `ADMIN` no servidor, independentemente da proteção da página. Validação de campos e unicidade de slug ocorre no servidor, com mensagens úteis no formulário. Cores de capa continuam usando o tratamento visual existente; não haverá upload de imagem.

### Limites desta etapa

Sem upload ou armazenamento de EPUB/PDF, leitor com conteúdo real, download protegido, pedidos, Mercado Pago, webhooks, avaliações reais, edição de autores ou estatísticas reais de vendas. O carrinho e o checkout permanecem demonstrativos; publicar um registro nesta etapa publica seus metadados, não disponibiliza um arquivo digital.

### Implementação e compatibilidade

Manter Next.js 16 App Router, Prisma 7/MySQL e os componentes visuais existentes. A camada de dados fica no servidor; client components recebem somente DTOs necessários. A migration será preparada como arquivo local e aplicada somente ao banco `livraria` configurado no `.env`, quando o MySQL local estiver acessível, usando `db:deploy` para não depender de shadow database. O seed será executado explicitamente e apenas contra o banco configurado pelo usuário. Não introduzir serviço externo, publicar o site ou alterar o repositório GitHub.

### Estrutura principal

- `prisma/schema.prisma`, migrations e `prisma/seed.ts`: modelos e metadados de demonstração.
- `src/lib/catalog.ts`: consultas server-only, DTOs e validação dos campos de catálogo.
- `src/app/actions/catalog.ts`: ações de criação/edição/publicação protegidas por papel `ADMIN`.
- `src/app/page.tsx`, `src/app/livro/[slug]/page.tsx` e `src/app/autor/[slug]/page.tsx`: catálogo público vindo do MySQL.
- `src/app/admin/page.tsx` e componentes de formulário/lista: gestão dos metadados de livros.
- `src/components/CatalogGrid.tsx`, `BookCard.tsx`, `BuyBox.tsx` e `src/lib/cart.tsx`: compatibilidade com DTOs do banco, mantendo o carrinho apenas demonstrativo.

### Design

Reutilizar o design atual da livraria — fundo claro, verde-petróleo para ações, dourado nos destaques, tipografia Bricolage Grotesque/Figtree e componentes existentes. Não haverá redesign amplo.
