import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.macote.app',
  appName: 'MaCote',
  webDir: 'public',
  server: {
    // ponytail: points the native shell at the Next dev server (SSR app, no static export).
    // Swap to your deployed https URL for a release build, then drop `cleartext`.
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
