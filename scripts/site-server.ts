import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const UNKNOWN_CONTENT_TYPE = 'application/octet-stream';
const DIRECTORY_INDEX = 'index.html';
const NOT_FOUND_PAGE = '404.html';
const HTTP_OK = 200;
const HTTP_MOVED_PERMANENTLY = 301;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;
const READ_METHODS = ['GET', 'HEAD'];

export interface SiteServerOptions {
  readonly directory: string;
  readonly basePath: string;
  readonly host: string;
  readonly port: number;
}

export interface RunningSite {
  readonly url: string;
  readonly close: () => Promise<void>;
}

type Resolution =
  | { readonly kind: 'file'; readonly path: string }
  | { readonly kind: 'redirect'; readonly location: string }
  | { readonly kind: 'missing' };

function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

async function isFile(path: string): Promise<boolean> {
  return stat(path).then(
    (entry) => entry.isFile(),
    () => false,
  );
}

async function isDirectory(path: string): Promise<boolean> {
  return stat(path).then(
    (entry) => entry.isDirectory(),
    () => false,
  );
}

function insideRoot(root: string, path: string): boolean {
  const offset = relative(root, path);
  return !offset.startsWith('..') && !isAbsolute(offset);
}

async function resolveRequest(root: string, basePath: string, pathname: string): Promise<Resolution> {
  if (`${pathname}/` === basePath) {
    return { kind: 'redirect', location: basePath };
  }
  if (!pathname.startsWith(basePath)) {
    return { kind: 'missing' };
  }
  const target = resolve(root, `.${decodeURIComponent(pathname.slice(basePath.length - 1))}`);
  if (!insideRoot(root, target)) {
    return { kind: 'missing' };
  }
  if (await isDirectory(target)) {
    if (!pathname.endsWith('/')) {
      return { kind: 'redirect', location: `${pathname}/` };
    }
    const index = join(target, DIRECTORY_INDEX);
    return (await isFile(index)) ? { kind: 'file', path: index } : { kind: 'missing' };
  }
  return (await isFile(target)) ? { kind: 'file', path: target } : { kind: 'missing' };
}

function contentTypeOf(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? UNKNOWN_CONTENT_TYPE;
}

function sendFile(request: IncomingMessage, response: ServerResponse, path: string, status: number): void {
  response.writeHead(status, { 'content-type': contentTypeOf(path) });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(path).pipe(response);
}

async function sendNotFound(request: IncomingMessage, response: ServerResponse, root: string): Promise<void> {
  const page = join(root, NOT_FOUND_PAGE);
  if (await isFile(page)) {
    sendFile(request, response, page, HTTP_NOT_FOUND);
    return;
  }
  response.writeHead(HTTP_NOT_FOUND, { 'content-type': CONTENT_TYPES['.txt'] ?? UNKNOWN_CONTENT_TYPE });
  response.end('Not found');
}

async function answer(request: IncomingMessage, response: ServerResponse, root: string, basePath: string): Promise<void> {
  if (!READ_METHODS.includes(request.method ?? '')) {
    response.writeHead(HTTP_METHOD_NOT_ALLOWED, { allow: READ_METHODS.join(', ') });
    response.end();
    return;
  }
  const { pathname, search } = new URL(request.url ?? '/', 'http://site.invalid');
  const resolution = await resolveRequest(root, basePath, pathname);
  if (resolution.kind === 'redirect') {
    response.writeHead(HTTP_MOVED_PERMANENTLY, { location: `${resolution.location}${search}` });
    response.end();
    return;
  }
  if (resolution.kind === 'file') {
    sendFile(request, response, resolution.path, HTTP_OK);
    return;
  }
  await sendNotFound(request, response, root);
}

function listen(server: Server, host: string, port: number): Promise<AddressInfo> {
  return new Promise((resolveAddress, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolveAddress(server.address() as AddressInfo);
    });
  });
}

export async function startSiteServer(options: SiteServerOptions): Promise<RunningSite> {
  const root = resolve(options.directory);
  if (!(await isDirectory(root))) {
    throw new Error(`Site directory "${root}" does not exist, build the site first`);
  }
  const basePath = withTrailingSlash(options.basePath);
  const server = createServer((request, response) => {
    answer(request, response, root, basePath).catch((error: unknown) => {
      response.destroy(error instanceof Error ? error : new Error(String(error)));
    });
  });
  const address = await listen(server, options.host, options.port);
  return {
    url: `http://${options.host}:${address.port}${basePath}`,
    close: () => new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose()))),
  };
}
