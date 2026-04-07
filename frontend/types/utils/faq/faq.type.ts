import { FAQ_CATEGORIES } from './faq.categories';

export type HelpFaqCategory = (typeof FAQ_CATEGORIES)[keyof typeof FAQ_CATEGORIES];

export type HelpFaqItem = {
  id: string;
  category: HelpFaqCategory;
  question: string;
  answer: string;
  tags?: string[];
};
