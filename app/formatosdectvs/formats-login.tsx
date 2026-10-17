'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '../../components/BrandLogo';
import styles from './formats.module.css';

export default function FormatsLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/portfolio/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), username: form.get('username'), password: form.get('password') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível entrar.');
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Biblioteca de formatos</span></header>
    <section className={styles.loginLayout}>
      <div><span className={styles.eyebrow}><i /> ACESSO RESERVADO / AYMAR LABS</span><h1>50 formatos.<br /><em>Que escalam.</em></h1><p>Explicações, exemplos reais e bônus para encontrar o próximo formato do seu criativo.</p></div>
      <div className={styles.loginCard}><span className={styles.sectionLabel}>FORMATOS DE CTVS</span><h2>Entre para explorar.</h2>
        {configured ? <form onSubmit={submit} className={styles.form}>
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Username<input name="username" type="text" autoComplete="nickname" pattern="[A-Za-z0-9_.-]{3,24}" title="De 3 a 24 caracteres, sem espaços" placeholder="ex.: pablo.carmo" required /></label>
          <label>Senha de acesso<input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Acessar biblioteca →'}</button>
          {error && <p role="alert" className={styles.error}>{error}</p>}
        </form> : <p>O acesso está sendo preparado.</p>}
        <small>Use o mesmo acesso do portfólio de CTVs.</small>
      </div>
    </section>
  </main>;
}
