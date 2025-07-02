
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.studiobookings',
  appName: 'studio-stage-bookings',
  webDir: 'dist',
  server: {
    url: 'https://4fc8c40f-a0ed-44bc-9d50-8e968c6452eb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
