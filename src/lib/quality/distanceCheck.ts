import { QualityCheck } from '@/types/pose';
import { PoseLandmark, BodyRegion } from '@/types/pose';

export function checkDistance(
  landmarks: PoseLandmark[],
  frameHeight: number,
  bodyRegion: BodyRegion = 'upper'
): QualityCheck {
  let relevantLandmarks: PoseLandmark[];
  let minRatio: number;
  let maxRatio: number;
  
  if (bodyRegion === 'upper') {
    // Upper body: nose (0) to hips (23, 24) - closer view for torso detail
    relevantLandmarks = landmarks.slice(0, 25);
    minRatio = 0.50;
    maxRatio = 0.70;
  } else {
    // Lower body: hips (23, 24) to ankles (27, 28) - full leg view
    relevantLandmarks = landmarks.slice(23, 29);
    minRatio = 0.60;
    maxRatio = 0.80;
  }
  
  // Calculate bounding box of relevant body region
  const yCoords = relevantLandmarks.map(l => l.y);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  const regionHeight = maxY - minY;
  const heightRatio = regionHeight;
  
  if (heightRatio < minRatio) {
    return {
      passed: false,
      message: 'Move closer',
      severity: 'warning'
    };
  }
  
  if (heightRatio > maxRatio) {
    return {
      passed: false,
      message: 'Step back',
      severity: 'warning'
    };
  }
  
  return {
    passed: true,
    message: 'Good distance',
    severity: 'info'
  };
}
