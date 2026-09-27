import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

const NARROW_PHONE = { width: 360, height: 740 };

test.use({ viewport: NARROW_PHONE });

test.describe('scenario 13: phone 360 px wide', () => {
  for (const language of artifactConfig.languages.supported) {
    test(`/${language}/ has no horizontal scroll, no clipped labels and shows the order bar`, async ({ page }) => {
      await page.goto(`${language}/`);

      const layout = await page.evaluate(() => {
        const clipped = [...document.querySelectorAll<HTMLElement>('a, button, summary, .choice-title, h1, h2, h3')]
          .filter((element) => element.offsetParent !== null && element.scrollWidth > element.clientWidth + 1)
          .map((element) => `${element.tagName}.${element.className}: ${(element.textContent ?? '').trim().slice(0, 30)}`);
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, clipped };
      });

      expect(layout.overflow).toBeLessThanOrEqual(0);
      expect(layout.clipped).toEqual([]);
      await expect(page.locator('[data-order-bar]')).toBeInViewport();
    });
  }
});
