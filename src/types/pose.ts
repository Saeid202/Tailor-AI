export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseResult {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
  timestamp: number;
}

export interface QualityCheck {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface QualityGates {
  poseInFrame: QualityCheck;
  distance: QualityCheck;
  stability: QualityCheck;
  lighting: QualityCheck;
  occlusion: QualityCheck;
}
