import { QualityGates } from '@/types/pose';
import { Lightbulb, Maximize2, Target, Eye, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QualityIndicatorsProps {
  qualityGates: QualityGates;
}

export function QualityIndicators({ qualityGates }: QualityIndicatorsProps) {
  const indicators = [
    { key: 'lighting', check: qualityGates.lighting, icon: Lightbulb },
    { key: 'distance', check: qualityGates.distance, icon: Maximize2 },
    { key: 'stability', check: qualityGates.stability, icon: Target },
    { key: 'occlusion', check: qualityGates.occlusion, icon: Eye },
  ];

  return (
    <div className="absolute top-4 right-4 space-y-2">
      {indicators.map(({ key, check, icon: Icon }) => (
        <div
          key={key}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm text-sm font-medium transition-all ${
            check.passed
              ? 'bg-green-500/20 text-green-100'
              : check.severity === 'error'
              ? 'bg-red-500/20 text-red-100'
              : 'bg-yellow-500/20 text-yellow-100'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs">{check.message}</span>
          {check.passed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : check.severity === 'error' ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>
      ))}
    </div>
  );
}
