import { QualityCheck } from '@/types/pose';
import { PoseLandmark } from '@/types/pose';

const VISIBILITY_THRESHOLD = 0.6;

export function checkOcclusion(
  landmarks: PoseLandmark[],
  requiredLandmarks: number[]
): QualityCheck {
  const missingLandmarks: number[] = [];
  
  for (const idx of requiredLandmarks) {
    if (landmarks[idx].visibility < VISIBILITY_THRESHOLD) {
      missingLandmarks.push(idx);
    }
  }
  
  if (missingLandmarks.length > 0) {
    const landmarkNames = missingLandmarks.map(idx => {
      if (idx === 0) return 'face';
      if (idx === 11 || idx === 12) return 'shoulders';
      if (idx === 13 || idx === 14) return 'elbows';
      if (idx === 15 || idx === 16) return 'wrists';
      if (idx === 23 || idx === 24) return 'hips';
      if (idx === 25 || idx === 26) return 'knees';
      if (idx === 27 || idx === 28) return 'ankles';
      return 'body';
    });
    
    const uniqueNames = [...new Set(landmarkNames)];
    
    return {
      passed: false,
      message: `Show ${uniqueNames.join(', ')}`,
      severity: 'warning'
    };
  }
  
  return {
    passed: true,
    message: 'All visible',
    severity: 'info'
  };
}
