import type { SiteConfig, TrustPoint } from '../../../shared/config/site-config';

export const TRUST_POINT_ORDER: readonly TrustPoint[] = [
  'sealedBottles',
  'washedBottles',
  'officialDealer',
  'photoBeforeDelivery',
];

export function promisedTrustPoints(trust: SiteConfig['trust']): TrustPoint[] {
  return TRUST_POINT_ORDER.filter((point) => trust[point]);
}
