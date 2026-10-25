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
npm.cmd run db:seed
```

`db:deploy` aplica todas as migrations versionadas que ainda faltarem no banco local `livraria` — autenticação, catálogo, biblioteca e mídia — sem criar um banco shadow. O seed cria apenas autores e livros de demonstração; não cria conta ADMIN, pedidos, pagamentos ou livros na estante de qualquer usuário. Se a migração indicar outro banco ou uma URL diferente, pare e confira o `.env` antes de repetir.

`db:migrate` é para desenvolver migrations novas; ele usa um banco shadow e exige permissões adicionais ou uma base shadow configurada. Não use esse comando para aplicar migrations já versionadas.

Para iniciar o site localmente:

```powershell
npm.cmd run dev
```

## Criar e acessar uma conta administradora

Primeiro registre uma conta normalmente pela página `/entrar`, usando o e-mail e a senha que você escolher. Não existe senha padrão de administrador: a promoção só altera o papel da conta, não a senha. Depois, no MySQL Workbench, conectado ao banco `livraria`, promova somente esse e-mail:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'SEU_EMAIL_DE_ADMIN';
```

Entre em `/entrar` com o mesmo e-mail e senha que você cadastrou e acesse `/admin`. Novas contas sempre começam como `USER`; não existe formulário público para conceder acesso administrativo. A página e cada mutação administrativa verificam uma sessão válida com papel `ADMIN` no servidor.

Em uma hospedagem HTTPS, configure `AUTH_COOKIE_SECURE=true` no ambiente do servidor. Para desenvolvimento local em HTTP, mantenha `false`.

## Catálogo de livros (Entrega 2)

O catálogo usa os livros e autores persistidos no MySQL. O seed é idempotente: cria seis autores e oito livros de exemplo se ainda não existirem, pelo slug, e não sobrescreve o que você editou no Admin.

No `/admin`, uma conta com papel `ADMIN` cadastra e edita título, autor, ano, categoria, páginas, preço e sinopse. Livros novos começam como **rascunho**; use **Publicar** na lista para que apareçam no catálogo. O endereço (`slug`) é criado a partir do título e não muda nas edições.

## Biblioteca e arquivos digitais (Entrega 3)

A migration `customer_library` cria `library_items`, que relaciona um usuário a um livro e guarda progresso de leitura. A estante consulta apenas essas relações; o seed não cria compras nem concede livros. O checkout da Entrega 5 deverá inserir a relação somente após confirmação de pagamento no servidor.

No Admin, livros podem receber capa JPEG, PNG ou WebP de até 5 MiB e um arquivo EPUB ou PDF de até 50 MiB. Autores podem receber foto JPEG/PNG/WebP de até 5 MiB. O servidor verifica papel ADMIN, extensão, MIME, assinatura do arquivo e limite de tamanho. Após salvar um novo livro/autor, o painel mantém o fluxo e mostra o controle de upload na edição.

As fotos e capas são guardadas em `storage/uploads/authors/` e `storage/uploads/covers/`, fora de `public/`, e servidas por uma rota que só publica imagens associadas a registros do catálogo. EPUB/PDF ficam em `storage/books/`, também fora de `public/`; o endpoint exige sessão e propriedade do livro em cada requisição. PDF pode ser exibido no leitor; EPUB é oferecido para download protegido. O projeto não inclui arquivos de livro no seed: até que o Admin envie um arquivo real, leitura e download daquele título ficam indisponíveis.

Os diretórios `storage/uploads/` e `storage/books/` são locais e ignorados pelo Git. Faça backup desses arquivos separadamente se desejar preservá-los; não os envie ao repositório. Em uma implantação futura, configure armazenamento persistente compatível antes de receber uploads.
