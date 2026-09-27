import type { Brand } from '../../brand/model/brand';
import type { Pump } from '../../pump/model/pump';

export type OrderMode = 'first' | 'refill';
export type DeliveryDay = 'today' | 'tomorrow';
export type PaymentMethod = 'cash' | 'transfer';
export type MissingOrderPart = 'brand' | 'location';

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface QuantityLimits {
  readonly minimum: number;
  readonly maximum: number;
}

export interface DeliveryPoint {
  readonly coordinates: Coordinates | null;
  readonly address: string;
}

export interface Order {
  readonly mode: OrderMode;
  readonly brand: Brand;
  readonly quantity: number;
  readonly pump: Pump | null;
  readonly deliveryPoint: DeliveryPoint;
  readonly day: DeliveryDay;
  readonly payment: PaymentMethod;
}

export type OrderPricing = Pick<Order, 'mode' | 'brand' | 'quantity' | 'pump'>;

export interface OrderTotal {
  readonly water: number;
  readonly deposit: number;
  readonly pump: number;
  readonly total: number;
}

export function isPumpOffered(mode: OrderMode, brand: Brand): boolean {
  return mode === 'first' && !brand.hasTap;
}

export function clampQuantity(quantity: number, limits: QuantityLimits): number {
  return Math.min(Math.max(Math.trunc(quantity), limits.minimum), limits.maximum);
}

export function hasDeliveryPoint(point: DeliveryPoint): boolean {
  return point.coordinates !== null || point.address.trim().length > 0;
}

export function chargedPump(order: OrderPricing): Pump | null {
  return isPumpOffered(order.mode, order.brand) ? order.pump : null;
}

export function calculateTotal(order: OrderPricing): OrderTotal {
  const water = order.brand.price * order.quantity;
  const deposit = order.mode === 'first' ? order.brand.deposit * order.quantity : 0;
  const pump = chargedPump(order)?.price ?? 0;
  return { water, deposit, pump, total: water + deposit + pump };
}

export function findMissingParts(brand: Brand | null, point: DeliveryPoint): MissingOrderPart[] {
  const missing: MissingOrderPart[] = [];
  if (brand === null) {
    missing.push('brand');
  }
  if (!hasDeliveryPoint(point)) {
    missing.push('location');
  }
  return missing;
}
