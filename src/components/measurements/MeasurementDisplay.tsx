import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shirt, TrendingDown, Footprints } from 'lucide-react';
import type { BodyMeasurements } from '@/types/profile';

interface MeasurementDisplayProps {
  measurement: BodyMeasurements;
}

export const MeasurementDisplay = ({ measurement }: MeasurementDisplayProps) => {
  const MeasurementItem = ({ label, value, unit }: { label: string; value?: number; unit: string }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-2 border-b last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} {unit}
        </span>
      </div>
    );
  };

  const unit = measurement.measurement_unit;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Measurements</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {measurement.measurement_method === 'ai_camera' ? 'AI Camera' : 'Manual'}
            </Badge>
            <Badge variant="outline">
              {measurement.measurement_unit}
            </Badge>
          </div>
        </div>
        {measurement.created_at && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(measurement.created_at).toLocaleDateString()}
          </p>
        )}
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
              Upper
            </TabsTrigger>
            <TabsTrigger value="lower" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Lower
            </TabsTrigger>
            <TabsTrigger value="feet" className="gap-2">
              <Footprints className="h-4 w-4" />
              Feet
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general">
              <div className="space-y-1">
                <MeasurementItem label="Height" value={measurement.height} unit={unit} />
                <MeasurementItem label="Weight" value={measurement.weight} unit="kg" />
              </div>
            </TabsContent>

            <TabsContent value="upper">
              <div className="space-y-1">
                <MeasurementItem label="Neck Circumference" value={measurement.neck_circumference} unit={unit} />
                <MeasurementItem label="Shoulder Width" value={measurement.shoulder_width} unit={unit} />
                <MeasurementItem label="Chest Circumference" value={measurement.chest_circumference} unit={unit} />
                <MeasurementItem label="Bust Circumference" value={measurement.bust_circumference} unit={unit} />
                <MeasurementItem label="Waist Circumference" value={measurement.waist_circumference} unit={unit} />
                <MeasurementItem label="Upper Arm Circumference" value={measurement.upper_arm_circumference} unit={unit} />
                <MeasurementItem label="Wrist Circumference" value={measurement.wrist_circumference} unit={unit} />
                <MeasurementItem label="Arm Length" value={measurement.arm_length} unit={unit} />
                <MeasurementItem label="Sleeve Length" value={measurement.sleeve_length} unit={unit} />
                <MeasurementItem label="Back Width" value={measurement.back_width} unit={unit} />
                <MeasurementItem label="Front Length" value={measurement.front_length} unit={unit} />
                <MeasurementItem label="Back Length" value={measurement.back_length} unit={unit} />
              </div>
            </TabsContent>

            <TabsContent value="lower">
              <div className="space-y-1">
                <MeasurementItem label="Hip Circumference" value={measurement.hip_circumference} unit={unit} />
                <MeasurementItem label="Thigh Circumference" value={measurement.thigh_circumference} unit={unit} />
                <MeasurementItem label="Knee Circumference" value={measurement.knee_circumference} unit={unit} />
                <MeasurementItem label="Calf Circumference" value={measurement.calf_circumference} unit={unit} />
                <MeasurementItem label="Ankle Circumference" value={measurement.ankle_circumference} unit={unit} />
                <MeasurementItem label="Inseam Length" value={measurement.inseam_length} unit={unit} />
                <MeasurementItem label="Outseam Length" value={measurement.outseam_length} unit={unit} />
                <MeasurementItem label="Rise" value={measurement.rise} unit={unit} />
              </div>
            </TabsContent>

            <TabsContent value="feet">
              <div className="space-y-1">
                <MeasurementItem label="US Shoe Size" value={measurement.shoe_size_us} unit="" />
                <MeasurementItem label="EU Shoe Size" value={measurement.shoe_size_eu} unit="" />
                <MeasurementItem label="UK Shoe Size" value={measurement.shoe_size_uk} unit="" />
                <MeasurementItem label="Foot Length" value={measurement.foot_length} unit={unit} />
                <MeasurementItem label="Foot Width" value={measurement.foot_width} unit={unit} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {measurement.notes && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-sm text-muted-foreground">{measurement.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

