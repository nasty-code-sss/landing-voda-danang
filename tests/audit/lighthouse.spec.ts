import { mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { chromium, expect, test } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { artifactConfig } from '../fixtures/site-test.ts';

const MINIMUM_SCORES = { performance: 0.9, accessibility: 0.95, seo: 0.95 };
const SKIPPED_AUDITS = ['is-crawlable'];
const SCRIPT_BUDGET_BYTES = 50 * 1024;
const HEADLESS_CHROME = ['--headless=new'];
const PROFILE_DIRECTORY = 'chrome-profile';
const AUDIT_TIMEOUT_MS = 120_000;
const SCRIPT_RESOURCE = 'Script';

type Category = keyof typeof MINIMUM_SCORES;
type Scores = Record<Category, number>;
type Report = NonNullable<Awaited<ReturnType<typeof lighthouse>>>['lhr'];

interface NetworkRequest {
  readonly url: string;
  readonly resourceType?: string;
}

async function auditPage(url: string): Promise<Report> {
  const profile = test.info().outputPath(PROFILE_DIRECTORY);
  mkdirSync(profile, { recursive: true });
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: HEADLESS_CHROME, userDataDir: profile });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: Object.keys(MINIMUM_SCORES),
      skipAudits: SKIPPED_AUDITS,
      logLevel: 'error',
    });
    if (result === undefined) {
      throw new Error(`Lighthouse returned no report for ${url}`);
    }
    return result.lhr;
  } finally {
    chrome.kill();
  }
}

function scoresOf(report: Report): Scores {
  const categories = Object.keys(MINIMUM_SCORES) as Category[];
  const pairs = categories.map((category) => [category, report.categories[category]?.score ?? 0]);
  return Object.fromEntries(pairs) as Scores;
}

async function gzippedSize(url: string): Promise<number> {
  const body = Buffer.from(await (await fetch(url)).arrayBuffer());
  return gzipSync(body).length;
}

async function gzippedScriptBytes(report: Report): Promise<number> {
  const details = report.audits['network-requests']?.details as { items?: NetworkRequest[] } | undefined;
  const scripts = (details?.items ?? []).filter((request) => request.resourceType === SCRIPT_RESOURCE);
  const sizes = await Promise.all(scripts.map((script) => gzippedSize(script.url)));
  return sizes.reduce((total, size) => total + size, 0);
}

test.describe.configure({ mode: 'serial', timeout: AUDIT_TIMEOUT_MS });

test.describe('lighthouse on a phone', () => {
  for (const language of artifactConfig.languages.supported) {
    test(`/${language}/ meets the brief on speed, accessibility, SEO and script size`, async ({ baseURL }) => {
      const report = await auditPage(`${baseURL}${language}/`);
      const scores = scoresOf(report);
      const scriptBytes = await gzippedScriptBytes(report);
      const summary = JSON.stringify({ ...scores, scriptBytes }, null, 2);
      await test.info().attach(`lighthouse-${language}.json`, { body: summary, contentType: 'application/json' });

      expect(report.runtimeError).toBeUndefined();
      for (const [category, minimum] of Object.entries(MINIMUM_SCORES)) {
        expect(scores[category as Category], category).toBeGreaterThanOrEqual(minimum);
      }
      expect(scriptBytes, 'gzipped JavaScript of the page').toBeLessThanOrEqual(SCRIPT_BUDGET_BYTES);
    });
  }
});
