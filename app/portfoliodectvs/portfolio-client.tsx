'use client';

import { upload } from '@vercel/blob/client';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { PortfolioOffer } from '../../lib/portfolio';
import styles from './portfolio.module.css';
import extras from './portfolio-extras.module.css';

export type StoredVideo = { pathname: string; url: string; uploadedAt: string };
type Card = { key: string; name: string; source: 'Drive' | 'Arquivo'; src: string; thumbnail?: string; external: string };

function readableName(name: string) {
  return name.replace(/^\d{13}-/, '').replace(/-[a-zA-Z0-9]{8,}(?=\.)/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
}

function safeFileName(name: string) {
  const dot = name.lastIndexOf('.');
  const extension = name.slice(dot + 1).toLowerCase();
  const base = name.slice(0, dot).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 85);
  return `${base || 'video'}.${extension}`;
}

export default function PortfolioClient({ offers, uploads, uploadConfigured, initialAdmin, initialUsername }: { offers: PortfolioOffer[]; uploads: StoredVideo[]; uploadConfigured: boolean; initialAdmin: boolean; initialUsername: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(offers[0].slug);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Card | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
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
  const uploadCounts = useMemo(() => Object.fromEntries(offers.map((offer) => [offer.slug, uploads.filter((item) => item.pathname.startsWith(`portfolio/${offer.slug}/`)).length])), [offers, uploads]);
  const cards = useMemo<Card[]>(() => {
    const drive = current.videos.map(({ id, name }) => ({ key: `drive-${id}`, name, source: 'Drive' as const, src: `https://drive.google.com/file/d/${id}/preview`, thumbnail: `https://drive.google.com/thumbnail?id=${id}&sz=w600`, external: `https://drive.google.com/file/d/${id}/view` }));
    const stored = uploads.filter((item) => item.pathname.startsWith(`portfolio/${current.slug}/`)).map((item) => ({ key: `blob-${item.pathname}`, name: item.pathname.split('/').at(-1) ?? 'Vídeo', source: 'Arquivo' as const, src: item.url, external: item.url }));
    return [...stored, ...drive].filter((item) => readableName(item.name).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  }, [current, query, uploads]);
  const selectedVisibleCards = cards.filter((card) => selectedCards.includes(card.key));

  useEffect(() => {
    if (!adminOpen) return;
    fetch('/api/portfolio/session').then((response) => response.json()).then((data) => setAuthenticated(Boolean(data.admin))).catch(() => {});
  }, [adminOpen]);

  useEffect(() => {
    if (!active && !adminOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setActive(null); setAdminOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, adminOpen]);

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
          access: 'public', handleUploadUrl: '/api/portfolio/upload', multipart: file.size > 100 * 1024 * 1024,
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
        body: JSON.stringify(isDriveVideo ? { source: 'drive', id: card.key.slice('drive-'.length) } : { source: 'upload', pathname: card.key.slice('blob-'.length) }),
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

  function toggleCardSelection(key: string) {
    setSelectedCards((selection) => selection.includes(key) ? selection.filter((item) => item !== key) : [...selection, key]);
  }

  function toggleAllVisibleCards() {
    const allVisibleAreSelected = cards.length > 0 && cards.every((card) => selectedCards.includes(card.key));
    setSelectedCards((selection) => allVisibleAreSelected
      ? selection.filter((key) => !cards.some((card) => card.key === key))
      : Array.from(new Set([...selection, ...cards.map((card) => card.key)])));
  }

  function downloadSelected() {
    for (const card of selectedVisibleCards) {
      const params = new URLSearchParams(card.source === 'Drive'
        ? { source: 'drive', id: card.key.slice('drive-'.length) }
        : { source: 'upload', pathname: card.key.slice('blob-'.length) });
      const anchor = document.createElement('a');
      anchor.href = `/api/portfolio/download?${params.toString()}`;
      anchor.download = safeFileName(card.name);
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    setNotice(`${selectedVisibleCards.length} download${selectedVisibleCards.length === 1 ? '' : 's'} iniciado${selectedVisibleCards.length === 1 ? '' : 's'}. Se o navegador pedir, permita vários downloads.`);
  }

  async function removeSelected() {
    const selectedUploads = selectedVisibleCards.filter((card) => card.source === 'Arquivo');
    const selectedDriveVideos = selectedVisibleCards.filter((card) => card.source === 'Drive');
    const warning = selectedUploads.length && selectedDriveVideos.length
      ? `Remover ${selectedVisibleCards.length} vídeos? Os ${selectedUploads.length} enviados serão excluídos do armazenamento; os ${selectedDriveVideos.length} do Drive apenas sairão do portfólio e continuarão nas pastas originais.`
      : selectedDriveVideos.length
        ? `Remover ${selectedDriveVideos.length} vídeos do portfólio? Os arquivos originais continuarão nas pastas do Drive.`
        : `Excluir ${selectedUploads.length} vídeos do armazenamento do portfólio? Essa ação não pode ser desfeita.`;
    if (!selectedVisibleCards.length || !window.confirm(warning)) return;
    setBusy(true); setNotice('');
    try {
      let deleted = 0;
      if (selectedDriveVideos.length) {
        const response = await fetch('/api/portfolio/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'drive', ids: selectedDriveVideos.map((card) => card.key.slice('drive-'.length)) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível remover os vídeos do Drive.');
        deleted += data.deleted;
      }
      if (selectedUploads.length) {
        const response = await fetch('/api/portfolio/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'upload', pathnames: selectedUploads.map((card) => card.key.slice('blob-'.length)) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível excluir os vídeos enviados.');
        deleted += data.deleted;
      }
      setSelectedCards([]);
      setNotice(`${deleted} ${deleted === 1 ? 'vídeo removido' : 'vídeos removidos'} com sucesso.`);
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível remover os vídeos selecionados.');
      router.refresh();
    } finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLogo size="sm" className={styles.logo} href="/" label="Aymar Labs, página inicial" />
      <span className={styles.headerLabel}>Biblioteca de criativos</span>
      <div className={extras.headerActions}>{username && <span className={extras.username}>@{username}</span>}{authenticated && <button className={styles.adminButton} onClick={() => { setUploadOffer(selected); setNotice(''); setAdminOpen(true); }}>+ Adicionar vídeo</button>}<button className={extras.signOut} onClick={async () => { await fetch('/api/portfolio/session', { method: 'DELETE' }); router.refresh(); }}>Sair</button></div>
    </header>

    <section className={styles.hero}>
      <div className={styles.eyebrow}><span className={styles.blueDot} /> AYMAR LABS / PORTFÓLIO DE CTVS</div>
      <h1>Ideias que <em>viraram vídeo.</em></h1>
      <div className={styles.heroBottom}><p>Criativos organizados por oferta. Escolha uma campanha para explorar as peças.</p><span>{String(offers.length).padStart(2, '0')} OFERTAS <i /> {String(offers.reduce((sum, offer) => sum + offer.videos.length, uploads.length)).padStart(2, '0')} VÍDEOS</span></div>
    </section>

    <nav className={`${styles.offers} ${extras.offerNav}`} aria-label="Ofertas">
      {offers.map((offer, index) => <button key={offer.slug} className={`${styles.offer} ${selected === offer.slug ? styles.offerActive : ''}`} onClick={() => { setSelected(offer.slug); setQuery(''); setSelectedCards([]); }} aria-current={selected === offer.slug ? 'page' : undefined}>
        <span className={styles.offerIndex}>{String(index + 1).padStart(2, '0')}</span>
        <strong>{offer.name}</strong>
        <span className={styles.market}>{offer.market}</span>
        <span className={styles.offerCount}>{offer.videos.length + (uploadCounts[offer.slug] ?? 0)}</span>
      </button>)}
    </nav>

    <section className={styles.gallery}>
      <div className={styles.galleryHead}>
        <div><span className={styles.sectionLabel}>OFERTA / {current.market}</span><h2>{current.name}<span>.</span></h2></div>
      <div className={styles.tools}><input aria-label="Buscar vídeo nesta oferta" placeholder="Buscar vídeo..." value={query} onChange={(event) => setQuery(event.target.value)} />{authenticated && <a href={`https://drive.google.com/drive/folders/${current.folderId}`} target="_blank" rel="noopener noreferrer">Abrir pasta no Drive ↗</a>}</div>
      </div>
      {notice && !adminOpen && <p className={styles.pageNotice} role="status">{notice}</p>}
      <div className={styles.bulkActions}>
        <button type="button" onClick={toggleAllVisibleCards} disabled={!cards.length}>{cards.length > 0 && cards.every((card) => selectedCards.includes(card.key)) ? 'Desmarcar visíveis' : `Selecionar visíveis (${cards.length})`}</button>
        {selectedVisibleCards.length > 0 && <><span>{selectedVisibleCards.length} selecionado{selectedVisibleCards.length === 1 ? '' : 's'}</span><button type="button" onClick={downloadSelected}>Baixar selecionados</button>{authenticated && <button type="button" onClick={removeSelected} disabled={busy}>Remover selecionados</button>}</>}
      </div>
      <div className={styles.grid}>{cards.map((card, index) => <article className={styles.card} key={card.key}>
        <label className={styles.cardSelect} aria-label={`Selecionar ${readableName(card.name)}`}><input type="checkbox" checked={selectedCards.includes(card.key)} onChange={() => toggleCardSelection(card.key)} /><span>Selecionar</span></label>
        <button className={styles.cardPreview} onClick={() => setActive(card)} aria-label={`Assistir ${readableName(card.name)}`}>
          <span className={styles.frame} style={card.thumbnail ? { backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.8)), url("${card.thumbnail}")` } : undefined}><span className={styles.play}>▶</span><span className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span></span>
        </button>
        <div className={styles.cardInfo}><strong>{readableName(card.name)}</strong><small>{card.source}</small></div>
        {authenticated && <button className={extras.removeVideo} onClick={() => removeVideo(card)} disabled={busy}>Remover</button>}
      </article>)}</div>
      {cards.length === 0 && <p className={styles.empty}>Nenhum vídeo encontrado nesta oferta.</p>}
    </section>
    <footer className={styles.footer}><span>© {new Date().getFullYear()} Aymar Labs</span><Link href="/">Voltar ao site ↗</Link></footer>

    {active && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}><div className={styles.playerDialog} role="dialog" aria-modal="true" aria-label={readableName(active.name)}><div className={styles.dialogHead}><div><small>{current.name} / {active.source}</small><strong>{readableName(active.name)}</strong></div><button onClick={() => setActive(null)} aria-label="Fechar vídeo">×</button></div><div className={styles.player}>{active.source === 'Drive' ? <iframe src={active.src} title={readableName(active.name)} allow="autoplay; fullscreen" allowFullScreen /> : <video src={active.src} controls autoPlay playsInline />}</div><a className={styles.externalLink} href={active.external} target="_blank" rel="noopener noreferrer">Abrir arquivo em nova aba ↗</a></div></div>}

    {adminOpen && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setAdminOpen(false); }}><div className={styles.adminDialog} role="dialog" aria-modal="true" aria-label="Adicionar vídeos"><div className={styles.dialogHead}><div><small>ADMINISTRAÇÃO</small><strong>Adicionar vídeos</strong></div><button onClick={() => setAdminOpen(false)} disabled={busy} aria-label="Fechar">×</button></div>
      {!uploadConfigured ? <p className={styles.adminText}>O envio de arquivos ainda não está conectado ao armazenamento neste ambiente.</p> : !authenticated ? <form onSubmit={signIn} className={styles.form}><p className={styles.adminText}>Entre com seu e-mail, username e senha de administração para enviar arquivos.</p><label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Username<input type="text" autoComplete="nickname" placeholder="ex.: pablo.carmo" pattern="[A-Za-z0-9_.-]{3,24}" title="De 3 a 24 caracteres, sem espaços" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button></form> : <form onSubmit={sendVideos} className={styles.form}><label>Oferta<select value={uploadOffer} onChange={(event) => setUploadOffer(event.target.value)}>{offers.map((offer) => <option value={offer.slug} key={offer.slug}>{offer.name} · {offer.market}</option>)}</select></label><label>Vídeos<input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.m4v" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><p className={styles.adminText}>MP4, MOV ou WebM. Até 1 GB por arquivo. Os novos vídeos ficam armazenados neste portfólio, separados por oferta.</p>{busy && <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>}<button type="submit" disabled={busy || !files.length}>{busy ? `Enviando ${progress}%` : `Adicionar ${files.length || ''} ${files.length === 1 ? 'vídeo' : 'vídeos'}`}</button></form>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
    </div></div>}
  </main>;
}
