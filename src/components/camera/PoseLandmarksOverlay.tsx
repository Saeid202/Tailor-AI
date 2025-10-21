import { useEffect, useRef } from 'react';
import { PoseLandmark } from '@/types/pose';

interface PoseLandmarksOverlayProps {
  landmarks: PoseLandmark[];
  videoWidth: number;
  videoHeight: number;
}

// MediaPipe Pose connections
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [24, 26], [26, 28], // Legs
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8] // Face
];

export function PoseLandmarksOverlay({ landmarks, videoWidth, videoHeight }: PoseLandmarksOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections (skeleton)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    
    POSE_CONNECTIONS.forEach(([start, end]) => {
      if (start < landmarks.length && end < landmarks.length) {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];
        
        if (startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startLandmark.x * videoWidth, startLandmark.y * videoHeight);
          ctx.lineTo(endLandmark.x * videoWidth, endLandmark.y * videoHeight);
          ctx.stroke();
        }
      }
    });

    // Draw landmarks (dots)
    landmarks.forEach((landmark, idx) => {
      const x = landmark.x * videoWidth;
      const y = landmark.y * videoHeight;
      
      // Color based on visibility
      if (landmark.visibility > 0.8) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      } else if (landmark.visibility > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      }
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [landmarks, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
