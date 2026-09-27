export interface Pump {
  readonly id: string;
  readonly price: number;
}

export function findPump(pumps: readonly Pump[], id: string | null): Pump | null {
  return pumps.find((pump) => pump.id === id) ?? null;
}
