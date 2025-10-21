import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import { GarmentType } from '@/types/garment';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useQualityChecks } from '@/hooks/useQualityChecks';
import { useAutoCapture } from '@/hooks/useAutoCapture';
import { AvatarOverlay } from './AvatarOverlay';
import { QualityIndicators } from './QualityIndicators';
import { MeasurementChips } from './MeasurementChips';
import { PoseLandmarksOverlay } from './PoseLandmarksOverlay';
import { calculateMeasurements } from '@/lib/pose/measurements';
import { averageMeasurements } from '@/lib/utils/measurementAveraging';
import { Measurement } from '@/types/measurements';
import { GARMENT_CONFIGS } from '@/types/garment';
import { CaptureProgress } from './CaptureProgress';
import { Loader2, Video, VideoOff } from 'lucide-react';

interface CameraViewProps {
  garmentType: GarmentType;
  unit: 'cm' | 'in';
  onCapture: (measurements: Measurement[], imageDataUrl: string) => void;
  onLiveMeasurements?: (measurements: Measurement[]) => void;
  userHeightCm?: number;
}

export type CameraViewHandle = {
  start: () => void;
  stop: () => void;
  toggle: () => void;
  isActive: () => boolean;
};

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(function CameraView(
  { garmentType, unit, onCapture, onLiveMeasurements, userHeightCm }: CameraViewProps,
  ref
) {
  const webcamRef = useRef<Webcam>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<Measurement[]>([]);
  const [measurementBuffer, setMeasurementBuffer] = useState<Measurement[][]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const config = GARMENT_CONFIGS[garmentType];
  const { poseResult, isLoading, error } = usePoseDetection(videoElement);
  const { qualityGates, allChecksPassed } = useQualityChecks(
    poseResult,
    videoElement,
    config.requiredLandmarks,
    config.region
  );

  // Connect video element when webcam loads
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (video && video !== videoElement) {
      console.log('Video element connected:', video.videoWidth, 'x', video.videoHeight);
      setVideoElement(video);
    }
  }, [webcamRef.current?.video, videoElement]);

  const handleCapture = () => {
    if (!poseResult || !webcamRef.current || !videoElement) return;

    const imageDataUrl = webcamRef.current.getScreenshot() || '';
    const measurements = calculateMeasurements(
      poseResult.landmarks,
      poseResult.worldLandmarks,
      garmentType,
      unit,
      videoElement.videoWidth,
      videoElement.videoHeight,
      userHeightCm
    );
    onCapture(measurements, imageDataUrl);
  };

  const { countdown, progress } = useAutoCapture(allChecksPassed, handleCapture);

  // Expose start/stop/toggle via ref
  useImperativeHandle(
    ref,
    () => ({
      start: () => setIsCameraActive(true),
      stop: () => setIsCameraActive(false),
      toggle: () => setIsCameraActive((v) => !v),
      isActive: () => isCameraActive,
    }),
    [isCameraActive]
  );

  // Update live measurements with throttling and averaging
  useEffect(() => {
    if (!poseResult || !videoElement || !qualityGates.stability.passed) {
      setLiveMeasurements([]);
      setMeasurementBuffer([]);
      return;
    }

    const now = Date.now();
    if (now - lastUpdateRef.current < 500) return; // Throttle to 2 Hz

    lastUpdateRef.current = now;
    
    const measurements = calculateMeasurements(
      poseResult.landmarks,
      poseResult.worldLandmarks,
      garmentType,
      unit,
      videoElement.videoWidth,
      videoElement.videoHeight,
      userHeightCm
    );

    // Buffer last 5 measurements for averaging
    const newBuffer = [...measurementBuffer, measurements].slice(-5);
    setMeasurementBuffer(newBuffer);

    // Show averaged measurements
    if (newBuffer.length >= 3) {
      const averaged = averageMeasurements(newBuffer);
      setLiveMeasurements(averaged);
      onLiveMeasurements?.(averaged);
    }
  }, [poseResult, videoElement, garmentType, unit, qualityGates.stability.passed]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive p-8 text-center">
        <div>
          <p className="text-lg font-semibold mb-2">Camera Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black relative">
      {/* Camera Content Area */}
      <div className="absolute inset-0">
        {isCameraActive ? (
          <Webcam
            ref={webcamRef}
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: 'user'
            }}
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={() => {
              const video = webcamRef.current?.video;
              if (video) {
                console.log('Webcam loaded:', video.readyState, video.videoWidth);
                setVideoElement(video);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Camera is stopped</p>
              <p className="text-sm text-white/60 mt-2">Use the button below to start</p>
            </div>
          </div>
        )}

        {isCameraActive && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p>Loading pose detection...</p>
            </div>
          </div>
        )}

        {isCameraActive && !isLoading && (
          <>
            <AvatarOverlay garmentType={garmentType} />
            {poseResult && videoElement && (
              <PoseLandmarksOverlay 
                landmarks={poseResult.landmarks}
                videoWidth={videoElement.videoWidth}
                videoHeight={videoElement.videoHeight}
              />
            )}
            <QualityIndicators qualityGates={qualityGates} />
            <MeasurementChips measurements={liveMeasurements} />

            {countdown !== null && (
              <CaptureProgress countdown={countdown} progress={progress} />
            )}
          </>
        )}
      </div>
    </div>
  );
});
