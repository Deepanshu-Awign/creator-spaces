
import { supabase } from "@/integrations/supabase/client";

export const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const secureSignOut = async () => {
  try {
    cleanupAuthState();
    
    // Attempt global sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    // Force page reload for clean state
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
    // Force reload even if sign out fails
    window.location.href = '/';
  }
};

// Rate limiting for OTP requests
const otpRequestTimes = new Map<string, number[]>();

export const isRateLimited = (email: string, maxRequests: number = 3, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const requests = otpRequestTimes.get(email) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  // Add current request
  recentRequests.push(now);
  otpRequestTimes.set(email, recentRequests);
  
  return false;
};
