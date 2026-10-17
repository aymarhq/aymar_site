'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import { MOTION_SOURCE, motionCategories, type MotionEntry } from '../../lib/prompt-motion-shared';
import styles from './prompt-motion.module.css';

type LibraryView = 'gallery' | 'templates' | 'customize';
const categoryNames: Record<string, string> = Object.fromEntries(motionCategories);

type PromptDetails = { prompt?: string; skillDescription?: string; skillCommand?: string };

function markupText(markup: string | null | undefined) {
  if (!markup) return '';
  return new DOMParser().parseFromString(markup, 'text/html').body.textContent?.trim() ?? '';
}

function SourceReader({ path, label }: { path: string; label: string }) {
  const [loading, setLoading] = useState(true);
  return <div className={styles.sourceReader}>
    {loading && <div className={styles.readerLoading} role="status">Carregando conteúdo original…</div>}
    <iframe key={path} src={`${MOTION_SOURCE}${path}`} title={label} allow="clipboard-write; fullscreen" allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoading(false)} />
  </div>;
}

function Preview({ entry, paused }: { entry: MotionEntry; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([item]) => {
      setNear(item.isIntersecting);
      if (item.isIntersecting) setLoaded(true);
    }, { rootMargin: '100px', threshold: 0.01 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!paused && near) void video.play().catch(() => {});
    else video.pause();
  }, [near, paused, loaded]);

  return <video ref={ref} className={styles.previewVideo} width={entry.width} height={entry.height} src={loaded ? entry.preview : undefined} poster={loaded ? entry.poster : undefined}
    muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />;
}

export default function PromptMotion({ entries }: { entries: MotionEntry[] }) {
  const [view, setView] = useState<LibraryView>('gallery');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('popular');
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState<MotionEntry | null>(null);
  const [promptDetails, setPromptDetails] = useState<PromptDetails | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState('');
  const [copyError, setCopyError] = useState('');
  const [copied, setCopied] = useState(false);
  const [promptAttempt, setPromptAttempt] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const fullVideo = useRef<HTMLVideoElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => ({ prompt: entries.filter((entry) => entry.tags.includes('prompt')).length, skill: entries.filter((entry) => entry.tags.includes('skill')).length }), [entries]);
  const matching = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return entries.filter((entry) => (kind === 'all' || entry.tags.includes(kind))
      && (!term || `${entry.title} ${entry.handle} ${entry.contentTags.map((tag) => categoryNames[tag]).join(' ')}`.toLocaleLowerCase('pt-BR').includes(term)));
  }, [entries, kind, query]);
  const filtered = useMemo(() => {
    const result = matching.filter((entry) => categories.every((category) => entry.contentTags.includes(category)));
    if (sort === 'newest') result.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === 'oldest') result.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [matching, categories, sort]);

  useEffect(() => {
    const container = grid.current;
    if (!container || view !== 'gallery') return;
    const cards = Array.from(container.children) as HTMLElement[];
    let frame = 0;
    function arrange() {
      const style = getComputedStyle(container!);
      const columns = Number(style.getPropertyValue('--motion-columns')) || 1;
      const gap = parseFloat(style.columnGap) || 0;
      const rowGap = parseFloat(style.rowGap) || 0;
      const width = (container!.clientWidth - gap * (columns - 1)) / columns;
      if (width <= 0) return;
      container!.dataset.masonry = 'true';
      cards.forEach((card) => { card.style.width = `${width}px`; });
      const heights = cards.map((card) => card.getBoundingClientRect().height);
      const bottoms = Array<number>(columns).fill(0);
      cards.forEach((card, index) => {
        const column = bottoms.indexOf(Math.min(...bottoms));
        card.style.transform = `translate(${column * (width + gap)}px, ${bottoms[column]}px)`;
        bottoms[column] += heights[index] + rowGap;
      });
      container!.style.height = `${Math.max(0, Math.max(...bottoms) - rowGap)}px`;
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(arrange); };
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    cards.forEach((card) => observer.observe(card));
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      delete container.dataset.masonry;
      container.style.height = '';
      cards.forEach((card) => { card.style.width = ''; card.style.transform = ''; });
    };
  }, [filtered, view]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);

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

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    setPromptDetails(null);
    setPromptError('');
    setCopyError('');
    setCopied(false);
    setPromptLoading(true);
    fetch(`/api/promptsmotion/${encodeURIComponent(active.slug)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Não foi possível carregar o prompt.');
        return payload;
      })
      .then((payload) => setPromptDetails({
        prompt: markupText(payload.promptHtml),
        skillDescription: markupText(payload.skill?.descriptionHtml),
        skillCommand: markupText(payload.skill?.commandHtml),
      }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setPromptError(error instanceof Error ? error.message : 'Não foi possível carregar o prompt.');
      })
      .finally(() => { if (!controller.signal.aborted) setPromptLoading(false); });
    return () => controller.abort();
  }, [active, promptAttempt]);

  function openEntry(entry: MotionEntry) { setActive(entry); }
  async function copyPrompt() {
    const value = [promptDetails?.prompt, promptDetails?.skillDescription, promptDetails?.skillCommand].filter(Boolean).join('\n\n');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError('');
    } catch {
      const field = document.createElement('textarea');
      field.value = value;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const success = document.execCommand('copy');
      field.remove();
      setCopied(success);
      if (!success) setCopyError('Não foi possível copiar automaticamente. Selecione o texto para copiá-lo.');
    }
    window.setTimeout(() => setCopied(false), 1800);
  }
  function toggleCategory(category: string) {
    setCategories((selection) => selection.includes(category) ? selection.filter((item) => item !== category) : [...selection, category]);
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLogo size="sm" className={styles.logo} href="/" label="Aymar Labs, página inicial" />
      <span className={styles.headerLabel}>Biblioteca de motion</span>
      <Link className={styles.back} href="/portfoliodectvs">Portfólio de CTVs ↗</Link>
    </header>

    <section className={styles.hero}>
      <div className={styles.eyebrow}><i /> AYMAR LABS / PROMPTS MOTION</div>
      <div className={styles.heroGrid}>
        <h1>Veja o motion.<br /><em>Copie o prompt.</em></h1>
        <p>As animações originais do Prompt Motion, com os prompts e as skills de cada criador. Encontre uma referência e abra o que foi usado para criar.</p>
      </div>
      <div className={styles.heroMeta}><span>{entries.length} ANIMAÇÕES <i /> {counts.prompt} PROMPTS <i /> {counts.skill} SKILLS</span><a href={MOTION_SOURCE} target="_blank" rel="noreferrer">ACERVO ORIGINAL · PROMPT MOTION ↗</a></div>
    </section>

    <nav className={styles.libraryNav} aria-label="Biblioteca de motion">
      {([{ id: 'gallery', label: 'Animações', count: entries.length }, { id: 'templates', label: 'Templates' }, { id: 'customize', label: 'Personalizar prompt' }] as const).map((tab) => <button key={tab.id} aria-current={view === tab.id ? 'page' : undefined} onClick={() => setView(tab.id)}>{tab.label}{'count' in tab && <span>{tab.count}</span>}</button>)}
    </nav>

    {view === 'gallery' ? <section className={styles.library} aria-label="Catálogo de animações originais">
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Tipo de conteúdo">
          {[['all', 'Tudo', entries.length], ['prompt', 'Prompt', counts.prompt], ['skill', 'Skill', counts.skill]].map(([id, label, count]) => <button key={id} aria-pressed={kind === id} onClick={() => setKind(String(id))}>{label}<span>{count}</span></button>)}
        </div>
        <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar animação ou criador" aria-label="Buscar animação ou criador" />{query && <button onClick={() => setQuery('')} aria-label="Limpar busca">×</button>}</label>
        <label className={styles.sortLabel}><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popular</option><option value="newest">Mais recentes</option><option value="oldest">Mais antigas</option><option value="title">A–Z</option></select></label>
        <label className={styles.pause}><input type="checkbox" checked={paused} onChange={(event) => setPaused(event.target.checked)} /> Pausar prévias</label>
      </div>

      <div className={styles.categoryRow}><span>CONTÉM</span><div className={styles.categories}>
        <button aria-pressed={!categories.length} onClick={() => setCategories([])}>Tudo</button>
        {motionCategories.map(([id, label]) => <button key={id} aria-pressed={categories.includes(id)} onClick={() => toggleCategory(id)}>{label}<span>{matching.filter((entry) => entry.contentTags.includes(id)).length}</span></button>)}
      </div></div>

      <div className={styles.results}><span aria-live="polite">{filtered.length} de {entries.length} animações</span>{(query || categories.length > 0 || kind !== 'all') ? <button onClick={() => { setQuery(''); setCategories([]); setKind('all'); }}>Limpar filtros ×</button> : <span>VÍDEOS E PROMPTS DOS CRIADORES ORIGINAIS</span>}</div>
      <div ref={grid} className={styles.grid}>{filtered.map((entry) => <article className={styles.card} key={entry.slug} data-motion-slug={entry.slug}>
        <button className={styles.previewButton} style={{ aspectRatio: `${entry.width} / ${entry.height}` }} onClick={() => openEntry(entry)} aria-label={`Assistir: ${entry.title}`}>
          <Preview entry={entry} paused={paused || Boolean(active)} />
          <span className={styles.previewCaption}>Assistir animação <span aria-hidden="true">↗</span></span>
        </button>
        <div className={styles.cardInfo}>
          <div className={styles.cardTop}><a href={`https://x.com/${entry.handle}`} target="_blank" rel="noreferrer">@{entry.handle}</a><span>{entry.tags.map((tag) => tag === 'skill' ? 'Skill' : 'Prompt').join(' + ')}</span></div>
        <button className={styles.titleButton} onClick={() => openEntry(entry)}><h2>{entry.title}</h2></button>
        <div className={styles.cardBottom}><div className={styles.tags}>{entry.contentTags.map((tag) => <button key={tag} onClick={() => setCategories([tag])}>{categoryNames[tag] ?? tag}</button>)}</div><button className={styles.promptButton} onClick={() => openEntry(entry)}>{entry.tags.includes('prompt') ? 'Ver prompt' : 'Ver skill'} <span aria-hidden="true">↗</span></button></div>
        </div>
      </article>)}</div>
      {!filtered.length && <div className={styles.empty}><h2>Nenhuma animação com esses filtros.</h2><p>Tente outro nome, criador ou combinação de categorias.</p><button onClick={() => { setCategories([]); setQuery(''); setKind('all'); }}>Ver todas as animações ↗</button></div>}
    </section> : <section className={styles.embeddedSection} aria-label={view === 'templates' ? 'Templates originais' : 'Personalizar prompt'}><div className={styles.sectionIntro}><div><span>FERRAMENTAS DO PROMPT MOTION</span><h2>{view === 'templates' ? 'Templates originais.' : 'Deixe com a sua cara.'}</h2></div><a href={`${MOTION_SOURCE}/${view === 'templates' ? 'templates' : 'customize'}`} target="_blank" rel="noreferrer">Abrir na fonte ↗</a></div><SourceReader key={view} path={`/${view === 'templates' ? 'templates' : 'customize'}`} label={view === 'templates' ? 'Templates originais do Prompt Motion' : 'Personalizar prompt no Prompt Motion'} /></section>}

    <footer className={styles.footer}><p>Biblioteca Aymar Labs <span>·</span> Acervo do <a href={MOTION_SOURCE} target="_blank" rel="noreferrer">Prompt Motion ↗</a><br /><small>Vídeos, prompts e skills pertencem aos criadores indicados em cada item.</small></p><Link href="/">Voltar ao site ↗</Link></footer>

    <dialog ref={dialog} className={styles.dialog} aria-label={`Preview e prompt${active ? `: ${active.title}` : ''}`} onClose={() => { fullVideo.current?.pause(); setActive(null); }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {active && <div className={styles.dialogInner}>
        <div className={styles.dialogHead}><button className={styles.closeButton} onClick={() => dialog.current?.close()} aria-label="Fechar animação">×</button></div>
        <div className={styles.fullPlayer}><video ref={fullVideo} src={active.video} poster={active.poster} controls autoPlay playsInline preload="metadata" width={active.width} height={active.height} /></div>
        <section className={styles.promptPanel} aria-label="Prompt para copiar">
          <div className={styles.promptToolbar}><span>{active.tags.includes('skill') ? (active.tags.includes('prompt') ? 'PROMPT + SKILL' : 'SKILL') : 'PROMPT'}</span><button onClick={copyPrompt} disabled={promptLoading || !promptDetails}>{copied ? 'COPIADO ✓' : 'COPIAR'}</button></div>
          {promptLoading ? <p className={styles.promptStatus} role="status">Carregando prompt…</p> : promptError ? <p className={styles.promptStatus} role="alert">{promptError} <button onClick={() => setPromptAttempt((attempt) => attempt + 1)}>Tentar novamente</button></p> : <div className={styles.promptContent}>
            {promptDetails?.prompt && <pre>{promptDetails.prompt}</pre>}
            {promptDetails?.skillDescription && <><p>{promptDetails.skillDescription}</p>{promptDetails.skillCommand && <code>{promptDetails.skillCommand}</code>}</>}
            {copyError && <p role="alert">{copyError}</p>}
          </div>}
        </section>
      </div>}
    </dialog>
  </main>;
}
