import { exampleBrand, type Brand } from '../../brand/model/brand';
import { calculateTotal, type OrderTotal, type QuantityLimits } from './order';

export interface DepositExample {
  readonly brand: Brand;
  readonly quantity: number;
  readonly firstOrder: OrderTotal;
  readonly nextOrder: OrderTotal;
}

export function depositExample(brands: readonly Brand[], limits: QuantityLimits): DepositExample {
  const brand = exampleBrand(brands);
  const quantity = limits.minimum;
  return {
    brand,
    quantity,
    firstOrder: calculateTotal({ mode: 'first', brand, quantity, pump: null }),
    nextOrder: calculateTotal({ mode: 'refill', brand, quantity, pump: null }),
  };
}
