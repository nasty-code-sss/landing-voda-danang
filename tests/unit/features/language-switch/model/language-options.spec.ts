import { describe, expect, it } from 'vitest';
import { languageOptions } from '../../../../../src/features/language-switch/model/language-options';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

describe('languageOptions', () => {
  it('languageOptions_useSelfNamesAndBasePath', () => {
    const options = languageOptions(configFixture(), projectDictionaries());

    expect(options.map(({ code, name, shortName, path }) => ({ code, name, shortName, path }))).toEqual([
      { code: 'en', name: 'English', shortName: 'EN', path: '/landing-voda-danang/en/' },
      { code: 'vi', name: 'Tiếng Việt', shortName: 'VI', path: '/landing-voda-danang/vi/' },
      { code: 'ru', name: 'Русский', shortName: 'RU', path: '/landing-voda-danang/ru/' },
    ]);
  });
});
