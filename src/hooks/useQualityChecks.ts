import { useEffect, useState, useRef } from 'react';
import { QualityGates } from '@/types/pose';
import { PoseResult } from '@/types/pose';
import { checkLighting } from '@/lib/quality/lightingCheck';
import { checkDistance } from '@/lib/quality/distanceCheck';
import { checkStability } from '@/lib/quality/stabilityCheck';
import { checkOcclusion } from '@/lib/quality/occlusionCheck';

export function useQualityChecks(
  poseResult: PoseResult | null,
  videoElement: HTMLVideoElement | null,
  requiredLandmarks: number[]
) {
  const [qualityGates, setQualityGates] = useState<QualityGates>({
    poseInFrame: { passed: false, message: 'Waiting...', severity: 'info' },
    distance: { passed: false, message: 'Waiting...', severity: 'info' },
    stability: { passed: false, message: 'Waiting...', severity: 'info' },
    lighting: { passed: false, message: 'Waiting...', severity: 'info' },
    occlusion: { passed: false, message: 'Waiting...', severity: 'info' }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  useEffect(() => {
    if (!poseResult || !videoElement || !canvasRef.current) {
      return;
    }

    const video = videoElement;
    const canvas = canvasRef.current;
    const { landmarks } = poseResult;

    // Run quality checks
    const poseInFrame = landmarks.length > 0 
      ? { passed: true, message: 'Pose detected', severity: 'info' as const }
      : { passed: false, message: 'No pose detected', severity: 'warning' as const };

    const distance = checkDistance(landmarks, video.videoHeight);
    const stability = checkStability(landmarks, video.videoWidth, video.videoHeight);
    const lighting = checkLighting(video, canvas);
    const occlusion = checkOcclusion(landmarks, requiredLandmarks);

    setQualityGates({
      poseInFrame,
      distance,
      stability,
      lighting,
      occlusion
    });
  }, [poseResult, videoElement, requiredLandmarks]);

  const allChecksPassed = Object.values(qualityGates).every(check => check.passed);

  return { qualityGates, allChecksPassed };
}
