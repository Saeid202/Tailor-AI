import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MeasurementResult } from '@/types/measurements';
import { useToast } from '@/hooks/use-toast';

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: MeasurementResult[] = (data || []).map((item) => ({
        garmentType: item.garment_type,
        measurements: item.measurements as any,
        capturedAt: new Date(item.created_at),
        imageDataUrl: item.image_url || undefined,
      }));

      setMeasurements(formattedData);
    } catch (error: any) {
      toast({
        title: 'Error loading measurements',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMeasurement = async (result: MeasurementResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('measurements').insert([{
        user_id: user.id,
        garment_type: result.garmentType,
        measurements: result.measurements as any,
        unit: result.measurements[0]?.unit || 'cm',
        image_url: result.imageDataUrl || null,
      }]);

      if (error) throw error;

      toast({
        title: 'Measurement saved',
        description: 'Your measurements have been saved successfully.',
      });

      await fetchMeasurements();
    } catch (error: any) {
      toast({
        title: 'Error saving measurement',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteMeasurement = async (capturedAt: Date) => {
    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('created_at', capturedAt.toISOString());

      if (error) throw error;

      toast({
        title: 'Measurement deleted',
        description: 'The measurement has been removed.',
      });

      await fetchMeasurements();
    } catch (error: any) {
      toast({
        title: 'Error deleting measurement',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  return {
    measurements,
    loading,
    saveMeasurement,
    deleteMeasurement,
    refreshMeasurements: fetchMeasurements,
  };
}
