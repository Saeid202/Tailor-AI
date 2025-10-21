import { Measurement } from '@/types/measurements';
import { formatMeasurement } from '@/lib/utils/unitConversion';

interface MeasurementChipsProps {
  measurements: Measurement[];
}

export function MeasurementChips({ measurements }: MeasurementChipsProps) {
  if (measurements.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-4 right-4 flex flex-wrap gap-2 justify-center">
      {measurements.map((measurement) => {
        const confidence = measurement.confidence;
        const colorClass =
          confidence > 0.8
            ? 'bg-green-500/30 text-green-100 border-green-400/50'
            : confidence > 0.6
            ? 'bg-yellow-500/30 text-yellow-100 border-yellow-400/50'
            : 'bg-gray-500/30 text-gray-100 border-gray-400/50';

        return (
          <div
            key={measurement.type}
            className={`px-3 py-2 rounded-full backdrop-blur-md border text-sm font-medium transition-all ${colorClass}`}
          >
            {measurement.label}: {formatMeasurement(measurement.value, measurement.unit)}
          </div>
        );
      })}
    </div>
  );
}
