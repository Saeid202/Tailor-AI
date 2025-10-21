import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GarmentType } from '@/types/garment';
import { Measurement, MeasurementResult } from '@/types/measurements';
import { GarmentTabs } from '@/components/layout/GarmentTabs';
import { AppHeader } from '@/components/layout/AppHeader';
import { CameraView } from '@/components/camera/CameraView';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { HistoryView } from '@/components/results/HistoryView';
import { MeasurementAnalytics } from '@/components/analytics/MeasurementAnalytics';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { OnlineStore } from '@/components/store/OnlineStore';
import { Button } from '@/components/ui/button';
import { Ruler, ArrowRight } from 'lucide-react';
import { convertMeasurement } from '@/lib/utils/unitConversion';
import { resetStabilityHistory } from '@/lib/quality/stabilityCheck';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { WorkflowNav } from '@/components/workflow/WorkflowNav';
import { BottomActionBar } from '@/components/workflow/BottomActionBar';
import { useRef } from 'react';
import { useWorkflow, Step } from '@/contexts/WorkflowContext';
import { GarmentStep } from '@/components/workflow/steps/GarmentStep';
import { MeasurementStep } from '@/components/workflow/steps/MeasurementStep';
import { FabricColorStep } from '@/components/workflow/steps/FabricColorStep';
import { PatternStep } from '@/components/workflow/steps/PatternStep';
import { VisualStep } from '@/components/workflow/steps/VisualStep';
import { VirtualFitStep } from '@/components/workflow/steps/VirtualFitStep';
import { ReviewExportStep } from '@/components/workflow/steps/ReviewExportStep';

type Stage = 'camera' | 'results' | 'history' | 'analytics';

const Index = () => {
  const navigate = useNavigate();
  const [garmentType, setGarmentType] = useState<GarmentType>('shirt');
  const [stage, setStage] = useState<Stage>('camera');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<Measurement[]>([]);
  const { measurements, loading, saveMeasurement, deleteMeasurement } = useMeasurements();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, [profile]);

  const handleOnboardingComplete = async (height: number, preferredUnit: 'cm' | 'in') => {
    if (height > 0) {
      await updateProfile({
        height_cm: height,
        preferred_unit: preferredUnit,
        onboarding_completed: true
      });
      setUnit(preferredUnit);
    } else {
      await updateProfile({ onboarding_completed: true });
    }
    setShowOnboarding(false);
  };

  const handleCapture = (measurements: Measurement[], imageDataUrl: string) => {
    const capturedResult: MeasurementResult = {
      garmentType,
      measurements,
      capturedAt: new Date(),
      imageDataUrl
    };
    setResult(capturedResult);
    setStage('results');
    resetStabilityHistory();
  };

  const handleRetake = () => {
    setStage('camera');
    setResult(null);
    resetStabilityHistory();
  };

  const handleToggleUnit = () => {
    const newUnit: 'cm' | 'in' = unit === 'cm' ? 'in' : 'cm';
    setUnit(newUnit);

    if (result) {
      const convertedMeasurements: Measurement[] = result.measurements.map(m => ({
        ...m,
        value: convertMeasurement(m.value, m.unit, newUnit),
        unit: newUnit
      }));
      setResult({
        ...result,
        measurements: convertedMeasurements
      });
    }
  };

  const handleGarmentChange = (newGarmentType: GarmentType) => {
    setGarmentType(newGarmentType);
    setStage('camera');
    setResult(null);
    resetStabilityHistory();
  };

  const handleSave = async () => {
    if (result) {
      await saveMeasurement(result);
    }
  };

  const handleViewHistory = () => {
    setStage('history');
  };

  const handleViewMeasurement = (measurement: MeasurementResult) => {
    setResult(measurement);
    setStage('results');
  };

  const handleBackToCamera = () => {
    setStage('camera');
    setResult(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewAnalytics = () => {
    setStage('analytics');
  };

  // camera control via ref signal
  const cameraViewRef = useRef<{ start: () => void } | null>(null);
  const handleStartCameraFromBar = () => {
    cameraViewRef.current?.start?.();
  };

  function WorkflowContent({ garmentType, onGarmentChange }: { garmentType: GarmentType; onGarmentChange: (g: GarmentType) => void }) {
    // use inside component to access workflow state
    // note: this component must be used under WorkflowProvider
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { step } = useWorkflow();
    switch (step) {
      case Step.GARMENT:
        return <GarmentStep value={garmentType} onChange={onGarmentChange} />;
      case Step.MEASURE:
        return <MeasurementStep />;
      case Step.FABRIC:
        return <FabricColorStep />;
      case Step.PATTERN:
        return <PatternStep />;
      case Step.PREVIEW:
        return <VisualStep />;
      case Step.VIRTUAL_FIT:
        return <VirtualFitStep />;
      case Step.REVIEW_EXPORT:
        return <ReviewExportStep />;
      default:
        return null;
    }
  }

  function CameraSection({ garmentType }: { garmentType: GarmentType }) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const { step, update, next } = useWorkflow();
    if (step !== Step.MEASURE) return null;

    const onCaptureProxy = (ms: Measurement[], image: string) => {
      // Map array to key-value for validation
      const obj: Record<string, number> = {};
      ms.forEach((m) => {
        obj[m.label] = m.value;
      });
      update({ measurements: obj });
      // auto-advance to Fabric step
      setTimeout(() => next(), 0);
      handleCapture(ms, image);
    };
    return (
      <div className="bg-black relative h-[60vh] lg:h-[70vh]">
        <CameraView
          ref={cameraViewRef as any}
          garmentType={garmentType}
          unit={unit}
          onCapture={onCaptureProxy}
          onLiveMeasurements={setLiveMeasurements}
          userHeightCm={profile?.height_cm || undefined}
        />
      </div>
    );
  }

  return (
    <WorkflowProvider>
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/5 to-muted/10">
      <OnboardingModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      {/* Header */}
      <AppHeader
        stage={stage}
        onBackToCamera={handleBackToCamera}
        onViewHistory={handleViewHistory}
        onViewAnalytics={handleViewAnalytics}
        onSignOut={handleSignOut}
        hasMeasurements={measurements.length > 0}
      />

  {/* Top workflow bar under header */}
  <WorkflowNav />

  {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {stage === 'camera' ? (
          <div className="min-h-full flex flex-col lg:flex-row">
            {/* Left Sidebar */}
            <div className="hidden lg:flex w-80 bg-card/30 backdrop-blur-sm border-r border-border/50 flex-col lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
              {/* Garment Selection */}
              <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Select Garment Type</h3>
                <GarmentTabs value={garmentType} onValueChange={handleGarmentChange} />
              </div>

              {/* Instructions */}
              <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">How to Measure</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0 mt-0.5">1</div>
                    <p>Position yourself 3-4 feet from the camera in good lighting</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0 mt-0.5">2</div>
                    <p>Stand with arms slightly away from your body in a T-pose</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0 mt-0.5">3</div>
                    <p>Keep your body straight and face the camera directly</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0 mt-0.5">4</div>
                    <p>Wait for the quality indicators to turn green</p>
                  </div>
                </div>
              </div>

              {/* Live Measurements Preview */}
              <div className="p-6 flex-1">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Live Measurements</h3>
                {liveMeasurements.length > 0 ? (
                  <div className="space-y-2">
                    {liveMeasurements.slice(0, 6).map((measurement, index) => (
                      <div key={`${measurement.type}-${index}`} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">{measurement.label}</span>
                        <span className="text-sm text-primary font-semibold">
                          {measurement.value.toFixed(1)} {measurement.unit}
                        </span>
                      </div>
                    ))}
                    {liveMeasurements.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{liveMeasurements.length - 6} more measurements
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Ruler className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start camera to see live measurements
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Mobile Garment Tabs */}
              <div className="lg:hidden border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="px-4 py-3">
                  <GarmentTabs value={garmentType} onValueChange={handleGarmentChange} />
                </div>
              </div>

              {/* Workflow pages */}
              <div className="border-b bg-background">
                <WorkflowContent garmentType={garmentType} onGarmentChange={handleGarmentChange} />
              </div>

              {/* Camera View (measurement step only) */}
              <CameraSection garmentType={garmentType} />

              {/* Online Store Section */}
              <div className="bg-gradient-to-br from-background via-muted/5 to-muted/10 border-t border-border/50">
                <div className="py-8">
                  <div className="text-center mb-8 px-6">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Shop Perfect-Fit Clothing
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Now that you have your measurements, browse our collection of clothes designed to fit you perfectly
                    </p>
                  </div>
                  <OnlineStore />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:flex w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 flex-col sticky top-0 h-screen overflow-y-auto">
              {/* Progress & Tips */}
              <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Measurement Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Measurements</span>
                    <span className="font-semibold">{measurements.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Selected Garment</span>
                    <span className="font-semibold capitalize">{garmentType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Unit System</span>
                    <span className="font-semibold uppercase">{unit}</span>
                  </div>
                </div>
              </div>

              {/* Recent Measurements */}
              <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Recent History</h3>
                {measurements.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {measurements.slice(0, 3).map((measurement, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium capitalize">{measurement.garmentType}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(measurement.capturedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {measurement.measurements.length} measurements
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleViewHistory}
                      className="w-full mt-3"
                    >
                      View All History
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                      <Ruler className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No measurements yet
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="p-6 flex-1">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Pro Tips</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="font-medium text-primary mb-1">Better Accuracy</p>
                    <p>Wear fitted clothing for more precise measurements</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="font-medium text-primary mb-1">Consistent Results</p>
                    <p>Take measurements at the same time of day</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="font-medium text-primary mb-1">Perfect Lighting</p>
                    <p>Natural daylight works best for pose detection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : stage === 'results' && result ? (
          <div className="w-full h-full overflow-auto bg-gradient-to-br from-background via-muted/5 to-muted/10 p-6">
            <div className="max-w-4xl mx-auto">
              <ResultsScreen
                result={result}
                onRetake={handleRetake}
                onToggleUnit={handleToggleUnit}
                currentUnit={unit}
                onSave={handleSave}
              />
            </div>
          </div>
        ) : stage === 'history' ? (
          <div className="w-full h-full overflow-auto bg-gradient-to-br from-background via-muted/5 to-muted/10 p-6">
            <div className="max-w-6xl mx-auto">
              <HistoryView
                measurements={measurements}
                onView={handleViewMeasurement}
                onDelete={deleteMeasurement}
                loading={loading}
              />
            </div>
          </div>
        ) : stage === 'analytics' ? (
          <div className="w-full h-full overflow-auto bg-gradient-to-br from-background via-muted/5 to-muted/10 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold">Measurement Analytics</h2>
                <p className="text-muted-foreground mt-1">
                  Track your measurement history and trends
                </p>
              </div>
              <MeasurementAnalytics measurements={measurements} />
            </div>
          </div>
        ) : null}
      </main>
      {/* Bottom action bar with export stub */}
      <ActionBarWithExport onStartCamera={handleStartCameraFromBar} />
    </div>
    </WorkflowProvider>
  );
};

export default Index;

function ActionBarWithExport({ onStartCamera }: { onStartCamera: () => void }) {
  // bridge inside provider to access workflow selection and implement an export stub
  const { selection } = useWorkflow();
  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      selection,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `tailor-cnc-export-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <BottomActionBar onStartCamera={onStartCamera} onExport={handleExport} />;
}
