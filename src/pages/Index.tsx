import { useState } from 'react';
import { GarmentType } from '@/types/garment';
import { Measurement, MeasurementResult } from '@/types/measurements';
import { GarmentTabs } from '@/components/layout/GarmentTabs';
import { CameraView } from '@/components/camera/CameraView';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { HelpModal } from '@/components/ui/HelpModal';
import { convertMeasurement } from '@/lib/utils/unitConversion';
import { resetStabilityHistory } from '@/lib/quality/stabilityCheck';

type Stage = 'camera' | 'results';

const Index = () => {
  const [garmentType, setGarmentType] = useState<GarmentType>('shirt');
  const [stage, setStage] = useState<Stage>('camera');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [result, setResult] = useState<MeasurementResult | null>(null);

  const handleCapture = (measurements: Measurement[], imageDataUrl: string) => {
    const capturedResult: MeasurementResult = {
      garmentType,
      measurements,
      capturedAt: new Date(),
      imageDataUrl
    };
    setResult(capturedResult);
    setStage('results');
    resetStabilityHistory();
  };

  const handleRetake = () => {
    setStage('camera');
    setResult(null);
    resetStabilityHistory();
  };

  const handleToggleUnit = () => {
    const newUnit: 'cm' | 'in' = unit === 'cm' ? 'in' : 'cm';
    setUnit(newUnit);

    if (result) {
      const convertedMeasurements: Measurement[] = result.measurements.map(m => ({
        ...m,
        value: convertMeasurement(m.value, m.unit, newUnit),
        unit: newUnit
      }));
      setResult({
        ...result,
        measurements: convertedMeasurements
      });
    }
  };

  const handleGarmentChange = (newGarmentType: GarmentType) => {
    setGarmentType(newGarmentType);
    setStage('camera');
    setResult(null);
    resetStabilityHistory();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Tailor AI</h1>
              <p className="text-sm text-muted-foreground">AI-powered body measurements</p>
            </div>
            <HelpModal />
          </div>

          {stage === 'camera' && (
            <GarmentTabs value={garmentType} onValueChange={handleGarmentChange} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {stage === 'camera' ? (
          <CameraView
            garmentType={garmentType}
            unit={unit}
            onCapture={handleCapture}
          />
        ) : result ? (
          <ResultsScreen
            result={result}
            onRetake={handleRetake}
            onToggleUnit={handleToggleUnit}
            currentUnit={unit}
          />
        ) : null}
      </main>
    </div>
  );
};

export default Index;
