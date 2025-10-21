import { MeasurementResult } from '@/types/measurements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryViewProps {
  measurements: MeasurementResult[];
  onView: (result: MeasurementResult) => void;
  onDelete: (capturedAt: Date) => void;
  loading: boolean;
}

export function HistoryView({ measurements, onView, onDelete, loading }: HistoryViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-lg text-muted-foreground">No saved measurements yet</p>
        <p className="text-sm text-muted-foreground">Take measurements and save them to see them here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Measurement History</h2>
          <p className="text-muted-foreground mt-1">View and manage your saved measurements</p>
        </div>

        <div className="grid gap-4">
          {measurements.map((measurement, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="capitalize">{measurement.garmentType}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(measurement.capturedAt, { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(measurement)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(measurement.capturedAt)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {measurement.imageDataUrl && (
                    <img
                      src={measurement.imageDataUrl}
                      alt="Measurement preview"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {measurement.measurements.length} measurements
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unit: {measurement.measurements[0]?.unit.toUpperCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
