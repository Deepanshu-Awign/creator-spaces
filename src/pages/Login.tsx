
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setStep("otp");
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to homepage or dashboard
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome to BookMyStage
            </h1>
            <p className="text-slate-600">
              Sign in to access your bookings and favorites
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {step === "email" ? "Sign In" : "Verify OTP"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "email" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
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
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      "Sending OTP..."
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    We'll send you a one-time password to verify your email address.
                    No passwords required!
                  </p>
                </form>
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
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold"
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
                      onClick={() => handleSendOTP(new Event("submit") as any)}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      Resend OTP
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("email")}
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
