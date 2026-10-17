import type { Metadata } from 'next';
import PromptMotion from './prompt-motion';

export const metadata: Metadata = {
  title: 'Prompts Motion | Aymar Labs',
  description: 'Uma biblioteca de prompts e referências para criar animações com IA.',
};

export default function PromptMotionPage() {
  return <PromptMotion />;
}
