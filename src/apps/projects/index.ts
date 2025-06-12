import { BaseApp } from "../base/types";
import { ProjectsAppComponent } from "./components/ProjectsAppComponent";

export const helpItems = [
  {
    icon: "📁",
    title: "Project Showcase",
    description: "Browse development projects organized by category with featured highlights",
  },
  {
    icon: "🔗",
    title: "Interactive Details",
    description: "Click any project to view screenshots, descriptions, and access live sites",
  },
  {
    icon: "💻",
    title: "Technology Insights",
    description: "Explore the technical stack and implementation details of each project",
  },
];

export const appMetadata = {
  name: "Projects",
  version: "1.0.0",
  creator: {
    name: "Richard Wang",
    url: "https://github.com/i-richardwang",
  },
  github: "https://github.com/i-richardwang/RichardOS",
  icon: "/icons/projects.png",
};

export const ProjectsApp: BaseApp = {
  id: "projects",
  name: "Projects",
  icon: { type: "image", src: "/icons/projects.png" },
  description: "Showcase of development projects and technical work",
  component: ProjectsAppComponent,
  helpItems,
  metadata: appMetadata,
}; 