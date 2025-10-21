import { Button } from '@/components/ui/button';
import { ArrowRight, Ruler, Smartphone, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: 'Camera-Based Measurements',
      description: 'Use your device camera to capture precise body measurements in seconds'
    },
    {
      icon: Zap,
      title: 'AI-Powered Precision',
      description: 'Advanced pose detection ensures accurate measurements every time'
    },
    {
      icon: Ruler,
      title: 'Multiple Garment Types',
      description: 'Get measurements for shirts, t-shirts, and pants with ease'
    }
  ];

  const benefits = [
    'No physical measuring tape needed',
    'Save your measurements securely',
    'Get results in cm or inches',
    'Perfect fit guaranteed'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FrameFit AI</span>
          </div>
          <Button onClick={() => navigate('/app')} variant="outline">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Measurements
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Perfect Fit,
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every Time
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get professional-grade body measurements instantly using just your camera. 
            No tape measure required. Powered by advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="text-lg h-14 px-8"
            >
              Start Measuring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to accurate measurements
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-12 border">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose FrameFit AI?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Experience the future of garment measurements with our cutting-edge AI technology.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Smartphone className="h-32 w-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <div className="max-w-3xl mx-auto text-center bg-primary text-primary-foreground rounded-3xl p-12 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of users who trust FrameFit AI for accurate measurements
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate('/app')}
            className="text-lg h-14 px-8"
          >
            Try It Now - It's Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              <span className="font-semibold">FrameFit AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FrameFit AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
