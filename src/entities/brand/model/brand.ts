export type WaterType = 'purified' | 'mineral';

export interface Brand {
  readonly id: string;
  readonly name: string;
  readonly waterType: WaterType;
  readonly volumeLiters: number;
  readonly price: number;
  readonly deposit: number;
  readonly hasTap: boolean;
  readonly isExample: boolean;
}

export function findBrand(brands: readonly Brand[], id: string | null): Brand | null {
  return brands.find((brand) => brand.id === id) ?? null;
}

export class EmptyBrandListError extends Error {
  override readonly name = 'EmptyBrandListError';
}

function requireBrands(brands: readonly Brand[]): readonly [Brand, ...Brand[]] {
  const [first, ...rest] = brands;
  if (first === undefined) {
    throw new EmptyBrandListError('The price list has no brands');
  }
  return [first, ...rest];
}

export function exampleBrand(brands: readonly Brand[]): Brand {
  const [first] = requireBrands(brands);
  return brands.find((brand) => brand.isExample) ?? first;
}

export function lowestPrice(brands: readonly Brand[]): number {
  return Math.min(...requireBrands(brands).map((brand) => brand.price));
}

export function brandsWithTap(brands: readonly Brand[], hasTap: boolean): Brand[] {
  return brands.filter((brand) => brand.hasTap === hasTap);
}
