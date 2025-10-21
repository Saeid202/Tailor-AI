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
        
        // Use installed package version
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
        );

        const modelUrl = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
        
        // Try GPU first, fallback to CPU if not supported
        let poseLandmarker: PoseLandmarker | null = null;
        
        try {
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelUrl,
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          console.log('MediaPipe initialized with GPU acceleration');
        } catch (gpuError) {
          console.warn('GPU delegate not supported, falling back to CPU');
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelUrl,
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          console.log('MediaPipe initialized with CPU');
        }

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
