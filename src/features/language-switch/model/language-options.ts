import type { SiteConfig } from '../../../shared/config/site-config';
import { dictionaryFor, text, type Dictionaries } from '../../../shared/i18n/dictionary';
import { sitePath } from '../../../shared/lib/site-path';

export interface LanguageOption {
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly pickerTitle: string;
  readonly path: string;
}

export function languageOptions(config: SiteConfig, dictionaries: Dictionaries): LanguageOption[] {
  return config.languages.supported.map((code) => {
    const dictionary = dictionaryFor(dictionaries, code);
    return {
      code,
      name: text(dictionary, 'language.name'),
      shortName: text(dictionary, 'language.code'),
      pickerTitle: text(dictionary, 'picker.title'),
      path: sitePath(config.site.base, code),
    };
  });
}
