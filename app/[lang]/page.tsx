import Site from '../../components/Site';
import { en } from '../../dictionaries/en';
import { pt } from '../../dictionaries/pt';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <Site dict={lang === 'en' ? en : pt} />;
}
