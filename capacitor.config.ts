
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.studiobookings',
  appName: 'studio-stage-bookings',
  webDir: 'dist',
  // Comment out server config for local development
  // server: {
  //   url: 'https://4fc8c40f-a0ed-44bc-9d50-8e968c6452eb.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    }
  },
  ios: {
    contentInset: 'automatic',
    // Enable better caching and performance
    preferredContentMode: 'mobile',
    allowsLinkPreview: false
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Enable better caching and performance
    appendUserAgent: 'CreatorSpaces',
    overrideUserAgent: undefined,
    backgroundColor: '#ffffff',
    // Enable hardware acceleration
    mixedContentMode: 'compatibility',
    // Improve loading performance
    loggingBehavior: 'none'
  }
};

export default config;
