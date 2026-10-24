# Notas de compatibilidade — autenticação local

## Prisma ORM 7.10.1 / MySQL

- O quickstart atual usa `prisma-client` com saída explícita, configuração de `DATABASE_URL` via arquivo `prisma.config.ts` e `@prisma/adapter-mariadb` no runtime.
- O conector aceita MySQL local e migrations; URLs usam `mysql://usuario:senha@host:3306/banco`. Caracteres especiais na senha precisam de URL-encoding.
- Fontes oficiais: https://www.prisma.io/docs/v7/prisma-orm/quickstart/mysql ; https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql ; https://www.prisma.io/docs/orm/v7/reference/connection-urls

## Next.js 16.4.3 / Cache Components

- Com `cacheComponents: true`, leituras de sessão via `cookies()` acontecem por requisição e precisam ficar dentro de um limite React `<Suspense>` para não bloquear o shell estático.
- A autenticação deve ser mantida em módulos server-only e o guard precisa validar a autorização no servidor.
- Guias locais da versão instalada: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md` e `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.

## Erro P3014 — banco shadow

- `prisma migrate dev` exige shadow database e privilégios para criá-lo/limpá-lo. Se for desejado continuar usando `migrate dev`, a alternativa de menor privilégio é criar um banco shadow dedicado e configurar `SHADOW_DATABASE_URL`/`shadowDatabaseUrl`, nunca apontar o shadow para o banco principal.
- `prisma migrate deploy` aplica migrations já existentes e não usa shadow database. A migration inicial da livraria já foi gerada offline; por isso `npm.cmd run db:deploy` é apropriado para aplicá-la sem ampliar privilégios do usuário MySQL.
- Fontes oficiais: https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/shadow-database ; https://www.prisma.io/docs/cli/v7/migrate/dev ; https://www.prisma.io/docs/cli/v7/migrate/deploy
