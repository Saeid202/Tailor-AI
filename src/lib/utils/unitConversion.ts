export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function convertMeasurement(value: number, fromUnit: 'cm' | 'in', toUnit: 'cm' | 'in'): number {
  if (fromUnit === toUnit) return value;
  return fromUnit === 'cm' ? cmToInches(value) : inchesToCm(value);
}

export function formatMeasurement(value: number, unit: 'cm' | 'in'): string {
  return `${value.toFixed(1)} ${unit}`;
}
