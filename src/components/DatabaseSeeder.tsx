
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seedSampleStudios } from "@/utils/seedDatabase";
import { useToast } from "@/hooks/use-toast";

const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedSampleStudios();
      toast({
        title: "Success!",
        description: "Sample studios have been added to the database."
      });
    } catch (error) {
      console.error("Seeding error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to seed sample studios. Check console for details."
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Click the button below to add sample studios to the database for testing the booking flow.
        </p>
        <Button 
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isSeeding ? "Adding Sample Studios..." : "Add Sample Studios"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseSeeder;
