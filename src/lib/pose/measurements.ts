import { PoseLandmark } from '@/types/pose';
import { Measurement, MeasurementType, MEASUREMENT_LABELS } from '@/types/measurements';
import { GarmentType } from '@/types/garment';

function distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate scale factor with improved calibration logic
function calculateScale(
  worldLandmarks: PoseLandmark[], 
  landmarks: PoseLandmark[],
  frameWidth: number,
  frameHeight: number,
  userHeightCm?: number
): number {
  // Priority 1: Use user-provided height for best calibration
  if (userHeightCm && userHeightCm > 0 && worldLandmarks && worldLandmarks.length > 0) {
    const nose = worldLandmarks[0];
    const leftAnkle = worldLandmarks[27];
    const rightAnkle = worldLandmarks[28];
    
    // Use the ankle with better visibility
    const ankle = leftAnkle.visibility > rightAnkle.visibility ? leftAnkle : rightAnkle;
    
    if (ankle.visibility > 0.5) {
      const measuredHeightMeters = Math.abs(nose.y - ankle.y);
      if (measuredHeightMeters > 0.5 && measuredHeightMeters < 2.5) { // Sanity check (50cm-250cm)
        // Direct calibration: user's actual height / measured height
        const scaleFactor = userHeightCm / (measuredHeightMeters * 100);
        console.log('Using height calibration:', scaleFactor, 'cm per meter');
        return scaleFactor;
      }
    }
  }
  
  // Priority 2: Use world landmarks with anatomical references
  if (worldLandmarks && worldLandmarks.length > 0) {
    const leftShoulder = worldLandmarks[11];
    const rightShoulder = worldLandmarks[12];
    const leftHip = worldLandmarks[23];
    const rightHip = worldLandmarks[24];
    
    // Use shoulder-to-hip distance (more stable than full height)
    if (leftShoulder.visibility > 0.6 && leftHip.visibility > 0.6) {
      const torsoLength = distance3D(leftShoulder, leftHip);
      
      // Average torso length is ~45-55cm depending on height
      // Use conservative estimate: 50cm for average adult
      const estimatedTorsoLengthCm = userHeightCm ? (userHeightCm * 0.3) : 50;
      
      if (torsoLength > 0.2 && torsoLength < 0.8) { // Sanity check (20cm-80cm)
        const scaleFactor = estimatedTorsoLengthCm / (torsoLength * 100);
        console.log('Using torso calibration:', scaleFactor, 'cm per meter');
        return scaleFactor;
      }
    }
  }
  
  // Priority 3: Estimate from frame dimensions and typical human proportions
  // Assume person fills ~70% of frame height and average height is 170cm
  const estimatedPersonHeightInFrame = frameHeight * 0.7;
  const estimatedRealHeightCm = userHeightCm || 170;
  const pixelsPerCm = estimatedPersonHeightInFrame / estimatedRealHeightCm;
  
  console.warn('Using fallback calibration based on frame size');
  return pixelsPerCm;
}

export function calculateMeasurements(
  landmarks: PoseLandmark[],
  worldLandmarks: PoseLandmark[],
  garmentType: GarmentType,
  unit: 'cm' | 'in' = 'cm',
  frameWidth: number = 1280,
  frameHeight: number = 720,
  userHeightCm?: number
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
    ? calculateScale(worldLandmarks, landmarks, frameWidth, frameHeight, userHeightCm)
    : calculateScale(worldLandmarks, landmarks, frameWidth, frameHeight, userHeightCm);
    
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

    // Chest circumference using shoulder width and depth
    // Account for 3D body shape: chest is roughly circular
    const shoulderDepth = Math.abs(measureLandmarks[11].z - measureLandmarks[12].z);
    const estimatedChestDepth = shoulderWidth * 0.7; // Chest depth is ~70% of shoulder width
    const chest = (shoulderWidth + estimatedChestDepth) * Math.PI / 2; // Semi-ellipse circumference
    measurements.push({
      type: 'chest',
      label: MEASUREMENT_LABELS.chest,
      value: chest,
      unit,
      confidence: 0.75,
      timestamp
    });

    // Waist circumference - using hip landmarks as proxy
    const waistWidth = distance3D(measureLandmarks[23], measureLandmarks[24]) * scaleFactor;
    const estimatedWaistDepth = waistWidth * 0.6; // Waist depth is ~60% of width
    const waist = (waistWidth + estimatedWaistDepth) * Math.PI / 2;
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
    
    // Waist circumference at hip level
    const waistWidth = distance3D(measureLandmarks[23], measureLandmarks[24]) * scaleFactor;
    const estimatedWaistDepth = waistWidth * 0.6;
    const waist = (waistWidth + estimatedWaistDepth) * Math.PI / 2;
    measurements.push({
      type: 'waist_lower',
      label: MEASUREMENT_LABELS.waist_lower,
      value: waist,
      unit,
      confidence: Math.min(landmarks[23].visibility, landmarks[24].visibility),
      timestamp
    });

    // Hip circumference - typically wider than waist
    const hipWidth = waistWidth * 1.15;
    const estimatedHipDepth = hipWidth * 0.7;
    const hip = (hipWidth + estimatedHipDepth) * Math.PI / 2;
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
