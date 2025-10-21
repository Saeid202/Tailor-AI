import { Check } from 'lucide-react';
import { Step, useWorkflow, validateStep } from '@/contexts/WorkflowContext';

const steps: { key: Step; label: string }[] = [
  { key: Step.GARMENT, label: 'Garment' },
  { key: Step.MEASURE, label: 'Measurement' },
  { key: Step.FABRIC, label: 'Fabric & Color' },
  { key: Step.PATTERN, label: 'Pattern' },
  { key: Step.PREVIEW, label: 'Visual' },
  { key: Step.VIRTUAL_FIT, label: 'Virtual Fit' },
  { key: Step.REVIEW_EXPORT, label: 'CNC Export' },
];

export function WorkflowNav() {
  const { step, completed, selection, goTo } = useWorkflow();

  const phaseLabel = (() => {
    if (step === Step.GARMENT || step === Step.MEASURE) return 'Measurement';
    if (step === Step.FABRIC || step === Step.PATTERN) return 'Patterns';
    return 'Visual';
  })();

  const currentStepLabel = (() => {
    const found = steps.find((s) => s.key === step);
    return found ? found.label : '';
  })();

  return (
    <div className="sticky top-16 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3">
        {/* Breadcrumb label */}
        <div className="text-xs text-muted-foreground">
          {phaseLabel} • <span className="font-medium text-foreground/80">{currentStepLabel}</span>
        </div>
        {/* Sub-steps progress */}
        <div className="mt-3 grid grid-flow-col auto-cols-fr gap-2">
          {steps.map((s) => {
            const isActive = s.key === step;
            const isDone = completed.has(s.key) || validateStep(s.key, selection);
            return (
              <button
                key={s.key}
                onClick={() => goTo(s.key)}
                className={`group relative flex items-center justify-center h-9 rounded-md border text-xs transition ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : isDone
                      ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400/90 bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
              >
                <span className="truncate px-2">{s.label}</span>
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-1.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
