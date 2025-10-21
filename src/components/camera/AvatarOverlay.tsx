import { GarmentType } from '@/types/garment';

interface AvatarOverlayProps {
  garmentType: GarmentType;
}

export function AvatarOverlay({ garmentType }: AvatarOverlayProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none p-8">
      {/* Main frame border */}
      <div className="relative w-full h-full border-4 border-primary/40 rounded-2xl">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary -m-1 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary -m-1 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary -m-1 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary -m-1 rounded-br-2xl" />
        
        {/* Center alignment guide */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-1/2" />
        
        {/* Position guides based on garment type */}
        {isUpper ? (
          <>
            {/* Shoulder line for upper body */}
            <div className="absolute left-0 right-0 top-[20%] h-px bg-primary/20" />
            <div className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 text-primary/60 text-xs bg-background/80 px-2 py-1 rounded">
              Shoulders
            </div>
            
            {/* Arm position indicators */}
            <div className="absolute left-[15%] top-[25%] w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            <div className="absolute right-[15%] top-[25%] w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          </>
        ) : (
          <>
            {/* Hip line for lower body */}
            <div className="absolute left-0 right-0 top-[35%] h-px bg-primary/20" />
            <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 text-primary/60 text-xs bg-background/80 px-2 py-1 rounded">
              Hips
            </div>
            
            {/* Foot position indicators */}
            <div className="absolute left-[40%] bottom-[10%] w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            <div className="absolute right-[40%] bottom-[10%] w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          </>
        )}
        
        {/* Instruction text */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
          <p className="text-primary text-sm font-medium bg-background/90 px-4 py-2 rounded-lg shadow-lg">
            {isUpper ? 'Stand with arms extended' : 'Stand with legs apart'}
          </p>
        </div>
      </div>
    </div>
  );
}
