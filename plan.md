## Entrega 3 — dados da conta e biblioteca

A área autenticada permite que cada pessoa altere nome e e-mail. A mudança de e-mail exige a senha atual, normaliza o endereço e verifica unicidade no servidor. O formulário não altera dados de outra conta.

A estante é alimentada por relações reais `LibraryItem` entre usuário e livro, únicas por combinação. O leitor e o download confirmam autenticação e propriedade em cada requisição. Não são criadas compras, pagamentos nem concessões fictícias nesta entrega. Sem arquivo digital cadastrado, a interface informa a indisponibilidade sem simular capítulos ou botões de download.

## Entrega 5 — última etapa de checkout

O checkout/pagamento é implementado somente na Entrega 5. O servidor concederá a biblioteca após confirmação de pagamento validada; a gravação deverá ser idempotente pela chave única de usuário/livro. O clique do cliente não confirma pagamento nem libera acesso.

## Administração — Vendas, Livros e Autores

A página protegida `/admin` apresenta navegação e seções separadas para **Vendas**, **Livros** e **Autores**, reutilizando o layout, a paleta e os controles existentes.

Vendas abre com o mês atual. O administrador pode informar datas de início e fim, com validação que impede intervalo negativo ou superior a 90 dias. Gráfico e tabela refletem somente vendas reais. Como pedidos e checkout estão reservados à Entrega 5, o painel informa que não há vendas ainda e não inclui valores, clientes ou pedidos demonstrativos.

ADMIN e Funcionário podem cadastrar, listar e editar livros. Livros criados por Funcionário começam não publicados; suas mudanças em livros existentes ficam pendentes até confirmação de ADMIN. Somente ADMIN publica/retira livro ou confirma/rejeita proposta. A edição é estado local, não persiste em query string, e um refresh volta à lista/novo cadastro. Ao cadastrar um livro cujo autor ainda não existe, o formulário abre cadastro rápido; depois de salvar, “Usar este autor no livro” o seleciona. O botão fica ao lado do campo pesquisável de autor e, ao abrir, rola até o cadastro rápido.

Autor e Categoria usam um único campo pesquisável cada, com opções filtradas dentro do próprio menu; categoria continua aceitando texto novo, para preservar o cadastro livre de categorias. Não há uma caixa separada de pesquisa de autor ou categoria.

ADMIN e Funcionário podem cadastrar autores, mas os novos registros ficam não publicados; mudanças de Funcionário em registros existentes precisam de aprovação ADMIN. Somente ADMIN publica/retira autor. Os endereços existentes são preservados ao editar. A lista permite pesquisar por nome e mostra quantos livros existem. Não excluir autor associado a livro.

Autores também são editados em estado local, sem query de edição persistente; ao atualizar a página, o formulário volta ao cadastro e a edição é fechada. Cada mutação verifica no servidor o papel apropriado; usuários, vendas, publicação, aprovação e exclusões permanecem ADMIN-only. Nenhuma alteração desta etapa cria pedidos, registra venda ou concede livros à biblioteca.

## Fotos, capas e arquivos de livro

O Admin aceita foto de autor e capa de livro em JPEG, PNG ou WebP, até 5 MiB por imagem, além de arquivos EPUB ou PDF de até 50 MiB. Os seletores de arquivo ficam visíveis desde o cadastro: é possível escolher a foto/capa/ebook antes de salvar os metadados; após a criação gerar um ID, o botão de envio fica ativo sem sair do formulário. Ao criar autor dentro do formulário do livro, é possível selecionar e enviar sua foto sem abandonar o fluxo.

A pesquisa de autores no formulário de livros filtra as opções imediatamente; a pesquisa em Autores Cadastrados localiza nomes e informa quando não há resultados.

O servidor valida papel ADMIN ou EMPLOYEE conforme o registro: Funcionários só enviam mídia a registros não publicados; ADMIN pode gerir qualquer registro. Extensão, MIME, assinatura do arquivo e tamanho são verificados, usando chaves aleatórias em vez de nomes fornecidos pelo usuário. Fotos e capas são guardadas em `storage/uploads/authors/` e `storage/uploads/covers/`, fora de `public/`, e servidas por uma rota pública restrita a imagens cadastradas. Os e-books ficam em `storage/books/`, também fora de `public/`; o endpoint de download exige sessão e propriedade `LibraryItem` a cada requisição. PDFs podem ser visualizados no leitor; EPUB fica disponível para download protegido.

Os diretórios de uploads locais são ignorados pelo Git. Esse armazenamento em disco atende à execução local atual; as migrations de biblioteca, mídia e equipe serão aplicadas ao MySQL local somente quando estiver acessível. Não enviar uploads ao GitHub nem publicar o site.


## Papéis, aprovação de catálogo e gestão de usuários

- `USER` continua sendo cliente; `EMPLOYEE` é exibido como Funcionário; `ADMIN` é Administrador. A página existente `/admin` mantém as três áreas Vendas, Livros e Autores; a gestão de contas fica em `/admin/usuarios`, disponível apenas para ADMIN.
- Funcionários podem cadastrar livros e autores como não publicados e enviar alterações de registros existentes para revisão. Uma proposta fica pendente e não muda o catálogo até um ADMIN aprová-la; só ADMIN pode aprovar/rejeitar propostas ou publicar/retirar livro/autor. Funcionários não têm ações de exclusão, nem acesso às Vendas ou à gestão de usuários.
- Cada Server Action e Route Handler repete sua autorização no servidor. ADMIN pode promover cliente para Funcionário/Admin e ajustar os papéis; proteger contra auto-rebaixamento e contra remover o último administrador. ADMIN pode excluir livros sem itens de biblioteca e autores sem livros associados, mas nenhuma conta de usuário é excluída.
- Uploads de funcionários ficam permitidos apenas em livros/autores ainda não publicados; alterações de mídia em registros publicados exigem ADMIN. Um livro só pode ser publicado se seu autor estiver publicado; não despublicar autor enquanto possuir livro publicado.
- Ao salvar uma edição direta de ADMIN ou enviar edição de funcionário, fechar o formulário e limpar o estado local; atualizar a página também fecha qualquer edição. Na criação rápida de autor dentro de livro, o botão de envio do autor fica abaixo do seletor de foto. “Usar este autor no livro” seleciona o autor, fecha o cadastro rápido e retorna visualmente ao formulário do livro.
- Persistir o papel `EMPLOYEE`, a publicação do autor e as propostas pendentes em migration aditiva. Seed preserva/autopublica apenas os autores de exemplo já conhecidos; registros de autor criados no Admin começam não publicados. Nenhuma alteração desta etapa implementa checkout ou concede itens de biblioteca.


## Classificação etária e aceite legal — desenvolvimento local

Manter o projeto sem serviços gerenciados, sincronização, publicação ou commit. Usar os Server Actions atuais: exigir no servidor o checkbox de idade/Termos no cadastro e persistir data e versão do aceite; oferecer páginas públicas de Termos de Uso e Política de Privacidade. Considerar o serviço destinado a maiores de 18 anos. No Admin, exigir uma classificação selecionada (`Livre`, `+12`, `+14`, `+16` ou `+18`) na criação e edição do livro; transportar o campo nas propostas de Funcionário e validação de aprovação. Persistir em coluna enum de banco por migration aditiva, preservar como pendentes os registros legados sem classificação em vez de inventar avaliações, mostrar o estado pendente publicamente e impedir a publicação de livro ainda não classificado. Atualizar as rotas declaradas e os links legais do rodapé. Não aplicar migrations, não alterar dados reais nem executar seed.
