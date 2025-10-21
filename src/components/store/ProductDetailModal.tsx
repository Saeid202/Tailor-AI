import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Ruler, 
  Scissors, 
  Sparkles,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types/store';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  
  const { addToCart, toggleWishlist, wishlist } = useCart();

  if (!product) return null;

  const isInWishlist = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, customizations);
    onClose();
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    if (product.customizationOptions) {
      Object.entries(customizations).forEach(([optionId, value]) => {
        const option = product.customizationOptions?.find(opt => opt.id === optionId);
        if (option) {
          total += option.priceModifier;
        }
      });
    }
    return total;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all",
                      selectedImage === index ? "border-primary" : "border-gray-200"
                    )}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price and Rating */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl font-bold">${calculateTotalPrice().toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.originalPrice && (
                  <Badge variant="destructive">
                    Save ${(product.originalPrice - product.price).toFixed(0)}
                  </Badge>
                )}
                {product.isCustomizable && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Scissors className="w-3 h-3 mr-1" />
                    Customizable
                  </Badge>
                )}
                {product.category === 'pattern' && (
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Digital Pattern
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <h3 className="font-semibold mb-2">Materials</h3>
              <p className="text-muted-foreground">{product.materials.join(', ')}</p>
            </div>

            <Separator />

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Color {selectedColor && `- ${selectedColor.name}`}
                </Label>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        selectedColor?.hex === color.hex ? "border-primary scale-110 shadow-md" : "border-gray-200"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && product.category !== 'pattern' && (
              <div>
                <Label className="text-base font-medium mb-3 block">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Customization Options */}
            {product.customizationOptions && product.customizationOptions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Customization Options</h3>
                <div className="space-y-4">
                  {product.customizationOptions.map((option) => (
                    <div key={option.id}>
                      <Label className="text-sm font-medium mb-2 block">
                        {option.name}
                        {option.priceModifier > 0 && (
                          <span className="text-primary ml-1">+${option.priceModifier}</span>
                        )}
                      </Label>
                      <Select 
                        value={customizations[option.id] || ''} 
                        onValueChange={(value) => setCustomizations(prev => ({ ...prev, [option.id]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((optionValue) => (
                            <SelectItem key={optionValue} value={optionValue}>
                              {optionValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.sizes.length > 0 && !selectedSize && product.category !== 'pattern'}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.category === 'pattern' ? 'Download Pattern' : 'Add to Cart'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => toggleWishlist(product.id)}
                  className="px-4"
                >
                  <Heart className={cn("w-5 h-5", isInWishlist && "fill-red-500 text-red-500")} />
                </Button>
              </div>

              {product.isCustomizable && (
                <Button variant="outline" size="lg" className="w-full">
                  <Ruler className="w-5 h-5 mr-2" />
                  Request Custom Quote
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free shipping on orders over $75</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="w-4 h-4 text-primary" />
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>Quality guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}