import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BetAssistant Quant Terminal",
    short_name: "BetAssistant",
    description: "Agentic sports betting: live markets across 14 sports, AI analysis and one-tap booking codes.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#060913",
    theme_color: "#03060E",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
