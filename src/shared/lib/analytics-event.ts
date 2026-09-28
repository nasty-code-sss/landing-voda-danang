export const ANALYTICS_EVENT = {
  languageSwitch: 'lang_switch',
  ctaClick: 'cta_click',
  builderStart: 'builder_start',
  builderBrand: 'builder_brand',
  builderQuantity: 'builder_qty',
  geoRequest: 'geo_request',
  geoOk: 'geo_ok',
  geoDenied: 'geo_denied',
  sendClick: 'send_click',
  callClick: 'call_click',
  repeatClick: 'repeat_click',
  faqOpen: 'faq_open',
  landlordClick: 'landlord_click',
} as const;

export const SOURCE_PARAMETER = 'utm_source';

export type AnalyticsEventName = (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];
export type AnalyticsValue = string | number | null;
export type AnalyticsParams = Readonly<Record<string, AnalyticsValue>>;

export interface AnalyticsContext {
  readonly language: string;
  readonly query: URLSearchParams;
}

const EVENT_NAMES: readonly string[] = Object.values(ANALYTICS_EVENT);

export function isAnalyticsEventName(value: string | undefined): value is AnalyticsEventName {
  return value !== undefined && EVENT_NAMES.includes(value);
}

export function analyticsPayload(name: AnalyticsEventName, params: AnalyticsParams, context: AnalyticsContext): AnalyticsParams {
  return {
    ...params,
    event: name,
    language: context.language,
    source: context.query.get(SOURCE_PARAMETER),
  };
}
