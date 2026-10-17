'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type UIEvent as ReactUIEvent } from 'react';
import BrandLogo from './BrandLogo';
import BrandMark from './BrandMark';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CheckDouble, Close, MenuLines, Play, VolumeOff, VolumeOn } from './Icon';
import { WHATSAPP_URL } from '../lib/site';
import type { Dict } from '../dictionaries/pt';

type ProjectColors = { background: string; primary: string; secondary: string; accent: string };
const projectInfo: Array<{ slug: string; url: string; colors: ProjectColors }> = [
  { slug: 'criar-saas', url: 'https://agenciapkg.com.br/criarsaas/', colors: { background: '#071018', primary: '#cdd9ff', secondary: '#18283c', accent: '#7ca7ff' } },
  { slug: 'dra-aline', url: 'https://agenciapkg.com.br/dra-aline/', colors: { background: '#101826', primary: '#eef3ff', secondary: '#1e2b42', accent: '#a7b8ff' } },
  { slug: 'copie-ai', url: 'https://agenciapkg.com.br/copie-ai/', colors: { background: '#f5f5f1', primary: '#111111', secondary: '#dfe9ec', accent: '#12b9e8' } },
  { slug: 'jessica', url: 'https://agenciapkg.com.br/jessica/', colors: { background: '#f0dfe5', primary: '#22151a', secondary: '#d9aab9', accent: '#c94977' } },
  { slug: 'master-class', url: 'https://agenciapkg.com.br/master-class/', colors: { background: '#07140e', primary: '#d8ff69', secondary: '#143f28', accent: '#7bff54' } },
  { slug: 'mentoria-caio', url: 'https://agenciapkg.com.br/mentoria-caio-martins/', colors: { background: '#091421', primary: '#eef6ff', secondary: '#1c3248', accent: '#2fbcff' } },
  { slug: 'isaque-mota', url: 'https://agenciapkg.com.br/isaquemota/', colors: { background: '#100c18', primary: '#f5f0ff', secondary: '#2b1941', accent: '#b665ff' } },
  { slug: 'primeira-assinatura', url: 'https://primeiraassinaturaem24h.com.br/', colors: { background: '#05070c', primary: '#eef4ff', secondary: '#102544', accent: '#3b8dff' } }
];

function Cursor({ label }: { label: string }) {
  const [cursorLabel, setCursorLabel] = useState('');
  const x = useMotionValue(-100); const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 360, damping: 35 }); const sy = useSpring(y, { stiffness: 360, damping: 35 });
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const move = (event: MouseEvent) => { x.set(event.clientX); y.set(event.clientY); };
    const enter = (event: Event) => setCursorLabel((event.currentTarget as HTMLElement).dataset.cursor || '');
    const leave = () => setCursorLabel('');
    const elements = Array.from(document.querySelectorAll<HTMLElement>('a, button, [data-cursor]'));
    window.addEventListener('mousemove', move); elements.forEach(element => { element.addEventListener('mouseenter', enter); element.addEventListener('mouseleave', leave); });
    return () => { window.removeEventListener('mousemove', move); elements.forEach(element => { element.removeEventListener('mouseenter', enter); element.removeEventListener('mouseleave', leave); }); };
  }, [x, y]);
  return <motion.div aria-hidden="true" className={`cursor ${cursorLabel ? 'cursor-label' : ''}`} style={{ x: sx, y: sy }}>{cursorLabel || label}</motion.div>;
}

function Header({ dict, menuOpen, setMenuOpen }: { dict: Dict; menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false); const [hidden, setHidden] = useState(false); const lastScroll = useRef(0);
  useEffect(() => { const onScroll = () => { const current = window.scrollY; const delta = current - lastScroll.current; setScrolled(current > 20); if (menuOpen || current <= 20) setHidden(false); else if (Math.abs(delta) >= 8) setHidden(delta > 0); lastScroll.current = current; }; window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, [menuOpen]);
  return <header className={`header ${scrolled ? 'scrolled' : ''} ${hidden && !menuOpen ? 'header-hidden' : ''} ${menuOpen ? 'menu-active' : ''}`}><BrandLogo size="sm" label={dict.brand} /><button className="header-menu-toggle" type="button" aria-label={menuOpen ? dict.ui.closeMenu : dict.ui.openMenu} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(!menuOpen)}><MenuLines open={menuOpen} /></button></header>;
}

function FullscreenMenu({ dict, open, setOpen }: { dict: Dict; open: boolean; setOpen: (open: boolean) => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeVideo, setActiveVideo] = useState<{ source: string; poster: string; title: string } | null>(null);
  const videoTrigger = useRef<HTMLButtonElement | null>(null);
  const playerClose = useRef<HTMLButtonElement | null>(null);
  const videoTrack = useRef<HTMLDivElement | null>(null);
  const siteTrack = useRef<HTMLDivElement | null>(null);
  const menuVideos = [
    { source: '/videos/c_ctv9_UGC3.mp4', poster: '/videos/c_ctv9_UGC3.jpg', title: 'Criativo UGC' },
    { source: '/videos/ctv1_2.mp4', poster: '/videos/ctv1_2.jpg', title: 'Prova e desejo' },
    { source: '/videos/ctv_ugc_paletas.mp4', poster: '/videos/ctv_ugc_paletas.jpg', title: 'Criativo UGC — paletas' },
    { source: '/videos/A1_Model.mp4', poster: '/videos/A1_Model.jpg', title: 'Variação para anúncio' },
  ];
  const menuSites = [projectInfo[5], projectInfo[1], projectInfo[6], projectInfo[3], projectInfo[0]];
  const links = [
    { href: '#videos', label: dict.nav.studio },
    { href: '#trabalhos', label: dict.nav.work },
    { href: '#processo', label: dict.nav.process },
    { href: '#contato', label: dict.nav.contact },
    { href: '#faq', label: dict.nav.faq },
    { href: '/membros', label: dict.lang === 'pt' ? 'membros' : 'members' },
  ];
  useEffect(() => {
    document.body.classList.toggle('fullscreen-nav-open', open);
    if (open) {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
      window.requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#site-menu .site-menu-links a')?.focus());
    }
    return () => document.body.classList.remove('fullscreen-nav-open');
  }, [open]);
  useEffect(() => { if (activeVideo) playerClose.current?.focus(); }, [activeVideo]);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      [videoTrack.current, siteTrack.current].forEach(track => { if (track) track.scrollTop = track.scrollHeight / 3; });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  const loopTrack = (event: ReactUIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const length = track.scrollHeight / 3;
    if (!length) return;
    if (track.scrollTop < length * .5) track.scrollTop += length;
    else if (track.scrollTop > length * 1.5) track.scrollTop -= length;
  };
  const closeVideo = () => {
    setActiveVideo(null);
    window.requestAnimationFrame(() => videoTrigger.current?.focus());
  };
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('aymar-theme', next);
    setTheme(next);
  };
  const onMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      if (activeVideo) { event.stopPropagation(); closeVideo(); return; }
      setOpen(false);
      window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.header-menu-toggle')?.focus());
    }
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(activeVideo ? '.site-menu-player button, .site-menu-player video' : 'a, button'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return <AnimatePresence>{open && <motion.nav id="site-menu" className="site-menu-overlay" aria-label={dict.nav.menu} onKeyDown={onMenuKeyDown} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .3, ease: 'easeOut' }}>
    <div className="site-menu-gallery" aria-label={dict.lang === 'pt' ? 'Amostra de vídeos e sites' : 'Video and website showcase'}>
      <div className="site-menu-media-column">
        <span className="site-menu-column-title">{dict.lang === 'pt' ? 'Vídeos' : 'Videos'}</span>
        <div className="site-menu-media-track" ref={videoTrack} onScroll={loopTrack} aria-label={dict.lang === 'pt' ? 'Vídeos; role para ver mais' : 'Videos; scroll for more'} tabIndex={0}>
          {[0, 1, 2].flatMap(repeat => menuVideos.map(item => <button className="site-menu-media-card site-menu-video" type="button" key={`${repeat}-${item.source}`} aria-label={`${dict.lang === 'pt' ? 'Assistir' : 'Watch'}: ${item.title}`} onClick={event => { videoTrigger.current = event.currentTarget; setActiveVideo(item); }}><Image src={item.poster} alt="" fill sizes="(max-width: 719px) 42vw, 24vw" /><span className="site-menu-card-action" aria-hidden="true"><Play /></span><span className="site-menu-card-caption">{item.title}</span></button>))}
        </div>
      </div>
      <div className="site-menu-media-column">
        <span className="site-menu-column-title">Sites</span>
        <div className="site-menu-media-track" ref={siteTrack} onScroll={loopTrack} aria-label={dict.lang === 'pt' ? 'Sites; role para ver mais' : 'Websites; scroll for more'} tabIndex={0}>
          {[0, 1, 2].flatMap(repeat => menuSites.map(item => <a className="site-menu-media-card site-menu-site" href={item.url} target="_blank" rel="noopener noreferrer" key={`${repeat}-${item.slug}`} aria-label={`${dict.lang === 'pt' ? 'Abrir site' : 'Open website'}: ${item.slug.replaceAll('-', ' ')}`}><Image src={`/references/${item.slug}.png`} alt="" fill sizes="(max-width: 719px) 42vw, 24vw" /><span className="site-menu-card-action" aria-hidden="true"><ArrowUpRight /></span><span className="site-menu-card-caption">{item.slug.replaceAll('-', ' ')}</span></a>))}
        </div>
      </div>
    </div>
    <div className="site-menu-content">
      <span className="site-menu-kicker">Aymar Labs — {dict.lang === 'pt' ? 'navegação' : 'navigation'}</span>
      <div className="site-menu-links">{links.map(({ href, label }) => href.startsWith('/') ? <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link> : <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}</div>
      <div className="site-menu-footer">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{dict.nav.cta} <ArrowUpRight /></a>
        <a href="https://www.instagram.com/aymarlabs/" target="_blank" rel="noopener noreferrer">instagram <ArrowUpRight /></a>
        <button type="button" onClick={toggleTheme}>{theme === 'dark' ? 'light' : 'dark'} mode</button>
      </div>
    </div>
    {activeVideo && <div className="site-menu-player" role="dialog" aria-modal="true" aria-label={activeVideo.title} onClick={event => { if (event.target === event.currentTarget) closeVideo(); }}><div className="site-menu-player-inner"><button ref={playerClose} type="button" className="site-menu-player-close" aria-label={dict.ui.closeMenu} onClick={closeVideo}><Close /></button><video key={activeVideo.source} src={activeVideo.source} poster={activeVideo.poster} controls autoPlay playsInline tabIndex={0} /></div></div>}
  </motion.nav>}</AnimatePresence>;
}

function Hero({ dict, whatsappUrl }: { dict: Dict; whatsappUrl: string }) {
  return <section className="hero hero-centered dark">
    <div className="hero-content">
      <div className="hero-eyebrow">{dict.hero.eyebrow}</div>
      <h1><span>{dict.hero.title}</span><em>{dict.hero.emphasis}</em></h1>
      <p className="hero-description">{dict.hero.paragraph}</p>
      <a className="hero-cta shine-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><span>{dict.hero.cta}</span></a>
      <div className="hero-pillars" aria-label={dict.lang === 'pt' ? 'O que criamos' : 'What we create'}>{dict.hero.pillars.map(pillar => <h2 key={pillar}>{pillar}</h2>)}</div>
    </div>
    <BrandMark className="hero-brand-mark" />
    <div className="hero-bottom"><span>{dict.hero.location}</span></div>
  </section>;
}

function CopyBenefitsSection({ dict }: { dict: Dict }) {
  return <section id="studio" className="studio copy-benefits paper">
    <div className="eyebrow">{dict.studio.eyebrow}</div>
    <div className="two-col benefits-intro"><h2>{dict.studio.title}<br /><em>{dict.studio.emphasis}</em></h2><p>{dict.studio.paragraph}</p></div>
    <div className="benefit-grid">{dict.studio.benefits.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    <div className="avatar-callout"><BrandMark className="avatar-brand-mark" /><div><span>{dict.studio.avatar.eyebrow}</span><h3>{dict.studio.avatar.title}</h3></div><div><p>{dict.studio.avatar.paragraph}</p><a href="#contato">{dict.studio.avatar.cta}<ArrowUpRight /></a></div></div>
  </section>;
}

function FaqSection({ dict }: { dict: Dict }) {
  return <section id="faq" className="faq-section paper">
    <div className="eyebrow">{dict.faq.eyebrow}</div>
    <div className="faq-heading"><h2>{dict.faq.title}</h2><BrandMark className="faq-brand-mark" /></div>
    <div className="faq-list">{dict.faq.items.map(item => <details key={item.question}><summary><span>{item.question}</span><ArrowDown /></summary><p>{item.answer}</p></details>)}</div>
  </section>;
}

function HowSection({ dict, whatsappUrl }: { dict: Dict; whatsappUrl: string }) {
  const how = dict.how;
  return <section id="como" className="how dark"><div className="eyebrow">{how.eyebrow}</div><div className="how-intro"><h2>{how.title}<br /><em>{how.emphasis}</em></h2><p>{how.paragraph}</p></div><div className="before-after"><div className="how-column how-before"><span className="how-label">{how.beforeLabel}</span><h3>{how.beforeTitle}</h3><div className="how-list">{how.before.map(item => <div className="how-list-item" key={item.tool}><img src={`/tools/${item.tool}.svg`} alt="" aria-hidden="true" /><span>{item.text}</span></div>)}</div></div><div className="how-column how-after"><span className="how-label">{how.afterLabel}</span><h3>{how.afterTitle}</h3><div className="how-list">{how.after.map(item => <div className="how-list-item" key={item}><i aria-hidden="true" /><span>{item}</span></div>)}</div></div></div><p className="how-disclaimer">{how.disclaimer}</p><div className="how-timeline"><motion.i className="how-timeline-progress" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1.2, ease: 'easeOut' }} />{how.steps.map((step, index) => <motion.article className="how-step" data-cursor="etapa" key={step.number} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ delay: index * .1, duration: .5 }}><strong>{step.number}</strong><div><div className="how-step-head"><h3>{step.title}</h3><span>{step.timeframe}</span></div><p>{step.text}</p><small><b>VOCÊ RECEBE:</b> {step.deliverable}</small></div></motion.article>)}</div><div className="how-closing"><p>{how.closing}</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{how.cta} <ArrowUpRight /></a></div></section>;
}

const videoWorks = [
  { title: 'Copy para bolo', meta: 'vídeo de vendas · 9:16', source: '/videos/ctv_copy1_bolo.mp4', poster: '/videos/ctv_copy1_bolo.jpg' },
  { title: 'Criativo UGC', meta: 'vídeo de vendas · 9:16', source: '/videos/c_ctv9_UGC3.mp4', poster: '/videos/c_ctv9_UGC3.jpg' },
  { title: 'Variação para anúncio', meta: 'reels · performance', source: '/videos/A1_Model.mp4', poster: '/videos/A1_Model.jpg' },
  { title: 'Criativo UGC — paletas', meta: 'UGC · 9:16', source: '/videos/ctv_ugc_paletas.mp4', poster: '/videos/ctv_ugc_paletas.jpg' },
  { title: 'Oferta em movimento', meta: 'criativo · conversão', source: '/videos/Copy_1.mp4', poster: '/videos/Copy_1.jpg' },
  { title: 'Prova e desejo', meta: 'UGC · anúncio', source: '/videos/ctv1_2.mp4', poster: '/videos/ctv1_2.jpg' },
];

function VideoCard({ item, index }: { item: typeof videoWorks[number]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.muted = true;
        setMuted(true);
        void video.play().then(() => setActive(true)).catch(() => undefined);
      } else {
        video.pause();
        setActive(false);
      }
    }, { threshold: 0.6, rootMargin: '120px 0px' });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !frameRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    gsap.to(frameRef.current, { rotateX: -y * 5, rotateY: x * 5, scale: 1.018, duration: .45, ease: 'power3.out', transformPerspective: 900, overwrite: true });
  };
  const resetPointer = () => { if (frameRef.current) gsap.to(frameRef.current, { rotateX: 0, rotateY: 0, scale: 1, duration: .7, ease: 'elastic.out(1, .55)', overwrite: true }); };
  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    setActive(true);
    video.currentTime = 0;
    video.muted = muted;
    void video.play().catch(() => undefined);
  };
  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setActive(false);
  };
  const toggleSound = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };
  return <article className={`video-card ${active ? 'is-active' : ''}`} onMouseEnter={play} onMouseLeave={pause} onFocus={play} onBlur={pause} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
    <div className="video-frame" ref={frameRef}>
      <video ref={videoRef} src={item.source} poster={item.poster} muted={muted} loop playsInline preload="metadata" aria-label={item.title} />
      <div className="video-shade" />
      <span className="video-number">{String(index + 1).padStart(2, '0')}</span>
      <button className="video-sound" type="button" onClick={toggleSound} aria-label={muted ? 'Ativar som' : 'Mutar vídeo'}>{muted ? <VolumeOff /> : <VolumeOn />}</button>
    </div>
  </article>;
}

function VideosSection({ lang }: { lang: Dict['lang'] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const moveCarousel = (direction: number) => carouselRef.current?.scrollBy({ left: direction * (carouselRef.current.clientWidth * .82), behavior: 'smooth' });
  const copy = lang === 'pt'
    ? { eyebrow: 'criativos na prática', title: 'O público passa reto', emphasis: 'quando parece tudo igual.', paragraph: 'Cada vídeo começa com uma hipótese: qual abertura faria essa pessoa parar? Depois entram ritmo, argumento e uma chamada que combina com a oferta.', previous: 'Ver vídeos anteriores', next: 'Ver próximos vídeos', controls: 'ARRASTE OU USE AS SETAS', note: 'PASSE O MOUSE PARA VER · CLIQUE NO ÍCONE PARA ATIVAR O SOM', proof: [['Ângulo', 'uma mensagem que vem da oferta'], ['Teste', 'variações com uma hipótese'], ['Conversa', 'continuidade até o WhatsApp']] }
    : { eyebrow: 'creative in practice', title: 'People keep scrolling', emphasis: 'when it all looks the same.', paragraph: 'Each video starts with a question: what opening would make this person stop? Then come rhythm, argument and a call to action that fits the offer.', previous: 'Previous videos', next: 'Next videos', controls: 'DRAG OR USE THE ARROWS', note: 'HOVER TO PREVIEW · CLICK THE ICON FOR SOUND', proof: [['Angle', 'a message grounded in the offer'], ['Test', 'variations with a hypothesis'], ['Conversation', 'the message carries into WhatsApp']] };
  return <section id="videos" className="videos dark"><div className="eyebrow">{copy.eyebrow}</div><div className="videos-intro"><h2>{copy.title}<br /><em>{copy.emphasis}</em></h2><p>{copy.paragraph}</p></div><div className="video-carousel" ref={carouselRef}><div className="video-wall">{videoWorks.map((item, index) => <VideoCard key={item.source} item={item} index={index} />)}</div></div><div className="video-controls"><button type="button" onClick={() => moveCarousel(-1)} aria-label={copy.previous}><ArrowLeft /></button><small>{copy.controls}</small><button type="button" onClick={() => moveCarousel(1)} aria-label={copy.next}><ArrowRight /></button></div><small className="videos-note">{copy.note}</small><div className="proof-strip" aria-label={lang === 'pt' ? 'Como criamos' : 'How we create'}>{copy.proof.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}</div></section>;
}

function BackToTop({ lang }: { lang: Dict['lang'] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const onScroll = () => setVisible(window.scrollY > 600); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  const goTop = () => { const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); };
  return <button type="button" className={`back-to-top ${visible ? 'is-visible' : ''}`} aria-label={lang === 'en' ? 'Back to top' : 'Voltar ao topo'} onClick={goTop}><ArrowUp /></button>;
}

function useReveal(variant: string, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.reveal = variant;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.add('reveal-ready');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { element.classList.add('is-revealed'); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { element.classList.add('is-revealed'); observer.disconnect(); } }, { threshold: .15, rootMargin: '0px 0px -10% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, variant]);
  return ref;
}

function ProcessItem({ item, index }: { item: Dict['process']['items'][number]; index: number }) {
  const revealRef = useReveal('fade-up', index * 90);
  return <div ref={revealRef} className="process-item"><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></div>;
}

function Marquee({ light = false, children }: { light?: boolean; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const position = useRef(0);
  const velocity = useRef(0);
  const groupWidth = useRef(0);
  const reduced = useRef(false);
  const sequence = Array.from({ length: 6 }, (_, index) => <span className="marquee-item" key={index}>{children}</span>);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => { groupWidth.current = groupRef.current?.getBoundingClientRect().width || 0; };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    let lastScroll = window.scrollY;
    const scroll = () => {
      if (reduced.current) return;
      const currentScroll = window.scrollY;
      velocity.current += (currentScroll - lastScroll) * 0.18;
      velocity.current = Math.max(-24, Math.min(24, velocity.current));
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', scroll); };
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced.current || !groupWidth.current) return;
    position.current += velocity.current * (delta / 16.67);
    velocity.current *= Math.pow(0.9, delta / 16.67);
    if (Math.abs(velocity.current) < 0.01) velocity.current = 0;
    const width = groupWidth.current;
    while (position.current <= -width) position.current += width;
    while (position.current > 0) position.current -= width;
    x.set(position.current);
  });

  return <div className={`marquee ${light ? 'marquee-light' : ''}`}><motion.div ref={trackRef} className="marquee-track scroll-driven" style={{ x }}><div ref={groupRef} className="marquee-group">{sequence}</div><div className="marquee-group" aria-hidden="true">{sequence}</div></motion.div></div>;
}

function ProjectCard({ index, dict, hoverLabel }: { index: number; dict: Dict; hoverLabel: string }) {
  const project = dict.projects[index]; const info = projectInfo[index]; const [loaded, setLoaded] = useState(false);
  return <motion.article className={`project-card project-${info.slug}`} data-cursor={hoverLabel} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ delay: index * .04, duration: .5 }}><div className="project-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{project.badge}</b></div><a className="preview-frame" href={info.url} target="_blank" rel="noopener noreferrer"><div className="project-art" style={{ '--project-bg': info.colors.background } as CSSProperties}><div className={`project-art-placeholder ${loaded ? 'is-hidden' : ''}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{project.title}</strong><small>{dict.work.preview}</small></div><Image src={`/references/${info.slug}.png`} alt={`Landing page ${project.title} — ${project.category}`} fill sizes="(max-width: 719px) 88vw, (max-width: 900px) 42vw, 28vw" className={`project-art-image ${loaded ? 'is-loaded' : 'is-hidden'}`} onLoad={() => setLoaded(true)} /></div></a><a className="project-info" href={info.url} target="_blank" rel="noopener noreferrer"><div><h3>{project.title}</h3><p>{project.meta}</p></div><span> <ArrowRight /></span></a></motion.article>;
}

function ChatbotDemoSynced({ dict, running }: { dict: Dict; running: boolean }) {
  const messages = dict.specialist.chatbot.customer.flatMap((customer, index) => [{ text: customer, side: 'received', key: `c${index}` }, { text: dict.specialist.chatbot.bot[index], side: 'sent', key: `b${index}` }]);
  const [typingFor, setTypingFor] = useState<number | null>(null);
  useEffect(() => {
    if (!running) { setTypingFor(null); return; }
    let botIndex = 0;
    const timers: number[] = [];
    const start = () => {
      setTypingFor(botIndex);
      timers.push(window.setTimeout(() => {
        setTypingFor(null);
        botIndex = (botIndex + 1) % dict.specialist.chatbot.bot.length;
        timers.push(window.setTimeout(start, botIndex === 0 ? 2000 : 350));
      }, 1000));
    };
    timers.push(window.setTimeout(start, 700));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [dict.specialist.chatbot.bot.length, running]);
  const isTyping = typingFor !== null;
  return <div className={`demo-stage demo-chat ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="chat-demo-layout"><div className="phone-shell"><div className="phone-top"><i className="chat-avatar">C</i><span><strong className="chat-contact-name">{dict.lang === 'en' ? 'Customer' : 'Cliente'}</strong><small className={isTyping ? 'is-typing' : ''}><span className="chat-online">online</span><span className="chat-thinking">digitando...</span></small></span><strong className="chat-menu">···</strong></div><div className="chat-list">{messages.map((message, index) => <div className={`chat-row ${message.side} ${index % 2 === 0 ? 'has-tail' : ''}`} key={message.key} style={{ '--delay': `${index * 1.15}s` } as CSSProperties}><div className="chat-bubble">{message.text}<small>{index % 2 ? <><span>{dict.ui.sentTime.split(' ')[0]}</span> <CheckDouble className="chat-check" /></> : dict.ui.receivedTime}</small></div></div>)}{isTyping && <div className="chat-typing"><i /><i /><i /><span>digitando...</span></div>}</div><div className="chat-input"><span>Digite uma mensagem</span><b><ArrowUp /></b></div></div><div className="chat-flow"><small className="chat-channel-label">{dict.lang === 'en' ? 'WhatsApp Business' : 'WhatsApp Business'}</small><h3>{dict.lang === 'en' ? 'WHAT HAPPENS BEHIND THE SCENES' : 'O QUE ACONTECE POR TRÁS'}</h3>{dict.specialist.chatbot.flow.map((step, index) => <div className="chat-flow-step" key={step}><b>{String(index + 1).padStart(2, '0')}</b><i /><span>{step}</span></div>)}</div></div></div>;
}

function RepetitiveDemo({ dict, running }: { dict: Dict; running: boolean }) {
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(0);
  useEffect(() => { if (!running) return; const started = Date.now(); const timer = window.setInterval(() => { const elapsed = (Date.now() - started) % 7200; setCount(Math.min(1248, Math.round((elapsed / 7200) * 1248))); setSaved(Math.min(31, Math.round((elapsed / 7200) * 31))); }, 40); return () => window.clearInterval(timer); }, [running]);
  const origins = ['excel', 'gmail', 'whatsapp', 'excel', 'gmail', 'whatsapp'];
  return <div className={`demo-stage demo-repetitive ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="queue-window"><div className="queue-toolbar"><span><i /><i /><i /></span><strong>{dict.lang === 'en' ? 'processing queue' : 'fila de processamento'}</strong></div><div className="records-head"><div className="record-metrics"><div><strong>{running ? count.toLocaleString(dict.lang === 'en' ? 'en-US' : 'pt-BR') : '1.248'}</strong><span>{dict.specialist.repetitive.counter}</span></div><div><strong>{saved}h</strong><span>{dict.lang === 'en' ? 'TIME SAVED' : 'TEMPO ECONOMIZADO'}</span></div></div></div><div className="records-origin"><span>ORIGEM</span>{origins.slice(0, 3).map(tool => <img key={tool} src={`/tools/${tool}.svg`} alt={tool} />)}</div><div className="record-list">{dict.specialist.repetitive.rows.map((row, index) => <div className={`record-row ${index === 2 ? 'record-row-unstable' : ''}`} key={row} style={{ '--row-delay': `${index * .6}s` } as CSSProperties}><img src={`/tools/${origins[index]}.svg`} alt="" aria-hidden="true" /><code>#{4821 + index}</code><span>{row}</span><em>{index === 2 ? 'reprocessando' : index === 0 ? 'processando' : 'concluído'}</em><i><CheckDouble className="record-check-icon" /></i></div>)}</div></div></div>;
}

function DashboardDemo({ dict, running }: { dict: Dict; running: boolean }) {
  const bars = [46, 70, 54, 86, 63, 95, 76];
  const [liveOffset, setLiveOffset] = useState(0);
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setLiveOffset(Math.round(Math.random() * 12 - 6)), 2000); return () => window.clearInterval(timer); }, [running]);
  return <div className={`demo-stage demo-dashboard ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="dashboard-shell"><aside className="dashboard-sidebar"><i className="is-active">⌂</i><i>◫</i><i>◌</i><i>⚙</i></aside><div className="dashboard-main"><div className="dashboard-top"><strong>Operação</strong><span>Últimos 30 dias　⌄</span><b><i />{dict.ui.live}</b></div><div className="dashboard-grid"><div className="dashboard-card chart-card"><div className="card-heading"><span>Pedidos</span><small>por dia</small></div><div className="bar-chart">{bars.map((height, index) => <i key={index} style={{ '--height': `${Math.max(18, height + (index === 6 ? liveOffset : 0))}%`, '--bar-delay': `${index * .08}s` } as CSSProperties} />)}</div><div className="chart-days"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div></div><div className="dashboard-card spark-card"><div className="card-heading"><span>Conversão</span><small>+12,4%</small></div><svg className="sparkline" viewBox="0 0 240 80" preserveAspectRatio="none"><path d="M0 60 C22 52 28 63 48 43 S74 55 93 34 S120 43 140 24 S170 38 187 16 S218 28 240 5" /></svg></div><div className="dashboard-kpis"><div className="kpi"><span>Faturamento</span><strong>{dict.specialist.dashboard.currency}</strong><small>▲ 12,4%</small></div><div className="kpi"><span>Pedidos</span><strong>1.248</strong><small>▲ 8,1%</small></div><div className="kpi"><span>Retrabalho</span><strong>2,3%</strong><small>▼ 61%</small></div></div></div></div></div></div>;
}

function SpecialistDemos({ dict }: { dict: Dict }) {
  const [active, setActive] = useState(0); const [visible, setVisible] = useState(false); const sectionRef = useRef<HTMLDivElement>(null); const [reduced, setReduced] = useState(false); const [autoplay, setAutoplay] = useState(true);
  useEffect(() => { const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; setReduced(reducedMotion); if (reducedMotion) setAutoplay(false); const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .18 }); if (sectionRef.current) observer.observe(sectionRef.current); return () => observer.disconnect(); }, []);
  useEffect(() => { if (!visible || reduced || !autoplay) return; const timer = window.setInterval(() => setActive(value => (value + 1) % 3), 7000); return () => window.clearInterval(timer); }, [visible, reduced, autoplay]);
  const running = visible && !reduced;
  const chooseTab = (index: number) => { setAutoplay(false); setActive(index); };
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); chooseTab((active + 1) % 3); } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); chooseTab((active + 2) % 3); } };
  return <div className={`specialist-demos ${autoplay ? 'is-autoplay' : 'is-manual'} `} ref={sectionRef}><div className="demo-tabs" role="tablist">{dict.specialist.tabs.map((tab, index) => <button key={tab.label} role="tab" tabIndex={active === index ? 0 : -1} aria-selected={active === index} className={active === index ? 'is-active' : ''} data-cursor="trocar" onClick={() => chooseTab(index)} onKeyDown={onTabKeyDown}><span>{tab.label}</span>{autoplay && <i />}</button>)}</div><div className="demo-layout"><div className="demo-stage-wrap"><AnimatePresence mode="wait"><motion.div key={active} className="demo-animated" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>{active === 0 ? <ChatbotDemoSynced dict={dict} running={running} /> : active === 1 ? <RepetitiveDemo dict={dict} running={running} /> : <DashboardDemo dict={dict} running={running} />}</motion.div></AnimatePresence></div><p className="demo-copy">{dict.specialist.tabs[active].text}</p></div></div>;
}

export default function Site({ dict }: { dict: Dict }) {
  const [loaded, setLoaded] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches; const whatsappUrl = WHATSAPP_URL;
  useEffect(() => { const timer = window.setTimeout(() => setLoaded(true), reduced ? 0 : 520); return () => window.clearTimeout(timer); }, [reduced]);
  useEffect(() => { document.querySelector<HTMLAnchorElement>('.scroll-arrow')?.setAttribute('href', '#videos'); }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-eyebrow', { autoAlpha: 0, y: 18, duration: .5, delay: .6 })
        .from('.hero h1 span, .hero h1 em', { autoAlpha: 0, y: 36, duration: .7, stagger: .08 }, '-=.2')
        .from('.hero-description, .hero-cta', { autoAlpha: 0, y: 18, duration: .5, stagger: .08 }, '-=.35');
      const sections = gsap.utils.toArray<HTMLElement>('.videos-intro, .video-card, .work-editorial, .process-layout, .how-intro, .specialist-content, .contact-content');
      gsap.set(sections, { autoAlpha: 0, y: 24 });
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(entry.target, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', overwrite: true });
        observer.unobserve(entry.target);
      }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
      sections.forEach(section => observer.observe(section));
      return () => observer.disconnect();
    });
    return () => ctx.revert();
  }, []);
  return <><AnimatePresence>{!loaded && <motion.div className="loader" initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: .45 }}><BrandLogo size="md" label={dict.brand} /><div className="loader-bar"><motion.i initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: .5 }} /></div><span>{dict.loader}</span></motion.div>}</AnimatePresence><Header dict={dict} menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><Cursor label="" /><FullscreenMenu dict={dict} open={menuOpen} setOpen={setMenuOpen} /><BackToTop lang={dict.lang} /><main id="top"><Hero dict={dict} whatsappUrl={whatsappUrl} /><Marquee>{dict.marquee.first}</Marquee><CopyBenefitsSection dict={dict} /><section id="trabalhos" className="work dark"><div className="eyebrow">{dict.work.eyebrow}</div><div className="work-layout"><aside className="work-editorial"><p>{dict.work.editorialBefore}<strong>{dict.work.editorialLink}</strong>{dict.work.editorialAfter}</p><small>{dict.work.hover}</small></aside><div className="projects-wall">{projectInfo.map((_, index) => <ProjectCard key={projectInfo[index].slug} index={index} dict={dict} hoverLabel={dict.work.hover} />)}</div></div></section><VideosSection lang={dict.lang} /><section id="processo" className="process paper"><div className="eyebrow">{dict.process.eyebrow}</div><div className="two-col process-layout"><h2>{dict.process.title}<br /><em>{dict.process.emphasis}</em></h2><div className="process-list">{dict.process.items.map((item, index) => <ProcessItem key={item.title} item={item} index={index} />)}</div></div></section><section id="oferta" className="specialist dark offer-proof"><div className="eyebrow">estrutura da entrega</div><div className="specialist-content"><h2>Oferta, copy e fluxo<br /><em>no mesmo caminho.</em></h2><p>Uma entrega completa para quem precisa transformar uma ideia em anúncio, conversa e venda — com páginas, criativos e chatbot trabalhando juntos.</p></div><div className="specialist-proof"><div><strong>9:16</strong><span>criativos verticais</span></div><div><strong>X1</strong><span>venda pelo WhatsApp</span></div><div><strong>01</strong><span>oferta bem amarrada</span></div></div><a className="specialist-cta" data-cursor="chamar" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{dict.specialist.cta} <ArrowRight /></a><span className="specialist-note">{dict.specialist.note}</span></section><section id="contato" className="contact paper"><div className="eyebrow">{dict.contact.eyebrow}</div><div className="contact-content"><h2>{dict.contact.title}<br /><em>{dict.contact.emphasis}</em></h2><div><p>{dict.contact.paragraph}</p><a className="contact-whatsapp shine-cta" data-cursor="chamar" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{dict.contact.whatsapp}</a><small className="contact-response">{dict.contact.response}</small></div></div><div className="contact-links"><a href="https://www.instagram.com/aymarlabs/" target="_blank" rel="noopener noreferrer">{dict.contact.instagram} <ArrowUpRight /></a></div></section><FaqSection dict={dict} /></main><footer className="footer dark"><BrandLogo size="lg" className="logo-footer" label={dict.brand} /><div><span className="footer-label">{dict.footer.contact}</span><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a></div><div><span className="footer-label">{dict.footer.social}</span><a href="https://www.instagram.com/aymarlabs/" target="_blank" rel="noopener noreferrer">instagram</a></div><div><span className="footer-label">{dict.footer.studio}</span><span>{dict.footer.location}</span></div><small>{dict.footer.copy}</small></footer></>;
}
