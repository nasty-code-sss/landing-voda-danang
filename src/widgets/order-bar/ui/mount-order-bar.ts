import { ORDER_BUILDER_EVENT, orderSummaryDetail } from '../../../features/order-builder/model/builder-events';
import { PAGE_ANCHOR } from '../../../shared/lib/page-anchor';

function showTotal(target: HTMLElement, total: string | null): void {
  target.textContent = total ?? '';
}

function hideWhileBuilderVisible(bar: HTMLElement, builder: HTMLElement): void {
  if (!('IntersectionObserver' in window)) {
    return;
  }
  const observer = new IntersectionObserver(([entry]) => {
    bar.toggleAttribute('data-covered', entry?.isIntersecting ?? false);
  });
  observer.observe(builder);
}

export function mountOrderBar(bar: HTMLElement): void {
  const total = bar.querySelector<HTMLElement>('[data-order-bar-total]');
  const builder = document.getElementById(PAGE_ANCHOR.order);
  if (total !== null) {
    showTotal(total, builder?.dataset.orderTotal || null);
    document.addEventListener(ORDER_BUILDER_EVENT.summary, (event) => {
      showTotal(total, orderSummaryDetail(event)?.total ?? null);
    });
  }
  if (builder !== null) {
    hideWhileBuilderVisible(bar, builder);
  }
}
