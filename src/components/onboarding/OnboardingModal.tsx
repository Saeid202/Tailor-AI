import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Ruler, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (height: number, unit: 'cm' | 'in') => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  const handleComplete = () => {
    const heightValue = parseFloat(height);
    if (heightValue > 0) {
      onComplete(unit === 'cm' ? heightValue : heightValue * 2.54, unit);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to Tailor AI!</DialogTitle>
              <DialogDescription className="text-base">
                Get accurate body measurements using just your camera
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Measurement</h3>
                  <p className="text-sm text-muted-foreground">
                    Stand in front of your camera and our AI will detect your pose and calculate measurements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Ruler className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Multiple Garment Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Get measurements for shirts, t-shirts, and pants with pose-specific instructions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quality Assurance</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time feedback ensures optimal lighting, distance, and pose stability
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Tips for Best Results:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Stand 6-8 feet away from the camera</li>
                <li>Ensure good, even lighting</li>
                <li>Wear fitted clothing</li>
                <li>Follow the on-screen pose guidance</li>
              </ul>
            </div>

            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Enter Your Height</DialogTitle>
              <DialogDescription className="text-base">
                This helps us calibrate measurements for better accuracy
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="height">Your Height</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="flex-1"
                  />
                  <RadioGroup value={unit} onValueChange={(v) => setUnit(v as 'cm' | 'in')} className="flex gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cm" id="cm" />
                      <Label htmlFor="cm" className="cursor-pointer">cm</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in" id="in" />
                      <Label htmlFor="in" className="cursor-pointer">in</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                💡 Your height is used to improve measurement accuracy. You can skip this step, but results may be less accurate.
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onComplete(0, unit)} className="flex-1">
                Skip
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={!height || parseFloat(height) <= 0}
                className="flex-1"
              >
                Complete Setup
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
