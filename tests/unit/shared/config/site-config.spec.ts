import { describe, expect, it } from 'vitest';
import { parseSiteConfig, SiteConfigError } from '../../../../src/shared/config/site-config';
import { rawConfigFixture } from '../../../fixtures/site-config-fixture';

describe('parseSiteConfig', () => {
  it('parseSiteConfig_withValidConfig_returnsCamelCaseSettings', () => {
    const config = parseSiteConfig(rawConfigFixture());

    expect(config.order.minQuantity).toBe(3);
    expect(config.languages.messageCopy).toBe('vi');
    expect(config.brands[0]).toMatchObject({ id: 'biwa', volumeLiters: 21.5, tap: false, example: true });
  });

  it('parseSiteConfig_withoutSiteUrl_throwsNamingTheField', () => {
    const raw = rawConfigFixture();
    const { url: _url, ...siteWithoutUrl } = raw.site;

    expect(() => parseSiteConfig({ ...raw, site: siteWithoutUrl })).toThrow(/site\.url/);
  });

  it('parseSiteConfig_withMinimumAboveMaximum_throwsConfigError', () => {
    const raw = rawConfigFixture();

    expect(() => parseSiteConfig({ ...raw, order: { ...raw.order, min_quantity: 30 } })).toThrow(SiteConfigError);
  });

  it('parseSiteConfig_withTwoExampleBrands_throws', () => {
    const raw = rawConfigFixture();
    const brands = raw.brands.map((brand) => ({ ...brand, example: true }));

    expect(() => parseSiteConfig({ ...raw, brands })).toThrow(/exactly one brand/);
  });

  it('parseSiteConfig_withLanguageMissingMessengerOrder_throws', () => {
    const raw = rawConfigFixture();
    const { ru: _ru, ...orderWithoutRussian } = raw.messengers.order;

    expect(() => parseSiteConfig({ ...raw, messengers: { ...raw.messengers, order: orderWithoutRussian } })).toThrow(
      /no entry for language "ru"/,
    );
  });

  it('parseSiteConfig_withUnknownTimeZone_throws', () => {
    const raw = rawConfigFixture();

    expect(() => parseSiteConfig({ ...raw, time: { zone: 'Mars/Olympus' } })).toThrow(/not a known time zone/);
  });
});
