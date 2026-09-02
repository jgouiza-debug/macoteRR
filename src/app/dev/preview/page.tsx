import { notFound } from "next/navigation";
import { DevPreview } from "./DevPreview";

/**
 * Design harness: real routes at true device viewports, for checking mobile layout on a
 * desktop. Development only — `NODE_ENV` is fixed at build time, so a production bundle
 * answers 404 here and src/app/robots.ts keeps crawlers away from it as well.
 */
export default function DevPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DevPreview />;
}
