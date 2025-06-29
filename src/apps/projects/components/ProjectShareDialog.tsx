import React, { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/stores/useProjectsStore";

interface ProjectShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function ProjectShareDialog({
  isOpen,
  onClose,
  project,
}: ProjectShareDialogProps) {
  const liveUrlInputRef = useRef<HTMLInputElement>(null);
  const githubUrlInputRef = useRef<HTMLInputElement>(null);

  const getQRCodeUrl = (url: string) => {
    if (!url) return "";
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedUrl}`;
  };

  const handleCopyToClipboard = async (url: string, linkType: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", {
        description: `${project.title} ${linkType} link copied to clipboard`,
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy link", {
        description: "Could not copy to clipboard. Please try manually selecting and copying.",
      });
    }
  };

  // Focus the first available input when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (project.liveUrl && liveUrlInputRef.current) {
          liveUrlInputRef.current.focus();
          liveUrlInputRef.current.select();
        } else if (project.githubUrl && githubUrlInputRef.current) {
          githubUrlInputRef.current.focus();
          githubUrlInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, project.liveUrl, project.githubUrl]);

  const hasMultipleUrls = project.liveUrl && project.githubUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`bg-system7-window-bg border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${
          hasMultipleUrls ? 'max-w-2xl' : 'max-w-xs'
        }`}
        onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="font-normal text-[16px]">Share {project.title}</DialogTitle>
          <DialogDescription className="sr-only">Share this project via link or QR code</DialogDescription>
        </DialogHeader>
        
        <div className="p-3 w-full">
          {hasMultipleUrls ? (
            // Two columns layout when both URLs are available
            <div className="grid grid-cols-2 gap-6">
              {/* Live Site Column */}
              {project.liveUrl && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center gap-1 text-sm font-geneva-12 text-gray-600">
                    <ExternalLink className="w-3 h-3" />
                    <span>Live Site</span>
                  </div>
                  
                  {/* QR Code - same size as single layout */}
                  <div className="bg-white p-1.5 w-32 h-32 flex items-center justify-center">
                    <img
                      src={getQRCodeUrl(project.liveUrl)}
                      alt={`QR Code for ${project.liveUrl}`}
                      className="w-28 h-28"
                      title={`Scan to open: ${project.liveUrl}`}
                    />
                  </div>
                  
                  {/* Descriptive text */}
                  <p className="text-xs text-neutral-500 text-center mt-0 mb-2 break-words font-geneva-12 w-[90%]">
                    Scan to visit live site
                  </p>
                  
                  {/* URL Input - same height as single layout */}
                  <Input
                    ref={liveUrlInputRef}
                    value={project.liveUrl}
                    readOnly
                    className="shadow-none h-8 text-sm w-full font-geneva-12"
                    placeholder="Live site URL"
                  />
                  
                  {/* Copy Button - same size as single layout */}
                  <Button
                    onClick={() => handleCopyToClipboard(project.liveUrl!, "live site")}
                    variant="retro"
                    className="w-full"
                  >
                    Copy Link
                  </Button>
                </div>
              )}
              
              {/* GitHub Column */}
              {project.githubUrl && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center gap-1 text-sm font-geneva-12 text-gray-600">
                    <Github className="w-3 h-3" />
                    <span>Source Code</span>
                  </div>
                  
                  {/* QR Code - same size as single layout */}
                  <div className="bg-white p-1.5 w-32 h-32 flex items-center justify-center">
                    <img
                      src={getQRCodeUrl(project.githubUrl)}
                      alt={`QR Code for ${project.githubUrl}`}
                      className="w-28 h-28"
                      title={`Scan to open: ${project.githubUrl}`}
                    />
                  </div>
                  
                  {/* Descriptive text */}
                  <p className="text-xs text-neutral-500 text-center mt-0 mb-2 break-words font-geneva-12 w-[90%]">
                    Scan to view source code
                  </p>
                  
                  {/* URL Input - same height as single layout */}
                  <Input
                    ref={githubUrlInputRef}
                    value={project.githubUrl}
                    readOnly
                    className="shadow-none h-8 text-sm w-full font-geneva-12"
                    placeholder="GitHub repository URL"
                  />
                  
                  {/* Copy Button - same size as single layout */}
                  <Button
                    onClick={() => handleCopyToClipboard(project.githubUrl!, "GitHub")}
                    variant="retro"
                    className="w-full"
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Single column layout when only one URL is available
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="flex items-center gap-1 text-sm font-geneva-12 text-gray-600">
                {project.liveUrl ? (
                  <>
                    <ExternalLink className="w-3 h-3" />
                    <span>Live Site</span>
                  </>
                ) : (
                  <>
                    <Github className="w-3 h-3" />
                    <span>Source Code</span>
                  </>
                )}
              </div>
              
              {/* QR Code */}
              <div className="bg-white p-1.5 w-32 h-32 flex items-center justify-center">
                <img
                  src={getQRCodeUrl(project.liveUrl || project.githubUrl || "")}
                  alt={`QR Code for ${project.liveUrl || project.githubUrl}`}
                  className="w-28 h-28"
                  title={`Scan to open: ${project.liveUrl || project.githubUrl}`}
                />
              </div>
              
              {/* Descriptive text */}
              <p className="text-xs text-neutral-500 text-center mt-0 mb-4 break-words font-geneva-12 w-[80%]">
                Share link or scan to open this project: {project.title}
              </p>

              {/* URL Input */}
              <Input
                ref={project.liveUrl ? liveUrlInputRef : githubUrlInputRef}
                value={project.liveUrl || project.githubUrl || ""}
                readOnly
                className="shadow-none h-8 text-sm w-full"
                placeholder={`Share link for ${project.title}`}
              />
              
              {/* Copy Button */}
              <Button
                onClick={() => handleCopyToClipboard(
                  project.liveUrl || project.githubUrl || "", 
                  project.liveUrl ? "live site" : "GitHub"
                )}
                variant="retro"
                className="w-full"
              >
                Copy Link
              </Button>
            </div>
          )}
          
          {hasMultipleUrls && (
            <p className="text-xs text-neutral-500 text-center mt-4 font-geneva-12">
              Choose which link to share for {project.title}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}