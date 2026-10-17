import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Área de membros — Aymar Labs' };

export default function MembersHomePage() {
  return <div className="members-grid members-grid-inside">
    <section className="members-intro" aria-labelledby="members-title">
      <div className="members-eyebrow"><i aria-hidden="true" /> AYMAR LABS / ACESSO LIBERADO</div>
      <h1 id="members-title">Bem-vindo<br /><em>à área.</em></h1>
      <p>Você entrou na área de membros da Aymar Labs.</p>
      <span className="members-index">02 / MEMBROS</span>
    </section>

    <section className="members-panel members-empty" aria-labelledby="members-empty-title">
      <div className="members-panel-top"><span>ÁREA DE MEMBROS</span><span>02 — 02</span></div>
      <div className="members-empty-symbol" aria-hidden="true"><span /></div>
      <h2 id="members-empty-title">Seu espaço está pronto<span>.</span></h2>
      <p className="members-panel-copy">Os conteúdos desta área serão adicionados em breve.</p>
      <form action="/api/membros/sair" method="post"><button className="members-logout" type="submit">Sair da conta <span aria-hidden="true">↗</span></button></form>
      <span className="members-panel-foot">ACESSO PRIVADO · AYMAR LABS</span>
    </section>
  </div>;
}
