import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Aymar — tecnologia aplicada';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px', background: '#0a0a0a', color: '#f5f4ef', fontFamily: 'Arial' }}><div style={{ display: 'flex', fontSize: 28, letterSpacing: 5, color: '#0A84FF' }}>AYMAR</div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1, letterSpacing: -4 }}><span>A operação</span><span style={{ color: '#0A84FF' }}>inteligente.</span></div><div style={{ display: 'flex', fontSize: 18, color: '#a9a9a3', letterSpacing: 2 }}>SOFTWARE PRÓPRIO · DADOS UNIFICADOS · IA APLICADA</div></div>, { ...size });
}
