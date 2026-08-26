import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.macote.app',
  appName: 'MaCote',
  webDir: 'public',
  server: {
    // Points the native shell at the deployed app (SSR, no static export), NOT at a dev
    // server. It used to be http://localhost:3000 with cleartext enabled, which meant every
    // build — including a release — talked to a machine that is not there once you leave
    // your desk, and shipped with plaintext HTTP permitted.
    //
    // /app redirects to /dashboard, the same entry the PWA manifest's start_url uses; "/" is
    // the marketing/install site, not the app itself.
    //
    // For local development against a dev server, override this temporarily — do not commit
    // the override:
    //   url: 'http://localhost:3000/app', cleartext: true
    url: 'https://www.macote.xyz/app',
  },
};

export default config;
