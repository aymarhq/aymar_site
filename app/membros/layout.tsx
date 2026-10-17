import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import './membros.css';

export const metadata: Metadata = {
  title: 'Membros — Aymar Labs',
  description: 'Acesso à área de membros da Aymar Labs.',
  robots: { index: false, follow: false }
};

export default function MembersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="members-page" id="top">
    <header className="members-header">
      <BrandLogo size="md" href="/" label="Aymar Labs, voltar ao site" />
      <Link className="members-back" href="/">Voltar ao site <span aria-hidden="true">↗</span></Link>
    </header>
    <main className="members-main">{children}</main>
    <footer className="members-footer"><span>AYMAR LABS / ÁREA DE MEMBROS</span><span>BRASIL · REMOTO</span></footer>
  </div>;
}
