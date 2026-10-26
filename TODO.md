# TODO — Site Livraria

## Entrega 1 — contas e autenticação — revisada; testar logout e bloqueios no navegador

- A conta autenticada entra no site com sessão persistida; o usuário confirmou que o login funciona.
- O logout revoga a sessão; depois dele, `/meus-livros` redireciona quem não está autenticado para `/entrar`.
- No escopo inicial de autenticação, `/admin` permitia somente `ADMIN`; a Entrega 3 adiciona `EMPLOYEE` com limites explícitos de catálogo e sem acesso a Vendas/Usuários.

## Entrega 2 — catálogo de livros/autores no MySQL — implementada no código; falta aplicar migration/seed e testar com o MySQL local

- O MySQL tem modelos `Author` e `Book` relacionados; slugs de autor e livro são únicos, e os campos do livro cobrem título, ano, categoria, páginas, preço, sinopse, cores da capa e dados demonstrativos de avaliação.
- Um seed explícito e idempotente insere os seis autores e oito livros de exemplo, sem arquivos EPUB/PDF; executar o seed não duplica nem sobrescreve metadados alterados pelo administrador.
- Home, busca, filtros por categoria, detalhes de livro, perfis de autor e recomendações relacionadas leem os registros publicados do MySQL no servidor. As páginas mantêm o design e os títulos/descrições existentes; preço `Decimal` é convertido para DTO numérico antes de chegar a componentes cliente.
- O carrinho local aceita itens retornados do catálogo, mas os dados guardados no navegador são somente para exibição e não são fonte confiável de preço.

## Entrega 2 — cadastro e edição de metadados no Admin — implementada no código; falta testar com o MySQL local

- Na Entrega 2, somente `ADMIN` podia listar e alterar livros; a Entrega 3 adiciona `EMPLOYEE` para cadastros e propostas pendentes, sem permissão de publicar ou confirmar.
- O Admin pode criar e editar título, autor existente, ano, categoria, número de páginas, preço e sinopse; o slug é gerado/normalizado no servidor e deve ser único.
- Livros novos começam como rascunho. O Admin pode publicar ou retirar do catálogo um livro; somente livros publicados aparecem na área pública. Na Entrega 2 ainda não havia exclusão; a Entrega 3 adiciona exclusão exclusiva de ADMIN e bloqueada para livros da biblioteca.
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
- O seed não inclui arquivos EPUB/PDF. Depois do upload de um arquivo real pelo Admin, o PDF abre no leitor e PDF/EPUB podem ser baixados somente por quem tem a relação de biblioteca; enquanto não houver arquivo, a interface informa a indisponibilidade.
- As migrations `20261025173500_customer_library`, `20261025191100_media_uploads` e `20261025201300_staff_approvals` foram preparadas localmente, mas não aplicadas: o terminal do projeto não alcança `127.0.0.1:3306`. Gerar o cliente Prisma e validar o schema não altera o banco; executar `db:deploy` e `db:seed` no MySQL local ainda é necessário.
- O Admin está dividido nas seções **Vendas**, **Livros** e **Autores**. Livros podem ser cadastrados, listados, editados, publicados ou retirados; o endereço do livro permanece estável nas edições. O estado de edição de livros e autores não é guardado em query string; atualizar a página fecha a edição e retorna ao modo de cadastro/lista.
- Autor e Categoria usam cada um um único campo pesquisável com a pesquisa dentro do próprio seletor. A categoria continua aceitando texto novo, além de sugerir categorias já cadastradas.
- O botão “Cadastrar autor não listado” fica ao lado do campo de Autor; ao abrir o cadastro rápido, a página rola até “Cadastrar autor para este livro”. Depois de salvar o novo autor, “Usar este autor no livro” o seleciona no campo.
- A área **Autores** cadastra, lista e edita nome, biografia e cor do perfil, mostra a quantidade de livros publicados e conserva endereços públicos existentes; autores associados a livros não são removidos.
- A área **Vendas** começa no mês atual e permite selecionar início/fim com intervalo de no máximo 90 dias. O gráfico e a lista mostram somente vendas reais. Como pedidos/checkout pertencem à Entrega 5, não há números, pedidos, clientes ou pagamentos demonstrativos.
- O formulário de livros pesquisa e filtra autores e categorias dentro dos respectivos campos; a lista de autores cadastrados pesquisa por nome e informa quando não há resultados.
- Foto do autor e capa/EPUB/PDF do livro podem ser selecionados ainda durante o cadastro. O botão de envio fica habilitado quando o registro já existe e seu ID foi gerado, sem sair do formulário. Foto/capa aceitam JPEG, PNG ou WebP até 5 MiB; e-books aceitam PDF ou EPUB até 50 MiB. O servidor verifica papel e registro permitido, extensão, tipo, assinatura e tamanho do arquivo.
- Fotos e capas ficam em `storage/uploads/authors/` e `storage/uploads/covers/`, fora de `public/`, e são servidas por uma rota pública restrita a imagens cadastradas. EPUB/PDF ficam em `storage/books/`, também fora de `public/`, com chaves aleatórias; download verifica sessão e propriedade do livro. Pastas de uploads locais não são versionadas.
- As migrations `20261025173500_customer_library`, `20261025191100_media_uploads` e `20261025201300_staff_approvals` serão aplicadas junto com as anteriores após o MySQL local ficar acessível; não publicar nem enviar arquivos ao GitHub.


## Entrega 3 — papéis, aprovação de catálogo e gestão de usuários — implementada em código; migration e teste no MySQL pendentes

- `USER` é cliente, `EMPLOYEE` aparece como Funcionário e `ADMIN` como Administrador. A rota `/admin` continua dividida em Vendas, Livros e Autores; `/admin/usuarios` é uma página separada, exclusiva de ADMIN.
- Funcionário pode cadastrar livro e autor, mas o novo registro começa não publicado. Funcionário não pode publicar/retirar livro nem autor, não pode aprovar/rejeitar alterações, não pode gerenciar papéis de usuários e não tem acesso às Vendas. Exclusão de livro/autor é exclusiva de ADMIN: não excluir livro com itens na biblioteca nem autor vinculado a livros.
- Funcionário pode enviar alterações de livro/autor já existentes como propostas pendentes. As alterações não chegam ao catálogo público até um ADMIN confirmar; ADMIN pode aprovar ou rejeitar e também salvar edições diretamente. Nenhuma Server Action ou rota de upload confia apenas na interface: cada mutação verifica sessão e papel no servidor.
- ADMIN pode promover cliente a Funcionário ou Administrador e alterar papéis; a gestão não pode rebaixar o próprio usuário nem remover o último ADMIN. A página lista nome, e-mail, papel e data de criação, nunca senha/hash; conta de usuário não pode ser excluída.
- Funcionário só pode enviar capa/foto/ebook para registros ainda não publicados; mídia de registro publicado exige ADMIN. Só publicar livro se seu autor estiver publicado; não retirar publicação de autor enquanto houver livro publicado.
- Na criação rápida de autor dentro do cadastro do livro, o controle de foto vem antes do botão “Cadastrar autor”. Ao clicar em “Usar este autor no livro”, selecionar o autor, fechar a área de cadastro rápido e rolar de volta ao formulário do livro.
- Depois de ADMIN confirmar uma edição ou Funcionário enviar uma proposta, fechar e limpar o formulário; atualizar a página também fecha qualquer edição. Novo cadastro pode permanecer aberto para concluir os uploads após o registro receber ID.
- Migration aditiva para `EMPLOYEE`, status de publicação de autor e propostas/auditoria mínima, sem executar no banco até o MySQL local estar acessível.
