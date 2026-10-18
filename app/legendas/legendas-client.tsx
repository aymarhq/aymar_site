'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowLeft, ChevronDown, Cloud, Download, Eye, Key, Phone, Plus, Settings, Sparkles, Trash, Upload } from '../../components/Icon';
import styles from './legendas.module.css';

type Stage = 'upload' | 'ready' | 'transcribing' | 'editor';
type Tab = 'styles' | 'captions' | 'scenes';
type Word = { text: string; start: number; end: number; confidence?: number };
type Caption = { id: string; start: number; end: number; text: string; visible: boolean };
type TranscriptResponse = { id?: string; status?: string; text?: string; words?: Word[]; language_code?: string; error?: string };
type VideoInfo = { width: number; height: number; duration: number; ratio: string; orientation: string };
type VideoBox = { left: number; width: number; bottom: number; fontSize: number };

const languages = [
  ['auto', 'Detectar automaticamente'], ['pt', 'Português'], ['en', 'Inglês'], ['es', 'Espanhol'],
  ['fr', 'Francês'], ['de', 'Alemão'], ['it', 'Italiano'], ['nl', 'Holandês'], ['pl', 'Polonês'],
] as const;

const captionStyles = [
  ['hormozi', 'HORMOZI 1'], ['hormozi-two', 'HORMOZI 2'], ['beast', 'BEAST'], ['negative', 'Negativa'],
  ['cove', 'Cove'], ['marina', 'Marina'], ['leon', 'LEON'], ['laguna', 'LAGUNA'], ['tuba', 'Tuba'],
  ['splitz', 'Splitz'], ['aria', 'Aria'], ['stack', 'Stack'], ['lume', 'Lume'], ['marca', 'MARCA'],
  ['canto', 'Canto'], ['silk', 'Silk'], ['slash', 'SLASH'], ['dense', 'Dense'], ['open', 'Open'],
  ['vibe', 'Vibe'], ['rise', 'Rise'],
] as const;

const styleCanvas: Record<string, { fill: string; stroke: string; font: string; box?: string }> = {
  hormozi: { fill: '#ffffff', stroke: '#000000', font: '900 54px Arial' },
  'hormozi-two': { fill: '#f5ed00', stroke: '#000000', font: '900 54px Arial' },
  beast: { fill: '#fff200', stroke: '#050505', font: 'italic 900 58px Arial' },
  negative: { fill: '#ffffff', stroke: '#000000', font: '700 48px Georgia' },
  cove: { fill: '#ffffff', stroke: '#111111', font: '700 48px Arial' },
  marina: { fill: '#ffffff', stroke: '#1d1d1d', font: '700 47px Georgia' },
  leon: { fill: '#ffffff', stroke: '#ff4b1f', font: '900 50px Arial', box: '#ff4b1f' },
  laguna: { fill: '#ffffff', stroke: '#222222', font: '900 50px Arial' },
  tuba: { fill: '#ffffff', stroke: '#111111', font: '800 48px Arial' },
  splitz: { fill: '#e7a16d', stroke: '#281408', font: 'italic 700 48px Georgia' },
  aria: { fill: '#ffc928', stroke: '#111111', font: '700 48px Arial' },
  stack: { fill: '#ffffff', stroke: '#111111', font: '900 48px Arial' },
  lume: { fill: '#dba64f', stroke: '#251707', font: '700 47px Georgia' },
  marca: { fill: '#111111', stroke: '#f8e71c', font: '700 48px Georgia', box: '#f8e71c' },
  canto: { fill: '#ddbd88', stroke: '#291d10', font: 'italic 700 48px Georgia' },
  silk: { fill: '#00d8c2', stroke: '#001b18', font: '700 47px Arial' },
  slash: { fill: '#ff39a5', stroke: '#240014', font: '900 48px Arial' },
  dense: { fill: '#d8ff00', stroke: '#142000', font: '900 49px Arial' },
  open: { fill: '#19e5d0', stroke: '#002b26', font: '700 47px Arial' },
  vibe: { fill: '#00d48d', stroke: '#002519', font: '700 47px Arial' },
  rise: { fill: '#ffd318', stroke: '#2b2200', font: '800 48px Arial' },
};

function safeName(name: string) { return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'video.mp4'; }
function time(ms: number) { const total = Math.max(0, ms) / 1000; return `${Math.floor(total / 60)}:${(total % 60).toFixed(2).padStart(5, '0')}`; }
function timestamp(ms: number, vtt = false) { const total = Math.max(0, ms); const hours = Math.floor(total / 3600000); const minutes = Math.floor((total % 3600000) / 60000); const seconds = Math.floor((total % 60000) / 1000); const millis = Math.floor(total % 1000); return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${vtt ? '.' : ','}${String(millis).padStart(3, '0')}`; }

function buildCaptions(words: Word[] = [], fallback = ''): Caption[] {
  if (!words.length) return fallback.trim() ? fallback.split(/(?<=[.!?])\s+/).filter(Boolean).map((text, index) => ({ id: crypto.randomUUID(), start: index * 2500, end: (index + 1) * 2500, text, visible: true })) : [];
  const result: Caption[] = []; let bucket: Word[] = [];
  const flush = () => { if (!bucket.length) return; result.push({ id: crypto.randomUUID(), start: bucket[0].start, end: bucket[bucket.length - 1].end, text: bucket.map((word) => word.text).join(' '), visible: true }); bucket = []; };
  for (const word of words) {
    const last = bucket[bucket.length - 1];
    if (last && (word.start - last.end > 650 || word.end - bucket[0].start > 2800 || bucket.length >= 5)) flush();
    bucket.push(word);
    if (/[.!?]$/.test(word.text)) flush();
  }
  flush(); return result;
}

function driveDirectUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname !== 'drive.google.com') return null;
    const fromPath = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    const id = fromPath || url.searchParams.get('id');
    return id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : null;
  } catch { return null; }
}

function downloadText(name: string, text: string, type: string) {
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function gcd(left: number, right: number): number { return right ? gcd(right, left % right) : left; }
function describeVideo(width: number, height: number, duration: number): VideoInfo {
  const divisor = gcd(width, height); const exact = `${Math.round(width / divisor)}:${Math.round(height / divisor)}`; const value = width / height;
  const known = [[9 / 16, '9:16'], [4 / 5, '4:5'], [1, '1:1'], [5 / 4, '5:4'], [4 / 3, '4:3'], [16 / 9, '16:9']] as const;
  const closest = known.reduce((best, current) => Math.abs(current[0] - value) < Math.abs(best[0] - value) ? current : best);
  const ratio = Math.abs(closest[0] - value) < .035 ? closest[1] : exact;
  return { width, height, duration, ratio, orientation: value < .92 ? 'Vertical' : value > 1.08 ? 'Horizontal' : 'Quadrado' };
}

export default function LegendasClient({ username, initialKeyConfigured, initialKeySource }: { username: string; initialKeyConfigured: boolean; initialKeySource: 'personal' | 'admin' | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null); const mobileRef = useRef<HTMLInputElement>(null); const videoRef = useRef<HTMLVideoElement>(null); const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('upload'); const [tab, setTab] = useState<Tab>('styles');
  const [keyConfigured, setKeyConfigured] = useState(initialKeyConfigured); const [keySource, setKeySource] = useState(initialKeySource); const [showKey, setShowKey] = useState(!initialKeyConfigured);
  const [showDrive, setShowDrive] = useState(false); const [driveUrl, setDriveUrl] = useState(''); const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState(''); const [remoteUrl, setRemoteUrl] = useState('');
  const [language, setLanguage] = useState('auto'); const [progress, setProgress] = useState(0); const [message, setMessage] = useState('');
  const [captions, setCaptions] = useState<Caption[]>([]); const [selectedStyle, setSelectedStyle] = useState('cove'); const [currentTime, setCurrentTime] = useState(0);
  const [rendering, setRendering] = useState(false); const [renderProgress, setRenderProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null); const [videoBox, setVideoBox] = useState<VideoBox | null>(null);

  const activeCaption = useMemo(() => captions.find((caption) => caption.visible && currentTime * 1000 >= caption.start && currentTime * 1000 <= caption.end), [captions, currentTime]);
  const scenes = useMemo(() => Array.from({ length: Math.ceil(captions.length / 5) }, (_, index) => captions.slice(index * 5, index * 5 + 5)), [captions]);

  useEffect(() => () => { if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    const stageElement = stageRef.current; if (stage !== 'editor' || !stageElement || !videoInfo) return;
    const update = () => {
      const stageWidth = stageElement.clientWidth; const stageHeight = stageElement.clientHeight; const videoRatio = videoInfo.width / videoInfo.height; const stageRatio = stageWidth / stageHeight;
      const width = videoRatio > stageRatio ? stageWidth : stageHeight * videoRatio; const height = videoRatio > stageRatio ? stageWidth / videoRatio : stageHeight;
      const left = (stageWidth - width) / 2; const top = (stageHeight - height) / 2;
      setVideoBox({ left: left + width * .055, width: width * .89, bottom: stageHeight - top - height + height * .095, fontSize: Math.max(20, Math.min(64, width * .085)) });
    };
    update(); const observer = new ResizeObserver(update); observer.observe(stageElement); return () => observer.disconnect();
  }, [stage, videoInfo]);

  function readVideoInfo(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (video.videoWidth && video.videoHeight) setVideoInfo(describeVideo(video.videoWidth, video.videoHeight, Number.isFinite(video.duration) ? video.duration : 0));
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return;
    if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(selected.type)) { setMessage('Use um vídeo MP4, MOV ou WebM.'); return; }
    if (selected.size > 2 * 1024 * 1024 * 1024) { setMessage('O limite é 2 GB por vídeo.'); return; }
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(selected); setPreviewUrl(URL.createObjectURL(selected)); setRemoteUrl(''); setVideoInfo(null); setVideoBox(null); setProgress(0); setMessage(''); setStage('ready');
  }

  async function connectKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('Validando sua chave…');
    try {
      const response = await fetch('/api/legendas/key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Não foi possível conectar a chave.');
      setApiKey(''); setKeyConfigured(true); setKeySource('personal'); setShowKey(false); setMessage('AssemblyAI conectada.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Não foi possível conectar a chave.'); }
  }

  async function disconnectKey() { await fetch('/api/legendas/key', { method: 'DELETE' }); setKeyConfigured(false); setKeySource(null); setShowKey(true); setMessage('Chave removida desta sessão.'); }

  async function startTranscription() {
    if (!keyConfigured) { setShowKey(true); setMessage('Conecte sua chave AssemblyAI primeiro.'); return; }
    setStage('transcribing'); setProgress(0); setMessage('Preparando o vídeo…');
    let temporaryBlobUrl = '';
    try {
      let audioUrl = remoteUrl;
      if (file) {
        const blob = await upload(`legendas/${username}/${Date.now()}-${safeName(file.name)}`, file, {
          access: 'public', handleUploadUrl: '/api/legendas/upload', multipart: file.size > 100 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => { setProgress(Math.round(percentage * .68)); setMessage(`Enviando vídeo… ${Math.round(percentage)}%`); },
        });
        audioUrl = blob.url; temporaryBlobUrl = blob.url; setRemoteUrl(blob.url);
      }
      if (!audioUrl) throw new Error('Escolha um vídeo antes de continuar.');
      setProgress(72); setMessage('Iniciando transcrição…');
      const created = await fetch('/api/legendas/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audioUrl, language }) });
      const createdResult = await created.json() as TranscriptResponse;
      if (!created.ok || !createdResult.id) throw new Error(createdResult.error || 'Não foi possível iniciar a transcrição.');
      for (let attempt = 0; attempt < 240; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const response = await fetch(`/api/legendas/transcript?id=${encodeURIComponent(createdResult.id)}`, { cache: 'no-store' });
        const result = await response.json() as TranscriptResponse;
        if (!response.ok) throw new Error(result.error || 'Não foi possível consultar a transcrição.');
        if (result.status === 'error') throw new Error(result.error || 'A transcrição falhou.');
        if (result.status === 'completed') {
          const generated = buildCaptions(Array.isArray(result.words) ? result.words : [], result.text || '');
          if (!generated.length) throw new Error('A AssemblyAI não encontrou fala neste vídeo.');
          setCaptions(generated); setProgress(100); setMessage(`Legenda pronta${result.language_code ? ` · ${result.language_code.toUpperCase()}` : ''}.`); setStage('editor');
          if (temporaryBlobUrl) void fetch('/api/legendas/cleanup', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: temporaryBlobUrl }) });
          return;
        }
        setProgress(Math.min(96, 76 + Math.round(attempt / 12))); setMessage('A AssemblyAI está transcrevendo…');
      }
      throw new Error('A transcrição demorou mais que o esperado. Tente novamente.');
    } catch (reason) {
      if (temporaryBlobUrl) void fetch('/api/legendas/cleanup', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: temporaryBlobUrl }) });
      setMessage(reason instanceof Error ? reason.message : 'Não foi possível gerar as legendas.'); setStage('ready');
    }
  }

  function useDrive() {
    const direct = driveDirectUrl(driveUrl);
    if (!direct) { setMessage('Cole um link compartilhável de arquivo do Google Drive.'); return; }
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(null); setPreviewUrl(''); setRemoteUrl(direct); setShowDrive(false); setStage('ready'); setMessage('Link do Drive adicionado. A prévia ficará disponível após usar um arquivo local.');
  }

  function updateCaption(id: string, patch: Partial<Caption>) { setCaptions((current) => current.map((caption) => caption.id === id ? { ...caption, ...patch } : caption)); }
  function removeCaption(id: string) { setCaptions((current) => current.filter((caption) => caption.id !== id)); }
  function addCaption(after: number) {
    const previous = captions[after]; const next = captions[after + 1]; const start = previous?.end || 0; const end = next?.start || start + 1800;
    setCaptions((current) => [...current.slice(0, after + 1), { id: crypto.randomUUID(), start, end, text: 'Nova legenda', visible: true }, ...current.slice(after + 1)]);
  }
  function seek(ms: number) { if (videoRef.current) videoRef.current.currentTime = ms / 1000; setCurrentTime(ms / 1000); }

  function exportSubtitles(format: 'srt' | 'vtt') {
    const visible = captions.filter((caption) => caption.visible);
    const body = visible.map((caption, index) => `${index + 1}\n${timestamp(caption.start, format === 'vtt')} --> ${timestamp(caption.end, format === 'vtt')}\n${caption.text}\n`).join('\n');
    downloadText(`legendas-${Date.now()}.${format}`, format === 'vtt' ? `WEBVTT\n\n${body}` : body, format === 'vtt' ? 'text/vtt' : 'application/x-subrip');
  }

  async function convertToMp4(input: Blob) {
    setMessage('Preparando o conversor MP4…'); setRenderProgress(72);
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')]);
    const ffmpeg = new FFmpeg(); const base = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
    ffmpeg.on('progress', ({ progress: conversion }) => setRenderProgress(72 + Math.round(Math.max(0, Math.min(1, conversion)) * 28)));
    await ffmpeg.load({ coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm') });
    const inputName = `legendas-${Date.now()}.webm`; const outputName = `legendas-${Date.now()}.mp4`;
    try {
      await ffmpeg.writeFile(inputName, new Uint8Array(await input.arrayBuffer()));
      const exitCode = await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', outputName]);
      if (exitCode !== 0) throw new Error('O conversor MP4 não concluiu o processamento.');
      const result = await ffmpeg.readFile(outputName); if (typeof result === 'string') throw new Error('A conversão não retornou um vídeo.');
      const bytes = new Uint8Array(result); return new Blob([bytes.buffer], { type: 'video/mp4' });
    } finally { try { await ffmpeg.deleteFile(inputName); await ffmpeg.deleteFile(outputName); } catch { /* arquivo temporário já removido */ } ffmpeg.terminate(); }
  }

  async function exportVideo() {
    const video = videoRef.current; if (!video || !previewUrl) { setMessage('Para exportar o vídeo pronto, selecione o arquivo original neste aparelho.'); return; }
    if (!('MediaRecorder' in window)) { setMessage('Seu navegador não oferece exportação de vídeo. Use Chrome ou Edge.'); return; }
    setRendering(true); setRenderProgress(0); setMessage('Renderizando o vídeo no seu navegador…');
    const savedTime = video.currentTime; const savedMuted = video.muted; const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.floor((video.videoWidth || 1080) / 2) * 2); canvas.height = Math.max(2, Math.floor((video.videoHeight || 1920) / 2) * 2); const context = canvas.getContext('2d');
    if (!context) { setRendering(false); return; }
    const canvasStream = canvas.captureStream(30);
    const capturable = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    const sourceStream = capturable.captureStream?.() || capturable.mozCaptureStream?.(); sourceStream?.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=h264,aac', 'video/mp4'].find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) { setRendering(false); setMessage('Este navegador não oferece um formato de gravação compatível. Use Chrome ou Edge.'); return; }
    const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 8_000_000 }); const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
    const draw = () => {
      context.fillStyle = '#000'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const now = video.currentTime * 1000; const caption = captions.find((item) => item.visible && now >= item.start && now <= item.end);
      if (caption) {
        const look = styleCanvas[selectedStyle] || styleCanvas.cove; const scale = canvas.width / 1080; context.font = look.font.replace(/(\d+)px/, (_, size) => `${Math.max(26, Number(size) * scale)}px`); context.textAlign = 'center'; context.textBaseline = 'middle'; context.lineJoin = 'round';
        const intro = Math.min(1, Math.max(0, (now - caption.start) / 220)); const eased = 1 - Math.pow(1 - intro, 3); context.save(); context.globalAlpha = intro;
        if (['hormozi', 'hormozi-two', 'stack', 'dense'].includes(selectedStyle)) { const zoom = .78 + eased * .22; context.translate(canvas.width / 2, canvas.height * .79); context.scale(zoom, zoom); context.translate(-canvas.width / 2, -canvas.height * .79); }
        if (['leon', 'laguna', 'open'].includes(selectedStyle)) context.translate((1 - eased) * -70 * scale, 0);
        if (['aria', 'vibe', 'rise'].includes(selectedStyle)) context.translate(0, (1 - eased) * 45 * scale);
        if (selectedStyle === 'beast') { context.translate(canvas.width / 2, canvas.height * .79); context.rotate((1 - eased) * -.045); context.translate(-canvas.width / 2, -canvas.height * .79); }
        const maxWidth = canvas.width * .86; const words = caption.text.split(/\s+/); const lines: string[] = []; let line = '';
        for (const word of words) { const attempt = line ? `${line} ${word}` : word; if (context.measureText(attempt).width > maxWidth && line) { lines.push(line); line = word; } else line = attempt; } if (line) lines.push(line);
        const lineHeight = 64 * scale; const startY = canvas.height * .79 - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((text, index) => { const y = startY + index * lineHeight; if (look.box) { const metrics = context.measureText(text); context.fillStyle = look.box; context.fillRect(canvas.width / 2 - metrics.width / 2 - 14 * scale, y - 31 * scale, metrics.width + 28 * scale, 62 * scale); } context.lineWidth = Math.max(3, 10 * scale); context.strokeStyle = look.stroke; context.strokeText(text, canvas.width / 2, y); context.fillStyle = look.fill; context.fillText(text, canvas.width / 2, y); });
        context.restore();
      }
      setRenderProgress(video.duration ? Math.min(70, Math.round(video.currentTime / video.duration * 70)) : 0);
      if (!video.ended && recorder.state === 'recording') requestAnimationFrame(draw); else if (recorder.state === 'recording') recorder.stop();
    };
    try {
      video.currentTime = 0; video.muted = false; recorder.start(1000); await video.play(); requestAnimationFrame(draw); await stopped;
      const recorded = new Blob(chunks, { type: mimeType }); const mp4 = mimeType.startsWith('video/mp4') ? recorded : await convertToMp4(recorded);
      const link = document.createElement('a'); link.href = URL.createObjectURL(mp4); link.download = `video-legendado-${Date.now()}.mp4`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 2000); setRenderProgress(100); setMessage('Vídeo MP4 exportado.');
    } catch (reason) { if (recorder.state === 'recording') recorder.stop(); setMessage(reason instanceof Error ? reason.message : 'Não foi possível renderizar este vídeo no navegador.'); }
    finally { video.currentTime = savedTime; video.muted = savedMuted; setRendering(false); setRenderProgress(0); }
  }

  async function signOut() { await fetch('/api/portfolio/session', { method: 'DELETE' }); router.refresh(); }
  function reset() { setStage('upload'); setFile(null); setRemoteUrl(''); setCaptions([]); setVideoInfo(null); setVideoBox(null); setProgress(0); setMessage(''); if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); setPreviewUrl(''); }

  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Legendas</span><nav className={styles.headerNav}><button onClick={() => setShowKey(true)}><Key /> AssemblyAI</button><span>@{username}</span><button onClick={signOut}>Sair</button></nav></header>

    {stage === 'upload' && <section className={styles.uploadPage}>
      <div className={styles.uploadIntro}><span className={styles.eyebrow}><i /> AYMAR LABS / LEGENDAS</span><h1>Legendas que<br /><em>prendem atenção.</em></h1><p>Envie seu vídeo, transcreva com AssemblyAI, escolha um estilo e ajuste cada fala.</p></div>
      <div className={styles.uploadCard}>
        <div className={styles.uploadMark}><Upload /></div><h2>Envie um vídeo para gerar legendas</h2><p>MP4, MOV ou WebM · Tamanho máximo: 2 GB</p>
        <div className={styles.sourceMenu}><button className={styles.primaryButton} onClick={() => fileRef.current?.click()}><Upload /> Do meu computador</button><button onClick={() => setShowDrive(true)}><Cloud /> Do Google Drive</button><button onClick={() => mobileRef.current?.click()}><Phone /> Do meu celular</button></div>
        <input ref={fileRef} className={styles.hiddenInput} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v" onChange={chooseFile} />
        <input ref={mobileRef} className={styles.hiddenInput} type="file" accept="video/*" capture="environment" onChange={chooseFile} />
        {!keyConfigured && <button className={styles.keyNotice} onClick={() => setShowKey(true)}><Key /> Conecte sua chave AssemblyAI antes de começar</button>}
      </div>
    </section>}

    {(stage === 'ready' || stage === 'transcribing') && <section className={styles.preparePage}>
      <button className={styles.backButton} onClick={reset}><ArrowLeft /> Voltar</button>
      <div className={styles.prepareCard}><div className={styles.prepareTitle}><Sparkles /><h2>Gerar Legendas</h2></div>
        <div className={styles.previewShell}>{previewUrl ? <><video ref={videoRef} src={previewUrl} controls playsInline onLoadedMetadata={readVideoInfo} />{videoInfo && <span className={styles.aspectBadge}>{videoInfo.orientation} · {videoInfo.ratio} · {videoInfo.width}×{videoInfo.height}</span>}</> : <div className={styles.drivePreview}><Cloud /><strong>Vídeo do Google Drive</strong><span>A prévia local não está disponível.</span></div>}</div>
        {file && <div className={styles.fileIdentity}><span>{file.name}</span><strong>{videoInfo ? `${videoInfo.orientation} · ${videoInfo.ratio}` : 'Identificando formato…'}</strong></div>}
        {stage === 'transcribing' && <><div className={styles.progress}><i style={{ width: `${progress}%` }} /></div><p className={styles.progressText}>{message}</p></>}
        <label className={styles.languageSelect}><span>Idioma do áudio:</span><select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={stage === 'transcribing'}>{languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown /></label>
        <button className={styles.generateButton} onClick={startTranscription} disabled={stage === 'transcribing'}><Sparkles /> {stage === 'transcribing' ? 'Gerando legendas…' : 'Gerar Legendas'}</button>
      </div>
    </section>}

    {stage === 'editor' && <section className={styles.editorPage}>
      <div className={styles.editorTop}><button onClick={reset}><ArrowLeft /> Novo vídeo</button><div><strong>Editor de legendas</strong><span>{captions.length} blocos{videoInfo ? ` · ${videoInfo.orientation} ${videoInfo.ratio}` : ''}</span></div><div className={styles.exportActions}><button onClick={() => exportSubtitles('srt')}><Download /> SRT</button><button onClick={() => exportSubtitles('vtt')}><Download /> VTT</button><button className={styles.exportPrimary} onClick={exportVideo} disabled={rendering || !previewUrl}><Download /> {rendering ? `Processando ${renderProgress}%` : 'Exportar MP4'}</button></div></div>
      <div className={styles.editorGrid}>
        <div className={styles.videoColumn}><div ref={stageRef} className={styles.videoStage}>{previewUrl ? <video ref={videoRef} src={previewUrl} controls playsInline onLoadedMetadata={readVideoInfo} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} /> : <div className={styles.drivePreview}><Cloud /><strong>Prévia indisponível</strong><span>Edite o texto e exporte SRT ou VTT.</span></div>}{activeCaption && videoBox && <div key={activeCaption.id} style={{ left: videoBox.left, width: videoBox.width, bottom: videoBox.bottom }} className={`${styles.captionOverlay} ${styles[`style_${selectedStyle.replaceAll('-', '_')}`] || ''}`}><span style={{ fontSize: videoBox.fontSize }}>{activeCaption.text}</span></div>}{videoInfo && <span className={styles.aspectBadge}>{videoInfo.ratio} · {videoInfo.width}×{videoInfo.height}</span>}</div><div className={styles.videoMeta}><span>{activeCaption ? `${time(activeCaption.start)} — ${time(activeCaption.end)}` : 'Reproduza o vídeo para visualizar'}</span><span>{videoInfo ? `${videoInfo.orientation} · ${videoInfo.ratio}` : selectedStyle.replaceAll('-', ' ')}</span></div>{message && <p className={styles.editorMessage}>{message}</p>}</div>
        <aside className={styles.editorPanel}><div className={styles.tabs}><button className={tab === 'styles' ? styles.activeTab : ''} onClick={() => setTab('styles')}>Escolher Estilo</button><button className={tab === 'captions' ? styles.activeTab : ''} onClick={() => setTab('captions')}>Editar Legendas</button><button className={tab === 'scenes' ? styles.activeTab : ''} onClick={() => setTab('scenes')}>Cenas</button></div>
          {tab === 'styles' && <div className={styles.stylesPane}><div className={styles.styleFilters}><span>Todos</span><span>Padrão</span><span>Custom</span></div><div className={styles.styleGrid}>{captionStyles.map(([value, label]) => <button key={value} data-style={value} aria-pressed={selectedStyle === value} onClick={() => setSelectedStyle(value)}><span>{label}</span></button>)}</div></div>}
          {tab === 'captions' && <div className={styles.captionsPane}>{captions.map((caption, index) => <div className={styles.captionBlock} key={caption.id}><span className={styles.captionTime}>{time(caption.start)} — {time(caption.end)}</span><textarea value={caption.text} onChange={(event) => updateCaption(caption.id, { text: event.target.value })} /><div className={styles.captionTools}><button title="Ajustar início" onClick={() => seek(caption.start)}><Settings /></button><button title={caption.visible ? 'Ocultar' : 'Exibir'} onClick={() => updateCaption(caption.id, { visible: !caption.visible })}><Eye /></button><button title="Remover" onClick={() => removeCaption(caption.id)}><Trash /></button></div><button className={styles.addCaption} onClick={() => addCaption(index)} title="Adicionar legenda"><Plus /></button></div>)}</div>}
          {tab === 'scenes' && <div className={styles.scenesPane}>{scenes.map((scene, index) => <button key={index} onClick={() => seek(scene[0]?.start || 0)}><span>0{index + 1}</span><strong>Cena {index + 1}</strong><small>{scene.map((caption) => caption.text).join(' ').slice(0, 105)}{scene.map((caption) => caption.text).join(' ').length > 105 ? '…' : ''}</small></button>)}</div>}
        </aside>
      </div>
    </section>}

    {showKey && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && keyConfigured) setShowKey(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="assembly-title"><button className={styles.modalClose} onClick={() => setShowKey(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Key /></div><span className={styles.sectionLabel}>CONEXÃO SEGURA</span><h2 id="assembly-title">Conecte a AssemblyAI.</h2><p>Crie uma conta gratuita, copie sua API key e cole abaixo. A chave fica criptografada em um cookie protegido e não aparece no navegador.</p><a href="https://www.assemblyai.com/dashboard/api-keys" target="_blank" rel="noreferrer">Abrir API Keys da AssemblyAI ↗</a><form onSubmit={connectKey} className={styles.keyForm}><label>API key<input type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Cole sua chave aqui" required /></label><button type="submit"><Key /> Validar e conectar</button></form>{keyConfigured && <div className={styles.connected}><span>Conectada via {keySource === 'admin' ? 'conta Aymar Labs' : 'chave pessoal'}.</span>{keySource === 'personal' && <button onClick={disconnectKey}>Remover chave</button>}</div>}{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}

    {showDrive && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDrive(false); }}><section className={styles.modal} role="dialog" aria-modal="true"><button className={styles.modalClose} onClick={() => setShowDrive(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Cloud /></div><span className={styles.sectionLabel}>GOOGLE DRIVE</span><h2>Importe por link.</h2><p>O arquivo precisa estar compartilhado como “qualquer pessoa com o link”. Para melhor resultado, use vídeos de até 100 MB.</p><div className={styles.keyForm}><label>Link do arquivo<input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://drive.google.com/file/d/..." /></label><button onClick={useDrive}><Cloud /> Usar vídeo do Drive</button></div>{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}
  </main>;
}
