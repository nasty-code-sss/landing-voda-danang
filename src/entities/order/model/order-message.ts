import { formatMoney, formatVolume } from '../../../shared/i18n/number-format';
import { calculateTotal, chargedPump, type Order, type PaymentMethod } from './order';

export interface OrderMessageTexts {
  readonly greeting: string;
  readonly heading: string;
  readonly brand: string;
  readonly literUnit: string;
  readonly type: string;
  readonly typeFirst: string;
  readonly typeRefill: string;
  readonly pump: string;
  readonly pumpNames: Readonly<Record<string, string>>;
  readonly location: string;
  readonly address: string;
  readonly when: string;
  readonly today: string;
  readonly tomorrow: string;
  readonly payment: string;
  readonly paymentMethods: Readonly<Record<PaymentMethod, string>>;
  readonly total: string;
  readonly totalWater: string;
  readonly totalDeposit: string;
  readonly totalPump: string;
}

export interface MessageLanguage {
  readonly language: string;
  readonly texts: OrderMessageTexts;
}

export interface OrderMessageRequest {
  readonly order: Order;
  readonly locationLink: string | null;
  readonly currency: string;
  readonly primary: MessageLanguage;
  readonly copy: MessageLanguage | null;
}

const QUANTITY_SIGN = 'x';
const COPY_SEPARATOR = '---';
const BREAKDOWN_JOINER = ' + ';
const LINE_BREAK = '\n';
const PARAGRAPH_BREAK = '\n\n';

function pumpName(texts: OrderMessageTexts, pumpId: string): string {
  const name = texts.pumpNames[pumpId];
  if (name === undefined) {
    throw new Error(`No pump name for "${pumpId}"`);
  }
  return name;
}

function describeTotal(order: Order, currency: string, { language, texts }: MessageLanguage): string {
  const total = calculateTotal(order);
  const money = (amount: number) => formatMoney(amount, language, currency);
  const breakdown = [
    `${texts.totalWater} ${money(total.water)}`,
    ...(total.deposit > 0 ? [`${texts.totalDeposit} ${money(total.deposit)}`] : []),
    ...(total.pump > 0 ? [`${texts.totalPump} ${money(total.pump)}`] : []),
  ];
  const details = breakdown.length > 1 ? ` (${breakdown.join(BREAKDOWN_JOINER)})` : '';
  return `${texts.total}: ${money(total.total)}${details}`;
}

function describeOrder(request: OrderMessageRequest, part: MessageLanguage, withGreeting: boolean): string {
  const { order, locationLink, currency } = request;
  const { language, texts } = part;
  const pump = chargedPump(order);
  const address = order.deliveryPoint.address.trim();
  const volume = `${formatVolume(order.brand.volumeLiters, language)} ${texts.literUnit}`;

  const lines = [
    withGreeting ? `${texts.greeting} ${texts.heading}` : texts.heading,
    `${texts.brand}: ${order.brand.name} ${volume} ${QUANTITY_SIGN} ${order.quantity}`,
    `${texts.type}: ${order.mode === 'first' ? texts.typeFirst : texts.typeRefill}`,
    ...(pump === null ? [] : [`${texts.pump}: ${pumpName(texts, pump.id)}`]),
    ...(locationLink === null ? [] : [`${texts.location}: ${locationLink}`]),
    ...(address.length === 0 ? [] : [`${texts.address}: ${address}`]),
    `${texts.when}: ${order.day === 'today' ? texts.today : texts.tomorrow}`,
    `${texts.payment}: ${texts.paymentMethods[order.payment]}`,
    describeTotal(order, currency, part),
  ];
  return lines.join(LINE_BREAK);
}

export function withOperatorCopy(primary: string, copy: string | null): string {
  if (copy === null) {
    return primary;
  }
  return [primary, `${COPY_SEPARATOR}${LINE_BREAK}${copy}`].join(PARAGRAPH_BREAK);
}

export function composeOrderMessage(request: OrderMessageRequest): string {
  const primary = describeOrder(request, request.primary, true);
  const copy = request.copy === null ? null : describeOrder(request, request.copy, false);
  return withOperatorCopy(primary, copy);
}
