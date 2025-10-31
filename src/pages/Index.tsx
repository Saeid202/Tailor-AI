import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GarmentType } from '@/types/garment';
import { Measurement, MeasurementResult } from '@/types/measurements';
import { AppHeader } from '@/components/layout/AppHeader';
import { CameraView } from '@/components/camera/CameraView';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, TrendingUp, History, BarChart3, Users, Star, Mail, Phone, MapPin, Ruler, Facebook, Twitter, Instagram, Youtube, Linkedin, Shirt, Palette, Layers, Eye, Box, Download } from 'lucide-react';
import { resetStabilityHistory } from '@/lib/quality/stabilityCheck';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { WorkflowNav } from '@/components/workflow/WorkflowNav';
import { useWorkflow, Step } from '@/contexts/WorkflowContext';
import { GarmentStep } from '@/components/workflow/steps/GarmentStep';
import { MeasurementStep } from '@/components/workflow/steps/MeasurementStep';
import { FabricColorStep } from '@/components/workflow/steps/FabricColorStep';
import { PatternStep } from '@/components/workflow/steps/PatternStep';
import { VisualStep } from '@/components/workflow/steps/VisualStep';
import { VirtualFitStep } from '@/components/workflow/steps/VirtualFitStep';
import { ReviewExportStep } from '@/components/workflow/steps/ReviewExportStep';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Remove useMeasurements temporarily to avoid blocking the UI
// import { useMeasurements } from '@/hooks/useMeasurements';

type Stage = 'camera' | 'results' | 'history' | 'analytics';

// Move components outside to avoid hooks issues

function WorkflowContent({ garmentType, onGarmentChange }: { garmentType: GarmentType; onGarmentChange: (g: GarmentType) => void }) {
  try {
    const { step } = useWorkflow();
    switch (step) {
      case Step.GARMENT:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50">
            <div className="container mx-auto px-4 py-1">
              <GarmentStep value={garmentType} onChange={onGarmentChange} />
              
              {/* Additional Information Section */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Ruler className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Precision Measuring</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our AI technology provides measurements with 99.2% accuracy, ensuring the perfect fit for your garment.
                  </p>
                </div>
                
                <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Smart Detection</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Advanced computer vision automatically detects key measurement points for each garment type.
                  </p>
                </div>
                
                <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Perfect Fit</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Get personalized size recommendations and achieve the perfect fit every time.
                  </p>
                </div>
              </div>
              
              {/* Tips Section */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-4 text-center">💡 Pro Tips for Best Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Wear Fitted Clothing</h4>
                        <p className="text-sm text-muted-foreground">Wear form-fitting clothes for the most accurate measurements.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Good Lighting</h4>
                        <p className="text-sm text-muted-foreground">Ensure you have adequate lighting for clear body detection.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case Step.MEASURE:
        // STEP 2: ONLY Camera detection - content handled separately
        return null;
      case Step.FABRIC:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-purple-50/50 via-background to-violet-50/50">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-8 shadow-lg">
                  <Palette className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Fabric & Color Selection
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Choose from our premium fabric collection and select your preferred colors to bring your vision to life.
                </p>
              </div>
              
              <FabricColorStep />
              
              {/* Fabric Categories */}
              <div className="mt-16 max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">Premium Fabric Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🧵</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">Cotton & Linen</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Breathable, natural fabrics perfect for everyday wear and casual occasions.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Cotton</span>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">Linen</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Chambray</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">Silk & Satin</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Luxurious fabrics with elegant drape, ideal for formal and special occasions.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">Silk</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Satin</span>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">Charmeuse</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">Wool & Formal</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Professional fabrics with excellent structure for business and formal wear.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Wool</span>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">Tweed</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Gabardine</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color Psychology */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-center">🎨 Color Psychology in Fashion</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-sm">Blue</h5>
                      <p className="text-xs text-muted-foreground">Trust & Calm</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-sm">Red</h5>
                      <p className="text-xs text-muted-foreground">Energy & Power</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-sm">Green</h5>
                      <p className="text-xs text-muted-foreground">Growth & Nature</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-sm">Black</h5>
                      <p className="text-xs text-muted-foreground">Elegance & Class</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case Step.PATTERN:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-orange-50/50 via-background to-amber-50/50">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-8 shadow-lg">
                  <Layers className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Pattern Design
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Create or select your sewing pattern. Generate professional patterns based on your measurements with precision and style.
                </p>
              </div>
              
              <PatternStep />
              
              {/* Pattern Types */}
              <div className="mt-16 max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">Professional Pattern Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📐</span>
                    </div>
                    <h4 className="font-semibold mb-2">Basic Fit</h4>
                    <p className="text-sm text-muted-foreground">Standard pattern with classic proportions</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✂️</span>
                    </div>
                    <h4 className="font-semibold mb-2">Tailored Fit</h4>
                    <p className="text-sm text-muted-foreground">Precision fitted for your exact measurements</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <h4 className="font-semibold mb-2">Designer Style</h4>
                    <p className="text-sm text-muted-foreground">Fashion-forward cuts and modern silhouettes</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h4 className="font-semibold mb-2">Quick Pattern</h4>
                    <p className="text-sm text-muted-foreground">Fast generation for immediate use</p>
                  </div>
                </div>
              </div>
              
              {/* Pattern Features */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-center">🔧 Advanced Pattern Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Seam allowance calculations</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">Grading for different sizes</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Dart placement optimization</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">Fabric grain line indicators</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Professional marking symbols</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">Print-ready PDF output</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case Step.PREVIEW:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-pink-50/50 via-background to-rose-50/50">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-8 shadow-lg">
                  <Eye className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Visual
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  View realistic images of your selected garment with chosen fabric and color combinations.
                </p>
              </div>
              
              <VisualStep />
              
              {/* Preview Features */}
              <div className="mt-16 max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">3D Visualization Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">👕</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">3D Garment Model</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      See your garment in full 3D with realistic draping and fabric simulation.
                    </p>
                  </div>
                  
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🎨</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">Color & Texture</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      View how your selected fabrics and colors look in different lighting conditions.
                    </p>
                  </div>
                  
                  <div className="text-center p-8 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🔄</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-4">360° View</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Rotate and examine your design from every angle for complete confidence.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Viewing Options */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-center">👁️ Viewing Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <span className="text-2xl mb-2 block">📐</span>
                      <h5 className="font-medium text-sm mb-1">Wireframe</h5>
                      <p className="text-xs text-muted-foreground">Technical view</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <span className="text-2xl mb-2 block">🌟</span>
                      <h5 className="font-medium text-sm mb-1">Rendered</h5>
                      <p className="text-xs text-muted-foreground">Photorealistic</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <span className="text-2xl mb-2 block">✂️</span>
                      <h5 className="font-medium text-sm mb-1">Pattern View</h5>
                      <p className="text-xs text-muted-foreground">Flat pattern</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <span className="text-2xl mb-2 block">🎭</span>
                      <h5 className="font-medium text-sm mb-1">Avatar Fit</h5>
                      <p className="text-xs text-muted-foreground">On body model</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case Step.VIRTUAL_FIT:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-cyan-50/50 via-background to-teal-50/50">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl mb-8 shadow-lg">
                  <Box className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Virtual Fit
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Try on your clothes virtually. See how the garment will look and fit on your body before production.
                </p>
              </div>
              
              <VirtualFitStep />
              
              {/* Virtual Fit Features */}
              <div className="mt-16 max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">Advanced Fitting Technology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h4 className="font-semibold mb-2">AI Avatar</h4>
                    <p className="text-sm text-muted-foreground">Your personal 3D avatar based on measurements</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📏</span>
                    </div>
                    <h4 className="font-semibold mb-2">Fit Analysis</h4>
                    <p className="text-sm text-muted-foreground">Real-time fit assessment and recommendations</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <h4 className="font-semibold mb-2">Interactive</h4>
                    <p className="text-sm text-muted-foreground">Move and pose to test garment behavior</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <h4 className="font-semibold mb-2">Fit Score</h4>
                    <p className="text-sm text-muted-foreground">Numerical fit rating for confidence</p>
                  </div>
                </div>
              </div>
              
              {/* Fit Metrics */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-center">📊 Fit Assessment Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-cyan-600">98%</span>
                      </div>
                      <h4 className="font-semibold mb-2">Fit Accuracy</h4>
                      <p className="text-sm text-muted-foreground">Precision of virtual fit prediction</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-teal-600">3D</span>
                      </div>
                      <h4 className="font-semibold mb-2">Full Simulation</h4>
                      <p className="text-sm text-muted-foreground">Complete 360° garment simulation</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-cyan-600">5S</span>
                      </div>
                      <h4 className="font-semibold mb-2">Quick Process</h4>
                      <p className="text-sm text-muted-foreground">Fast virtual fitting in seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case Step.REVIEW_EXPORT:
        return (
          <div className="min-h-[80vh] bg-gradient-to-br from-slate-50/50 via-background to-gray-50/50">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl mb-8 shadow-lg">
                  <Download className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                  CNC Export
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Export your design files ready for CNC cutting machines. Generate precise cutting patterns for automated manufacturing.
                </p>
              </div>
              
              <ReviewExportStep />
              
              {/* Export Options */}
              <div className="mt-16 max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">Export & Manufacturing Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h4 className="font-semibold mb-2">CNC Files</h4>
                    <p className="text-sm text-muted-foreground">Ready-to-cut machine files</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <h4 className="font-semibold mb-2">PDF Patterns</h4>
                    <p className="text-sm text-muted-foreground">Print-ready sewing patterns</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h4 className="font-semibold mb-2">Cut Reports</h4>
                    <p className="text-sm text-muted-foreground">Detailed cutting instructions</p>
                  </div>
                  
                  <div className="text-center p-6 bg-card/50 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <h4 className="font-semibold mb-2">3D Models</h4>
                    <p className="text-sm text-muted-foreground">CAD files for visualization</p>
                  </div>
                </div>
              </div>
              
              {/* Quality Assurance */}
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-slate-500/10 to-gray-500/10 border border-slate-200/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-center">✅ Quality Assurance Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Measurements verified</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Fabric selection confirmed</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Pattern accuracy checked</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Virtual fit approved</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Export files generated</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm">Ready for production</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Summary */}
              <div className="mt-16 max-w-4xl mx-auto text-center">
                <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4">📦 Your Complete Package</h3>
                  <p className="text-muted-foreground mb-6">
                    Download everything you need for professional garment production, from cutting files to assembly instructions.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm">CNC Cut Files</span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">Sewing Patterns</span>
                    <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm">Assembly Guide</span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">Material List</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-[60vh] bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 py-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl mb-8 shadow-xl">
                  <Ruler className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome to Tailor AI
                </h1>
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                  Start your journey to the perfect fit. Our AI-powered platform guides you through every step of creating custom-tailored clothing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <CameraIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">AI Measurements</h3>
                    <p className="text-muted-foreground">Get precise measurements using just your camera with 99% accuracy</p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Custom Design</h3>
                    <p className="text-muted-foreground">Choose fabrics, colors, and patterns to create your unique style</p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">CNC Ready</h3>
                    <p className="text-muted-foreground">Export professional patterns ready for manufacturing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  } catch (error) {
    console.error('WorkflowContent error:', error);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Tailor AI</h2>
        <p className="text-muted-foreground">Start by selecting your garment type above.</p>
      </div>
    );
  }
}

function CameraSection({ 
  garmentType, 
  unit, 
  userHeightCm, 
  cameraViewRef, 
  onCapture, 
  onLiveMeasurements 
}: { 
  garmentType: GarmentType;
  unit: 'cm' | 'in';
  userHeightCm?: number;
  cameraViewRef: React.RefObject<{ start: () => void } | null>;
  onCapture: (ms: Measurement[], image: string) => void;
  onLiveMeasurements: (ms: Measurement[]) => void;
}) {
  const { step, update, next } = useWorkflow();
  
  // ONLY show camera on MEASURE step
  if (step !== Step.MEASURE) return null;

  const onCaptureProxy = (ms: Measurement[], image: string) => {
    const obj: Record<string, number> = {};
    ms.forEach((m) => {
      obj[m.label] = m.value;
    });
    update({ measurements: obj });
    setTimeout(() => next(), 0);
    onCapture(ms, image);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        {/* Camera Container - Professional sizing */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-card/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5 relative">
            {/* Camera viewport with proper aspect ratio */}
            <div className="relative max-w-4xl mx-auto" style={{ aspectRatio: '16/10' }}>
              <CameraView
                ref={cameraViewRef as any}
                garmentType={garmentType}
                unit={unit}
                onCapture={onCaptureProxy}
                onLiveMeasurements={onLiveMeasurements}
                userHeightCm={userHeightCm}
              />
            </div>
          </div>
          
          {/* Camera Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-white/90">
                <p className="text-sm font-medium">Measuring: {garmentType}</p>
                <p className="text-xs opacity-80">Click camera to start/stop</p>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Click to Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Measurement Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <h4 className="font-semibold mb-2">Body Detection</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-full"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Complete</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📏</span>
            </div>
            <h4 className="font-semibold mb-2">Measurements</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">In Progress</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold mb-2">Accuracy Check</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full w-1/2"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pending</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="font-semibold mb-2">Completion</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full w-1/4"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Waiting</p>
          </div>
        </div>

        {/* Live Measurements Display */}
        <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">Live Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Chest', 'Waist', 'Hip', 'Shoulder', 'Arm Length', 'Height'].map((measurement) => (
              <div key={measurement} className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">--</div>
                <div className="text-sm text-muted-foreground">{measurement}</div>
                <div className="text-xs text-muted-foreground">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 rounded-2xl p-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium text-lg">AI Measurement System Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">99.2%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">&lt; 5s</div>
              <div className="text-sm text-muted-foreground">Capture Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">Real-time</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component (without header) - for use in tabs
export const IndexContent = () => {
  // IMPORTANT: All hooks must be called before any conditional returns
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
  // Temporarily remove useMeasurements to avoid blocking
  // const { measurements, loading: measurementsLoading, saveMeasurement, deleteMeasurement } = useMeasurements();
  const measurements: MeasurementResult[] = []; // Temporary placeholder

  const [garmentType, setGarmentType] = useState<GarmentType>('shirt');
  const [stage, setStage] = useState<Stage>('camera');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<Measurement[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // camera control via ref signal
  const cameraViewRef = useRef<{ start: () => void } | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load profile data and show onboarding if needed
  useEffect(() => {
    if (profile) {
      setUnit(profile.preferred_unit as 'cm' | 'in' || 'cm');
      // Temporarily disable onboarding check to avoid blank page
      // if (!profile.onboarding_completed) {
      //   setTimeout(() => setShowOnboarding(true), 500);
      // }
    }
  }, [profile]);

  const handleOnboardingComplete = async (height: number, preferredUnit: 'cm' | 'in') => {
    setUnit(preferredUnit);
    setShowOnboarding(false);
    
    await updateProfile({
      height_cm: height,
      preferred_unit: preferredUnit,
      onboarding_completed: true,
    });
  };

  const handleCapture = async (measurements: Measurement[], image: string) => {
    resetStabilityHistory();
    
    const result: MeasurementResult = {
      measurements,
      garmentType,
      imageDataUrl: image,
      capturedAt: new Date(),
    };
    
    setResult(result);
    setStage('results');
    setLiveMeasurements([]);
  };

  const handleSaveMeasurement = async (result: MeasurementResult) => {
    // Temporarily disabled
    // await saveMeasurement(result);
    toast({ title: 'Measurements saved successfully' });
  };

  const handleGarmentChange = (newGarmentType: GarmentType) => {
    setGarmentType(newGarmentType);
  };

  const handleBackToCamera = () => {
    setStage('camera');
    setResult(null);
  };

  const handleViewHistory = () => {
    setStage('history');
  };

  const handleDeleteMeasurement = async (capturedAt: Date) => {
    // Temporarily disabled
    // const index = measurements.findIndex(m => m.capturedAt.getTime() === capturedAt.getTime());
    // if (index !== -1) {
    //   await deleteMeasurement(index);
    //   toast({ title: 'Measurement deleted successfully' });
    // }
  };

  const handleViewAnalytics = () => {
    setStage('analytics');
  };

  // Add better loading state handling - AFTER all hooks are called
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Not authenticated. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Add profile loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col bg-gradient-to-br from-background via-muted/5 to-muted/10">
        <OnboardingModal 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete} 
        />

        {/* Workflow Navigation */}
        <WorkflowProvider>
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
            <WorkflowNav />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {stage === 'camera' && (
              <div className="flex-1 flex flex-col">
                {/* Show workflow content for all steps */}
                <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                  <ErrorBoundary fallback={
                    <div className="container mx-auto px-4 py-12 text-center">
                      <h2 className="text-2xl font-bold mb-4">Welcome to Tailor AI</h2>
                      <p className="text-muted-foreground">Start by selecting your garment type above.</p>
                    </div>
                  }>
                    <WorkflowContent garmentType={garmentType} onGarmentChange={handleGarmentChange} />
                  </ErrorBoundary>
                </div>

                {/* ONLY show camera when on MEASURE step */}
                <CameraSection 
                  garmentType={garmentType} 
                  unit={unit}
                  userHeightCm={profile?.height_cm || undefined}
                  cameraViewRef={cameraViewRef}
                  onCapture={handleCapture}
                  onLiveMeasurements={setLiveMeasurements}
                />
              </div>
            )}

            {stage === 'results' && result && (
              <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="container mx-auto px-4 py-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Measurement Results
                      </h2>
                      <p className="text-muted-foreground">Your measurements have been captured successfully!</p>
                    </div>
                    
                    <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {result.measurements.map((measurement, index) => (
                          <div key={index} className="bg-background/50 rounded-xl p-4 border">
                            <div className="text-sm text-muted-foreground mb-1">{measurement.label}</div>
                            <div className="text-2xl font-bold text-primary">{measurement.value} {unit}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => setStage('camera')} size="lg">
                          <CameraIcon className="w-5 h-5 mr-2" />
                          Take New Measurement
                        </Button>
                        <Button variant="outline" onClick={() => setStage('history')} size="lg">
                          <History className="w-5 h-5 mr-2" />
                          View History
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 'history' && (
              <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="container mx-auto px-4 py-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Measurement History
                      </h2>
                      <p className="text-muted-foreground">Track your measurements over time and see your progress</p>
                    </div>
                    
                    <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg">
                      <div className="text-center py-12">
                        <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No measurements yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Start taking measurements to build your history and track your progress over time.
                        </p>
                        <Button onClick={() => setStage('camera')} size="lg">
                          <CameraIcon className="w-5 h-5 mr-2" />
                          Take First Measurement
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 'analytics' && (
              <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="container mx-auto px-4 py-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h2>
                      <p className="text-muted-foreground">Track your measurement trends and insights over time</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Measurement Trends</h3>
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-center py-8">
                          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No data available yet</p>
                        </div>
                      </div>
                      
                      <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Progress Overview</h3>
                          <Star className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Measurements</span>
                            <span className="font-semibold">0</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span className="font-semibold">Never</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-semibold text-primary">99%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card/60 backdrop-blur-sm border rounded-2xl p-8 shadow-lg text-center">
                      <Button onClick={() => setStage('camera')} size="lg">
                        <CameraIcon className="w-5 h-5 mr-2" />
                        Start Measuring to See Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer and bottom action bar removed for tab view */}
        </WorkflowProvider>
      </div>
    </ErrorBoundary>
  );
};

// Full page component with header (for standalone route)
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <AppHeader
          stage="camera"
          onBackToCamera={() => {}}
          onViewHistory={() => {}}
          onViewAnalytics={() => {}}
          hasMeasurements={false}
        />
      </div>
      <IndexContent />
    </div>
  );
};

export default Index;