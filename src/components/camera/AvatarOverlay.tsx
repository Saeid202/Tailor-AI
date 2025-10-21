import { GarmentType } from '@/types/garment';

interface AvatarOverlayProps {
  garmentType: GarmentType;
}

export function AvatarOverlay({ garmentType }: AvatarOverlayProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Enhanced guide lines */}
      <div className="absolute left-1/2 top-[10%] bottom-[10%] w-px bg-primary/20 -translate-x-1/2" />
      <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-primary/20 -translate-y-1/2" />
      
      {/* Enhanced instruction card */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center max-w-md">
        <div className="bg-background/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-primary/20 shadow-lg">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-primary font-semibold text-base">
              {isUpper ? 'Upper Body Pose' : 'Lower Body Pose'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {isUpper 
              ? '✋ Extend arms horizontally • Stand straight • Face camera' 
              : '👣 Legs shoulder-width apart • Stand straight • Face camera'}
          </p>
        </div>
      </div>
      
      {/* Distance guide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            📏 Stand 6-8 feet from camera
          </p>
        </div>
      </div>
    </div>
  );
}
