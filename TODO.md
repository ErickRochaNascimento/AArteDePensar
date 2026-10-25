# TODO — Site Livraria

## Entrega 1 — contas e autenticação — revisada; testar logout e bloqueios no navegador

- A conta autenticada entra no site com sessão persistida; o usuário confirmou que o login funciona.
- O logout revoga a sessão; depois dele, `/meus-livros` redireciona quem não está autenticado para `/entrar`.
- `/admin` permite somente papel `ADMIN`; usuário sem sessão ou com papel `USER` não acessa o painel.

## Entrega 2 — catálogo de livros/autores no MySQL — implementada no código; falta aplicar migration/seed e testar com o MySQL local

- O MySQL tem modelos `Author` e `Book` relacionados; slugs de autor e livro são únicos, e os campos do livro cobrem título, ano, categoria, páginas, preço, sinopse, cores da capa e dados demonstrativos de avaliação.
- Um seed explícito e idempotente insere os seis autores e oito livros de exemplo, sem arquivos EPUB/PDF; executar o seed não duplica nem sobrescreve metadados alterados pelo administrador.
- Home, busca, filtros por categoria, detalhes de livro, perfis de autor e recomendações relacionadas leem os registros publicados do MySQL no servidor. As páginas mantêm o design e os títulos/descrições existentes; preço `Decimal` é convertido para DTO numérico antes de chegar a componentes cliente.
- O carrinho local aceita itens retornados do catálogo, mas os dados guardados no navegador são somente para exibição e não são fonte confiável de preço.

## Entrega 2 — cadastro e edição de metadados no Admin — implementada no código; falta testar com o MySQL local

- Somente um usuário autenticado com papel `ADMIN` pode listar e alterar livros; cada ação do servidor repete a verificação de papel, não confiando apenas na proteção da página.
- O Admin pode criar e editar título, autor existente, ano, categoria, número de páginas, preço e sinopse; o slug é gerado/normalizado no servidor e deve ser único.
- Livros novos começam como rascunho. O Admin pode publicar ou retirar do catálogo um livro; somente livros publicados aparecem na área pública. Não há exclusão de livro nesta etapa.
- Os formulários validam os campos no servidor e exibem mensagens úteis para erros; não exibem controles de upload, pois arquivos e capas enviados ainda não fazem parte desta entrega.
- O carrinho e o checkout permanecem demonstrativos: esta etapa não cria pedidos, cobra pagamento nem libera EPUB/PDF.

## Área do cliente

- `/meus-livros` pesquisa por título ou autor apenas nos livros registrados na biblioteca daquele usuário.
- `/meus-livros/dados` permite alterar nome e e-mail; a alteração de e-mail exige a senha atual.

## Entrega 3 — dados da conta, estante e organização do Admin — implementada no código; migration/validação MySQL pendentes e conteúdo digital não fornecido

- Em `/meus-livros/dados`, somente o usuário autenticado altera o próprio nome e e-mail; o servidor valida nome entre 2 e 120 caracteres, e-mail válido até 191 caracteres, normaliza o e-mail e impede duplicidade. A senha atual é exigida para mudança de e-mail.
- A estante vem de relações reais usuário/livro persistidas no banco, únicas por usuário e livro; não usa livros publicados como substituto de compras nem progresso demonstrativo. Sem relações, exibe estante vazia.
- A página do leitor confirma no servidor a sessão e a propriedade do livro antes de renderizar conteúdo; login sozinho não concede acesso, e livros não pertencentes não revelam conteúdo.
- Não criar pedidos, efetuar pagamentos, conceder livros fictícios ou liberar e-book pelo clique no checkout nesta etapa. A integração de checkout está reservada para a Entrega 5, última etapa; somente uma confirmação de pagamento validada no servidor poderá criar a relação de biblioteca.
- Não há arquivos EPUB/PDF no projeto. O leitor informa que o conteúdo digital não está disponível, e nenhum download é oferecido sem arquivo real e verificação de propriedade.
- A migration `20261025173500_customer_library` foi preparada localmente, mas não foi aplicada porque o terminal do projeto não alcança `127.0.0.1:3306`. Gerar o cliente Prisma e validar o schema não altera o banco; executar `db:deploy` e `db:seed` no MySQL local ainda é necessário.
- O Admin está dividido nas seções **Vendas**, **Livros** e **Autores**. Livros podem ser cadastrados, listados, editados, publicados ou retirados; o endereço do livro permanece estável nas edições.
- Ao cadastrar livro, se o autor desejado ainda não estiver na lista, é possível abrir o cadastro rápido, salvar o autor e selecioná-lo pelo botão “Usar este autor no livro”, sem abandonar o formulário do livro.
- A área **Autores** cadastra, lista e edita nome, biografia e cor do perfil, mostra a quantidade de livros publicados e conserva endereços públicos existentes; autores associados a livros não são removidos.
- A área **Vendas** começa no mês atual e permite selecionar início/fim com intervalo de no máximo 90 dias. O gráfico e a lista mostram somente vendas reais. Como pedidos/checkout pertencem à Entrega 5, não há números, pedidos, clientes ou pagamentos demonstrativos.
