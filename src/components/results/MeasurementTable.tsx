import { Measurement } from '@/types/measurements';
import { formatMeasurement } from '@/lib/utils/unitConversion';

interface MeasurementTableProps {
  measurements: Measurement[];
}

export function MeasurementTable({ measurements }: MeasurementTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Measurement</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Value</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {measurements.map((measurement) => (
            <tr
              key={measurement.type}
              className={`hover:bg-muted/50 transition-colors ${
                measurement.confidence < 0.7 ? 'bg-yellow-500/5' : ''
              }`}
            >
              <td className="px-4 py-3 text-sm font-medium">{measurement.label}</td>
              <td className="px-4 py-3 text-sm text-right tabular-nums">
                {formatMeasurement(measurement.value, measurement.unit)}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        measurement.confidence > 0.8
                          ? 'bg-green-500'
                          : measurement.confidence > 0.6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${measurement.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(measurement.confidence * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
