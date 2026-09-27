import { findBrand } from '../../../entities/brand/model/brand';
import { clampQuantity } from '../../../entities/order/model/order';
import { trackEvent } from '../../../shared/api/analytics-queue';
import { forgetStoredValue, readStoredValue, storeValue } from '../../../shared/api/browser-storage';
import { copyText } from '../../../shared/api/clipboard';
import { requestCurrentPoint } from '../../../shared/api/geolocation';
import { ANALYTICS_EVENT } from '../../../shared/lib/analytics-event';
import type { BuilderData } from '../model/builder-data';
import { chooseBrandDetail, ORDER_BUILDER_EVENT, type OrderSummaryDetail } from '../model/builder-events';
import {
  applyDeliveryCutoff,
  BUILDER_FIELD,
  NO_PUMP_VALUE,
  readBuilderState,
  writeBuilderQuery,
  type BuilderState,
} from '../model/builder-state';
import { buildBuilderView, type BuilderView } from '../model/builder-view';
import {
  describeLastOrder,
  lastOrderOf,
  parseLastOrder,
  repeatLastOrder,
  serializeLastOrder,
  type LastOrder,
} from '../model/last-order';
import { parseBuilderData } from '../model/serialize-builder-data';

type GeoStatus = 'idle' | 'pending' | 'ok' | 'failed';
type TotalPart = 'water' | 'deposit' | 'pump' | 'total';

interface BuilderElements {
  readonly form: HTMLFormElement;
  readonly todayInput: HTMLInputElement;
  readonly todayClosed: HTMLElement;
  readonly quantityValue: HTMLOutputElement;
  readonly quantityHint: HTMLElement;
  readonly decrease: HTMLButtonElement;
  readonly increase: HTMLButtonElement;
  readonly pumpField: HTMLFieldSetElement;
  readonly geoButton: HTMLButtonElement;
  readonly geoStatus: HTMLElement;
  readonly addressInput: HTMLInputElement;
  readonly summary: HTMLElement;
  readonly totals: Readonly<Record<TotalPart, HTMLElement>>;
  readonly depositRow: HTMLElement;
  readonly pumpRow: HTMLElement;
  readonly depositNote: HTMLElement;
  readonly sendLinks: readonly HTMLAnchorElement[];
  readonly missing: HTMLElement;
  readonly missingList: HTMLElement;
  readonly sendStatus: HTMLElement;
  readonly preview: HTMLElement;
  readonly repeat: HTMLElement;
  readonly repeatButton: HTMLButtonElement;
  readonly repeatSummary: HTMLElement;
  readonly forgetButton: HTMLButtonElement;
}

function requireElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Order builder markup has no ${selector}`);
  }
  return element;
}

function findElements(root: HTMLElement): BuilderElements {
  const form = requireElement<HTMLFormElement>(root, '[data-builder-form]');
  return {
    form,
    todayInput: requireElement(form, `input[name="${BUILDER_FIELD.day}"][value="today"]`),
    todayClosed: requireElement(root, '[data-today-closed]'),
    quantityValue: requireElement(root, '[data-quantity-value]'),
    quantityHint: requireElement(root, '[data-quantity-hint]'),
    decrease: requireElement(root, '[data-quantity-step="-1"]'),
    increase: requireElement(root, '[data-quantity-step="1"]'),
    pumpField: requireElement(root, '[data-pump-field]'),
    geoButton: requireElement(root, '[data-geo-button]'),
    geoStatus: requireElement(root, '[data-geo-status]'),
    addressInput: requireElement(root, '[data-address-input]'),
    summary: requireElement(root, '[data-summary]'),
    totals: {
      water: requireElement(root, '[data-total="water"]'),
      deposit: requireElement(root, '[data-total="deposit"]'),
      pump: requireElement(root, '[data-total="pump"]'),
      total: requireElement(root, '[data-total="total"]'),
    },
    depositRow: requireElement(root, '[data-total-row="deposit"]'),
    pumpRow: requireElement(root, '[data-total-row="pump"]'),
    depositNote: requireElement(root, '[data-deposit-note]'),
    sendLinks: [...root.querySelectorAll<HTMLAnchorElement>('[data-send-link]')],
    missing: requireElement(root, '[data-missing]'),
    missingList: requireElement(root, '[data-missing-list]'),
    sendStatus: requireElement(root, '[data-send-status]'),
    preview: requireElement(root, '[data-message-preview]'),
    repeat: requireElement(root, '[data-repeat]'),
    repeatButton: requireElement(root, '[data-repeat-button]'),
    repeatSummary: requireElement(root, '[data-repeat-summary]'),
    forgetButton: requireElement(root, '[data-repeat-forget]'),
  };
}

function checkRadio(form: HTMLFormElement, name: string, value: string): void {
  form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((input) => {
    input.checked = input.value === value;
  });
}

function geoStatusText(status: GeoStatus, data: BuilderData): string {
  const texts: Record<GeoStatus, string> = {
    idle: '',
    pending: data.texts.geoPending,
    ok: data.texts.geoOk,
    failed: data.texts.geoFailed,
  };
  return texts[status];
}

function applyTotals(elements: BuilderElements, view: BuilderView): void {
  elements.summary.hidden = view.total === null;
  if (view.total === null) {
    return;
  }
  elements.totals.water.textContent = view.total.water;
  elements.totals.deposit.textContent = view.total.deposit ?? '';
  elements.totals.pump.textContent = view.total.pump ?? '';
  elements.totals.total.textContent = view.total.total;
  elements.depositRow.hidden = view.total.deposit === null;
  elements.pumpRow.hidden = view.total.pump === null;
  elements.depositNote.hidden = view.total.deposit === null;
}

function applySending(elements: BuilderElements, view: BuilderView, data: BuilderData): void {
  for (const link of elements.sendLinks) {
    const target = view.sendLinks.find((sendLink) => sendLink.id === link.dataset.sendLink);
    if (target !== undefined) {
      link.href = target.href;
    }
    link.setAttribute('aria-disabled', String(!view.ready));
  }
  elements.missing.hidden = view.missing.length === 0;
  elements.missingList.replaceChildren(
    ...view.missing.map((part) => {
      const item = document.createElement('li');
      item.textContent = part;
      return item;
    }),
  );
  elements.preview.textContent = view.message.length > 0 ? view.message : data.texts.previewEmpty;
}

function applyView(elements: BuilderElements, state: BuilderState, view: BuilderView, data: BuilderData): void {
  const { form } = elements;
  checkRadio(form, BUILDER_FIELD.mode, state.mode);
  checkRadio(form, BUILDER_FIELD.brand, state.brandId ?? '');
  checkRadio(form, BUILDER_FIELD.pump, state.pumpId ?? NO_PUMP_VALUE);
  checkRadio(form, BUILDER_FIELD.day, state.day);
  checkRadio(form, BUILDER_FIELD.payment, state.payment);
  elements.todayInput.disabled = !view.sameDayOpen;
  elements.todayClosed.textContent = view.todayClosedNote;
  elements.quantityValue.textContent = String(state.quantity);
  elements.decrease.disabled = view.atMinimum;
  elements.increase.disabled = view.atMaximum;
  elements.quantityHint.textContent = view.quantityHint;
  elements.pumpField.hidden = !view.pumpOffered;
  applyTotals(elements, view);
  applySending(elements, view, data);
}

function announceSummary(root: HTMLElement, view: BuilderView): void {
  const total = view.total?.total ?? null;
  root.dataset.orderTotal = total ?? '';
  const detail: OrderSummaryDetail = { total };
  root.dispatchEvent(new CustomEvent(ORDER_BUILDER_EVENT.summary, { bubbles: true, detail }));
}

function syncAddressBar(state: BuilderState, data: BuilderData): void {
  const query = writeBuilderQuery(state, data, new URLSearchParams(window.location.search)).toString();
  const search = query.length > 0 ? `?${query}` : '';
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${search}${window.location.hash}`);
}

function patchFromRadio(input: HTMLInputElement, state: BuilderState, data: BuilderData): Partial<BuilderState> {
  switch (input.name) {
    case BUILDER_FIELD.mode:
      return { mode: input.value === 'refill' ? 'refill' : 'first' };
    case BUILDER_FIELD.brand:
      return { brandId: input.value };
    case BUILDER_FIELD.pump:
      return { pumpId: input.value === NO_PUMP_VALUE ? null : input.value };
    case BUILDER_FIELD.day:
      return { day: input.value === 'tomorrow' ? 'tomorrow' : 'today' };
    case BUILDER_FIELD.payment:
      return { payment: data.payments.find((payment) => payment === input.value) ?? state.payment };
    default:
      return {};
  }
}

function readLastOrder(data: BuilderData): LastOrder | null {
  return parseLastOrder(readStoredValue(data.lastOrderKey), data);
}

export function mountOrderBuilder(root: HTMLElement): void {
  const data = parseBuilderData(requireElement(root, '[data-builder-data]').textContent ?? '');
  const elements = findElements(root);
  let state: BuilderState = {
    ...readBuilderState(new URLSearchParams(window.location.search), data),
    address: elements.addressInput.value,
  };
  let geoStatus: GeoStatus = 'idle';
  let started = false;
  let view: BuilderView;
  const lastOrder = readLastOrder(data);

  const render = () => {
    const now = new Date();
    state = applyDeliveryCutoff(state, data, now);
    view = buildBuilderView(state, data, now);
    applyView(elements, state, view, data);
    elements.geoStatus.textContent = geoStatusText(geoStatus, data);
    syncAddressBar(state, data);
    announceSummary(root, view);
  };

  const update = (patch: Partial<BuilderState>) => {
    state = { ...state, ...patch };
    render();
  };

  const markStarted = (patch: Partial<BuilderState> = {}) => {
    if (!started) {
      started = true;
      trackEvent(ANALYTICS_EVENT.builderStart, { mode: patch.mode ?? state.mode });
    }
  };

  const chooseBrand = (brandId: string) => {
    const brand = findBrand(data.brands, brandId);
    if (brand === null) {
      return;
    }
    markStarted();
    update({ brandId: brand.id });
    trackEvent(ANALYTICS_EVENT.builderBrand, { brand: brand.id });
  };

  const locate = async () => {
    markStarted();
    trackEvent(ANALYTICS_EVENT.geoRequest);
    geoStatus = 'pending';
    render();
    const point = await requestCurrentPoint(data.geolocation);
    geoStatus = point === null ? 'failed' : 'ok';
    trackEvent(point === null ? ANALYTICS_EVENT.geoDenied : ANALYTICS_EVENT.geoOk);
    update({ coordinates: point ?? state.coordinates });
    if (point === null) {
      elements.addressInput.focus();
    }
  };

  const showSendStatus = (copied: boolean) => {
    const copyNote = copied ? data.texts.sendCopied : data.texts.sendCopyFailed;
    elements.sendStatus.textContent = `${copyNote} ${data.texts.platePhoto}`;
  };

  const rememberOrder = () => {
    const order = lastOrderOf(state);
    if (order !== null) {
      storeValue(data.lastOrderKey, serializeLastOrder(order));
    }
  };

  const send = (link: HTMLAnchorElement) => {
    trackEvent(ANALYTICS_EVENT.sendClick, {
      messenger: link.dataset.sendLink ?? null,
      brand: state.brandId,
      quantity: state.quantity,
      mode: state.mode,
      total: view.totalAmount,
    });
    rememberOrder();
    copyText(view.message)
      .then(showSendStatus)
      .catch(() => showSendStatus(false));
  };

  const offerRepeat = (order: LastOrder) => {
    elements.repeat.hidden = false;
    elements.repeatSummary.textContent = describeLastOrder(order, data);
    elements.repeatButton.addEventListener('click', () => {
      markStarted({ mode: 'refill' });
      trackEvent(ANALYTICS_EVENT.repeatClick);
      elements.addressInput.value = order.address;
      geoStatus = order.coordinates === null ? 'idle' : 'ok';
      state = repeatLastOrder(state, order);
      render();
    });
    elements.forgetButton.addEventListener('click', () => {
      forgetStoredValue(data.lastOrderKey);
      elements.repeat.hidden = true;
    });
  };

  elements.form.addEventListener('submit', (event) => event.preventDefault());
  elements.form.addEventListener('change', (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'radio') {
      return;
    }
    if (event.target.name === BUILDER_FIELD.brand) {
      chooseBrand(event.target.value);
      return;
    }
    const patch = patchFromRadio(event.target, state, data);
    markStarted(patch);
    update(patch);
  });
  elements.addressInput.addEventListener('input', () => {
    markStarted();
    update({ address: elements.addressInput.value });
  });
  for (const [button, step] of [
    [elements.decrease, -1],
    [elements.increase, 1],
  ] as const) {
    button.addEventListener('click', () => {
      markStarted();
      update({ quantity: clampQuantity(state.quantity + step, data.limits) });
      trackEvent(ANALYTICS_EVENT.builderQuantity, { quantity: state.quantity });
    });
  }
  elements.geoButton.addEventListener('click', () => void locate());
  for (const link of elements.sendLinks) {
    link.addEventListener('click', (event) => {
      if (!view.ready) {
        event.preventDefault();
        return;
      }
      send(link);
    });
  }
  document.addEventListener(ORDER_BUILDER_EVENT.chooseBrand, (event) => {
    const detail = chooseBrandDetail(event);
    if (detail !== null) {
      chooseBrand(detail.brandId);
    }
  });
  if (lastOrder !== null) {
    offerRepeat(lastOrder);
  }

  render();
}
