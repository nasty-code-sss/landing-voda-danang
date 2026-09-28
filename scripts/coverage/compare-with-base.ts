import { readFileSync } from 'node:fs';

const METRICS = ['statements', 'branches', 'functions', 'lines'] as const;

type Metric = (typeof METRICS)[number];

interface CoverageSummary {
  readonly total: Readonly<Record<Metric, { readonly pct: number }>>;
}

function readSummary(path: string | undefined): CoverageSummary {
  if (path === undefined) {
    throw new Error(
      'Usage: node scripts/coverage/compare-with-base.ts <base coverage-summary.json> <head coverage-summary.json>',
    );
  }
  return JSON.parse(readFileSync(path, 'utf8')) as CoverageSummary;
}

const [basePath, headPath] = process.argv.slice(2);
const base = readSummary(basePath);
const head = readSummary(headPath);
const drops = METRICS.filter((metric) => head.total[metric].pct < base.total[metric].pct);

for (const metric of METRICS) {
  console.log(`${metric}: ${base.total[metric].pct}% in the target branch, ${head.total[metric].pct}% here`);
}
if (drops.length > 0) {
  console.error(`Coverage dropped below the target branch: ${drops.join(', ')}`);
}
process.exitCode = drops.length === 0 ? 0 : 1;
