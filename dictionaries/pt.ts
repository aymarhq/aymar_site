export type ProjectDictionary = {
  title: string;
  meta: string;
  badge: string;
  category: string;
};

export type Dict = {
  lang: 'pt' | 'en';
  htmlLang: 'pt-BR' | 'en';
  locale: 'pt_BR' | 'en_US';
  language: { switchPt: string; switchEn: string };
  brand: string;
  ui: { languageSelector: string; openMenu: string; closeMenu: string; phone: string; live: string; dataToday: string; revenue: string; automation: string; receivedTime: string; sentTime: string };
  metadata: { title: string; description: string };
  loader: string;
  nav: { studio: string; work: string; process: string; specialist: string; contact: string; cta: string; menu: string };
  hero: { eyebrow: string; title: string; emphasis: string; paragraph: string; cta: string; location: string };
  marquee: { first: string; second: string };
  studio: { eyebrow: string; title: string; emphasis: string; paragraph: string };
  work: { eyebrow: string; editorialBefore: string; editorialLink: string; editorialAfter: string; hover: string; preview: string };
  process: { eyebrow: string; title: string; emphasis: string; items: Array<{ title: string; text: string }> };
  specialist: {
    eyebrow: string; title: string; emphasis: string; paragraph: string;
    stats: Array<{ value: string; label: string }>;
    tabs: Array<{ label: string; text: string }>;
    demo: string; cta: string; note: string;
    chatbot: { customer: string[]; bot: string[] };
    repetitive: { rows: string[]; counter: string };
    dashboard: { currency: string; percent: string };
  };
  contact: { eyebrow: string; title: string; emphasis: string; paragraph: string; instagram: string; pkg: string; brief: string };
  footer: { contact: string; social: string; studio: string; location: string; copy: string };
  whatsapp: string;
  mailSubject: string;
  projects: ProjectDictionary[];
};

export const pt: Dict = {
  lang: 'pt', htmlLang: 'pt-BR', locale: 'pt_BR', language: { switchPt: 'Mudar para português', switchEn: 'Mudar para inglês' }, brand: 'Aymar, início', ui: { languageSelector: 'Seletor de idioma', openMenu: 'Abrir menu', closeMenu: 'Fechar menu', phone: 'operação', live: 'ao vivo', dataToday: 'operação / hoje / dados', revenue: 'receita', automation: 'automação', receivedTime: '15:03', sentTime: '15:04 ✓✓' },
  metadata: { title: 'aymar — tecnologia aplicada', description: 'Software próprio, dados unificados e IA aplicada para operações que precisam avançar.' },
  loader: 'carregando operação',
  nav: { studio: 'studio', work: 'trabalhos', process: 'processo', specialist: 'especialista', contact: 'contato', cta: 'vamos conversar ↗', menu: 'menu' },
  hero: { eyebrow: 'software próprio · dados unificados · ia aplicada', title: 'A operação inteligente', emphasis: 'por trás.', paragraph: 'Construímos o motor que faz o seu negócio rodar. Software feito sob medida, dados que conversam entre si e IA que age no lugar dos passos que ninguém deveria estar fazendo à mão.', cta: 'falar com um especialista ↗', location: 'Brasil — remoto' },
  marquee: { first: 'software próprio ✳ dados unificados ✳ ia aplicada ✳ automação de operação ✳ landing pages ✳ produto sob medida ✳', second: 'a tecnologia chega antes do problema ✳ a tecnologia chega antes do problema ✳' },
  studio: { eyebrow: '01 o studio', title: 'Não fazemos site bonito.', emphasis: 'Fazemos operação.', paragraph: 'A aymar é um studio de tecnologia aplicada. A gente entra onde a planilha, o e-mail e a reunião viraram o produto — e devolve isso em forma de software, dado e IA que trabalha sozinho.' },
  work: { eyebrow: '02 trabalhos', editorialBefore: 'Uma landing page é a porta de entrada — o que fica depois é a operação: o painel, o dado limpo, a automação que roda sem ninguém olhando. Abaixo, uma amostra de páginas entregues em parceria com a ', editorialLink: 'Agência PKG ↗', editorialAfter: '.', hover: 'Passe o mouse para ver ao vivo, clique para abrir.', preview: 'prévia' },
  process: { eyebrow: '03 processo', title: 'Três coisas', emphasis: 'bem feitas.', items: [{ title: 'Software próprio', text: 'Sistemas sob medida — landing pages, dashboards, produtos internos. Sem framework de prateleira, sem plugin que quebra em três meses.' }, { title: 'Dados unificados', text: 'A gente pluga o que você já usa em uma camada única. Um lugar só onde vendas, marketing e operação enxergam a mesma verdade.' }, { title: 'IA aplicada', text: 'Modelos que executam passos reais do seu processo. Não é chatbot no rodapé — é agente que abre chamado, escreve e-mail, atualiza CRM.' }] },
  specialist: { eyebrow: '04 especialista', title: 'Software, IA e automação', emphasis: 'que já rodam.', paragraph: 'Mais de 20 projetos entregues em software sob medida, IA aplicada e automação de operação. Abaixo, três fluxos que construímos — simulação em tempo real, do jeito que roda em produção.', stats: [{ value: '+20', label: 'projetos entregues' }, { value: '03', label: 'frentes — software, ia, automação' }, { value: '02', label: 'dias úteis para resposta' }], tabs: [{ label: '01 CHATBOT WHATSAPP', text: 'Cliente manda mensagem, o bot qualifica, agenda e joga no CRM. Ninguém do time toca.' }, { label: '02 IA REPETITIVA', text: 'A IA lê, classifica e preenche o que antes era copiar e colar. Roda de madrugada.' }, { label: '03 PAINEL DE OPERAÇÃO', text: 'Vendas, operação e financeiro no mesmo painel. Um número, uma fonte de verdade.' }], demo: 'DEMONSTRAÇÃO', cta: 'Falar com um especialista →', note: 'RESPOSTA NO WHATSAPP · SEG A SEX, HORÁRIO COMERCIAL', chatbot: { customer: ['Oi, queria um orçamento', 'Automação', 'Cadastro de pedido, é tudo manual'], bot: ['Claro! É para software sob medida, IA ou automação?', 'Perfeito. Qual processo está travando hoje?', 'Entendi. Agendei com um especialista: quinta, 15h. ✓'] }, repetitive: { rows: ['nota fiscal', 'cadastro cliente', 'conciliação', 'e-mail de cobrança', 'atualiza CRM', 'relatório'], counter: 'REGISTROS PROCESSADOS HOJE' }, dashboard: { currency: 'R$ 184,2 mil', percent: '92%' } },
  contact: { eyebrow: '05 contato', title: 'Tem uma operação', emphasis: 'para arrumar?', paragraph: 'Escreva direto: conte qual processo está travado e o que você já tentou. Uma pessoa de verdade responde em até dois dias úteis.', instagram: 'instagram ↗', pkg: 'parceria pkg ↗', brief: 'enviar briefing ↗' },
  footer: { contact: 'contato', social: 'redes', studio: 'studio', location: 'BRASIL, REMOTO', copy: '© 2026 aymar · a tecnologia chega antes do problema.' },
  whatsapp: 'Oi! Vim pelo site da aymar. Queria falar sobre a operação da minha empresa.', mailSubject: 'Proposta Aymar',
  projects: [{ title: 'Criar SaaS', meta: 'produto digital · captação', badge: 'saas launch', category: 'produto digital · captação' }, { title: 'Dra. Aline', meta: 'saúde · autoridade', badge: 'landing page', category: 'saúde · autoridade' }, { title: 'Copie AI', meta: 'ia · lançamento', badge: 'ai launch', category: 'ia · lançamento' }, { title: 'Jessica', meta: 'infoproduto · conversão', badge: 'landing page', category: 'infoproduto · conversão' }, { title: 'Master Class', meta: 'evento · inscrição', badge: 'event page', category: 'evento · inscrição' }, { title: 'Mentoria Caio Martins', meta: 'mentoria · high ticket', badge: 'sales page', category: 'mentoria · high ticket' }, { title: 'Isaque Mota', meta: 'marca pessoal · conversão', badge: 'landing page', category: 'marca pessoal · conversão' }, { title: 'Primeira Assinatura em 24h', meta: 'produto digital · conversão', badge: 'sales page', category: 'produto digital · conversão' }]
};
