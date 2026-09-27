import { describe, expect, it } from 'vitest';
import { depositExample } from '../../../../../src/entities/order/model/deposit-example';
import { brandsFromConfig } from '../../../../../src/features/order-builder/model/builder-data';
import { configFixture, rawConfigFixture } from '../../../../fixtures/site-config-fixture';
import { parseSiteConfig } from '../../../../../src/shared/config/site-config';

const limits = { minimum: 3, maximum: 20 };

describe('depositExample', () => {
  it('depositExample_forExampleBrandAtMinimum_matchesFieldNotes', () => {
    const example = depositExample(brandsFromConfig(configFixture()), limits);

    expect(example.brand.id).toBe('biwa');
    expect(example.quantity).toBe(3);
    expect(example.firstOrder).toEqual({ water: 150000, deposit: 150000, pump: 0, total: 300000 });
    expect(example.nextOrder).toEqual({ water: 150000, deposit: 0, pump: 0, total: 150000 });
  });

  it('depositExample_afterPriceChangeInConfig_followsNewPrice', () => {
    const raw = rawConfigFixture();
    const brands = raw.brands.map((brand) => (brand.id === 'biwa' ? { ...brand, price: 55000 } : brand));
    const example = depositExample(brandsFromConfig(parseSiteConfig({ ...raw, brands })), limits);

    expect(example.firstOrder.total).toBe(315000);
    expect(example.nextOrder.total).toBe(165000);
  });
});
