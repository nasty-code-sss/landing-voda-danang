import { describe, expect, it } from 'vitest';
import { createBuilderData } from '../../../../../src/features/order-builder/model/builder-data';
import { readBuilderState, type BuilderState } from '../../../../../src/features/order-builder/model/builder-state';
import { buildBuilderView } from '../../../../../src/features/order-builder/model/builder-view';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

const dictionaries = projectDictionaries();
const english = createBuilderData(configFixture(), dictionaries, 'en');
const russian = createBuilderData(configFixture(), dictionaries, 'ru');
const VIETNAM_NOON = new Date('2026-09-27T05:00:00Z');
const VIETNAM_FOUR_PM = new Date('2026-09-27T09:00:00Z');
const NO_BREAK_SPACES = /[\u00A0\u202F]/g;

function stateOf(overrides: Partial<BuilderState>, data = english): BuilderState {
  return { ...readBuilderState(new URLSearchParams(), data), ...overrides };
}

describe('buildBuilderView', () => {
  it('buildBuilderView_scenario1_englishBiwaThreeWithLocation_buildsWhatsappLinkWithVietnameseCopy', () => {
    const view = buildBuilderView(
      stateOf({ brandId: 'biwa', coordinates: { latitude: 16.054123, longitude: 108.247311 } }),
      english,
      VIETNAM_NOON,
    );
    const whatsapp = view.sendLinks[0];
    const sentText = (new URL(whatsapp?.href ?? '').searchParams.get('text') ?? '').replace(NO_BREAK_SPACES, ' ');

    expect(view.ready).toBe(true);
    expect(whatsapp?.id).toBe('whatsapp');
    expect(whatsapp?.href.startsWith('https://wa.me/84000000000?text=')).toBe(true);
    expect(sentText).toContain('Biwa');
    expect(sentText).toContain('x 3');
    expect(sentText).toContain('Total: ₫300,000');
    expect(sentText).toContain('query=16.05412%2C108.24731');
    expect(sentText).toContain('Tổng: 300.000 ₫');
  });

  it('buildBuilderView_withoutBrandAndPoint_isNotReadyAndNamesBothGaps', () => {
    const view = buildBuilderView(stateOf({}), english, VIETNAM_NOON);

    expect(view.ready).toBe(false);
    expect(view.missing).toEqual(['the water', 'your location or address']);
    expect(view.message).toBe('');
    expect(view.sendLinks.every((link) => !link.href.includes('text='))).toBe(true);
  });

  it('buildBuilderView_withBrandButNoPoint_showsMessageButStaysNotReady', () => {
    const view = buildBuilderView(stateOf({ brandId: 'biwa' }), english, VIETNAM_NOON);

    expect(view.ready).toBe(false);
    expect(view.missing).toEqual(['your location or address']);
    expect(view.message).toContain('Biwa');
  });

  it('buildBuilderView_inRussian_putsTelegramFirst', () => {
    const view = buildBuilderView(stateOf({ brandId: 'biwa', address: 'Kiet 12' }, russian), russian, VIETNAM_NOON);

    expect(view.sendLinks.map((link) => link.id)).toEqual(['telegram', 'whatsapp', 'zalo']);
  });

  it('buildBuilderView_refillOfBiwa_hidesPumpAndDeposit', () => {
    const view = buildBuilderView(stateOf({ mode: 'refill', brandId: 'biwa', pumpId: 'usb' }), english, VIETNAM_NOON);

    expect(view.pumpOffered).toBe(false);
    expect(view.total?.deposit).toBeNull();
    expect(view.total?.pump).toBeNull();
  });

  it('buildBuilderView_laVie_hidesPumpEvenInFirstOrder', () => {
    const view = buildBuilderView(stateOf({ brandId: 'lavie', pumpId: 'usb' }), english, VIETNAM_NOON);

    expect(view.pumpOffered).toBe(false);
    expect(view.total?.pump).toBeNull();
  });

  it('buildBuilderView_atMinimum_showsPluralMinimumHintInRussian', () => {
    const view = buildBuilderView(stateOf({}, russian), russian, VIETNAM_NOON);

    expect(view.atMinimum).toBe(true);
    expect(view.quantityHint).toBe('Минимальный заказ: 3 бутыли');
  });

  it('buildBuilderView_afterCutoff_closesTodayWithNote', () => {
    const view = buildBuilderView(stateOf({}), english, VIETNAM_FOUR_PM);

    expect(view.sameDayOpen).toBe(false);
    expect(view.todayClosedNote).toBe('Orders after 14:00 are delivered tomorrow.');
  });
});
