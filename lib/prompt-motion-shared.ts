export const MOTION_SOURCE = 'https://prompt-motion.com';

export const motionCategories = [
  ['product-ui', 'Product UI'], ['phone', 'Phone'], ['charts', 'Charts'],
  ['diagrams', 'Diagrams'], ['kinetic-type', 'Kinetic type'], ['shapes', 'Shapes'],
  ['particles', 'Particles'], ['characters', 'Characters'], ['photos', 'Photos'],
  ['music', 'Music'], ['code', 'Code'],
] as const;

export type MotionEntry = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  contentTags: string[];
  promptShared: boolean;
  handle: string;
  avatar: string;
  poster: string;
  preview: string;
  video: string;
  width: number;
  height: number;
};
