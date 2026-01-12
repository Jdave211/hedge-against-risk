import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function AuthModal() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/onboarding');
    }
  }, [user, authLoading, navigate]);

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccess(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNeedsConfirmation(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      // Navigation happens automatically via useEffect when user state changes
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: err.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // If not yet confirmed, show password confirmation
    if (!needsConfirmation) {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (password.length < 8 || !hasLetter || !hasNumber) {
        setError('Password must be at least 8 characters, containing letters & digits');
        return;
      }
      setNeedsConfirmation(true);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;

      if (data.user && !data.session) {
        setSuccess(true);
        toast({
          title: 'Account created',
          description: 'Please check your email to confirm your account.',
        });
      } else {
        // Session active, redirect happens via useEffect
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      if (err.message.includes('already registered')) {
         toast({
            variant: 'destructive',
            title: 'Account exists',
            description: 'This email is already registered. Please sign in instead.',
         });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Google sign in failed',
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative bg-background border border-border shadow-xl rounded-xl overflow-hidden">
      <div className="p-8 pb-6 text-center space-y-4">
        <div className="flex justify-center mb-6">
           <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center">
             <Shield className="h-6 w-6 text-primary" />
           </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'signin' 
              ? "Sign in to manage your risk profile"
              : "Sign up to start building with Probable"
            }
          </p>
        </div>
      </div>

      <CardContent className="space-y-6 px-8 pb-8">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-500 text-sm font-medium">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Check your email to confirm your account.</span>
          </div>
        )}

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={needsConfirmation || loading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => toast({ description: "Password reset not implemented in this demo." })}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                minLength={mode === 'signup' ? 8 : undefined}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                disabled={needsConfirmation || loading}
                className="pl-10"
              />
            </div>
            {mode === 'signup' && !needsConfirmation && (
              <p className="text-[11px] text-muted-foreground">
                Must be at least 8 characters, containing letters & digits
              </p>
            )}
          </div>

          {mode === 'signup' && needsConfirmation && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  autoFocus
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full font-medium" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : (needsConfirmation ? 'Create Account' : 'Continue')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 bg-background hover:bg-muted/50 font-medium text-muted-foreground hover:text-foreground"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <>Don't have an account? <button type="button" className="text-primary hover:underline font-medium" onClick={switchMode}>Create one</button></>
          ) : (
            <>Already have an account? <button type="button" className="text-primary hover:underline font-medium" onClick={switchMode}>Sign In</button></>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
