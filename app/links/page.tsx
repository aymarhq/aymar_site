import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './links.module.css';

export const metadata: Metadata = {
  title: 'Pablo Carmo | Aymar Labs, Degrau Hub e Escala Hub',
  description: 'Criativos, mineração de ofertas e estrutura para operações digitais.',
  alternates: { canonical: 'https://www.aymarlabs.com.br/links' },
  openGraph: {
    title: 'Pablo Carmo — minhas operações',
    description: 'Criativos, mineração de ofertas e estrutura para operações digitais.',
    url: 'https://www.aymarlabs.com.br/links',
    siteName: 'Aymar Labs',
    type: 'website',
  },
};

const destinations = [
  {
    number: '01',
    name: 'Aymar Labs',
    handle: '@aymarlabs',
    description: 'Criativos para ofertas de X1 Low Ticket.',
    action: 'Conhecer a Aymar Labs',
    href: '/portfoliodectvs',
    accent: 'blue',
  },
  {
    number: '02',
    name: 'Degrau Hub',
    handle: '@degrau.hub',
    description: 'Mineração de ofertas e organização da operação.',
    action: 'Conhecer a Degrau',
    href: 'https://degrau-hub-app.web.app/',
    accent: 'lime',
  },
  {
    number: '03',
    name: 'Escala Hub',
    handle: '@escala.hub',
    description: 'BMs verificadas e API oficial do WhatsApp.',
    action: 'Conhecer a Escala',
    href: 'https://escala-hub-catalogo.contatos-aymar.chatgpt.site/',
    accent: 'white',
  },
];

export default function LinksPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label="Aymar Labs — página inicial">
            <Image src="/brand/aymar-mark.svg" alt="" width={42} height={42} priority />
            <span>AYMAR LABS</span>
          </Link>
          <span className={styles.headerNote}>PABLO CARMO · OPERAÇÕES</span>
        </header>

        <section className={styles.intro} aria-labelledby="page-title">
          <p className={styles.eyebrow}><span /> MEUS PROJETOS</p>
          <h1 id="page-title">Por onde<br /><em>quer começar?</em></h1>
          <p className={styles.lede}>Criativos, ofertas e estrutura para crescer no digital.</p>
        </section>

        <nav className={styles.cards} aria-label="Projetos do Pablo Carmo">
          {destinations.map((item) => (
            <a
              className={`${styles.card} ${styles[item.accent]}`}
              href={item.href}
              key={item.name}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <span className={styles.cardNumber}>{item.number}</span>
              <span className={styles.cardBody}>
                <span className={styles.cardHeading}>
                  <strong>{item.name}</strong>
                  <span className={styles.handle}>{item.handle}</span>
                </span>
                <span className={styles.description}>{item.description}</span>
                <span className={styles.action}>{item.action}<span aria-hidden="true">↗</span></span>
              </span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>

        <footer className={styles.footer}>
          <span>CRIAR · TESTAR · VALIDAR</span>
          <a href="https://www.aymarlabs.com.br">AYMARLABS.COM.BR <span aria-hidden="true">↗</span></a>
        </footer>
      </div>
    </main>
  );
}
