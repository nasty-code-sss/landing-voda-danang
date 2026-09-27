import type { GeoPoint } from './map-link';

export interface GeolocationOptions {
  readonly timeoutMs: number;
  readonly maximumAgeMs: number;
}

export function requestCurrentPoint(options: GeolocationOptions): Promise<GeoPoint | null> {
  if (!('geolocation' in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: options.timeoutMs, maximumAge: options.maximumAgeMs },
    );
  });
}
