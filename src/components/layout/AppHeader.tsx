import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Ruler, Menu, ArrowRight, Phone, Mail, MapPin, Sparkles, Zap, Camera, BarChart3, History, TrendingUp, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { HelpModal } from '@/components/ui/HelpModal';

interface AppHeaderProps {
  stage: string;
  onBackToCamera: () => void;
  onViewHistory: () => void;
  onViewAnalytics: () => void;
  onSignOut: () => void;
  hasMeasurements: boolean;
  className?: string;
}

export function AppHeader({ 
  stage, 
  onBackToCamera, 
  onViewHistory, 
  onViewAnalytics, 
  onSignOut,
  hasMeasurements,
  className 
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

  const AppActions = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {stage !== 'camera' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBackToCamera}
          className="hidden sm:flex hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <Camera className="w-4 h-4 mr-2" />
          New Measurement
        </Button>
      )}
      {stage !== 'history' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewHistory}
          className="hidden sm:flex hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      )}
      {stage !== 'analytics' && hasMeasurements && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewAnalytics}
          className="hidden sm:flex hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      )}
      <HelpModal />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onSignOut}
        className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );

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
          
          {/* App Actions for Mobile */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-lg text-primary">Quick Actions</h3>
            {stage !== 'camera' && (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { onBackToCamera(); setIsOpen(false); }}
              >
                <Camera className="w-4 h-4 mr-2" />
                New Measurement
              </Button>
            )}
            {stage !== 'history' && (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { onViewHistory(); setIsOpen(false); }}
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            )}
            {stage !== 'analytics' && hasMeasurements && (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => { onViewAnalytics(); setIsOpen(false); }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            )}
          </div>

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
          
          <div className="pt-6 border-t space-y-3">
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={() => { onSignOut(); setIsOpen(false); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5 before:opacity-50",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Brand />
          <DesktopNavigation />
          <div className="flex items-center gap-3">
            <AppActions />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
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