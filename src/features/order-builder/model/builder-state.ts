import { findBrand } from '../../../entities/brand/model/brand';
import { isSameDayDeliveryOpen } from '../../../entities/order/model/delivery-day';
import {
  clampQuantity,
  type Coordinates,
  type DeliveryDay,
  type OrderMode,
  type PaymentMethod,
} from '../../../entities/order/model/order';
import { findPump } from '../../../entities/pump/model/pump';
import type { BuilderData } from './builder-data';

export interface BuilderState {
  readonly mode: OrderMode;
  readonly brandId: string | null;
  readonly quantity: number;
  readonly pumpId: string | null;
  readonly coordinates: Coordinates | null;
  readonly address: string;
  readonly day: DeliveryDay;
  readonly payment: PaymentMethod;
}

export const BUILDER_FIELD = {
  mode: 'mode',
  brand: 'brand',
  pump: 'pump',
  day: 'day',
  payment: 'payment',
} as const;

export const NO_PUMP_VALUE = '';

export const BUILDER_QUERY = {
  mode: 'mode',
  brand: 'brand',
  quantity: 'qty',
  pump: 'pump',
  day: 'day',
  payment: 'pay',
} as const;

const REFILL: OrderMode = 'refill';
const TOMORROW: DeliveryDay = 'tomorrow';

const FALLBACK_PAYMENT: PaymentMethod = 'cash';

export function paymentOrDefault(value: unknown, data: BuilderData): PaymentMethod {
  const known = data.payments.find((payment) => payment === value);
  return known ?? data.payments[0] ?? FALLBACK_PAYMENT;
}

function readQuantity(value: string | null, data: BuilderData): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? data.limits.minimum : clampQuantity(parsed, data.limits);
}

export function readBuilderState(query: URLSearchParams, data: BuilderData): BuilderState {
  return {
    mode: query.get(BUILDER_QUERY.mode) === REFILL ? 'refill' : 'first',
    brandId: findBrand(data.brands, query.get(BUILDER_QUERY.brand))?.id ?? null,
    quantity: readQuantity(query.get(BUILDER_QUERY.quantity), data),
    pumpId: findPump(data.pumps, query.get(BUILDER_QUERY.pump))?.id ?? null,
    coordinates: null,
    address: '',
    day: query.get(BUILDER_QUERY.day) === TOMORROW ? 'tomorrow' : 'today',
    payment: paymentOrDefault(query.get(BUILDER_QUERY.payment), data),
  };
}

export function applyDeliveryCutoff(state: BuilderState, data: BuilderData, now: Date): BuilderState {
  const sameDayOpen = isSameDayDeliveryOpen(now, data.sameDayUntil, data.timeZone);
  return sameDayOpen || state.day === 'tomorrow' ? state : { ...state, day: 'tomorrow' };
}

function setOrDelete(query: URLSearchParams, key: string, value: string | null): void {
  if (value === null) {
    query.delete(key);
  } else {
    query.set(key, value);
  }
}

export function writeBuilderQuery(state: BuilderState, data: BuilderData, current: URLSearchParams): URLSearchParams {
  const query = new URLSearchParams(current);
  setOrDelete(query, BUILDER_QUERY.mode, state.mode === 'refill' ? REFILL : null);
  setOrDelete(query, BUILDER_QUERY.brand, state.brandId);
  setOrDelete(query, BUILDER_QUERY.quantity, state.quantity === data.limits.minimum ? null : String(state.quantity));
  setOrDelete(query, BUILDER_QUERY.pump, state.pumpId);
  setOrDelete(query, BUILDER_QUERY.day, state.day === 'tomorrow' ? TOMORROW : null);
  setOrDelete(query, BUILDER_QUERY.payment, state.payment === data.payments[0] ? null : state.payment);
  return query;
}
