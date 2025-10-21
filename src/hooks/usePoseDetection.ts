import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PoseResult } from '@/types/pose';

export function usePoseDetection(videoElement: HTMLVideoElement | null) {
  const [poseResult, setPoseResult] = useState<PoseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let mounted = true;

    const initializePoseDetection = async () => {
      try {
        console.log('Initializing MediaPipe pose detection...');
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
          console.log('MediaPipe initialized successfully');
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
    if (!poseLandmarkerRef.current || !videoElement || isLoading) {
      return;
    }

    let frameCount = 0;
    
    const detectPose = () => {
      const video = videoElement;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !poseLandmarker) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
        return;
      }

      // Check if video is ready
      if (video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
        return;
      }

      const startTimeMs = performance.now();
      
      try {
        const result = poseLandmarker.detectForVideo(video, startTimeMs);

        frameCount++;
        if (frameCount % 30 === 0) {
          console.log('Pose detection running, landmarks found:', result.landmarks?.length || 0);
        }

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
      } catch (err) {
        console.error('Pose detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detectPose);
    };

    console.log('Starting pose detection loop');
    detectPose();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, isLoading]);

  return { poseResult, isLoading, error };
}
