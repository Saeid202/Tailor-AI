import { QualityCheck } from '@/types/pose';
import { PoseLandmark } from '@/types/pose';

interface PoseHistory {
  landmarks: PoseLandmark[];
  timestamp: number;
}

const history: PoseHistory[] = [];
const STABILITY_WINDOW = 1000; // ms
const MAX_JITTER = 15; // pixels
const KEY_LANDMARKS = [0, 11, 12, 23, 24]; // nose, shoulders, hips

export function checkStability(landmarks: PoseLandmark[], frameWidth: number = 1280, frameHeight: number = 720): QualityCheck {
  const now = Date.now();
  
  // Add current pose to history
  history.push({ landmarks, timestamp: now });
  
  // Remove old entries
  while (history.length > 0 && history[0].timestamp < now - STABILITY_WINDOW) {
    history.shift();
  }
  
  // Need at least 15 frames for stability check
  if (history.length < 15) {
    return {
      passed: false,
      message: 'Hold still...',
      severity: 'info'
    };
  }
  
  // Calculate jitter for key landmarks
  let totalJitter = 0;
  let count = 0;
  
  for (const landmarkIdx of KEY_LANDMARKS) {
    const positions = history.map(h => h.landmarks[landmarkIdx]);
    
    const xValues = positions.map(p => p.x);
    const yValues = positions.map(p => p.y);
    
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    
    const xVariance = xValues.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) / xValues.length;
    const yVariance = yValues.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / yValues.length;
    
    // Convert normalized variance to pixel jitter
    const jitter = Math.sqrt(xVariance * frameWidth * frameWidth + yVariance * frameHeight * frameHeight);
    totalJitter += jitter;
    count++;
  }
  
  const avgJitter = totalJitter / count;
  
  if (avgJitter > MAX_JITTER) {
    return {
      passed: false,
      message: 'Hold still...',
      severity: 'warning'
    };
  }
  
  return {
    passed: true,
    message: 'Stable pose',
    severity: 'info'
  };
}

export function resetStabilityHistory() {
  history.length = 0;
}
