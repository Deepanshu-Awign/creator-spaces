
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
      
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0');
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0');
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0');

      setSafeAreaInsets({ top, bottom, left, right });
    };

    // Update on mount
    updateSafeArea();

    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeAreaInsets;
};
