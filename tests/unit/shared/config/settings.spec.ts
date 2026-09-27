import { describe, expect, it } from 'vitest';
import { loadSettings } from '../../../../src/shared/config/settings';

const PROJECT_ROOT = process.cwd();

describe('loadSettings', () => {
  it('loadSettings_forDev_mergesDevUrlOverBaseAndLoadsAllDictionaries', () => {
    const settings = loadSettings(PROJECT_ROOT, 'dev');

    expect(settings.config.site.url).toBe('http://localhost:4321');
    expect(settings.config.site.base).toBe('/landing-voda-danang');
    expect(Object.keys(settings.dictionaries).sort()).toEqual(['en', 'ru', 'vi']);
  });

  it('loadSettings_withoutAppEnv_throwsListingAllowedValues', () => {
    expect(() => loadSettings(PROJECT_ROOT, undefined)).toThrow(/APP_ENV must be one of dev, stage, prod/);
  });

  it('loadSettings_forStageWithoutUrl_failsInsteadOfGuessing', () => {
    expect(() => loadSettings(PROJECT_ROOT, 'stage')).toThrow(/site\.url/);
  });
});
