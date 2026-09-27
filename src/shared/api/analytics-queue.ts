import { analyticsPayload, type AnalyticsEventName, type AnalyticsParams } from '../lib/analytics-event';

interface AnalyticsQueue {
  push(entry: AnalyticsParams): unknown;
}

function isAnalyticsQueue(value: unknown): value is AnalyticsQueue {
  return typeof value === 'object' && value !== null && 'push' in value && typeof value.push === 'function';
}

function pageQueue(name: string): AnalyticsQueue {
  const pageGlobals = window as unknown as Record<string, unknown>;
  const existing = pageGlobals[name];
  if (isAnalyticsQueue(existing)) {
    return existing;
  }
  const created: AnalyticsParams[] = [];
  pageGlobals[name] = created;
  return created;
}

export function trackEvent(name: AnalyticsEventName, params: AnalyticsParams = {}): void {
  const root = document.documentElement;
  const queueName = root.dataset.analyticsQueue;
  if (queueName === undefined || queueName.length === 0) {
    return;
  }
  const context = { language: root.lang, query: new URLSearchParams(window.location.search) };
  pageQueue(queueName).push(analyticsPayload(name, params, context));
}
