
import { useState, useEffect } from "react";
import creatorSpacesLogo from "@/assets/creator-spaces-logo-colorful.png";

const LoadingScreen = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Complete loading after minimum time
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setProgress(100);
      setLoadingText("Ready!");
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  // Update loading text based on progress
  useEffect(() => {
    if (progress < 30) {
      setLoadingText("Initializing...");
    } else if (progress < 60) {
      setLoadingText("Loading resources...");
    } else if (progress < 90) {
      setLoadingText("Preparing your experience...");
    } else {
      setLoadingText("Almost ready...");
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white via-orange-50 to-orange-100 z-50 flex items-center justify-center p-4 min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-4 left-4 w-16 h-16 bg-orange-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-orange-300 rounded-full blur-lg"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm w-full flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 relative">
          <img 
            src={creatorSpacesLogo} 
            alt="Creator Spaces" 
            className={`w-full h-full object-contain transition-all duration-1000 ${
              isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-80'
            }`}
            style={{
              animation: 'logoSpin 2s linear infinite'
            }}
          />
          {/* Rotating ring effect */}
          <div 
            className="absolute inset-0 border-2 border-orange-500/30 rounded-full"
            style={{
              animation: 'logoRing 2s linear infinite'
            }}
          />
          {/* Pulse effect */}
          <div 
            className="absolute inset-0 border-2 border-orange-500/20 rounded-full"
            style={{
              animation: 'logoPulse 1.5s ease-in-out infinite'
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-800 mb-2 md:mb-3 animate-fade-in leading-tight">
          Creator Spaces
        </h1>
        
        {/* Loading text */}
        <p className="text-gray-600 mb-3 md:mb-4 animate-fade-in-delay min-h-[20px] text-sm md:text-base leading-relaxed">
          {loadingText}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 md:mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress percentage */}
        <p className="text-sm text-gray-500 font-medium mb-3 md:mb-4">
          {Math.round(progress)}%
        </p>
        
        {/* Loading dots */}
        <div className="flex space-x-2 justify-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
