import { ORDER_BUILDER_EVENT, type ChooseBrandDetail } from '../../../features/order-builder/model/builder-events';
import { PAGE_ANCHOR } from '../../../shared/lib/page-anchor';

function scrollToBuilder(root: Document): void {
  root.getElementById(PAGE_ANCHOR.order)?.scrollIntoView();
}

export function bindChooseButtons(root: Document): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-choose-brand]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const brandId = button.dataset.chooseBrand;
      if (brandId === undefined) {
        return;
      }
      event.preventDefault();
      const detail: ChooseBrandDetail = { brandId };
      root.dispatchEvent(new CustomEvent(ORDER_BUILDER_EVENT.chooseBrand, { detail }));
      scrollToBuilder(root);
    });
  });
}
