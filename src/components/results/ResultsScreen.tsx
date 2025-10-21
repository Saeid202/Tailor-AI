import { MeasurementResult } from '@/types/measurements';
import { MeasurementTable } from './MeasurementTable';
import { BodyDiagram } from './BodyDiagram';
import { SizeRecommendation } from './SizeRecommendation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RotateCcw, Save, FileText } from 'lucide-react';
import { exportMeasurementsAsJSON } from '@/lib/utils/jsonExport';
import { exportMeasurementsAsPDF } from '@/lib/utils/pdfExport';

interface ResultsScreenProps {
  result: MeasurementResult;
  onRetake: () => void;
  onToggleUnit: () => void;
  currentUnit: 'cm' | 'in';
  onSave: () => void;
}

export function ResultsScreen({ result, onRetake, onToggleUnit, currentUnit, onSave }: ResultsScreenProps) {
  return (
    <div className="w-full h-full overflow-auto bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold">Measurement Results</h2>
            <p className="text-muted-foreground mt-1 capitalize">
              {result.garmentType} measurements • {result.capturedAt.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onToggleUnit} size="sm">
              Switch to {currentUnit === 'cm' ? 'inches' : 'cm'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="measurements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="diagram">Body Diagram</TabsTrigger>
            <TabsTrigger value="image">Photo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="measurements" className="space-y-4">
            <SizeRecommendation 
              measurements={result.measurements}
              garmentType={result.garmentType}
            />
            
            <MeasurementTable measurements={result.measurements} />
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 <strong>Tip:</strong> Measurements with confidence below 70% are highlighted in yellow. 
              Consider retaking for better accuracy.
            </div>
          </TabsContent>
          
          <TabsContent value="diagram">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Measurement Locations</h3>
              <BodyDiagram 
                measurements={result.measurements}
                garmentType={result.garmentType}
              />
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>The diagram shows where each measurement is taken on your body.</p>
                <p>Highlighted lines indicate the primary measurements for {result.garmentType}.</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="image">
            {result.imageDataUrl ? (
              <Card className="overflow-hidden">
                <img
                  src={result.imageDataUrl}
                  alt="Captured pose"
                  className="w-full h-auto"
                />
              </Card>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No image available
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onRetake} variant="outline" className="flex-1 min-w-[140px]">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
          <Button onClick={onSave} variant="default" className="flex-1 min-w-[140px]">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={() => exportMeasurementsAsPDF(result)}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={() => exportMeasurementsAsJSON(result)}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
