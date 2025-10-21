import { GarmentType } from '@/types/garment';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GarmentTabsProps {
  value: GarmentType;
  onValueChange: (value: GarmentType) => void;
}

export function GarmentTabs({ value, onValueChange }: GarmentTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as GarmentType)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="shirt">Shirt</TabsTrigger>
        <TabsTrigger value="t-shirt">T-Shirt</TabsTrigger>
        <TabsTrigger value="pant">Pant</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
