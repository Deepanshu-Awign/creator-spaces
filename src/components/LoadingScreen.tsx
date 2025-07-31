
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 95);
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center">
          <img 
            src="/src/assets/creator-spaces-logo-colorful.png" 
            alt="Creator Spaces" 
            className="w-12 h-4"
          />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">Creator Spaces</h1>
        <p className="text-gray-600">Loading your creative space...</p>
      </div>
      
      <div className="w-64 mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      
      <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
    </div>
  );
};

export default LoadingScreen;
