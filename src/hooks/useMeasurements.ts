import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { MeasurementResult } from '@/types/measurements';

interface DbMeasurement {
  id: string;
  user_id: string;
  garment_type: string;
  measurements: any;
  unit: string;
  image_url: string | null;
  created_at: string;
}

export function useMeasurements() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMeasurements([]);
      setLoading(false);
      return;
    }

    fetchMeasurements();
  }, [user]);

  const fetchMeasurements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((m: DbMeasurement) => ({
        garmentType: m.garment_type,
        measurements: m.measurements,
        capturedAt: new Date(m.created_at),
        imageDataUrl: m.image_url || undefined,
      }));

      setMeasurements(formatted);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMeasurement = async (result: MeasurementResult) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      let imageUrl: string | null = null;

      // Upload image if present
      if (result.imageDataUrl) {
        const blob = await fetch(result.imageDataUrl).then(r => r.blob());
        const fileName = `${user.id}/${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('measurement-images')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('measurement-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Save measurement
      const { error } = await supabase
        .from('measurements')
        .insert([{
          user_id: user.id,
          garment_type: result.garmentType,
          measurements: result.measurements as any,
          unit: result.measurements[0]?.unit || 'cm',
          image_url: imageUrl,
        }]);

      if (error) throw error;

      await fetchMeasurements();
      return { error: null };
    } catch (error) {
      console.error('Error saving measurement:', error);
      return { error };
    }
  };

  const deleteMeasurement = async (index: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const measurement = measurements[index];
      const { data: dbMeasurements, error: fetchError } = await supabase
        .from('measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('garment_type', measurement.garmentType)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (!dbMeasurements?.[index]) throw new Error('Measurement not found');

      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', dbMeasurements[index].id);

      if (error) throw error;

      await fetchMeasurements();
      return { error: null };
    } catch (error) {
      console.error('Error deleting measurement:', error);
      return { error };
    }
  };

  return {
    measurements,
    loading,
    saveMeasurement,
    deleteMeasurement,
    refetch: fetchMeasurements,
  };
}
