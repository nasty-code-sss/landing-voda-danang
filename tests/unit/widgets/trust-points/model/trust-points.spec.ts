import { describe, expect, it } from 'vitest';
import { promisedTrustPoints } from '../../../../../src/widgets/trust-points/model/trust-points';

describe('promisedTrustPoints', () => {
  it('promisedTrustPoints_keepsOnlyPromisesTheOwnerKeeps', () => {
    const trust = { sealedBottles: true, washedBottles: false, officialDealer: true, photoBeforeDelivery: false };

    expect(promisedTrustPoints(trust)).toEqual(['sealedBottles', 'officialDealer']);
  });
});
