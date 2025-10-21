import { GarmentType } from '@/types/garment';

interface AvatarOverlayProps {
  garmentType: GarmentType;
}

export function AvatarOverlay({ garmentType }: AvatarOverlayProps) {
  const isUpper = garmentType === 'shirt' || garmentType === 't-shirt';
  
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Head */}
      <circle cx="50" cy="15" r="6" fill="url(#avatarGradient)" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.6" />
      
      {/* Body */}
      <ellipse cx="50" cy="40" rx="12" ry="18" fill="url(#avatarGradient)" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.6" />
      
      {isUpper ? (
        <>
          {/* Arms out for shirt measurements */}
          <line x1="38" y1="28" x2="20" y2="35" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" />
          <line x1="62" y1="28" x2="80" y2="35" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" />
          
          {/* Forearms */}
          <line x1="20" y1="35" x2="15" y2="50" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="35" x2="85" y2="50" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" />
          
          {/* Hand markers */}
          <circle cx="15" cy="50" r="2" fill="hsl(var(--primary))" opacity="0.8" />
          <circle cx="85" cy="50" r="2" fill="hsl(var(--primary))" opacity="0.8" />
          
          {/* Legs (subtle) */}
          <line x1="44" y1="58" x2="42" y2="85" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" />
          <line x1="56" y1="58" x2="58" y2="85" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" />
        </>
      ) : (
        <>
          {/* Arms down for pant measurements */}
          <line x1="38" y1="28" x2="35" y2="55" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.4" />
          <line x1="62" y1="28" x2="65" y2="55" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.4" />
          
          {/* Legs apart */}
          <line x1="44" y1="58" x2="38" y2="85" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.7" />
          <line x1="56" y1="58" x2="62" y2="85" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.7" />
          
          {/* Foot markers */}
          <circle cx="38" cy="85" r="2" fill="hsl(var(--primary))" opacity="0.8" />
          <circle cx="62" cy="85" r="2" fill="hsl(var(--primary))" opacity="0.8" />
        </>
      )}
      
      {/* Alignment guides */}
      <circle cx="50" cy="15" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />
      <circle cx="38" cy="28" r="4" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.4" />
      <circle cx="62" cy="28" r="4" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.4" />
    </svg>
  );
}
