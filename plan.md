# Plano — Entrega 1: contas e autenticação

## Escopo

Implementar cadastro e login reais para a livraria, persistindo usuários no MySQL, armazenando somente hashes de senha e protegendo as páginas `/meus-livros` e `/admin`. Não fazer commit nem push; as alterações ficam apenas na pasta local do projeto.

## Abordagem

- Manter o Next.js 16 App Router e o visual existente da tela de autenticação.
- Usar Prisma com o MySQL local. Criar os modelos `User` e `Session`: e-mail único normalizado, nome, hash de senha, papel `USER`/`ADMIN`, token de sessão armazenado como hash e validade da sessão.
- Processar cadastro, login e logout no servidor. Validar os campos no servidor, hash de senha com Argon2id, mensagens de login genéricas e sessão opaca em cookie `HttpOnly`, `SameSite=Lax`, com `Secure` em HTTPS.
- Centralizar acesso ao usuário e autorização em módulos server-only. `/meus-livros` exige sessão válida; `/admin` exige sessão válida com papel `ADMIN`. Contas novas recebem sempre o papel `USER`; a promoção inicial a administrador será manual no banco, documentada e sem endpoint público.
- Substituir a navegação simulada dos formulários por ações reais, mostrar o nome do usuário autenticado na área dele e encerrar a sessão de fato no logout. Preservar o restante do catálogo e as telas demonstrativas de compras/estante, que pertencem a entregas posteriores.
- Não colocar credenciais no código, no Git ou nesta conversa. A conexão será configurada em arquivo local ignorado pelo Git; será fornecido um exemplo sem segredos.

## Estrutura prevista

- `prisma/schema.prisma` e migração local: modelos de usuário e sessão.
- `src/lib/db.ts`: instância única do Prisma.
- `src/lib/session.ts` e `src/lib/auth.ts`: criação, validação, revogação de sessão e acesso autenticado.
- `src/app/actions/auth.ts`: ações de cadastro, login e logout.
- `src/components/AuthForms.tsx`: formulários conectados às ações e estados de erro/sucesso.
- `src/app/meus-livros/page.tsx` e `src/app/admin/page.tsx`: verificação de autenticação/autorização no servidor.
- `.env.example` e documentação local: formato da variável `DATABASE_URL`, migração e criação manual de administrador; nenhum valor secreto será incluído.

## Design

Reutilizar o estilo atual da livraria — interface clara, verde-petróleo como cor de ação e dourado nos destaques, tipografia Bricolage Grotesque/Figtree e componentes de formulário existentes. As telas de autenticação continuam em português e não terão mudança visual ampla.

## Dependências e limites

- O serviço local responde em `127.0.0.1:3306`, mas a raiz do projeto ainda não tem `.env`/`.env.local`. A migração exige uma variável `DATABASE_URL` local apontando a um banco e usuário próprios da livraria; não usar a conta `root` no aplicativo.
- A Entrega 1 não inclui recuperação de senha, e-mail transacional, compras, entrega de livros, gestão do catálogo ou mudança para hospedagem.
- Não alterar o repositório remoto, não fazer commit e não enviar o projeto para serviços externos.

## Verificação

Executar os checks locais disponíveis (lint e build/typecheck), aplicar a migração somente ao banco local configurado para a livraria e validar cadastro, login, logout, bloqueio de `/meus-livros` sem sessão e bloqueio de `/admin` para contas sem papel administrativo. Se faltarem as credenciais locais, deixar a migração pendente sem expor segredos e orientar como completar a configuração.


---

# Proposta de plano — Entrega 2: catálogo persistido no MySQL

**Status:** proposta para aprovação; nenhuma implementação da Entrega 2 foi iniciada.

## Escopo proposto

O código identifica livros e autores como dados fictícios e prevê movê-los ao MySQL na Entrega 2/3. Esta etapa transforma o catálogo público em dados persistidos, preservando as páginas e o visual que já existem.

Adicionar os modelos Prisma `Author` e `Book`, com relação entre autor e livros e campos de catálogo que a interface atual já usa. Criar um seed manual, repetível e idempotente com os seis autores e oito livros de exemplo atuais; o seed guardará somente metadados, não arquivos EPUB/PDF.

Criar uma camada de acesso a dados `server-only` que leia do MySQL e retorne DTOs públicos serializáveis, sem credenciais nem campos internos. A página inicial, busca e filtro por categoria, página de detalhes `/livro/[slug]`, perfis `/autor/[slug]` e livros relacionados passarão a ler esses dados no servidor. As rotas manterão seus títulos e descrições e usarão Suspense para leituras do banco em tempo de requisição, conforme o modo Cache Components instalado.

Adaptar o carrinho local para exibir os livros vindos do catálogo. O carrinho continua sendo apenas uma conveniência no navegador: não criará pedidos nem validará valores para pagamento. O preço autoritativo será consultado no servidor quando a etapa de checkout real for implementada.

## Fora desta etapa

Esta proposta não inclui upload ou armazenamento de EPUB/PDF, leitor com conteúdo real, download protegido, compras/pedidos, Mercado Pago, webhooks, persistência de avaliações, gerenciamento administrativo de livros nem estatísticas de vendas. A página administrativa permanece protegida como já está, mas o formulário demonstrativo de cadastro não passará a publicar livros nesta etapa. Esses fluxos precisam de armazenamento de arquivos e regras de compra próprias, previstas para etapas posteriores.

## Implementação e compatibilidade

Manter o Next.js 16 App Router, Prisma 7/MySQL e os componentes visuais existentes. O código de banco permanece no servidor; os componentes cliente recebem somente os campos necessários em formato simples, incluindo preço convertido de `Decimal` para `number`. Não introduzir serviço de hospedagem, integração externa, chave secreta nem dependência nova sem necessidade.

A migration será preparada como arquivo local e aplicada somente ao banco `livraria` configurado em `.env`, quando o MySQL local estiver acessível. A aplicação será feita com `db:deploy` para não exigir criação automática de banco shadow nem ampliar privilégios. O seed será executado explicitamente, nunca durante build ou deploy. Nada será enviado ao GitHub; não farei commit nem push.

## Estrutura principal

- `prisma/schema.prisma`, migration e `prisma/seed.ts`: modelos e dados de demonstração do catálogo.
- `src/lib/catalog.ts`: consultas de catálogo no servidor e conversão para DTOs.
- `src/lib/data.ts`: tipos/formatadores que ainda forem necessários aos componentes, sem ser a fonte de verdade do catálogo público.
- `src/app/page.tsx`, `src/app/livro/[slug]/page.tsx` e `src/app/autor/[slug]/page.tsx`: leitura do catálogo no servidor.
- `src/components/CatalogGrid.tsx`, `BookCard.tsx`, `BuyBox.tsx` e `src/lib/cart.tsx`: compatibilidade do catálogo e do carrinho com os DTOs.

## Design

Reutilizar o design atual da livraria — fundo claro, verde-petróleo para ações, dourado nos destaques, tipografia Bricolage Grotesque/Figtree e componentes existentes. A etapa é de integração e dados; não haverá redesign amplo.
