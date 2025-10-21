import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { GarmentType } from '@/types/garment';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useQualityChecks } from '@/hooks/useQualityChecks';
import { useAutoCapture } from '@/hooks/useAutoCapture';
import { AvatarOverlay } from './AvatarOverlay';
import { QualityIndicators } from './QualityIndicators';
import { MeasurementChips } from './MeasurementChips';
import { calculateMeasurements } from '@/lib/pose/measurements';
import { Measurement } from '@/types/measurements';
import { GARMENT_CONFIGS } from '@/types/garment';
import { Loader2 } from 'lucide-react';

interface CameraViewProps {
  garmentType: GarmentType;
  unit: 'cm' | 'in';
  onCapture: (measurements: Measurement[], imageDataUrl: string) => void;
}

export function CameraView({ garmentType, unit, onCapture }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<Measurement[]>([]);

  const config = GARMENT_CONFIGS[garmentType];
  const { poseResult, isLoading, error } = usePoseDetection(videoElement);
  const { qualityGates, allChecksPassed } = useQualityChecks(
    poseResult,
    videoElement,
    config.requiredLandmarks
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
    if (!poseResult || !webcamRef.current) return;

    const imageDataUrl = webcamRef.current.getScreenshot() || '';
    const measurements = calculateMeasurements(poseResult.landmarks, garmentType, unit);
    onCapture(measurements, imageDataUrl);
  };

  const countdown = useAutoCapture(allChecksPassed, handleCapture);

  // Update live measurements
  useEffect(() => {
    if (poseResult && poseResult.landmarks.length > 0) {
      const measurements = calculateMeasurements(poseResult.landmarks, garmentType, unit);
      setLiveMeasurements(measurements);
    }
  }, [poseResult, garmentType, unit]);

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
    <div className="relative w-full h-full bg-black overflow-hidden">
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

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p>Loading pose detection...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <AvatarOverlay garmentType={garmentType} />
          <QualityIndicators qualityGates={qualityGates} />
          <MeasurementChips measurements={liveMeasurements} />

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-9xl font-bold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
