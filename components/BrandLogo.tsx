import Image from 'next/image';

type BrandLogoProps = { size?: 'sm' | 'md' | 'lg'; className?: string };

export default function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  return <a className={`brand-logo brand-logo-${size} ${className}`.trim()} href="#top" aria-label="Aymar, início"><Image src="/brand/aymar-wordmark-white.png" alt="Aymar" width={3150} height={863} sizes="(max-width: 720px) 120px, 190px" priority={size !== 'lg'} /><span aria-hidden="true" /></a>;
}
