import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/integrations/supabase/profiles';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types/profile';

const preferencesSchema = z.object({
  preferred_style: z.string().optional(),
});

const clothingOptions = [
  'Formal Wear',
  'Casual Wear',
  'Business Casual',
  'Sportswear',
  'Traditional',
  'Modern',
  'Vintage',
  'Minimalist',
];

interface ProfilePreferencesProps {
  profile: UserProfile | null;
  onUpdate: () => void;
}

export const ProfilePreferences = ({ profile, onUpdate }: ProfilePreferencesProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    profile?.clothing_preferences || []
  );
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_style: profile?.preferred_style || '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof preferencesSchema>) => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      await updateUserProfile(profile.id, {
        ...data,
        clothing_preferences: selectedPreferences,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
        <CardDescription>
          Tell us about your style preferences for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="preferred_style">Preferred Style</Label>
            <Input
              id="preferred_style"
              placeholder="e.g., Modern, Classic, Casual"
              {...form.register('preferred_style')}
            />
          </div>

          <div className="space-y-3">
            <Label>Clothing Preferences</Label>
            <div className="grid grid-cols-2 gap-3">
              {clothingOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={selectedPreferences.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPreferences([...selectedPreferences, option]);
                      } else {
                        setSelectedPreferences(
                          selectedPreferences.filter((p) => p !== option)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={option}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

