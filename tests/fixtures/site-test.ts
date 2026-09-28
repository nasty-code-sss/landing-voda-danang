import { test as base, expect, type Locator, type Page } from '@playwright/test';
import { loadSettings } from '../../src/shared/config/settings.ts';

const NON_BREAKING_SPACES = /[\u00A0\u202F]/g;
const WINDOWS_LINE_BREAKS = /\r\n/g;
const ARTIFACT_ENVIRONMENT = 'prod';
const MESSAGE_PARAMETER = 'text';
const VIETNAM_TEN_AM_SAME_DAY_IS_OPEN = '2026-09-28T03:00:00Z';

export const CYRILLIC_LETTER = /[\u0400-\u04FF]/;
export const VIETNAMESE_LETTER = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
export const DEVICE_POINT = { latitude: 16.054123, longitude: 108.247311 };
export const artifactConfig = loadSettings(process.cwd(), ARTIFACT_ENVIRONMENT).config;

export function withPlainSpaces(text: string): string {
  return text.replace(NON_BREAKING_SPACES, ' ');
}

export function messageOf(href: string): string {
  return withPlainSpaces(new URL(href).searchParams.get(MESSAGE_PARAMETER) ?? '');
}

export async function readClipboard(page: Page): Promise<string> {
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  return copied.replace(WINDOWS_LINE_BREAKS, '\n');
}

export function sendLink(page: Page, messenger: string): Locator {
  return page.locator(`[data-send-link="${messenger}"]`);
}

export async function waitUntilSendable(page: Page): Promise<void> {
  await expect(page.locator('[data-send-link]').first()).toHaveAttribute('aria-disabled', 'false');
}

export async function sendOrder(page: Page, messenger: string): Promise<void> {
  const popup = page.context().waitForEvent('page');
  await sendLink(page, messenger).click();
  await (await popup).close();
}

export async function firstMessenger(page: Page): Promise<string | null> {
  return page.locator('.send-links li').first().locator('a').getAttribute('data-send-link');
}

export async function builderValue(page: Page, field: string): Promise<string | null> {
  const checked = page.locator(`input[name="${field}"]:checked`);
  return (await checked.count()) === 0 ? null : checked.inputValue();
}

export async function mainText(page: Page): Promise<string> {
  const unlocalizedNames = [artifactConfig.brand.name, ...artifactConfig.brands.map((brand) => brand.name)];
  return page.evaluate((names) => {
    const pageLanguage = document.documentElement.lang;
    const copy = document.body.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('script, style, [data-message-preview], .language-switch').forEach((node) => node.remove());
    copy.querySelectorAll('[lang]').forEach((node) => {
      if (node.getAttribute('lang') !== pageLanguage) {
        node.remove();
      }
    });
    return names.reduce((text, name) => text.split(name).join(''), copy.textContent ?? '');
  }, unlocalizedNames);
}

function isSitePage(page: Page, siteOrigin: string): boolean {
  return page.url().startsWith(siteOrigin);
}

interface SiteOptions {
  readonly frozenTime: string | null;
}

interface SiteFixtures {
  readonly consoleErrors: string[];
}

export const test = base.extend<SiteOptions & SiteFixtures>({
  frozenTime: [VIETNAM_TEN_AM_SAME_DAY_IS_OPEN, { option: true }],
  context: async ({ context, baseURL, frozenTime }, use) => {
    if (frozenTime !== null) {
      await context.clock.setFixedTime(frozenTime);
    }
    const siteOrigin = new URL(baseURL ?? '').origin;
    await context.route('**/*', (route) =>
      new URL(route.request().url()).origin === siteOrigin ? route.continue() : route.abort('blockedbyclient'),
    );
    await use(context);
  },
  consoleErrors: [
    async ({ context, baseURL }, use) => {
      const siteOrigin = new URL(baseURL ?? '').origin;
      const errors: string[] = [];
      const watch = (page: Page) => {
        page.on('console', (message) => {
          if (message.type() === 'error' && isSitePage(page, siteOrigin)) {
            errors.push(`${page.url()}: ${message.text()}`);
          }
        });
        page.on('pageerror', (error) => {
          if (isSitePage(page, siteOrigin)) {
            errors.push(`${page.url()}: ${error.message}`);
          }
        });
      };
      context.pages().forEach(watch);
      context.on('page', watch);
      await use(errors);
      expect(errors, 'errors in the console of site pages').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
