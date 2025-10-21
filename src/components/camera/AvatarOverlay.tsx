import { GarmentType } from '@/types/garment';
import avatarUpperPose from '@/assets/avatar-upper-pose.png';
import avatarLowerPose from '@/assets/avatar-lower-pose.png';

interface AvatarOverlayProps {
  garmentType: GarmentType;
}

export function AvatarOverlay({ garmentType }: AvatarOverlayProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
      <img 
        src={isUpper ? avatarUpperPose : avatarLowerPose}
        alt="Pose guide"
        className="h-[80%] w-auto object-contain opacity-30"
        style={{
          filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.3))'
        }}
      />
    </div>
  );
}
