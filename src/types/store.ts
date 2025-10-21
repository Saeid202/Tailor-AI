export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'ready-made' | 'custom' | 'pattern';
  subcategory: 'shirt' | 't-shirt' | 'pant' | 'dress' | 'jacket' | 'pattern';
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  materials: string[];
  features: string[];
  customizationOptions?: CustomizationOption[];
  isCustomizable: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  measurements?: ProductMeasurements;
}

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'select' | 'color' | 'measurement' | 'text';
  options?: string[];
  priceModifier: number;
  required: boolean;
}

export interface ProductMeasurements {
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeve?: string;
  length?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ProductColor;
  customizations?: Record<string, any>;
  totalPrice: number;
}

export interface StoreFilters {
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  customizable: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
}