import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BetAssistant Quant Terminal",
    short_name: "BetAssistant",
    description: "Institutional-Grade Quantitative Betting engine scanning 55+ global leagues.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#03060E",
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
        src: "/icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
