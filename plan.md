

## Reorganização do Admin em Vendas, Livros e Autores

- A página protegida `/admin` apresenta navegação e seções separadas para **Vendas**, **Livros** e **Autores**, reaproveitando o layout, a paleta e os controles existentes.
- Vendas abre com o mês atual. O administrador pode informar datas de início e fim, com validação que impede intervalo negativo ou superior a 90 dias. Gráfico e tabela refletem somente vendas reais. Como pedidos e checkout estão reservados à Entrega 5, o painel informa que não há vendas ainda e não inclui valores, clientes ou pedidos demonstrativos.
- Livros permite cadastrar, listar, editar, publicar e retirar livros do catálogo. Ao cadastrar um livro cujo autor ainda não existe, o formulário abre cadastro rápido de autor; depois de salvar, o administrador seleciona a ação “Usar este autor no livro” para inseri-lo no livro.
- Autores permite cadastrar, listar e editar nome, biografia e cor de perfil; os endereços existentes são preservados ao editar. A lista mostra quantos livros há e quais perfis já têm livros publicados. Não remover autores associados a livros.
- Todas as mutações administrativas verificam o papel `ADMIN` no servidor. Nenhuma alteração desta etapa cria pedidos, registra venda ou concede livros à biblioteca.
