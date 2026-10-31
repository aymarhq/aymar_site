import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '../../../components/Icon';
import { getProductLoginTicket, productAccessProducts } from '../../../lib/product-access';
import ConfirmMagicLinkForm from './confirm-form';
import styles from '../../50formatos/landing.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entrar | Aymar Labs', robots: { index: false, follow: false } };

export default async function ConfirmAccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  let ticket: Awaited<ReturnType<typeof getProductLoginTicket>> = null;
  if (token) {
    try { ticket = await getProductLoginTicket(token); } catch { ticket = null; }
  }

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.logo}>AYMAR LABS</Link></header>
    <section className={styles.thankYou}>
      {ticket ? <>
        <p className={styles.kicker}>ACESSO INDIVIDUAL / AYMAR LABS</p>
        <h1>Confirme seu <em>acesso.</em></h1>
        <p>Este link foi enviado para <strong>{ticket.email}</strong> e libera {productAccessProducts[ticket.product].label}.</p>
        <ConfirmMagicLinkForm token={token} redirectTo={productAccessProducts[ticket.product].path} />
      </> : <>
        <p className={styles.kicker}>AYMAR LABS / ACESSO</p>
        <h1>Este link não está <em>mais válido.</em></h1>
        <p>Links expiram em 15 minutos ou depois do primeiro uso. Volte à biblioteca para solicitar outro.</p>
        <Link href="/ds" className={styles.textLink}>Voltar à biblioteca <ArrowUpRight /></Link>
      </>}
    </section>
  </main>;
}
