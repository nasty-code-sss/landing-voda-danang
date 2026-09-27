import { z } from 'zod';
import { PLACEHOLDER } from './template';

export type Dictionary = Readonly<Record<string, string>>;
export type Dictionaries = Readonly<Record<string, Dictionary>>;

const dictionarySchema = z.record(z.string().min(1), z.string().min(1));

export class DictionaryError extends Error {
  override readonly name = 'DictionaryError';
}

export function parseDictionary(language: string, raw: unknown): Dictionary {
  const parsed = dictionarySchema.safeParse(raw);
  if (!parsed.success) {
    throw new DictionaryError(`Dictionary "${language}" is invalid:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

function placeholdersOf(template: string): string {
  return [...template.matchAll(PLACEHOLDER)]
    .map((match) => match[1])
    .sort()
    .join(',');
}

export function findDictionaryProblems(dictionaries: Dictionaries): string[] {
  const languages = Object.keys(dictionaries);
  const allKeys = new Set<string>();
  for (const dictionary of Object.values(dictionaries)) {
    Object.keys(dictionary).forEach((key) => allKeys.add(key));
  }

  const problems: string[] = [];
  for (const key of [...allKeys].sort()) {
    const missingIn = languages.filter((language) => dictionaries[language]?.[key] === undefined);
    if (missingIn.length > 0) {
      problems.push(`"${key}" is missing in ${missingIn.join(', ')}`);
      continue;
    }
    const placeholderSets = new Set(languages.map((language) => placeholdersOf(dictionaries[language]?.[key] ?? '')));
    if (placeholderSets.size > 1) {
      problems.push(`"${key}" has different placeholders across languages`);
    }
  }
  return problems;
}

export function assertDictionariesComplete(dictionaries: Dictionaries): void {
  const problems = findDictionaryProblems(dictionaries);
  if (problems.length > 0) {
    throw new DictionaryError(`Dictionaries are incomplete:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  }
}

export function dictionaryFor(dictionaries: Dictionaries, language: string): Dictionary {
  const dictionary = dictionaries[language];
  if (dictionary === undefined) {
    throw new DictionaryError(`No dictionary for language "${language}"`);
  }
  return dictionary;
}

export function text(dictionary: Dictionary, key: string): string {
  const value = dictionary[key];
  if (value === undefined) {
    throw new DictionaryError(`Dictionary has no key "${key}"`);
  }
  return value;
}

export type Translate = (key: string) => string;

export function translator(dictionaries: Dictionaries, language: string): Translate {
  const dictionary = dictionaryFor(dictionaries, language);
  return (key) => text(dictionary, key);
}

export function numberedTexts(dictionary: Dictionary, prefix: string): string[] {
  const texts: string[] = [];
  for (let number = 1; dictionary[`${prefix}.${number}`] !== undefined; number += 1) {
    texts.push(text(dictionary, `${prefix}.${number}`));
  }
  return texts;
}
