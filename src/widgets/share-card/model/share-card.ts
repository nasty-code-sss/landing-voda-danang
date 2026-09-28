import type { ShareElement, ShareImageSize } from '../../../shared/api/share-image';
import { BOTTLE_SCENE_HEIGHT, BOTTLE_SCENE_SVG, BOTTLE_SCENE_WIDTH } from '../../../shared/ui/bottle-scene';

export interface ShareCardContent {
  readonly brand: string;
  readonly tagline: string;
  readonly title: string;
  readonly price: string;
  readonly messengers: readonly string[];
  readonly fontStack: string;
  readonly size: ShareImageSize;
}

const COLORS = {
  background: '#eef6fb',
  ink: '#0f2a3a',
  muted: '#4a6272',
  sea: '#0e6fa8',
  seaDark: '#0a5480',
  surface: '#ffffff',
} as const;
const PADDING = 64;
const ILLUSTRATION_SCALE = 1.15;
const SVG_DATA_PREFIX = 'data:image/svg+xml;base64,';

function element(type: string, style: Readonly<Record<string, unknown>>, children?: unknown, extra = {}): ShareElement {
  return { type, props: { style, children, ...extra } };
}

function illustrationSource(): string {
  return `${SVG_DATA_PREFIX}${Buffer.from(BOTTLE_SCENE_SVG).toString('base64')}`;
}

function messengerChips(messengers: readonly string[]): ShareElement {
  return element(
    'div',
    { display: 'flex', flexWrap: 'wrap', gap: 12 },
    messengers.map((name) =>
      element(
        'div',
        {
          display: 'flex',
          flexShrink: 0,
          padding: '8px 22px',
          borderRadius: 999,
          background: COLORS.sea,
          color: COLORS.surface,
          fontSize: 26,
          fontWeight: 800,
        },
        name,
      ),
    ),
  );
}

export function shareCard(content: ShareCardContent): ShareElement {
  const text = element('div', { display: 'flex', flexDirection: 'column', flex: 1, gap: 20, paddingRight: 24 }, [
    element('div', { display: 'flex', flexDirection: 'column' }, [
      element('div', { fontSize: 40, fontWeight: 800, color: COLORS.seaDark }, content.brand),
      element('div', { fontSize: 24, fontWeight: 600, color: COLORS.muted }, content.tagline),
    ]),
    element('div', { fontSize: 54, fontWeight: 800, color: COLORS.ink, lineHeight: 1.2 }, content.title),
    element('div', { fontSize: 32, fontWeight: 600, color: COLORS.muted }, content.price),
    messengerChips(content.messengers),
  ]);
  const illustration = element('img', {}, undefined, {
    src: illustrationSource(),
    width: BOTTLE_SCENE_WIDTH * ILLUSTRATION_SCALE,
    height: BOTTLE_SCENE_HEIGHT * ILLUSTRATION_SCALE,
  });
  return element(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      width: content.size.width,
      height: content.size.height,
      padding: PADDING,
      background: COLORS.background,
      fontFamily: content.fontStack,
    },
    [text, illustration],
  );
}
