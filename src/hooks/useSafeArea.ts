
import { useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const useSafeArea = (): SafeAreaInsets => {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      // Get CSS custom properties for safe area insets
      const computedStyle = getComputedStyle(document.documentElement);
      
      // Try to get safe area values, with fallbacks for Android
      let top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
      let bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0');
      let left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0');
      let right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0');

      // Fallback for Android devices - detect if we're likely on mobile and apply default padding
      const isLikelyMobile = window.innerWidth <= 768 && 'ontouchstart' in window;
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isLikelyMobile && (top === 0 || bottom === 0)) {
        // Apply default safe area values for mobile devices
        top = top || (isAndroid ? 24 : 20); // Status bar height
        bottom = bottom || (isAndroid ? 0 : 20); // Home indicator on iOS
      }

      setSafeAreaInsets({ top, bottom, left, right });
    };

    // Update on mount
    updateSafeArea();

    // Update on orientation change and resize
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);
    
    // Also try to update after a short delay for Capacitor apps
    setTimeout(updateSafeArea, 100);
    setTimeout(updateSafeArea, 500);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeAreaInsets;
};
