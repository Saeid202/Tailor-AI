import { Button } from '@/components/ui/button';
import { useWorkflow, Step } from '@/contexts/WorkflowContext';
import { Play, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export function BottomActionBar({ onStartCamera, onExport }: { onStartCamera?: () => void; onExport?: () => void }) {
  const { step, canAdvance, next, back } = useWorkflow();

  const primary = (() => {
    if (step === Step.MEASURE) return { label: 'Start Camera', Icon: Play, onClick: onStartCamera ?? next };
    if (step === Step.REVIEW_EXPORT) return { label: 'Export to CNC', Icon: Download, onClick: onExport ?? next };
    return { label: 'Next', Icon: ChevronRight, onClick: next };
  })();

  return (
    <div className="sticky bottom-0 z-40 bg-background/80 backdrop-blur border-t">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={primary.onClick} disabled={step !== Step.MEASURE && !canAdvance}>
          <primary.Icon className="w-4 h-4 mr-2" /> {primary.label}
        </Button>
      </div>
    </div>
  );
}
