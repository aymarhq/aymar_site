import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '../../../components/Icon';
import { productAccessProducts, getActivationForToken, getProductAccount } from '../../../lib/product-access';
import ActivationForm from './activation-form';
import styles from '../../50formatos/landing.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Ativar acesso | Aymar Labs', robots: { index: false, follow: false } };

export default async function ActivateAccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  let ticket: Awaited<ReturnType<typeof getActivationForToken>> = null;
  if (token) {
    try { ticket = await getActivationForToken(token); } catch { ticket = null; }
  }
  let account: Awaited<ReturnType<typeof getProductAccount>> = null;
  if (ticket) {
    try { account = await getProductAccount(ticket.email); } catch { account = null; }
  }

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.logo}>AYMAR LABS</Link></header>
    <section className={styles.thankYou}>
      {ticket ? <>
        <p className={styles.kicker}>ACESSO INDIVIDUAL / AYMAR LABS</p>
        <h1>{account ? <>Sua conta está <em>pronta.</em></> : <>Ative seu <em>acesso.</em></>}</h1>
        <p>Este convite foi enviado para <strong>{ticket.email}</strong>. Ele libera:</p>
        <ul>{ticket.products.map((product) => <li key={product}>{productAccessProducts[product].label}</li>)}</ul>
        {account && <p>Seu e-mail já tem conta. Ao confirmar, estes produtos serão adicionados e a sessão anterior será encerrada.</p>}
        <ActivationForm token={token} existingAccount={Boolean(account)} />
      </> : <>
        <p className={styles.kicker}>AYMAR LABS / ACESSO</p>
        <h1>Este link não está <em>mais válido.</em></h1>
        <p>Links de ativação expiram em 48 horas ou depois do primeiro uso. Confira seu e-mail mais recente ou fale com o suporte.</p>
        <Link href="/50formatos" className={styles.textLink}>Voltar aos produtos <ArrowUpRight /></Link>
      </>}
    </section>
  </main>;
}
