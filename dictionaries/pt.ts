export type ProjectDictionary = {
  title: string;
  meta: string;
  badge: string;
  category: string;
};

export type HowStep = { number: string; title: string; timeframe: string; text: string; deliverable: string };
export type HowDictionary = {
  eyebrow: string; title: string; emphasis: string; paragraph: string;
  beforeLabel: string; beforeTitle: string; before: Array<{ tool: string; text: string }>;
  afterLabel: string; afterTitle: string; after: string[]; disclaimer: string;
  steps: HowStep[]; closing: string; cta: string;
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
  nav: { studio: string; work: string; process: string; how: string; specialist: string; contact: string; cta: string; menu: string };
  hero: { eyebrow: string; title: string; emphasis: string; paragraph: string; cta: string; location: string };
  marquee: { first: string; second: string };
  studio: { eyebrow: string; title: string; emphasis: string; paragraph: string };
  work: { eyebrow: string; editorialBefore: string; editorialLink: string; editorialAfter: string; hover: string; preview: string };
  process: { eyebrow: string; title: string; emphasis: string; items: Array<{ title: string; text: string }> };
  how: HowDictionary;
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
  metadata: { title: 'Aymar — tecnologia aplicada', description: 'Software próprio, dados unificados e IA aplicada para operações que precisam avançar.' },
  loader: 'carregando operação',
  nav: { studio: 'studio', work: 'trabalhos', process: 'processo', how: 'como funciona', specialist: 'especialista', contact: 'contato', cta: 'vamos conversar ↗', menu: 'menu' },
  hero: { eyebrow: 'software próprio · dados unificados · ia aplicada', title: 'A operação inteligente', emphasis: 'por trás do seu negócio.', paragraph: 'Construímos o motor que faz o seu negócio rodar. Software feito sob medida, dados que conversam entre si e IA que age no lugar dos passos que ninguém deveria estar fazendo à mão.', cta: 'falar com um especialista ↗', location: 'Brasil — remoto' },
  marquee: { first: 'software próprio ✳ dados unificados ✳ ia aplicada ✳ automação de operação ✳ landing pages ✳ produto sob medida ✳', second: 'a tecnologia chega antes do problema ✳ a tecnologia chega antes do problema ✳' },
  studio: { eyebrow: '01 o studio', title: 'Não fazemos site bonito.', emphasis: 'Fazemos operação.', paragraph: 'A Aymar é um studio de tecnologia aplicada. A gente entra onde a planilha, o e-mail e a reunião viraram o produto — e devolve isso em forma de software, dado e IA que trabalha sozinho.' },
  work: { eyebrow: '02 trabalhos', editorialBefore: 'Uma landing page é a porta de entrada — o que fica depois é a operação: o painel, o dado limpo, a automação que roda sem ninguém olhando. Abaixo, uma amostra de páginas entregues em parceria com a ', editorialLink: 'Agência PKG ↗', editorialAfter: '.', hover: 'Passe o mouse para ver ao vivo, clique para abrir.', preview: 'prévia' },
  process: { eyebrow: '03 processo', title: 'Três coisas', emphasis: 'bem feitas.', items: [{ title: 'Software próprio', text: 'Sistemas sob medida — landing pages, dashboards, produtos internos. Sem framework de prateleira, sem plugin que quebra em três meses.' }, { title: 'Dados unificados', text: 'A gente pluga o que você já usa em uma camada única. Um lugar só onde vendas, marketing e operação enxergam a mesma verdade.' }, { title: 'IA aplicada', text: 'Modelos que executam passos reais do seu processo. Não é chatbot no rodapé — é agente que abre chamado, escreve e-mail, atualiza CRM.' }] },
  how: { eyebrow: '04 como funciona', title: 'Do caos operacional', emphasis: 'até rodar sozinho.', paragraph: 'Você não precisa saber o que quer construir. Precisa saber o que está travando. A gente traduz isso em sistema — e some do caminho quando ele começa a rodar.', beforeLabel: 'ANTES', beforeTitle: 'A operação mora em sete lugares.', before: [{ tool: 'excel', text: 'Planilha que três pessoas editam ao mesmo tempo' }, { tool: 'whatsapp', text: 'Pedido que chega no WhatsApp e se perde' }, { tool: 'gmail', text: 'Aprovação enterrada em e-mail' }, { tool: 'trello', text: 'Card que ninguém move há duas semanas' }, { tool: 'sheets', text: 'Relatório montado à mão toda segunda' }], afterLabel: 'DEPOIS', afterTitle: 'Uma operação, uma fonte de verdade.', after: ['Um painel onde o número é o mesmo para todo mundo', 'Pedido entra pelo WhatsApp e cai direto no sistema', 'Aprovação com um toque, registrada e rastreável', 'Relatório que se monta sozinho, toda segunda, 7h'], disclaimer: 'MARCAS CITADAS PERTENCEM AOS SEUS RESPECTIVOS PROPRIETÁRIOS.', steps: [{ number: '01', title: 'Diagnóstico', timeframe: '1 a 3 dias', text: 'Uma call e acesso de leitura ao que você já usa. A gente mapeia onde o tempo vaza e quanto custa cada hora manual — antes de propor qualquer coisa.', deliverable: 'mapa do processo atual e o cálculo do desperdício.' }, { number: '02', title: 'Desenho da solução', timeframe: '3 a 5 dias', text: 'Definimos o que é software, o que é automação e o que é IA. Escopo fechado, preço fechado, prazo fechado. Sem hora extra surpresa.', deliverable: 'escopo, protótipo navegável e proposta com preço fixo.' }, { number: '03', title: 'Construção', timeframe: '2 a 6 semanas', text: 'Entregas semanais que você já usa. Nada de desaparecer dois meses e voltar com um sistema que não é o que você pediu.', deliverable: 'acesso desde a primeira semana e ajuste a cada entrega.' }, { number: '04', title: 'Rodando sozinho', timeframe: 'contínuo', text: 'Treinamos seu time, documentamos e monitoramos. O sistema é seu — o código, os dados e o acesso. Sem refém de fornecedor.', deliverable: 'código, documentação e suporte no primeiro mês incluso.' }], closing: 'Se em duas semanas você não estiver usando algo, a gente errou o diagnóstico — e refaz.', cta: 'começar pelo diagnóstico ↗' },
  specialist: { eyebrow: '05 especialista', title: 'Software, IA e automação', emphasis: 'que já rodam.', paragraph: 'Mais de 20 projetos entregues em software sob medida, IA aplicada e automação de operação. Abaixo, três fluxos que construímos — simulação em tempo real, do jeito que roda em produção.', stats: [{ value: '+20', label: 'projetos entregues' }, { value: '03', label: 'frentes — software, ia, automação' }, { value: '02', label: 'dias úteis para resposta' }], tabs: [{ label: '01 CHATBOT WHATSAPP', text: 'Cliente manda mensagem, o bot qualifica, agenda e joga no CRM. Ninguém do time toca.' }, { label: '02 IA REPETITIVA', text: 'A IA lê, classifica e preenche o que antes era copiar e colar. Roda de madrugada.' }, { label: '03 PAINEL DE OPERAÇÃO', text: 'Vendas, operação e financeiro no mesmo painel. Um número, uma fonte de verdade.' }], demo: 'DEMONSTRAÇÃO', cta: 'Falar com um especialista →', note: 'RESPOSTA NO WHATSAPP · SEG A SEX, HORÁRIO COMERCIAL', chatbot: { customer: ['Oi, queria um orçamento', 'Automação', 'Cadastro de pedido, é tudo manual'], bot: ['Claro! É para software sob medida, IA ou automação?', 'Perfeito. Qual processo está travando hoje?', 'Entendi. Agendei com um especialista: quinta, 15h. ✓'] }, repetitive: { rows: ['nota fiscal', 'cadastro cliente', 'conciliação', 'e-mail de cobrança', 'atualiza CRM', 'relatório'], counter: 'REGISTROS PROCESSADOS HOJE' }, dashboard: { currency: 'R$ 184,2 mil', percent: '92%' } },
  contact: { eyebrow: '06 contato', title: 'Tem uma operação', emphasis: 'para arrumar?', paragraph: 'Escreva direto: conte qual processo está travado e o que você já tentou. Uma pessoa de verdade responde em até dois dias úteis.', instagram: 'instagram ↗', pkg: 'parceria pkg ↗', brief: 'enviar briefing ↗' },
  footer: { contact: 'contato', social: 'redes', studio: 'studio', location: 'BRASIL, REMOTO', copy: '© 2026 Aymar · a tecnologia chega antes do problema.' },
  whatsapp: 'Oi! Vim pelo site da Aymar. Queria falar sobre a operação da minha empresa.', mailSubject: 'Proposta Aymar',
  projects: [{ title: 'Criar SaaS', meta: 'produto digital · captação', badge: 'saas launch', category: 'produto digital · captação' }, { title: 'Dra. Aline Azevedo – Odontologia', meta: 'odontologia · autoridade', badge: 'landing page', category: 'odontologia · autoridade' }, { title: 'Copie AI', meta: 'ia · lançamento', badge: 'ai launch', category: 'ia · lançamento' }, { title: 'Jessica Moraes – O Mapa', meta: 'infoproduto · conversão', badge: 'landing page', category: 'infoproduto · conversão' }, { title: 'Master Class', meta: 'evento · inscrição', badge: 'event page', category: 'evento · inscrição' }, { title: 'Mentoria Caio Martins', meta: 'mentoria · high ticket', badge: 'sales page', category: 'mentoria · high ticket' }, { title: 'Isaque Mota', meta: 'marca pessoal · conversão', badge: 'landing page', category: 'marca pessoal · conversão' }, { title: 'Primeira Assinatura em 24h', meta: 'produto digital · conversão', badge: 'sales page', category: 'produto digital · conversão' }]
};
