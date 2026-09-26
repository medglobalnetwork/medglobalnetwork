import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MedGlobalNetwork",
    short_name: "MGN",
    description: "Healthcare Professional Social, Learning & Opportunity Ecosystem",
    start_url: "/home",
    display: "standalone",
    background_color: "#faf9f8",
    theme_color: "#0f4c81",
    orientation: "portrait",
    categories: ["medical", "health", "social", "education", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
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
    shortcuts: [
      {
        name: "Home",
        short_name: "Home",
        description: "Open your personal healthcare feed",
        url: "/home",
      },
      {
        name: "Feed",
        short_name: "Feed",
        description: "Latest medical clinical posts",
        url: "/feed",
      },
      {
        name: "Messages",
        short_name: "Messages",
        description: "Direct & group professional conversations",
        url: "/messages",
      },
      {
        name: "Opportunities",
        short_name: "Jobs",
        description: "Healthcare career opportunities and camps",
        url: "/opportunities",
      },
    ],
  };
}
