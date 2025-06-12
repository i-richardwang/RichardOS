import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/stores/useProjectsStore";
import { ExternalLink, Github, Code2 } from "lucide-react";
import { markdownToHtml } from "@/utils/markdown";

interface ProjectDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

// Simple markdown renderer component for project descriptions
function MarkdownRenderer({ content }: { content: string }) {
  const htmlContent = markdownToHtml(content);
  
  return (
    <div 
      className="font-geneva-12 leading-relaxed markdown-renderer"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        fontSize: '12px', // Base font size for markdown content
      }}
    />
  );
}

export function ProjectDetailDialog({
  isOpen,
  onOpenChange,
  project,
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const handleExternalClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-system7-window-bg border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] max-w-xl max-h-[90vh] flex flex-col gap-1">
        <DialogHeader>
          <DialogTitle className="font-geneva-12 text-[16px] font-bold">
            {project.title}
          </DialogTitle>
          <DialogDescription className="sr-only">Project details for {project.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5 pb-5 overflow-y-auto flex-1">
          {/* Project Logo and Featured Badge */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 bg-white flex items-center justify-center flex-shrink-0 border-[5px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]">
              {project.image ? (
                <img 
                  src={project.image} 
                  alt={`${project.title} logo`}
                  className="w-full h-full object-cover max-w-[52px] max-h-[52px]"
                />
              ) : (
                <Code2 className="w-7 h-7 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-h-[56px] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-geneva-12 text-[18px] font-bold">{project.title}</h1>
                {project.featured && (
                  <div className="bg-black text-white text-[9px] px-1 py-0.5 font-geneva-12">
                    ★ Featured
                  </div>
                )}
              </div>
              {/* Technologies as badges */}
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 4).map((tech) => (
                  <Badge
                    key={tech}
                    variant="retro"
                    className="font-geneva-12 text-[9px] h-5 px-1 py-1"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 4 && (
                  <Badge
                    variant="retro"
                    className="font-geneva-12 text-[9px] h-5 px-1 py-1"
                  >
                    +{project.technologies.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {project.liveUrl && (
              <Button
                variant="retro"
                size="sm"
                className="w-1/2 font-geneva-12 text-[11px] h-7 min-h-7 flex items-center gap-1 hover:[border-image:url('/button-default.svg')_60_stretch]"
                onClick={() => handleExternalClick(project.liveUrl!)}
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </Button>
            )}
            {project.githubUrl && (
              <Button
                variant="retro" 
                size="sm"
                className="w-1/2 font-geneva-12 text-[11px] h-7 min-h-7 flex items-center gap-1 hover:[border-image:url('/button-default.svg')_60_stretch]"
                onClick={() => handleExternalClick(project.githubUrl!)}
              >
                <Github className="w-3 h-3" />
                Code
              </Button>
            )}
          </div>

          {/* 16:9 Screenshot */}
          <div className="w-full aspect-video bg-gray-100 border-[5px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]">
            {project.screenshot ? (
              <img 
                src={project.screenshot} 
                alt={`${project.title} screenshot`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center font-geneva-12">
                  <Code2 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-[10px] text-gray-500">No screenshot available</p>
                </div>
              </div>
            )}
          </div>

          {/* Short Description */}
          <div>
            <h4 className="font-geneva-12 text-[14px] font-bold mb-1">Overview</h4>
            <p className="font-geneva-12 text-[12px] text-gray-700 leading-tight">
              {project.description}
            </p>
          </div>

          {/* Detailed Description (Markdown) */}
          {project.detailedDescription && (
            <div>
              <h4 className="font-geneva-12 text-[14px] font-bold mb-1">Details</h4>
              <MarkdownRenderer content={project.detailedDescription} />
            </div>
          )}
        </div>

        {/* Custom styles for markdown content */}
        <style>{`
          .markdown-renderer h2 {
            font-size: 12px !important;
            font-weight: bold !important;
            color: #000000 !important;
            margin: 8px 0 4px 0 !important;
            font-family: inherit !important;
          }
          
          .markdown-renderer h3 {
            font-size: 11px !important;
            font-weight: bold !important;
            color: #000000 !important;
            margin: 6px 0 3px 0 !important;
            font-family: inherit !important;
          }
          
          .markdown-renderer p {
            font-size: 12px !important;
            margin: 3px 0 !important;
            line-height: 1.4 !important;
            color: #333333 !important;
          }
          
          .markdown-renderer ul, .markdown-renderer ol {
            font-size: 12px !important;
            margin: 4px 0 !important;
            padding-left: 16px !important;
          }
          
          .markdown-renderer li {
            font-size: 12px !important;
            margin: 2px 0 !important;
            line-height: 1.3 !important;
            color: #333333 !important;
          }
          
          .markdown-renderer strong {
            font-weight: bold !important;
            color: #000000 !important;
          }
          
          .markdown-renderer em {
            font-style: italic !important;
            color: #333333 !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
} 