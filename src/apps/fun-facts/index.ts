import { BaseApp } from "../base/types";
import { FunFactsAppComponent } from "./components/FunFactsAppComponent";

export const helpItems = [
  {
    icon: "🎲",
    title: "Random Fun Facts",
    description: "Discover interesting personal facts and stories with each click",
  },
  {
    icon: "🔄",
    title: "Smart Rotation",
    description: "Intelligent fact rotation prevents showing the same facts repeatedly",
  },
  {
    icon: "🎨",
    title: "Visual Categories",
    description: "Facts are color-coded by category for easy identification",
  },
  {
    icon: "💫",
    title: "Smooth Transitions",
    description: "Elegant animations make browsing facts a delightful experience",
  },
];

export const appMetadata = {
  name: "Fun Facts",
  version: "1.0.0",
  creator: {
    name: "Richard Wang",
    url: "https://github.com/i-richardwang",
  },
  github: "https://github.com/i-richardwang/RichardOS",
  icon: "/icons/fun-facts.png",
};

export const FunFactsApp: BaseApp = {
  id: "fun-facts",
  name: "Fun Facts",
  icon: { type: "image", src: "/icons/fun-facts.png" },
  description: "Discover interesting personal facts and stories in a fun, interactive way",
  component: FunFactsAppComponent,
  helpItems,
  metadata: appMetadata,
};