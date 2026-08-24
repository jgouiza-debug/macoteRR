import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MaCote",
    short_name: "MaCote",
    description:
      "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible.",
    start_url: "/",
    display: "standalone",
    background_color: "#E7E9E0",
    theme_color: "#2B4CF5",
    lang: "fr-CA",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
