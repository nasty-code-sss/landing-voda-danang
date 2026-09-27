type ConfigNode = Readonly<Record<string, unknown>>;

function isConfigNode(value: unknown): value is ConfigNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeConfigLayers(base: unknown, overlay: unknown): unknown {
  if (!isConfigNode(base) || !isConfigNode(overlay)) {
    return overlay === undefined ? base : overlay;
  }
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    merged[key] = mergeConfigLayers(base[key], value);
  }
  return merged;
}
