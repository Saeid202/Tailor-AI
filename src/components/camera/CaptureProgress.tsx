interface CaptureProgressProps {
  countdown: number;
  progress: number;
}

export function CaptureProgress({ countdown, progress }: CaptureProgressProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
      <div className="relative">
        {/* Background circle */}
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100"
            style={{
              filter: progress > 80 ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none'
            }}
          />
        </svg>
        
        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-5xl font-bold text-primary animate-pulse"
            style={{
              textShadow: '0 0 20px hsl(var(--primary) / 0.5)'
            }}
          >
            {countdown}
          </span>
        </div>
      </div>
      
      {/* Status message */}
      <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20">
        <p className="text-sm font-medium text-primary">
          Hold steady...
        </p>
      </div>
    </div>
  );
}
