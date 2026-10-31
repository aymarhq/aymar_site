'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from '../../../components/Icon';
import styles from '../../50formatos/landing.module.css';

export default function ConfirmMagicLinkForm({ token, redirectTo }: { token: string; redirectTo: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/product-access/consume-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível confirmar o acesso.');
      window.location.assign(redirectTo);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível confirmar o acesso.');
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.accessForm} onSubmit={submit}>
    <button className={styles.checkoutButton} type="submit" disabled={busy}>{busy ? 'Confirmando acesso…' : <>Entrar na biblioteca <ArrowUpRight /></>}</button>
    <small>O link é individual e só pode ser usado uma vez.</small>
    {error && <p className={styles.accessError} role="alert">{error}</p>}
  </form>;
}
