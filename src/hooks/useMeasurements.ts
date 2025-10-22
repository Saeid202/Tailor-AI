import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MeasurementResult } from '@/types/measurements';
import { toast } from 'sonner';

export interface StoredMeasurement {
  id: string;
  user_id: string;
  garment_type: string;
  unit: string;
  measurements: any;
  image_url: string | null;
  created_at: string;
}

export function useMeasurements(userId: string | undefined) {
  const [measurements, setMeasurements] = useState<StoredMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchMeasurements();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      console.error('Error fetching measurements:', error);
      toast.error('Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  const saveMeasurement = async (result: MeasurementResult) => {
    try {
      let imageUrl: string | null = null;

      // Upload image to storage if available
      if (result.imageDataUrl && userId) {
        const base64Data = result.imageDataUrl.split(',')[1];
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());
        const fileName = `${userId}/${Date.now()}-${result.garmentType}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('measurement-images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('measurement-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      // Save measurement to database
      const { data, error } = await supabase
        .from('measurements')
        .insert([{
          user_id: userId!,
          garment_type: result.garmentType,
          unit: result.measurements[0]?.unit || 'cm',
          measurements: result.measurements as any,
          image_url: imageUrl,
        }])
        .select()
        .single();

      if (error) throw error;

      setMeasurements(prev => [data, ...prev]);
      toast.success('Measurement saved successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving measurement:', error);
      toast.error('Failed to save measurement');
      return { data: null, error };
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeasurements(prev => prev.filter(m => m.id !== id));
      toast.success('Measurement deleted successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting measurement:', error);
      toast.error('Failed to delete measurement');
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
