import { requiredEnvironment } from './required-environment.ts';
import { startSiteServer } from './site-server.ts';

const directory = requiredEnvironment('E2E_SITE_DIR');
const address = new URL(requiredEnvironment('E2E_BASE_URL'));
const site = await startSiteServer({
  directory,
  basePath: address.pathname,
  host: address.hostname,
  port: Number(address.port),
});

console.log(`Serving ${directory} at ${site.url}`);
