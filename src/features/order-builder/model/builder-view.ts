import { findBrand, type Brand } from '../../../entities/brand/model/brand';
import { isSameDayDeliveryOpen } from '../../../entities/order/model/delivery-day';
import {
  calculateTotal,
  findMissingParts,
  isPumpOffered,
  type Order,
} from '../../../entities/order/model/order';
import { composeOrderMessage } from '../../../entities/order/model/order-message';
import { findPump } from '../../../entities/pump/model/pump';
import { mapSearchLink } from '../../../shared/api/map-link';
import { chatLink } from '../../../shared/api/messenger-link';
import type { MessengerId } from '../../../shared/config/site-config';
import { fillTemplate } from '../../../shared/i18n/template';
import { formatMoney } from '../../../shared/i18n/number-format';
import { countWithNoun } from '../../../shared/i18n/plural';
import type { BuilderData } from './builder-data';
import type { BuilderState } from './builder-state';

export interface FormattedTotal {
  readonly water: string;
  readonly deposit: string | null;
  readonly pump: string | null;
  readonly total: string;
}

export interface SendLink {
  readonly id: MessengerId;
  readonly href: string;
}

export interface BuilderView {
  readonly brand: Brand | null;
  readonly pumpOffered: boolean;
  readonly sameDayOpen: boolean;
  readonly todayClosedNote: string;
  readonly atMinimum: boolean;
  readonly atMaximum: boolean;
  readonly quantityHint: string;
  readonly total: FormattedTotal | null;
  readonly missing: readonly string[];
  readonly ready: boolean;
  readonly message: string;
  readonly sendLinks: readonly SendLink[];
}

function quantityHint(state: BuilderState, data: BuilderData): string {
  const bottles = (count: number) => countWithNoun(count, data.language, data.texts.bottles);
  if (state.quantity <= data.limits.minimum) {
    return fillTemplate(data.texts.quantityMinimum, { bottles: bottles(data.limits.minimum) });
  }
  if (state.quantity >= data.limits.maximum) {
    return fillTemplate(data.texts.quantityMaximum, { bottles: bottles(data.limits.maximum) });
  }
  return '';
}

function orderOf(state: BuilderState, brand: Brand, data: BuilderData): Order {
  return {
    mode: state.mode,
    brand,
    quantity: state.quantity,
    pump: findPump(data.pumps, state.pumpId),
    deliveryPoint: { coordinates: state.coordinates, address: state.address },
    day: state.day,
    payment: state.payment,
  };
}

function formatTotal(order: Order, data: BuilderData): FormattedTotal {
  const total = calculateTotal(order);
  const money = (amount: number) => formatMoney(amount, data.language, data.currency);
  return {
    water: money(total.water),
    deposit: total.deposit > 0 ? money(total.deposit) : null,
    pump: total.pump > 0 ? money(total.pump) : null,
    total: money(total.total),
  };
}

function composeMessage(order: Order, data: BuilderData): string {
  const coordinates = order.deliveryPoint.coordinates;
  return composeOrderMessage({
    order,
    locationLink:
      coordinates === null ? null : mapSearchLink(data.mapsSearchUrl, coordinates, data.coordinateDecimals),
    currency: data.currency,
    primary: data.message,
    copy: data.messageCopy,
  });
}

export function buildBuilderView(state: BuilderState, data: BuilderData, now: Date): BuilderView {
  const brand = findBrand(data.brands, state.brandId);
  const sameDayOpen = isSameDayDeliveryOpen(now, data.sameDayUntil, data.timeZone);
  const missingParts = findMissingParts(brand, { coordinates: state.coordinates, address: state.address });
  const order = brand === null ? null : orderOf(state, brand, data);
  const ready = order !== null && missingParts.length === 0;
  const message = order === null ? '' : composeMessage(order, data);

  return {
    brand,
    pumpOffered: brand !== null && isPumpOffered(state.mode, brand),
    sameDayOpen,
    todayClosedNote: sameDayOpen ? '' : fillTemplate(data.texts.todayClosed, { time: data.sameDayUntil }),
    atMinimum: state.quantity <= data.limits.minimum,
    atMaximum: state.quantity >= data.limits.maximum,
    quantityHint: quantityHint(state, data),
    total: order === null ? null : formatTotal(order, data),
    missing: missingParts.map((part) => data.texts.missing[part]),
    ready,
    message,
    sendLinks: data.messengers.map((messenger) => ({
      id: messenger.id,
      href: ready ? chatLink(messenger, message) : chatLink(messenger),
    })),
  };
}
