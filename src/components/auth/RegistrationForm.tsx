import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, MapPin, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile } from '@/integrations/supabase/profiles';
import type { Gender } from '@/types/profile';

const basicInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'] as const).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

const addressSchema = z.object({
  street_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const preferencesSchema = z.object({
  preferred_style: z.string().optional(),
  clothing_preferences: z.array(z.string()).optional(),
});

type Step = 'basic' | 'address' | 'preferences';

interface RegistrationFormProps {
  email: string;
  onComplete: () => void;
}

export const RegistrationForm = ({ email, onComplete }: RegistrationFormProps) => {
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      date_of_birth: '',
      gender: undefined as Gender | undefined,
      password: '',
      confirm_password: '',
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street_address: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
    },
  });

  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_style: '',
      clothing_preferences: [] as string[],
    },
  });

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const clothingOptions = [
    'Formal Wear',
    'Casual Wear',
    'Business Casual',
    'Sportswear',
    'Traditional',
    'Modern',
    'Vintage',
    'Minimalist',
  ];

  const handleBasicInfoSubmit = async (data: z.infer<typeof basicInfoSchema>) => {
    setLoading(true);
    try {
      // Create Supabase Auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create user profile
      await createUserProfile({
        id: authData.user.id,
        email,
        full_name: data.full_name,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender,
        profile_completed: true,
        measurements_completed: false,
      });

      toast({
        title: 'Account Created! 🎉',
        description: 'Your profile has been created',
      });

      setStep('address');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (data: z.infer<typeof addressSchema>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Update profile with address
      await supabase
        .from('user_profiles')
        .update({
          street_address: data.street_address || null,
          city: data.city || null,
          state_province: data.state_province || null,
          postal_code: data.postal_code || null,
          country: data.country || null,
        })
        .eq('id', user.id);

      toast({
        title: 'Address Saved',
        description: 'Your address information has been updated',
      });

      setStep('preferences');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const data = preferencesForm.getValues();

      // Update profile with preferences and mark as completed
      await supabase
        .from('user_profiles')
        .update({
          preferred_style: data.preferred_style || null,
          clothing_preferences: selectedPreferences.length > 0 ? selectedPreferences : null,
          profile_completed: true,
        })
        .eq('id', user.id);

      toast({
        title: 'Profile Completed! ✅',
        description: 'You can now start shopping with personalized recommendations',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await supabase
        .from('user_profiles')
        .update({ profile_completed: true })
        .eq('id', user.id);

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete setup',
        variant: 'destructive',
      });
    }
  };

  if (step === 'basic') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Basic Information</h2>
          <p className="text-muted-foreground">
            Let's start with some basic details
          </p>
        </div>

        <form onSubmit={basicForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...basicForm.register('full_name')}
            />
            {basicForm.formState.errors.full_name && (
              <p className="text-sm text-destructive">
                {basicForm.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...basicForm.register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...basicForm.register('date_of_birth')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              onValueChange={(value) => basicForm.setValue('gender', value as Gender)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...basicForm.register('password')}
            />
            {basicForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {basicForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              {...basicForm.register('confirm_password')}
            />
            {basicForm.formState.errors.confirm_password && (
              <p className="text-sm text-destructive">
                {basicForm.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'address') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Address Information</h2>
          <p className="text-muted-foreground">
            Optional - You can complete this later
          </p>
        </div>

        <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              placeholder="123 Main St, Apt 4B"
              {...addressForm.register('street_address')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                {...addressForm.register('city')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state_province">State/Province</Label>
              <Input
                id="state_province"
                placeholder="NY"
                {...addressForm.register('state_province')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="10001"
                {...addressForm.register('postal_code')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="USA"
                {...addressForm.register('country')}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('basic')}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleSkipToProfile}
            className="w-full"
          >
            Skip for Now
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Style Preferences</h2>
        <p className="text-muted-foreground">
          Help us personalize your experience
        </p>
      </div>

      <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_style">Preferred Style</Label>
          <Input
            id="preferred_style"
            placeholder="e.g., Modern, Classic, Casual"
            {...preferencesForm.register('preferred_style')}
          />
        </div>

        <div className="space-y-2">
          <Label>Clothing Preferences</Label>
          <div className="grid grid-cols-2 gap-3">
            {clothingOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selectedPreferences.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPreferences([...selectedPreferences, option]);
                    } else {
                      setSelectedPreferences(
                        selectedPreferences.filter((p) => p !== option)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={option}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('address')}
            disabled={loading}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Profile'
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={handleSkipToProfile}
          className="w-full"
        >
          Skip for Now
        </Button>
      </form>
    </div>
  );
};

