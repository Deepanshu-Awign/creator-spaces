import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets a recovery session after clicking the reset link
    const checkRecovery = async () => {
      const { data } = await supabase.auth.getSession();
      setHasRecoverySession(Boolean(data.session));
    };
    checkRecovery();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasRecoverySession) {
      toast({ variant: "destructive", title: "Invalid Link", description: "Your password reset link is invalid or expired. Please request a new one." });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password should be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match", description: "Please make sure both passwords are the same." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Could not update password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
              {!hasRecoverySession ? (
                <p className="text-center text-slate-600">This reset link is invalid or expired. Please request a new password reset from the login page.</p>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
