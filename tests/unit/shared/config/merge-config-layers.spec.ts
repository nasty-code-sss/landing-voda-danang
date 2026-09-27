import { describe, expect, it } from 'vitest';
import { mergeConfigLayers } from '../../../../src/shared/config/merge-config-layers';

describe('mergeConfigLayers', () => {
  it('mergeConfigLayers_withNestedOverlay_keepsUntouchedBaseKeys', () => {
    const merged = mergeConfigLayers(
      { site: { base: '/landing', noindex: true }, order: { min_quantity: 3 } },
      { site: { url: 'http://localhost:4321' } },
    );

    expect(merged).toEqual({
      site: { base: '/landing', noindex: true, url: 'http://localhost:4321' },
      order: { min_quantity: 3 },
    });
  });

  it('mergeConfigLayers_withArrayInOverlay_replacesWholeArray', () => {
    const merged = mergeConfigLayers({ payments: ['cash', 'transfer'] }, { payments: ['cash'] });

    expect(merged).toEqual({ payments: ['cash'] });
  });

  it('mergeConfigLayers_withEmptyOverlay_returnsBase', () => {
    expect(mergeConfigLayers({ a: 1 }, {})).toEqual({ a: 1 });
  });
});
