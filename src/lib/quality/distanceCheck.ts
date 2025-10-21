import { QualityCheck } from '@/types/pose';
import { PoseLandmark } from '@/types/pose';

export function checkDistance(
  landmarks: PoseLandmark[],
  frameHeight: number
): QualityCheck {
  // Calculate bounding box of pose
  const yCoords = landmarks.map(l => l.y);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  const poseHeight = maxY - minY;
  const heightRatio = poseHeight / frameHeight;
  
  const minRatio = 0.65;
  const maxRatio = 0.85;
  
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
