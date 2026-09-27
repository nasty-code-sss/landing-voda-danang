import { describe, expect, it } from 'vitest';
import {
  chooseBrandDetail,
  ORDER_BUILDER_EVENT,
  orderSummaryDetail,
} from '../../../../../src/features/order-builder/model/builder-events';

describe('builder events', () => {
  it('chooseBrandDetail_withBrandId_readsIt', () => {
    const event = new CustomEvent(ORDER_BUILDER_EVENT.chooseBrand, { detail: { brandId: 'lavie' } });

    expect(chooseBrandDetail(event)).toEqual({ brandId: 'lavie' });
  });

  it('chooseBrandDetail_withForeignShape_returnsNull', () => {
    expect(chooseBrandDetail(new CustomEvent(ORDER_BUILDER_EVENT.chooseBrand, { detail: { brand: 1 } }))).toBeNull();
    expect(chooseBrandDetail(new Event(ORDER_BUILDER_EVENT.chooseBrand))).toBeNull();
  });

  it('orderSummaryDetail_withoutTotal_givesNullTotal', () => {
    expect(orderSummaryDetail(new CustomEvent(ORDER_BUILDER_EVENT.summary, { detail: { total: null } }))).toEqual({ total: null });
    expect(orderSummaryDetail(new CustomEvent(ORDER_BUILDER_EVENT.summary, { detail: { total: '₫300,000' } }))).toEqual({
      total: '₫300,000',
    });
  });
});
