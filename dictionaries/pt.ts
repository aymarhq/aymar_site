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
  nav: { studio: string; work: string; process: string; how: string; contact: string; cta: string; menu: string };
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
    chatbot: { customer: string[]; bot: string[]; flow: string[] };
    repetitive: { rows: string[]; counter: string };
    dashboard: { currency: string; percent: string };
  };
  contact: { eyebrow: string; title: string; emphasis: string; paragraph: string; whatsapp: string; orLabel: string; response: string; instagram: string; pkg: string; brief: string };
  footer: { contact: string; social: string; studio: string; location: string; copy: string };
  whatsapp: string;
  mailSubject: string;
  projects: ProjectDictionary[];
};

export const pt: Dict = {
  lang: 'pt', htmlLang: 'pt-BR', locale: 'pt_BR', language: { switchPt: 'Mudar para português', switchEn: 'Mudar para inglês' }, brand: 'Aymar Labs, início', ui: { languageSelector: 'Seletor de idioma', openMenu: 'Abrir menu', closeMenu: 'Fechar menu', phone: 'operação', live: 'ao vivo', dataToday: 'operação / hoje / dados', revenue: 'receita', automation: 'automação', receivedTime: '15:03', sentTime: '15:04' },
  metadata: { title: 'Aymar Labs — criativos e ofertas que vendem', description: 'A operação criativa por trás de ofertas que vendem no WhatsApp.' },
  loader: 'carregando oferta',
  nav: { studio: 'vídeos', work: 'sites', process: 'entrega', how: 'como funciona', contact: 'contato', cta: 'vamos conversar', menu: 'menu' },
  hero: { eyebrow: 'aymar labs · operação criativa para ofertas low ticket', title: 'Sua oferta no ar.', emphasis: 'Do criativo à venda.', paragraph: 'A Aymar Labs cria os vídeos, a copy, as páginas, os e-books e os fluxos que sua oferta precisa para sair do papel, gerar conversa e vender no 1:1.', cta: 'quero colocar minha oferta no ar', location: 'Brasil · operação LATAM' },
  marquee: { first: 'criativos que param o scroll ✳ copy que conduz à compra ✳ ofertas low ticket ✳ páginas e e-books ✳ fluxos de WhatsApp ✳', second: 'da atenção à conversa ✳ da conversa à venda ✳' },
  studio: { eyebrow: '01 o que eu faço', title: 'Não entrego só um vídeo.', emphasis: 'Monto o caminho da venda.', paragraph: 'A Aymar junta estratégia, copy e criação para transformar uma ideia em uma oferta pronta para vender. Do hook do anúncio ao fluxo de chatbot no WhatsApp, cada peça trabalha para a próxima.' },
  work: { eyebrow: '02 páginas e ofertas com a PKG', editorialBefore: 'Páginas de vendas, campanhas e ofertas feitas para apresentar melhor o produto e aumentar a intenção de compra, em parceria com a ', editorialLink: 'Agência PKG', editorialAfter: '.', hover: 'Deslize para ver os projetos e toque para abrir.', preview: 'abrir projeto' },
  process: { eyebrow: '03 o que sua oferta recebe', title: 'Tudo em um só time.', emphasis: 'Do anúncio à venda.', items: [{ title: 'Copy e roteiro', text: 'Hooks, argumentos, headlines e roteiros pensados para prender atenção, gerar desejo e conduzir à ação.' }, { title: 'Criativos em vídeo', text: 'Reels e variações em 9:16 para Facebook e Instagram, com ângulos diferentes para testar e escalar.' }, { title: 'Página, e-book e WhatsApp', text: 'Página de vendas, entregáveis e fluxo de chatbot conectados para transformar tráfego em conversa e venda.' }] },
  how: { eyebrow: '04 como funciona', title: 'Do caos operacional', emphasis: 'até rodar sozinho.', paragraph: 'Você não precisa saber o que quer construir. Precisa saber o que está travando. A gente traduz isso em sistema — e some do caminho quando ele começa a rodar.', beforeLabel: 'ANTES', beforeTitle: 'A operação mora em sete lugares.', before: [{ tool: 'excel', text: 'Planilha que três pessoas editam ao mesmo tempo' }, { tool: 'whatsapp', text: 'Pedido que chega no WhatsApp e se perde' }, { tool: 'gmail', text: 'Aprovação enterrada em e-mail' }, { tool: 'trello', text: 'Card que ninguém move há duas semanas' }, { tool: 'sheets', text: 'Relatório montado à mão toda segunda' }], afterLabel: 'DEPOIS', afterTitle: 'Uma operação, uma fonte de verdade.', after: ['Um painel onde o número é o mesmo para todo mundo', 'Pedido entra pelo WhatsApp e cai direto no sistema', 'Aprovação com um toque, registrada e rastreável', 'Relatório que se monta sozinho, toda segunda, 7h'], disclaimer: 'MARCAS CITADAS PERTENCEM AOS SEUS RESPECTIVOS PROPRIETÁRIOS.', steps: [{ number: '01', title: 'Diagnóstico', timeframe: '1 a 3 dias', text: 'Uma call e acesso de leitura ao que você já usa. A gente mapeia onde o tempo vaza e quanto custa cada hora manual — antes de propor qualquer coisa.', deliverable: 'mapa do processo atual e o cálculo do desperdício.' }, { number: '02', title: 'Desenho da solução', timeframe: '3 a 5 dias', text: 'Definimos o que é software, o que é automação e o que é IA. Escopo fechado, preço fechado, prazo fechado. Sem hora extra surpresa.', deliverable: 'escopo, protótipo navegável e proposta com preço fixo.' }, { number: '03', title: 'Construção', timeframe: '2 a 6 semanas', text: 'Entregas semanais que você já usa. Nada de desaparecer dois meses e voltar com um sistema que não é o que você pediu.', deliverable: 'acesso desde a primeira semana e ajuste a cada entrega.' }, { number: '04', title: 'Rodando sozinho', timeframe: 'contínuo', text: 'Treinamos seu time, documentamos e monitoramos. O sistema é seu — o código, os dados e o acesso. Sem refém de fornecedor.', deliverable: 'código, documentação e suporte no primeiro mês incluso.' }], closing: 'Se em duas semanas você não estiver usando algo, a gente errou o diagnóstico — e refaz.', cta: 'começar pelo diagnóstico' },
  specialist: { eyebrow: '05 especialista', title: 'Software, IA e automação', emphasis: 'que já rodam.', paragraph: 'Mais de 20 projetos entregues em software sob medida, IA aplicada e automação de operação. Abaixo, três fluxos que construímos — simulação em tempo real, do jeito que roda em produção.', stats: [{ value: '+20', label: 'projetos entregues' }, { value: '03', label: 'frentes — software, ia, automação' }, { value: '02', label: 'dias úteis para resposta' }], tabs: [{ label: '01 CHATBOT WHATSAPP', text: 'Cliente manda mensagem, o bot qualifica, agenda e joga no CRM. Ninguém do time toca.' }, { label: '02 IA REPETITIVA', text: 'A IA lê, classifica e preenche o que antes era copiar e colar. Roda de madrugada.' }, { label: '03 PAINEL DE OPERAÇÃO', text: 'Vendas, operação e financeiro no mesmo painel. Um número, uma fonte de verdade.' }], demo: 'DEMONSTRAÇÃO', cta: 'Falar com um especialista', note: 'RESPOSTA EM ATÉ 2 DIAS ÚTEIS', chatbot: { customer: ['Oi, queria um orçamento', 'Automação', 'Cadastro de pedido, é tudo manual'], bot: ['Claro! É para software sob medida, IA ou automação?', 'Perfeito. Qual processo está travando hoje?', 'Entendi. Agendei com um especialista: quinta, 15h.'], flow: ['Mensagem recebida', 'Intenção classificada pela IA', 'Agenda consultada', 'Registro criado no CRM'] }, repetitive: { rows: ['nota fiscal', 'cadastro cliente', 'conciliação', 'e-mail de cobrança', 'atualiza CRM', 'relatório'], counter: 'REGISTROS PROCESSADOS HOJE' }, dashboard: { currency: 'R$ 184,2 mil', percent: '92%' } },
  contact: { eyebrow: '06 próximo passo', title: 'Sua oferta já existe.', emphasis: 'Agora falta colocar para vender.', paragraph: 'Conte o que você vende, para quem e quando quer começar. O time Aymar Labs organiza o caminho completo até o WhatsApp.', whatsapp: 'quero falar com o time', orLabel: 'OU', response: 'RESPOSTA EM ATÉ 2 DIAS ÚTEIS', instagram: 'instagram', pkg: 'parceria pkg', brief: 'enviar briefing' },
  footer: { contact: 'contato', social: 'redes', studio: 'Aymar Labs', location: 'BRASIL, REMOTO', copy: '© 2026 Aymar Labs · um time para transformar atenção em venda.' },
  whatsapp: 'Oi! Vim pelo site da Aymar Labs. Quero falar sobre uma oferta, criativos e vendas no WhatsApp.', mailSubject: 'Quero montar minha oferta — Aymar Labs',
  projects: [{ title: 'Criar SaaS', meta: 'produto digital · captação', badge: 'saas launch', category: 'produto digital · captação' }, { title: 'Dra. Aline Azevedo – Odontologia', meta: 'odontologia · autoridade', badge: 'landing page', category: 'odontologia · autoridade' }, { title: 'Copie AI', meta: 'ia · lançamento', badge: 'ai launch', category: 'ia · lançamento' }, { title: 'Jessica Moraes – O Mapa', meta: 'infoproduto · conversão', badge: 'landing page', category: 'infoproduto · conversão' }, { title: 'Master Class', meta: 'evento · inscrição', badge: 'event page', category: 'evento · inscrição' }, { title: 'Mentoria Caio Martins', meta: 'mentoria · high ticket', badge: 'sales page', category: 'mentoria · high ticket' }, { title: 'Isaque Mota', meta: 'marca pessoal · conversão', badge: 'landing page', category: 'marca pessoal · conversão' }, { title: 'Primeira Assinatura em 24h', meta: 'produto digital · conversão', badge: 'sales page', category: 'produto digital · conversão' }]
};
