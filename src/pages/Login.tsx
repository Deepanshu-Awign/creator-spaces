
import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, Check, UserPlus, Eye, EyeOff, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const siteUrl = (import.meta as any)?.env?.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://creatorspaces.lovable.app');

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState<"user" | "manager">("user");
  const [step, setStep] = useState<"auth" | "otp-sent">("auth");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signInType, setSignInType] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  // Handle URL parameters for auto-selecting signup mode and host role
  useEffect(() => {
    const mode = searchParams.get('mode');
    const role = searchParams.get('role');
    
    if (mode === 'signup') {
      setAuthMode('signup');
    }
    
    if (role === 'host') {
      setUserRole('manager');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to sign in. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName, userRole);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create account. Please try again.",
        });
      } else {
        toast({
          title: "Account Created!",
          description: `Your ${userRole === 'manager' ? 'host' : 'user'} account has been created! Please check your email to verify your account.`,
        });
        // Switch to sign-in mode to allow immediate login after email verification
        setAuthMode("signin");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // "Direct Sign In" using magic link (no OTP code)
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: siteUrl,
          shouldCreateUser: authMode === "signup",
          data: authMode === "signup" ? { full_name: fullName } : undefined,
        },
      });
      if (error) throw error;
      setStep("otp-sent");
      toast({ title: "Magic link sent!", description: "Please check your email to continue." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to send magic link." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Enter email", description: "Please enter your email to reset your password." });
      return;
    }
    setCheckingEmail(true);
    try {
      // Check if email exists in profiles
      const { data: exists, error: existsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existsError) throw existsError;
      if (!exists) {
        toast({ variant: "destructive", title: "Please check the email ID.", description: "We couldn't find an account with this email." });
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Reset password email has been sent.", description: "Check your inbox for the link to update your password." });
      setForgotOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Could not send reset email." });
    } finally {
      setCheckingEmail(false);
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    setStep("auth");
    setOtp("");
    setFullName("");
    setPassword("");
    setUserRole("user");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome to Creator Spaces
            </h1>
            <p className="text-slate-600">
              {step === "otp-sent" 
                ? "We\'ve sent you a magic link to your email"
                : authMode === "signin" 
                  ? "Sign in to your account"
                  : "Create your account to get started"
              }
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {step === "otp-sent" 
                  ? "Check Your Email" 
                  : authMode === "signin" 
                    ? "Sign In" 
                    : "Create Account"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "auth" ? (
                <>
                  {authMode === "signin" && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        variant={signInType === "password" ? "default" : "outline"}
                        onClick={() => setSignInType("password")}
                        className="flex-1"
                      >
                        Password
                      </Button>
                      <Button
                        type="button"
                        variant={signInType === "otp" ? "default" : "outline"}
                        onClick={() => setSignInType("otp")}
                        className="flex-1"
                      >
                        Direct Sign In
                      </Button>
                    </div>
                  )}

                  <form onSubmit={signInType === "password" ? (authMode === "signin" ? handlePasswordSignIn : handlePasswordSignUp) : handleSendMagicLink} className="space-y-4">
                    {authMode === "signup" && (
                      <>
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative mt-2">
                            <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              id="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Account Type</Label>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant={userRole === "user" ? "default" : "outline"}
                              onClick={() => setUserRole("user")}
                              className="flex-1 gap-2"
                            >
                              <User className="w-4 h-4" />
                              I\'m a User
                            </Button>
                            <Button
                              type="button"
                              variant={userRole === "manager" ? "default" : "outline"}
                              onClick={() => setUserRole("manager")}
                              className="flex-1 gap-2"
                            >
                              <Building2 className="w-4 h-4" />
                              I\'m a Host
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {userRole === "user" 
                              ? "Book studios and spaces for your creative projects" 
                              : "List and manage your creative spaces for others to book"
                            }
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {signInType === "password" && (
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                      disabled={isLoading || !email || (signInType === "password" && !password) || (authMode === "signup" && !fullName)}
                    >
                      {isLoading ? "Please wait..." : (
                        <>
                          {signInType === "password" 
                            ? (authMode === "signin" ? "Sign In" : "Create Account")
                            : (authMode === "signin" ? "Send Magic Link" : "Create Account & Send Link")
                          }
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={switchAuthMode}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        {authMode === "signin" 
                          ? "Don\'t have an account? Sign up" 
                          : "Already have an account? Sign in"
                        }
                      </Button>
                      {authMode === "signin" && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleForgotPassword}
                          className="text-slate-500 hover:text-slate-700"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </Button>
                      )}
                    </div>
                  </form>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-slate-600 mb-4">
                      We\'ve sent a magic link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <Label htmlFor="forgotEmail">Email Address</Label>
              <Input
                id="forgotEmail"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={checkingEmail}>
              {checkingEmail ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
