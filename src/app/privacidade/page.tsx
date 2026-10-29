import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <p className="tag">Informações legais</p>
      <h1>Política de Privacidade</h1>
      <p className="muted">Esta página descreve os dados usados para operar a conta e a biblioteca digital.</p>

      <section>
        <h2>1. Idade mínima</h2>
        <p>O serviço e o cadastro são destinados exclusivamente a pessoas com 18 anos ou mais. A classificação indicada em cada livro é uma recomendação de leitura e não altera a idade mínima para usar a plataforma.</p>
      </section>
      <section>
        <h2>2. Dados tratados</h2>
        <p>Para criar e manter uma conta, o site trata nome, endereço de e-mail e senha. A senha é armazenada como hash protegido, não como texto legível. Para manter a autenticação, são registrados dados técnicos da sessão. O aceite dos Termos de Uso é associado à data e à versão aceita.</p>
      </section>
      <section>
        <h2>3. Finalidades e armazenamento</h2>
        <p>Esses dados são utilizados para autenticar a conta, oferecer as funções de biblioteca digital, manter a segurança das sessões e registrar o aceite dos termos. O catálogo e os arquivos digitais são mantidos em armazenamento próprio do serviço; arquivos de livros protegidos não são expostos como downloads públicos.</p>
      </section>
      <section>
        <h2>4. Pagamentos</h2>
        <p>O checkout atualmente exibido no site é demonstrativo e não confirma pagamentos nem libera livros. Não informe dados reais de cartão nessa interface.</p>
      </section>
      <section>
        <h2>5. Direitos e contato</h2>
        <p>Você pode solicitar informações ou exercer direitos relativos aos seus dados pelos canais oficiais de atendimento da livraria. A política poderá ser atualizada; a versão vigente estará publicada nesta página.</p>
      </section>
    </article>
  );
}
