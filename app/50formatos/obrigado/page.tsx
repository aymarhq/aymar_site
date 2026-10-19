import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '../../../components/Icon';
import { SUPPORT_URL } from '../../../lib/site-links';
import { formatsCheckoutReady, getFormatsAccount, getPaidFormatsCheckoutSession } from '../../../lib/formats-access';
import ClaimFormatsAccess from './claim-form';
import styles from '../landing.module.css';

export const metadata: Metadata = { title: 'Pedido recebido | Aymar Labs', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ObrigadoPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  let purchase: Awaited<ReturnType<typeof getPaidFormatsCheckoutSession>> = null;
  if (sessionId && formatsCheckoutReady()) {
    try { purchase = await getPaidFormatsCheckoutSession(sessionId); } catch { purchase = null; }
  }
  const existingAccount = purchase?.paymentStatus === 'paid' ? await getFormatsAccount(purchase.email) : null;
  const help = <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>Falar com o suporte <ArrowUpRight /></a>;

  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.logo}>AYMAR LABS</Link></header><section className={styles.thankYou}>
    <p className={styles.kicker}>50 formatos de criativos</p>
    {purchase?.paymentStatus === 'paid' && existingAccount
      ? <><h1>Seu acesso já está <em>criado.</em></h1><p>A compra está vinculada a <strong>{purchase.email}</strong>. Entre com esse e-mail e a senha que você criou.</p><Link href="/formatosdectvs" className={styles.primaryButton}>Entrar na biblioteca <ArrowUpRight /></Link></>
      : purchase?.paymentStatus === 'paid'
        ? <><h1>Pagamento confirmado.<br /><em>Crie seu acesso.</em></h1><p>A Stripe confirmou a compra para <strong>{purchase.email}</strong>. Crie uma senha para vincular a biblioteca a esse e-mail.</p><ClaimFormatsAccess sessionId={purchase.id} email={purchase.email} /></>
        : sessionId && formatsCheckoutReady()
          ? <><h1>Estamos confirmando <em>o pagamento.</em></h1><p>Quando a Stripe confirmar a compra, volte a esta página para criar seu acesso. Se a confirmação já chegou e o acesso não abre, fale com o suporte.</p>{help}<Link href="/50formatos" className={styles.textLink}>Voltar à página do produto <ArrowUpRight /></Link></>
          : <><h1>Não encontramos <em>a compra.</em></h1><p>Abra esta página pelo botão de retorno da Stripe ou fale com o suporte para localizar seu pagamento.</p>{help}<Link href="/formatosdectvs" className={styles.textLink}>Já tenho acesso <ArrowUpRight /></Link></>}
  </section></main>;
}
