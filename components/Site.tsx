'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import BrandLogo from './BrandLogo';

type ProjectColors = { background: string; primary: string; secondary: string; accent: string };
type Project = { slug: string; title: string; url: string; meta: string; badge: string; colors: ProjectColors };

const projects: Project[] = [
  { slug: 'criar-saas', title: 'Criar SaaS', url: 'https://agenciapkg.com.br/criarsaas/', meta: 'produto digital · captação', badge: 'saas launch', colors: { background: '#071018', primary: '#cdd9ff', secondary: '#18283c', accent: '#7ca7ff' } },
  { slug: 'dra-aline', title: 'Dra. Aline', url: 'https://agenciapkg.com.br/dra-aline/', meta: 'saúde · autoridade', badge: 'landing page', colors: { background: '#101826', primary: '#eef3ff', secondary: '#1e2b42', accent: '#a7b8ff' } },
  { slug: 'copie-ai', title: 'Copie AI', url: 'https://agenciapkg.com.br/copie-ai/', meta: 'ia · lançamento', badge: 'ai launch', colors: { background: '#f5f5f1', primary: '#111111', secondary: '#dfe9ec', accent: '#12b9e8' } },
  { slug: 'jessica', title: 'Jessica', url: 'https://agenciapkg.com.br/jessica/', meta: 'infoproduto · conversão', badge: 'landing page', colors: { background: '#f0dfe5', primary: '#22151a', secondary: '#d9aab9', accent: '#c94977' } },
  { slug: 'master-class', title: 'Master Class', url: 'https://agenciapkg.com.br/master-class/', meta: 'evento · inscrição', badge: 'event page', colors: { background: '#07140e', primary: '#d8ff69', secondary: '#143f28', accent: '#7bff54' } },
  { slug: 'mentoria-caio', title: 'Mentoria Caio Martins', url: 'https://agenciapkg.com.br/mentoria-caio-martins/', meta: 'mentoria · high ticket', badge: 'sales page', colors: { background: '#091421', primary: '#eef6ff', secondary: '#1c3248', accent: '#2fbcff' } },
  { slug: 'isaque-mota', title: 'Isaque Mota', url: 'https://agenciapkg.com.br/isaquemota/', meta: 'marca pessoal · conversão', badge: 'landing page', colors: { background: '#100c18', primary: '#f5f0ff', secondary: '#2b1941', accent: '#b665ff' } },
  { slug: 'primeira-assinatura', title: 'Primeira Assinatura em 24h', url: 'https://primeiraassinaturaem24h.com.br/', meta: 'produto digital · conversão', badge: 'sales page', colors: { background: '#05070c', primary: '#eef4ff', secondary: '#102544', accent: '#3b8dff' } }
];

function Cursor() {
  const [label, setLabel] = useState('');
  const x = useMotionValue(-100); const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 360, damping: 35 }); const sy = useSpring(y, { stiffness: 360, damping: 35 });
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const move = (event: MouseEvent) => { x.set(event.clientX); y.set(event.clientY); };
    const enter = (event: Event) => setLabel((event.currentTarget as HTMLElement).dataset.cursor || '');
    const leave = () => setLabel('');
    window.addEventListener('mousemove', move);
    const elements = Array.from(document.querySelectorAll<HTMLElement>('a, button, [data-cursor]'));
    elements.forEach(element => { element.addEventListener('mouseenter', enter); element.addEventListener('mouseleave', leave); });
    return () => { window.removeEventListener('mousemove', move); elements.forEach(element => { element.removeEventListener('mouseenter', enter); element.removeEventListener('mouseleave', leave); }); };
  }, [x, y]);
  return <motion.div className={`cursor ${label ? 'cursor-label' : ''}`} style={{ x: sx, y: sy }}>{label}</motion.div>;
}

function Header() {
  const [open, setOpen] = useState(false); const [scrolled, setScrolled] = useState(false); const [hidden, setHidden] = useState(false); const lastScroll = useRef(0);
  const links = [['#studio', 'studio'], ['#trabalhos', 'trabalhos'], ['#processo', 'processo'], ['#contato', 'contato']];
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY; const delta = current - lastScroll.current;
      setScrolled(current > 20);
      if (open || current <= 20) setHidden(false);
      else if (Math.abs(delta) >= 8) setHidden(current > 80 && delta > 0);
      lastScroll.current = current;
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKeyDown); };
  }, [open]);
  useEffect(() => { document.body.classList.toggle('menu-open', open); if (open) { setHidden(false); window.dispatchEvent(new CustomEvent('aymar:close-dock')); } return () => document.body.classList.remove('menu-open'); }, [open]);
  return <header className={`header ${scrolled ? 'scrolled' : ''} ${hidden && !open ? 'header-hidden' : ''}`}><BrandLogo size="sm" /><nav>{links.map(([href, text]) => <a key={text} href={href}>{text}</a>)}</nav><a className="header-talk" href="#contato">vamos conversar ↗</a><button className={`hamburger ${open ? 'open' : ''}`} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(value => !value)}><span /><span /></button><AnimatePresence>{open && <motion.div id="mobile-menu" className="mobile-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><BrandLogo size="md" className="mobile-nav-brand" />{links.map(([href, text], index) => <motion.a key={text} href={href} onClick={() => setOpen(false)} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: index * .06 } }}>{text}</motion.a>)}</motion.div>}</AnimatePresence></header>;
}

function Dock() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const dockRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'light' ? 'light' : 'dark');
    const close = () => setOpen(false);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const outside = (event: MouseEvent) => { if (open && dockRef.current && !dockRef.current.contains(event.target as Node)) close(); };
    window.addEventListener('aymar:close-dock', close);
    window.addEventListener('keydown', escape);
    document.addEventListener('mousedown', outside);
    return () => { window.removeEventListener('aymar:close-dock', close); window.removeEventListener('keydown', escape); document.removeEventListener('mousedown', outside); };
  }, [open]);
  useEffect(() => { if (!open) triggerRef.current?.focus(); }, [open]);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('aymar-theme', next);
    setTheme(next);
  };
  const close = () => setOpen(false);
  return <div className={`dock ${open ? 'dock-open' : ''}`} ref={dockRef}>
    <AnimatePresence initial={false}>
      {open && <motion.nav id="dock-panel" className="dock-panel" aria-label="Navegação rápida" initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .96 }}><BrandLogo size="sm" className="dock-brand" />
        <a href="#studio" onClick={close}>studio</a><a href="#trabalhos" onClick={close}>trabalhos</a><a href="#processo" onClick={close}>processo</a><a href="#contato" onClick={close}>contato</a><a href="https://www.instagram.com/aymarhq/" target="_blank" rel="noopener noreferrer" onClick={close}>instagram ↗</a>
      </motion.nav>}
    </AnimatePresence>
    <div className="dock-bar">
      <button ref={triggerRef} className="dock-button" aria-label={open ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={open} aria-controls="dock-panel" onClick={() => setOpen(value => !value)}><span className={`dock-menu-icon ${open ? 'is-open' : ''}`}><i /><i /></span><span>menu</span></button>
      <button className="dock-button dock-theme" aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`} aria-pressed={theme === 'light'} onClick={toggleTheme}><span className="dock-sun">{theme === 'dark' ? '☼' : '◐'}</span><span>{theme === 'dark' ? 'claro' : 'escuro'}</span></button>
      <i className="dock-dot" aria-hidden="true" />
    </div>
  </div>;
}

function Marquee({ light = false, children }: { light?: boolean; children: React.ReactNode }) {
  const sequence = Array.from({ length: 6 }, (_, index) => <span className="marquee-item" key={index}>{children}</span>);
  return <div className={`marquee ${light ? 'marquee-light' : ''}`} aria-label={typeof children === 'string' ? children : undefined}><div className="marquee-track"><div className="marquee-group">{sequence}</div><div className="marquee-group" aria-hidden="true">{sequence}</div></div></div>;
}

function ProjectArt({ project, index }: { project: Project; index: number }) {
  const [loaded, setLoaded] = useState(false);
  return <div className="project-art" style={{ '--project-bg': project.colors.background } as React.CSSProperties}>
    <div className={`project-art-placeholder ${loaded ? 'is-hidden' : ''}`}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <strong>{project.title}</strong>
      <small>arte em produção</small>
    </div>
    <Image src={`/references/${project.slug}.png`} alt="" fill sizes="(max-width: 719px) 88vw, (max-width: 900px) 42vw, 28vw" className={`project-art-image ${loaded ? 'is-loaded' : 'is-hidden'}`} onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />
  </div>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const move = (event: React.MouseEvent) => { const rect = cardRef.current?.getBoundingClientRect(); if (!rect) return; setTilt({ x: (event.clientX - rect.left - rect.width / 2) / 55, y: (event.clientY - rect.top - rect.height / 2) / 55 }); };
  return <motion.article ref={cardRef} className="project-card" data-cursor="ver projeto" initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24, y: 14 + (index % 3) * 5 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ delay: index * .06, duration: .5 }} onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0 })}><div className="project-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{project.badge}</b></div><a className="preview-frame" href={project.url} target="_blank" rel="noopener noreferrer" style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}><ProjectArt project={project} index={index} /></a><a className="project-info" href={project.url} target="_blank" rel="noopener noreferrer"><div><h3>{project.title}</h3><p>{project.meta}</p></div><span>→</span></a></motion.article>;
}

export default function Site() {
  const [loaded, setLoaded] = useState(false); const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => { const timer = window.setTimeout(() => setLoaded(true), reduced ? 0 : 520); return () => window.clearTimeout(timer); }, [reduced]);
  return <><AnimatePresence>{!loaded && <motion.div className="loader" initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: .45, ease: [.76, 0, .24, 1] }}><BrandLogo size="md" /><div className="loader-bar"><motion.i initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: .5 }} /></div><span>carregando operação</span></motion.div>}</AnimatePresence><Header /><Cursor /><Dock /><main id="top"><section className="hero dark"><div className="hero-eyebrow"><i /> software próprio · dados unificados · ia aplicada</div><h1><span>A operação</span><span>inteligente</span><em>por trás.</em></h1><p className="hero-description">Construímos o motor que faz o seu negócio rodar. Software feito sob medida, dados que conversam entre si e IA que age no lugar dos passos que ninguém deveria estar fazendo à mão.</p><a className="scroll-arrow" href="#studio" data-magnetic>↓</a><div className="hero-bottom"><span>01 / 04</span><span>Brasil — remoto</span></div></section><Marquee>software próprio ✳ dados unificados ✳ ia aplicada ✳ automação de operação ✳ landing pages ✳ produto sob medida ✳</Marquee><section id="studio" className="studio paper"><div className="eyebrow">01 <span>o studio</span></div><div className="two-col"><h2>Não fazemos<br />site bonito.<br /><em>Fazemos operação.</em></h2><p>A aymar é um studio de tecnologia aplicada. A gente entra onde a planilha, o e-mail e a reunião viraram o produto — e devolve isso em forma de software, dado e IA que trabalha sozinho.</p></div></section><section id="trabalhos" className="work dark"><div className="work-layout"><aside className="work-editorial"><p>Uma amostra de landing pages entregues em parceria com a <a href="https://www.instagram.com/agenciapkg/" target="_blank" rel="noopener noreferrer">Agência PKG ↗</a>. Passe o mouse para ver ao vivo, clique para abrir.</p></aside><div className="projects-wall"><div className="projects-column projects-column--left">{projects.filter((_, index) => [0, 3, 4, 6, 7].includes(index)).map(project => <ProjectCard key={project.slug} project={project} index={projects.indexOf(project)} />)}</div><div className="projects-column projects-column--right">{projects.filter((_, index) => [1, 2, 5].includes(index)).map(project => <ProjectCard key={project.slug} project={project} index={projects.indexOf(project)} />)}</div></div></div></section><section id="processo" className="process paper"><div className="eyebrow">03 <span>processo</span></div><div className="two-col process-layout"><h2>Três coisas<br /><em>bem feitas.</em></h2><div className="process-list">{[['Software próprio', 'Sistemas sob medida — landing pages, dashboards, produtos internos. Sem framework de prateleira, sem plugin que quebra em três meses.'], ['Dados unificados', 'A gente pluga o que você já usa em uma camada única. Um lugar só onde vendas, marketing e operação enxergam a mesma verdade.'], ['IA aplicada', 'Modelos que executam passos reais do seu processo. Não é chatbot no rodapé — é agente que abre chamado, escreve e-mail, atualiza CRM.']].map(([title, copy], index) => <div className="process-item" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><b>↗</b></div>)}</div></div></section><Marquee light>a tecnologia chega antes do problema ✳ a tecnologia chega antes do problema ✳</Marquee><section id="contato" className="contact dark"><div className="eyebrow">04 <span>contato</span></div><div className="contact-content"><h2>Tem uma<br />operação<br /><em>para arrumar?</em></h2><div><p>Escreva direto. A gente responde em até dois dias úteis, com uma pessoa de verdade do outro lado.</p><a className="mega-mail" href="mailto:contatos.aymar@gmail.com">contatos.aymar@gmail.com <span>↗</span></a></div></div><div className="contact-links"><a href="https://www.instagram.com/aymarhq/" target="_blank" rel="noopener noreferrer">instagram ↗</a><a href="https://www.instagram.com/agenciapkg/" target="_blank" rel="noopener noreferrer">parceria pkg ↗</a><a href="mailto:contatos.aymar@gmail.com?subject=Proposta%20Aymar">enviar briefing ↗</a></div></section></main><footer className="footer dark"><BrandLogo size="lg" className="logo-footer" /><div><span className="footer-label">contato</span><a href="mailto:contatos.aymar@gmail.com">contatos.aymar@gmail.com</a></div><div><span className="footer-label">redes</span><a href="https://www.instagram.com/aymarhq/" target="_blank" rel="noopener noreferrer">instagram ↗</a><a href="https://agenciapkg.com.br" target="_blank" rel="noopener noreferrer">pkg ↗</a></div><div><span className="footer-label">studio</span><span>BRASIL, REMOTO</span></div><small>© 2026 aymar · a tecnologia chega antes do problema.</small></footer></>;
}
