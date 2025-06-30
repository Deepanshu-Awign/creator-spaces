
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, Check, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/secureClient";
import { cleanupAuthState, isRateLimited } from "@/utils/authUtils";
import { handleAuthError } from "@/utils/errorHandler";

const SecureLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"auth" | "otp-sent">("auth");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [securityWarning, setSecurityWarning] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateInput = () => {
    if (!email || !email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return false;
    }
    
    if (authMode === "signup" && (!fullName || fullName.trim().length < 2)) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter your full name (at least 2 characters).",
      });
      return false;
    }
    
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;
    
    // Check rate limiting
    if (isRateLimited(email)) {
      setSecurityWarning("Too many requests. Please wait before trying again.");
      return;
    }
    
    setIsLoading(true);
    setSecurityWarning("");
    
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      if (authMode === "signup") {
        // For signup, create account first
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: crypto.randomUUID(), // Use secure random password
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (signUpError) {
          handleAuthError(signUpError);
          return;
        }
      }

      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: authMode === "signup",
          data: authMode === "signup" ? { full_name: fullName } : undefined
        }
      });
      
      if (error) {
        handleAuthError(error);
      } else {
        setStep("otp-sent");
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the 6-digit code.",
        });
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email"
      });
      
      if (error) {
        handleAuthError(error);
      } else {
        toast({
          title: "Success!",
          description: authMode === "signup" ? "account created successfully!" : "Signed in successfully!",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    setStep("auth");
    setOtp("");
    setFullName("");
    setSecurityWarning("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-2" />
              <span className="text-sm text-green-600 font-medium">Secure Authentication</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome to BookMyStudio
            </h1>
            <p className="text-slate-600">
              {step === "otp-sent" 
                ? "Enter the 6-digit verification code sent to your email" 
                : authMode === "signin" 
                  ? "Sign in securely with your email"
                  : "Create your secure account"
              }
            </p>
          </div>

          {securityWarning && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-md">
              <p className="text-sm text-orange-800">{securityWarning}</p>
            </div>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {step === "otp-sent" 
                  ? "Verify Email" 
                  : authMode === "signin" 
                    ? "Sign In" 
                    : "Create Account"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "auth" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  {authMode === "signup" && (
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative mt-2">
                        <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          minLength={2}
                          maxLength={50}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
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

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                    disabled={isLoading || !email || (authMode === "signup" && !fullName)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Code...
                      </>
                    ) : (
                      <>
                        {authMode === "signin" ? "Send Verification Code" : "Create Account & Send Code"}
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
                        ? "Don't have an account? Sign up" 
                        : "Already have an account? Sign in"
                      }
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    🔒 Your data is encrypted and secure. We'll send a 6-digit code to verify your identity.
                  </p>
                </form>
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
                      We sent a 6-digit verification code to <strong>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </form>

                  <div className="text-center space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleSendOTP(new Event('submit') as any)}
                      className="text-orange-500 hover:text-orange-600"
                      disabled={isLoading}
                    >
                      Resend Code
                    </Button>
                    <br />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("auth")}
                      className="text-slate-500 hover:text-slate-600"
                    >
                      Back to {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecureLogin;
