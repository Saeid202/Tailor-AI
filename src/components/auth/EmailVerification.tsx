import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { sendOTPEmail, verifyOTP } from '@/lib/email-otp';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationProps {
  onVerified: (email: string, isExistingUser: boolean) => void;
}

export const EmailVerification = ({ onVerified }: EmailVerificationProps) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { toast } = useToast();

  // Check email and send OTP only for new users
  const sendVerificationCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // CHECK IF USER EXISTS: Try sign in with dummy password
      const { error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: '__dummy_password_check_12345__',
      });

      // Analyze the error message to determine if user exists
      let userExists = false;
      
      if (checkError) {
        // "Invalid login credentials" = User exists but wrong password
        // "Email not confirmed" = User exists but not verified
        if (checkError.message.includes('Invalid login credentials') || 
            checkError.message.includes('Email not confirmed')) {
          userExists = true;
        }
      }

      if (userExists) {
        // EXISTING USER → PASSWORD ONLY (NO OTP!)
        toast({
          title: 'Welcome Back! 👋',
          description: 'Please enter your password',
          duration: 1500,
        });

        setTimeout(() => {
          onVerified(email, true);
        }, 200);
        setLoading(false);
        return;
      }

      // New user - send OTP for email verification
      const result = await sendOTPEmail(email);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Show different message based on mode
      if (result.code) {
        // Development mode: Show code in toast
        toast({
          title: 'Verification Code Generated! 🔑',
          description: `Your code: ${result.code}\n\nEnter this code to verify your email`,
          duration: 30000, // 30 seconds
        });
      } else {
        // Production mode: Email sent
        toast({
          title: 'Verification Code Sent! 📧',
          description: 'Check your email inbox for the 6-digit code',
          duration: 8000,
        });
      }

      setStep('code');
      startResendTimer();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP code
      const result = verifyOTP(email, code);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Verify with Supabase to create/restore session
      await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email'
      });

      // Check if user has completed profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id, profile_completed')
        .eq('email', email)
        .maybeSingle();

      const hasCompletedProfile = profileData && profileData.profile_completed;

      if (hasCompletedProfile) {
        // Existing user - redirect to app immediately
        toast({
          title: 'Welcome Back! ✅',
          description: 'Signing you in...',
          duration: 2000,
        });

        setTimeout(() => {
          window.location.href = '/app';
        }, 500);
      } else {
        // New user - complete registration
        toast({
          title: 'Email Verified! ✅',
          description: 'Please complete your profile',
        });

        onVerified(email, false);
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired code',
        variant: 'destructive',
      });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCode('');
    sendVerificationCode();
  };

  if (step === 'email') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Welcome to Tailor AI</h2>
          <p className="text-muted-foreground">
            Enter your email to get started
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendVerificationCode()}
              disabled={loading}
            />
          </div>

          <Button
            className="w-full"
            onClick={sendVerificationCode}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>We'll send you a verification code to confirm your email</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
        <p className="text-muted-foreground">
          We sent a 6-digit code to<br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-center block">Enter Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              onComplete={() => {
                // Auto-verify when all 6 digits are entered
                setTimeout(() => handleVerifyCode(), 100);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleVerifyCode}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          {resendTimer > 0 ? (
            <p className="text-sm font-medium">
              Resend code in {resendTimer}s
            </p>
          ) : (
            <Button
              variant="link"
              onClick={handleResend}
              disabled={loading}
              className="p-0 h-auto"
            >
              Resend Code
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setStep('email');
            setCode('');
          }}
          disabled={loading}
          className="w-full"
        >
          Change Email
        </Button>
      </div>
    </div>
  );
};

