
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"auth" | "otp">("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  
  const { toast } = useToast();
  const { user, signIn, signUp, sendOtp, verifyOtp } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message || "Please check your credentials and try again.",
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message || "Please try again.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await sendOtp(email);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to send OTP. Please try again.",
        });
      } else {
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
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
      const { error } = await verifyOtp(email, otp);
      if (error) {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: error.message || "Invalid OTP. Please try again.",
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
              {step === "otp" ? "Verify your email" : "Sign in to access your bookings and favorites"}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {step === "otp" ? "Verify OTP" : "Authentication"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "auth" ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="otp">OTP Login</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email">Email Address</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-slate-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="signup-name"
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
                        <Label htmlFor="signup-email">Email Address</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-slate-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                        disabled={isLoading || !email || !password || !fullName}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="otp">
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="otp-email">Email Address</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="otp-email"
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
                            Send OTP
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-slate-500 text-center">
                        We'll send you a one-time password to verify your email address.
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <p className="text-sm text-slate-600 mb-2">
                      We sent a 6-digit code to {email}
                    </p>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
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
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-600">
                      Didn't receive the code?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSendOTP}
                      className="text-orange-500 hover:text-orange-600"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("auth")}
                      className="text-slate-500 hover:text-slate-600 ml-4"
                    >
                      Change Email
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
