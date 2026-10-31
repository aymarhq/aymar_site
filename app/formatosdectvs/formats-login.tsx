'use client';

import { useState, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowRight } from '../../components/Icon';
import styles from './formats.module.css';

export default function FormatsLogin({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/product-access/request-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o link.');
      setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar o link.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Biblioteca de formatos</span></header>
    <section className={styles.loginLayout}>
      <div><span className={styles.eyebrow}><i /> ACESSO RESERVADO / AYMAR LABS</span><h1>50 formatos.<br /><em>Que escalam.</em></h1><p>Explicações, exemplos reais e bônus para encontrar o próximo formato do seu criativo.</p></div>
      <div className={styles.loginCard}><span className={styles.sectionLabel}>FORMATOS DE CTVS</span><h2>Entre para explorar.</h2>
        <form onSubmit={submit} className={styles.form}>
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <button type="submit" disabled={busy || !configured}>{busy ? 'Enviando link…' : <>Enviar link de acesso <ArrowRight /></>}</button>
          {error && <p role="alert" className={styles.error}>{error}</p>}
        </form>
        {sent && <p role="status" className={styles.status}>Se este e-mail estiver liberado, enviamos um link de acesso. Confira sua caixa de entrada, Spam e Promoções.</p>}
        {!configured && <p className={styles.error} role="status">O acesso ainda está sendo configurado.</p>}
        <small>O link é válido por 15 minutos e pode ser usado uma única vez.</small>
      </div>
    </section>
  </main>;
}
