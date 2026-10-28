import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '../../components/Icon';
import catalog from '../../lib/creative-formats.json';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: '50 Formatos de CTVs | Aymar Labs',
  description: 'Acesse 50 formatos de CTVs, 118 exemplos e bônus para criar novas versões dos seus criativos. Oferta especial de Black Friday.',
  alternates: { canonical: 'https://www.aymarlabs.com.br/50formatos' },
};

const checkoutUrl = 'https://dvncopy.com/50f/';
const exampleCount = catalog.formats.reduce((total, format) => total + format.examples.length, 0);

const examples = [
  { src: '/videos/ctv_ugc_paletas.jpg', label: 'UGC · alimentação', alt: 'Criativo em vídeo de uma empreendedora mostrando paletas artesanais' },
  { src: '/videos/ctv_copy1_bolo.jpg', label: 'Storytelling · confeitaria', alt: 'Criativo de uma empreendedora apresentando sobremesas em uma feira' },
  { src: '/videos/ctv1_2.jpg', label: 'POV · educação', alt: 'Criativo em vídeo com material de estudo e notebook sobre uma mesa' },
];

const benefits = [
  { number: '01', title: 'Mais jeitos de contar a mesma oferta', text: 'Saia do roteiro único e experimente abordagens diferentes para apresentar seu produto.' },
  { number: '02', title: 'Criativos que parecem conteúdo', text: 'Use estruturas nativas do feed para abrir a conversa sem cara de anúncio tradicional.' },
  { number: '03', title: 'Referências para tirar do papel', text: 'Veja exemplos reais e entenda a lógica por trás de cada formato antes de gravar.' },
  { number: '04', title: 'Um processo que pode usar IA', text: 'Aplique os formatos como ponto de partida e use IA para acelerar pesquisa e produção.' },
];

const faqs = [
  { question: 'Funciona para qualquer nicho?', answer: 'Os formatos são estruturas adaptáveis a diferentes produtos e mercados. Você ajusta a linguagem, a promessa e os exemplos à realidade da sua oferta.' },
  { question: 'O que eu recebo?', answer: 'Acesso à biblioteca com 50 formatos, explicações de cada estrutura, 118 exemplos e os bônus listados nesta página.' },
  { question: 'Vou receber roteiros prontos?', answer: 'O material ensina formatos e traz referências para você adaptar. A proposta não é entregar um roteiro universal que sirva igual para toda oferta.' },
  { question: 'Como funciona a garantia?', answer: 'Você tem 7 dias para conhecer o material. Se decidir que não é para você, solicite o reembolso dentro desse prazo, conforme as condições apresentadas na página de acesso.' },
];

export default function FormatosLandingPage() {
  return (
    <main className={styles.page} id="top">
      <div className={styles.promoBar}>
        <span>Condição especial de Black Friday</span>
        <a href="#oferta">50 formatos por R$ 29,90 <ArrowRight /></a>
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Aymar Labs — página inicial">
          <Image src="/aymar-wordmark.png" alt="Aymar Labs" width={3150} height={863} priority />
        </Link>
        <nav aria-label="Navegação principal">
          <a href="#conteudo">O que você recebe</a>
          <a href="#perguntas">Dúvidas</a>
          <Link href="/ds">Já tenho acesso <ArrowUpRight /></Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> 50 formatos de CTVs · Aymar Labs</p>
          <h1 id="hero-title">Sua oferta pode ser a mesma. <em>O formato, não.</em></h1>
          <p className={styles.heroText}>Quando o criativo começa a cansar, trocar só algumas palavras nem sempre resolve. Tenha 50 formatos para apresentar sua oferta de outros jeitos, com exemplos para estudar e adaptar ao seu nicho.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={checkoutUrl} target="_blank" rel="noopener noreferrer">Quero acessar por R$ 29,90 <ArrowRight /></a>
            <a className={styles.secondaryLink} href="#conteudo">Ver tudo o que vem dentro <ArrowUpRight /></a>
          </div>
          <p className={styles.heroTerms}>Acesso vitalício <span>·</span> 7 dias de garantia</p>
        </div>

        <div className={styles.heroVisual} aria-label="Exemplos de criativos em diferentes formatos">
          <div className={styles.visualGlow} />
          <div className={styles.visualLabel}><span>AMOSTRAS DA BIBLIOTECA</span><span>01 — 03</span></div>
          <div className={styles.imageStack}>
            {examples.map((example, index) => (
              <div className={`${styles.exampleCard} ${styles[`exampleCard${index + 1}`]}`} key={example.src}>
                <Image src={example.src} alt={example.alt} fill priority={index === 0} sizes="(max-width: 760px) 38vw, 20vw" />
                <span>{example.label}</span>
              </div>
            ))}
            <div className={styles.formatBadge}><strong>50</strong><span>formatos<br />para testar</span></div>
          </div>
          <p className={styles.visualCaption}>Novas formas de apresentar a mesma oferta — sem começar do zero.</p>
        </div>
      </section>

      <section className={styles.metrics} aria-label="O que está incluído">
        <div><strong>50</strong><span>formatos de CTVs</span></div>
        <div><strong>{exampleCount}</strong><span>exemplos para consultar</span></div>
        <div><strong>7 dias</strong><span>para conhecer o material</span></div>
      </section>

      <section className={styles.shift} aria-labelledby="shift-title">
        <div className={styles.shiftHeading}>
          <p className={styles.eyebrow}>A ideia por trás dos formatos</p>
          <h2 id="shift-title">Às vezes, a mudança está em <em>como você conta.</em></h2>
        </div>
        <div className={styles.shiftBody}>
          <p className={styles.shiftLead}>Você já tem a oferta. Agora, precisa de novas maneiras de fazer alguém parar, prestar atenção e entender por que ela importa.</p>
          <div className={styles.benefitGrid}>
            {benefits.map((benefit) => (
              <article className={styles.benefit} key={benefit.number}>
                <span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.examplesSection} aria-labelledby="examples-title">
        <div className={styles.examplesIntro}>
          <p className={styles.eyebrow}>De diferentes mercados</p>
          <h2 id="examples-title">Veja formatos em ação.</h2>
          <p>Referências de criativos em nichos diferentes para observar ritmo, enquadramento e jeito de apresentar a ideia.</p>
        </div>
        <div className={styles.examplesGrid}>
          {examples.map((example, index) => (
            <figure className={styles.exampleTile} key={example.src}>
              <div className={styles.exampleImage}><Image src={example.src} alt={example.alt} fill sizes="(max-width: 700px) 88vw, 28vw" /></div>
              <figcaption><span>EXEMPLO 0{index + 1}</span><strong>{example.label}</strong></figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.exampleNote}>As imagens são referências de criativos. O desempenho depende da oferta, do público, da execução e do investimento de cada campanha.</p>
      </section>

      <section className={styles.included} id="conteudo" aria-labelledby="included-title">
        <div className={styles.includedIntro}>
          <p className={styles.eyebrow}>O que você vai receber</p>
          <h2 id="included-title">Uma biblioteca para transformar referência em <em>próximo teste.</em></h2>
          <p>Consulte, escolha um caminho e adapte para o seu produto. Sem fórmula mágica — com repertório para criar com mais intenção.</p>
        </div>
        <div className={styles.includedList}>
          <article><span>01</span><div><h3>50 formatos de CTVs</h3><p>Estruturas diferentes para demonstrar, narrar, comparar, responder e vender.</p></div></article>
          <article><span>02</span><div><h3>{exampleCount} exemplos organizados</h3><p>Referências para entender como cada formato pode ganhar vida em um criativo.</p></div></article>
          <article><span>03</span><div><h3>Explicação de cada formato</h3><p>Veja a lógica, a dinâmica e como adaptar a estrutura ao contexto da sua oferta.</p></div></article>
        </div>
      </section>

      <section className={styles.bonuses} aria-labelledby="bonus-title">
        <div className={styles.bonusHeading}>
          <p className={styles.eyebrow}>E ainda tem mais</p>
          <h2 id="bonus-title">Bônus para ajudar você a <em>colocar em prática.</em></h2>
        </div>
        <div className={styles.bonusGrid}>
          {catalog.bonuses.map((bonus) => (
            <article className={styles.bonusCard} key={bonus.number}>
              <div className={styles.bonusImage}><Image src={bonus.image} alt="" fill sizes="(max-width: 700px) 40vw, 18vw" /></div>
              <div className={styles.bonusCopy}><span>BÔNUS {bonus.number}</span><h3>{bonus.title}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.offer} id="oferta" aria-labelledby="offer-title">
        <div className={styles.offerTop}><span>BLACK FRIDAY · ACESSO VITALÍCIO</span><span>AYMAR LABS / 50 FORMATOS</span></div>
        <div className={styles.offerGrid}>
          <div className={styles.offerCopy}>
            <p className={styles.eyebrow}>Seu próximo criativo começa aqui</p>
            <h2 id="offer-title">Mais repertório.<br /><em>Novos formatos.</em><br />Mais testes.</h2>
            <p>Tenha os 50 formatos, os exemplos e os bônus em uma biblioteca para consultar sempre que precisar pensar no próximo criativo.</p>
          </div>
          <div className={styles.purchaseCard}>
            <p className={styles.purchaseLabel}>Oferta especial de Black Friday</p>
            <p className={styles.wasPrice}>De <s>R$ 47,00</s> por</p>
            <p className={styles.price}>R$ <strong>29</strong><span>,90</span></p>
            <p className={styles.lifetime}>Pagamento único <span>·</span> Acesso vitalício</p>
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={styles.checkoutButton}>QUERO ACESSAR AGORA <ArrowUpRight /></a>
            <div className={styles.guarantee}><span>7</span><p><strong>7 dias de garantia</strong><br />Explore o material. Se não fizer sentido para você, solicite o reembolso dentro do prazo.</p></div>
            <small className={styles.checkoutNote}>A página de acesso temporária abre em uma nova aba.</small>
          </div>
        </div>
      </section>

      <section className={styles.faq} id="perguntas" aria-labelledby="faq-title">
        <div className={styles.faqHeading}><p className={styles.eyebrow}>Antes de acessar</p><h2 id="faq-title">Perguntas frequentes.</h2></div>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details key={faq.question} className={styles.faqItem}>
              <summary><span>0{index + 1}</span><strong>{faq.question}</strong><i>+</i></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}><Link href="/" aria-label="Aymar Labs — página inicial">AYMAR LABS</Link><a href="#top">Voltar ao topo ↑</a></div>
        <p>© {new Date().getFullYear()} Aymar Labs. Os exemplos apresentados não garantem resultados futuros. O desempenho varia conforme oferta, público, investimento e execução.</p>
      </footer>
    </main>
  );
}
