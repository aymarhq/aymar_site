import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '../../../components/Icon';
import { SUPPORT_URL } from '../../../lib/site-links';
import styles from '../landing.module.css';

export const metadata: Metadata = { title: 'Pedido recebido | Aymar Labs', robots: { index: false, follow: false } };

export default function ObrigadoPage() {
  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.logo}>AYMAR LABS</Link></header>
    <section className={styles.thankYou}>
      <p className={styles.kicker}>PEDIDO / AYMAR LABS</p>
      <h1>Pedido recebido.<br /><em>Confira seu e-mail.</em></h1>
      <p>A Cakto vai confirmar o pagamento e, em seguida, enviaremos o link de acesso para o e-mail informado na compra. Confira também as pastas Spam e Promoções do Gmail.</p>
      <p>Quando o e-mail chegar, abra o link para ativar seu acesso. Depois, entre na biblioteca usando somente seu e-mail.</p>
      <p><a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>Falar com o suporte <ArrowUpRight /></a></p>
      <Link href="/ds" className={styles.textLink}>Já tenho acesso <ArrowUpRight /></Link>
    </section>
  </main>;
}
