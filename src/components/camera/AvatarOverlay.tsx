import { GarmentType } from '@/types/garment';

interface AvatarOverlayProps {
  garmentType: GarmentType;
}

export function AvatarOverlay({ garmentType }: AvatarOverlayProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Minimal center guide line */}
      <div className="absolute left-1/2 top-[10%] bottom-[10%] w-px bg-primary/10 -translate-x-1/2" />
      
      {/* Simple instruction text */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center">
        <p className="text-primary/80 text-sm font-medium bg-background/70 px-4 py-2 rounded-lg">
          {isUpper ? 'Stand with arms extended horizontally' : 'Stand with legs shoulder-width apart'}
        </p>
      </div>
    </div>
  );
}
