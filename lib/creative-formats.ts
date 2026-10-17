export type FormatExample = {
  id: string;
  name: string;
  type: 'video' | 'image';
  supabasePath?: string;
};

export type CreativeFormat = {
  number: number;
  title: string;
  description: string;
  examplesUrl: string;
  sourceCard: string;
  examples: FormatExample[];
};

export type FormatsCatalog = {
  source: string;
  formats: CreativeFormat[];
  bonuses: { number: string; title: string; image: string; url: string }[];
  supportUrl: string;
  groupUrl: string;
};
