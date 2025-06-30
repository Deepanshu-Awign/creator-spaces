
import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class AppErrorHandler {
  static handle(error: any, context?: string): AppError {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // Sanitize error messages for user display
    const sanitizedError = this.sanitizeError(error);
    
    // Show user-friendly toast
    toast.error(sanitizedError.message);
    
    // Log for monitoring (in production, send to monitoring service)
    this.logError(sanitizedError, context);
    
    return sanitizedError;
  }
  
  private static sanitizeError(error: any): AppError {
    // Default error
    let appError: AppError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      statusCode: 500
    };
    
    // Handle Supabase auth errors
    if (error?.message?.includes('Invalid login credentials')) {
      appError = {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password. Please check your credentials.',
        statusCode: 401
      };
    } else if (error?.message?.includes('Email not confirmed')) {
      appError = {
        code: 'EMAIL_NOT_CONFIRMED',
        message: 'Please check your email and confirm your account.',
        statusCode: 401
      };
    } else if (error?.message?.includes('User already registered')) {
      appError = {
        code: 'USER_EXISTS',
        message: 'An account with this email already exists.',
        statusCode: 409
      };
    } else if (error?.message?.includes('Invalid OTP')) {
      appError = {
        code: 'INVALID_OTP',
        message: 'The verification code is invalid or has expired.',
        statusCode: 401
      };
    }
    
    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      appError = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        statusCode: 503
      };
    }
    
    return appError;
  }
  
  private static logError(error: AppError, context?: string) {
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    const logData = {
      timestamp: new Date().toISOString(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // For now, just log to console
    console.error('App Error Log:', logData);
  }
}

// Utility functions for common error scenarios
export const handleAuthError = (error: any) => {
  return AppErrorHandler.handle(error, 'Authentication');
};

export const handleAPIError = (error: any) => {
  return AppErrorHandler.handle(error, 'API Call');
};

export const handleDatabaseError = (error: any) => {
  return AppErrorHandler.handle(error, 'Database Operation');
};
