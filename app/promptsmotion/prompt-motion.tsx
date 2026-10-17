'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import styles from './prompt-motion.module.css';

type Entry = {
  id: string;
  title: string;
  kind: 'Prompt' | 'Skill';
  category: string[];
  description: string;
  prompt: string;
  preview: string;
  popularity: number;
};

const categories = ['Product UI', 'Phone', 'Charts', 'Diagrams', 'Kinetic type', 'Shapes', 'Particles', 'Characters', 'Photos', 'Music', 'Code'];

const entries: Entry[] = [
  { id: 'interface-orbit', title: 'Interface em órbita', kind: 'Prompt', category: ['Product UI', 'Shapes'], description: 'Uma interface de produto se monta em camadas ao redor de um núcleo luminoso.', preview: 'orbit', popularity: 98, prompt: 'Crie uma animação de interface de produto em fundo grafite. Um painel central aparece primeiro; cartões menores entram em órbita suave e se encaixam ao redor dele. Use profundidade sutil, luz azul elétrica, sombras limpas e easing natural. Câmera fixa, composição central, sem textos inventados, duração de 6 segundos e loop perfeito.' },
  { id: 'phone-reveal', title: 'Phone reveal', kind: 'Prompt', category: ['Phone', 'Product UI'], description: 'Um mockup de celular gira e revela uma tela de app com transição fluida.', preview: 'phone', popularity: 91, prompt: 'Anime um smartphone minimalista sobre um fundo escuro. O aparelho entra de lado, gira lentamente até ficar de frente e revela uma tela de aplicativo com blocos abstratos em azul e branco. Reflexos discretos no vidro, movimento contínuo e elegante, sem logotipos ou texto legível. Plano fixo, 5 segundos, terminar na pose inicial para loop.' },
  { id: 'data-pulse', title: 'Pulso de dados', kind: 'Prompt', category: ['Charts', 'Particles'], description: 'Barras crescem em sequência enquanto um traço percorre o gráfico.', preview: 'chart', popularity: 87, prompt: 'Crie um motion graphic de dashboard com gráfico de barras. As barras crescem uma a uma, da esquerda para a direita, e uma linha azul percorre os pontos acima delas. Fundo quase preto, grid discreto, tipografia técnica pequena e sem números aleatórios. Câmera ortográfica, animação precisa, duração de 4 segundos, loop suave.' },
  { id: 'flow-map', title: 'Fluxo em movimento', kind: 'Prompt', category: ['Diagrams', 'Particles'], description: 'Nós e conexões desenham um fluxo visual, do início até a conversão.', preview: 'diagram', popularity: 82, prompt: 'Mostre um diagrama de fluxo se desenhando sobre fundo escuro. Três nós circulares surgem em sequência, conectados por linhas finas azuis; um pequeno pulso percorre o caminho até o último nó. Formas simples, alinhamento rigoroso, sem rótulos legíveis, câmera parada. 5 segundos e loop sem salto.' },
  { id: 'type-impact', title: 'Tipo em impacto', kind: 'Prompt', category: ['Kinetic type'], description: 'Uma palavra entra com escala, pausa e deslocamento curto.', preview: 'type', popularity: 94, prompt: 'Anime a palavra “IDEIA” em caixa alta, branca, sobre fundo preto. As letras entram em pequenos grupos com escala e deslocamento vertical, assentam com um impacto controlado e recebem um acento azul que atravessa a composição. Tipografia sans-serif pesada, kerning consistente, sem distorcer caracteres. Duração de 3 segundos.' },
  { id: 'liquid-form', title: 'Forma líquida', kind: 'Prompt', category: ['Shapes'], description: 'Uma forma abstrata se transforma sem perder o ritmo do loop.', preview: 'morph', popularity: 78, prompt: 'Crie uma composição abstrata com uma forma azul de bordas orgânicas no centro de um fundo preto. Ela se expande, dobra e retorna à silhueta original em um movimento contínuo. Acabamento vetorial limpo, sem textura pesada, sem objetos adicionais. Câmera fixa, 6 segundos, loop perfeito.' },
  { id: 'particle-field', title: 'Campo de partículas', kind: 'Prompt', category: ['Particles', 'Music'], description: 'Pontos reagem a um pulso sonoro imaginado e formam uma onda.', preview: 'particles', popularity: 73, prompt: 'Visualize um campo de partículas luminosas reagindo a um pulso sonoro. Pontos brancos e azuis formam ondas que atravessam a tela em camadas, com profundidade e parallax suaves. Fundo preto, brilho moderado, ritmo constante. Não use áudio nem texto. Composição panorâmica, 7 segundos e loop.' },
  { id: 'avatar-turn', title: 'Avatar em cena', kind: 'Prompt', category: ['Characters', 'Photos'], description: 'Retrato editorial com movimento mínimo e luz que percorre o rosto.', preview: 'avatar', popularity: 89, prompt: 'Anime um retrato editorial de uma pessoa fictícia olhando para a câmera. Preserve rosto, roupa e enquadramento; faça apenas uma virada sutil de cabeça, uma piscada natural e uma luz azul suave percorrer o fundo. Aparência realista, sem deformações, sem fala ou texto. Câmera estável, 4 segundos.' },
  { id: 'code-build', title: 'Código se constrói', kind: 'Skill', category: ['Code', 'Product UI'], description: 'Linhas de código surgem e viram uma interface pronta.', preview: 'code', popularity: 75, prompt: 'SKILL — INTERFACE A PARTIR DE CÓDIGO\n\nObjetivo: criar uma animação que transforma linhas abstratas de código em uma interface de produto.\n\nEntrada: conceito do produto, proporção do vídeo, paleta e duração.\n\nProcesso: 1) estabeleça uma janela de código simples; 2) anime a digitação de poucos trechos sem formar texto legível; 3) reorganize as linhas em painel, navegação e cartões; 4) finalize com a interface estável e legível como composição.\n\nDireção: movimento preciso, câmera fixa, acentos azul-cobalto e verde suave. Sem logos, marcas ou caracteres deformados.\n\nEntrega: uma animação curta, limpa e em loop, pronta para receber o conteúdo real do produto.' },
  { id: 'photo-depth', title: 'Foto com profundidade', kind: 'Skill', category: ['Photos', 'Particles'], description: 'Uma fotografia ganha camadas e parallax sem perder o enquadramento.', preview: 'photo', popularity: 69, prompt: 'SKILL — PARALLAX DE FOTOGRAFIA\n\nObjetivo: dar movimento sutil a uma imagem sem alterar sua identidade.\n\nEntrada: fotografia original, ponto focal e intensidade de movimento desejada.\n\nProcesso: 1) identifique primeiro plano, plano médio e fundo; 2) preserve rosto, produto, cenário e proporções; 3) aplique deslocamento de câmera curto e parallax coerente entre as camadas; 4) use partículas ou luz apenas se fizerem sentido na cena.\n\nRestrições: não invente objetos, não mude a aparência das pessoas e não recorte o ponto focal. Movimento lento, estável e sem tremores.\n\nEntrega: clipe curto que mantém a foto reconhecível do primeiro ao último quadro.' },
  { id: 'sound-rings', title: 'Anéis de frequência', kind: 'Prompt', category: ['Music', 'Shapes'], description: 'Anéis concêntricos expandem e contraem como um equalizador.', preview: 'rings', popularity: 71, prompt: 'Crie anéis concêntricos minimalistas que expandem e contraem em diferentes frequências. Linhas finas brancas, dois anéis em azul, fundo escuro e centro vazio. O ritmo deve parecer musical sem usar elementos de player ou marcas. Câmera fixa, 4 segundos, animação cíclica.' },
  { id: 'ui-transition', title: 'Transição de interface', kind: 'Skill', category: ['Product UI', 'Phone'], description: 'Uma tela se reorganiza em outra sem cortes ou saltos.', preview: 'transition', popularity: 84, prompt: 'SKILL — TRANSIÇÕES DE UI\n\nObjetivo: conectar duas telas de produto com uma transformação contínua.\n\nEntrada: imagem da tela inicial, imagem final, duração e elementos que devem permanecer.\n\nProcesso: compare hierarquia e posição dos elementos; mantenha os componentes compartilhados reconhecíveis; mova, redimensione ou revele cada bloco pelo caminho mais curto e compreensível; termine exatamente na tela final fornecida.\n\nRestrições: não invente texto, ícones ou controles. Preserve alinhamento, espaçamentos e identidade visual. Câmera fixa, easing suave e sem cortes.\n\nEntrega: transição curta de interface, clara mesmo sem áudio.' },
];

function Preview({ type }: { type: string }) {
  return <div className={`${styles.art} ${styles[`art_${type}`]}`} aria-hidden="true">
    {type === 'orbit' && <><i /><i /><i /><b>◎</b></>}
    {type === 'phone' && <div className={styles.phone}><i /><b /><span /><span /><span /></div>}
    {type === 'chart' && <><div className={styles.bars}>{[36, 58, 44, 78, 63, 92].map((height, i) => <i key={i} style={{ '--height': `${height}%`, '--i': i } as React.CSSProperties} />)}</div><svg viewBox="0 0 220 100"><path d="M5 78 C35 60 42 65 72 48 S110 54 139 30 S179 38 215 10" /></svg></>}
    {type === 'diagram' && <><i /><i /><i /><b /><b /></>}
    {type === 'type' && <strong>IDEIA</strong>}
    {type === 'morph' && <i />}
    {type === 'particles' && Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}
    {type === 'avatar' && <><div className={styles.avatar}><i /><b /><span /></div><i className={styles.light} /></>}
    {type === 'code' && <div className={styles.code}><i /><i /><i /><i /><b /></div>}
    {type === 'photo' && <><i /><b /><span /></>}
    {type === 'rings' && <><i /><i /><i /><b /></>}
    {type === 'transition' && <div className={styles.window}><i /><i /><i /><b /><span /><span /></div>}
  </div>;
}

export default function PromptMotion() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'Todos' | 'Prompt' | 'Skill'>('Todos');
  const [category, setCategory] = useState('Tudo');
  const [sort, setSort] = useState('Popular');
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState<Entry | null>(null);
  const [copied, setCopied] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    const result = entries.filter((entry) => (kind === 'Todos' || entry.kind === kind)
      && (category === 'Tudo' || entry.category.includes(category))
      && (!term || `${entry.title} ${entry.description} ${entry.category.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term)));
    return result.sort((a, b) => sort === 'A–Z' ? a.title.localeCompare(b.title) : b.popularity - a.popularity);
  }, [category, kind, query, sort]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(''), 1800);
    } catch { setCopied('erro'); }
  }

  return <main className={`${styles.page} ${paused ? styles.paused : ''}`}>
    <header className={styles.header}>
      <BrandLogo size="sm" className={styles.logo} href="/" label="Aymar Labs, página inicial" />
      <span className={styles.headerLabel}>Motion library</span>
      <Link className={styles.back} href="/portfoliodectvs">Portfólio de CTVs ↗</Link>
    </header>

    <section className={styles.hero}>
      <div className={styles.eyebrow}><i /> AYMAR LABS / LABORATÓRIO DE MOTION</div>
      <div className={styles.heroGrid}>
        <h1>Prompts em <em>movimento.</em></h1>
        <p>Referências e prompts para transformar ideias em motion. Explore, ajuste e leve o ponto de partida para a sua próxima criação.</p>
      </div>
      <div className={styles.heroMeta}><span>{String(entries.length).padStart(2, '0')} ESTUDOS</span><span>PROMPTS AUTORAIS · PRONTOS PARA ADAPTAR</span></div>
    </section>

    <section className={styles.library} aria-label="Biblioteca de animações">
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Tipo de conteúdo">{(['Todos', 'Prompt', 'Skill'] as const).map((item) => <button key={item} className={kind === item ? styles.activeTab : ''} onClick={() => setKind(item)}>{item}</button>)}</div>
        <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título ou categoria" aria-label="Buscar prompts" />{query && <button onClick={() => setQuery('')} aria-label="Limpar busca">×</button>}</label>
        <label className={styles.sortLabel}>Ordenar<select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option><option>A–Z</option></select></label>
        <label className={styles.pause}><input type="checkbox" checked={paused} onChange={(event) => setPaused(event.target.checked)} /><span /> Pausar prévias</label>
      </div>

      <div className={styles.categoryRow}><span>CONTÉM</span><div className={styles.categories}><button className={category === 'Tudo' ? styles.categoryActive : ''} onClick={() => setCategory('Tudo')}>Tudo</button>{categories.map((item) => <button key={item} className={category === item ? styles.categoryActive : ''} onClick={() => setCategory(category === item ? 'Tudo' : item)}>{item}</button>)}</div></div>

      <div className={styles.results}><span>{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</span><span>SELEÇÃO AYMAR LABS</span></div>
      <div className={styles.grid}>{filtered.map((entry, index) => <article className={styles.card} key={entry.id}>
        <button className={styles.previewButton} onClick={() => setActive(entry)} aria-label={`Ver prompt: ${entry.title}`}><Preview type={entry.preview} /><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><span className={styles.open}>↗</span></button>
        <div className={styles.cardInfo}><div className={styles.cardTitle}><span>{entry.kind}</span><button onClick={() => void copy(entry.prompt, entry.id)}>{copied === entry.id ? 'Copiado ✓' : 'Copiar prompt ↗'}</button></div><h2>{entry.title}</h2><p>{entry.description}</p><div className={styles.tags}>{entry.category.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      </article>)}</div>
      {!filtered.length && <p className={styles.empty}>Não encontrei nada com esse filtro. Tente outra busca ou categoria.</p>}
    </section>

    <footer className={styles.footer}><span>© {new Date().getFullYear()} Aymar Labs · Experimentos de motion</span><Link href="/">Voltar ao site ↗</Link></footer>

    {active && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="prompt-title"><div className={styles.dialogHead}><div><span>{active.kind} / {active.category.join(' · ')}</span><h2 id="prompt-title">{active.title}</h2></div><button onClick={() => setActive(null)} aria-label="Fechar">×</button></div><div className={styles.dialogPreview}><Preview type={active.preview} /></div><p className={styles.dialogDescription}>{active.description}</p><label className={styles.promptLabel}>PROMPT <textarea readOnly value={active.prompt} /></label><button className={styles.copyButton} onClick={() => void copy(active.prompt, `dialog-${active.id}`)}>{copied === `dialog-${active.id}` ? 'Copiado ✓' : 'Copiar prompt'}</button></section></div>}
  </main>;
}
