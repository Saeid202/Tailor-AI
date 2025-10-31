import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getActiveMeasurements, getAllMeasurements, setActiveMeasurement } from '@/integrations/supabase/profiles';
import { MeasurementForm } from '@/components/measurements/MeasurementForm';
import { MeasurementDisplay } from '@/components/measurements/MeasurementDisplay';
import { Camera, Ruler, History, Plus, Loader2, AlertCircle } from 'lucide-react';
import type { BodyMeasurements } from '@/types/profile';

export const BodyMeasurementsPanel = () => {
  const [activeMeasurement, setActiveMeasurementState] = useState<BodyMeasurements | null>(null);
  const [measurementHistory, setMeasurementHistory] = useState<BodyMeasurements[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'history'>('view');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [active, history] = await Promise.all([
        getActiveMeasurements(user.id),
        getAllMeasurements(user.id),
      ]);

      setActiveMeasurementState(active);
      setMeasurementHistory(history);

      // If no measurements, go to edit mode
      if (!active) {
        setActiveTab('edit');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load measurements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementSaved = () => {
    loadMeasurements();
    setActiveTab('view');
    toast({
      title: 'Measurements Saved',
      description: 'Your body measurements have been updated successfully',
    });
  };

  const handleSetActive = async (measurementId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await setActiveMeasurement(user.id, measurementId);
      loadMeasurements();
      toast({
        title: 'Active Measurement Updated',
        description: 'This measurement set is now active',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update active measurement',
        variant: 'destructive',
      });
    }
  };

  const handleStartAICamera = () => {
    navigate('/app'); // Navigate to main app where camera scanning is available
    toast({
      title: 'AI Camera Ready',
      description: 'Use the camera feature in the main app to scan your body',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Measurement Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Body Measurements</CardTitle>
              <CardDescription>
                Add your measurements for perfect-fit custom tailoring
              </CardDescription>
            </div>
            {activeMeasurement ? (
              <Badge variant="secondary" className="gap-1">
                <Ruler className="h-3 w-3" />
                Measurements Added
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                No Measurements
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setActiveTab('edit')}
              className="gap-2"
              variant={activeMeasurement ? 'outline' : 'default'}
            >
              <Ruler className="h-4 w-4" />
              {activeMeasurement ? 'Update Measurements' : 'Add Measurements Manually'}
            </Button>
            <Button
              onClick={handleStartAICamera}
              className="gap-2"
              variant="outline"
            >
              <Camera className="h-4 w-4" />
              Use AI Camera Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view" disabled={!activeMeasurement}>
            <Ruler className="h-4 w-4 mr-2" />
            View
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Plus className="h-4 w-4 mr-2" />
            {activeMeasurement ? 'Edit' : 'Add'}
          </TabsTrigger>
          <TabsTrigger value="history" disabled={measurementHistory.length === 0}>
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="view">
            {activeMeasurement ? (
              <MeasurementDisplay measurement={activeMeasurement} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Measurements Available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your body measurements to enable custom tailoring
                  </p>
                  <Button onClick={() => setActiveTab('edit')}>
                    Add Measurements
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edit">
            <MeasurementForm
              existingMeasurement={activeMeasurement}
              onSave={handleMeasurementSaved}
            />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Measurement History</CardTitle>
                <CardDescription>
                  View and manage your previous measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurementHistory.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(measurement.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Method: {measurement.measurement_method || 'Manual'}
                          {measurement.is_active && (
                            <Badge variant="secondary" className="ml-2">Active</Badge>
                          )}
                        </p>
                      </div>
                      {!measurement.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActive(measurement.id)}
                        >
                          Set as Active
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

