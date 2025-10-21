export type MeasurementType = 
  // Upper body
  | 'shoulder_width' | 'neck_circumference' | 'chest' 
  | 'waist' | 'sleeve_length' | 'bicep'
  // Lower body
  | 'waist_lower' | 'hip' | 'outseam' 
  | 'inseam' | 'thigh' | 'calf';

export interface Measurement {
  type: MeasurementType;
  label: string;
  value: number;
  unit: 'cm' | 'in';
  confidence: number;
  timestamp: number;
}

export interface MeasurementResult {
  garmentType: string;
  measurements: Measurement[];
  capturedAt: Date;
  imageDataUrl?: string;
}

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  shoulder_width: 'Shoulder Width',
  neck_circumference: 'Neck Circumference',
  chest: 'Chest',
  waist: 'Waist',
  sleeve_length: 'Sleeve Length',
  bicep: 'Bicep',
  waist_lower: 'Waist',
  hip: 'Hip',
  outseam: 'Outseam',
  inseam: 'Inseam',
  thigh: 'Thigh',
  calf: 'Calf'
};
