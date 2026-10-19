'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from '../../../components/Icon';
import styles from '../landing.module.css';

export default function ClaimFormatsAccess({ sessionId, email }: { sessionId: string; email: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password !== String(form.get('confirmPassword') ?? '')) {
      setError('As senhas não são iguais. Confira e tente novamente.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/checkout/formatos/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível criar o acesso.');
      window.location.assign('/formatosdectvs');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível criar o acesso.');
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.accessForm} onSubmit={submit}>
    <label>E-mail da compra<input type="email" value={email} readOnly /></label>
    <label>Crie uma senha<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label>
    <label>Confirme a senha<input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label>
    <button className={styles.checkoutButton} type="submit" disabled={busy}>{busy ? 'Criando seu acesso…' : <>Criar acesso à biblioteca <ArrowRight /></>}</button>
    <small>Esse e-mail fica vinculado à compra e será necessário para entrar novamente.</small>
    {error && <p className={styles.accessError} role="alert">{error}</p>}
  </form>;
}
