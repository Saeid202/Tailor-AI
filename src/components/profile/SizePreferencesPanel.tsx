import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSizePreferences, upsertSizePreference } from '@/integrations/supabase/profiles';
import { Loader2, Shirt, TrendingDown, Info } from 'lucide-react';
import type { SizePreference, GarmentType, FitPreference, LengthPreference } from '@/types/profile';

export const SizePreferencesPanel = () => {
  const [preferences, setPreferences] = useState<SizePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const garmentTypes: { type: GarmentType; label: string; icon: any }[] = [
    { type: 'shirt', label: 'Shirts', icon: Shirt },
    { type: 'pants', label: 'Pants', icon: TrendingDown },
    { type: 'jacket', label: 'Jackets', icon: Shirt },
    { type: 'dress', label: 'Dresses', icon: Shirt },
    { type: 'shoes', label: 'Shoes', icon: TrendingDown },
  ];

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const fitOptions: FitPreference[] = ['slim', 'regular', 'relaxed', 'oversized'];
  const lengthOptions: LengthPreference[] = ['short', 'regular', 'long'];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prefs = await getSizePreferences(user.id);
      setPreferences(prefs);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load size preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPreference = (garmentType: GarmentType): SizePreference | undefined => {
    return preferences.find((p) => p.garment_type === garmentType);
  };

  const handleSavePreference = async (
    garmentType: GarmentType,
    updates: Partial<SizePreference>
  ) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await upsertSizePreference({
        user_id: user.id,
        garment_type: garmentType,
        ...updates,
      });

      await loadPreferences();

      toast({
        title: 'Saved',
        description: 'Size preference updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save preference',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Size Preferences</CardTitle>
          <CardDescription>
            Set your preferred sizes for different garment types
          </CardDescription>
          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg mt-4">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              These preferences will be used as defaults when ordering custom tailored items.
              You can still adjust sizes for individual orders.
            </p>
          </div>
        </CardHeader>
      </Card>

      {garmentTypes.map(({ type, label, icon: Icon }) => {
        const pref = getPreference(type);
        
        return (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle className="text-lg">{label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Standard Size</Label>
                  <Select
                    value={pref?.standard_size || ''}
                    onValueChange={(value) =>
                      handleSavePreference(type, { standard_size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {standardSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fit Preference</Label>
                  <Select
                    value={pref?.fit_preference || ''}
                    onValueChange={(value) =>
                      handleSavePreference(type, { fit_preference: value as FitPreference })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      {fitOptions.map((fit) => (
                        <SelectItem key={fit} value={fit}>
                          {fit.charAt(0).toUpperCase() + fit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Length Preference</Label>
                  <Select
                    value={pref?.length_preference || ''}
                    onValueChange={(value) =>
                      handleSavePreference(type, { length_preference: value as LengthPreference })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      {lengthOptions.map((length) => (
                        <SelectItem key={length} value={length}>
                          {length.charAt(0).toUpperCase() + length.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

