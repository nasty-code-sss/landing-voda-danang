import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { startSiteServer, type RunningSite } from '../../scripts/site-server.ts';
import { artifactConfig, expect, messageOf, sendLink, test as siteTest, withPlainSpaces } from '../fixtures/site-test.ts';

const CHANGED_BRAND = 'biwa';
const CHANGED_PRICE = 55000;
const BUILD_ENVIRONMENT = 'prod';
const LOCAL_HOST = '127.0.0.1';
const ANY_FREE_PORT = 0;
const BUILD_TIMEOUT_MS = 300_000;
const ASTRO_CLI = join('node_modules', 'astro', 'bin', 'astro.mjs');

interface RawBrand {
  readonly id: string;
  readonly price: number;
}

function writePriceOverlay(directory: string): string {
  const base = parse(readFileSync(join('config', 'base.yml'), 'utf8')) as { brands: RawBrand[] };
  const brands = base.brands.map((brand) => (brand.id === CHANGED_BRAND ? { ...brand, price: CHANGED_PRICE } : brand));
  const overlay = join(directory, 'price-overlay.yml');
  writeFileSync(overlay, stringify({ brands }));
  return overlay;
}

function buildSite(directory: string, overlay: string): string {
  const output = join(directory, 'site');
  execFileSync(process.execPath, [ASTRO_CLI, 'build', '--outDir', output], {
    env: { ...process.env, APP_ENV: BUILD_ENVIRONMENT, APP_CONFIG_OVERLAY: overlay },
    stdio: 'pipe',
  });
  return output;
}

const test = siteTest.extend<object, { priceSite: RunningSite }>({
  priceSite: [
    async ({}, use) => {
      const workspace = mkdtempSync(join(tmpdir(), 'price-scenario-'));
      const siteDirectory = buildSite(workspace, writePriceOverlay(workspace));
      const site = await startSiteServer({
        directory: siteDirectory,
        basePath: artifactConfig.site.base,
        host: LOCAL_HOST,
        port: ANY_FREE_PORT,
      });
      await use(site);
      await site.close();
      rmSync(workspace, { recursive: true, force: true });
    },
    { scope: 'worker', timeout: BUILD_TIMEOUT_MS },
  ],
  baseURL: async ({ priceSite }, use) => {
    await use(priceSite.url);
  },
});

test.describe('scenario 16: price comes from the config', () => {
  test('new Biwa price in the config reaches the card, the deposit example, the total and the message', async ({ page }) => {
    await page.goto('en/');

    const card = page.locator('.price-card', { has: page.locator(`[data-choose-brand="${CHANGED_BRAND}"]`) });
    expect(withPlainSpaces(await card.locator('.price-card-price').innerText())).toBe('₫55,000 a bottle');
    const example = withPlainSpaces(await page.locator('#deposit .example-column.featured').innerText());
    expect(example).toContain('₫165,000');
    expect(example).toContain('₫315,000');

    await page.locator(`input[name="brand"][value="${CHANGED_BRAND}"]`).check();
    await page.locator('[data-address-input]').fill('Kiet 12');

    expect(withPlainSpaces(await page.locator('[data-total="total"]').innerText())).toBe('₫315,000');
    const message = messageOf((await sendLink(page, 'whatsapp').getAttribute('href')) ?? '');
    expect(message).toContain('Total: ₫315,000 (water ₫165,000 + deposit ₫150,000)');
    expect(message).toContain('Tổng: 315.000 ₫');
  });
});
