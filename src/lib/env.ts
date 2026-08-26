/**
 * Public environment, read the one way that survives bundling.
 *
 * These MUST be written as literal `process.env.NEXT_PUBLIC_*` member expressions. Next.js
 * inlines them at build time by textual substitution, and only a static literal is matched —
 * a dynamic lookup like `process.env[name]` is left untouched, so in the browser it reads a
 * `process.env` that has nothing in it.
 *
 * That is exactly what used to happen here: `requireEnv("NEXT_PUBLIC_SUPABASE_URL")` resolved
 * fine on the server and threw "Missing required environment variable" in the browser. The
 * only place that mattered was `createClient()` on the sign-up screen, where the throw left
 * the button stuck on "Envoi…" forever.
 *
 * Keep `requireEnv` for server-only code (scripts/collectors/**), where a dynamic lookup is
 * genuinely reading a real `process.env`. Do not reintroduce it here.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env.local for local dev, and in the deployment's environment settings for ` +
        `anything deployed — see docs/SETUP-CLOUD.md.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
};
