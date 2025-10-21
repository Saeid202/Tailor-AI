import { useEffect, useRef, useState } from 'react';

const CAPTURE_DELAY = 2500; // ms - time all checks must pass

export function useAutoCapture(
  allChecksPassed: boolean,
  onCapture: () => void
) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (allChecksPassed) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, CAPTURE_DELAY - elapsed);

      setCountdown(Math.ceil(remaining / 1000));
      setProgress(Math.min(100, (elapsed / CAPTURE_DELAY) * 100));

      if (remaining <= 0) {
        onCapture();
        startTimeRef.current = undefined;
        setCountdown(null);
      } else {
        timerRef.current = setTimeout(() => {
          // Will be rechecked in next effect run
        }, 100);
      }
    } else {
      // Reset if checks fail
      startTimeRef.current = undefined;
      setCountdown(null);
      setProgress(0);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [allChecksPassed, onCapture]);

  return { countdown, progress };
}
