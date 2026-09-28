import { describe, expect, it } from 'vitest';
import { languageOptions } from '../../../../../src/features/language-switch/model/language-options';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

describe('languageOptions', () => {
  it('languageOptions_useSelfNamesAndBasePath', () => {
    const options = languageOptions(configFixture(), projectDictionaries());

    expect(options.map(({ code, name, shortName, flag, path }) => ({ code, name, shortName, flag, path }))).toEqual([
      { code: 'en', name: 'English', shortName: 'EN', flag: 'gb', path: '/landing-voda-danang/en/' },
      { code: 'vi', name: 'Tiếng Việt', shortName: 'VI', flag: 'vn', path: '/landing-voda-danang/vi/' },
      { code: 'ru', name: 'Русский', shortName: 'RU', flag: 'ru', path: '/landing-voda-danang/ru/' },
    ]);
  });

  it('languageOptions_withLanguageMissingFlag_throwsNamingTheLanguage', () => {
    const config = configFixture();
    const { ru: _ru, ...flagsWithoutRussian } = config.languages.flags;
    const configWithoutRussianFlag = { ...config, languages: { ...config.languages, flags: flagsWithoutRussian } };

    expect(() => languageOptions(configWithoutRussianFlag, projectDictionaries())).toThrow(/no entry for language "ru"/);
  });
});
