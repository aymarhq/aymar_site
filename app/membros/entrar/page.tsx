import type { Metadata } from 'next';
import { ArrowUpRight } from '../../../components/Icon';

export const metadata: Metadata = { title: 'Entrar na área de membros — Aymar Labs' };

export default async function MembersLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const errorMessage = erro === 'credenciais' ? 'Login ou senha incorretos. Tente novamente.'
    : erro === 'indisponivel' ? 'O acesso está indisponível no momento. Fale com a equipe Aymar Labs.'
      : null;

  return <div className="members-grid">
    <section className="members-intro" aria-labelledby="members-title">
      <div className="members-eyebrow"><i aria-hidden="true" /> AYMAR LABS / ACESSO RESERVADO</div>
      <h1 id="members-title">Área de<br /><em>membros.</em></h1>
      <p>Seu espaço dentro da Aymar Labs. Entre com o login e a senha de acesso.</p>
      <span className="members-index">01 / ENTRAR</span>
    </section>

    <section className="members-panel" aria-labelledby="members-form-title">
      <div className="members-panel-top"><span>ACESSO</span><span>01 — 02</span></div>
      <h2 id="members-form-title">Entre na sua conta<span>.</span></h2>
      <p className="members-panel-copy">Use as credenciais fornecidas pela Aymar Labs.</p>
      <form action="/api/membros/entrar" method="post" className="members-form">
        <label htmlFor="members-username">Login</label>
        <input id="members-username" name="username" type="text" autoComplete="username" required maxLength={256} />
        <label htmlFor="members-password">Senha</label>
        <input id="members-password" name="password" type="password" autoComplete="current-password" required maxLength={256} />
        {errorMessage && <p className="members-error" role="alert">{errorMessage}</p>}
        <button type="submit">Entrar <ArrowUpRight /></button>
      </form>
      <span className="members-panel-foot">ACESSO PRIVADO · AYMAR LABS</span>
    </section>
  </div>;
}
