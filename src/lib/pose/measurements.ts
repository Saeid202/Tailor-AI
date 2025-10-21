import { PoseLandmark } from '@/types/pose';
import { Measurement, MeasurementType, MEASUREMENT_LABELS } from '@/types/measurements';
import { GarmentType } from '@/types/garment';

function distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate pixel to cm scale using world landmarks (in meters)
function calculateScale(worldLandmarks: PoseLandmark[], frameWidth: number): number {
  if (!worldLandmarks || worldLandmarks.length === 0) {
    // Fallback: use normalized coordinates with pixel conversion
    return frameWidth * 50; // Rough estimation
  }
  
  // Use world landmarks (in meters) for accurate scale
  const leftShoulder = worldLandmarks[11];
  const leftHip = worldLandmarks[23];
  const distanceMeters = distance3D(leftShoulder, leftHip);
  const referenceCm = 50; // Shoulder to hip is ~50cm
  
  // Convert meters to cm
  return referenceCm / (distanceMeters * 100);
}

export function calculateMeasurements(
  landmarks: PoseLandmark[],
  worldLandmarks: PoseLandmark[],
  garmentType: GarmentType,
  unit: 'cm' | 'in' = 'cm',
  frameWidth: number = 1280,
  frameHeight: number = 720
): Measurement[] {
  // Convert normalized landmarks to pixel coordinates for accurate distance calculation
  const pixelLandmarks = landmarks.map(l => ({
    ...l,
    x: l.x * frameWidth,
    y: l.y * frameHeight,
    z: l.z * frameWidth // Scale z-depth
  }));
  
  // Use world landmarks for scale if available, otherwise estimate
  const scale = worldLandmarks.length > 0 
    ? 1 // World landmarks are already in meters, convert to cm in calculations
    : calculateScale(worldLandmarks, frameWidth);
    
  const measurements: Measurement[] = [];
  const timestamp = Date.now();

  if (garmentType === 'shirt' || garmentType === 't-shirt') {
    // Use world landmarks if available for more accurate measurements
    const measureLandmarks = worldLandmarks.length > 0 ? worldLandmarks : pixelLandmarks;
    const scaleFactor = worldLandmarks.length > 0 ? 100 : scale; // Convert meters to cm or use pixel scale
    
    // Shoulder width
    const shoulderWidth = distance3D(measureLandmarks[11], measureLandmarks[12]) * scaleFactor;
    measurements.push({
      type: 'shoulder_width',
      label: MEASUREMENT_LABELS.shoulder_width,
      value: shoulderWidth,
      unit,
      confidence: Math.min(landmarks[11].visibility, landmarks[12].visibility),
      timestamp
    });

    // Neck circumference (approximation)
    const neckToShoulder = distance3D(measureLandmarks[0], measureLandmarks[11]) * scaleFactor;
    const neckCirc = neckToShoulder * Math.PI;
    measurements.push({
      type: 'neck_circumference',
      label: MEASUREMENT_LABELS.neck_circumference,
      value: neckCirc,
      unit,
      confidence: landmarks[0].visibility * 0.7,
      timestamp
    });

    // Chest (shoulder width + depth estimation)
    const depthFactor = 1 + Math.abs(measureLandmarks[11].z - measureLandmarks[12].z) / 10;
    const chest = shoulderWidth * depthFactor * 2.2;
    measurements.push({
      type: 'chest',
      label: MEASUREMENT_LABELS.chest,
      value: chest,
      unit,
      confidence: 0.75,
      timestamp
    });

    // Waist (upper)
    const waistWidth = distance3D(measureLandmarks[23], measureLandmarks[24]) * scaleFactor;
    const waist = waistWidth * 2.5;
    measurements.push({
      type: 'waist',
      label: MEASUREMENT_LABELS.waist,
      value: waist,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[24].visibility),
      timestamp
    });

    // Sleeve length
    const sleeveLeft = (distance3D(measureLandmarks[11], measureLandmarks[13]) + 
                        distance3D(measureLandmarks[13], measureLandmarks[15])) * scaleFactor;
    measurements.push({
      type: 'sleeve_length',
      label: MEASUREMENT_LABELS.sleeve_length,
      value: sleeveLeft,
      unit,
      confidence: Math.min(landmarks[11].visibility, landmarks[13].visibility, landmarks[15].visibility),
      timestamp
    });

    // Bicep
    const bicep = distance3D(measureLandmarks[11], measureLandmarks[13]) * scaleFactor * 0.6;
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
    const measureLandmarks = worldLandmarks.length > 0 ? worldLandmarks : pixelLandmarks;
    const scaleFactor = worldLandmarks.length > 0 ? 100 : scale;
    
    // Waist (lower)
    const waistWidth = distance3D(measureLandmarks[23], measureLandmarks[24]) * scaleFactor;
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
    const hipWidth = waistWidth * 1.15;
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
    const outseam = (distance3D(measureLandmarks[23], measureLandmarks[25]) + 
                     distance3D(measureLandmarks[25], measureLandmarks[27])) * scaleFactor;
    measurements.push({
      type: 'outseam',
      label: MEASUREMENT_LABELS.outseam,
      value: outseam,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[25].visibility, landmarks[27].visibility),
      timestamp
    });

    // Inseam (approximate)
    const inseamApprox = outseam * 0.75;
    measurements.push({
      type: 'inseam',
      label: MEASUREMENT_LABELS.inseam,
      value: inseamApprox,
      unit,
      confidence: 0.65,
      timestamp
    });

    // Thigh
    const thigh = distance3D(measureLandmarks[23], measureLandmarks[25]) * scaleFactor * 0.65;
    measurements.push({
      type: 'thigh',
      label: MEASUREMENT_LABELS.thigh,
      value: thigh,
      unit,
      confidence: 0.7,
      timestamp
    });

    // Calf
    const calf = distance3D(measureLandmarks[25], measureLandmarks[27]) * scaleFactor * 0.5;
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
