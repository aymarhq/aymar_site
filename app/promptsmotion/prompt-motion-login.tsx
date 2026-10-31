'use client';

import { useState, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowRight } from '../../components/Icon';
import styles from './prompt-motion.module.css';

export default function PromptMotionLogin({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/product-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), product: 'promptsmotion' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o link.');
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível enviar o link.');
    } finally {
      setBusy(false);
    }
  }

  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Prompt Motion</span></header>
    <section className={styles.accessLayout}>
      <div>
        <span className={styles.eyebrow}><i /> ACESSO RESERVADO / AYMAR LABS</span>
        <h1>Veja o motion.<br /><em>Copie o prompt.</em></h1>
        <p>Explore referências, previews e prompts para criar motions com IA.</p>
      </div>
      <div className={styles.accessCard}>
        <span>ACESSO PROMPT MOTION</span>
        <h2>Entre para explorar.</h2>
        <form onSubmit={submit}>
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <button type="submit" disabled={busy || !configured}>{busy ? 'Enviando link…' : <>Enviar link de acesso <ArrowRight /></>}</button>
          {error && <p role="alert">{error}</p>}
        </form>
        {sent && <p role="status">Se este e-mail estiver liberado, enviamos um link de acesso. Confira sua caixa de entrada, Spam e Promoções.</p>}
        {!configured && <p role="status">O acesso ainda está sendo configurado.</p>}
        <small>O link expira em 15 minutos e só pode ser usado uma única vez.</small>
      </div>
    </section>
  </main>;
}
