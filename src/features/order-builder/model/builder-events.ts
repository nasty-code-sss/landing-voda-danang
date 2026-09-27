export const ORDER_BUILDER_EVENT = {
  chooseBrand: 'order-builder:choose-brand',
  summary: 'order-builder:summary',
} as const;

export interface ChooseBrandDetail {
  readonly brandId: string;
}

export interface OrderSummaryDetail {
  readonly total: string | null;
}

function hasStringField(detail: unknown, field: string): boolean {
  return typeof detail === 'object' && detail !== null && field in detail && typeof Reflect.get(detail, field) === 'string';
}

export function chooseBrandDetail(event: Event): ChooseBrandDetail | null {
  if (!(event instanceof CustomEvent) || !hasStringField(event.detail, 'brandId')) {
    return null;
  }
  return { brandId: String(Reflect.get(event.detail, 'brandId')) };
}

export function orderSummaryDetail(event: Event): OrderSummaryDetail | null {
  if (!(event instanceof CustomEvent)) {
    return null;
  }
  return { total: hasStringField(event.detail, 'total') ? String(Reflect.get(event.detail, 'total')) : null };
}
