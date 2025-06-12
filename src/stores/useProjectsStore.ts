import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string; // Markdown format for detailed description
  technologies: string[];
  image?: string; // Logo image
  screenshot?: string; // 16:9 screenshot for detail view
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category?: string;
}

interface ProjectsData {
  projects: Project[];
  selectedProject: Project | null;
  isLoaded: boolean;
}

async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/data/projects.json");
    const data = await res.json();
    const projects: unknown[] = data.projects || [];
    
    const validatedProjects = projects.map((p) => {
      const project = p as Record<string, unknown>;
      return {
        id: project.id as string,
        title: project.title as string,
        description: project.description as string,
        detailedDescription: project.detailedDescription as string | undefined,
        technologies: (project.technologies as string[]) || [],
        image: project.image as string | undefined,
        screenshot: project.screenshot as string | undefined,
        liveUrl: project.liveUrl as string | undefined,
        githubUrl: project.githubUrl as string | undefined,
        featured: (project.featured as boolean) || false,
        category: project.category as string | undefined,
      };
    });
    
    return validatedProjects;
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return [];
  }
}

const initialProjectsData: ProjectsData = {
  projects: [],
  selectedProject: null,
  isLoaded: false,
};

export interface ProjectsState extends ProjectsData {
  setSelectedProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
}

const CURRENT_PROJECTS_STORE_VERSION = 1;

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      ...initialProjectsData,

      setSelectedProject: (project) => set({ selectedProject: project }),

      loadProjects: async () => {
        try {
          const projects = await loadProjects();
          set({
            projects,
            isLoaded: true,
          });
        } catch (error) {
          console.error("Failed to load projects:", error);
          set({ isLoaded: true }); // Mark as loaded even if failed, so UI shows error state
        }
      },
    }),
    {
      name: "ryos:projects",
      version: CURRENT_PROJECTS_STORE_VERSION,
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        // Don't persist projects array - always load from JSON
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating Projects store:", error);
          } else if (state) {
            // Always load projects from JSON when store rehydrates
            setTimeout(() => {
              state.loadProjects().catch((err) =>
                console.error("Failed to load projects on rehydrate", err)
              );
            }, 50); // Small delay to ensure store is fully initialized
          }
        };
      },
    }
  )
); 