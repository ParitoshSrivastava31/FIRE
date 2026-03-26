import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.monetra.app',
  appName: 'Monetra',
  webDir: 'out', // next build static export output

  // ────────────────────────────────────────────────────────────
  // DEV ONLY: Point to your Next.js dev server on the same WiFi.
  // Replace with your machine's local IP (run `ipconfig` → WiFi IPv4).
  // COMMENT THIS OUT for production builds (build:mobile script).
  // ────────────────────────────────────────────────────────────
  server: {
    url: 'http://192.168.29.88:3000', // Your WiFi IP — update if it changes
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: false,        // We control hide timing in code
      backgroundColor: '#FAFAFA',   // Light background — matches app theme
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,       // false = keep status bar visible (light mode)
    },

    StatusBar: {
      style: 'DARK',                // Dark icons on light background
      backgroundColor: '#FAFAFA',
      overlaysWebView: false,
    },

    Keyboard: {
      resize: 'body' as any,          // Resize body, not viewport — prevents layout jumps
      style: 'LIGHT' as any,
      resizeOnFullScreen: true,
    },
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Set to false for production release
  },
};

export default config;
