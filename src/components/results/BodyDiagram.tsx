import { MeasurementType } from '@/types/measurements';

interface BodyDiagramProps {
  measurements: { type: MeasurementType; value: number; unit: string }[];
  garmentType: string;
}

export function BodyDiagram({ measurements, garmentType }: BodyDiagramProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';

  return (
    <div className="relative w-full max-w-md mx-auto p-8">
      <svg
        viewBox="0 0 200 400"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline */}
        <g stroke="hsl(var(--primary))" fill="none" strokeWidth="2">
          {/* Head */}
          <circle cx="100" cy="30" r="20" opacity="0.3" />
          
          {/* Neck */}
          <line x1="100" y1="50" x2="100" y2="65" opacity="0.3" />
          
          {/* Shoulders */}
          <line x1="60" y1="65" x2="140" y2="65" strokeWidth="3" opacity={isUpper ? 1 : 0.3} />
          
          {/* Arms */}
          <line x1="60" y1="65" x2="40" y2="150" strokeWidth="2" opacity={isUpper ? 1 : 0.3} />
          <line x1="140" y1="65" x2="160" y2="150" strokeWidth="2" opacity={isUpper ? 1 : 0.3} />
          
          {/* Torso */}
          <line x1="70" y1="70" x2="70" y2="160" strokeWidth="2" opacity={isUpper ? 1 : 0.3} />
          <line x1="130" y1="70" x2="130" y2="160" strokeWidth="2" opacity={isUpper ? 1 : 0.3} />
          
          {/* Chest line */}
          {isUpper && <line x1="70" y1="90" x2="130" y2="90" strokeWidth="3" />}
          
          {/* Waist */}
          <line x1="75" y1="140" x2="125" y2="140" strokeWidth="3" opacity={isUpper ? 1 : 0.3} />
          
          {/* Hips */}
          <line x1="70" y1="170" x2="130" y2="170" strokeWidth="3" opacity={!isUpper ? 1 : 0.3} />
          
          {/* Legs */}
          <line x1="80" y1="170" x2="75" y2="350" strokeWidth="2" opacity={!isUpper ? 1 : 0.3} />
          <line x1="120" y1="170" x2="125" y2="350" strokeWidth="2" opacity={!isUpper ? 1 : 0.3} />
          
          {/* Thigh */}
          {!isUpper && <line x1="75" y1="200" x2="85" y2="200" strokeWidth="3" />}
          
          {/* Calf */}
          {!isUpper && <line x1="73" y1="300" x2="80" y2="300" strokeWidth="3" />}
        </g>

        {/* Measurement labels */}
        {isUpper && (
          <>
            <text x="100" y="60" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Shoulder
            </text>
            <text x="100" y="85" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Chest
            </text>
            <text x="100" y="135" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Waist
            </text>
            <text x="25" y="110" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Sleeve
            </text>
          </>
        )}
        
        {!isUpper && (
          <>
            <text x="100" y="165" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Hip
            </text>
            <text x="95" y="195" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Thigh
            </text>
            <text x="90" y="295" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Calf
            </text>
            <text x="50" y="260" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
              Inseam
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
