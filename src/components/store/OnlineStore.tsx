import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductDetailModal } from '@/components/store/ProductDetailModal';
import { useCart } from '@/contexts/CartContext';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Star, 
  Ruler, 
  Palette, 
  Scissors, 
  Sparkles,
  Plus,
  Minus,
  Eye,
  ShoppingBag,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, StoreFilters } from '@/types/store';

interface OnlineStoreProps {
  className?: string;
}

export function OnlineStore({ className }: OnlineStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState<StoreFilters>({
    category: [],
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    inStock: true,
    customizable: false,
    sortBy: 'popular'
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Use cart context
  const { cart, wishlist, addToCart, removeFromCart, toggleWishlist, cartTotal, cartItemCount } = useCart();

  // Sample product data
  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton Shirt',
      description: 'Luxurious cotton shirt with perfect fit guarantee. Made from premium Egyptian cotton.',
      price: 89.99,
      originalPrice: 119.99,
      category: 'ready-made',
      subcategory: 'shirt',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Navy', hex: '#1e3a8a' },
        { name: 'Black', hex: '#000000' }
      ],
      materials: ['100% Egyptian Cotton'],
      features: ['Wrinkle-resistant', 'Breathable', 'Pre-shrunk'],
      isCustomizable: false,
      inStock: true,
      rating: 4.8,
      reviewCount: 124,
      tags: ['premium', 'cotton', 'formal']
    },
    {
      id: '2',
      name: 'Custom Tailored Suit',
      description: 'Bespoke suit tailored to your exact measurements. Choose from premium fabrics and customization options.',
      price: 299.99,
      category: 'custom',
      subcategory: 'jacket',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop'],
      sizes: ['Custom'],
      colors: [
        { name: 'Charcoal', hex: '#36454f' },
        { name: 'Navy', hex: '#1e3a8a' },
        { name: 'Black', hex: '#000000' },
        { name: 'Brown', hex: '#8b4513' }
      ],
      materials: ['Wool', 'Cotton Blend', 'Linen'],
      features: ['100% Custom Fit', 'Premium Fabrics', 'Hand-stitched Details'],
      customizationOptions: [
        {
          id: 'fabric',
          name: 'Fabric Type',
          type: 'select',
          options: ['Wool', 'Cotton Blend', 'Linen', 'Silk Blend'],
          priceModifier: 0,
          required: true
        },
        {
          id: 'lapel',
          name: 'Lapel Style',
          type: 'select',
          options: ['Notched', 'Peak', 'Shawl'],
          priceModifier: 25,
          required: true
        }
      ],
      isCustomizable: true,
      inStock: true,
      rating: 4.9,
      reviewCount: 89,
      tags: ['custom', 'suit', 'formal', 'tailored']
    },
    {
      id: '3',
      name: 'Casual T-Shirt Pattern',
      description: 'Digital sewing pattern for a comfortable, modern t-shirt. Includes sizes XS-XXL with detailed instructions.',
      price: 12.99,
      category: 'pattern',
      subcategory: 't-shirt',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [],
      materials: ['Digital Pattern'],
      features: ['PDF Download', 'Size Chart Included', 'Step-by-step Guide'],
      isCustomizable: false,
      inStock: true,
      rating: 4.6,
      reviewCount: 67,
      tags: ['pattern', 'casual', 'diy', 'digital']
    },
    {
      id: '4',
      name: 'Smart Casual Pants',
      description: 'Versatile pants perfect for work or weekend. Made with stretch fabric for comfort and mobility.',
      price: 69.99,
      originalPrice: 89.99,
      category: 'ready-made',
      subcategory: 'pant',
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop'],
      sizes: ['28', '30', '32', '34', '36', '38', '40'],
      colors: [
        { name: 'Khaki', hex: '#c3b091' },
        { name: 'Navy', hex: '#1e3a8a' },
        { name: 'Black', hex: '#000000' },
        { name: 'Grey', hex: '#6b7280' }
      ],
      materials: ['Cotton Stretch Blend'],
      features: ['Stretch Fabric', 'Wrinkle-resistant', 'Moisture-wicking'],
      isCustomizable: false,
      inStock: true,
      rating: 4.7,
      reviewCount: 156,
      tags: ['pants', 'casual', 'stretch', 'comfortable']
    },
    {
      id: '5',
      name: 'Custom Evening Dress',
      description: 'Elegant evening dress made to your measurements. Perfect for special occasions.',
      price: 199.99,
      category: 'custom',
      subcategory: 'dress',
      images: ['https://images.unsplash.com/photo-1566479179817-c0dfe0b18c02?w=400&h=500&fit=crop'],
      sizes: ['Custom'],
      colors: [
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1e3a8a' },
        { name: 'Burgundy', hex: '#800020' },
        { name: 'Emerald', hex: '#50c878' }
      ],
      materials: ['Silk', 'Chiffon', 'Satin'],
      features: ['Custom Fit', 'Premium Fabrics', 'Hand-finished Seams'],
      customizationOptions: [
        {
          id: 'length',
          name: 'Dress Length',
          type: 'select',
          options: ['Knee-length', 'Midi', 'Floor-length'],
          priceModifier: 0,
          required: true
        },
        {
          id: 'neckline',
          name: 'Neckline Style',
          type: 'select',
          options: ['V-neck', 'Round', 'Off-shoulder', 'Halter'],
          priceModifier: 15,
          required: true
        }
      ],
      isCustomizable: true,
      inStock: true,
      rating: 4.9,
      reviewCount: 43,
      tags: ['dress', 'evening', 'custom', 'elegant']
    },
    {
      id: '6',
      name: 'Classic Shirt Pattern',
      description: 'Timeless button-up shirt pattern. Professional quality with multiple collar and cuff options.',
      price: 15.99,
      category: 'pattern',
      subcategory: 'shirt',
      images: ['https://images.unsplash.com/photo-1603252109303-2751441b5bf7?w=400&h=500&fit=crop'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [],
      materials: ['Digital Pattern'],
      features: ['Multi-size Pattern', 'Collar Variations', 'Professional Finish'],
      isCustomizable: false,
      inStock: true,
      rating: 4.8,
      reviewCount: 91,
      tags: ['pattern', 'shirt', 'classic', 'professional']
    }
  ];

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Customizable filter
    if (filters.customizable) {
      filtered = filtered.filter(product => product.isCustomizable);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchQuery, activeCategory, filters]);

  return (
    <section className={cn("py-20 bg-gradient-to-b from-background to-muted/20", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Our Collection
            </span>
          </h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for clothes, patterns, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="h-12 px-6">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Price Range</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={500}
                    step={10}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Quick Select */}
          <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
            <SelectTrigger className="w-[200px] h-12">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Cart Button */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="h-12 px-6 relative">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Shopping Cart ({cartItemCount} items)</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">${item.totalPrice.toFixed(2)} x {item.quantity}</p>
                            {item.selectedSize && <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total: ${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="all" className="text-sm">All Items</TabsTrigger>
            <TabsTrigger value="ready-made" className="text-sm">Ready-Made</TabsTrigger>
            <TabsTrigger value="custom" className="text-sm">Custom Tailored</TabsTrigger>
            <TabsTrigger value="pattern" className="text-sm">Sewing Patterns</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-8">
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onViewDetails={(product) => {
                    setSelectedProduct(product);
                    setIsProductModalOpen(true);
                  }}
                  isInWishlist={wishlist.includes(product.id)}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: string, color?: any) => void;
  onToggleWishlist: (productId: string) => void;
  onViewDetails: (product: Product) => void;
  isInWishlist: boolean;
}

function ProductCard({ product, onAddToCart, onToggleWishlist, onViewDetails, isInWishlist }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/5] overflow-hidden">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.originalPrice && (
            <Badge variant="destructive" className="text-xs px-2 py-1">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Badge>
          )}
          {product.isCustomizable && (
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
              Custom
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => onToggleWishlist(product.id)}
        >
          <Heart className={cn("w-4 h-4", isInWishlist && "fill-red-500 text-red-500")} />
        </Button>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Info */}
          <div>
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-3 h-3",
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          {/* Color Options */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Colors:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      selectedColor?.hex === color.hex ? "border-primary scale-110" : "border-gray-200"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground self-center">+{product.colors.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" onClick={() => onViewDetails(product)} size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            onClick={handleAddToCart}
            disabled={product.sizes.length > 0 && !selectedSize && product.category !== 'pattern'}
            size="sm"
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {product.category === 'pattern' ? 'Download' : 'Add'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}