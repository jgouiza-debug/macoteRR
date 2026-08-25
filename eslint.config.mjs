import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow a leading underscore to mark a deliberately-unused parameter
      // (e.g. an unimplemented collector stub's signature).
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Serwist's generated, bundled service worker (built from src/app/sw.ts).
    "public/sw.js",
    "public/swe-worker-*.js",
    // Native Xcode project (Capacitor) — vendored Pods and a synced copy of public/, not source.
    "ios/**",
    // Unrelated local scratch project with a Python venv. It's gitignored, but flat config
    // doesn't read .gitignore, and linting the bundled Playwright JS in there crashes ESLint
    // outright with "Invalid string length".
    "scraper/**",
  ]),
]);

export default eslintConfig;
