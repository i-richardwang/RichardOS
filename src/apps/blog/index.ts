import { BaseApp } from "../base/types";
import { BlogAppComponent } from "./components/BlogAppComponent";

export const helpItems = [
  {
    icon: "📰",
    title: "Browse Articles",
    description: "Read blog posts from imrichard.com with search and category filtering",
  },
  {
    icon: "🔍",
    title: "Search & Filter",
    description: "Search articles by title or content, and filter by categories",
  },
  {
    icon: "📖",
    title: "Reading View",
    description: "Click any article to read the full content in the right panel",
  },
  {
    icon: "💾",
    title: "Smart Cache",
    description: "Articles are cached locally and updated daily for optimal performance",
  },
];

export const appMetadata = {
  name: "Blog",
  version: "1.0.0",
  creator: {
    name: "Richard Wang",
    url: "https://github.com/i-richardwang",
  },
  github: "https://github.com/i-richardwang/RichardOS",
  icon: "/icons/blog.png",
};

export const BlogApp: BaseApp = {
  id: "blog",
  name: "Blog",
  icon: { type: "image", src: "/icons/blog.png" },
  description: "Read articles from Richard's WordPress blog",
  component: BlogAppComponent,
  helpItems,
  metadata: appMetadata,
}; 