'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styles from './portfolio.module.css';
import extras from './portfolio-extras.module.css';

export default function PortfolioLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch('/api/portfolio/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.');
      setEmail(''); setPassword(''); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }

  return <main className={`${styles.page} ${extras.loginPage}`}>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Aymar Labs, página inicial">aymar<span>.</span></Link><span className={styles.headerLabel}>Área de criativos</span></header>
    <section className={extras.loginLayout}><div><span className={styles.eyebrow}><span className={styles.blueDot} /> ACESSO RESERVADO / AYMAR LABS</span><h1>O trabalho por trás <em>do resultado.</em></h1><p>Nosso portfólio de criativos, organizado por oferta. Entre para explorar os vídeos.</p></div>
      <div className={extras.loginCard}><span className={styles.sectionLabel}>PORTFÓLIO DE CTVS</span><h2>Entre para continuar.</h2>{configured ? <form onSubmit={submit} className={styles.form}><label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Senha de acesso<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar no portfólio →'}</button>{error && <p className={styles.notice} role="alert">{error}</p>}</form> : <p className={styles.adminText}>Esta área está sendo preparada. O acesso será liberado em breve.</p>}</div>
    </section>
  </main>;
}
