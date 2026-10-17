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
  hero: { eyebrow: string; title: string; emphasis: string; paragraph: string; cta: string; pillars: string[]; location: string };
  marquee: { first: string; second: string };
  studio: { eyebrow: string; title: string; emphasis: string; paragraph: string; benefits: Array<{ title: string; text: string }>; avatar: { eyebrow: string; title: string; paragraph: string; cta: string } };
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
  contact: { eyebrow: string; title: string; emphasis: string; paragraph: string; whatsapp: string; response: string; instagram: string };
  footer: { contact: string; social: string; studio: string; location: string; copy: string };
  whatsapp: string;
  projects: ProjectDictionary[];
};

export const pt: Dict = {
  lang: 'pt', htmlLang: 'pt-BR', locale: 'pt_BR', language: { switchPt: 'Mudar para português', switchEn: 'Mudar para inglês' }, brand: 'Aymar Labs, início', ui: { languageSelector: 'Seletor de idioma', openMenu: 'Abrir menu', closeMenu: 'Fechar menu', phone: 'operação', live: 'ao vivo', dataToday: 'operação / hoje / dados', revenue: 'receita', automation: 'automação', receivedTime: '15:03', sentTime: '15:04' },
  metadata: { title: 'Aymar Labs — criativos e avatares de IA para X1', description: 'Copy, criativos e avatares de IA para operações de direct response e X1 low ticket no WhatsApp.' },
  loader: 'carregando oferta',
  nav: { studio: 'vídeos', work: 'sites', process: 'entrega', how: 'como funciona', contact: 'contato', cta: 'vamos conversar', menu: 'menu' },
  hero: { eyebrow: 'aymar labs · X1 low ticket · direct response', title: 'Seu público reconhece', emphasis: 'uma copy genérica.', paragraph: 'Copy, criativos e avatares de IA para operações de X1 low ticket no WhatsApp. A gente encontra o ângulo da oferta e monta as peças para testar no direct response.', cta: 'quero criativos para o X1', pillars: ['copy direct response', 'avatares de IA', 'X1 no WhatsApp'], location: 'Brasil · operação LATAM' },
  marquee: { first: 'copy para X1 ✳ avatares de IA ✳ criativos para direct response ✳ páginas que continuam a conversa ✳', second: 'menos texto pronto ✳ mais mensagem com contexto ✳' },
  studio: { eyebrow: 'por que a mensagem importa', title: 'Texto pronto passa.', emphasis: 'Uma ideia boa fica.', paragraph: 'Trocar algumas palavras de uma resposta da IA não cria uma campanha. A mensagem precisa partir do produto, da pessoa que compra e das objeções que ela realmente tem.', benefits: [{ title: 'Um ângulo seu', text: 'A promessa parte do que sua oferta tem de específico. É daí que nasce uma mensagem que faz sentido.' }, { title: 'Mais caminhos para testar', text: 'Abrimos variações de hook e abordagem para você testar ideias diferentes, sem repetir a mesma abertura.' }, { title: 'Lead com contexto', text: 'O criativo antecipa dúvidas e prepara a conversa antes de a pessoa chegar ao WhatsApp.' }, { title: 'A mesma voz até o fim', text: 'Anúncio, página e atendimento seguem o mesmo argumento. Ninguém sente que mudou de empresa no meio do caminho.' }], avatar: { eyebrow: 'avatares de IA', title: 'Um rosto para a sua oferta. Sem depender de gravação a cada teste.', paragraph: 'Criamos avatares realistas e humanizados para vídeos de direct response. Roteiro, voz, visual e edição pensados para conduzir o lead até a conversa no WhatsApp.', cta: 'quero um avatar para minha oferta' } },
  work: { eyebrow: 'páginas e ofertas com a PKG', editorialBefore: 'O clique não encerra a história. Estas páginas continuam o argumento iniciado no anúncio, em projetos feitos com a ', editorialLink: 'Agência PKG', editorialAfter: '.', hover: 'Deslize para ver os projetos e toque para abrir.', preview: 'abrir projeto' },
  process: { eyebrow: 'o que entra na sua campanha', title: 'Da ideia ao criativo.', emphasis: 'Sem copiar e colar.', items: [{ title: 'Pesquisa e ângulo', text: 'Entendemos o produto, o público, as objeções e as provas antes de escrever a primeira linha.' }, { title: 'Copy e roteiro', text: 'Headlines, hooks e roteiros com uma voz que combina com a oferta e com quem vai comprar.' }, { title: 'Criativos e avatar de IA', text: 'Vídeos 9:16, UGC e avatares de IA com aberturas diferentes para testar no direct response.' }, { title: 'Página e conversa', text: 'A página e o WhatsApp continuam a mensagem do anúncio, sem quebrar a expectativa de quem clicou.' }] },
  how: { eyebrow: 'como funciona', title: 'Do caos operacional', emphasis: 'até rodar sozinho.', paragraph: 'Você não precisa saber o que quer construir. Precisa saber o que está travando. A gente traduz isso em sistema — e some do caminho quando ele começa a rodar.', beforeLabel: 'ANTES', beforeTitle: 'A operação mora em sete lugares.', before: [{ tool: 'excel', text: 'Planilha que três pessoas editam ao mesmo tempo' }, { tool: 'whatsapp', text: 'Pedido que chega no WhatsApp e se perde' }, { tool: 'gmail', text: 'Aprovação enterrada em e-mail' }, { tool: 'trello', text: 'Card que ninguém move há duas semanas' }, { tool: 'sheets', text: 'Relatório montado à mão toda segunda' }], afterLabel: 'DEPOIS', afterTitle: 'Uma operação, uma fonte de verdade.', after: ['Um painel onde o número é o mesmo para todo mundo', 'Pedido entra pelo WhatsApp e cai direto no sistema', 'Aprovação com um toque, registrada e rastreável', 'Relatório que se monta sozinho, toda segunda, 7h'], disclaimer: 'MARCAS CITADAS PERTENCEM AOS SEUS RESPECTIVOS PROPRIETÁRIOS.', steps: [{ number: '01', title: 'Diagnóstico', timeframe: '1 a 3 dias', text: 'Uma call e acesso de leitura ao que você já usa. A gente mapeia onde o tempo vaza e quanto custa cada hora manual — antes de propor qualquer coisa.', deliverable: 'mapa do processo atual e o cálculo do desperdício.' }, { number: '02', title: 'Desenho da solução', timeframe: '3 a 5 dias', text: 'Definimos o que é software, o que é automação e o que é IA. Escopo fechado, preço fechado, prazo fechado. Sem hora extra surpresa.', deliverable: 'escopo, protótipo navegável e proposta com preço fixo.' }, { number: '03', title: 'Construção', timeframe: '2 a 6 semanas', text: 'Entregas semanais que você já usa. Nada de desaparecer dois meses e voltar com um sistema que não é o que você pediu.', deliverable: 'acesso desde a primeira semana e ajuste a cada entrega.' }, { number: '04', title: 'Rodando sozinho', timeframe: 'contínuo', text: 'Treinamos seu time, documentamos e monitoramos. O sistema é seu — o código, os dados e o acesso. Sem refém de fornecedor.', deliverable: 'código, documentação e suporte no primeiro mês incluso.' }], closing: 'Se em duas semanas você não estiver usando algo, a gente errou o diagnóstico — e refaz.', cta: 'começar pelo diagnóstico' },
  specialist: { eyebrow: 'especialista', title: 'Software, IA e automação', emphasis: 'que já rodam.', paragraph: 'Mais de 20 projetos entregues em software sob medida, IA aplicada e automação de operação. Abaixo, três fluxos que construímos — simulação em tempo real, do jeito que roda em produção.', stats: [{ value: '+20', label: 'projetos entregues' }, { value: '03', label: 'frentes — software, ia, automação' }, { value: '02', label: 'dias úteis para resposta' }], tabs: [{ label: '01 CHATBOT WHATSAPP', text: 'Cliente manda mensagem, o bot qualifica, agenda e joga no CRM. Ninguém do time toca.' }, { label: '02 IA REPETITIVA', text: 'A IA lê, classifica e preenche o que antes era copiar e colar. Roda de madrugada.' }, { label: '03 PAINEL DE OPERAÇÃO', text: 'Vendas, operação e financeiro no mesmo painel. Um número, uma fonte de verdade.' }], demo: 'DEMONSTRAÇÃO', cta: 'Falar com um especialista', note: 'RESPOSTA EM ATÉ 2 DIAS ÚTEIS', chatbot: { customer: ['Oi, queria um orçamento', 'Automação', 'Cadastro de pedido, é tudo manual'], bot: ['Claro! É para software sob medida, IA ou automação?', 'Perfeito. Qual processo está travando hoje?', 'Entendi. Agendei com um especialista: quinta, 15h.'], flow: ['Mensagem recebida', 'Intenção classificada pela IA', 'Agenda consultada', 'Registro criado no CRM'] }, repetitive: { rows: ['nota fiscal', 'cadastro cliente', 'conciliação', 'e-mail de cobrança', 'atualiza CRM', 'relatório'], counter: 'REGISTROS PROCESSADOS HOJE' }, dashboard: { currency: 'R$ 184,2 mil', percent: '92%' } },
  contact: { eyebrow: 'próximo passo', title: 'Sua oferta tem história.', emphasis: 'Vamos achar o ângulo?', paragraph: 'Conte o que você vende e mostre o que já está rodando no X1. A gente conversa sobre copy, criativos, avatar de IA e a próxima peça que está faltando.', whatsapp: 'quero conversar sobre minha oferta', response: 'RESPOSTA EM ATÉ 2 DIAS ÚTEIS', instagram: 'instagram' },
  footer: { contact: 'contato', social: 'redes', studio: 'Aymar Labs', location: 'BRASIL, REMOTO', copy: '© 2026 Aymar Labs · direct response e X1 low ticket no WhatsApp.' },
  whatsapp: 'Oi! Vim pelo site da Aymar Labs. Minha operação é de X1 low ticket no WhatsApp e quero conversar sobre copy, criativos e avatares de IA.',
  projects: [{ title: 'Criar SaaS', meta: 'produto digital · captação', badge: 'saas launch', category: 'produto digital · captação' }, { title: 'Dra. Aline Azevedo – Odontologia', meta: 'odontologia · autoridade', badge: 'landing page', category: 'odontologia · autoridade' }, { title: 'Copie AI', meta: 'ia · lançamento', badge: 'ai launch', category: 'ia · lançamento' }, { title: 'Jessica Moraes – O Mapa', meta: 'infoproduto · conversão', badge: 'landing page', category: 'infoproduto · conversão' }, { title: 'Master Class', meta: 'evento · inscrição', badge: 'event page', category: 'evento · inscrição' }, { title: 'Mentoria Caio Martins', meta: 'mentoria · high ticket', badge: 'sales page', category: 'mentoria · high ticket' }, { title: 'Isaque Mota', meta: 'marca pessoal · conversão', badge: 'landing page', category: 'marca pessoal · conversão' }, { title: 'Primeira Assinatura em 24h', meta: 'produto digital · conversão', badge: 'sales page', category: 'produto digital · conversão' }]
};
