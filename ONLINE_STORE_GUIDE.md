# Online Store Documentation

## Overview

The Online Store section is a comprehensive e-commerce component that showcases your clothing patterns, ready-made garments, and custom tailored options. It includes full shopping cart functionality, product filtering, and a beautiful user interface.

## Features

### 🛍️ **Product Catalog**
- **Ready-Made Clothing**: Pre-manufactured garments in standard sizes
- **Custom Tailored**: Bespoke items made to customer measurements
- **Sewing Patterns**: Digital downloads for DIY enthusiasts

### 🔍 **Search & Filtering**
- **Text Search**: Find products by name, description, or tags
- **Category Filters**: Filter by product type (ready-made, custom, patterns)
- **Price Range**: Adjustable price slider ($0-$500)
- **Sorting Options**: Popular, rating, price (low-high, high-low), newest

### 🛒 **Shopping Cart**
- **Add to Cart**: Quick add with size and color selection
- **Cart Management**: View, modify, and remove items
- **Real-time Total**: Dynamic price calculation
- **Persistent State**: Cart maintained across page navigation

### ❤️ **Wishlist**
- **Save for Later**: Heart icon to add/remove from wishlist
- **Persistent Storage**: Wishlist maintained across sessions

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Elegant UI**: Modern cards with hover effects

## Product Data Structure

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For sale pricing
  category: 'ready-made' | 'custom' | 'pattern';
  subcategory: 'shirt' | 't-shirt' | 'pant' | 'dress' | 'jacket' | 'pattern';
  images: string[]; // Array of image URLs
  sizes: string[]; // Available sizes
  colors: ProductColor[]; // Color options
  materials: string[]; // Fabric types
  features: string[]; // Product highlights
  customizationOptions?: CustomizationOption[]; // For custom items
  isCustomizable: boolean;
  inStock: boolean;
  rating: number; // 1-5 stars
  reviewCount: number;
  tags: string[]; // For search functionality
}
```

## Sample Products Included

### 1. **Premium Cotton Shirt** - Ready-Made
- Price: $89.99 (was $119.99)
- Colors: White, Navy, Black
- Sizes: XS-XXL
- Features: Wrinkle-resistant, Breathable, Pre-shrunk

### 2. **Custom Tailored Suit** - Custom
- Price: $299.99
- Customization: Fabric type, lapel style
- Made-to-measure with premium fabrics

### 3. **Casual T-Shirt Pattern** - Digital Pattern
- Price: $12.99
- PDF download with instructions
- Sizes: XS-XXL included

### 4. **Smart Casual Pants** - Ready-Made
- Price: $69.99 (was $89.99)
- Stretch fabric for comfort
- Multiple colors available

### 5. **Custom Evening Dress** - Custom
- Price: $199.99
- Customizable length and neckline
- Premium fabric options

### 6. **Classic Shirt Pattern** - Digital Pattern
- Price: $15.99
- Professional quality pattern
- Multiple collar variations

## How to Customize Products

### Adding New Products

1. **Update the products array** in `OnlineStore.tsx`:

```typescript
const products: Product[] = [
  // Existing products...
  {
    id: 'new-product-id',
    name: 'Your Product Name',
    description: 'Detailed product description',
    price: 99.99,
    category: 'ready-made', // or 'custom' or 'pattern'
    subcategory: 'shirt', // product type
    images: ['https://your-image-url.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Color Name', hex: '#hexcode' }
    ],
    materials: ['Material Type'],
    features: ['Feature 1', 'Feature 2'],
    isCustomizable: false,
    inStock: true,
    rating: 4.5,
    reviewCount: 42,
    tags: ['tag1', 'tag2']
  }
];
```

### Adding Product Images

1. **Place images** in the `public/images/` folder
2. **Reference them** in the product data:
```typescript
images: ['/images/your-product-1.jpg', '/images/your-product-2.jpg']
```

### Customization Options

For custom products, add customization options:

```typescript
customizationOptions: [
  {
    id: 'fabric',
    name: 'Fabric Type',
    type: 'select',
    options: ['Cotton', 'Silk', 'Wool'],
    priceModifier: 0, // Additional cost
    required: true
  }
]
```

## Cart Context

The shopping cart uses React Context for state management:

```typescript
// Access cart functionality
const { 
  cart, 
  wishlist, 
  addToCart, 
  removeFromCart, 
  toggleWishlist, 
  cartTotal, 
  cartItemCount 
} = useCart();
```

## Styling and Theming

The component uses:
- **Tailwind CSS** for utility styling
- **shadcn/ui** components for consistency
- **Custom animations** for smooth interactions
- **Responsive breakpoints** for mobile optimization

## Component Structure

```
OnlineStore/
├── OnlineStore.tsx          # Main store component
├── ProductDetailModal.tsx   # Product detail popup
├── ProductCard.tsx         # Individual product display
└── CartContext.tsx         # Shopping cart state management
```

## Integration

The store is integrated into the Landing page and appears after the hero slider:

```tsx
<HeroSlider />
<OnlineStore />
<Features />
```

## Future Enhancements

Potential additions:
- **User Reviews**: Customer review system
- **Inventory Management**: Real-time stock tracking
- **Payment Integration**: Stripe/PayPal checkout
- **Order History**: Customer purchase tracking
- **Size Guide**: Interactive sizing assistant
- **3D Product Views**: 360° product visualization
- **Recommended Products**: AI-powered suggestions

The online store provides a complete e-commerce foundation that can be easily extended with additional features as your business grows.