import { Check, Shirt, Camera, Palette, Layers, Eye, Box, Download } from 'lucide-react';
import { Step, useWorkflow, validateStep } from '@/contexts/WorkflowContext';

const steps: { key: Step; label: string; icon: React.ReactNode; color: string; gradient: string }[] = [
  { 
    key: Step.GARMENT, 
    label: 'Garment', 
    icon: <Shirt className="w-4 h-4" />,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    key: Step.MEASURE, 
    label: 'Measurement', 
    icon: <Camera className="w-4 h-4" />,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600'
  },
  { 
    key: Step.FABRIC, 
    label: 'Fabric & Color', 
    icon: <Palette className="w-4 h-4" />,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    key: Step.PATTERN, 
    label: 'Pattern', 
    icon: <Layers className="w-4 h-4" />,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600'
  },
  { 
    key: Step.PREVIEW, 
    label: 'Visual', 
    icon: <Eye className="w-4 h-4" />,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600'
  },
  { 
    key: Step.VIRTUAL_FIT, 
    label: 'Virtual Fit', 
    icon: <Box className="w-4 h-4" />,
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-600'
  },
  { 
    key: Step.REVIEW_EXPORT, 
    label: 'CNC Export', 
    icon: <Download className="w-4 h-4" />,
    color: 'slate',
    gradient: 'from-slate-500 to-gray-600'
  },
];

export function WorkflowNav() {
  const { step, completed, selection, goTo } = useWorkflow();

  const currentStepData = steps.find((s) => s.key === step);
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        
        {/* Current Step Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {currentStepData && (
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${currentStepData.gradient} rounded-xl shadow-lg`}>
                <span className="text-white">{currentStepData.icon}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {currentStepData?.label || 'Workflow'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length} • Design your perfect garment
              </p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium text-primary">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Professional Step Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {steps.map((s, index) => {
            const isActive = s.key === step;
            const isDone = completed.has(s.key) || validateStep(s.key, selection);
            const isPast = index < currentStepIndex;
            
            return (
              <button
                key={s.key}
                onClick={() => goTo(s.key)}
                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? `border-${s.color}-200 bg-gradient-to-br ${s.gradient}/10 shadow-lg scale-105`
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 shadow-sm'
                      : 'border-border bg-card/50 hover:bg-card shadow-sm hover:shadow-md'
                }`}
              >
                {/* Step Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg mb-2 transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${s.gradient} text-white shadow-lg`
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-background text-muted-foreground border hover:border-primary/50'
                }`}>
                  {isDone && !isActive ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    s.icon
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`text-xs font-medium text-center leading-tight transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : isDone
                      ? 'text-emerald-700'
                      : 'text-foreground/80 group-hover:text-foreground'
                }`}>
                  {s.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
                
                {/* Step Number */}
                <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white scale-110'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground border group-hover:bg-primary/10 group-hover:border-primary/50'
                }`}>
                  {index + 1}
                </div>
                
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 transition-colors ${
                    index < currentStepIndex ? 'bg-emerald-300' : 'bg-border'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
