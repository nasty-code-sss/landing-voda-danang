import qrcode from 'qrcode-generator';

const SMALLEST_FITTING_VERSION = 0;
const ERROR_CORRECTION = 'M';

export const QR_QUIET_ZONE_MODULES = 4;

export interface QrCodeShape {
  readonly modules: number;
  readonly darkPath: string;
}

function darkRunsOfRow(isDark: (column: number) => boolean, modules: number, row: number): string[] {
  const runs: string[] = [];
  let column = 0;
  while (column < modules) {
    if (!isDark(column)) {
      column += 1;
      continue;
    }
    const start = column;
    while (column < modules && isDark(column)) {
      column += 1;
    }
    const length = column - start;
    runs.push(`M${start} ${row}h${length}v1h-${length}z`);
  }
  return runs;
}

export function qrCodeShape(text: string): QrCodeShape {
  const code = qrcode(SMALLEST_FITTING_VERSION, ERROR_CORRECTION);
  code.addData(text);
  code.make();
  const modules = code.getModuleCount();
  const rows = Array.from({ length: modules }, (_, row) =>
    darkRunsOfRow((column) => code.isDark(row, column), modules, row).join(''),
  );
  return { modules, darkPath: rows.join('') };
}
