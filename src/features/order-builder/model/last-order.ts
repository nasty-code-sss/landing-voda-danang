import { findBrand } from '../../../entities/brand/model/brand';
import { clampQuantity, type Coordinates, type PaymentMethod } from '../../../entities/order/model/order';
import { formatVolume } from '../../../shared/i18n/number-format';
import { countWithNoun } from '../../../shared/i18n/plural';
import { fillTemplate } from '../../../shared/i18n/template';
import type { BuilderData } from './builder-data';
import { paymentOrDefault, type BuilderState } from './builder-state';

export interface LastOrder {
  readonly brandId: string;
  readonly quantity: number;
  readonly coordinates: Coordinates | null;
  readonly address: string;
  readonly payment: PaymentMethod;
}

const LAST_ORDER_FORMAT = 1;
const LATITUDE_LIMIT = 90;
const LONGITUDE_LIMIT = 180;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCoordinate(value: unknown, limit: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}

function readCoordinates(value: unknown): Coordinates | null {
  if (!isRecord(value)) {
    return null;
  }
  const { latitude, longitude } = value;
  return isCoordinate(latitude, LATITUDE_LIMIT) && isCoordinate(longitude, LONGITUDE_LIMIT) ? { latitude, longitude } : null;
}

function parseStoredJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

export function lastOrderOf(state: BuilderState): LastOrder | null {
  if (state.brandId === null) {
    return null;
  }
  return {
    brandId: state.brandId,
    quantity: state.quantity,
    coordinates: state.coordinates,
    address: state.address.trim(),
    payment: state.payment,
  };
}

export function serializeLastOrder(order: LastOrder): string {
  return JSON.stringify({ format: LAST_ORDER_FORMAT, ...order });
}

export function parseLastOrder(raw: string | null, data: BuilderData): LastOrder | null {
  const stored = raw === null ? null : parseStoredJson(raw);
  if (!isRecord(stored) || stored.format !== LAST_ORDER_FORMAT) {
    return null;
  }
  const brand = typeof stored.brandId === 'string' ? findBrand(data.brands, stored.brandId) : null;
  const coordinates = readCoordinates(stored.coordinates);
  const address = typeof stored.address === 'string' ? stored.address.trim() : '';
  const hasDeliveryPoint = coordinates !== null || address.length > 0;
  if (brand === null || typeof stored.quantity !== 'number' || !Number.isFinite(stored.quantity) || !hasDeliveryPoint) {
    return null;
  }
  return {
    brandId: brand.id,
    quantity: clampQuantity(stored.quantity, data.limits),
    coordinates,
    address,
    payment: paymentOrDefault(stored.payment, data),
  };
}

export function repeatLastOrder(state: BuilderState, order: LastOrder): BuilderState {
  return {
    ...state,
    mode: 'refill',
    brandId: order.brandId,
    quantity: order.quantity,
    pumpId: null,
    coordinates: order.coordinates,
    address: order.address,
    payment: order.payment,
  };
}

export function describeLastOrder(order: LastOrder, data: BuilderData): string {
  const brand = findBrand(data.brands, order.brandId);
  const volume = brand === null ? '' : ` ${formatVolume(brand.volumeLiters, data.language)} ${data.message.texts.literUnit}`;
  return fillTemplate(data.texts.repeatSummary, {
    brand: `${brand?.name ?? order.brandId}${volume}`,
    bottles: countWithNoun(order.quantity, data.language, data.texts.bottles),
  });
}
