import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ruler, Menu, ArrowRight, Phone, Mail, MapPin, Sparkles, Zap, Camera, BarChart3, User, LogOut, ShoppingCart, Package, Settings, Heart, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  variant?: 'landing' | 'app';
  className?: string;
}

export function Header({ variant = 'landing', className }: HeaderProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { cart, cartItemCount, cartTotal, removeFromCart, updateCartItem } = useCart();

  const getUserInitials = (email: string, fullName?: string) => {
    if (fullName) {
      const parts = fullName.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const navigationItems = [
    {
      title: 'About Us',
      href: '#about',
      description: 'Learn about our mission and vision',
      content: (
        <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <div className="row-span-3">
            <NavigationMenuLink asChild>
              <a
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                href="#"
              >
                <Sparkles className="h-6 w-6 text-white" />
                <div className="mb-2 mt-4 text-lg font-medium text-white">
                  Tailor AI
                </div>
                <p className="text-sm leading-tight text-white/90">
                  Revolutionizing fashion with AI-powered precision measurements
                </p>
              </a>
            </NavigationMenuLink>
          </div>
          <ListItem href="#mission" title="Our Mission">
            Democratizing perfect-fit clothing through cutting-edge AI technology
          </ListItem>
          <ListItem href="#team" title="Our Team">
            Expert engineers and fashion specialists working together
          </ListItem>
          <ListItem href="#technology" title="Technology">
            Advanced computer vision and machine learning algorithms
          </ListItem>
        </div>
      )
    },
    {
      title: 'Services',
      href: '#services',
      description: 'Explore our AI-powered solutions',
      content: (
        <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
          <ListItem href="#body-measurements" title="Body Measurements" icon={<Camera className="h-4 w-4" />}>
            Precise measurements using just your camera
          </ListItem>
          <ListItem href="#size-recommendations" title="Size Recommendations" icon={<Zap className="h-4 w-4" />}>
            AI-powered garment size suggestions
          </ListItem>
          <ListItem href="#analytics" title="Measurement Analytics" icon={<BarChart3 className="h-4 w-4" />}>
            Track your measurements over time
          </ListItem>
          <ListItem href="#api" title="Developer API" icon={<Sparkles className="h-4 w-4" />}>
            Integrate our technology into your platform
          </ListItem>
        </div>
      )
    },
    {
      title: 'Contact Us',
      href: '#contact',
      description: 'Get in touch with our team',
      content: (
        <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">hello@tailor.ai</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const Brand = () => (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg shadow-primary/25 ring-1 ring-primary/20">
          <Ruler className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse" />
      </div>
      <div className="leading-tight">
        <span className="block text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">Tailor</span>
          <span className="ml-1 text-foreground/90 font-light">AI</span>
        </span>
        <span className="hidden text-xs text-muted-foreground lg:block font-medium">Precision body measurements</span>
      </div>
    </div>
  );

  const DesktopNavigation = () => (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-2">
        {navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuTrigger className="h-10 px-4 py-2 text-sm font-medium bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-all duration-200">
              {item.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {item.content}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const CartButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart className="h-5 w-5" />
      {cartItemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {cartItemCount}
        </Badge>
      )}
    </Button>
  );

  const AuthActions = () => {
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <CartButton />
          <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={undefined} alt={user.email} />
                  <AvatarFallback>{getUserInitials(user.email || '', user.fullName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 z-50" 
              align="end" 
              onCloseAutoFocus={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => {
                  navigate('/app');
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => {
                  navigate('/profile');
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => {
                  navigate('/profile?tab=address');
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>Shipping Address</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => {
                  navigate('/profile?tab=orders');
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => {
                  setIsCartOpen(true);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Shopping Cart ({cartItemCount})</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => {
                  signOut();
                  navigate('/');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <CartButton />
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="hidden sm:inline-flex text-sm font-medium hover:bg-accent/50 transition-all duration-200"
        >
          Sign In
        </Button>
        <Button
          onClick={() => navigate('/auth')}
          className="rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 h-10 px-6 font-medium"
        >
          <span className="hidden sm:inline">Get Started</span>
          <span className="sm:hidden">Start</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  };

  const MobileNavigation = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-6 mt-6">
          <Brand />
          
          {user && (
            <div className="space-y-3 border-b pb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={undefined} alt={user.email} />
                  <AvatarFallback>{getUserInitials(user.email || '', user.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => { navigate('/app'); setIsOpen(false); }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start relative" 
                  onClick={() => { setIsOpen(false); setIsCartOpen(true); }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { navigate('/profile'); setIsOpen(false); }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile & Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { navigate('/profile?tab=address'); setIsOpen(false); }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </Button>
            </div>
          )}

          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <div key={item.title} className="space-y-3">
                <h3 className="font-semibold text-lg text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.title === 'Contact Us' && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>hello@tailor.ai</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          {!user && (
            <div className="border-b pb-4">
              <Button 
                variant="outline" 
                className="w-full justify-start relative" 
                onClick={() => { setIsOpen(false); setIsCartOpen(true); }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shopping Cart
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          
          {user ? (
            <div className="pt-6 border-t space-y-3">
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={() => { signOut(); setIsOpen(false); }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-6 border-t space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { navigate('/auth'); setIsOpen(false); }}
              >
                Sign In
              </Button>
              <Button 
                className="w-full justify-start" 
                onClick={() => { navigate('/auth'); setIsOpen(false); }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  const CartDrawer = () => (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cartItemCount})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full pt-6">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add items to your cart to get started
              </p>
              <Button onClick={() => { setIsCartOpen(false); navigate('/app'); }}>
                Browse Products
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Product Item</h4>
                      {item.selectedSize && (
                        <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Color:</span>
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="text-sm">{item.selectedColor.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem(index, { quantity: item.quantity + 1 })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold">${(item.totalPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5 before:opacity-50 before:pointer-events-none",
        className
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Brand />
            <DesktopNavigation />
            <div className="flex items-center gap-3">
              <AuthActions />
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}

const ListItem = ({ className, title, children, icon, ...props }: {
  className?: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
              {title}
            </div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};