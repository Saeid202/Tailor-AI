import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { EmailVerification } from '@/components/auth/EmailVerification';
import { SignInForm } from '@/components/auth/SignInForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type AuthStep = 'verification' | 'signin' | 'registration';

const Auth = () => {
  const [step, setStep] = useState<AuthStep>('verification');
  const [email, setEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/app');
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/app');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEmailVerified = async (verifiedEmail: string, userExists: boolean) => {
    setEmail(verifiedEmail);
    setIsExistingUser(userExists);
    
    // Existing user → Password screen
    // New user → Registration form
    setStep(userExists ? 'signin' : 'registration');
  };

  const handleSignInSuccess = () => {
    navigate('/app');
  };

  const handleRegistrationComplete = () => {
    navigate('/app');
  };

  const handleChangeEmail = () => {
    setStep('verification');
    setEmail('');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          {step === 'verification' && (
            <EmailVerification onVerified={handleEmailVerified} />
          )}

          {step === 'signin' && (
            <SignInForm
              email={email}
              onSuccess={handleSignInSuccess}
              onChangeEmail={handleChangeEmail}
            />
          )}

          {step === 'registration' && (
            <RegistrationForm
              email={email}
              onComplete={handleRegistrationComplete}
            />
          )}
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Auth;
