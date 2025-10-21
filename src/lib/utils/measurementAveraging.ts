import { Measurement } from '@/types/measurements';

export function averageMeasurements(measurementArrays: Measurement[][]): Measurement[] {
  if (measurementArrays.length === 0) return [];
  
  const firstArray = measurementArrays[0];
  const averaged: Measurement[] = [];
  
  firstArray.forEach((measurement, idx) => {
    const type = measurement.type;
    
    // Collect all values for this measurement type across all arrays
    const values: number[] = [];
    const confidences: number[] = [];
    
    measurementArrays.forEach(array => {
      const match = array.find(m => m.type === type);
      if (match) {
        values.push(match.value);
        confidences.push(match.confidence);
      }
    });
    
    if (values.length > 0) {
      const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      const avgConfidence = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
      
      averaged.push({
        ...measurement,
        value: avgValue,
        confidence: avgConfidence,
        timestamp: Date.now()
      });
    }
  });
  
  return averaged;
}
