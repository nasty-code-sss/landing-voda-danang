import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { assertDictionariesComplete, parseDictionary, type Dictionaries } from '../i18n/dictionary';
import { mergeConfigLayers } from './merge-config-layers';
import { parseSiteConfig, SiteConfigError, type SiteConfig } from './site-config';

const APP_ENVIRONMENTS = ['dev', 'stage', 'prod'] as const;
const CONFIG_DIRECTORY = 'config';
const BASE_CONFIG_FILE = 'base.yml';
const DICTIONARY_DIRECTORY = 'i18n';

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export interface Settings {
  readonly environment: AppEnvironment;
  readonly config: SiteConfig;
  readonly dictionaries: Dictionaries;
}

function isAppEnvironment(value: string | undefined): value is AppEnvironment {
  return (APP_ENVIRONMENTS as readonly (string | undefined)[]).includes(value);
}

function readAppEnvironment(value: string | undefined): AppEnvironment {
  if (!isAppEnvironment(value)) {
    throw new SiteConfigError(`APP_ENV must be one of ${APP_ENVIRONMENTS.join(', ')}, got "${value ?? ''}"`);
  }
  return value;
}

function readYamlFile(path: string): unknown {
  return parse(readFileSync(path, 'utf8')) ?? {};
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadDictionaries(projectRoot: string, languages: readonly string[]): Dictionaries {
  return Object.fromEntries(
    languages.map((language) => [
      language,
      parseDictionary(language, readJsonFile(join(projectRoot, DICTIONARY_DIRECTORY, `${language}.json`))),
    ]),
  );
}

export function loadSettings(projectRoot: string, appEnvironment: string | undefined): Settings {
  const environment = readAppEnvironment(appEnvironment);
  const configDirectory = join(projectRoot, CONFIG_DIRECTORY);
  const layered = mergeConfigLayers(
    readYamlFile(join(configDirectory, BASE_CONFIG_FILE)),
    readYamlFile(join(configDirectory, `${environment}.yml`)),
  );
  const config = parseSiteConfig(layered);
  const dictionaries = loadDictionaries(projectRoot, config.languages.supported);
  assertDictionariesComplete(dictionaries);
  return { environment, config, dictionaries };
}
