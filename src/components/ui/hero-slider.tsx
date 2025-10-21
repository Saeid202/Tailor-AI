import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Sparkles, Zap, Camera, Ruler, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideContent {
  id: string;
  type: 'image' | 'video' | 'demo';
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  media?: {
    src: string;
    alt?: string;
    poster?: string;
  };
  cta: {
    primary: string;
    secondary?: string;
  };
  stats?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  gradient: string;
}

interface HeroSliderProps {
  slides: SlideContent[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

export function HeroSlider({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  onPrimaryAction,
  onSecondaryAction,
  className 
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section 
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-background via-background to-muted/30",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Gradient */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-1000 ease-in-out",
          currentSlideData.gradient
        )}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-bounce delay-500" />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Content Side */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            {currentSlideData.badge && (
              <div className="inline-block animate-fade-in">
                <Badge 
                  variant="secondary" 
                  className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentSlideData.badge}
                </Badge>
              </div>
            )}

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="block opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  {currentSlideData.title.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  {currentSlideData.title.split(' ').slice(2).join(' ')}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary/80 font-medium opacity-0 animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                {currentSlideData.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-slide-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              {currentSlideData.description}
            </p>

            {/* Stats */}
            {currentSlideData.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-0 animate-slide-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                {currentSlideData.stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      {stat.icon}
                      <span className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-slide-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
              <Button 
                size="lg"
                onClick={onPrimaryAction}
                className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
              >
                {currentSlideData.cta.primary}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {currentSlideData.cta.secondary && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={onSecondaryAction}
                  className="text-lg h-14 px-8 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  {currentSlideData.cta.secondary}
                </Button>
              )}
            </div>
          </div>

          {/* Media Side */}
          <div className="relative opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20 shadow-2xl">
              {currentSlideData.media ? (
                currentSlideData.type === 'video' ? (
                  <video
                    src={currentSlideData.media.src}
                    poster={currentSlideData.media.poster}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentSlideData.media.src}
                    alt={currentSlideData.media.alt}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                // Placeholder content when no media is provided
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-primary/80 font-medium">App Demo Preview</p>
                  </div>
                </div>
              )}
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live Demo</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce delay-1000" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-primary/20">
          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentSlide 
                    ? "bg-primary scale-125" 
                    : "bg-primary/30 hover:bg-primary/50"
                )}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 border-l border-primary/20 pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="w-8 h-8 p-0 hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="w-8 h-8 p-0 hover:bg-primary/10"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="w-8 h-8 p-0 hover:bg-primary/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%` 
          }}
        />
      </div>
    </section>
  );
}