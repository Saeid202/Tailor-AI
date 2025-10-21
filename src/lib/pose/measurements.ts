import { PoseLandmark } from '@/types/pose';
import { Measurement, MeasurementType, MEASUREMENT_LABELS } from '@/types/measurements';
import { GarmentType } from '@/types/garment';

function distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculatePixelToCm(landmarks: PoseLandmark[]): number {
  // Use shoulder to hip distance as reference (approx 50cm for average person)
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const pixelDistance = distance3D(leftShoulder, leftHip);
  const referenceCm = 50;
  return referenceCm / pixelDistance;
}

export function calculateMeasurements(
  landmarks: PoseLandmark[],
  garmentType: GarmentType,
  unit: 'cm' | 'in' = 'cm'
): Measurement[] {
  const scale = calculatePixelToCm(landmarks);
  const measurements: Measurement[] = [];
  const timestamp = Date.now();

  if (garmentType === 'shirt' || garmentType === 't-shirt') {
    // Shoulder width
    const shoulderWidth = distance3D(landmarks[11], landmarks[12]) * scale;
    measurements.push({
      type: 'shoulder_width',
      label: MEASUREMENT_LABELS.shoulder_width,
      value: shoulderWidth,
      unit,
      confidence: Math.min(landmarks[11].visibility, landmarks[12].visibility),
      timestamp
    });

    // Neck circumference (approximation)
    const neckToShoulder = distance3D(landmarks[0], landmarks[11]) * scale;
    const neckCirc = neckToShoulder * Math.PI;
    measurements.push({
      type: 'neck_circumference',
      label: MEASUREMENT_LABELS.neck_circumference,
      value: neckCirc,
      unit,
      confidence: landmarks[0].visibility * 0.7, // Lower confidence for approximation
      timestamp
    });

    // Chest (shoulder width + depth estimation)
    const depthFactor = 1 + Math.abs(landmarks[11].z - landmarks[12].z);
    const chest = shoulderWidth * depthFactor * 2.2; // Circumference estimation
    measurements.push({
      type: 'chest',
      label: MEASUREMENT_LABELS.chest,
      value: chest,
      unit,
      confidence: 0.75,
      timestamp
    });

    // Waist (upper)
    const waistWidth = distance3D(landmarks[23], landmarks[24]) * scale;
    const waist = waistWidth * 2.5; // Circumference estimation
    measurements.push({
      type: 'waist',
      label: MEASUREMENT_LABELS.waist,
      value: waist,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[24].visibility),
      timestamp
    });

    // Sleeve length
    const sleeveLeft = (distance3D(landmarks[11], landmarks[13]) + distance3D(landmarks[13], landmarks[15])) * scale;
    measurements.push({
      type: 'sleeve_length',
      label: MEASUREMENT_LABELS.sleeve_length,
      value: sleeveLeft,
      unit,
      confidence: Math.min(landmarks[11].visibility, landmarks[13].visibility, landmarks[15].visibility),
      timestamp
    });

    // Bicep
    const bicep = distance3D(landmarks[11], landmarks[13]) * scale * 0.6; // Approximate circumference
    measurements.push({
      type: 'bicep',
      label: MEASUREMENT_LABELS.bicep,
      value: bicep,
      unit,
      confidence: 0.7,
      timestamp
    });
  }

  if (garmentType === 'pant') {
    // Waist (lower)
    const waistWidth = distance3D(landmarks[23], landmarks[24]) * scale;
    const waist = waistWidth * 2.5;
    measurements.push({
      type: 'waist_lower',
      label: MEASUREMENT_LABELS.waist_lower,
      value: waist,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[24].visibility),
      timestamp
    });

    // Hip
    const hipWidth = waistWidth * 1.15; // Hips typically wider
    const hip = hipWidth * 2.5;
    measurements.push({
      type: 'hip',
      label: MEASUREMENT_LABELS.hip,
      value: hip,
      unit,
      confidence: 0.75,
      timestamp
    });

    // Outseam (hip to ankle)
    const outseam = (distance3D(landmarks[23], landmarks[25]) + distance3D(landmarks[25], landmarks[27])) * scale;
    measurements.push({
      type: 'outseam',
      label: MEASUREMENT_LABELS.outseam,
      value: outseam,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[25].visibility, landmarks[27].visibility),
      timestamp
    });

    // Inseam (approximate from midpoint of hips to ankle)
    const hipMidY = (landmarks[23].y + landmarks[24].y) / 2;
    const inseamApprox = outseam * 0.75; // Rough estimation
    measurements.push({
      type: 'inseam',
      label: MEASUREMENT_LABELS.inseam,
      value: inseamApprox,
      unit,
      confidence: 0.65,
      timestamp
    });

    // Thigh
    const thigh = distance3D(landmarks[23], landmarks[25]) * scale * 0.65;
    measurements.push({
      type: 'thigh',
      label: MEASUREMENT_LABELS.thigh,
      value: thigh,
      unit,
      confidence: 0.7,
      timestamp
    });

    // Calf
    const calf = distance3D(landmarks[25], landmarks[27]) * scale * 0.5;
    measurements.push({
      type: 'calf',
      label: MEASUREMENT_LABELS.calf,
      value: calf,
      unit,
      confidence: 0.7,
      timestamp
    });
  }

  // Convert to inches if needed
  if (unit === 'in') {
    return measurements.map(m => ({
      ...m,
      value: m.value / 2.54
    }));
  }

  return measurements;
}
