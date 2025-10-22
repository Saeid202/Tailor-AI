import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GarmentType } from '@/types/garment';
import { Measurement, MeasurementResult } from '@/types/measurements';
import { GarmentTabs } from '@/components/layout/GarmentTabs';
import { AppHeader } from '@/components/layout/AppHeader';
import { CameraView } from '@/components/camera/CameraView';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Button } from '@/components/ui/button';
import { resetStabilityHistory } from '@/lib/quality/stabilityCheck';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { WorkflowNav } from '@/components/workflow/WorkflowNav';
import { useWorkflow, Step } from '@/contexts/WorkflowContext';
import { GarmentStep } from '@/components/workflow/steps/GarmentStep';
import { MeasurementStep } from '@/components/workflow/steps/MeasurementStep';
import { FabricColorStep } from '@/components/workflow/steps/FabricColorStep';
import { PatternStep } from '@/components/workflow/steps/PatternStep';
import { VisualStep } from '@/components/workflow/steps/VisualStep';
import { VirtualFitStep } from '@/components/workflow/steps/VirtualFitStep';
import { ReviewExportStep } from '@/components/workflow/steps/ReviewExportStep';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Remove useMeasurements temporarily to avoid blocking the UI
// import { useMeasurements } from '@/hooks/useMeasurements';

type Stage = 'camera' | 'results' | 'history' | 'analytics';

// Move components outside to avoid hooks issues
function WorkflowContent({ garmentType, onGarmentChange }: { garmentType: GarmentType; onGarmentChange: (g: GarmentType) => void }) {
  try {
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
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Tailor AI</h2>
            <p className="text-muted-foreground">Start by selecting your garment type above.</p>
          </div>
        );
    }
  } catch (error) {
    console.error('WorkflowContent error:', error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Tailor AI</h2>
        <p className="text-muted-foreground">Start by selecting your garment type above.</p>
      </div>
    );
  }
}

function CameraSection({ 
  garmentType, 
  unit, 
  userHeightCm, 
  cameraViewRef, 
  onCapture, 
  onLiveMeasurements 
}: { 
  garmentType: GarmentType;
  unit: 'cm' | 'in';
  userHeightCm?: number;
  cameraViewRef: React.RefObject<{ start: () => void } | null>;
  onCapture: (ms: Measurement[], image: string) => void;
  onLiveMeasurements: (ms: Measurement[]) => void;
}) {
  const { step, update, next } = useWorkflow();
  if (step !== Step.MEASURE) return null;

  const onCaptureProxy = (ms: Measurement[], image: string) => {
    const obj: Record<string, number> = {};
    ms.forEach((m) => {
      obj[m.label] = m.value;
    });
    update({ measurements: obj });
    setTimeout(() => next(), 0);
    onCapture(ms, image);
  };

  return (
    <div className="bg-black relative h-[60vh] lg:h-[70vh]">
      <CameraView
        ref={cameraViewRef as any}
        garmentType={garmentType}
        unit={unit}
        onCapture={onCaptureProxy}
        onLiveMeasurements={onLiveMeasurements}
        userHeightCm={userHeightCm}
      />
    </div>
  );
}

const Index = () => {
  // IMPORTANT: All hooks must be called before any conditional returns
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
  // Temporarily remove useMeasurements to avoid blocking
  // const { measurements, loading: measurementsLoading, saveMeasurement, deleteMeasurement } = useMeasurements();
  const measurements: MeasurementResult[] = []; // Temporary placeholder

  const [garmentType, setGarmentType] = useState<GarmentType>('shirt');
  const [stage, setStage] = useState<Stage>('camera');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<Measurement[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // camera control via ref signal
  const cameraViewRef = useRef<{ start: () => void } | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load profile data and show onboarding if needed
  useEffect(() => {
    if (profile) {
      setUnit(profile.preferred_unit as 'cm' | 'in' || 'cm');
      // Temporarily disable onboarding check to avoid blank page
      // if (!profile.onboarding_completed) {
      //   setTimeout(() => setShowOnboarding(true), 500);
      // }
    }
  }, [profile]);

  const handleOnboardingComplete = async (height: number, preferredUnit: 'cm' | 'in') => {
    setUnit(preferredUnit);
    setShowOnboarding(false);
    
    await updateProfile({
      height_cm: height,
      preferred_unit: preferredUnit,
      onboarding_completed: true,
    });
  };

  const handleCapture = async (measurements: Measurement[], image: string) => {
    resetStabilityHistory();
    
    const result: MeasurementResult = {
      measurements,
      garmentType,
      imageDataUrl: image,
      capturedAt: new Date(),
    };
    
    setResult(result);
    setStage('results');
    setLiveMeasurements([]);
  };

  const handleSaveMeasurement = async (result: MeasurementResult) => {
    // Temporarily disabled
    // await saveMeasurement(result);
    toast({ title: 'Measurements saved successfully' });
  };

  const handleGarmentChange = (newGarmentType: GarmentType) => {
    setGarmentType(newGarmentType);
  };

  const handleBackToCamera = () => {
    setStage('camera');
    setResult(null);
  };

  const handleViewHistory = () => {
    setStage('history');
  };

  const handleDeleteMeasurement = async (capturedAt: Date) => {
    // Temporarily disabled
    // const index = measurements.findIndex(m => m.capturedAt.getTime() === capturedAt.getTime());
    // if (index !== -1) {
    //   await deleteMeasurement(index);
    //   toast({ title: 'Measurement deleted successfully' });
    // }
  };

  const handleViewAnalytics = () => {
    setStage('analytics');
  };

  const handleStartCameraFromBar = () => {
    cameraViewRef.current?.start?.();
  };

  // Add better loading state handling - AFTER all hooks are called
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Not authenticated. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Add profile loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/5 to-muted/10">
        <OnboardingModal 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete} 
        />
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <AppHeader
            stage={stage}
            onBackToCamera={handleBackToCamera}
            onViewHistory={handleViewHistory}
            onViewAnalytics={handleViewAnalytics}
            hasMeasurements={measurements.length > 0}
          />
          
          {/* Top Navigation Tabs */}
          <div className="container mx-auto px-4">
            <GarmentTabs value={garmentType} onValueChange={setGarmentType} />
          </div>
        </div>

        {/* Workflow Navigation */}
        <WorkflowProvider>
          <div className="sticky top-[140px] z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
            <WorkflowNav />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {stage === 'camera' && (
              <div className="h-full flex flex-col">
                {/* Workflow Content */}
                <div className="flex-1 overflow-y-auto">
                  <ErrorBoundary fallback={
                    <div className="p-8 text-center">
                      <h2 className="text-2xl font-bold mb-4">Welcome to Tailor AI</h2>
                      <p className="text-muted-foreground">Start by selecting your garment type above.</p>
                    </div>
                  }>
                    <WorkflowContent garmentType={garmentType} onGarmentChange={handleGarmentChange} />
                  </ErrorBoundary>
                  
                  <CameraSection 
                    garmentType={garmentType} 
                    unit={unit}
                    userHeightCm={profile?.height_cm || undefined}
                    cameraViewRef={cameraViewRef}
                    onCapture={handleCapture}
                    onLiveMeasurements={setLiveMeasurements}
                  />
                </div>
              </div>
            )}

            {stage === 'results' && result && (
              <div className="p-4 overflow-y-auto h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Measurement Results</h2>
                  <p className="text-muted-foreground mb-6">Your measurements have been captured successfully!</p>
                  <Button onClick={() => setStage('camera')}>Take New Measurement</Button>
                </div>
              </div>
            )}

            {stage === 'history' && (
              <div className="p-4 overflow-y-auto h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Measurement History</h2>
                  <p className="text-muted-foreground mb-6">Your previous measurements will appear here.</p>
                  <Button onClick={() => setStage('camera')}>Take New Measurement</Button>
                </div>
              </div>
            )}

            {stage === 'analytics' && (
              <div className="p-4 overflow-y-auto h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                  <p className="text-muted-foreground mb-6">Track your measurement trends over time.</p>
                  <Button onClick={() => setStage('camera')}>Take New Measurement</Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar - Only show on camera stage */}
          {stage === 'camera' && (
            <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50">
              <div className="container mx-auto px-4 py-3">
                <Button 
                  onClick={handleStartCameraFromBar}
                  className="w-full"
                >
                  Start Camera
                </Button>
              </div>
            </div>
          )}
        </WorkflowProvider>
      </div>
    </ErrorBoundary>
  );
};

export default Index;