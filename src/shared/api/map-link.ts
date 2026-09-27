export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

export function mapSearchLink(searchUrl: string, point: GeoPoint, decimals: number): string {
  const query = `${point.latitude.toFixed(decimals)},${point.longitude.toFixed(decimals)}`;
  return `${searchUrl}${encodeURIComponent(query)}`;
}
