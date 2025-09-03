import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, User, Building, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { useToast } from "@/hooks/use-toast";
import { createAdminUser } from "@/utils/createAdminUser";

const DummyCredentials = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { signIn } = useAuth();
  const { signIn: localSignIn } = useLocalAuth();
  const { toast } = useToast();

  const dummyUsers = [
    {
      type: "End User",
      email: "user@demo.com",
      password: "demo123",
      description: "Regular user for testing booking flow",
      icon: User,
      color: "bg-blue-500"
    },
    {
      type: "Studio Owner",
      email: "host@demo.com", 
      password: "demo123",
      description: "Studio owner for testing host features",
      icon: Building,
      color: "bg-green-500"
    },
    {
      type: "Admin User",
      email: "admin@demo.com",
      password: "demo123",
      description: "Administrator for testing admin panel",
      icon: Crown,
      color: "bg-purple-500"
    }
  ];

  const handleCopyCredentials = (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Credentials Copied!",
      description: "Login credentials copied to clipboard"
    });
  };

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      // Try local auth first
      const { error: localError } = await localSignIn(email, password);
      
      if (!localError) {
        toast({
          title: "Login Successful!",
          description: "Welcome to CREATOR SPACES"
        });
        return;
      }
      
      // If local auth fails, try Supabase auth
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Login Successful!",
          description: "Welcome to CREATOR SPACES"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login"
      });
    }
  };

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    try {
      const result = await createAdminUser("admin@demo.com", "demo123", "Demo Admin");
      if (result.success) {
        toast({
          title: "Admin User Created!",
          description: "Admin user has been created successfully"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Admin Creation Failed",
          description: "Failed to create admin user"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating admin user"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Demo Credentials</h2>
        <p className="text-neutral-600">Use these credentials to test different user roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyUsers.map((user, index) => {
          const Icon = user.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${user.color}`}></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.type}</CardTitle>
                    <p className="text-sm text-neutral-600">{user.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Email:</span>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                      {user.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Password:</span>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                      {showPasswords ? user.password : "••••••"}
                    </code>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCredentials(user.email, user.password)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  onClick={() => handleQuickLogin(user.email, user.password)}
                  className="w-full bg-airbnb-primary hover:bg-airbnb-accent text-white"
                >
                  Quick Login
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800">For First-Time Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
              <li>Click "Create Admin User" to set up the admin account</li>
              <li>Use the demo credentials to test different user roles</li>
              <li>Add sample studios using the "Add Sample Studios" button</li>
              <li>Test the booking flow with different user types</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCreateAdmin}
              disabled={isCreatingAdmin}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isCreatingAdmin ? "Creating..." : "Create Admin User"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">End User</span>
              <Badge variant="secondary">Book Studios</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Studio Owner</span>
              <Badge variant="secondary">Manage Studios</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Admin</span>
              <Badge variant="secondary">Full Access</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Studio browsing and search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Booking and payment flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Host dashboard and management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Admin panel and analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mobile-responsive design</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DummyCredentials; 