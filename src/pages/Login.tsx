
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"auth" | "otp-sent">("auth");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "signup") {
        // For signup, we need to create the account first
        const { error } = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).substring(2, 15), // Random password since we're using OTP
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to create account. Please try again.",
          });
          return;
        }
      }

      // Send OTP for both signin and signup
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          shouldCreateUser: authMode === "signup"
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to send OTP. Please try again.",
        });
      } else {
        setStep("otp-sent");
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the 6-digit verification code.",
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email"
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Invalid OTP. Please try again.",
        });
      } else {
        toast({
          title: "Success!",
          description: authMode === "signup" ? "Account created successfully!" : "You have been logged in successfully.",
        });
        window.location.href = '/';
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

  const switchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    setStep("auth");
    setOtp("");
    setFullName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome to BookMyStudio
            </h1>
            <p className="text-slate-600">
              {step === "otp-sent" 
                ? "Enter the 6-digit code sent to your email" 
                : authMode === "signin" 
                  ? "Sign in with your email to get started"
                  : "Create your account to get started"
              }
            </p>
          </div>

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

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                    disabled={isLoading || !email || (authMode === "signup" && !fullName)}
                  >
                    {isLoading ? "Sending OTP..." : (
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
                    We'll send you a 6-digit verification code to your email.
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
                        onChange={(e) => setOtp(e.target.value)}
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
                      {isLoading ? "Verifying..." : "Verify Code"}
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

export default Login;
