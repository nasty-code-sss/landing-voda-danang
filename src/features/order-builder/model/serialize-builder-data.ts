import { scriptJson } from '../../../shared/lib/script-json';
import type { BuilderData } from './builder-data';

export function serializeBuilderData(data: BuilderData): string {
  return scriptJson(data);
}

export function parseBuilderData(serialized: string): BuilderData {
  return JSON.parse(serialized) as BuilderData;
}
