import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createCustomOrder } from '@/integrations/supabase/profiles';
import { Loader2, Palette, Sparkles, FileText, Check, Ruler, DollarSign } from 'lucide-react';
import type { Product } from '@/types/store';
import type { BodyMeasurements } from '@/types/profile';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  measurements: BodyMeasurements;
}

export const CustomOrderModal = ({
  isOpen,
  onClose,
  product,
  measurements,
}: CustomOrderModalProps) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'fabric' | 'customization' | 'review'>('fabric');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      fabric_type: '',
      fabric_color: '',
      pattern: 'solid',
      special_instructions: '',
      custom_features: {} as Record<string, any>,
    },
  });

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [customizationPrice, setCustomizationPrice] = useState(0);

  const fabricTypes = [
    { value: 'cotton', label: 'Cotton', price: 0 },
    { value: 'wool', label: 'Wool', price: 50 },
    { value: 'linen', label: 'Linen', price: 30 },
    { value: 'silk', label: 'Silk', price: 100 },
    { value: 'polyester', label: 'Polyester Blend', price: -20 },
  ];

  const patterns = [
    { value: 'solid', label: 'Solid' },
    { value: 'striped', label: 'Striped' },
    { value: 'checked', label: 'Checked' },
    { value: 'plaid', label: 'Plaid' },
  ];

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const basePrice = product.price;
      const totalPrice = basePrice + customizationPrice;

      await createCustomOrder({
        user_id: user.id,
        product_id: product.id,
        order_type: 'personal_tailor',
        measurements_snapshot: measurements,
        fabric_type: data.fabric_type,
        fabric_color: selectedColor.name,
        pattern: data.pattern,
        custom_features: data.custom_features,
        base_price: basePrice,
        customization_price: customizationPrice,
        total_price: totalPrice,
        special_instructions: data.special_instructions,
        status: 'pending',
      });

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: 'Your custom tailored item will be created with your exact measurements',
        duration: 5000,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create custom order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = product.price + customizationPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Custom Tailor: {product.name}
          </DialogTitle>
          <DialogDescription>
            Customize your order with your exact measurements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Measurements Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="font-medium">Using Your Measurements</span>
                <Badge variant="secondary" className="ml-auto">
                  {measurements.measurement_method === 'ai_camera' ? 'AI Scanned' : 'Manual'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This garment will be tailored to your exact body measurements for a perfect fit.
              </p>
            </CardContent>
          </Card>

          {/* Customization Tabs */}
          <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fabric">
                <Palette className="h-4 w-4 mr-2" />
                Fabric & Color
              </TabsTrigger>
              <TabsTrigger value="customization">
                <Sparkles className="h-4 w-4 mr-2" />
                Customization
              </TabsTrigger>
              <TabsTrigger value="review">
                <FileText className="h-4 w-4 mr-2" />
                Review
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="fabric" className="space-y-4">
                <div className="space-y-2">
                  <Label>Fabric Type</Label>
                  <Select
                    value={form.watch('fabric_type')}
                    onValueChange={(value) => {
                      form.setValue('fabric_type', value);
                      const fabric = fabricTypes.find((f) => f.value === value);
                      if (fabric) {
                        setCustomizationPrice((prev) => prev + fabric.price);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricTypes.map((fabric) => (
                        <SelectItem key={fabric.value} value={fabric.value}>
                          {fabric.label} {fabric.price !== 0 && `(${fabric.price > 0 ? '+' : ''}$${fabric.price})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          selectedColor.hex === color.hex
                            ? 'border-primary scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded-md mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-xs font-medium text-center">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pattern</Label>
                  <Select
                    value={form.watch('pattern')}
                    onValueChange={(value) => form.setValue('pattern', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="customization" className="space-y-4">
                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Any special requests or adjustments..."
                    rows={6}
                    {...form.register('special_instructions')}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Additional Customization Options</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can add detailed customization requests in the special instructions above.
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Button style and color</li>
                    <li>Pocket preferences</li>
                    <li>Collar style</li>
                    <li>Lining options</li>
                    <li>Monogram or embroidery</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product:</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric:</span>
                          <span className="font-medium capitalize">{form.watch('fabric_type') || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color:</span>
                          <span className="font-medium">{selectedColor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pattern:</span>
                          <span className="font-medium capitalize">{form.watch('pattern')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span>${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customization:</span>
                          <span>${customizationPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2">
                          <span>Total Price:</span>
                          <span className="text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h5 className="font-medium mb-1">Perfect Fit Guarantee</h5>
                          <p className="text-sm text-muted-foreground">
                            This item will be crafted to your exact measurements. Production time: 2-3 weeks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              {currentStep === 'review' ? (
                <Button onClick={form.handleSubmit(handleSubmit)} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Custom Order'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (currentStep === 'fabric') setCurrentStep('customization');
                    else if (currentStep === 'customization') setCurrentStep('review');
                  }}
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

