import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.macote.app',
  appName: 'MaCote',
  webDir: 'public',
  server: {
    // ponytail: points the native shell at the Next dev server (SSR app, no static export).
    // /app redirects to /dashboard (same entry point the PWA manifest's start_url uses) —
    // "/" is the marketing/install site, not the app itself.
    // Swap the host to your deployed https URL for a release build, then drop `cleartext`.
    url: 'http://localhost:3000/app',
    cleartext: true,
  },
};

export default config;
