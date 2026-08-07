'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import BrandLogo from './BrandLogo';
import { getWhatsAppUrl } from '../lib/site';
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

function Flag({ country }: { country: 'pt' | 'en' }) {
  if (country === 'pt') return <svg className="flag" viewBox="0 0 16 12" aria-hidden="true"><rect width="16" height="12" rx="1" fill="#168044" /><path d="m8 1.2 5.2 4.8L8 10.8 2.8 6 8 1.2Z" fill="#f7d046" /><circle cx="8" cy="6" r="2.1" fill="#2354a0" /></svg>;
  return <svg className="flag" viewBox="0 0 16 12" aria-hidden="true"><rect width="16" height="12" rx="1" fill="#183b8f" /><path d="M0 0 6.2 4.7V0h3.6v4.7L16 0v3.2L11.5 6 16 8.8V12l-6.2-4.7V12H6.2V7.3L0 12V8.8L4.5 6 0 3.2V0Z" fill="#fff" /><path d="M0 0 6.8 5.1V0h2.4v5.1L16 0v2l-5.3 4 5.3 4v2L9.2 6.9V12H6.8V6.9L0 12v-2l5.3-4L0 2V0Z" fill="#bd1f36" /></svg>;
}

function LanguageSwitcher({ dict }: { dict: Dict }) {
  const [hash, setHash] = useState('');
  useEffect(() => setHash(window.location.hash), []);
  const target = dict.lang === 'pt' ? 'en' : 'pt';
  const href = `${target === 'en' ? '/en' : '/'}${hash}`;
  return <div className="language-switcher" aria-label={dict.ui.languageSelector}><Link href={dict.lang === 'pt' ? '/' + hash : href} className={dict.lang === 'pt' ? 'language-active' : ''} aria-label={dict.language.switchPt}><Flag country="pt" /><span>PT</span></Link><i aria-hidden="true" /><Link href={dict.lang === 'en' ? '/en' + hash : href} className={dict.lang === 'en' ? 'language-active' : ''} aria-label={dict.language.switchEn}><Flag country="en" /><span>EN</span></Link></div>;
}

function Header({ dict, whatsappUrl }: { dict: Dict; whatsappUrl: string }) {
  const [open, setOpen] = useState(false); const [scrolled, setScrolled] = useState(false); const [hidden, setHidden] = useState(false); const lastScroll = useRef(0);
  const links = useMemo(() => [['#studio', dict.nav.studio], ['#trabalhos', dict.nav.work], ['#processo', dict.nav.process], ['#especialista', dict.nav.specialist], ['#contato', dict.nav.contact]], [dict]);
  useEffect(() => { const onScroll = () => { const current = window.scrollY; const delta = current - lastScroll.current; setScrolled(current > 20); if (open || current <= 20) setHidden(false); else if (Math.abs(delta) >= 8) setHidden(delta > 0); lastScroll.current = current; }; window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, [open]);
  useEffect(() => { document.body.classList.toggle('menu-open', open); return () => document.body.classList.remove('menu-open'); }, [open]);
  return <header className={`header ${scrolled ? 'scrolled' : ''} ${hidden && !open ? 'header-hidden' : ''}`}><BrandLogo size="sm" label={dict.brand} /><nav>{links.map(([href, text]) => <a key={href} href={href}>{text}</a>)}<LanguageSwitcher dict={dict} /><a className="header-talk" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{dict.nav.cta}</a></nav><button className={`hamburger ${open ? 'open' : ''}`} aria-label={open ? dict.ui.closeMenu : dict.ui.openMenu} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(value => !value)}><span /><span /></button><AnimatePresence>{open && <motion.div id="mobile-menu" className="mobile-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><BrandLogo size="md" className="mobile-nav-brand" label={dict.brand} />{links.map(([href, text], index) => <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: index * .05 } }}>{text}</motion.a>)}<LanguageSwitcher dict={dict} /><a className="mobile-talk" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{dict.nav.cta}</a></motion.div>}</AnimatePresence></header>;
}

function Dock({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState(false); const [theme, setTheme] = useState<'dark' | 'light'>('dark'); const dockRef = useRef<HTMLDivElement>(null); const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'); const outside = (event: MouseEvent) => { if (open && dockRef.current && !dockRef.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener('mousedown', outside); return () => document.removeEventListener('mousedown', outside); }, [open]);
  useEffect(() => { if (!open) triggerRef.current?.focus(); }, [open]);
  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; localStorage.setItem('aymar-theme', next); setTheme(next); };
  return <div className={`dock ${open ? 'dock-open' : ''}`} ref={dockRef}><AnimatePresence initial={false}>{open && <motion.nav id="dock-panel" className="dock-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><BrandLogo size="sm" className="dock-brand" label={dict.brand} /><a href="#studio" onClick={() => setOpen(false)}>{dict.nav.studio}</a><a href="#trabalhos" onClick={() => setOpen(false)}>{dict.nav.work}</a><a href="#processo" onClick={() => setOpen(false)}>{dict.nav.process}</a><a href="#especialista" onClick={() => setOpen(false)}>{dict.nav.specialist}</a><a href="#contato" onClick={() => setOpen(false)}>{dict.nav.contact}</a><button className="dock-button dock-theme" onClick={toggleTheme}><span className="dock-sun">{theme === 'dark' ? '☼' : '◐'}</span>{theme === 'dark' ? 'light' : 'dark'}</button></motion.nav>}</AnimatePresence><div className="dock-bar"><button ref={triggerRef} className="dock-button" aria-label={dict.nav.menu} aria-expanded={open} aria-controls="dock-panel" onClick={() => setOpen(value => !value)}><span className={`dock-menu-icon ${open ? 'is-open' : ''}`}><i /><i /></span><span>{dict.nav.menu}</span></button><i className="dock-dot" aria-hidden="true" /></div></div>;
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
  return <motion.article className="project-card" data-cursor={hoverLabel} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ delay: index * .04, duration: .5 }}><div className="project-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{project.badge}</b></div><a className="preview-frame" href={info.url} target="_blank" rel="noopener noreferrer"><div className="project-art" style={{ '--project-bg': info.colors.background } as CSSProperties}><div className={`project-art-placeholder ${loaded ? 'is-hidden' : ''}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{project.title}</strong><small>{dict.work.preview}</small></div><Image src={`/references/${info.slug}.png`} alt={`Landing page ${project.title} — ${project.category}`} fill sizes="(max-width: 719px) 88vw, (max-width: 900px) 42vw, 28vw" className={`project-art-image ${loaded ? 'is-loaded' : 'is-hidden'}`} onLoad={() => setLoaded(true)} /></div></a><a className="project-info" href={info.url} target="_blank" rel="noopener noreferrer"><div><h3>{project.title}</h3><p>{project.meta}</p></div><span>→</span></a></motion.article>;
}

function ChatbotDemo({ dict, running }: { dict: Dict; running: boolean }) {
  const messages = dict.specialist.chatbot.customer.flatMap((customer, index) => [{ text: customer, side: 'received', key: `c${index}` }, { text: dict.specialist.chatbot.bot[index], side: 'sent', key: `b${index}` }]);
  return <div className={`demo-stage demo-chat ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="phone-shell"><div className="phone-top"><i /> <span>{dict.ui.phone}</span><b>···</b></div><div className="chat-list">{messages.map((message, index) => <div className={`chat-row ${message.side}`} key={message.key} style={{ '--delay': `${index * 1.15}s` } as CSSProperties}><div className="chat-bubble">{message.text}<small>{index % 2 ? dict.ui.sentTime : dict.ui.receivedTime}</small></div></div>)}<div className="chat-typing"><i /><i /><i /></div></div></div></div>;
}

function RepetitiveDemo({ dict, running }: { dict: Dict; running: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => { if (!running) return; const started = Date.now(); const timer = window.setInterval(() => { const elapsed = (Date.now() - started) % 7200; setCount(Math.min(1248, Math.round((elapsed / 7200) * 1248))); }, 40); return () => window.clearInterval(timer); }, [running]);
  return <div className={`demo-stage demo-repetitive ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="records-head"><div><strong>{running ? count.toLocaleString(dict.lang === 'en' ? 'en-US' : 'pt-BR') : '1.248'}</strong><span>{dict.specialist.repetitive.counter}</span></div><b>{dict.ui.live}</b></div><div className="record-list">{dict.specialist.repetitive.rows.map((row, index) => <div className="record-row" key={row} style={{ '--row-delay': `${index * .6}s` } as CSSProperties}><code>#{4821 + index}</code><span>{row}</span><em>na fila</em><i>✓</i></div>)}</div></div>;
}

function DashboardDemo({ dict, running }: { dict: Dict; running: boolean }) {
  const bars = [46, 70, 54, 86, 63, 95, 76];
  return <div className={`demo-stage demo-dashboard ${running ? 'is-running' : ''}`}><span className="demo-label">{dict.specialist.demo}</span><div className="dashboard-top"><i /><i /><i /><span>{dict.ui.dataToday}</span></div><div className="dashboard-grid"><div className="bar-chart">{bars.map((height, index) => <i key={index} style={{ '--height': `${height}%`, '--bar-delay': `${index * .08}s` } as CSSProperties} />)}</div><svg className="sparkline" viewBox="0 0 240 80" preserveAspectRatio="none"><path d="M0 60 C22 52 28 63 48 43 S74 55 93 34 S120 43 140 24 S170 38 187 16 S218 28 240 5" /></svg><div className="kpi"><span>{dict.ui.revenue}</span><strong>{dict.specialist.dashboard.currency}</strong></div><div className="kpi"><span>{dict.ui.automation}</span><strong>{dict.specialist.dashboard.percent}</strong></div></div></div>;
}

function SpecialistDemos({ dict }: { dict: Dict }) {
  const [active, setActive] = useState(0); const [visible, setVisible] = useState(false); const sectionRef = useRef<HTMLDivElement>(null); const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches); const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .18 }); if (sectionRef.current) observer.observe(sectionRef.current); return () => observer.disconnect(); }, []);
  useEffect(() => { if (!visible || reduced) return; const timer = window.setInterval(() => setActive(value => (value + 1) % 3), 7000); return () => window.clearInterval(timer); }, [visible, reduced]);
  const running = visible && !reduced;
  return <div className="specialist-demos" ref={sectionRef}><div className="demo-tabs" role="tablist">{dict.specialist.tabs.map((tab, index) => <button key={tab.label} role="tab" aria-selected={active === index} className={active === index ? 'is-active' : ''} onClick={() => setActive(index)}><span>{tab.label}</span><i /></button>)}</div><div className="demo-layout"><div className="demo-stage-wrap"><AnimatePresence mode="wait"><motion.div key={active} className="demo-animated" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>{active === 0 ? <ChatbotDemo dict={dict} running={running} /> : active === 1 ? <RepetitiveDemo dict={dict} running={running} /> : <DashboardDemo dict={dict} running={running} />}</motion.div></AnimatePresence></div><p className="demo-copy">{dict.specialist.tabs[active].text}</p></div></div>;
}

export default function Site({ dict }: { dict: Dict }) {
  const [loaded, setLoaded] = useState(false); const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches; const whatsappUrl = getWhatsAppUrl(dict.whatsapp);
  useEffect(() => { const timer = window.setTimeout(() => setLoaded(true), reduced ? 0 : 520); return () => window.clearTimeout(timer); }, [reduced]);
  return <><AnimatePresence>{!loaded && <motion.div className="loader" initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: .45 }}><BrandLogo size="md" label={dict.brand} /><div className="loader-bar"><motion.i initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: .5 }} /></div><span>{dict.loader}</span></motion.div>}</AnimatePresence><Header dict={dict} whatsappUrl={whatsappUrl} /><Cursor label="" /><Dock dict={dict} /><main id="top"><section className="hero dark"><div className="hero-eyebrow"><i /> {dict.hero.eyebrow}</div><h1><span>{dict.hero.title}</span><em>{dict.hero.emphasis}</em></h1><p className="hero-description">{dict.hero.paragraph}</p><a className="hero-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{dict.hero.cta}</a><a className="scroll-arrow" href="#studio">↓</a><div className="hero-bottom"><span>01 / 05</span><span>{dict.hero.location}</span></div></section><Marquee>{dict.marquee.first}</Marquee><section id="studio" className="studio paper"><div className="eyebrow">{dict.studio.eyebrow}</div><div className="two-col"><h2>{dict.studio.title}<br /><em>{dict.studio.emphasis}</em></h2><p>{dict.studio.paragraph}</p></div></section><section id="trabalhos" className="work dark"><div className="eyebrow">{dict.work.eyebrow}</div><div className="work-layout"><aside className="work-editorial"><p>{dict.work.editorialBefore}<a className="pkg-inline-link" href="https://www.instagram.com/agenciapkg/" target="_blank" rel="noopener noreferrer">{dict.work.editorialLink}</a>{dict.work.editorialAfter}</p><small>{dict.work.hover}</small></aside><div className="projects-wall">{projectInfo.map((_, index) => <ProjectCard key={projectInfo[index].slug} index={index} dict={dict} hoverLabel={dict.work.hover} />)}</div></div></section><section id="processo" className="process paper"><div className="eyebrow">{dict.process.eyebrow}</div><div className="two-col process-layout"><h2>{dict.process.title}<br /><em>{dict.process.emphasis}</em></h2><div className="process-list">{dict.process.items.map((item, index) => <div className="process-item" key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><b>↗</b></div>)}</div></div></section><Marquee light>{dict.marquee.second}</Marquee><section id="especialista" className="specialist dark"><div className="eyebrow">{dict.specialist.eyebrow}</div><div className="specialist-content"><h2>{dict.specialist.title}<br /><em>{dict.specialist.emphasis}</em></h2><p>{dict.specialist.paragraph}</p></div><div className="specialist-proof">{dict.specialist.stats.map(stat => <div key={stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div><SpecialistDemos dict={dict} /><a className="specialist-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{dict.specialist.cta}</a><span className="specialist-note">{dict.specialist.note}</span></section><section id="contato" className="contact paper"><div className="eyebrow">{dict.contact.eyebrow}</div><div className="contact-content"><h2>{dict.contact.title}<br /><em>{dict.contact.emphasis}</em></h2><div><p>{dict.contact.paragraph}</p><a className="mega-mail" href={`mailto:contatos.aymar@gmail.com?subject=${encodeURIComponent(dict.mailSubject)}`}>contatos.aymar@gmail.com <span>↗</span></a></div></div><div className="contact-links"><a href="https://www.instagram.com/aymarhq/" target="_blank" rel="noopener noreferrer">{dict.contact.instagram}</a><a href="https://www.instagram.com/agenciapkg/" target="_blank" rel="noopener noreferrer">{dict.contact.pkg}</a><a href={`mailto:contatos.aymar@gmail.com?subject=${encodeURIComponent(dict.mailSubject)}`}>{dict.contact.brief}</a></div></section></main><footer className="footer dark"><BrandLogo size="lg" className="logo-footer" label={dict.brand} /><div><span className="footer-label">{dict.footer.contact}</span><a href="mailto:contatos.aymar@gmail.com">contatos.aymar@gmail.com</a></div><div><span className="footer-label">{dict.footer.social}</span><a href="https://www.instagram.com/aymarhq/" target="_blank" rel="noopener noreferrer">instagram ↗</a><a href="https://www.instagram.com/agenciapkg/" target="_blank" rel="noopener noreferrer">pkg ↗</a></div><div><span className="footer-label">{dict.footer.studio}</span><span>{dict.footer.location}</span></div><small>{dict.footer.copy}</small></footer></>;
}
