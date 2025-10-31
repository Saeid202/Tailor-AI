import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createMeasurements, updateMeasurements } from '@/integrations/supabase/profiles';
import { Loader2, User, Shirt, TrendingDown, Footprints } from 'lucide-react';
import type { BodyMeasurements, MeasurementUnit } from '@/types/profile';

interface MeasurementFormProps {
  existingMeasurement?: BodyMeasurements | null;
  onSave: () => void;
}

export const MeasurementForm = ({ existingMeasurement, onSave }: MeasurementFormProps) => {
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<MeasurementUnit>(
    existingMeasurement?.measurement_unit || 'cm'
  );
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      // General
      height: existingMeasurement?.height || undefined,
      weight: existingMeasurement?.weight || undefined,
      
      // Upper Body
      neck_circumference: existingMeasurement?.neck_circumference || undefined,
      shoulder_width: existingMeasurement?.shoulder_width || undefined,
      chest_circumference: existingMeasurement?.chest_circumference || undefined,
      bust_circumference: existingMeasurement?.bust_circumference || undefined,
      waist_circumference: existingMeasurement?.waist_circumference || undefined,
      upper_arm_circumference: existingMeasurement?.upper_arm_circumference || undefined,
      wrist_circumference: existingMeasurement?.wrist_circumference || undefined,
      arm_length: existingMeasurement?.arm_length || undefined,
      sleeve_length: existingMeasurement?.sleeve_length || undefined,
      back_width: existingMeasurement?.back_width || undefined,
      front_length: existingMeasurement?.front_length || undefined,
      back_length: existingMeasurement?.back_length || undefined,
      
      // Lower Body
      hip_circumference: existingMeasurement?.hip_circumference || undefined,
      thigh_circumference: existingMeasurement?.thigh_circumference || undefined,
      knee_circumference: existingMeasurement?.knee_circumference || undefined,
      calf_circumference: existingMeasurement?.calf_circumference || undefined,
      ankle_circumference: existingMeasurement?.ankle_circumference || undefined,
      inseam_length: existingMeasurement?.inseam_length || undefined,
      outseam_length: existingMeasurement?.outseam_length || undefined,
      rise: existingMeasurement?.rise || undefined,
      
      // Shoe Size
      shoe_size_us: existingMeasurement?.shoe_size_us || undefined,
      shoe_size_eu: existingMeasurement?.shoe_size_eu || undefined,
      shoe_size_uk: existingMeasurement?.shoe_size_uk || undefined,
      foot_length: existingMeasurement?.foot_length || undefined,
      foot_width: existingMeasurement?.foot_width || undefined,
      
      // Notes
      notes: existingMeasurement?.notes || '',
    },
  });

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const measurementData = {
        ...data,
        user_id: user.id,
        measurement_method: 'manual' as const,
        measurement_unit: unit,
      };

      if (existingMeasurement) {
        await updateMeasurements(existingMeasurement.id, measurementData);
      } else {
        await createMeasurements(measurementData);
      }

      onSave();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save measurements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const MeasurementInput = ({ name, label }: { name: string; label: string }) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={name}
          type="number"
          step="0.1"
          placeholder="0.0"
          {...form.register(name, { valueAsNumber: true })}
        />
        <span className="flex items-center text-sm text-muted-foreground min-w-[40px]">
          {unit}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {existingMeasurement ? 'Update Measurements' : 'Add Measurements'}
              </CardTitle>
              <CardDescription>
                Enter your body measurements for custom-fit clothing
              </CardDescription>
            </div>
            <Select value={unit} onValueChange={(v) => setUnit(v as MeasurementUnit)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centimeters</SelectItem>
                <SelectItem value="inch">Inches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="gap-2">
                <User className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="upper" className="gap-2">
                <Shirt className="h-4 w-4" />
                Upper Body
              </TabsTrigger>
              <TabsTrigger value="lower" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Lower Body
              </TabsTrigger>
              <TabsTrigger value="feet" className="gap-2">
                <Footprints className="h-4 w-4" />
                Feet
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput name="height" label="Height" />
                  <MeasurementInput name="weight" label="Weight (kg)" />
                </div>
              </TabsContent>

              <TabsContent value="upper" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput name="neck_circumference" label="Neck Circumference" />
                  <MeasurementInput name="shoulder_width" label="Shoulder Width" />
                  <MeasurementInput name="chest_circumference" label="Chest Circumference" />
                  <MeasurementInput name="bust_circumference" label="Bust Circumference" />
                  <MeasurementInput name="waist_circumference" label="Waist Circumference" />
                  <MeasurementInput name="upper_arm_circumference" label="Upper Arm Circumference" />
                  <MeasurementInput name="wrist_circumference" label="Wrist Circumference" />
                  <MeasurementInput name="arm_length" label="Arm Length" />
                  <MeasurementInput name="sleeve_length" label="Sleeve Length" />
                  <MeasurementInput name="back_width" label="Back Width" />
                  <MeasurementInput name="front_length" label="Front Length" />
                  <MeasurementInput name="back_length" label="Back Length" />
                </div>
              </TabsContent>

              <TabsContent value="lower" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput name="hip_circumference" label="Hip Circumference" />
                  <MeasurementInput name="thigh_circumference" label="Thigh Circumference" />
                  <MeasurementInput name="knee_circumference" label="Knee Circumference" />
                  <MeasurementInput name="calf_circumference" label="Calf Circumference" />
                  <MeasurementInput name="ankle_circumference" label="Ankle Circumference" />
                  <MeasurementInput name="inseam_length" label="Inseam Length" />
                  <MeasurementInput name="outseam_length" label="Outseam Length" />
                  <MeasurementInput name="rise" label="Rise" />
                </div>
              </TabsContent>

              <TabsContent value="feet" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput name="shoe_size_us" label="US Shoe Size" />
                  <MeasurementInput name="shoe_size_eu" label="EU Shoe Size" />
                  <MeasurementInput name="shoe_size_uk" label="UK Shoe Size" />
                  <MeasurementInput name="foot_length" label="Foot Length" />
                  <MeasurementInput name="foot_width" label="Foot Width" />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about your measurements..."
                {...form.register('notes')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Measurements'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

