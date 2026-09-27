import { describe, expect, it } from 'vitest';
import { mapSearchLink } from '../../../../src/shared/api/map-link';

const SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=';

describe('mapSearchLink', () => {
  it('mapSearchLink_roundsToGivenDecimalsAndEncodesComma', () => {
    const link = mapSearchLink(SEARCH_URL, { latitude: 16.054123456, longitude: 108.247314159 }, 5);

    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=16.05412%2C108.24731');
  });

  it('mapSearchLink_keepsNegativeCoordinates', () => {
    expect(mapSearchLink(SEARCH_URL, { latitude: -33.8688, longitude: 151.2093 }, 2)).toBe(`${SEARCH_URL}-33.87%2C151.21`);
  });
});
