import { saveAs } from 'file-saver';
import { MeasurementResult } from '@/types/measurements';

interface ExportMetadata {
  cameraResolution?: string;
  estimatedDistance?: number;
  calibrationFactor?: number;
  userHeight?: number;
}

export function exportMeasurementsAsJSON(
  result: MeasurementResult,
  metadata?: ExportMetadata
) {
  const exportData = {
    version: '1.0',
    timestamp: result.capturedAt.toISOString(),
    garmentType: result.garmentType,
    unit: result.measurements[0]?.unit || 'cm',
    measurements: result.measurements.map(m => ({
      type: m.type,
      label: m.label,
      value: m.value,
      confidence: m.confidence,
      unit: m.unit
    })),
    metadata: metadata || {},
    image: result.imageDataUrl
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const filename = `measurements-${result.garmentType}-${Date.now()}.json`;
  saveAs(blob, filename);
}
