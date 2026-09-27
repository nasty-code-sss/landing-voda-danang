import { fillTemplate } from './template';

export interface PluralForms {
  readonly one: string;
  readonly few: string;
  readonly many: string;
  readonly other: string;
}

export const PLURAL_CATEGORIES = ['one', 'few', 'many', 'other'] as const;

function isKnownCategory(category: string): category is keyof PluralForms {
  return (PLURAL_CATEGORIES as readonly string[]).includes(category);
}

export function countWithNoun(count: number, language: string, forms: PluralForms): string {
  const category = new Intl.PluralRules(language).select(count);
  const template = isKnownCategory(category) ? forms[category] : forms.other;
  return fillTemplate(template, { count });
}
