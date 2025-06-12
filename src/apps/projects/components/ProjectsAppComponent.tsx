import { useState } from "react";
import { AppProps } from "@/apps/base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { ProjectsMenuBar } from "./ProjectsMenuBar";
import { ProjectDetailDialog } from "./ProjectDetailDialog";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "../index";
import { useProjectsStore, type Project } from "@/stores/useProjectsStore";
import { Code2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Project Card Component - Classic Mac OS style, clickable
function ProjectCard({ 
  project, 
  onClick 
}: { 
  project: Project;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative bg-system7-window-bg p-3 font-geneva-12 cursor-pointer",
        "border-[5px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]",
        "flex flex-col min-h-[200px]"
      )}
      onClick={onClick}
    >
      {/* Featured Indicator */}
      {project.featured && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="bg-black text-white text-[10px] px-1 py-0.5 font-geneva-12 border border-black">
            ★
          </div>
        </div>
      )}

      {/* Project Logo Image - Square with max size limit */}
      <div className="w-full max-w-[80px] mx-auto aspect-square bg-white mb-2 flex items-center justify-center border-[5px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]">
        {project.image ? (
          <img 
            src={project.image} 
            alt={`${project.title} logo`}
            className="w-full h-full object-cover max-w-[76px] max-h-[76px]"
          />
        ) : (
          <Code2 className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Project Title */}
      <h3 className="font-geneva-12 text-[12px] font-bold mb-2 line-clamp-2 text-black text-center">
        {project.title}
      </h3>

      {/* Main content area that grows to fill space */}
      <div className="flex-1 flex flex-col">
      {/* Project Description */}
        <p className="font-geneva-12 text-[12px] text-gray-700 mb-2 line-clamp-3 leading-tight">
          {project.description}
        </p>

        {/* Technologies - improved responsive display */}
        <div className="flex-1 mb-2">
          <p className="font-geneva-12 text-[9px] text-gray-600 mb-1">Technologies:</p>
          <div className="font-geneva-12 text-[11px] text-black leading-tight">
            <span className="block break-words">
              {project.technologies.join(", ")}
          </span>
          </div>
      </div>
      </div>

      {/* Click to view details hint - always at bottom, show on hover */}
      <div className="text-center mt-auto">
        <p className="font-geneva-12 text-[9px] text-gray-500 italic opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Click for details
        </p>
      </div>
    </div>
  );
}

export function ProjectsAppComponent({
  isWindowOpen,
  onClose,
  isForeground,
  skipInitialSound,
  instanceId,
  onNavigateNext,
  onNavigatePrevious,
}: AppProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const {
    projects,
    isLoaded,
  } = useProjectsStore();

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailDialogOpen(true);
  };

  // Group projects by category
  const projectsByCategory = projects.reduce((acc, project) => {
    const category = project.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  // Get category display names
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'ai-agent': 'AI Agent Products',
      'web-app': 'Web Applications',
      'other': 'Other Projects'
    };
    return categoryMap[category] || category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Keep categories in the order they appear in the original data
  const sortedCategories = projects.reduce((acc: string[], project) => {
    const category = project.category || 'other';
    if (!acc.includes(category)) {
      acc.push(category);
    }
    return acc;
  }, []);

  if (!isWindowOpen) return null;

  return (
    <>
      <ProjectsMenuBar
        onClose={onClose}
        onShowHelp={() => setIsHelpDialogOpen(true)}
        onShowAbout={() => setIsAboutDialogOpen(true)}
      />
      <WindowFrame
        title="Projects"
        onClose={onClose}
        isForeground={isForeground}
        appId="projects"
        skipInitialSound={skipInitialSound}
        instanceId={instanceId}
        onNavigateNext={onNavigateNext}
        onNavigatePrevious={onNavigatePrevious}
      >
        <div className="flex flex-col h-full w-full bg-white">
          {!isLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center font-geneva-12">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent mx-auto mb-2"></div>
                <p className="text-black text-[12px]">Loading projects...</p>
              </div>
            </div>
          )}

          {isLoaded && (
            <div className="flex-1 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center font-geneva-12">
                    <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-black text-[12px]">No projects found</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {/* Projects grouped by category */}
                  {sortedCategories.map((category) => (
                    <div key={category}>
                      <h2 className="font-geneva-12 text-[18px] font-bold mb-3 text-black flex items-center gap-2">
                        {projectsByCategory[category].some(p => p.featured) && (
                          <Star className="w-4 h-4 fill-black text-black" />
                        )}
                        {getCategoryDisplayName(category)}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectsByCategory[category].map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => handleProjectClick(project)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <ProjectDetailDialog
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          project={selectedProject}
        />
        <HelpDialog
          isOpen={isHelpDialogOpen}
          onOpenChange={setIsHelpDialogOpen}
          helpItems={helpItems}
          appName="Projects"
        />
        <AboutDialog
          isOpen={isAboutDialogOpen}
          onOpenChange={setIsAboutDialogOpen}
          metadata={appMetadata}
        />
      </WindowFrame>
    </>
  );
} 