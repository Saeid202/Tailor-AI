import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use Tailor AI</DialogTitle>
          <DialogDescription>
            Follow these guidelines for accurate body measurements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <section>
            <h3 className="font-semibold text-lg mb-2">📏 How to Stand</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Stand straight with your weight evenly distributed</li>
              <li>Look directly at the camera</li>
              <li>Keep your body relaxed but upright</li>
              <li>Maintain a distance of 6-8 feet from the camera</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">👔 For Shirts & T-Shirts</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Extend your arms slightly outward (45-degree angle)</li>
              <li>Keep your arms straight, not bent</li>
              <li>Wear fitted clothing for more accurate measurements</li>
              <li>Ensure your shoulders, elbows, and wrists are visible</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">👖 For Pants</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Stand with feet shoulder-width apart</li>
              <li>Keep your legs straight</li>
              <li>Arms can hang naturally at your sides</li>
              <li>Ensure your hips, knees, and ankles are visible</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">💡 Lighting Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use bright, even lighting (natural daylight is best)</li>
              <li>Avoid backlighting (don't stand in front of windows)</li>
              <li>Face the light source for best results</li>
              <li>Avoid harsh shadows on your body</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">🎯 Tips for Best Results</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Hold still when the countdown starts</li>
              <li>Follow the avatar overlay guide on screen</li>
              <li>Align your body with the semi-transparent figure</li>
              <li>Wait for all quality indicators to turn green</li>
              <li>Retake if measurements seem inaccurate</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">⚠️ What to Avoid</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Baggy or loose clothing (wears fitted clothes)</li>
              <li>Moving during capture</li>
              <li>Standing too close or too far</li>
              <li>Slouching or poor posture</li>
              <li>Obstructed body parts (behind furniture, etc.)</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
