import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/ui/hero-slider';
import { OnlineStore } from '@/components/store/OnlineStore';
import { ArrowRight, Ruler, Smartphone, Zap, CheckCircle, Camera, BarChart3, Users, Star, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Github, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  // Hero slider data
  const heroSlides = [
    {
      id: 'main',
      type: 'demo' as const,
      title: 'Perfect Fit Every Time',
      subtitle: 'AI-Powered Precision Measurements',
      description: 'Get professional-grade body measurements instantly using just your camera. No tape measure required. Powered by advanced AI technology.',
      badge: 'AI-Powered Measurements',
      media: {
        // src: '/path/to/your/app-demo-video.mp4', // Add your video here
        // poster: '/path/to/your/video-thumbnail.jpg', // Video thumbnail
        src: 'https://images.unsplash.com/photo-1611996575749-79a3a250f79e?w=800&h=600&fit=crop', // Placeholder image
  alt: 'Tailor AI App Demo'
      },
      cta: {
        primary: 'Start Measuring',
        secondary: 'Watch Demo'
      },
      stats: [
        { value: '99%', label: 'Accuracy', icon: <Star className="w-4 h-4 text-yellow-500" /> },
        { value: '50K+', label: 'Users', icon: <Users className="w-4 h-4 text-blue-500" /> },
        { value: '2M+', label: 'Measurements', icon: <BarChart3 className="w-4 h-4 text-green-500" /> },
        { value: '<10s', label: 'Avg. Time', icon: <Zap className="w-4 h-4 text-purple-500" /> }
      ],
      gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10'
    },
    {
      id: 'technology',
      type: 'image' as const,
      title: 'Advanced AI Technology',
      subtitle: 'Computer Vision & Machine Learning',
      description: 'Our cutting-edge algorithms analyze your body posture and proportions to deliver measurements with professional-grade accuracy.',
      badge: 'Technology Showcase',
      media: {
        src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', // AI/Tech themed image
        alt: 'AI Technology Visualization'
      },
      cta: {
        primary: 'Try It Now',
        secondary: 'Learn More'
      },
      stats: [
        { value: '15+', label: 'Measurements', icon: <Camera className="w-4 h-4 text-indigo-500" /> },
        { value: '3', label: 'Garment Types', icon: <Ruler className="w-4 h-4 text-emerald-500" /> },
        { value: '24/7', label: 'Available', icon: <Zap className="w-4 h-4 text-orange-500" /> },
        { value: 'Free', label: 'To Start', icon: <Star className="w-4 h-4 text-pink-500" /> }
      ],
      gradient: 'bg-gradient-to-br from-blue-500/10 via-background to-purple-500/10'
    },
    {
      id: 'results',
      type: 'image' as const,
      title: 'Instant Results',
      subtitle: 'Professional Quality in Seconds',
      description: 'Get detailed measurements for shirts, t-shirts, and pants instantly. Track your progress over time with our analytics dashboard.',
      badge: 'Real-Time Processing',
      media: {
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop', // Results/Analytics themed image
        alt: 'Measurement Results Dashboard'
      },
      cta: {
        primary: 'Get Started',
        secondary: 'View Features'
      },
      stats: [
        { value: '1-3s', label: 'Processing', icon: <Zap className="w-4 h-4 text-yellow-500" /> },
        { value: '95%+', label: 'Satisfied', icon: <Star className="w-4 h-4 text-green-500" /> },
        { value: 'Cloud', label: 'Sync', icon: <BarChart3 className="w-4 h-4 text-blue-500" /> },
        { value: 'Secure', label: 'Data', icon: <Users className="w-4 h-4 text-purple-500" /> }
      ],
      gradient: 'bg-gradient-to-br from-green-500/10 via-background to-teal-500/10'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <Header variant="landing" />

      {/* Hero Slider Section */}
      <HeroSlider 
        slides={heroSlides}
        onPrimaryAction={() => navigate('/app')}
        onSecondaryAction={() => {
          // Scroll to features section or show demo
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Online Store Section */}
      <OnlineStore />

      {/* Partners & Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div className="container mx-auto px-4">

          {/* Testimonials Section */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-8">What Our Customers Say</h3>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Testimonial 1 */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Tailor AI completely changed how I shop online. The measurements are incredibly accurate, and I finally get clothes that fit perfectly every time!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">SL</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah Lee</p>
                  <p className="text-sm text-muted-foreground">Fashion Enthusiast</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "As a tailor, I was skeptical about AI measurements. But Tailor AI's precision rivals my manual measurements. It's now an essential tool for my business."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold">Michael Rivera</p>
                  <p className="text-sm text-muted-foreground">Professional Tailor</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The convenience is unmatched! I can get accurate measurements at home in seconds. No more guessing sizes or dealing with returns."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">AS</span>
                </div>
                <div>
                  <p className="font-semibold">Alex Smith</p>
                  <p className="text-sm text-muted-foreground">Busy Professional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2M+</div>
              <div className="text-sm text-muted-foreground">Measurements Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-background via-muted/20 to-muted/40 border-t">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
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
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Revolutionizing fashion with AI-powered precision measurements. Get the perfect fit every time with our cutting-edge technology.
              </p>
              
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
              <nav className="flex flex-col space-y-3">
                <button onClick={() => navigate('/app')} className="text-muted-foreground hover:text-primary transition-colors text-left">
                  Get Started
                </button>
                <button onClick={() => navigate('/app')} className="text-muted-foreground hover:text-primary transition-colors text-left">
                  Try Demo
                </button>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Services
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </nav>
            </div>

            {/* Products & Services */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Products</h3>
              <nav className="flex flex-col space-y-3">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Body Measurements
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Custom Tailoring
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Ready-Made Clothes
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Sewing Patterns
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Size Analytics
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Developer API
                </a>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:hello@tailor.ai" className="text-muted-foreground hover:text-primary transition-colors">
                      hello@tailor.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">
                      123 Innovation Street<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="space-y-3">
                <h4 className="font-medium">Stay Updated</h4>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button size="sm" className="px-4">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-border py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
                <p>© 2025 Tailor AI. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span>for perfect fit</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
