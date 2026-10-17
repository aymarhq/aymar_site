import type { Metadata } from 'next';
import PromptMotion from './prompt-motion';
import { getMotionCatalog } from '../../lib/prompt-motion';

export const metadata: Metadata = {
  title: 'Prompts Motion | Aymar Labs',
  description: 'Animações, prompts e skills do catálogo Prompt Motion na Aymar Labs.',
};

export default async function PromptMotionPage() {
  return <PromptMotion entries={await getMotionCatalog()} />;
}
