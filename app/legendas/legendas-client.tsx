'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import BrandLogo from '../../components/BrandLogo';
import { ArrowLeft, ChevronDown, Cloud, Download, Eye, Key, Phone, Plus, Settings, Sparkles, Trash, Upload } from '../../components/Icon';
import styles from './legendas.module.css';

type Stage = 'upload' | 'ready' | 'transcribing' | 'editor';
type Tab = 'styles' | 'captions' | 'scenes';
type StyleFilter = 'all' | 'standard' | 'custom';
type CaptionCapitalization = 'uppercase' | 'sentence' | 'lowercase';
type Word = { text: string; start: number; end: number; confidence?: number; lineBreakAfter?: boolean; sourceIndex?: number };
type Caption = { id: string; start: number; end: number; text: string; words: Word[]; visible: boolean };
type TranscriptResponse = { status?: string; text?: string; words?: Word[]; language_code?: string; error?: string };
type VideoInfo = { width: number; height: number; duration: number; ratio: string; orientation: string };
type VideoBox = { frameWidth: number; frameHeight: number; left: number; width: number; bottom: number; scale: number };
type BatchItemStatus = 'queued' | 'uploading' | 'transcribing' | 'done' | 'error';
type BatchItem = { id: string; file: File; status: BatchItemStatus; progress: number; captions: Caption[]; error?: string; languageCode?: string };

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

const styleGroups: Record<Exclude<StyleFilter, 'all'>, readonly string[]> = {
  standard: ['hormozi', 'hormozi-two', 'negative', 'cove', 'marina', 'laguna', 'stack', 'open'],
  custom: ['beast', 'leon', 'tuba', 'splitz', 'aria', 'lume', 'marca', 'canto', 'silk', 'slash', 'dense', 'vibe', 'rise'],
};

type CaptionEffect = 'none' | 'updown' | 'fade' | 'float' | 'blur' | 'rise' | 'bounce' | 'slide' | 'reveal' | 'pop' | 'glow' | 'type' | 'karaoke' | 'flip';
type CaptionPreset = {
  fill: string; active: string; second: string; third: string; stroke: string;
  fontFamily: string; fontWeight: number; fontSize: number; captionPosition: number;
  letterSpacing: string; lineHeight?: number; italic?: boolean; uppercase?: boolean;
  shadow: string; effect: CaptionEffect; maxWords: number; maxChars: number;
  shadowLayers?: Array<[number, number, number]>; shadowColor?: string; shadowMode?: 'fixed' | 'colored';
  wordFadeFrames?: number; noLineBreak?: boolean; chunkMode?: 'clause'; maxLines?: number; maxLineChars?: number; fitMinScale?: number;
  accentFamily?: string; accentWeight?: number; accentScale?: number; accentItalic?: boolean;
  activeBox?: string; renderMode?: 'negative'; special?: 'laguna' | 'stack' | 'open' | 'cove' | 'splitz';
};
const presets: Record<string, CaptionPreset> = {
  hormozi: { fill:'#fff',active:'#2bf82a',second:'#fdfa14',third:'#f01916',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:67.5,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'',shadowLayers:[[0,0,10.125],[0,0,16.875],[0,0,23.625],[0,0,30.375],[0,0,37.125]],shadowColor:'#000',effect:'none',maxWords:5,maxChars:25 },
  'hormozi-two': { fill:'#fff',active:'#fdfa14',second:'#2bf82a',third:'#f01916',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:69.75,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'',shadowLayers:[[0,0,8],[0,0,9],[0,0,10],[0,0,11],[0,0,12],[0,0,13],[0,0,14],[0,0,15],[0,0,16],[0,0,17]],shadowColor:'#000',effect:'updown',maxWords:5,maxChars:25 },
  beast: { fill:'#fff',active:'#f9ea03',second:'#44fd09',third:'#ff0006',stroke:'#000',fontFamily:'Komika',fontWeight:500,fontSize:85.5,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'',shadowLayers:[[0,0,42]],shadowColor:'#fff',shadowMode:'colored',effect:'none',maxWords:2,maxChars:15,noLineBreak:true },
  negative: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Instrument Sans',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.07em',shadow:'none',shadowLayers:[],effect:'none',maxWords:1,maxChars:20,noLineBreak:true,renderMode:'negative' },
  cove: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Poppins',fontWeight:600,fontSize:65,captionPosition:59,letterSpacing:'-.07em',shadow:'',shadowLayers:[[0,0,10],[0,0,15],[0,0,20]],shadowColor:'#000',effect:'fade',maxWords:6,maxChars:35,accentFamily:'Playfair Display',accentWeight:400,accentScale:1.6,accentItalic:true,special:'cove' },
  marina: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Instrument Sans',fontWeight:600,fontSize:96,captionPosition:70,letterSpacing:'-.06em',lineHeight:1.17,shadow:'',shadowLayers:[[0,29,37]],shadowColor:'#000',effect:'fade',wordFadeFrames:3,maxWords:12,maxChars:60,chunkMode:'clause',maxLines:2,maxLineChars:18,fitMinScale:.75,accentFamily:'Instrument Serif',accentWeight:400,accentScale:1.2,accentItalic:true },
  leon: { fill:'#fff',active:'#ff5000',second:'#ff5000',third:'#ff5000',stroke:'#000',fontFamily:'Montserrat',fontWeight:900,fontSize:63,captionPosition:59,letterSpacing:'normal',uppercase:true,shadow:'none',shadowLayers:[],effect:'none',maxWords:5,maxChars:25,activeBox:'#ff5000' },
  laguna: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Inter',fontWeight:800,fontSize:95,captionPosition:59,letterSpacing:'-.05em',shadow:'',shadowLayers:[[0,2,12],[0,0,24]],shadowColor:'rgba(0,0,0,.55)',effect:'none',maxWords:5,maxChars:22,special:'laguna' },
  tuba: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Inter',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.12em',shadow:'',shadowLayers:[[0,2,10],[0,0,20]],shadowColor:'rgba(0,0,0,.6)',effect:'none',maxWords:1,maxChars:20 },
  splitz: { fill:'#fff',active:'#7C4A1E',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Poppins',fontWeight:700,fontSize:80,captionPosition:59,letterSpacing:'-.04em',shadow:'',shadowLayers:[[0,2,10],[0,0,22]],shadowColor:'rgba(0,0,0,.55)',effect:'none',maxWords:1,maxChars:20,accentFamily:'Playfair Display',accentWeight:400,accentScale:1.12,accentItalic:true,special:'splitz' },
  aria: { fill:'#fff',active:'#FFC53D',second:'#FF8A5B',third:'#fff',stroke:'#000',fontFamily:'Inter',fontWeight:700,fontSize:78,captionPosition:59,letterSpacing:'-.04em',shadow:'',shadowLayers:[[3,8,10],[0,0,20]],shadowColor:'rgba(0,0,0,.45)',effect:'reveal',maxWords:3,maxChars:18 },
  stack: { fill:'#fff',active:'#fff',second:'#fff',third:'#fff',stroke:'#000',fontFamily:'Inter',fontWeight:800,fontSize:58,captionPosition:52,letterSpacing:'-.03em',shadow:'',shadowLayers:[[0,4,14],[0,0,22]],shadowColor:'rgba(0,0,0,.6)',effect:'none',maxWords:4,maxChars:22,accentFamily:'Inter',accentWeight:800,accentScale:2.5,special:'stack' },
  lume: { fill:'#fff',active:'#F4C86E',second:'#FAEBBE',third:'#F2F0EC',stroke:'#000',fontFamily:'Space Grotesk',fontWeight:500,fontSize:66,captionPosition:59,letterSpacing:'.01em',shadow:'',shadowLayers:[[0,1,8],[0,0,20]],shadowColor:'rgba(0,0,0,.65)',effect:'float',maxWords:5,maxChars:28 },
  marca: { fill:'#fff',active:'#FFE600',second:'#00FF88',third:'#FF3B3B',stroke:'#000',fontFamily:'Bebas Neue',fontWeight:400,fontSize:96,captionPosition:59,letterSpacing:'.03em',uppercase:true,shadow:'',shadowLayers:[[3,3,0],[0,0,14]],shadowColor:'#000',shadowMode:'colored',effect:'none',maxWords:4,maxChars:20 },
  canto: { fill:'#fff',active:'#F5E2C0',second:'#E8D5A3',third:'#fff',stroke:'#000',fontFamily:'Libre Baskerville',fontWeight:400,fontSize:64,captionPosition:59,letterSpacing:'-.02em',shadow:'',shadowLayers:[[0,1,10],[0,0,22]],shadowColor:'#000',effect:'fade',maxWords:5,maxChars:28,accentFamily:'Cormorant Garamond',accentWeight:600,accentScale:1.35,accentItalic:true },
  silk: { fill:'#fff',active:'#0CC8B0',second:'#C084FC',third:'#FB7185',stroke:'#000',fontFamily:'Manrope',fontWeight:700,fontSize:68,captionPosition:59,letterSpacing:'-.01em',shadow:'',shadowLayers:[[0,2,16],[0,0,30]],shadowColor:'rgba(0,0,0,.6)',effect:'blur',maxWords:4,maxChars:22 },
  slash: { fill:'#fff',active:'#FF3CAC',second:'#00F0FF',third:'#FFC107',stroke:'#000',fontFamily:'Oswald',fontWeight:700,fontSize:86,captionPosition:59,letterSpacing:'.04em',uppercase:true,shadow:'',shadowLayers:[[3,3,0],[6,6,0]],shadowColor:'#000',effect:'slide',maxWords:3,maxChars:16 },
  dense: { fill:'#fff',active:'#CDFE07',second:'#FF6B6B',third:'#94A8FF',stroke:'#000',fontFamily:'Syne',fontWeight:800,fontSize:76,captionPosition:59,letterSpacing:'-.05em',shadow:'',shadowLayers:[[0,2,10],[0,5,22]],shadowColor:'rgba(0,0,0,.75)',effect:'fade',maxWords:5,maxChars:26 },
  open: { fill:'#fff',active:'#2DD4BF',second:'#F472B6',third:'#FBBF24',stroke:'#000',fontFamily:'Nunito',fontWeight:800,fontSize:64,captionPosition:59,letterSpacing:'normal',shadow:'',shadowLayers:[[0,2,12],[0,0,24]],shadowColor:'rgba(0,0,0,.65)',effect:'fade',maxWords:5,maxChars:28,accentFamily:'Nunito',accentWeight:900,accentScale:1.2,accentItalic:true,special:'open' },
  vibe: { fill:'#fff',active:'#00D084',second:'#FF2D78',third:'#60A5FA',stroke:'#000',fontFamily:'Plus Jakarta Sans',fontWeight:800,fontSize:68,captionPosition:59,letterSpacing:'-.02em',shadow:'',shadowLayers:[[0,2,10],[0,0,22]],shadowColor:'rgba(0,0,0,.65)',effect:'bounce',maxWords:4,maxChars:22 },
  rise: { fill:'#fff',active:'#FFCD29',second:'#FFCD29',third:'#FFCD29',stroke:'#000',fontFamily:'Outfit',fontWeight:700,fontSize:68,captionPosition:59,letterSpacing:'-.01em',shadow:'',shadowLayers:[[0,2,10],[0,0,22]],shadowColor:'rgba(0,0,0,.65)',effect:'rise',maxWords:4,maxChars:22 },
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

function readVideoDuration(blob: Blob) {
  return new Promise<number>((resolve, reject) => {
    const probe = document.createElement('video'); const url = URL.createObjectURL(blob);
    const cleanup = () => { probe.onloadedmetadata = null; probe.onerror = null; probe.removeAttribute('src'); probe.load(); URL.revokeObjectURL(url); };
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => { const duration = probe.duration; cleanup(); Number.isFinite(duration) && duration > 0 ? resolve(duration) : reject(new Error('Não foi possível validar a duração do MP4 exportado.')); };
    probe.onerror = () => { cleanup(); reject(new Error('Não foi possível validar o MP4 exportado.')); };
    probe.src = url;
  });
}

function wordText(word: Word) { return word.text.trim(); }
function joinedWords(words: Word[]) { return words.map(wordText).join(' '); }

function buildCaptions(words: Word[] = [], fallback = '', preset: CaptionPreset = presets.cove): Caption[] {
  if (!words.length) return fallback.trim() ? fallback.split(/(?<=[.!?])\s+/).filter(Boolean).map((text, index) => ({ id: crypto.randomUUID(), start: index * 2500, end: (index + 1) * 2500, text, words: [], visible: true })) : [];
  const sourceWords = words.map(({ lineBreakAfter: _lineBreakAfter, ...word }, index) => ({ ...word, sourceIndex: word.sourceIndex ?? index }));
  const result: Caption[] = [];
  const addCaption = (captionWords: Word[], lineEnds: Set<number> = new Set()) => {
    if (!captionWords.length) return;
    const normalized = captionWords.map((word, index) => ({ ...word, lineBreakAfter: lineEnds.has(index) }));
    result.push({ id: crypto.randomUUID(), start: normalized[0].start, end: normalized[normalized.length - 1].end, text: joinedWords(normalized), words: normalized, visible: true });
  };

  if (preset.chunkMode === 'clause') {
    const maxLines = Math.max(1, preset.maxLines || 2); const lineChars = preset.maxLineChars || 18;
    const approxLimit = Math.round(lineChars / (preset.fitMinScale || .75));
    let captionLines: Word[][] = []; let line: Word[] = [];
    const flushLine = () => { if (line.length) captionLines.push(line); line = []; };
    const flushCaption = () => {
      flushLine();
      if (!captionLines.length) return;
      const all = captionLines.flat(); let offset = 0; const lineEnds = new Set<number>();
      captionLines.slice(0, -1).forEach((row) => { offset += row.length; lineEnds.add(offset - 1); });
      addCaption(all, lineEnds); captionLines = [];
    };
    for (let index = 0; index < sourceWords.length; index++) {
      const word = sourceWords[index]; const text = wordText(word); const next = sourceWords[index + 1];
      const gap = next ? next.start - word.end : Number.POSITIVE_INFINITY;
      const sentence = /[.!?…]$/.test(text); const clause = /[,;:]$/.test(text);
      const limit = !next || sentence || clause || gap > 500 ? approxLimit : lineChars;
      if (line.length && [...line, word].map((item) => wordText(item)).join(' ').length > limit) {
        flushLine(); if (captionLines.length >= maxLines) flushCaption();
      }
      line.push(word);
      if (!next || sentence || gap > 500) { flushCaption(); continue; }
      if (clause) { flushLine(); if (captionLines.length >= maxLines) flushCaption(); }
    }
    flushCaption();
    return result;
  }

  type Chunk = { words: Word[]; reason: 'punct' | 'forced' | 'sentence' | 'pause' | 'chars' | 'words' | 'end' };
  const chunks: Chunk[] = []; let bucket: Word[] = [];
  const flush = (reason: Chunk['reason']) => { if (bucket.length) chunks.push({ words: bucket, reason }); bucket = []; };
  const maxChars = preset.maxChars || 25; const maxWords = preset.maxWords || 5;
  for (let index = 0; index < sourceWords.length; index++) {
    const word = sourceWords[index]; const text = wordText(word); const next = sourceWords[index + 1];
    bucket.push(word);
    let reason: Chunk['reason'] | null = null;
    if (/[.!?]$/.test(text)) reason = 'punct';
    if (!reason && next) {
      const nextText = wordText(next); const endsWithComma = /,$/.test(text);
      const isAmount = /^((R\$|US\$|€)?\s*[\d,.]+)(k|m|b)?$/i.test(text.replace(/[()]/g, ''));
      const startsCapital = /^[A-ZÀ-ÖØ-Þ]/.test(nextText);
      const currencyTerm = /^(Mil|Milh(ão|ões)|Bilh(ão|ões)|Reais|Dólar(es)?|Euros?|Centavos|Kwanzas?)$/i.test(nextText);
      if (isAmount && startsCapital && !endsWithComma && !currencyTerm) reason = 'sentence';
    }
    if (!reason && next && next.start - word.end > 400) reason = 'pause';
    if (!reason && next && (joinedWords(bucket).length + 1 + wordText(next).length > maxChars)) reason = 'chars';
    if (!reason && bucket.length >= maxWords) reason = 'words';
    if (reason) flush(reason);
    else if (index === sourceWords.length - 1) flush('end');
  }
  if (bucket.length) flush('end');

  // The reference balances short fragments into the next caption when that stays within its word/character limits.
  for (let index = 0; index < chunks.length - 1; index++) {
    const current = chunks[index]; const next = chunks[index + 1];
    if (['punct', 'forced', 'sentence'].includes(current.reason)) continue;
    let moved = 0;
    while (moved < 2 && current.words.length) {
      const candidate = current.words[current.words.length - 1];
      if (next.words.length + 1 > maxWords || joinedWords([...next.words.slice(0, 1), candidate, ...next.words.slice(1)]).length > maxChars) break;
      current.words.pop(); next.words.unshift(candidate); moved++;
    }
  }

  for (const chunk of chunks) {
    const cueWords = chunk.words;
    const lineEnds = new Set<number>();
    const cueLength = joinedWords(cueWords).length;
    if (!preset.noLineBreak && cueWords.length > 2 && cueLength >= 12) {
      const midpoint = cueLength / 2; let cumulative = 0; let best = Number.POSITIVE_INFINITY; let breakAt = -1;
      cueWords.slice(0, -1).forEach((word, index) => {
        cumulative += wordText(word).length + 1; const distance = Math.abs(cumulative - midpoint);
        if (distance < best && !/[,;:.!?]$/.test(wordText(word))) { best = distance; breakAt = index; }
      });
      if (breakAt >= 0) lineEnds.add(breakAt);
    }
    addCaption(cueWords, lineEnds);
  }
  return result;
}

type DisplayCue = { caption: Caption; start: number; end: number };
const instantChunkStyles = new Set(['beast', 'cove', 'tuba', 'laguna', 'splitz', 'lume', 'silk', 'slash', 'vibe', 'rise', 'aria', 'stack']);
const effectFrames: Partial<Record<CaptionEffect, number>> = { fade: 5, float: 7, blur: 6, rise: 4, bounce: 2, slide: 4, reveal: 6 };

function buildDisplayCues(captions: Caption[], preset: CaptionPreset, styleId: string, duration = 0): DisplayCue[] {
  const visible = captions.filter((caption) => caption.visible);
  const wordFrames = preset.effect === 'fade' ? preset.wordFadeFrames || 5 : effectFrames[preset.effect] || 0;
  const leadMs = Math.max(wordFrames, instantChunkStyles.has(styleId) ? 0 : 5, styleId === 'stack' ? 6 : 0) * 1000 / 30;
  const starts: number[] = [];
  visible.forEach((caption, index) => {
    const minimum = index ? starts[index - 1] + 350 : 0;
    starts.push(Math.min(caption.start, Math.max(caption.start - leadMs, minimum)));
  });
  return visible.map((caption, index) => {
    const start = starts[index]; const limit = starts[index + 1] ?? (duration > 0 ? Math.max(duration, caption.end) : caption.end + 700);
    let end = Math.min(caption.end, limit);
    if (end - start < 700) end = Math.min(start + 700, limit);
    if (limit - end > 0 && limit - end <= 400) end = limit;
    return { caption, start, end };
  });
}

function chunkOpacity(styleId: string, now: number, start: number) {
  return instantChunkStyles.has(styleId) ? 1 : clamp((now - start) * 30 / 1000 / 5);
}

function timedWords(caption: Caption): Word[] {
  const tokens = caption.text.trim().split(/\s+/).filter(Boolean);
  if (caption.words.length === tokens.length) return caption.words.map((word, index) => ({ ...word, text: tokens[index] }));
  const duration = Math.max(1, caption.end - caption.start);
  return tokens.map((text, index) => ({ text, start: caption.start + duration * index / Math.max(1, tokens.length), end: caption.start + duration * (index + 1) / Math.max(1, tokens.length) }));
}

function formatCaptionWords(words: Word[], capitalization: CaptionCapitalization): Word[] {
  let capitalizedFirstLetter = false;
  return words.map((word) => {
    const lowercase = word.text.toLocaleLowerCase('pt-BR');
    if (capitalization === 'uppercase') return { ...word, text: word.text.toLocaleUpperCase('pt-BR') };
    if (capitalization === 'lowercase') return { ...word, text: lowercase };
    const text = lowercase.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/, (letter) => {
      if (capitalizedFirstLetter) return letter;
      capitalizedFirstLetter = true;
      return letter.toLocaleUpperCase('pt-BR');
    });
    return { ...word, text };
  });
}

function formatCaptionText(text: string, capitalization: CaptionCapitalization) {
  if (capitalization === 'uppercase') return text.toLocaleUpperCase('pt-BR');
  const lowercase = text.toLocaleLowerCase('pt-BR');
  if (capitalization === 'lowercase') return lowercase;
  return lowercase.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/, (letter) => letter.toLocaleUpperCase('pt-BR'));
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

function presetTextShadow(preset: CaptionPreset, highlighted: boolean, scale: number) {
  if (preset.special === 'cove') return highlighted
    ? '0 2px 6px rgba(0,0,0,.7),0 0 10px rgba(255,255,255,.95),0 0 22px rgba(255,255,255,.75),0 0 45px rgba(255,255,255,.45)'
    : '0 2px 6px rgba(0,0,0,.75),0 4px 14px rgba(0,0,0,.5)';
  if (!preset.shadowLayers?.length) return preset.shadow || 'none';
  const color = preset.shadowMode === 'colored' ? 'currentColor' : (preset.shadowColor || '#000');
  return preset.shadowLayers.map(([x, y, blur]) => `${(x * scale).toFixed(1)}px ${(y * scale).toFixed(1)}px ${(blur * scale).toFixed(1)}px ${color}`).join(', ');
}

function stackTextShadow(scale: number) {
  const layers = Array.from({ length: 16 }, (_, index) => {
    const step = index + 1; const offset = (2 * step * scale).toFixed(1); const alpha = Math.max(0, .55 * (1 - step / 16)).toFixed(3);
    return `${offset}px ${offset}px 0 rgba(0,0,0,${alpha})`;
  });
  layers.push(`0 ${(6 * scale).toFixed(1)}px ${(22 * scale).toFixed(1)}px rgba(0,0,0,.5)`);
  return layers.join(', ');
}

function motionValues(preset: CaptionPreset, word: Word, now: number, index: number, scale: number, captionStart: number, highlighted = false, entryStart = word.start) {
  const rawFrame = (now - word.start) * 30 / 1000; const chunkFrame = (now - captionStart) * 30 / 1000;
  const frame = rawFrame + (preset.effect === 'fade' ? preset.wordFadeFrames || 5 : effectFrames[preset.effect] || 0);
  const entryFrame = (now - entryStart) * 30 / 1000 + (preset.special === 'stack' ? 6 : 0);
  let opacity = 1; let x = 0; let y = 0; let zoom = 1; let blur = 0; let letterSpacing: number | undefined;
  if (preset.effect === 'fade') opacity = clamp(frame / (preset.wordFadeFrames || 5));
  if (preset.effect === 'float') { opacity = clamp(frame / 7); y = lerp(5 * scale, 0, frame / 7); }
  if (preset.effect === 'blur') { opacity = clamp(frame / 6); blur = lerp(8 * scale, 0, frame / 8); }
  if (preset.effect === 'rise') { opacity = clamp(frame / 4); if (highlighted) { y = lerp(-20 * scale, 0, frame / 8); zoom = frame < 3 ? lerp(1.25, 1.06, frame / 3) : lerp(1.06, 1, (frame - 3) / 5); } }
  if (preset.effect === 'bounce') { opacity = clamp(frame / 2); zoom = lerp(.88, 1.12, frame / 3); if (frame > 3) zoom = lerp(1.12, 1, (frame - 3) / 4); }
  if (preset.effect === 'slide') { opacity = clamp(frame / 4); x = lerp(28 * scale, 0, frame / 5); }
  if (preset.effect === 'reveal') { opacity = clamp(frame / 6); y = lerp(16 * scale, 0, easeOutQuad(frame / 10)); blur = lerp(5 * scale, 0, frame / 8); }
  if (preset.special === 'stack') { opacity = clamp(entryFrame / 6); y = lerp(16 * scale, 0, easeOutQuad(entryFrame / 10)); blur = lerp(5 * scale, 0, entryFrame / 8); }
  if (preset.fontFamily === 'Komika') letterSpacing = -7.25667 * scale * (1 - springProgress(chunkFrame, 700, 14, .6));
  if (preset.fontFamily === 'Manrope') zoom *= springProgress(chunkFrame, 220, 26, .7) * .12 + .88;
  if (preset.effect === 'updown' && highlighted && rawFrame >= 0) y += (index % 2 === 0 ? -.07 : .07) * preset.fontSize * scale;
  return { opacity, x, y, zoom, blur, letterSpacing };
}

function motionStyle(preset: CaptionPreset, word: Word, now: number, index: number, scale: number, captionStart: number, highlighted = false, entryStart = word.start): CSSProperties {
  const motion = motionValues(preset, word, now, index, scale, captionStart, highlighted, entryStart);
  return {
    opacity: motion.opacity,
    transform: `translate3d(${motion.x}px,${motion.y}px,0) scale(${motion.zoom})`,
    filter: motion.blur > .05 ? `blur(${motion.blur}px)` : undefined,
    letterSpacing: motion.letterSpacing === undefined ? undefined : `${motion.letterSpacing}px`,
  };
}

function ClipaCaption({ words, activeIndex, preset, now, scale, captionStart, highlightWords, textColor, highlightColor }: {
  words: Word[]; activeIndex: number; preset: CaptionPreset; now: number; scale: number; captionStart: number;
  highlightWords: boolean; textColor: string; highlightColor: string;
}) {
  const cycle = [preset.active, preset.second, preset.third];
  const wordNode = (word: Word, index: number, extra?: CSSProperties, entryStart = word.start) => {
    const active = highlightWords && index === activeIndex; const accent = active && preset.accentFamily && preset.special !== 'stack';
    const accentOnly = preset.special === 'splitz' && !highlightWords && (word.sourceIndex ?? index) % 4 === 3;
    const color = active ? (highlightColor === preset.active ? cycle[(word.sourceIndex ?? index) % cycle.length] : highlightColor) : textColor;
    const shadow = presetTextShadow(preset, active, scale);
    const style: CSSProperties = {
      ...motionStyle(preset, word, now, index, scale, captionStart, active, entryStart), ...extra, color,
      fontFamily: accent || accentOnly ? `'${preset.accentFamily}', serif` : `'${preset.fontFamily}', sans-serif`,
      fontWeight: accent || accentOnly ? preset.accentWeight : preset.fontWeight,
      fontSize: accent || accentOnly ? `${preset.accentScale}em` : undefined,
      fontStyle: (accent || accentOnly) && preset.accentItalic ? 'italic' : preset.italic ? 'italic' : 'normal',
      background: active && preset.activeBox ? preset.activeBox : undefined,
      paddingInline: active && preset.activeBox ? '.12em' : undefined,
      textShadow: active && preset.special === 'stack' ? stackTextShadow(scale) : shadow,
      WebkitTextStroke: preset.fontFamily === 'Komika' ? `${.2 * scale}px ${preset.stroke}` : undefined,
      textTransform: 'none',
    };
    if (preset.renderMode === 'negative') { style.color = active ? '#111' : '#fff'; style.background = active ? '#fff' : '#111'; style.paddingInline = '.14em'; style.textShadow = 'none'; }
    if (preset.activeBox && active) style.color = '#fff';
    if (preset.special === 'splitz' && active) style.color = highlightColor;
    return <b key={`${word.start}-${word.sourceIndex ?? index}`} className={styles.captionWord} style={style}>{word.text}</b>;
  };
  const renderWords = (items: Word[], offset = 0, entryStart?: number, originalIndices?: number[]) => items.map((word, index) => <span className={styles.captionWordGroup} key={`${word.start}-${word.sourceIndex ?? index}`}>
    {wordNode(word, originalIndices?.[index] ?? offset + index, undefined, entryStart ?? word.start)}{word.lineBreakAfter && <i className={styles.captionLineBreak} />}
  </span>);
  if (preset.special === 'stack') {
    const focus = activeIndex < 0 ? -1 : activeIndex; const before = words.slice(0, Math.max(0, focus)); const after = words.slice(focus + 1); const active = focus >= 0 ? words[focus] : undefined;
    if (focus < 0) return <span className={`${styles.captionLine} ${styles.stackLayout}`}><span className={styles.stackSupport}>{renderWords(words, 0, words[0]?.start || captionStart)}</span></span>;
    return <span className={`${styles.captionLine} ${styles.stackLayout}`}>
      <span className={styles.stackSupport}>{renderWords(before, 0, before[0]?.start || captionStart)}</span>
      {active && wordNode(active, focus, { fontSize: '2.5em', lineHeight: .72 })}
      <span className={styles.stackSupport}>{renderWords(after, focus + 1, after[0]?.start || captionStart)}</span>
    </span>;
  }
  if (preset.special === 'laguna') {
    const focus = activeIndex < 0 ? words.reduce((last, word, index) => now >= word.start ? index : last, 0) : activeIndex;
    const active = highlightWords && activeIndex >= 0 ? words[focus] : undefined;
    const context = active ? words.filter((_, index) => index !== focus) : [words[focus]].filter(Boolean);
    const duration = 10 * 1000 / 30; const contextProgress = clamp((now - captionStart) / duration);
    const entrance = !active ? 0 : words.length === 1 ? contextProgress : active.start - captionStart < duration ? (now >= active.start ? 1 : 0) : clamp((now - (active.start - duration)) / duration);
    return <span className={`${styles.captionLine} ${styles.lagunaLayout}`}>
      {context.length > 0 && <span className={styles.lagunaContext} style={{ opacity: contextProgress, transform: `translateY(${lerp(40 * scale, 0, contextProgress)}px)`, filter: `blur(${lerp(12 * scale, 0, contextProgress)}px)` }}>{renderWords(context, 0, captionStart, active ? words.map((_, index) => index).filter((index) => index !== focus) : [focus])}</span>}
      {active && wordNode(active, focus, { fontSize: '1.28em', lineHeight: .88, opacity: entrance, transform: `translateY(${lerp(40 * scale, 0, entrance)}px)`, filter: `blur(${lerp(12 * scale, 0, entrance)}px)` })}
    </span>;
  }
  const splitRows = preset.special === 'cove' || preset.special === 'open';
  if (splitRows) {
    const pivot = words.length > 2 ? Math.ceil(words.length / 2) : words.length; const groups = [words.slice(0, pivot), words.slice(pivot)].filter((group) => group.length);
    const lines = groups.map((group, row) => {
      const count = group.reduce((sum, word) => sum + wordText(word).length, 0) + Math.max(0, group.length - 1);
      const factor = preset.special === 'cove' ? Math.max(.9, Math.min(1.1, 1 + (13 - count) * .014)) : Math.max(.88, Math.min(1.18, 1 + (12 - count) * .016));
      const size = Math.round(preset.fontSize * scale * factor);
      return <span key={row} style={{ fontSize: `${size}px`, lineHeight: `${Math.round((preset.special === 'cove' ? 1.2 : 1.15) * size)}px` }}>{renderWords(group, row === 0 ? 0 : pivot)}</span>;
    });
    return <span className={`${styles.captionLine} ${styles.twoRows}`}>{lines}</span>;
  }
  return <span className={styles.captionLine}>{renderWords(words)}</span>;
}

type CanvasCaptionOptions = { size: number; position: number; highlightWords: boolean; textColor: string; highlightColor: string; capitalization: CaptionCapitalization };
type CanvasRowWord = { word: Word; index: number };
type CanvasRow = { items: CanvasRowWord[]; size: number; lineHeight: number; entryStart?: number; kind?: 'stack-big' | 'laguna-big' | 'laguna-context' };

function paintCaptionFrame(context: CanvasRenderingContext2D, caption: Caption, now: number, preset: CaptionPreset, options: CanvasCaptionOptions) {
  const words = formatCaptionWords(timedWords(caption), options.capitalization); if (!words.length) return;
  const scale = context.canvas.width / 1080; const baseSize = options.size * scale; const maxWidth = context.canvas.width * .89;
  const activeIndex = words.findIndex((word) => now >= word.start && now < word.end);
  const indexed = words.map((word, index) => ({ word, index })); const rows: CanvasRow[] = [];
  const push = (items: CanvasRowWord[], size = baseSize, lineHeight = preset.lineHeight || 1.02, kind?: CanvasRow['kind']) => {
    if (items.length) rows.push({ items, size, lineHeight, entryStart: items[0].word.start, kind });
  };
  if (preset.special === 'stack') {
    if (options.highlightWords && activeIndex >= 0) {
      push(indexed.slice(0, activeIndex), baseSize, 1);
      push(indexed.slice(activeIndex, activeIndex + 1), baseSize * 2.5, .72, 'stack-big');
      push(indexed.slice(activeIndex + 1), baseSize, 1);
    } else push(indexed, baseSize, 1);
  } else if (preset.special === 'laguna') {
    if (options.highlightWords && activeIndex >= 0) {
      push(indexed.filter(({ index }) => index !== activeIndex), baseSize * .46, 1, 'laguna-context');
      push(indexed.slice(activeIndex, activeIndex + 1), baseSize * 1.28, .88, 'laguna-big');
    } else {
      const current = indexed.reduce((last, item) => now >= item.word.start ? item : last, indexed[0]);
      push([current], baseSize * .46, 1, 'laguna-context');
    }
  } else if (preset.special === 'cove' || preset.special === 'open') {
    const pivot = indexed.length > 2 ? Math.ceil(indexed.length / 2) : indexed.length;
    for (const group of [indexed.slice(0, pivot), indexed.slice(pivot)]) {
      if (!group.length) continue;
      const count = group.reduce((sum, item) => sum + wordText(item.word).length, 0) + group.length - 1;
      const factor = preset.special === 'cove' ? Math.max(.9, Math.min(1.1, 1 + (13 - count) * .014)) : Math.max(.88, Math.min(1.18, 1 + (12 - count) * .016));
      push(group, Math.round(baseSize * factor), preset.special === 'cove' ? 1.2 : 1.15);
    }
  } else {
    let row: CanvasRowWord[] = [];
    for (const item of indexed) {
      row.push(item);
      if (item.word.lineBreakAfter) { push(row); row = []; }
    }
    push(row);
  }

  const rowSpecs = rows.map((row) => {
    const specs = row.items.map(({ word, index }) => {
      const active = options.highlightWords && index === activeIndex;
      const accent = active && Boolean(preset.accentFamily) && preset.special !== 'stack' && preset.special !== 'splitz';
      const accentOnly = preset.special === 'splitz' && !options.highlightWords && (word.sourceIndex ?? index) % 4 === 3;
      const family = accent || accentOnly ? preset.accentFamily! : preset.fontFamily;
      const weight = accent || accentOnly ? preset.accentWeight || preset.fontWeight : preset.fontWeight;
      const italic = accent || accentOnly ? preset.accentItalic : preset.italic;
      const size = row.size * (row.kind === 'stack-big' || row.kind === 'laguna-big' ? 1 : accent || accentOnly ? preset.accentScale || 1 : 1);
      const font = `${italic ? 'italic ' : ''}${weight} ${size}px "${family}"`;
      const cycle = [preset.active, preset.second, preset.third];
      let color = active ? (options.highlightColor === preset.active ? cycle[(word.sourceIndex ?? index) % cycle.length] : options.highlightColor) : options.textColor;
      if (preset.renderMode === 'negative') color = active ? '#111' : '#fff';
      if (preset.activeBox && active) color = '#fff';
      const text = wordText(word);
      context.font = font;
      return { word, index, active, color, font, size, text, width: context.measureText(text).width };
    });
    const gap = row.size * .22; const width = specs.reduce((sum, spec) => sum + spec.width, 0) + gap * Math.max(0, specs.length - 1);
    const height = Math.max(row.size * row.lineHeight, ...specs.map((spec) => spec.size * .88));
    return { row, specs, gap, width, height };
  });
  const totalHeight = rowSpecs.reduce((sum, row) => sum + row.height, 0);
  let y = context.canvas.height * options.position / 100 - totalHeight / 2;
  for (const { row, specs, gap, width, height } of rowSpecs) {
    const middle = y + height / 2; const fit = width > maxWidth ? maxWidth / width : 1;
    context.save(); context.translate(context.canvas.width / 2, middle); context.scale(fit, fit);
    let x = -width / 2;
    for (const spec of specs) {
      const motion = motionValues(preset, spec.word, now, spec.index, scale, caption.start, spec.active, row.entryStart);
      if (row.kind === 'laguna-context' || row.kind === 'laguna-big') {
        const lead = 10 * 1000 / 30;
        const progress = row.kind === 'laguna-context' ? clamp((now - caption.start) / lead)
          : words.length === 1 ? clamp((now - caption.start) / lead)
            : spec.word.start - caption.start < lead ? (now >= spec.word.start ? 1 : 0) : clamp((now - (spec.word.start - lead)) / lead);
        motion.opacity *= progress; motion.y += lerp(40 * scale, 0, progress); motion.blur = lerp(12 * scale, 0, progress);
      }
      if (motion.opacity > 0) {
        context.save(); context.globalAlpha *= motion.opacity;
        context.translate(x + spec.width / 2 + motion.x, motion.y); context.scale(motion.zoom, motion.zoom);
        context.font = spec.font; context.textAlign = 'left'; context.textBaseline = 'middle';
        if (motion.blur > .05) context.filter = `blur(${motion.blur}px)`;
        const letterContext = context as CanvasRenderingContext2D & { letterSpacing?: string };
        if (motion.letterSpacing !== undefined && 'letterSpacing' in letterContext) letterContext.letterSpacing = `${motion.letterSpacing}px`;
        const background = preset.renderMode === 'negative' ? (spec.active ? '#fff' : '#111') : spec.active ? preset.activeBox : undefined;
        if (background) {
          const pad = spec.size * .14; context.fillStyle = background;
          context.fillRect(-spec.width / 2 - pad, -spec.size * .56, spec.width + pad * 2, spec.size * 1.12);
        }
        const shadows = row.kind === 'stack-big'
          ? [...Array.from({ length: 16 }, (_, index) => {
            const step = index + 1; return [2 * step * scale, 2 * step * scale, 0, `rgba(0,0,0,${Math.max(0, .55 * (1 - step / 16)).toFixed(3)})`];
          }), [0, 6 * scale, 22 * scale, 'rgba(0,0,0,.5)']]
          : preset.special === 'cove'
            ? (spec.active ? [[0,2,6,'rgba(0,0,0,.7)'],[0,0,10,'rgba(255,255,255,.95)'],[0,0,22,'rgba(255,255,255,.75)'],[0,0,45,'rgba(255,255,255,.45)']] : [[0,2,6,'rgba(0,0,0,.75)'],[0,4,14,'rgba(0,0,0,.5)']])
            : (preset.shadowLayers || []).map(([sx, sy, blur]) => [sx * scale, sy * scale, blur * scale, preset.shadowMode === 'colored' ? spec.color : preset.shadowColor || '#000']);
        context.fillStyle = spec.color;
        for (const [sx, sy, blur, color] of shadows) {
          context.shadowOffsetX = Number(sx); context.shadowOffsetY = Number(sy); context.shadowBlur = Number(blur); context.shadowColor = String(color);
          context.fillText(spec.text, -spec.width / 2, 0);
        }
        context.shadowColor = 'transparent'; context.shadowOffsetX = 0; context.shadowOffsetY = 0; context.shadowBlur = 0;
        if (preset.fontFamily === 'Komika') { context.lineWidth = .2 * scale; context.strokeStyle = preset.stroke; context.strokeText(spec.text, -spec.width / 2, 0); }
        context.fillText(spec.text, -spec.width / 2, 0); context.restore();
      }
      x += spec.width + gap;
    }
    context.restore(); y += height;
  }
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
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null); const ffmpegReadyRef = useRef<Promise<unknown> | null>(null); const ffmpegProgressRef = useRef<(progress: number) => void>(() => {});
  const [stage, setStage] = useState<Stage>('upload'); const [tab, setTab] = useState<Tab>('styles');
  const [keyConfigured, setKeyConfigured] = useState(initialKeyConfigured); const [showKey, setShowKey] = useState(!initialKeyConfigured);
  const [showDrive, setShowDrive] = useState(false); const [driveUrl, setDriveUrl] = useState(''); const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState(''); const [remoteUrl, setRemoteUrl] = useState('');
  const [batchMode, setBatchMode] = useState(false); const [batchItems, setBatchItems] = useState<BatchItem[]>([]); const [activeBatchId, setActiveBatchId] = useState('');
  const [language, setLanguage] = useState('auto'); const [progress, setProgress] = useState(0); const [message, setMessage] = useState('');
  const [captions, setCaptions] = useState<Caption[]>([]); const [selectedStyle, setSelectedStyle] = useState('cove'); const [styleFilter, setStyleFilter] = useState<StyleFilter>('all'); const [capitalization, setCapitalization] = useState<CaptionCapitalization>('sentence'); const [currentTime, setCurrentTime] = useState(0);
  const [rendering, setRendering] = useState(false); const [renderProgress, setRenderProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null); const [videoBox, setVideoBox] = useState<VideoBox | null>(null);
  const [captionPosition, setCaptionPosition] = useState(presets.cove.captionPosition); const [captionSize, setCaptionSize] = useState(presets.cove.fontSize); const [highlightWords, setHighlightWords] = useState(true);
  const [textColor, setTextColor] = useState(presets.cove.fill); const [highlightColor, setHighlightColor] = useState(presets.cove.active);

  const displayCues = useMemo(() => buildDisplayCues(captions, presets[selectedStyle] || presets.cove, selectedStyle, (videoInfo?.duration || 0) * 1000), [captions, selectedStyle, videoInfo?.duration]);
  const activeCue = useMemo(() => displayCues.find((cue) => currentTime * 1000 >= cue.start && currentTime * 1000 < cue.end), [displayCues, currentTime]);
  const activeCaption = activeCue?.caption;
  const activeWords = useMemo(() => activeCaption ? formatCaptionWords(timedWords(activeCaption), capitalization) : [], [activeCaption, capitalization]);
  const activeWordIndex = useMemo(() => activeWords.findIndex((word) => currentTime * 1000 >= word.start && currentTime * 1000 < word.end), [activeWords, currentTime]);
  const scenes = useMemo(() => Array.from({ length: Math.ceil(captions.length / 5) }, (_, index) => captions.slice(index * 5, index * 5 + 5)), [captions]);
  const batchComplete = batchMode && batchItems.length > 0 && batchItems.every((item) => item.status === 'done' || item.status === 'error');

  useEffect(() => () => { if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => () => { ffmpegRef.current?.terminate(); ffmpegRef.current = null; ffmpegReadyRef.current = null; }, []);
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
      const stageWidth = stageElement.clientWidth; const stageHeight = stageElement.clientHeight; const videoRatio = videoInfo.width / videoInfo.height;
      const width = Math.min(stageWidth, stageHeight * videoRatio); const height = width / videoRatio;
      setVideoBox({ frameWidth: width, frameHeight: height, left: width * .055, width: width * .89, bottom: height * (1 - captionPosition / 100), scale: width / 1080 });
    };
    update(); const observer = new ResizeObserver(update); observer.observe(stageElement); return () => observer.disconnect();
  }, [stage, videoInfo, captionPosition, captionSize]);

  function readVideoInfo(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (video.videoWidth && video.videoHeight) setVideoInfo(describeVideo(video.videoWidth, video.videoHeight, Number.isFinite(video.duration) ? video.duration : 0));
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files || []); event.currentTarget.value = '';
    if (!selected.length) return;
    if (selected.length > 5) { setMessage('Selecione no máximo cinco vídeos por lote.'); return; }
    if (selected.some((item) => !['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(item.type))) { setMessage('Use vídeos MP4, MOV ou WebM.'); return; }
    if (selected.some((item) => item.size > 2 * 1024 * 1024 * 1024)) { setMessage('O limite é 2 GB por vídeo.'); return; }
    const first = selected[0];
    setBatchMode(selected.length > 1);
    setBatchItems(selected.length > 1 ? selected.map((batchFile) => ({ id: crypto.randomUUID(), file: batchFile, status: 'queued', progress: 0, captions: [] })) : []);
    setActiveBatchId(''); setFile(first); setPreviewUrl(URL.createObjectURL(first)); setRemoteUrl(''); setVideoInfo(null); setVideoBox(null); setProgress(0); setMessage(''); setStage('ready');
  }

  function updateBatchItem(id: string, patch: Partial<BatchItem>) {
    setBatchItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function startBatchTranscription() {
    if (!keyConfigured) { setShowKey(true); setMessage('Conecte sua chave Deepgram primeiro.'); return; }
    if (!batchItems.length) return;
    setStage('transcribing'); setMessage('Preparando o lote…');
    for (const item of batchItems) {
      if (item.status === 'done') continue;
      let temporaryBlobUrl = '';
      updateBatchItem(item.id, { status: 'uploading', progress: 0, error: undefined });
      try {
        const blob = await upload(`legendas/${username}/${Date.now()}-${safeName(item.file.name)}`, item.file, {
          access: 'public', handleUploadUrl: '/api/legendas/upload', multipart: item.file.size > 100 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => updateBatchItem(item.id, { progress: Math.round(percentage) }),
        });
        temporaryBlobUrl = blob.url;
        updateBatchItem(item.id, { status: 'transcribing', progress: 100 });
        setMessage(`Transcrevendo ${item.file.name}…`);
        const response = await fetch('/api/legendas/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audioUrl: blob.url, language }) });
        const result = await response.json() as TranscriptResponse;
        if (!response.ok) throw new Error(result.error || 'Não foi possível transcrever este vídeo.');
        const generated = buildCaptions(Array.isArray(result.words) ? result.words : [], result.text || '', presets[selectedStyle] || presets.cove);
        if (!generated.length) throw new Error('A Deepgram não encontrou fala neste vídeo.');
        updateBatchItem(item.id, { status: 'done', captions: generated, languageCode: result.language_code, progress: 100 });
      } catch (reason) {
        updateBatchItem(item.id, { status: 'error', error: reason instanceof Error ? reason.message : 'Não foi possível gerar as legendas.' });
      } finally {
        if (temporaryBlobUrl) void fetch('/api/legendas/cleanup', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: temporaryBlobUrl }) });
      }
    }
    setStage('ready');
    setMessage('Processamento do lote concluído. Abra cada vídeo para revisar e exportar as legendas.');
  }

  function openBatchItem(item: BatchItem) {
    if (stage === 'transcribing' || item.status !== 'done') return;
    setActiveBatchId(item.id); setFile(item.file); setPreviewUrl(URL.createObjectURL(item.file)); setRemoteUrl(''); setCaptions(item.captions);
    setVideoInfo(null); setVideoBox(null); setCurrentTime(0); setSelectedStyle('cove'); setTab('styles'); setStage('editor'); setMessage('');
  }

  function returnToBatch() {
    if (activeBatchId) updateBatchItem(activeBatchId, { captions });
    setActiveBatchId(''); setStage('ready'); setMessage('');
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
    if (batchMode) { await startBatchTranscription(); return; }
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
      const generated = buildCaptions(Array.isArray(result.words) ? result.words : [], result.text || '', presets[selectedStyle] || presets.cove);
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
    setBatchMode(false); setBatchItems([]); setActiveBatchId(''); setFile(null); setPreviewUrl(''); setRemoteUrl(direct); setShowDrive(false); setStage('ready'); setMessage('Link do Drive adicionado. A prévia ficará disponível após usar um arquivo local.');
  }

  function updateCaption(id: string, patch: Partial<Caption>) { setCaptions((current) => current.map((caption) => caption.id === id ? { ...caption, ...patch } : caption)); }
  function removeCaption(id: string) { setCaptions((current) => current.filter((caption) => caption.id !== id)); }
  function addCaption(after: number) {
    const previous = captions[after]; const next = captions[after + 1]; const start = previous?.end || 0; const end = next?.start || start + 1800;
    setCaptions((current) => [...current.slice(0, after + 1), { id: crypto.randomUUID(), start, end, text: 'Nova legenda', words: [], visible: true }, ...current.slice(after + 1)]);
  }
  function selectStyle(value: string) {
    const preset = presets[value] || presets.cove;
    setCaptions((current) => {
      if (!current.length) return current;
      const words = current.flatMap((caption) => timedWords(caption));
      const hidden = current.filter((caption) => !caption.visible);
      return buildCaptions(words, '', preset).map((caption) => ({
        ...caption,
        visible: !hidden.some((item) => caption.start < item.end && caption.end > item.start),
      }));
    });
    setSelectedStyle(value); setTextColor(preset.fill); setHighlightColor(preset.active); setCaptionPosition(preset.captionPosition); setCaptionSize(preset.fontSize);
  }
  function seek(ms: number) { if (videoRef.current) videoRef.current.currentTime = ms / 1000; setCurrentTime(ms / 1000); }

  function exportSubtitles(format: 'srt' | 'vtt') {
    const visible = captions.filter((caption) => caption.visible);
    const body = visible.map((caption, index) => `${index + 1}\n${timestamp(caption.start, format === 'vtt')} --> ${timestamp(caption.end, format === 'vtt')}\n${formatCaptionText(caption.text, capitalization)}\n`).join('\n');
    downloadText(`legendas-${Date.now()}.${format}`, format === 'vtt' ? `WEBVTT\n\n${body}` : body, format === 'vtt' ? 'text/vtt' : 'application/x-subrip');
  }

  async function convertToMp4(input: Blob) {
    setMessage('Finalizando o MP4…'); setRenderProgress(90);
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')]);
    let ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
      ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress: conversion }) => ffmpegProgressRef.current(conversion));
      ffmpegRef.current = ffmpeg;
      const base = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
      ffmpegReadyRef.current = Promise.all([toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'), toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')])
        .then(([coreURL, wasmURL]) => ffmpeg!.load({ coreURL, wasmURL }));
    }
    const engine = ffmpeg;
    const ready = ffmpegReadyRef.current;
    if (!ready) throw new Error('Não foi possível iniciar o conversor MP4.');
    ffmpegProgressRef.current = (conversion) => setRenderProgress(90 + Math.round(Math.max(0, Math.min(1, conversion)) * 10));
    const inputName = `legendas-${Date.now()}.webm`; const outputName = `legendas-${Date.now()}.mp4`;
    try {
      await ready;
      await engine.writeFile(inputName, new Uint8Array(await input.arrayBuffer()));
      const exitCode = await engine.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputName]);
      if (exitCode !== 0) throw new Error('O conversor MP4 não concluiu o processamento.');
      const result = await engine.readFile(outputName); if (typeof result === 'string') throw new Error('A conversão não retornou um vídeo.');
      const bytes = new Uint8Array(result); return new Blob([bytes.buffer], { type: 'video/mp4' });
    } catch (reason) {
      if (!engine.loaded) { engine.terminate(); ffmpegRef.current = null; ffmpegReadyRef.current = null; }
      throw reason;
    } finally {
      if (engine.loaded) { try { await engine.deleteFile(inputName); await engine.deleteFile(outputName); } catch { /* arquivo temporário já removido */ } }
      ffmpegProgressRef.current = () => {};
    }
  }

  async function exportVideo() {
    const video = videoRef.current; if (!video || !previewUrl) { setMessage('Para exportar o vídeo pronto, selecione o arquivo original neste aparelho.'); return; }
    if (!('MediaRecorder' in window)) { setMessage('Seu navegador não oferece exportação de vídeo. Use Chrome ou Edge.'); return; }
    const expectedDuration = Number.isFinite(video.duration) ? video.duration : 0;
    if (expectedDuration <= 0) { setMessage('Aguarde o vídeo carregar completamente antes de exportar.'); return; }
    setRendering(true); setRenderProgress(0); setMessage('Preparando o vídeo para exportação…');
    const savedTime = video.currentTime; const savedMuted = video.muted; const wasPaused = video.paused;
    let canvasStream: MediaStream | null = null; let sourceStream: MediaStream | null = null; let recorder: MediaRecorder | null = null;
    let animationFrame = 0; let endedHandler: (() => void) | null = null;
    try {
      const exportPreset = presets[selectedStyle] || presets.cove;
      const exportCues = buildDisplayCues(captions, exportPreset, selectedStyle, Number.isFinite(video.duration) ? video.duration * 1000 : 0);
      await Promise.allSettled([
        document.fonts.load(`${exportPreset.fontWeight} ${captionSize}px "${exportPreset.fontFamily}"`),
        ...(exportPreset.accentFamily ? [document.fonts.load(`${exportPreset.accentWeight || 400} ${captionSize}px "${exportPreset.accentFamily}"`)] : []),
      ]);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(2, Math.floor((video.videoWidth || 1080) / 2) * 2); canvas.height = Math.max(2, Math.floor((video.videoHeight || 1920) / 2) * 2);
      const context = canvas.getContext('2d'); if (!context) throw new Error('Não foi possível preparar o quadro do vídeo.');
      if (!canvas.captureStream) throw new Error('Seu navegador não oferece captura do vídeo. Use Chrome ou Edge.');
      canvasStream = canvas.captureStream(30);
      const capturable = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      sourceStream = capturable.captureStream?.() || capturable.mozCaptureStream?.() || null; sourceStream?.getAudioTracks().forEach((track) => canvasStream?.addTrack(track));
      const mimeType = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=h264,aac', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      if (!mimeType) throw new Error('Este navegador não oferece um formato de gravação compatível. Use Chrome ou Edge.');
      const pixels = canvas.width * canvas.height;
      recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: Math.min(18_000_000, Math.max(3_000_000, Math.round(pixels * 30 * .08))), audioBitsPerSecond: 128_000 });
      const chunks: BlobPart[] = []; recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      const recorderStopped = new Promise<void>((resolve, reject) => {
        recorder!.onstop = () => resolve();
        recorder!.onerror = (event) => reject((event as Event & { error?: DOMException }).error || new Error('A gravação do vídeo foi interrompida.'));
      });
      let cueIndex = 0; let lastPaintedTime = -1; let lastProgress = -1;
      const stopRecording = () => { if (recorder?.state === 'recording') recorder.stop(); };
      const drawFrame = () => {
        if (recorder?.state !== 'recording') return;
        const seconds = video.currentTime;
        if (lastPaintedTime < 0 || seconds - lastPaintedTime >= 1 / 30 || video.ended) {
          lastPaintedTime = seconds;
          context.fillStyle = '#000'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const now = seconds * 1000;
          while (cueIndex < exportCues.length - 1 && now >= exportCues[cueIndex].end) cueIndex++;
          const cue = exportCues[cueIndex];
          if (cue && now >= cue.start && now < cue.end) {
            context.save(); context.globalAlpha = chunkOpacity(selectedStyle, now, cue.start);
            paintCaptionFrame(context, cue.caption, now, exportPreset, { size: captionSize, position: captionPosition, highlightWords, textColor, highlightColor, capitalization });
            context.restore();
          }
        }
        const progress = video.duration ? Math.min(90, Math.round(seconds / video.duration * 90)) : 0;
        if (progress !== lastProgress) { lastProgress = progress; setRenderProgress(progress); }
        if (video.ended) stopRecording();
        else animationFrame = requestAnimationFrame(drawFrame);
      };
      endedHandler = stopRecording;
      video.addEventListener('ended', stopRecording, { once: true });
      video.pause();
      if (Math.abs(video.currentTime) > .01) await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => { video.removeEventListener('seeked', onSeeked); reject(new Error('Não foi possível voltar ao início do vídeo para exportar.')); }, 10000);
        const onSeeked = () => { window.clearTimeout(timeout); resolve(); };
        video.addEventListener('seeked', onSeeked, { once: true }); video.currentTime = 0;
      }); else video.currentTime = 0;
      context.fillStyle = '#000'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.muted = false; setMessage(mimeType.startsWith('video/mp4') ? 'Gravando diretamente em MP4…' : 'Gravando o vídeo; convertendo para MP4 no final…'); recorder.start(1000); await video.play(); animationFrame = requestAnimationFrame(drawFrame); await recorderStopped;
      if (!video.ended && video.currentTime < expectedDuration - 0.25) throw new Error(`A gravação foi interrompida em ${time(video.currentTime * 1000)} de ${time(expectedDuration * 1000)}. O vídeo não foi baixado; tente exportar novamente.`);
      const recorded = new Blob(chunks, { type: mimeType }); const mp4 = mimeType.startsWith('video/mp4') ? recorded : await convertToMp4(recorded);
      const exportedDuration = await readVideoDuration(mp4); if (exportedDuration < expectedDuration - Math.max(0.5, expectedDuration * 0.01)) throw new Error(`O MP4 ficou incompleto (${time(exportedDuration * 1000)} de ${time(expectedDuration * 1000)}). O arquivo não foi baixado; tente exportar novamente.`);
      const link = document.createElement('a'); link.href = URL.createObjectURL(mp4); link.download = `video-legendado-${Date.now()}.mp4`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 2000); setRenderProgress(100); setMessage('Vídeo MP4 exportado.');
    } catch (reason) { if (recorder?.state === 'recording') recorder.stop(); setMessage(reason instanceof Error ? reason.message : 'Não foi possível renderizar este vídeo no navegador.'); }
    finally {
      cancelAnimationFrame(animationFrame); if (endedHandler) video.removeEventListener('ended', endedHandler); video.pause();
      canvasStream?.getTracks().forEach((track) => track.stop()); sourceStream?.getTracks().forEach((track) => track.stop());
      video.currentTime = savedTime; video.muted = savedMuted; if (!wasPaused) void video.play();
      setRendering(false); setRenderProgress(0);
    }
  }

  async function signOut() { await fetch('/api/portfolio/session', { method: 'DELETE' }); router.refresh(); }
  function reset() { setStage('upload'); setBatchMode(false); setBatchItems([]); setActiveBatchId(''); setFile(null); setRemoteUrl(''); setCaptions([]); setVideoInfo(null); setVideoBox(null); setProgress(0); setMessage(''); if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); setPreviewUrl(''); }

  return <main className={styles.page}>
    <header className={styles.header}><BrandLogo size="sm" className={styles.logo} href="/" /><span className={styles.headerLabel}>Legendas</span><nav className={styles.headerNav}><button onClick={() => setShowKey(true)}><Key /> Deepgram</button><span>@{username}</span><button onClick={signOut}>Sair</button></nav></header>

    {stage === 'upload' && <section className={styles.uploadPage}>
      <div className={styles.uploadIntro}><span className={styles.eyebrow}><i /> AYMAR LABS / LEGENDAS</span><h1>Legendas que<br /><em>prendem atenção.</em></h1><p>Envie seu vídeo e gere legendas palavra por palavra com Legendas da Aymar Labs. Escolha um estilo e ajuste cada fala.</p></div>
      <div className={styles.uploadCard}>
        <div className={styles.uploadMark}><Upload /></div><h2>Envie até cinco vídeos por vez</h2><p>MP4, MOV ou WebM · Até 2 GB por vídeo</p>
        <div className={styles.sourceMenu}><button className={styles.primaryButton} onClick={() => fileRef.current?.click()}><Upload /> Do meu computador</button><button onClick={() => setShowDrive(true)}><Cloud /> Do Google Drive</button><button onClick={() => mobileRef.current?.click()}><Phone /> Do meu celular</button></div>
        <input ref={fileRef} className={styles.hiddenInput} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v" multiple onChange={chooseFile} />
        <input ref={mobileRef} className={styles.hiddenInput} type="file" accept="video/*" capture="environment" onChange={chooseFile} />
        {!keyConfigured && <button className={styles.keyNotice} onClick={() => setShowKey(true)}><Key /> Conecte sua chave Deepgram antes de começar</button>}
        {message && <p className={styles.error}>{message}</p>}
      </div>
    </section>}

    {(stage === 'ready' || stage === 'transcribing') && <section className={styles.preparePage}>
      <button className={styles.backButton} onClick={reset}><ArrowLeft /> Voltar</button>
      <div className={styles.prepareCard}><div className={styles.prepareTitle}><Sparkles /><h2>Gerar Legendas</h2></div>
        {batchMode ? <div className={styles.batchQueue}>
          <div className={styles.batchHeading}><strong>{batchItems.length} vídeos no lote</strong><span>Máximo: 5</span></div>
          {batchItems.map((item, index) => <article className={styles.batchItem} key={item.id}>
            <div className={styles.batchFile}><span>{String(index + 1).padStart(2, '0')}</span><div><strong title={item.file.name}>{item.file.name}</strong><small>{(item.file.size / (1024 * 1024)).toFixed(1)} MB · {item.status === 'queued' ? 'Aguardando' : item.status === 'uploading' ? `Enviando ${item.progress}%` : item.status === 'transcribing' ? 'Transcrevendo…' : item.status === 'done' ? `${item.captions.length} blocos prontos` : 'Falha na transcrição'}</small></div></div>
            {item.status === 'uploading' && <div className={styles.batchProgress}><i style={{ width: `${item.progress}%` }} /></div>}
            {item.status === 'error' && <p className={styles.batchError}>{item.error}</p>}
            {item.status === 'done' && <button className={styles.batchEdit} type="button" disabled={stage === 'transcribing'} onClick={() => openBatchItem(item)}>Editar legendas</button>}
          </article>)}
          {batchComplete && <p className={styles.progressText}>Lote processado. Abra cada vídeo para revisar e exportar as legendas.</p>}
        </div> : <>
          <div className={styles.previewShell}>
            <div className={styles.prepareVideoFrame} style={{ '--video-ratio': videoInfo ? videoInfo.width / videoInfo.height : 9 / 16 } as CSSProperties}>
              {previewUrl ? <><video ref={videoRef} src={previewUrl} controls playsInline onLoadedMetadata={readVideoInfo} />{videoInfo && <span className={styles.aspectBadge}>{videoInfo.orientation} · {videoInfo.ratio} · {videoInfo.width}×{videoInfo.height}</span>}</> : <div className={styles.drivePreview}><Cloud /><strong>Vídeo do Google Drive</strong><span>A prévia local não está disponível.</span></div>}
            </div>
          </div>
          {file && <div className={styles.fileIdentity}><span>{file.name}</span><strong>{videoInfo ? `${videoInfo.orientation} · ${videoInfo.ratio}` : 'Identificando formato…'}</strong></div>}
          {stage === 'transcribing' && <><div className={styles.progress}><i style={{ width: `${progress}%` }} /></div><p className={styles.progressText}>{message}</p></>}
        </>}
        <label className={styles.languageSelect}><span>Idioma do áudio:</span><select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={stage === 'transcribing'}>{languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown /></label>
        <button className={styles.generateButton} onClick={startTranscription} disabled={stage === 'transcribing' || (batchComplete && batchItems.every((item) => item.status === 'done'))}><Sparkles /> {stage === 'transcribing' ? (batchMode ? 'Gerando legendas do lote…' : 'Gerando legendas…') : batchMode ? batchComplete ? batchItems.some((item) => item.status === 'error') ? 'Tentar novamente os vídeos com erro' : 'Lote processado' : `Gerar legendas dos ${batchItems.length} vídeos` : 'Gerar Legendas'}</button>
      </div>
    </section>}

    {stage === 'editor' && <section className={styles.editorPage}>
      <div className={styles.editorTop}><button onClick={batchMode ? returnToBatch : reset}><ArrowLeft /> {batchMode ? 'Voltar ao lote' : 'Novo vídeo'}</button><div><strong>Editor de legendas</strong><span>{captions.length} blocos{videoInfo ? ` · ${videoInfo.orientation} ${videoInfo.ratio}` : ''}</span></div><div className={styles.exportActions}><button onClick={() => exportSubtitles('srt')}><Download /> SRT</button><button onClick={() => exportSubtitles('vtt')}><Download /> VTT</button><button className={styles.exportPrimary} onClick={exportVideo} disabled={rendering || !previewUrl}><Download /> {rendering ? `Processando ${renderProgress}%` : 'Exportar MP4'}</button></div></div>
      <div className={styles.editorGrid}>
        <div className={styles.videoColumn}>
          <div ref={stageRef} className={styles.videoStage}>
            <div className={styles.videoFrame} style={{ width: videoBox?.frameWidth, height: videoBox?.frameHeight, aspectRatio: videoInfo ? `${videoInfo.width} / ${videoInfo.height}` : '9 / 16' }}>
              {previewUrl ? <video ref={videoRef} src={previewUrl} controls={!rendering} playsInline onLoadedMetadata={readVideoInfo} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} /> : <div className={styles.drivePreview}><Cloud /><strong>Prévia indisponível</strong><span>Edite o texto e exporte SRT ou VTT.</span></div>}
              {activeCaption && activeCue && videoBox && <div style={{ left: videoBox.left, width: videoBox.width, bottom: videoBox.bottom, opacity: chunkOpacity(selectedStyle, currentTime * 1000, activeCue.start), fontFamily: `'${(presets[selectedStyle] || presets.cove).fontFamily}', sans-serif`, fontWeight: (presets[selectedStyle] || presets.cove).fontWeight, fontSize: `${Math.max(10, captionSize * videoBox.scale)}px`, letterSpacing: (presets[selectedStyle] || presets.cove).letterSpacing, lineHeight: (presets[selectedStyle] || presets.cove).lineHeight || 1.02 } as CSSProperties} className={styles.captionOverlay}><ClipaCaption words={activeWords} activeIndex={activeWordIndex} preset={presets[selectedStyle] || presets.cove} now={currentTime * 1000} scale={videoBox.scale} captionStart={activeCaption.start} highlightWords={highlightWords} textColor={textColor} highlightColor={highlightColor} /></div>}
              {videoInfo && <span className={styles.aspectBadge}>{videoInfo.ratio} · {videoInfo.width}×{videoInfo.height}</span>}
            </div>
          </div>
          <div className={styles.videoMeta}><span>{activeCaption ? `${time(activeCaption.start)} — ${time(activeCaption.end)}` : 'Reproduza o vídeo para visualizar'}</span><span>{videoInfo ? `${videoInfo.orientation} · ${videoInfo.ratio}` : selectedStyle.replaceAll('-', ' ')}</span></div>
          {message && <p className={styles.editorMessage}>{message}</p>}
        </div>
        <aside className={styles.editorPanel}><div className={styles.tabs}><button className={tab === 'styles' ? styles.activeTab : ''} onClick={() => setTab('styles')}>Escolher Estilo</button><button className={tab === 'captions' ? styles.activeTab : ''} onClick={() => setTab('captions')}>Editar Legendas</button><button className={tab === 'scenes' ? styles.activeTab : ''} onClick={() => setTab('scenes')}>Cenas</button></div>
          {tab === 'styles' && <div className={styles.stylesPane}>
            <div className={styles.styleFilters}>{([['all', 'Todos'], ['standard', 'Padrão'], ['custom', 'Custom']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={styleFilter === value} onClick={() => setStyleFilter(value)}>{label}</button>)}</div>
            <div className={styles.styleGrid}>{captionStyles.filter(([value]) => styleFilter === 'all' || styleGroups[styleFilter].includes(value)).map(([value, label]) => <button key={value} data-style={value} aria-pressed={selectedStyle === value} onClick={() => selectStyle(value)}><span>{label}</span></button>)}</div>
            <div className={styles.styleControls}>
              <label><span>Posição <strong>{captionPosition}%</strong></span><input type="range" min="18" max="88" value={captionPosition} onChange={(event) => setCaptionPosition(Number(event.target.value))} /></label>
              <label><span>Tamanho <strong>{captionSize}px</strong></span><input type="range" min="30" max="120" step=".25" value={captionSize} onChange={(event) => setCaptionSize(Number(event.target.value))} /></label>
              <label className={styles.colorControl}><span>Cor do texto</span><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label>
              <label className={styles.colorControl}><span>Cor do destaque</span><input type="color" value={highlightColor} onChange={(event) => setHighlightColor(event.target.value)} /></label>
              <label className={styles.toggleControl}><span>Realçar palavras</span><input type="checkbox" checked={highlightWords} onChange={(event) => setHighlightWords(event.target.checked)} /></label>
              <div className={styles.capitalizationControl} role="group" aria-label="Formato das letras da legenda">
                <span>Formato do texto</span>
                <div className={styles.capitalizationOptions}>
                  {([['uppercase', 'MAIÚSCULA'], ['sentence', 'Normal'], ['lowercase', 'minúscula']] as const).map(([value, label]) => <button key={value} type="button" aria-label={value === 'sentence' ? 'Primeira letra maiúscula, restante minúscula' : label} aria-pressed={capitalization === value} onClick={() => setCapitalization(value)}>{label}</button>)}
                </div>
              </div>
            </div>
          </div>}
          {tab === 'captions' && <div className={styles.captionsPane}>{captions.map((caption, index) => <div className={styles.captionBlock} key={caption.id}><span className={styles.captionTime}>{time(caption.start)} — {time(caption.end)}</span><textarea value={caption.text} onChange={(event) => updateCaption(caption.id, { text: event.target.value })} /><div className={styles.captionTools}><button title="Ajustar início" onClick={() => seek(caption.start)}><Settings /></button><button title={caption.visible ? 'Ocultar' : 'Exibir'} onClick={() => updateCaption(caption.id, { visible: !caption.visible })}><Eye /></button><button title="Remover" onClick={() => removeCaption(caption.id)}><Trash /></button></div><button className={styles.addCaption} onClick={() => addCaption(index)} title="Adicionar legenda"><Plus /></button></div>)}</div>}
          {tab === 'scenes' && <div className={styles.scenesPane}>{scenes.map((scene, index) => <button key={index} onClick={() => seek(scene[0]?.start || 0)}><span>0{index + 1}</span><strong>Cena {index + 1}</strong><small>{scene.map((caption) => caption.text).join(' ').slice(0, 105)}{scene.map((caption) => caption.text).join(' ').length > 105 ? '…' : ''}</small></button>)}</div>}
        </aside>
      </div>
    </section>}

    {showKey && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && keyConfigured) setShowKey(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="deepgram-title"><button className={styles.modalClose} onClick={() => setShowKey(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Key /></div><span className={styles.sectionLabel}>CONEXÃO SEGURA</span><h2 id="deepgram-title">Conecte a Deepgram.</h2><p>O Clipa usa Deepgram para transcrever palavra por palavra. Crie sua conta, copie a API key e cole abaixo. A chave fica criptografada em cookie protegido.</p><a href="https://console.deepgram.com/" target="_blank" rel="noreferrer">Abrir console da Deepgram ↗</a><form onSubmit={connectKey} className={styles.keyForm}><label>API key<input type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Cole sua chave aqui" required /></label><button type="submit"><Key /> Validar e conectar</button></form>{keyConfigured && <div className={styles.connected}><span>Chave pessoal conectada.</span><button onClick={disconnectKey}>Remover chave</button></div>}{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}

    {showDrive && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDrive(false); }}><section className={styles.modal} role="dialog" aria-modal="true"><button className={styles.modalClose} onClick={() => setShowDrive(false)} aria-label="Fechar">×</button><div className={styles.modalIcon}><Cloud /></div><span className={styles.sectionLabel}>GOOGLE DRIVE</span><h2>Importe por link.</h2><p>O arquivo precisa estar compartilhado como “qualquer pessoa com o link”. Para melhor resultado, use vídeos de até 100 MB.</p><div className={styles.keyForm}><label>Link do arquivo<input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://drive.google.com/file/d/..." /></label><button onClick={useDrive}><Cloud /> Usar vídeo do Drive</button></div>{message && <p className={styles.modalMessage}>{message}</p>}</section></div>}
  </main>;
}
