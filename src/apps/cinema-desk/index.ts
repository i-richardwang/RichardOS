import { CinemaDeskAppComponent } from "./components/CinemaDeskAppComponent";
import type { BaseApp } from "../base/types";

// Help items (displayed in help dialog)
export const helpItems = [
  {
    icon: "🎬",
    title: "Browse Collection",
    description: "Explore Richard's curated collection of movies and TV series with personal ratings and reviews.",
  },
  {
    icon: "⭐",
    title: "Rating System",
    description: "Movies and shows are rated on a 1-10 scale, with star visualization for quick reference.",
  },
  {
    icon: "🎭",
    title: "Filter by Type",
    description: "Use the toolbar buttons to filter between all items, movies only, or TV series only.",
  },
  {
    icon: "📅",
    title: "Watch History",
    description: "Each item shows when it was watched, giving you insight into viewing chronology.",
  },
  {
    icon: "🎯",
    title: "IMDB Integration",
    description: "All entries include IMDB IDs for easy cross-reference to detailed movie information.",
  },
  {
    icon: "🎪",
    title: "Cinema Menu",
    description: "Access IMDB and other cinema-related tools through the Cinema menu.",
  },
];

// App metadata (displayed in about dialog)
export const appMetadata = {
  name: "CinemaDesk",
  version: "1.0.0",
  creator: {
    name: "Richard Wang",
    url: "https://github.com/i-richardwang",
  },
  github: "https://github.com/i-richardwang/RichardOS",
  icon: "/icons/cinema-desk.png",
};

// App configuration object
export const CinemaDeskApp: BaseApp = {
  id: "cinema-desk",
  name: "CinemaDesk",
  icon: { type: "image", src: "/icons/cinema-desk.png" },
  description: "Personal cinema collection and movie recommendations",
  component: CinemaDeskAppComponent,
  helpItems,
  metadata: appMetadata,
};