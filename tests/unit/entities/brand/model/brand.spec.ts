import { describe, expect, it } from 'vitest';
import { brandsWithTap, EmptyBrandListError, exampleBrand, lowestPrice } from '../../../../../src/entities/brand/model/brand';
import { brandsFromConfig } from '../../../../../src/features/order-builder/model/builder-data';
import { configFixture } from '../../../../fixtures/site-config-fixture';

const brands = brandsFromConfig(configFixture());

describe('brand price list', () => {
  it('lowestPrice_ofDemoPriceList_isFiftyThousand', () => {
    expect(lowestPrice(brands)).toBe(50000);
  });

  it('exampleBrand_returnsBrandMarkedAsExample', () => {
    expect(exampleBrand(brands).id).toBe('biwa');
  });

  it('brandsWithTap_splitsLaVieFromBottlesWithoutTap', () => {
    expect(brandsWithTap(brands, true).map((brand) => brand.id)).toEqual(['lavie']);
    expect(brandsWithTap(brands, false).map((brand) => brand.id)).toEqual(['biwa', 'sunrise']);
  });

  it('lowestPrice_ofEmptyList_throws', () => {
    expect(() => lowestPrice([])).toThrow(EmptyBrandListError);
  });
});
