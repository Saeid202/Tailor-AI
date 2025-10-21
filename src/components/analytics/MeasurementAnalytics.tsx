import { Card } from '@/components/ui/card';
import { MeasurementResult } from '@/types/measurements';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface MeasurementAnalyticsProps {
  measurements: MeasurementResult[];
  selectedMeasurementType?: string;
}

export function MeasurementAnalytics({ measurements, selectedMeasurementType }: MeasurementAnalyticsProps) {
  if (measurements.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No measurement history available yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Take your first measurement to start tracking your progress
        </p>
      </Card>
    );
  }

  // Get unique measurement types
  const measurementTypes = Array.from(
    new Set(measurements.flatMap(r => r.measurements.map(m => m.type)))
  );

  // Prepare chart data
  const chartData = measurements
    .sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime())
    .map(result => {
      const dataPoint: any = {
        date: format(result.capturedAt, 'MMM d'),
        fullDate: result.capturedAt.toLocaleDateString()
      };
      
      result.measurements.forEach(m => {
        dataPoint[m.type] = m.value;
      });
      
      return dataPoint;
    });

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Measurement Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {measurementTypes.map((type, idx) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Measurements</div>
          <div className="text-2xl font-bold mt-1">{measurements.length}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Last Measured</div>
          <div className="text-2xl font-bold mt-1">
            {format(measurements[measurements.length - 1].capturedAt, 'MMM d')}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Confidence</div>
          <div className="text-2xl font-bold mt-1">
            {Math.round(
              measurements.reduce((sum, r) => 
                sum + r.measurements.reduce((s, m) => s + m.confidence, 0) / r.measurements.length, 0
              ) / measurements.length * 100
            )}%
          </div>
        </Card>
      </div>
    </div>
  );
}
