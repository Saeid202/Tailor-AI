import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { PoseResult } from '@/types/pose';

export function usePoseDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [poseResult, setPoseResult] = useState<PoseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let mounted = true;

    const initializePoseDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (mounted) {
          poseLandmarkerRef.current = poseLandmarker;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize pose detection:', err);
        if (mounted) {
          setError('Failed to load pose detection model');
          setIsLoading(false);
        }
      }
    };

    initializePoseDetection();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!poseLandmarkerRef.current || !videoRef.current || isLoading) return;

    const detectPose = () => {
      const video = videoRef.current;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !poseLandmarker || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
        return;
      }

      const startTimeMs = performance.now();
      const result = poseLandmarker.detectForVideo(video, startTimeMs);

      if (result.landmarks && result.landmarks.length > 0) {
        setPoseResult({
          landmarks: result.landmarks[0].map(l => ({
            x: l.x,
            y: l.y,
            z: l.z || 0,
            visibility: l.visibility || 1
          })),
          worldLandmarks: result.worldLandmarks?.[0]?.map(l => ({
            x: l.x,
            y: l.y,
            z: l.z || 0,
            visibility: l.visibility || 1
          })) || [],
          timestamp: startTimeMs
        });
      }

      animationFrameRef.current = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, isLoading]);

  return { poseResult, isLoading, error };
}
