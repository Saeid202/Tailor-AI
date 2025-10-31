import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getActiveMeasurements } from '@/integrations/supabase/profiles';
import { Scissors, AlertCircle, Check, Sparkles } from 'lucide-react';
import type { Product } from '@/types/store';
import type { BodyMeasurements } from '@/types/profile';

interface PersonalTailorButtonProps {
  product: Product;
  onCustomOrderStart: (product: Product, measurements: BodyMeasurements) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export const PersonalTailorButton = ({
  product,
  onCustomOrderStart,
  variant = 'default',
  size = 'default',
  showLabel = true,
  className = '',
}: PersonalTailorButtonProps) => {
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkMeasurements();
  }, []);

  const checkMeasurements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activeMeasurements = await getActiveMeasurements(user.id);
      setMeasurements(activeMeasurements);
    } catch (error) {
      console.error('Error checking measurements:', error);
    }
  };

  const handleClick = () => {
    if (!measurements) {
      setShowDialog(true);
    } else {
      onCustomOrderStart(product, measurements);
      toast({
        title: 'Custom Order Started',
        description: 'Using your saved measurements for a perfect fit',
      });
    }
  };

  const handleGoToMeasurements = () => {
    setShowDialog(false);
    navigate('/profile?tab=measurements');
    toast({
      title: 'Add Your Measurements',
      description: 'Fill in your body measurements to enable custom tailoring',
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`gap-2 ${className}`}
        disabled={loading}
      >
        <Scissors className="h-4 w-4" />
        {showLabel && 'Personal Tailor'}
        {measurements && <Badge variant="secondary" className="ml-1 text-xs">✓</Badge>}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <DialogTitle className="text-center">Measurements Required</DialogTitle>
            <DialogDescription className="text-center">
              To order custom-tailored clothing, we need your body measurements first.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Why Measurements?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your measurements ensure a perfect fit tailored specifically for your body shape.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Two Easy Options</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Enter measurements manually</li>
                    <li>Use our AI camera for automatic scanning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleGoToMeasurements}
                className="flex-1 gap-2"
              >
                <Scissors className="h-4 w-4" />
                Add Measurements
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

