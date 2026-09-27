import { describe, expect, it } from 'vitest';
import { localBusinessJsonLd } from '../../../../src/shared/lib/local-business';

const facts = {
  name: 'Mỹ Water',
  description: 'Water delivery',
  url: 'https://example.com/en/',
  image: 'https://example.com/en/og.png',
  telephone: '+84000000000',
  street: 'Địa chỉ mẫu',
  city: 'Đà Nẵng',
  country: 'VN',
  areaServed: ['Ngũ Hành Sơn', 'An Hải'],
  opens: '08:00',
  closes: '18:00',
  days: ['monday', 'sunday'] as const,
  currency: 'VND',
  language: 'en',
};

describe('localBusinessJsonLd', () => {
  it('localBusinessJsonLd_fromFacts_buildsSchemaOrgBusiness', () => {
    const data = localBusinessJsonLd(facts);

    expect(data['@type']).toBe('LocalBusiness');
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Địa chỉ mẫu',
      addressLocality: 'Đà Nẵng',
      addressCountry: 'VN',
    });
    expect(data.openingHoursSpecification).toMatchObject({ dayOfWeek: ['Monday', 'Sunday'], opens: '08:00' });
    expect(data.areaServed).toEqual([
      { '@type': 'Place', name: 'Ngũ Hành Sơn' },
      { '@type': 'Place', name: 'An Hải' },
    ]);
  });
});
