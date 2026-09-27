import { capitalizeFirst } from '../i18n/list-format';
import type { Weekday } from '../i18n/weekday-name';

export interface LocalBusinessFacts {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly image: string;
  readonly telephone: string;
  readonly street: string;
  readonly city: string;
  readonly country: string;
  readonly areaServed: readonly string[];
  readonly opens: string;
  readonly closes: string;
  readonly days: readonly Weekday[];
  readonly currency: string;
  readonly language: string;
}

const SCHEMA_CONTEXT = 'https://schema.org';
const SCHEMA_DAY_LANGUAGE = 'en';

export function localBusinessJsonLd(facts: LocalBusinessFacts): Readonly<Record<string, unknown>> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'LocalBusiness',
    name: facts.name,
    description: facts.description,
    url: facts.url,
    image: facts.image,
    telephone: facts.telephone,
    inLanguage: facts.language,
    currenciesAccepted: facts.currency,
    address: {
      '@type': 'PostalAddress',
      streetAddress: facts.street,
      addressLocality: facts.city,
      addressCountry: facts.country,
    },
    areaServed: facts.areaServed.map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: facts.days.map((day) => capitalizeFirst(day, SCHEMA_DAY_LANGUAGE)),
      opens: facts.opens,
      closes: facts.closes,
    },
  };
}
