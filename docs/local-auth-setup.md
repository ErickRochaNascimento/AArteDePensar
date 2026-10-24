# Configuração local de contas e autenticação

## Preparar o banco

Confirme que o serviço MySQL está acessível em `127.0.0.1:3306`. No MySQL Workbench, conecte-se com a conta administrativa que você configurou e execute:

```sql
CREATE DATABASE IF NOT EXISTS livraria
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'livraria_app'@'127.0.0.1'
  IDENTIFIED BY 'ESCOLHA_UMA_SENHA_FORTE';

GRANT ALL PRIVILEGES ON livraria.*
  TO 'livraria_app'@'127.0.0.1';
```

Se o usuário `livraria_app` já existir, use `ALTER USER 'livraria_app'@'127.0.0.1' IDENTIFIED BY 'SUA_NOVA_SENHA';` em vez de `CREATE USER`. Nunca use a senha de `root` na aplicação e não envie senhas pelo chat.

## Configurar a aplicação

Na raiz do projeto, copie `.env.example` para `.env`. Preencha `DATABASE_URL` com o usuário `livraria_app`, a senha escolhida, host `127.0.0.1`, porta `3306` e banco `livraria`. Se a senha tiver caracteres especiais, aplique URL-encoding antes de colocá-la na URL. O arquivo `.env` é ignorado pelo Git; não o compartilhe nem o versione.

No PowerShell, execute a partir da raiz do projeto:

```powershell
npm.cmd run db:generate
npm.cmd run db:deploy
```

`db:deploy` aplica a migration SQL já preparada e cria as tabelas `users` e `sessions` no banco local `livraria`, sem criar um banco shadow. Se a migração indicar outro banco ou uma URL diferente, pare e confira o `.env` antes de repetir.

`db:migrate` é para desenvolver migrations novas; ele usa um banco shadow e exige permissões adicionais ou uma base shadow configurada. Não use esse comando para aplicar a migration inicial enquanto o usuário MySQL não estiver configurado para isso.

Para iniciar o site localmente:

```powershell
npm.cmd run dev
```

## Criar a primeira conta administradora

Primeiro registre a conta normalmente pela página `/entrar`. Depois, no MySQL Workbench, conectado ao banco `livraria`, promova somente esse e-mail:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'SEU_EMAIL_DE_ADMIN';
```

Novas contas sempre começam como `USER`; não existe formulário público para conceder acesso administrativo. A página `/admin` exige uma sessão válida com papel `ADMIN`.

Em uma hospedagem HTTPS, configure `AUTH_COOKIE_SECURE=true` no ambiente do servidor. Para desenvolvimento local em HTTP, mantenha `false`.
