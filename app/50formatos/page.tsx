import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '../../components/Icon';
import catalog from '../../lib/creative-formats.json';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: '50 Formatos de Criativos | Aymar Labs',
  description: 'Uma biblioteca com 50 formatos de criativos, explicações e 118 exemplos para tirar suas próximas ideias do papel.',
  alternates: { canonical: 'https://www.aymarlabs.com.br/50formatos' },
};

const exampleCount = catalog.formats.reduce((total, format) => total + format.examples.length, 0);

export default function FormatosLandingPage() {
  return <main className={styles.page} id="top">
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="Aymar Labs — página inicial"><Image src="/aymar-wordmark.png" alt="Aymar Labs" width={3150} height={863} priority /></Link>
      <nav aria-label="Navegação"><a href="#por-dentro">Por dentro</a><Link href="/formatosdectvs">Já tenho acesso <ArrowUpRight /></Link></nav>
    </header>

    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.kicker}><span /> Biblioteca de criativos / Aymar Labs</p>
        <h1 id="hero-title">Seu próximo anúncio não precisa começar <em>do zero.</em></h1>
        <p className={styles.heroText}>Quando falta ideia, não adianta ficar olhando para a tela. Abra uma biblioteca com 50 formatos de criativos, entenda como cada um funciona e veja exemplos antes de gravar o seu.</p>
        <div className={styles.heroActions}><a className={styles.primaryButton} href="#acesso">Quero os 50 formatos <ArrowRight /></a><a className={styles.textLink} href="#por-dentro">Ver o que vem dentro <ArrowUpRight /></a></div>
        <p className={styles.heroFootnote}>Compra avulsa · R$ 19,90</p>
      </div>
      <div className={styles.visual} aria-label="Prévia da biblioteca dos 50 formatos de criativos">
        <div className={styles.visualFrame}>
          <div className={styles.previewBar}><span>aymar</span><span>BIBLIOTECA DE FORMATOS</span><span>BÔNUS ↗</span></div>
          <div className={styles.previewHero}><span className={styles.previewKicker}>● &nbsp; AYMAR LABS / FORMATOS DE CTVS</span><strong>50 formatos.<br /><em>Que escalam.</em></strong><small>50 FORMATOS <b>·</b> {exampleCount} EXEMPLOS</small></div>
          <div className={styles.previewLibrary}><div className={styles.previewLibraryHead}><span>ENCONTRE SEU PRÓXIMO CRIATIVO</span><strong>Todos os formatos<span>.</span></strong></div><div className={styles.previewGrid}>{catalog.formats.slice(0, 6).map((format) => <div key={format.number}><span>{String(format.number).padStart(2, '0')}</span><strong>{format.title}</strong><small>VER FORMATO ↗</small></div>)}</div></div>
        </div>
        <div className={styles.visualIndex}><span>01 / 50</span><span>Um formato diferente muda a forma de contar a mesma história.</span></div>
      </div>
    </section>

    <div className={styles.stats} aria-label="Conteúdo da biblioteca"><div><strong>{catalog.formats.length}</strong><span>formatos de criativos</span></div><div><strong>{exampleCount}</strong><span>exemplos para assistir</span></div><div><strong>1</strong><span>biblioteca para consultar</span></div></div>

    <section className={styles.inside} id="por-dentro" aria-labelledby="inside-title">
      <div className={styles.sectionIntro}><p className={styles.kicker}>O que vem dentro</p><h2 id="inside-title">Ideia boa é a que você consegue <em>colocar em prática.</em></h2></div>
      <div className={styles.insideContent}><p>Você entra, escolhe um formato e vê como ele funciona. Em vez de tentar adivinhar o que gravar, parte de uma estrutura e adapta a mensagem ao seu produto.</p><div className={styles.featureList}><div><span>01</span><strong>50 formatos organizados</strong><p>De caixinha de perguntas a POV e diálogo: várias maneiras de apresentar a sua oferta.</p></div><div><span>02</span><strong>Explicação de cada formato</strong><p>Entenda a lógica do criativo antes de montar o seu roteiro.</p></div><div><span>03</span><strong>118 exemplos</strong><p>Assista às referências e escolha o caminho que faz sentido para a sua campanha.</p></div></div></div>
    </section>

    <section className={styles.offer} id="acesso" aria-labelledby="offer-title"><div className={styles.offerTop}><span>50 FORMATOS DE CRIATIVOS</span><span>AYMAR LABS / ACESSO</span></div><div className={styles.offerGrid}><div><p className={styles.kicker}>Pronto para sair da folha em branco?</p><h2 id="offer-title">Abra a biblioteca.<br /><em>Escolha um formato.</em><br />Crie o próximo.</h2></div><div className={styles.purchase}><p>Você leva acesso à biblioteca com <strong>50 formatos de criativos, explicações de cada estrutura e 118 exemplos</strong> para consultar na hora de criar seus anúncios.</p><div className={styles.price}><span>Pagamento avulso</span><strong>R$ 19,90</strong></div><form action="/api/checkout/formatos" method="post"><button type="submit" className={styles.checkoutButton}>QUERO OS 50 FORMATOS AGORA <ArrowUpRight /></button></form><small>Pagamento seguro com Stripe. O e-mail da compra será seu login.</small></div></div></section>

    <footer className={styles.footer}><Link href="/" aria-label="Aymar Labs — página inicial">AYMAR LABS</Link><span>© {new Date().getFullYear()} Aymar Labs</span></footer>
  </main>;
}
