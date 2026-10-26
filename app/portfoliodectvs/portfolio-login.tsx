'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowRight } from '../../components/Icon';
import styles from './portfolio.module.css';
import extras from './portfolio-extras.module.css';

export default function PortfolioLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch('/api/portfolio/admin-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.');
      setEmail(''); setUsername(''); setPassword(''); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }

  return <main className={`${styles.page} ${extras.loginPage}`}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" label="Aymar Labs, página inicial" /><span className={styles.headerLabel}>Acesso completo</span></header>
    <section className={extras.loginLayout}><div><span className={styles.eyebrow}><span className={styles.blueDot} /> ÁREA PRIVADA / AYMAR LABS</span><h1>O controle completo <em>dos criativos.</em></h1><p>Entre para administrar sua biblioteca: adicionar, editar e remover vídeos.</p></div>
      <div className={extras.loginCard}><span className={styles.sectionLabel}>ACESSO DO ADMINISTRADOR</span><h2>Área exclusiva.</h2>{configured ? <form onSubmit={submit} className={styles.form}><label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Username<input type="text" autoComplete="nickname" placeholder="ex.: pablo.carmo" pattern="[A-Za-z0-9_.-]{3,24}" title="De 3 a 24 caracteres, sem espaços" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Senha de acesso<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? 'Entrando...' : <>Entrar na área privada <ArrowRight /></>}</button>{error && <p className={styles.notice} role="alert">{error}</p>}</form> : <p className={styles.adminText}>O acesso administrativo ainda não está configurado.</p>}</div>
    </section>
  </main>;
}
