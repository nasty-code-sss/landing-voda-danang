import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

  it('loadSettings_withOverlay_appliesOverlayOverContour', () => {
    const overlayFile = writeOverlay('site:\n  url: http://127.0.0.1:9000\n  noindex: false\n');

    const settings = loadSettings(PROJECT_ROOT, 'dev', overlayFile);

    expect(settings.config.site.url).toBe('http://127.0.0.1:9000');
    expect(settings.config.site.noindex).toBe(false);
    expect(settings.config.site.base).toBe('/landing-voda-danang');
  });

  it('loadSettings_withEmptyOverlayPath_readsOnlyBaseAndContour', () => {
    expect(loadSettings(PROJECT_ROOT, 'dev', '').config).toEqual(loadSettings(PROJECT_ROOT, 'dev').config);
  });

  it('loadSettings_withMissingOverlayFile_throwsInsteadOfIgnoringIt', () => {
    expect(() => loadSettings(PROJECT_ROOT, 'dev', join(tmpdir(), 'no-such-overlay.yml'))).toThrow(/no-such-overlay\.yml/);
  });

  it('loadSettings_withInvalidOverlay_reportsFieldFromSchema', () => {
    const overlayFile = writeOverlay('order:\n  min_quantity: 0\n');

    expect(() => loadSettings(PROJECT_ROOT, 'dev', overlayFile)).toThrow(/min_quantity/);
  });
});

function writeOverlay(content: string): string {
  const file = join(mkdtempSync(join(tmpdir(), 'config-overlay-')), 'overlay.yml');
  writeFileSync(file, content);
  return file;
}
