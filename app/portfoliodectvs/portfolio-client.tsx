'use client';

import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import { ArrowUpRight, Close } from '../../components/Icon';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import styles from './portfolio.module.css';
import extras from './portfolio-extras.module.css';
import playStyles from './portfolio-play.module.css';
import playerStyles from './video-player.module.css';

export type StoredVideo = { pathname: string; uploadedAt: string };
export type LibraryVideo = { key: string; name: string; source: 'Drive' | 'Arquivo'; src: string; thumbnail?: string; driveIndex?: number; pathname?: string };
export type LibraryOffer = { slug: string; name: string; market: 'BR' | 'MX'; videos: LibraryVideo[] };
type Card = LibraryVideo;

function readableName(name: string) {
  return name.replace(/^\d{13}-/, '').replace(/-[a-zA-Z0-9]{8,}(?=\.)/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
}

function safeFileName(name: string) {
  const dot = name.lastIndexOf('.');
  const extension = name.slice(dot + 1).toLowerCase();
  const base = name.slice(0, dot).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 85);
  return `${base || 'video'}.${extension}`;
}

export default function PortfolioClient({ offers, uploadConfigured, initialAdmin, initialUsername }: { offers: LibraryOffer[]; uploadConfigured: boolean; initialAdmin: boolean; initialUsername: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(offers[0].slug);
  const [query, setQuery] = useState('');
  const [selectedVideoKeys, setSelectedVideoKeys] = useState<string[]>([]);
  const [active, setActive] = useState<Card | null>(null);
  const [videoRatio, setVideoRatio] = useState(16 / 9);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [authenticated, setAuthenticated] = useState(initialAdmin);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadOffer, setUploadOffer] = useState(offers[0].slug);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');

  const current = offers.find((offer) => offer.slug === selected) ?? offers[0];
  const cards = useMemo<Card[]>(() => current.videos.filter((item) => readableName(item.name).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [current, query]);

  function openVideo(card: Card) {
    setVideoRatio(16 / 9);
    setActive(card);
  }

  useEffect(() => {
    if (!adminOpen) return;
    fetch('/api/portfolio/session').then((response) => response.json()).then((data) => setAuthenticated(Boolean(data.admin))).catch(() => {});
  }, [adminOpen]);

  useEffect(() => {
    if (!active && !adminOpen && !editing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setActive(null); setAdminOpen(false); setEditing(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, adminOpen, editing]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(''); setBusy(true);
    try {
      const response = await fetch('/api/portfolio/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.');
      setAuthenticated(Boolean(data.admin)); setEmail(''); setUsername(data.username); setPassword('');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }

  async function sendVideos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length) return;
    setNotice(''); setBusy(true); setProgress(0);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(file.type)) throw new Error(`${file.name}: use MP4, MOV ou WebM.`);
        if (file.size > 1024 * 1024 * 1024) throw new Error(`${file.name}: o limite é 1 GB por vídeo.`);
        await upload(`portfolio/${uploadOffer}/${Date.now()}-${safeFileName(file.name)}`, file, {
          access: 'private', handleUploadUrl: '/api/portfolio/upload', multipart: file.size > 100 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(((i + percentage / 100) / files.length) * 100)),
        });
      }
      setNotice(`${files.length === 1 ? 'Vídeo adicionado' : 'Vídeos adicionados'} ao portfólio.`);
      setFiles([]); setSelected(uploadOffer); setProgress(100); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Falha ao enviar vídeo.'); }
    finally { setBusy(false); }
  }

  async function removeVideo(card: Card) {
    const isDriveVideo = card.source === 'Drive';
    const prompt = isDriveVideo
      ? `Remover “${readableName(card.name)}” do portfólio? O arquivo original continuará na pasta do Drive.`
      : `Excluir “${readableName(card.name)}” do armazenamento do portfólio? Essa ação não pode ser desfeita.`;
    if (!window.confirm(prompt)) return;
    setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/portfolio/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isDriveVideo ? { source: 'drive', offer: current.slug, index: card.driveIndex } : { source: 'upload', pathname: card.pathname }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível remover o vídeo.');
      setNotice(isDriveVideo ? 'Vídeo removido do portfólio.' : 'Vídeo excluído do armazenamento.');
      if (active?.key === card.key) setActive(null);
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível remover o vídeo.');
    } finally { setBusy(false); }
  }

  function toggleVideoSelection(key: string) {
    setSelectedVideoKeys((currentKeys) => currentKeys.includes(key)
      ? currentKeys.filter((currentKey) => currentKey !== key)
      : [...currentKeys, key]);
  }

  async function removeSelectedVideos() {
    const selectedCards = cards.filter((card) => selectedVideoKeys.includes(card.key));
    if (!selectedCards.length) return;
    const confirmed = window.confirm(
      `Remover ${selectedCards.length} vídeo(s) selecionado(s) desta biblioteca? Os originais do Drive serão preservados; arquivos enviados ao portfólio serão excluídos.`
    );
    if (!confirmed) return;

    setBusy(true);
    setNotice('');
    let removed = 0;
    const groups: { body: Record<string, unknown>; count: number }[] = [];
    const driveCards = selectedCards.filter((card) => card.source === 'Drive');
    const uploadedCards = selectedCards.filter((card) => card.source === 'Arquivo');
    const indices = driveCards.map((card) => card.driveIndex);
    const pathnames = uploadedCards.map((card) => card.pathname);

    if (driveCards.length) {
      if (indices.some((index) => typeof index !== 'number')) {
        setBusy(false);
        setNotice('Não foi possível identificar um dos vídeos selecionados.');
        return;
      }
      groups.push({ body: { source: 'drive', offer: current.slug, indices }, count: driveCards.length });
    }
    if (uploadedCards.length) {
      if (pathnames.some((pathname) => typeof pathname !== 'string')) {
        setBusy(false);
        setNotice('Não foi possível identificar um dos vídeos selecionados.');
        return;
      }
      groups.push({ body: { source: 'upload', pathnames }, count: uploadedCards.length });
    }

    try {
      for (const group of groups) {
        const response = await fetch('/api/portfolio/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(group.body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível remover os vídeos selecionados.');
        removed += typeof data.deleted === 'number' ? data.deleted : group.count;
      }
      setNotice(`${removed} vídeo(s) removido(s) da biblioteca.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao remover os vídeos selecionados.';
      setNotice(removed ? `${removed} vídeo(s) removido(s). O restante não foi removido: ${message}` : message);
    } finally {
      setSelectedVideoKeys([]);
      router.refresh();
      setBusy(false);
    }
  }

  function beginEdit(card: Card) {
    setEditing(card);
    setEditedTitle(readableName(card.name));
    setNotice('');
  }

  async function saveTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || editedTitle.trim().length > 100) return;
    setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/portfolio/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing.source === 'Drive'
          ? { source: 'drive', offer: current.slug, index: editing.driveIndex, title: editedTitle }
          : { source: 'upload', pathname: editing.pathname, title: editedTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível editar este vídeo.');
      setNotice('Título atualizado.');
      setEditing(null);
      router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível editar este vídeo.'); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLogo size="sm" className={styles.logo} href="/" label="Aymar Labs, página inicial" />
      <span className={styles.headerLabel}>Biblioteca de criativos</span>
      <div className={extras.headerActions}><Link className={extras.fullAccess} href="/portfoliodectvs/acesso">Acesso completo <ArrowUpRight /></Link>{authenticated && <><span className={extras.username}>@{username}</span><button className={styles.adminButton} onClick={() => { setUploadOffer(selected); setNotice(''); setAdminOpen(true); }}>+ Adicionar vídeo</button><button className={extras.signOut} onClick={async () => { await fetch('/api/portfolio/session', { method: 'DELETE' }); setAuthenticated(false); setUsername(''); setSelectedVideoKeys([]); router.refresh(); }}>Sair</button></>}</div>
    </header>

    <section className={styles.hero}>
      <div className={styles.eyebrow}><span className={styles.blueDot} /> AYMAR LABS / PORTFÓLIO DE CTVS</div>
      <h1>Ideias que <em>viraram vídeo.</em></h1>
      <div className={styles.heroBottom}><p>Criativos organizados por oferta. Escolha uma campanha para explorar as peças.</p><span>{String(offers.length).padStart(2, '0')} OFERTAS <i /> {String(offers.reduce((sum, offer) => sum + offer.videos.length, 0)).padStart(2, '0')} VÍDEOS</span></div>
    </section>

    <nav className={`${styles.offers} ${extras.offerNav}`} aria-label="Ofertas">
      {offers.map((offer, index) => <button key={offer.slug} className={`${styles.offer} ${selected === offer.slug ? styles.offerActive : ''}`} onClick={() => { setSelected(offer.slug); setQuery(''); setSelectedVideoKeys([]); }} aria-current={selected === offer.slug ? 'page' : undefined}>
        <span className={styles.offerIndex}>{String(index + 1).padStart(2, '0')}</span>
        <strong>{offer.name}</strong>
        <span className={styles.market}>{offer.market}</span>
        <span className={styles.offerCount}>{offer.videos.length}</span>
      </button>)}
    </nav>

    <section className={styles.gallery}>
      <div className={styles.galleryHead}>
        <div><span className={styles.sectionLabel}>OFERTA / {current.market}</span><h2>{current.name}<span>.</span></h2></div>
        <div className={styles.tools}><input aria-label="Buscar vídeo nesta oferta" placeholder="Buscar vídeo..." value={query} onChange={(event) => { setQuery(event.target.value); setSelectedVideoKeys([]); }} /></div>
      </div>
      {notice && !adminOpen && <p className={styles.pageNotice} role="status">{notice}</p>}
      {authenticated && cards.length > 0 && <div className={styles.bulkActions}>
        <span>{selectedVideoKeys.length} selecionado(s)</span>
        <button type="button" onClick={() => setSelectedVideoKeys(cards.map((card) => card.key))} disabled={busy || selectedVideoKeys.length === cards.length}>Selecionar todos</button>
        <button type="button" onClick={() => setSelectedVideoKeys([])} disabled={busy || selectedVideoKeys.length === 0}>Limpar seleção</button>
        <button type="button" onClick={removeSelectedVideos} disabled={busy || selectedVideoKeys.length === 0}>Remover selecionados</button>
      </div>}
      <div className={styles.grid}>{cards.map((card, index) => <article className={styles.card} key={card.key}>
        {authenticated && <label className={styles.cardSelect} onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedVideoKeys.includes(card.key)} onChange={() => toggleVideoSelection(card.key)} disabled={busy} aria-label={`Selecionar ${readableName(card.name)}`} /><span>Selecionar</span></label>}
        <button className={styles.cardPreview} onClick={() => openVideo(card)} aria-label={`Assistir ${readableName(card.name)}`}>
          <span className={`${styles.frame} ${playStyles.frame}`} style={card.thumbnail ? { backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.8)), url("${card.thumbnail}")` } : undefined}><span className={`${styles.play} ${playStyles.play}`}><Image src="/portfolio-play.svg" alt="" width={64} height={64} draggable={false} /></span><span className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span></span>
        </button>
        <div className={styles.cardInfo}><strong>{readableName(card.name)}</strong><small>{card.source}</small></div>
        {authenticated && <div className={extras.cardActions}><button className={extras.editVideo} onClick={() => beginEdit(card)} disabled={busy}>Editar título</button><button className={extras.removeVideo} onClick={() => removeVideo(card)} disabled={busy}>Remover</button></div>}
      </article>)}</div>
      {cards.length === 0 && <p className={styles.empty}>Nenhum vídeo encontrado nesta oferta.</p>}
    </section>
    <footer className={styles.footer}><span>© {new Date().getFullYear()} Aymar Labs</span><Link href="/">Voltar ao site <ArrowUpRight /></Link></footer>

    {active && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}><div className={`${styles.playerDialog} ${playerStyles.dialog}`} role="dialog" aria-modal="true" aria-label={readableName(active.name)}><div className={`${styles.dialogHead} ${playerStyles.dialogHead}`}><div><small>{current.name} / {active.source}</small><strong>{readableName(active.name)}</strong></div><button onClick={() => setActive(null)} aria-label="Fechar vídeo"><Close /></button></div><div className={`${styles.player} ${playerStyles.stage}`} style={{ width: `min(calc((100dvh - 160px) * ${videoRatio}), calc(100vw - 40px))`, height: `min(calc(100dvh - 160px), calc((100vw - 40px) / ${videoRatio}))` }}><video key={active.src} src={active.src} controls autoPlay playsInline preload="metadata" controlsList="nodownload noremoteplayback" disablePictureInPicture onLoadedMetadata={(event) => { const { videoWidth, videoHeight } = event.currentTarget; if (videoWidth > 0 && videoHeight > 0) setVideoRatio(videoWidth / videoHeight); }} onContextMenu={(event) => event.preventDefault()} /></div></div></div>}

    {adminOpen && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setAdminOpen(false); }}><div className={styles.adminDialog} role="dialog" aria-modal="true" aria-label="Adicionar vídeos"><div className={styles.dialogHead}><div><small>ADMINISTRAÇÃO</small><strong>Adicionar vídeos</strong></div><button onClick={() => setAdminOpen(false)} disabled={busy} aria-label="Fechar"><Close /></button></div>
      {!uploadConfigured ? <p className={styles.adminText}>O envio de arquivos ainda não está conectado ao armazenamento neste ambiente.</p> : !authenticated ? <form onSubmit={signIn} className={styles.form}><p className={styles.adminText}>Entre com seu e-mail, username e senha de administração para enviar arquivos.</p><label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Username<input type="text" autoComplete="nickname" placeholder="ex.: pablo.carmo" pattern="[A-Za-z0-9_.-]{3,24}" title="De 3 a 24 caracteres, sem espaços" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button></form> : <form onSubmit={sendVideos} className={styles.form}><label>Oferta<select value={uploadOffer} onChange={(event) => setUploadOffer(event.target.value)}>{offers.map((offer) => <option value={offer.slug} key={offer.slug}>{offer.name} · {offer.market}</option>)}</select></label><label>Vídeos<input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.m4v" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><p className={styles.adminText}>MP4, MOV ou WebM. Até 1 GB por arquivo. Os novos vídeos ficam armazenados neste portfólio, separados por oferta.</p>{busy && <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>}<button type="submit" disabled={busy || !files.length}>{busy ? `Enviando ${progress}%` : `Adicionar ${files.length || ''} ${files.length === 1 ? 'vídeo' : 'vídeos'}`}</button></form>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
    </div></div>}

    {editing && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setEditing(null); }}><div className={styles.adminDialog} role="dialog" aria-modal="true" aria-label="Editar vídeo"><div className={styles.dialogHead}><div><small>ADMINISTRAÇÃO</small><strong>Editar vídeo</strong></div><button onClick={() => setEditing(null)} disabled={busy} aria-label="Fechar"><Close /></button></div><form onSubmit={saveTitle} className={styles.form}><label>Título<input autoFocus maxLength={100} value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} /></label><p className={styles.adminText}>Isso altera apenas o nome exibido na biblioteca; o arquivo original não será renomeado no Drive.</p><button type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button></form>{notice && <p className={styles.notice} role="status">{notice}</p>}</div></div>}
  </main>;
}
