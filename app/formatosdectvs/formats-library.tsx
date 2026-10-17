'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowUpRight, Close, Play, Search } from '../../components/Icon';
import type { CreativeFormat, FormatsCatalog } from '../../lib/creative-formats';
import styles from './formats.module.css';

export default function FormatsLibrary({ catalog, username }: { catalog: FormatsCatalog; username: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<CreativeFormat | null>(null);
  const [selectedExample, setSelectedExample] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const bonusSection = useRef<HTMLElement>(null);
  const exampleCount = catalog.formats.reduce((sum, item) => sum + item.examples.length, 0);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return catalog.formats.filter((item) => `${item.number} ${item.title}`.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term));
  }, [catalog.formats, query]);
  const example = active?.examples[selectedExample];

  useEffect(() => {
    const reader = dialog.current;
    if (!reader) return;
    if (active && !reader.open) reader.showModal();
    else if (!active && reader.open) reader.close();
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [active]);

  function openFormat(format: CreativeFormat) {
    setSelectedExample(0); setPlaying(false); setActive(format);
  }
  function selectExample(index: number) { setPlaying(false); setSelectedExample(index); }

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLogo size="sm" className={styles.logo} href="/" />
      <span className={styles.headerLabel}>Biblioteca de formatos</span>
      <nav className={styles.headerNav} aria-label="Navegação da biblioteca"><button onClick={() => bonusSection.current?.scrollIntoView({ behavior: 'smooth' })}>Bônus</button><a href={catalog.supportUrl} target="_blank" rel="noopener noreferrer">Suporte <ArrowUpRight /></a>{catalog.groupUrl && <a href={catalog.groupUrl} target="_blank" rel="noopener noreferrer">Grupo <ArrowUpRight /></a>}</nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.eyebrow}><i /> AYMAR LABS / FORMATOS DE CTVS</div>
      <div className={styles.heroGrid}><h1>50 formatos.<br /><em>Que escalam.</em></h1><p>Uma biblioteca para abrir o leque dos seus criativos. Explore cada formato, entenda a proposta e assista aos exemplos.</p></div>
      <div className={styles.heroMeta}><span>{catalog.formats.length} FORMATOS <i /> {exampleCount} EXEMPLOS <i /> {catalog.bonuses.length} BÔNUS</span><span>@{username}</span></div>
    </section>

    <section className={styles.library} aria-label="Formatos de criativos">
      <div className={styles.toolbar}><div><span className={styles.sectionLabel}>ENCONTRE SEU PRÓXIMO CRIATIVO</span><h2>Todos os formatos<span>.</span></h2></div><label className={styles.search}><Search /><input aria-label="Buscar formato" placeholder="Buscar formato…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="Limpar busca"><Close /></button>}</label></div>
      <p className={styles.resultCount} aria-live="polite">{filtered.length} de {catalog.formats.length} formatos</p>
      <div className={styles.grid}>{filtered.map((format) => <button key={format.number} type="button" className={styles.card} onClick={() => openFormat(format)} aria-label={`Ver formato ${format.number}: ${format.title}`} data-format-number={format.number}>
        <span className={styles.cardTop}><span>{String(format.number).padStart(2, '0')}</span><span className={styles.cardArrow} aria-hidden="true"><ArrowUpRight /></span></span>
        <h3>{format.title}</h3><span className={styles.cardBottom}>VER FORMATO <span>{format.examples.length} EXEMPLO{format.examples.length === 1 ? '' : 'S'}</span></span>
      </button>)}</div>
      {!filtered.length && <div className={styles.empty}><p>Nenhum formato com esse nome.</p><button onClick={() => setQuery('')}>Ver todos os formatos <ArrowUpRight /></button></div>}
    </section>

    <section ref={bonusSection} className={styles.bonuses} aria-labelledby="bonus-title"><span className={styles.sectionLabel}>PARA CONTINUAR CRIANDO</span><h2 id="bonus-title">Os bônus<span>.</span></h2>
      <div className={styles.bonusGrid}>{catalog.bonuses.map((bonus) => {
        const content = <><div className={styles.bonusTop}><span>{bonus.number}</span>{bonus.url && <span aria-hidden="true"><ArrowUpRight /></span>}</div><div className={styles.bonusImage}><Image src={bonus.image} alt="" fill sizes="(max-width: 760px) 45vw, 25vw" /></div><h3>{bonus.title}</h3>{bonus.url && <span className={styles.bonusLink}>ACESSAR BÔNUS <ArrowUpRight /></span>}</>;
        return bonus.url?.startsWith('/')
          ? <Link href={bonus.url} key={bonus.number} className={styles.bonusCard} data-bonus-number={bonus.number}>{content}</Link>
          : bonus.url
            ? <a href={bonus.url} target="_blank" rel="noopener noreferrer" key={bonus.number} className={styles.bonusCard} data-bonus-number={bonus.number}>{content}</a>
          : <div key={bonus.number} className={styles.bonusCard} data-bonus-number={bonus.number}>{content}</div>;
      })}</div>
    </section>

    <footer className={styles.footer}><div><span>© {new Date().getFullYear()} Aymar Labs</span><small>Conteúdo do acervo Serraglio / DVN Copy, reproduzido com autorização.</small></div><div className={styles.footerLinks}><Link href="/portfoliodectvs">Portfólio de CTVs <ArrowUpRight /></Link><Link href="/promptsmotion">Prompts Motion <ArrowUpRight /></Link><button onClick={async () => { await fetch('/api/portfolio/session', { method: 'DELETE' }); router.refresh(); }}>Sair</button></div></footer>

    <dialog ref={dialog} className={styles.dialog} aria-labelledby="format-title" onClose={() => { setActive(null); setPlaying(false); }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {active && <div className={styles.dialogInner}>
        <div className={styles.dialogHead}><div><span className={styles.sectionLabel}>FORMATO {String(active.number).padStart(2, '0')}</span><h2 id="format-title">{active.title}</h2></div><button className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fechar formato"><Close /></button></div>
        <p className={styles.description}>{active.description}</p>
        <div className={styles.examples}><div className={styles.exampleHead}><h3>Exemplos<span>.</span></h3><span>{selectedExample + 1} / {active.examples.length}</span></div>
          {example && <div className={styles.exampleShell}>
            <div className={styles.media}>
              {playing ? <iframe key={example.id} src={`https://drive.google.com/file/d/${example.id}/preview`} title={`${active.title} — exemplo ${selectedExample + 1}`} allow="autoplay; fullscreen" allowFullScreen /> : <button className={styles.poster} onClick={() => setPlaying(true)} aria-label={example.type === 'image' ? 'Abrir imagem de exemplo' : 'Assistir exemplo'}>
                <Image key={example.id} src={`https://drive.google.com/thumbnail?id=${example.id}&sz=w1000`} alt={example.name} fill unoptimized sizes="(max-width: 760px) 100vw, 800px" /><span className={styles.play} aria-hidden="true"><Play /></span><span className={styles.watchLabel}>{example.type === 'image' ? 'TOQUE PARA VER A IMAGEM' : 'TOQUE PARA ASSISTIR'}</span>
              </button>}
            </div>
            <div className={styles.exampleControls}><div className={styles.dots} aria-hidden="true">{active.examples.map((item, index) => <i key={item.id} className={index === selectedExample ? styles.dotActive : ''} />)}</div><div className={styles.exampleButtons} role="group" aria-label="Selecionar exemplo">{active.examples.map((item, index) => <button key={item.id} onClick={() => selectExample(index)} aria-pressed={selectedExample === index}>Exemplo {index + 1}</button>)}</div></div>
          </div>}
          <div className={styles.exampleLinks}>{example && <a href={`https://drive.google.com/file/d/${example.id}/view`} target="_blank" rel="noopener noreferrer">Abrir exemplo no Drive <ArrowUpRight /></a>}<a href={active.examplesUrl} target="_blank" rel="noopener noreferrer">Abrir pasta de exemplos <ArrowUpRight /></a></div>
        </div>
      </div>}
    </dialog>
  </main>;
}
