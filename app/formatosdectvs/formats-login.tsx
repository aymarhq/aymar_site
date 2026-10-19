'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '../../components/BrandLogo';
import { ArrowRight } from '../../components/Icon';
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
      const response = await fetch('/api/checkout/formatos/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
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
        <form onSubmit={submit} className={styles.form}>
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Senha de acesso<input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" disabled={busy}>{busy ? 'Entrando…' : <>Acessar biblioteca <ArrowRight /></>}</button>
          {error && <p role="alert" className={styles.error}>{error}</p>}
        </form>
        {!configured && <p className={styles.error} role="status">O acesso ainda está sendo configurado.</p>}
        <small>Entre com o e-mail da compra e a senha que você criou após o pagamento.</small>
        <small>Comprou agora? Use o link de retorno da Stripe para criar seu acesso.</small>
      </div>
    </section>
  </main>;
}
