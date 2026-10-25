# TODO — Site Livraria

## Entrega 1 — contas e autenticação — revisada; testar logout e bloqueios no navegador

- A conta autenticada entra no site com sessão persistida; o usuário confirmou que o login funciona.
- O logout revoga a sessão; depois dele, `/meus-livros` redireciona quem não está autenticado para `/entrar`.
- `/admin` permite somente papel `ADMIN`; usuário sem sessão ou com papel `USER` não acessa o painel.

## Entrega 2 — catálogo de livros/autores no MySQL — implementada; falta aplicar migration/seed e testar com o MySQL local

- O MySQL tem modelos `Author` e `Book` relacionados; slugs de autor e livro são únicos, e os campos do livro cobrem título, ano, categoria, páginas, preço, sinopse, cores da capa e dados demonstrativos de avaliação.
- Um seed explícito e idempotente insere os seis autores e oito livros de exemplo, sem arquivos EPUB/PDF; executar o seed não duplica nem sobrescreve metadados alterados pelo administrador.
- Home, busca, filtros por categoria, detalhes de livro, perfis de autor e recomendações relacionadas leem os registros publicados do MySQL no servidor. As páginas mantêm o design e os títulos/descrições existentes; preço `Decimal` é convertido para DTO numérico antes de chegar a componentes cliente.
- O carrinho local aceita itens retornados do catálogo, mas os dados guardados no navegador são somente para exibição e não são fonte confiável de preço.

## Entrega 2 — cadastro e edição de metadados no Admin — implementada; falta testar com o MySQL local

- Somente um usuário autenticado com papel `ADMIN` pode listar e alterar livros; cada ação do servidor repete a verificação de papel, não confiando apenas na proteção da página.
- O Admin pode criar e editar título, autor existente, ano, categoria, número de páginas, preço e sinopse; o slug é gerado/normalizado no servidor e deve ser único.
- Livros novos começam como rascunho. O Admin pode publicar ou retirar do catálogo um livro; somente livros publicados aparecem na área pública. Não há exclusão de livro nesta etapa.
- Os formulários validam os campos no servidor e exibem mensagens úteis para erros; não exibem controles de upload, pois arquivos e capas enviados ainda não fazem parte desta entrega.
- O carrinho e o checkout permanecem demonstrativos: esta etapa não cria pedidos, cobra pagamento nem libera EPUB/PDF.
