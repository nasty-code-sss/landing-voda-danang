import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

const MOSCOW_NOON_IS_VIETNAM_FOUR_PM = new Date('2026-09-28T09:00:00Z');

test.use({ timezoneId: 'Europe/Moscow' });

test.describe('scenario 8: same-day cutoff by Vietnam time', () => {
  test('at 16:00 in Vietnam and noon on a Moscow phone "today" is closed', async ({ page }) => {
    await page.clock.setFixedTime(MOSCOW_NOON_IS_VIETNAM_FOUR_PM);
    await page.goto('en/');

    await expect(page.locator('input[name="day"][value="today"]')).toBeDisabled();
    await expect(page.locator('[data-today-closed]')).toContainText(artifactConfig.delivery.sameDayUntil);
  });
});
