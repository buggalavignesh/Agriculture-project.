import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.cropmate.offline',
  appName: 'CropMate Offline 🌱',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow local cleartext connections to on-device inference endpoints (e.g. localhost:8080 or llama.cpp Android daemon)
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1f13',
      showSpinner: false,
    },
  },
};

export default config;
