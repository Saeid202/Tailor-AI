import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { localAuth } from '@/lib/local-auth';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileAddress } from '@/components/profile/ProfileAddress';
import { ProfilePreferences } from '@/components/profile/ProfilePreferences';
import { BodyMeasurementsPanel } from '@/components/profile/BodyMeasurementsPanel';
import { SizePreferencesPanel } from '@/components/profile/SizePreferencesPanel';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { User, MapPin, Heart, Ruler, ShoppingBag, Settings, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types/profile';

// Profile content component (without header) - can be used in tabs
export const ProfileContent = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'basic';
  const { toast } = useToast();

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = localAuth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // For local auth, create a basic profile from user data
      const profileData: UserProfile = {
        id: user.id,
        email: user.email,
        full_name: user.fullName || user.email.split('@')[0],
        phone: null,
        date_of_birth: null,
        gender: null,
        street_address: null,
        city: null,
        state: null,
        zip_code: null,
        country: null,
        fabric_preferences: null,
        color_preferences: null,
        style_preferences: null,
        profile_completed: true,
        measurements_completed: false,
        created_at: user.createdAt,
        updated_at: user.createdAt,
      };

      setProfile(profileData);
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message || 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    loadProfile();
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Manage your account, measurements, and preferences</CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="basic" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Address</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="measurements" className="gap-2">
                <Ruler className="h-4 w-4" />
                <span className="hidden sm:inline">Measurements</span>
              </TabsTrigger>
              <TabsTrigger value="sizes" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Sizes</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileBasicInfo profile={profile} onUpdate={handleProfileUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Manage your shipping address</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileAddress profile={profile} onUpdate={handleProfileUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Style Preferences</CardTitle>
                  <CardDescription>Set your fabric, color, and style preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfilePreferences profile={profile} onUpdate={handleProfileUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="measurements">
              <BodyMeasurementsPanel userId={profile?.id} />
            </TabsContent>

            <TabsContent value="sizes">
              <SizePreferencesPanel userId={profile?.id} />
            </TabsContent>

            <TabsContent value="orders">
              <OrderHistory userId={profile?.id} />
            </TabsContent>
          </Tabs>
        </div>
  );
};

// Full Profile page with header (for standalone route)
const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="app" />
      <div className="container mx-auto px-4 py-6">
        <ProfileContent />
      </div>
    </div>
  );
};

export default Profile;
