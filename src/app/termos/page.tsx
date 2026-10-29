import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <article className="legal-page">
      <p className="tag">Informações legais</p>
      <h1>Termos de Uso</h1>
      <p className="muted">Estes termos explicam as condições de uso da livraria digital.</p>

      <section>
        <h2>1. Idade mínima</h2>
        <p>O serviço, o cadastro de conta e as compras da livraria são destinados exclusivamente a pessoas com 18 anos ou mais. Ao criar uma conta, você declara ter mais de 18 anos e concorda com estes Termos. A classificação indicativa de cada livro informa a recomendação específica de leitura, mas não reduz a idade mínima exigida para utilizar o serviço.</p>
      </section>
      <section>
        <h2>2. Conta e segurança</h2>
        <p>Forneça dados corretos ao criar sua conta e mantenha suas credenciais em segurança. Você é responsável pelas atividades realizadas por meio da sua sessão. A livraria pode restringir o acesso quando houver uso indevido ou violação destes termos.</p>
      </section>
      <section>
        <h2>3. Livros digitais</h2>
        <p>Os títulos disponíveis podem ser lidos no site ou baixados nos formatos indicados na página de cada livro, quando os arquivos estiverem disponíveis. A classificação indicativa aparece junto à descrição do título; recomenda-se observá-la antes da leitura.</p>
      </section>
      <section>
        <h2>4. Catálogo e disponibilidade</h2>
        <p>O catálogo, os formatos e a disponibilidade dos arquivos podem mudar. O site não deve ser usado para copiar, distribuir ou disponibilizar publicamente obras sem autorização dos titulares dos direitos.</p>
      </section>
      <section>
        <h2>5. Atualizações e contato</h2>
        <p>Estes termos podem ser atualizados para refletir mudanças no serviço. A versão vigente será publicada nesta página. Para dúvidas sobre estes termos, utilize os canais oficiais de atendimento da livraria.</p>
      </section>
    </article>
  );
}
