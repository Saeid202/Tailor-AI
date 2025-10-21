import { GarmentTabs } from '@/components/layout/GarmentTabs';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { GarmentType } from '@/types/garment';

export function GarmentStep({ value, onChange }: { value: GarmentType; onChange: (v: GarmentType) => void }) {
  const { update, next } = useWorkflow();
  const handleChange = (v: GarmentType) => {
    onChange(v);
    // sync to workflow selection so validation can pass
    const mapped = v === 't-shirt' ? 'tshirt' : v;
    update({ garmentType: mapped as any });
    // auto-advance to Measurement when valid
    setTimeout(() => next(), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Choose your garment</h2>
        <p className="text-muted-foreground mb-4">Pick the base category to tailor. You can switch anytime.</p>
        <div className="rounded-2xl border bg-card/60 backdrop-blur p-5 shadow-sm">
          <GarmentTabs value={value} onValueChange={handleChange} />
          <p className="text-sm text-muted-foreground mt-4">
            Select the type of garment you want to tailor. You can change this later.
          </p>
        </div>
      </div>
    </div>
  );
}
