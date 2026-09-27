import { trackEvent } from '../../shared/api/analytics-queue';
import { isAnalyticsEventName, type AnalyticsParams } from '../../shared/lib/analytics-event';

const PARAM_PREFIX = 'analyticsParam';
const CLICK_TRACKED = '[data-analytics-click]';

function paramName(datasetKey: string): string {
  const name = datasetKey.slice(PARAM_PREFIX.length);
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}

function isParamKey(datasetKey: string): boolean {
  return datasetKey.startsWith(PARAM_PREFIX) && datasetKey.length > PARAM_PREFIX.length;
}

function trackedParams(element: HTMLElement): AnalyticsParams {
  return Object.fromEntries(
    Object.entries(element.dataset)
      .filter(([key]) => isParamKey(key))
      .map(([key, value]) => [paramName(key), value ?? null]),
  );
}

function trackClick(event: Event): void {
  const element = event.target instanceof Element ? event.target.closest<HTMLElement>(CLICK_TRACKED) : null;
  const name = element?.dataset.analyticsClick;
  if (element !== null && element !== undefined && isAnalyticsEventName(name)) {
    trackEvent(name, trackedParams(element));
  }
}

function trackOpen(event: Event): void {
  const element = event.target;
  if (!(element instanceof HTMLDetailsElement) || !element.open) {
    return;
  }
  const name = element.dataset.analyticsOpen;
  if (isAnalyticsEventName(name)) {
    trackEvent(name, trackedParams(element));
  }
}

export function bindTrackedElements(root: Document): void {
  root.addEventListener('click', trackClick);
  root.addEventListener('toggle', trackOpen, true);
}
