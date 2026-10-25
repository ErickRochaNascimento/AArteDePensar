## Entrega 3 — dados da conta e biblioteca

A área autenticada permite que cada pessoa altere nome e e-mail. A mudança de e-mail exige a senha atual, normaliza o endereço e verifica unicidade no servidor. O formulário não altera dados de outra conta.

A estante é alimentada por relações reais `LibraryItem` entre usuário e livro, únicas por combinação. O leitor e o download confirmam autenticação e propriedade em cada requisição. Não são criadas compras, pagamentos nem concessões fictícias nesta entrega. Sem arquivo digital cadastrado, a interface informa a indisponibilidade sem simular capítulos ou botões de download.

## Entrega 5 — última etapa de checkout

O checkout/pagamento é implementado somente na Entrega 5. O servidor concederá a biblioteca após confirmação de pagamento validada; a gravação deverá ser idempotente pela chave única de usuário/livro. O clique do cliente não confirma pagamento nem libera acesso.

## Administração — Vendas, Livros e Autores

A página protegida `/admin` apresenta navegação e seções separadas para **Vendas**, **Livros** e **Autores**, reutilizando o layout, a paleta e os controles existentes.

Vendas abre com o mês atual. O administrador pode informar datas de início e fim, com validação que impede intervalo negativo ou superior a 90 dias. Gráfico e tabela refletem somente vendas reais. Como pedidos e checkout estão reservados à Entrega 5, o painel informa que não há vendas ainda e não inclui valores, clientes ou pedidos demonstrativos.

Livros permite cadastrar, listar, editar, publicar e retirar livros do catálogo. Ao cadastrar um livro cujo autor ainda não existe, o formulário abre cadastro rápido; depois de salvar, o administrador seleciona a ação “Usar este autor no livro” para inseri-lo no livro. O formulário de livros também permite pesquisar autores.

Autores permite cadastrar, listar e editar nome, biografia e cor de perfil; os endereços existentes são preservados ao editar. A lista permite pesquisar por nome, mostra quantos livros há e quais perfis já têm livros publicados. Não remover autores associados a livros.

Todas as mutações administrativas verificam o papel `ADMIN` no servidor. Nenhuma alteração desta etapa cria pedidos, registra venda ou concede livros à biblioteca.

## Fotos, capas e arquivos de livro

O Admin aceita foto de autor e capa de livro em JPEG, PNG ou WebP, até 5 MiB por imagem, além de arquivos EPUB ou PDF de até 50 MiB. Após salvar os metadados do autor/livro, os controles de envio ficam disponíveis no mesmo fluxo administrativo; ao criar autor dentro do formulário do livro, é possível também enviar sua foto sem abandonar o fluxo.

A pesquisa de autores no formulário de livros filtra as opções imediatamente; a pesquisa em Autores Cadastrados localiza nomes e informa quando não há resultados.

O servidor valida papel ADMIN, extensão, MIME, assinatura do arquivo e tamanho, usando chaves aleatórias em vez de nomes fornecidos pelo usuário. Fotos e capas são guardadas em `storage/uploads/authors/` e `storage/uploads/covers/`, fora de `public/`, e servidas por uma rota pública restrita a imagens cadastradas. Os e-books ficam em `storage/books/`, também fora de `public/`; o endpoint de download exige sessão e propriedade `LibraryItem` a cada requisição. PDFs podem ser visualizados no leitor; EPUB fica disponível para download protegido.

Os diretórios de uploads locais são ignorados pelo Git. Esse armazenamento em disco atende à execução local atual; as migrations serão aplicadas ao MySQL local somente quando estiver acessível. Não enviar uploads ao GitHub nem publicar o site.
