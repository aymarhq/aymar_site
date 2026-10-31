'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from '../../../components/Icon';
import styles from '../../50formatos/landing.module.css';

export default function ActivationForm({ token, existingAccount }: { token: string; existingAccount: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/product-access/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível ativar o acesso.');
      window.location.assign(result.products?.includes('formatos') ? '/formatosdectvs' : result.products?.includes('legendas') ? '/legendas' : '/promptsmotion');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível ativar o acesso.');
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.accessForm} onSubmit={submit}>
    <button className={styles.checkoutButton} type="submit" disabled={busy}>{busy ? 'Ativando seu acesso…' : <>{existingAccount ? 'Adicionar produtos à minha conta' : 'Ativar meu acesso'} <ArrowUpRight /></>}</button>
    <small>O link é individual, expira em 48 horas e só pode ser usado uma vez. Depois, entre usando seu e-mail.</small>
    {error && <p className={styles.accessError} role="alert">{error}</p>}
  </form>;
}
