import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Measurement } from '@/types/measurements';

interface SizeRecommendationProps {
  measurements: Measurement[];
  garmentType: string;
}

export function SizeRecommendation({ measurements, garmentType }: SizeRecommendationProps) {
  const getSizeRecommendation = () => {
    if (garmentType === 'shirt' || garmentType === 't-shirt') {
      const chest = measurements.find(m => m.type === 'chest');
      if (!chest) return null;
      
      const chestCm = chest.unit === 'cm' ? chest.value : chest.value * 2.54;
      
      if (chestCm < 86) return { size: 'XS', fit: 'Slim Fit' };
      if (chestCm < 94) return { size: 'S', fit: 'Regular Fit' };
      if (chestCm < 102) return { size: 'M', fit: 'Regular Fit' };
      if (chestCm < 110) return { size: 'L', fit: 'Regular Fit' };
      if (chestCm < 118) return { size: 'XL', fit: 'Regular Fit' };
      return { size: 'XXL', fit: 'Relaxed Fit' };
    }
    
    if (garmentType === 'pant') {
      const waist = measurements.find(m => m.type === 'waist_lower');
      const inseam = measurements.find(m => m.type === 'inseam');
      
      if (!waist || !inseam) return null;
      
      const waistCm = waist.unit === 'cm' ? waist.value : waist.value * 2.54;
      const inseamIn = inseam.unit === 'in' ? inseam.value : inseam.value / 2.54;
      
      let waistSize = Math.round(waistCm / 2.54);
      let inseamSize = Math.round(inseamIn);
      
      return { size: `${waistSize}W x ${inseamSize}L`, fit: 'Regular Fit' };
    }
    
    return null;
  };

  const recommendation = getSizeRecommendation();

  if (!recommendation) return null;

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Recommended Size</h3>
          <p className="text-sm text-muted-foreground">Based on standard sizing charts</p>
        </div>
        <div className="text-right">
          <Badge variant="default" className="text-lg px-4 py-2 mb-1">
            {recommendation.size}
          </Badge>
          <p className="text-xs text-muted-foreground">{recommendation.fit}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-primary/10">
        <p className="text-xs text-muted-foreground">
          💡 Sizes may vary between brands. Use your specific measurements when shopping online.
        </p>
      </div>
    </Card>
  );
}
