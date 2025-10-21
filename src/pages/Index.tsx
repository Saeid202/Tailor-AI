import { useState, useEffect } from 'react';
import { GarmentType } from '@/types/garment';
import { Measurement, MeasurementResult } from '@/types/measurements';
import { GarmentTabs } from '@/components/layout/GarmentTabs';
import { CameraView } from '@/components/camera/CameraView';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { HistoryView } from '@/components/results/HistoryView';
import { MeasurementAnalytics } from '@/components/analytics/MeasurementAnalytics';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { HelpModal } from '@/components/ui/HelpModal';
import { Button } from '@/components/ui/button';
import { convertMeasurement } from '@/lib/utils/unitConversion';
import { resetStabilityHistory } from '@/lib/quality/stabilityCheck';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { History, Camera, LogOut, TrendingUp } from 'lucide-react';

type Stage = 'camera' | 'results' | 'history' | 'analytics';

const Index = () => {
  const [garmentType, setGarmentType] = useState<GarmentType>('shirt');
  const [stage, setStage] = useState<Stage>('camera');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [result, setResult] = useState<MeasurementResult | null>(null);
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <OnboardingModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Tailor AI</h1>
              <p className="text-sm text-muted-foreground">AI-powered body measurements</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {stage !== 'camera' && (
                <Button variant="outline" size="sm" onClick={handleBackToCamera}>
                  <Camera className="w-4 h-4 mr-2" />
                  New Measurement
                </Button>
              )}
              {stage !== 'history' && (
                <Button variant="outline" size="sm" onClick={handleViewHistory}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              )}
              {stage !== 'analytics' && measurements.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleViewAnalytics}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              )}
              <HelpModal />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {stage === 'camera' && (
            <GarmentTabs value={garmentType} onValueChange={handleGarmentChange} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {stage === 'camera' ? (
          <CameraView
            garmentType={garmentType}
            unit={unit}
            onCapture={handleCapture}
          />
        ) : stage === 'results' && result ? (
          <ResultsScreen
            result={result}
            onRetake={handleRetake}
            onToggleUnit={handleToggleUnit}
            currentUnit={unit}
            onSave={handleSave}
          />
        ) : stage === 'history' ? (
          <HistoryView
            measurements={measurements}
            onView={handleViewMeasurement}
            onDelete={deleteMeasurement}
            loading={loading}
          />
        ) : stage === 'analytics' ? (
          <div className="w-full h-full overflow-auto bg-background p-6">
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
    </div>
  );
};

export default Index;
