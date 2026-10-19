'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowLeft, ChevronDown, Cloud, Download, Eye, Key, Phone, Plus, Settings, Sparkles, Trash, Upload } from '../../components/Icon';
import styles from './legendas.module.css';

type Stage = 'upload' | 'ready' | 'transcribing' | 'editor';
type Tab = 'styles' | 'captions' | 'scenes';
type Word = { text: string; start: number; end: number; confidence?: number };
type Caption = { id: string; start: number; end: number; text: string; words: Word[]; visible: boolean };
type TranscriptResponse = { status?: string; text?: string; words?: Word[]; language_code?: string; error?: string };
type VideoInfo = { width: number; height: number; duration: number; ratio: string; orientation: string };
type VideoBox = { left: number; width: number; bottom: number; scale: number };

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

type CaptionEffect = 'none' | 'updown' | 'fade' | 'float' | 'blur' | 'rise' | 'bounce' | 'slide' | 'reveal' | 'pop' | 'glow' | 'type' | 'karaoke' | 'flip';
type CaptionPreset = {
  fill: string; active: string; second: string; third: string; stroke: string;
  fontFamily: string; fontWeight: number; fontSize: number; captionPosition: number;
  letterSpacing: string; lineHeight?: number; italic?: boolean; uppercase?: boolean;
  shadow: string; effect: CaptionEffect; maxWords: number; maxChars: number;
  accentFamily?: string; accentWeight?: number; accentScale?: number; accentItalic?: boolean;
  activeBox?: string; renderMode?: 'negative'; special?: 'laguna' | 'stack' | 'open' | 'cove';
};
const presets: Record<string, CaptionPreset> = {
  hormozi: { fill:'#fff',active:'#2bf82a',second:'#fdfa14',third:'#f01916',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:67.5,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'0 0 10.125px #000,0 0 16.875px #000,0 0 23.625px #000,0 0 30.375px #000,0 0 37.125px #000',effect:'none',maxWords:5,maxChars:34 },
  'hormozi-two': { fill:'#fff',active:'#fdfa14',second:'#2bf82a',third:'#f01916',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:69.75,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'0 0 8px #000,0 0 11px #000,0 0 14px #000,0 0 17px #000',effect:'updown',maxWords:5,maxChars:34 },
  beast: { fill:'#fff',active:'#f9ea03',second:'#44fd09',third:'#ff0006',stroke:'#000',fontFamily:'Komika',fontWeight:500,fontSize:85.5,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'0 0 42px #fff,0 0 18px currentColor',effect:'none',maxWords:2,maxChars:15 },
  negative: { fill:'#111',active:'#fff',second:'#fff',third:'#fff',stroke:'#fff',fontFamily:'Instrument Sans',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.07em',shadow:'none',effect:'none',maxWords:1,maxChars:20,renderMode:'negative' },
  cove: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#111',fontFamily:'Poppins',fontWeight:600,fontSize:65,captionPosition:59,letterSpacing:'-.07em',shadow:'0 0 10px #fff,0 0 15px #fff,0 0 20px #fff',effect:'fade',maxWords:6,maxChars:35,accentFamily:'Playfair Display',accentWeight:400,accentScale:1.6,accentItalic:true,special:'cove' },
  marina: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#1d1d1d',fontFamily:'Instrument Sans',fontWeight:600,fontSize:96,captionPosition:70,letterSpacing:'-.06em',lineHeight:1.17,shadow:'0 29px 37px #000',effect:'fade',maxWords:12,maxChars:60,accentFamily:'Instrument Serif',accentWeight:400,accentScale:1.2,accentItalic:true },
  leon: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:63,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'0 2px 10px #000',effect:'none',maxWords:5,maxChars:30,activeBox:'#ff5000' },
  laguna: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#222',fontFamily:'Inter',fontWeight:800,fontSize:95,captionPosition:59,letterSpacing:'-.05em',shadow:'0 2px 12px #000,0 0 24px #000',effect:'none',maxWords:5,maxChars:22,special:'laguna' },
  tuba: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#111',fontFamily:'Inter',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.12em',shadow:'0 2px 10px #000,0 0 20px #000',effect:'none',maxWords:1,maxChars:20 },
  splitz: { fill:'#7C4A1E',active:'#7C4A1E',second:'#7C4A1E',third:'#7C4A1E',stroke:'#281408',fontFamily:'Poppins',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.04em',shadow:'0 2px 10px #0008',effect:'none',maxWords:1,maxChars:20,accentFamily:'Playfair Display',accentWeight:400,accentScale:1.12,accentItalic:true },
  aria: { fill:'#FFC53D',active:'#FFC53D',second:'#FF8A5B',third:'#FFC53D',stroke:'#111',fontFamily:'Inter',fontWeight:700,fontSize:78,captionPosition:59,letterSpacing:'-.04em',shadow:'3px 8px 10px #000,0 0 20px #000',effect:'reveal',maxWords:3,maxChars:18 },
  stack: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#111',fontFamily:'Inter',fontWeight:800,fontSize:58,captionPosition:52,letterSpacing:'-.03em',shadow:'0 4px 12px #000',effect:'reveal',maxWords:4,maxChars:22,accentFamily:'Inter',accentWeight:800,accentScale:2.5,special:'stack' },
  lume: { fill:'#F4C86E',active:'#F4C86E',second:'#FAEBBE',third:'#F2F0EC',stroke:'#251707',fontFamily:'Space Grotesk',fontWeight:500,fontSize:66,captionPosition:59,letterSpacing:'.01em',shadow:'0 2px 14px #000',effect:'float',maxWords:5,maxChars:28 },
  marca: { fill:'#FFE600',active:'#FFE600',second:'#00FF88',third:'#FF3B3B',stroke:'#000',fontFamily:'Bebas Neue',fontWeight:400,fontSize:96,captionPosition:59,letterSpacing:'.03em',uppercase:true,shadow:'3px 3px 0 #000,0 0 14px currentColor',effect:'none',maxWords:4,maxChars:20 },
  canto: { fill:'#F5E2C0',active:'#F5E2C0',second:'#E8D5A3',third:'#E8D5A3',stroke:'#291d10',fontFamily:'Libre Baskerville',fontWeight:400,fontSize:64,captionPosition:59,letterSpacing:'-.02em',shadow:'0 2px 14px #000',effect:'fade',maxWords:5,maxChars:28,accentFamily:'Cormorant Garamond',accentWeight:600,accentScale:1.35,accentItalic:true },
  silk: { fill:'#0CC8B0',active:'#0CC8B0',second:'#C084FC',third:'#FB7185',stroke:'#001b18',fontFamily:'Manrope',fontWeight:700,fontSize:68,captionPosition:59,letterSpacing:'normal',shadow:'0 2px 16px #000,0 0 30px #000',effect:'blur',maxWords:4,maxChars:22 },
  slash: { fill:'#FF3CAC',active:'#FF3CAC',second:'#00F0FF',third:'#FFC107',stroke:'#240014',fontFamily:'Oswald',fontWeight:700,fontSize:86,captionPosition:59,letterSpacing:'.04em',uppercase:true,shadow:'3px 3px 0 #000,6px 6px 0 #000',effect:'slide',maxWords:3,maxChars:16 },
  dense: { fill:'#CDFE07',active:'#CDFE07',second:'#FF6B6B',third:'#94A8FF',stroke:'#142000',fontFamily:'Syne',fontWeight:800,fontSize:76,captionPosition:59,letterSpacing:'-.05em',shadow:'0 2px 10px #000,0 5px 22px #000',effect:'fade',maxWords:5,maxChars:26 },
  open: { fill:'#2DD4BF',active:'#2DD4BF',second:'#F472B6',third:'#FBBF24',stroke:'#002b26',fontFamily:'Nunito',fontWeight:800,fontSize:64,captionPosition:59,letterSpacing:'normal',shadow:'0 2px 12px #000,0 0 24px #000',effect:'fade',maxWords:5,maxChars:28,accentFamily:'Nunito',accentWeight:900,accentScale:1.2,accentItalic:true,special:'open' },
  vibe: { fill:'#00D084',active:'#00D084',second:'#FF2D78',third:'#60A5FA',stroke:'#002519',fontFamily:'Plus Jakarta Sans',fontWeight:800,fontSize:68,captionPosition:59,letterSpacing:'-.02em',shadow:'0 2px 10px #000,0 0 22px #000',effect:'bounce',maxWords:4,maxChars:22 },
  rise: { fill:'#FFCD29',active:'#FFCD29',second:'#FFCD29',third:'#FFCD29',stroke:'#2b2200',fontFamily:'Outfit',fontWeight:700,fontSize:68,captionPosition:59,letterSpacing:'-.01em',shadow:'0 2px 10px #000,0 0 22px #000',effect:'rise',maxWords:4,maxChars:22 },
};

const fontSources: Array<[string, number, string, 'normal' | 'italic']> = [
  ['Montserrat',900,'Montserrat-900.woff2?v=20260709','normal'],['Komika',500,'KOMIKAX_.ttf?v=20260709','normal'],
  ['Instrument Sans',600,'InstrumentSans-600.woff2?v=20260709','normal'],['Instrument Sans',700,'InstrumentSans-700.woff2?v=20260709','normal'],
  ['Instrument Serif',400,'InstrumentSerif-400italic.woff2?v=20260902','italic'],['Poppins',600,'Poppins-600.woff2?v=20260709','normal'],['Poppins',700,'Poppins-700.woff2?v=20260709','normal'],
  ['Playfair Display',400,'PlayfairDisplay-400italic.woff2?v=20260709','italic'],['Inter',700,'Inter-700.woff2?v=20260709','normal'],['Inter',800,'Inter-800.woff2?v=20260709','normal'],
  ['Space Grotesk',500,'SpaceGrotesk-500.woff2?v=20260814','normal'],['Bebas Neue',400,'BebasNeue-400.woff2?v=20260709','normal'],
  ['Libre Baskerville',400,'LibreBaskerville-400.woff2?v=20260709','normal'],['Cormorant Garamond',600,'CormorantGaramond-600italic.woff2?v=20260709','italic'],
  ['Manrope',700,'Manrope-700.woff2?v=20260709','normal'],['Oswald',700,'Oswald-700.woff2?v=20260709','normal'],['Syne',800,'Syne-800.woff2?v=20260709','normal'],
  ['Nunito',800,'Nunito-800.woff2?v=20260709','normal'],['Nunito',900,'Nunito-900italic.woff2?v=20260709','italic'],['Plus Jakarta Sans',800,'PlusJakartaSans-800.woff2?v=20260709','normal'],['Outfit',700,'Outfit-700.woff2?v=20260709','normal'],
];

function safeName(name: string) { return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'video.mp4'; }
function time(ms: number) { const total = Math.max(0, ms) / 1000; return `${Math.floor(total / 60)}:${(total % 60).toFixed(2).padStart(5, '0')}`; }
function timestamp(ms: number, vtt = false) { const total = Math.max(0, ms); const hours = Math.floor(total / 3600000); const minutes = Math.floor((total % 3600000) / 60000); const seconds = Math.floor((total % 60000) / 1000); const millis = Math.floor(total % 1000); return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${vtt ? '.' : ','}${String(millis).padStart(3, '0')}`; }

function buildCaptions(words: Word[] = [], fallback = ''): Caption[] {
  if (!words.length) return fallback.trim() ? fallback.split(/(?<=[.!?])\s+/).filter(Boolean).map((text, index) => ({ id: crypto.randomUUID(), start: index * 2500, end: (index + 1) * 2500, text, words: [], visible: true })) : [];
  const result: Caption[] = []; let bucket: Word[] = [];
  const flush = () => { if (!bucket.length) return; result.push({ id: crypto.randomUUID(), start: bucket[0].start, end: bucket[bucket.length - 1].end, text: bucket.map((word) => word.text).join(' '), words: bucket, visible: true }); bucket = []; };
  for (const word of words) {
    const last = bucket[bucket.length - 1];
    if (last && (word.start - last.end > 650 || word.end - bucket[0].start > 2800 || bucket.length >= 12)) flush();
    bucket.push(word);
    if (/[.!?]$/.test(word.text)) flush();
  }
  flush(); return result;
}

function timedWords(caption: Caption): Word[] {
  const tokens = caption.text.trim().split(/\s+/).filter(Boolean);
  if (caption.words.length === tokens.length) return caption.words.map((word, index) => ({ ...word, text: tokens[index] }));
  const duration = Math.max(1, caption.end - caption.start);
  return tokens.map((text, index) => ({ text, start: caption.start + duration * index / Math.max(1, tokens.length), end: caption.start + duration * (index + 1) / Math.max(1, tokens.length) }));
}

function clamp(value: number, min = 0, max = 1) { return Math.min(max, Math.max(min, value)); }
function lerp(from: number, to: number, progress: number) { return from + (to - from) * clamp(progress); }
function easeOutQuad(value: number) { const progress = clamp(value); return 1 - (1 - progress) * (1 - progress); }
function springProgress(frame: number, stiffness: number, damping: number, mass: number) {
  if (frame <= 0) return 0;
  const time = frame / 30; const omega = Math.sqrt(stiffness / mass); const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) { const damped = omega * Math.sqrt(1 - zeta * zeta); return 1 - Math.exp(-zeta * omega * time) * (Math.cos(damped * time) + zeta * omega / damped * Math.sin(damped * time)); }
  return 1 - Math.exp(-omega * time);
}

function motionStyle(preset: CaptionPreset, word: Word, now: number, index: number, scale: number, captionStart: number): CSSProperties {
  const frame = (now - word.start) * 30 / 1000; const chunkFrame = (now - captionStart) * 30 / 1000;
  let opacity = 1; let x = 0; let y = 0; let zoom = 1; let blur = 0;
  if (preset.effect === 'fade') opacity = clamp(frame / 5);
  if (preset.effect === 'float') { opacity = clamp(frame / 7); y = lerp(5 * scale, 0, frame / 7); }
  if (preset.effect === 'blur') { opacity = clamp(frame / 6); blur = lerp(8 * scale, 0, frame / 8); }
  if (preset.effect === 'rise') { opacity = clamp(frame / 4); y = lerp(-20 * scale, 0, frame / 8); zoom = frame < 3 ? lerp(1.25, 1.06, frame / 3) : lerp(1.06, 1, (frame - 3) / 5); }
  if (preset.effect === 'bounce') { opacity = clamp(frame / 2); zoom = frame < 3 ? lerp(.88, 1.12, frame / 3) : lerp(1.12, 1, (frame - 3) / 4); }
  if (preset.effect === 'slide') { opacity = clamp(frame / 4); x = lerp(28 * scale, 0, frame / 5); }
  if (preset.effect === 'reveal') { opacity = clamp(frame / 6); y = lerp(16 * scale, 0, easeOutQuad(frame / 10)); blur = lerp(5 * scale, 0, frame / 8); }
  if (frame < 0 && preset.effect !== 'none' && preset.effect !== 'updown') opacity = 0;
  const style: CSSProperties = { opacity, transform: `translate3d(${x}px,${y}px,0) scale(${zoom})`, filter: blur > .05 ? `blur(${blur}px)` : undefined };
  if (preset.fontFamily === 'Komika') style.letterSpacing = `${lerp(-7.25667 * scale, 0, springProgress(chunkFrame, 700, 14, .6))}px`;
  if (preset.fontFamily === 'Manrope') style.transform = `${style.transform} scale(${springProgress(frame, 220, 26, .7) * .12 + .88})`;
  if (preset.effect === 'updown' && frame >= 0) style.transform = `translate3d(0,${index % 2 === 0 ? '-.07em' : '.07em'},0)`;
  return style;
}

function wordsForPreset(words: Word[], activeIndex: number, preset: CaptionPreset) {
  if (!words.length) return { words, activeIndex };
  const focus = activeIndex >= 0 ? activeIndex : 0;
  if (preset.maxWords === 1) return { words: [words[focus]], activeIndex: 0 };
  let start = Math.max(0, Math.min(focus - Math.floor(preset.maxWords / 2), words.length - preset.maxWords));
  let selected = words.slice(start, start + preset.maxWords);
  while (selected.length > 1 && selected.map((word) => word.text).join(' ').length > preset.maxChars) {
    if (focus - start >= selected.length - 1) { start += 1; selected = words.slice(start, start + selected.length - 1); }
    else selected = selected.slice(0, -1);
  }
  return { words: selected, activeIndex: focus - start };
}

function ClipaCaption({ words, activeIndex, preset, now, scale, captionStart, highlightWords, textColor, highlightColor }: {
  words: Word[]; activeIndex: number; preset: CaptionPreset; now: number; scale: number; captionStart: number;
  highlightWords: boolean; textColor: string; highlightColor: string;
}) {
  const selected = wordsForPreset(words, activeIndex, preset); const focus = Math.max(0, selected.activeIndex);
  const cycle = [preset.active, preset.second, preset.third];
  const wordNode = (word: Word, index: number, extra?: CSSProperties) => {
    const active = highlightWords && index === selected.activeIndex; const accent = active && preset.accentFamily;
    const color = active ? (highlightColor === preset.active ? cycle[index % cycle.length] : highlightColor) : textColor;
    const style: CSSProperties = {
      ...motionStyle(preset, word, now, index, scale, captionStart), ...extra, color,
      fontFamily: accent ? `'${preset.accentFamily}', serif` : `'${preset.fontFamily}', sans-serif`,
      fontWeight: accent ? preset.accentWeight : preset.fontWeight,
      fontSize: accent ? `${preset.accentScale}em` : undefined,
      fontStyle: accent && preset.accentItalic ? 'italic' : preset.italic ? 'italic' : 'normal',
      background: active && preset.activeBox ? preset.activeBox : undefined,
      paddingInline: active && preset.activeBox ? '.12em' : undefined,
      textShadow: preset.shadow,
      WebkitTextStroke: preset.fontFamily === 'Komika' ? `${.2 * scale}px ${preset.stroke}` : undefined,
    };
    if (preset.renderMode === 'negative') { style.color = active ? '#111' : '#fff'; style.background = active ? '#fff' : '#111'; style.paddingInline = '.14em'; style.textShadow = 'none'; }
    return <b key={`${word.start}-${index}`} className={styles.captionWord} style={style}>{preset.uppercase ? word.text.toUpperCase() : word.text}</b>;
  };
  if (preset.special === 'stack') {
    const before = selected.words.slice(0, focus); const after = selected.words.slice(focus + 1); const active = selected.words[focus];
    return <span className={`${styles.captionLine} ${styles.stackLayout}`}>
      <span className={styles.stackSupport}>{before.map((word, index) => wordNode(word, index))}</span>
      {active && wordNode(active, focus, { fontSize: '2.5em', lineHeight: .72, textShadow: '3px 3px 0 #000,6px 6px 0 #000,9px 9px 0 #000,12px 12px 0 #000,0 12px 22px #000' })}
      <span className={styles.stackSupport}>{after.map((word, index) => wordNode(word, focus + 1 + index))}</span>
    </span>;
  }
  if (preset.special === 'laguna') {
    const active = selected.words[focus]; const context = selected.words.filter((_, index) => index !== focus);
    const entrance = clamp(((now - (active?.start || captionStart)) * 30 / 1000) / 10);
    return <span className={`${styles.captionLine} ${styles.lagunaLayout}`} style={{ opacity: entrance, transform: `translateY(${lerp(40 * scale, 0, entrance)}px)`, filter: `blur(${lerp(12 * scale, 0, entrance)}px)` }}>
      {active && wordNode(active, focus, { fontSize: '1.28em', lineHeight: .88 })}<span className={styles.lagunaContext}>{context.map((word, index) => wordNode(word, index < focus ? index : index + 1))}</span>
    </span>;
  }
  const splitRows = preset.special === 'cove' || preset.special === 'open';
  if (splitRows) {
    const pivot = Math.ceil(selected.words.length / 2);
    return <span className={`${styles.captionLine} ${styles.twoRows}`}><span>{selected.words.slice(0, pivot).map((word, index) => wordNode(word, index))}</span><span>{selected.words.slice(pivot).map((word, index) => wordNode(word, pivot + index))}</span></span>;
  }
  return <span className={styles.captionLine}>{selected.words.map((word, index) => wordNode(word, index))}</span>;
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

export default function LegendasClient({ username, initialKeyConfigured }: { username: string; initialKeyConfigured: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null); const mobileRef = useRef<HTMLInputElement>(null); const videoRef = useRef<HTMLVideoElement>(null); const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('upload'); const [tab, setTab] = useState<Tab>('styles');
  const [keyConfigured, setKeyConfigured] = useState(initialKeyConfigured); const [showKey, setShowKey] = useState(!initialKeyConfigured);
  const [showDrive, setShowDrive] = useState(false); const [driveUrl, setDriveUrl] = useState(''); const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState(''); const [remoteUrl, setRemoteUrl] = useState('');
  const [language, setLanguage] = useState('auto'); const [progress, setProgress] = useState(0); const [message, setMessage] = useState('');
  const [captions, setCaptions] = useState<Caption[]>([]); const [selectedStyle, setSelectedStyle] = useState('cove'); const [currentTime, setCurrentTime] = useState(0);
  const [rendering, setRendering] = useState(false); const [renderProgress, setRenderProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null); const [videoBox, setVideoBox] = useState<VideoBox | null>(null);
  const [captionPosition, setCaptionPosition] = useState(presets.cove.captionPosition); const [captionSize, setCaptionSize] = useState(presets.cove.fontSize); const [highlightWords, setHighlightWords] = useState(true);
  const [textColor, setTextColor] = useState(presets.cove.fill); const [highlightColor, setHighlightColor] = useState(presets.cove.active);

  const activeCaption = useMemo(() => captions.find((caption) => caption.visible && currentTime * 1000 >= caption.start && currentTime * 1000 <= caption.end), [captions, currentTime]);
  const activeWords = useMemo(() => activeCaption ? timedWords(activeCaption) : [], [activeCaption]);
  const activeWordIndex = useMemo(() => activeWords.findIndex((word) => currentTime * 1000 >= word.start && currentTime * 1000 <= word.end), [activeWords, currentTime]);
  const scenes = useMemo(() => Array.from({ length: Math.ceil(captions.length / 5) }, (_, index) => captions.slice(index * 5, index * 5 + 5)), [captions]);

  useEffect(() => () => { if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    let cancelled = false;
    const faces = fontSources.map(([family, weight, fileName, style]) => new FontFace(family, `url(https://r2.clipa.app/fonts/${fileName})`, { weight: String(weight), style }));
    void Promise.allSettled(faces.map(async (face) => { const loaded = await face.load(); if (!cancelled) document.fonts.add(loaded); }));
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (stage !== 'editor') return;
    let frame = 0; const tick = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [stage]);
  useEffect(() => {
    const stageElement = stageRef.current; if (stage !== 'editor' || !stageElement || !videoInfo) return;
    const update = () => {
      const stageWidth = stageElement.clientWidth; const stageHeight = stageElement.clientHeight; const videoRatio = videoInfo.width / videoInfo.height; const stageRatio = stageWidth / stageHeight;
      const width = videoRatio > stageRatio ? stageWidth : stageHeight * videoRatio; const height = videoRatio > stageRatio ? stageWidth / videoRatio : stageHeight;
      const left = (stageWidth - width) / 2; const top = (stageHeight - height) / 2;
      const bottom = stageHeight - top - height + height * (1 - captionPosition / 100);
      setVideoBox({ left: left + width * .055, width: width * .89, bottom, scale: width / 1080 });
    };
    update(); const observer = new ResizeObserver(update); observer.observe(stageElement); return () => observer.disconnect();
  }, [stage, videoInfo, captionPosition, captionSize]);

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
      setApiKey(''); setKeyConfigured(true); setShowKey(false); setMessage('Deepgram conectada.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Não foi possível conectar a chave.'); }
  }

  async function disconnectKey() { await fetch('/api/legendas/key', { method: 'DELETE' }); setKeyConfigured(false); setShowKey(true); setMessage('Chave removida desta sessão.'); }

  async function startTranscription() {
    if (!keyConfigured) { setShowKey(true); setMessage('Conecte sua chave Deepgram primeiro.'); return; }
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
      setProgress(80); setMessage('A Deepgram está transcrevendo palavra por palavra…');
      const response = await fetch('/api/legendas/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audioUrl, language }) });
      const result = await response.json() as TranscriptResponse;
      if (!response.ok) throw new Error(result.error || 'Não foi possível transcrever este vídeo.');
      const generated = buildCaptions(Array.isArray(result.words) ? result.words : [], result.text || '');
      if (!generated.length) throw new Error('A Deepgram não encontrou fala neste vídeo.');
      setCaptions(generated); setProgress(100); setMessage(`Legenda pronta${result.language_code && result.language_code !== 'auto' ? ` · ${result.language_code.toUpperCase()}` : ''}.`); setStage('editor');
      if (temporaryBlobUrl) void fetch('/api/legendas/cleanup', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: temporaryBlobUrl }) });
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
    setCaptions((current) => [...current.slice(0, after + 1), { id: crypto.randomUUID(), start, end, text: 'Nova legenda', words: [], visible: true }, ...current.slice(after + 1)]);
  }
  function selectStyle(value: string) { const preset = presets[value] || presets.cove; setSelectedStyle(value); setTextColor(preset.fill); setHighlightColor(preset.active); setCaptionPosition(preset.captionPosition); setCaptionSize(preset.fontSize); }
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
    setRendering(true); setRenderProgress(0); setMessage('Carregando as fontes e renderizando o vídeo…');
    const exportPreset = presets[selectedStyle] || presets.cove;
    await Promise.allSettled([
      document.fonts.load(`${exportPreset.fontWeight} ${captionSize}px "${exportPreset.fontFamily}"`),
      ...(exportPreset.accentFamily ? [document.fonts.load(`${exportPreset.accentWeight || 400} ${captionSize}px "${exportPreset.accentFamily}"`)] : []),
    ]);
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
        const look = presets[selectedStyle] || presets.cove; const scale = canvas.width / 1080; const fontSize = Math.max(24, captionSize * scale);
        context.font = `${look.italic ? 'italic ' : ''}${look.fontWeight} ${fontSize}px ${look.fontFamily}`; context.textAlign = 'left'; context.textBaseline = 'middle'; context.lineJoin = 'round';
        const intro = Math.min(1, Math.max(0, (now - caption.start) / 240)); const eased = 1 - Math.pow(1 - intro, 3); const centerY = canvas.height * captionPosition / 100;
        context.save(); context.globalAlpha = look.effect === 'fade' ? intro : Math.min(1, intro * 1.7);
        if (['pop', 'bounce'].includes(look.effect)) { const zoom = .82 + eased * .18; context.translate(canvas.width / 2, centerY); context.scale(zoom, zoom); context.translate(-canvas.width / 2, -centerY); }
        if (look.effect === 'slide') context.translate((1 - eased) * -60 * scale, 0);
        if (look.effect === 'rise') context.translate(0, (1 - eased) * 46 * scale);
        if (look.effect === 'flip') { context.translate(canvas.width / 2, centerY); context.rotate((1 - eased) * -.055); context.translate(-canvas.width / 2, -centerY); }
        if (look.effect === 'blur') context.filter = `blur(${(1 - eased) * 7 * scale}px)`;
        const sourceWords = timedWords(caption); const words = sourceWords.map((word) => ({ ...word, text: look.uppercase ? word.text.toUpperCase() : word.text })); const activeIndex = words.findIndex((word) => now >= word.start && now <= word.end);
        const gap = context.measureText(' ').width; const maxWidth = canvas.width * .86; const lines: Array<Array<{ word: Word; index: number; width: number }>> = []; let line: Array<{ word: Word; index: number; width: number }> = []; let lineWidth = 0;
        words.forEach((word, index) => { const width = context.measureText(word.text).width; const nextWidth = lineWidth + (line.length ? gap : 0) + width; if (line.length && nextWidth > maxWidth) { lines.push(line); line = []; lineWidth = 0; } line.push({ word, index, width }); lineWidth += (line.length > 1 ? gap : 0) + width; }); if (line.length) lines.push(line);
        const lineHeight = fontSize * 1.12; const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((items, lineIndex) => { const total = items.reduce((sum, item) => sum + item.width, 0) + gap * Math.max(0, items.length - 1); let x = canvas.width / 2 - total / 2; const y = startY + lineIndex * lineHeight;
          items.forEach((item) => { const active = highlightWords && item.index === activeIndex; const box = active ? look.activeBox : undefined; if (box) { context.fillStyle = box; context.fillRect(x - 7 * scale, y - fontSize * .58, item.width + 14 * scale, fontSize * 1.16); }
            context.save(); if (active && ['pop', 'bounce', 'flip'].includes(look.effect)) { const phase = Math.min(1, Math.max(0, (now - item.word.start) / 150)); const pulse = 1 + Math.sin(phase * Math.PI) * .17; context.translate(x + item.width / 2, y); context.scale(pulse, pulse); context.translate(-(x + item.width / 2), -y); }
            context.lineWidth = Math.max(2, 8 * scale); context.strokeStyle = look.stroke; context.strokeText(item.word.text, x, y); context.fillStyle = active ? highlightColor : textColor; context.fillText(item.word.text, x, y); context.restore(); x += item.width + gap; });
        });
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
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Legendas</span><nav className={styles.headerNav}><button onClick={() => setShowKey(true)}><Key /> Deepgram</button><span>@{username}</span><button onClick={signOut}>Sair</button></nav></header>

    {stage === 'upload' && <section className={styles.uploadPage}>
      <div className={styles.uploadIntro}><span className={styles.eyebrow}><i /> AYMAR LABS / LEGENDAS</span><h1>Legendas que<br /><em>prendem atenção.</em></h1><p>Envie seu vídeo, transcreva palavra por palavra com Deepgram, escolha um estilo e ajuste cada fala.</p></div>
      <div className={styles.uploadCard}>
        <div className={styles.uploadMark}><Upload /></div><h2>Envie um vídeo para gerar legendas</h2><p>MP4, MOV ou WebM · Tamanho máximo: 2 GB</p>
        <div className={styles.sourceMenu}><button className={styles.primaryButton} onClick={() => fileRef.current?.click()}><Upload /> Do meu computador</button><button onClick={() => setShowDrive(true)}><Cloud /> Do Google Drive</button><button onClick={() => mobileRef.current?.click()}><Phone /> Do meu celular</button></div>
        <input ref={fileRef} className={styles.hiddenInput} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v" onChange={chooseFile} />
        <input ref={mobileRef} className={styles.hiddenInput} type="file" accept="video/*" capture="environment" onChange={chooseFile} />
        {!keyConfigured && <button className={styles.keyNotice} onClick={() => setShowKey(true)}><Key /> Conecte sua chave Deepgram antes de começar</button>}
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
        <div className={styles.videoColumn}><div ref={stageRef} className={styles.videoStage}>{previewUrl ? <video ref={videoRef} src={previewUrl} controls playsInline onLoadedMetadata={readVideoInfo} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} /> : <div className={styles.drivePreview}><Cloud /><strong>Prévia indisponível</strong><span>Edite o texto e exporte SRT ou VTT.</span></div>}{activeCaption && videoBox && <div style={{ left: videoBox.left, width: videoBox.width, bottom: videoBox.bottom, fontFamily: `'${(presets[selectedStyle] || presets.cove).fontFamily}', sans-serif`, fontWeight: (presets[selectedStyle] || presets.cove).fontWeight, fontSize: `${Math.max(10, captionSize * videoBox.scale)}px`, letterSpacing: (presets[selectedStyle] || presets.cove).letterSpacing, lineHeight: (presets[selectedStyle] || presets.cove).lineHeight || 1.02 } as CSSProperties} className={styles.captionOverlay}><ClipaCaption words={activeWords} activeIndex={activeWordIndex} preset={presets[selectedStyle] || presets.cove} now={currentTime * 1000} scale={videoBox.scale} captionStart={activeCaption.start} highlightWords={highlightWords} textColor={textColor} highlightColor={highlightColor} /></div>}{videoInfo && <span className={styles.aspectBadge}>{videoInfo.ratio} · {videoInfo.width}×{videoInfo.height}</span>}</div><div className={styles.videoMeta}><span>{activeCaption ? `${time(activeCaption.start)} — ${time(activeCaption.end)}` : 'Reproduza o vídeo para visualizar'}</span><span>{videoInfo ? `${videoInfo.orientation} · ${videoInfo.ratio}` : selectedStyle.replaceAll('-', ' ')}</span></div>{message && <p className={styles.editorMessage}>{message}</p>}</div>
        <aside className={styles.editorPanel}><div className={styles.tabs}><button className={tab === 'styles' ? styles.activeTab : ''} onClick={() => setTab('styles')}>Escolher Estilo</button><button className={tab === 'captions' ? styles.activeTab : ''} onClick={() => setTab('captions')}>Editar Legendas</button><button className={tab === 'scenes' ? styles.activeTab : ''} onClick={() => setTab('scenes')}>Cenas</button></div>
          {tab === 'styles' && <div className={styles.stylesPane}><div className={styles.styleFilters}><span>Todos</span><span>Padrão</span><span>Custom</span></div><div className={styles.styleGrid}>{captionStyles.map(([value, label]) => <button key={value} data-style={value} aria-pressed={selectedStyle === value} onClick={() => selectStyle(value)}><span>{label}</span></button>)}</div><div className={styles.styleControls}><label><span>Posição <strong>{captionPosition}%</strong></span><input type="range" min="18" max="88" value={captionPosition} onChange={(event) => setCaptionPosition(Number(event.target.value))} /></label><label><span>Tamanho <strong>{captionSize}px</strong></span><input type="range" min="30" max="120" step=".25" value={captionSize} onChange={(event) => setCaptionSize(Number(event.target.value))} /></label><label className={styles.colorControl}><span>Cor do texto</span><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label><label className={styles.colorControl}><span>Cor do destaque</span><input type="color" value={highlightColor} onChange={(event) => setHighlightColor(event.target.value)} /></label><label className={styles.toggleControl}><span>Realçar palavras</span><input type="checkbox" checked={highlightWords} onChange={(event) => setHighlightWords(event.target.checked)} /></label></div></div>}
          {tab === 'captions' && <div className={styles.captionsPane}>{captions.map((caption, index) => <div className={styles.captionBlock} key={caption.id}><span className={styles.captionTime}>{time(caption.start)} — {time(caption.end)}</span><textarea value={caption.text} onChange={(event) => updateCaption(caption.id, { text: event.target.value })} /><div className={styles.captionTools}><button title="Ajustar início" onClick={() => seek(caption.start)}><Settings /></button><button title={caption.visible ? 'Ocultar' : 'Exibir'} onClick={() => updateCaption(caption.id, { visible: !caption.visible })}><Eye /></button><button title="Remover" onClick={() => removeCaption(caption.id)}><Trash /></button></div><button className={styles.addCaption} onClick={() => addCaption(index)} title="Adicionar legenda"><Plus /></button></div>)}</div>}
          {tab === 'scenes' && <div className={styles.scenesPane}>{scenes.map((scene, index) => <button key={index} onClick={() => seek(scene[0]?.start || 0)}><span>0{index + 1}</span><strong>Cena {index + 1}</strong><small>{scene.map((caption) => caption.text).join(' ').slice(0, 105)}{scene.map((caption) => caption.text).join(' ').length > 105 ? '…' : ''}</small></button>)}</div>}
        </aside>
      </div>
    </section>}

    {showKey && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && keyConfigured) setShowKey(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="deepgram-title"><button className={styles.modalClose} onClick={() => setShowKey(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Key /></div><span className={styles.sectionLabel}>CONEXÃO SEGURA</span><h2 id="deepgram-title">Conecte a Deepgram.</h2><p>O Clipa usa Deepgram para transcrever palavra por palavra. Crie sua conta, copie a API key e cole abaixo. A chave fica criptografada em cookie protegido.</p><a href="https://console.deepgram.com/" target="_blank" rel="noreferrer">Abrir console da Deepgram ↗</a><form onSubmit={connectKey} className={styles.keyForm}><label>API key<input type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Cole sua chave aqui" required /></label><button type="submit"><Key /> Validar e conectar</button></form>{keyConfigured && <div className={styles.connected}><span>Chave pessoal conectada.</span><button onClick={disconnectKey}>Remover chave</button></div>}{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}

    {showDrive && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDrive(false); }}><section className={styles.modal} role="dialog" aria-modal="true"><button className={styles.modalClose} onClick={() => setShowDrive(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Cloud /></div><span className={styles.sectionLabel}>GOOGLE DRIVE</span><h2>Importe por link.</h2><p>O arquivo precisa estar compartilhado como “qualquer pessoa com o link”. Para melhor resultado, use vídeos de até 100 MB.</p><div className={styles.keyForm}><label>Link do arquivo<input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://drive.google.com/file/d/..." /></label><button onClick={useDrive}><Cloud /> Usar vídeo do Drive</button></div>{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}
  </main>;
}
