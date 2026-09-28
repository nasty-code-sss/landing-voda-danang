import qrcode from 'qrcode-generator';
import { describe, expect, it } from 'vitest';
import { qrCodeShape } from '../../../../src/shared/lib/qr-code';

const WECHAT_LINK = 'https://u.wechat.com/mywater_danang_demo';
const RUN = /M(\d+) (\d+)h(\d+)v1h-\3z/g;
const FINDER_SIDE = 7;

function darkCellsOfPath(darkPath: string): Set<string> {
  const cells = new Set<string>();
  for (const [, x, y, length] of darkPath.matchAll(RUN)) {
    for (let offset = 0; offset < Number(length); offset += 1) {
      cells.add(`${Number(x) + offset},${y}`);
    }
  }
  return cells;
}

function darkCellsOfLibrary(text: string): Set<string> {
  const code = qrcode(0, 'M');
  code.addData(text);
  code.make();
  const cells = new Set<string>();
  for (let row = 0; row < code.getModuleCount(); row += 1) {
    for (let column = 0; column < code.getModuleCount(); column += 1) {
      if (code.isDark(row, column)) {
        cells.add(`${column},${row}`);
      }
    }
  }
  return cells;
}

describe('qrCodeShape', () => {
  it('qrCodeShape_forWeChatLink_drawsExactlyTheDarkModulesOfTheCode', () => {
    const shape = qrCodeShape(WECHAT_LINK);

    expect(darkCellsOfPath(shape.darkPath)).toEqual(darkCellsOfLibrary(WECHAT_LINK));
  });

  it('qrCodeShape_forWeChatLink_hasFinderSquaresInThreeCorners', () => {
    const shape = qrCodeShape(WECHAT_LINK);
    const cells = darkCellsOfPath(shape.darkPath);
    const far = shape.modules - FINDER_SIDE;

    for (const [x, y] of [
      [0, 0],
      [far, 0],
      [0, far],
    ] as const) {
      expect(cells.has(`${x},${y}`)).toBe(true);
      expect(cells.has(`${x + FINDER_SIDE - 1},${y + FINDER_SIDE - 1}`)).toBe(true);
      expect(cells.has(`${x + 1},${y + 1}`)).toBe(false);
    }
  });
});
