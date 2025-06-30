
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, Check } from "lucide-react";
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
  const [step, setStep] = useState<"email" | "otp-sent">("email");
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
        type: "email" as const,
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
          description: "You have been logged in successfully.",
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
              {step === "otp-sent" ? "Enter the 6-digit code sent to your email" : "Sign in with your email to get started"}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {step === "otp-sent" ? "Verify Email" : "Sign In"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "email" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
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
                    disabled={isLoading || !email}
                  >
                    {isLoading ? "Sending OTP..." : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

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
                      onClick={() => setStep("email")}
                      className="text-slate-500 hover:text-slate-600"
                    >
                      Back to Email
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
