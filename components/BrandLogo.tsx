import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = { size?: 'sm' | 'md' | 'lg'; className?: string; label?: string; href?: string };

export default function BrandLogo({ size = 'md', className = '', label = 'Aymar Labs', href = '#top' }: BrandLogoProps) {
  return <Link className={`brand-logo brand-logo-${size} ${className}`.trim()} href={href} aria-label={label}><Image src="/aymar-wordmark.png" alt="Aymar Labs" width={3150} height={863} sizes="(max-width: 720px) 120px, 190px" priority={size !== 'lg'} /></Link>;
}
