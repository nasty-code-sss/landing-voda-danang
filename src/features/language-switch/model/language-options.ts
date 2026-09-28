import type { SiteConfig } from '../../../shared/config/site-config';
import { dictionaryFor, text, type Dictionaries } from '../../../shared/i18n/dictionary';
import { sitePath } from '../../../shared/lib/site-path';

export interface LanguageOption {
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly flag: string;
  readonly pickerTitle: string;
  readonly path: string;
}

function flagOf(config: SiteConfig, code: string): string {
  const flag = config.languages.flags[code];
  if (flag === undefined) {
    throw new Error(`languages.flags has no entry for language "${code}"`);
  }
  return flag;
}

export function languageOptions(config: SiteConfig, dictionaries: Dictionaries): LanguageOption[] {
  return config.languages.supported.map((code) => {
    const dictionary = dictionaryFor(dictionaries, code);
    return {
      code,
      name: text(dictionary, 'language.name'),
      shortName: text(dictionary, 'language.code'),
      flag: flagOf(config, code),
      pickerTitle: text(dictionary, 'picker.title'),
      path: sitePath(config.site.base, code),
    };
  });
}
