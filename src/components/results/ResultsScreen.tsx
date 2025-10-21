import { MeasurementResult } from '@/types/measurements';
import { MeasurementTable } from './MeasurementTable';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Save } from 'lucide-react';
import { exportMeasurementsAsJSON } from '@/lib/utils/jsonExport';

interface ResultsScreenProps {
  result: MeasurementResult;
  onRetake: () => void;
  onToggleUnit: () => void;
  currentUnit: 'cm' | 'in';
  onSave: () => void;
}

export function ResultsScreen({ result, onRetake, onToggleUnit, currentUnit, onSave }: ResultsScreenProps) {
  const handleExport = () => {
    exportMeasurementsAsJSON(result);
  };

  return (
    <div className="w-full h-full overflow-auto bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Measurement Results</h2>
            <p className="text-muted-foreground mt-1">
              {result.garmentType.charAt(0).toUpperCase() + result.garmentType.slice(1)} measurements
            </p>
          </div>
          <Button variant="outline" onClick={onToggleUnit}>
            Switch to {currentUnit === 'cm' ? 'inches' : 'cm'}
          </Button>
        </div>

        {result.imageDataUrl && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={result.imageDataUrl}
              alt="Captured pose"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <MeasurementTable measurements={result.measurements} />

        <div className="flex gap-4">
          <Button onClick={onRetake} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
          <Button onClick={onSave} variant="default" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>Measurements captured at {result.capturedAt.toLocaleTimeString()}</p>
          <p className="mt-1">Low confidence measurements (&lt;70%) are highlighted in yellow</p>
        </div>
      </div>
    </div>
  );
}
