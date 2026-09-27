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
