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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMeasurements([]);
        setLoading(false);
        return;
      }

      // Explicit user_id filter instead of relying solely on RLS
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
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

      let imageUrl: string | null = null;

      // Upload image to storage instead of storing base64
      if (result.imageDataUrl && result.imageDataUrl.startsWith('data:image')) {
        try {
          // Convert base64 to blob
          const response = await fetch(result.imageDataUrl);
          const blob = await response.blob();
          
          // Create unique filename
          const timestamp = Date.now();
          const filename = `${user.id}/${timestamp}.jpg`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('measurement-images')
            .upload(filename, blob, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('measurement-images')
            .getPublicUrl(filename);
          
          imageUrl = urlData.publicUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue without image rather than failing entirely
        }
      }

      const { error } = await supabase.from('measurements').insert([{
        user_id: user.id,
        garment_type: result.garmentType,
        measurements: result.measurements as any,
        unit: result.measurements[0]?.unit || 'cm',
        image_url: imageUrl,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the measurement to find the image URL
      const { data: measurement } = await supabase
        .from('measurements')
        .select('image_url')
        .eq('user_id', user.id)
        .eq('created_at', capturedAt.toISOString())
        .maybeSingle();

      // Delete image from storage if it exists
      if (measurement?.image_url) {
        const urlParts = measurement.image_url.split('/');
        const filename = `${user.id}/${urlParts[urlParts.length - 1]}`;
        
        await supabase.storage
          .from('measurement-images')
          .remove([filename]);
      }

      // Delete measurement record with explicit user_id check
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('user_id', user.id)
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
