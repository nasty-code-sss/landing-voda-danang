const CLOSE_KEY = 'Escape';

function isOutside(menu: HTMLDetailsElement, target: EventTarget | null): boolean {
  return target instanceof Node && !menu.contains(target);
}

export function mountLanguageMenu(menu: HTMLDetailsElement, page: Document): void {
  page.addEventListener('click', (event) => {
    if (menu.open && isOutside(menu, event.target)) {
      menu.open = false;
    }
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === CLOSE_KEY && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
}
