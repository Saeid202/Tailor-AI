import { QualityCheck } from '@/types/pose';

export function checkLighting(
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement
): QualityCheck {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      passed: false,
      message: 'Canvas error',
      severity: 'error'
    };
  }

  canvas.width = videoElement.videoWidth / 4; // Sample at lower res for performance
  canvas.height = videoElement.videoHeight / 4;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalLuminance = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  const avgLuminance = totalLuminance / (data.length / 4);
  const threshold = 60; // 0-255 scale
  
  if (avgLuminance < threshold) {
    return {
      passed: false,
      message: 'Increase lighting',
      severity: 'warning'
    };
  }
  
  return {
    passed: true,
    message: 'Good lighting',
    severity: 'info'
  };
}
