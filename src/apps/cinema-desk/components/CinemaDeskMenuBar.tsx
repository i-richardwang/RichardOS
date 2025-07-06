import { MenuBar } from "@/components/layout/MenuBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CinemaDeskMenuBarProps {
  onClose: () => void;
  isWindowOpen: boolean;
  onShowHelp: () => void;
  onShowAbout: () => void;
}

const MENU_BUTTON_CLASS = "h-6 text-md px-2 py-1 border-none hover:bg-gray-200 active:bg-gray-900 active:text-white focus-visible:ring-0";
const MENU_ITEM_CLASS = "text-md h-6 px-3 active:bg-gray-900 active:text-white";
const DISABLED_MENU_ITEM_CLASS = `${MENU_ITEM_CLASS} disabled:opacity-50 disabled:cursor-not-allowed`;
const MENU_SEPARATOR_CLASS = "h-[2px] bg-black my-1";

export function CinemaDeskMenuBar({
  onClose: _onClose, // 保留以符合接口，但暂时未使用
  isWindowOpen,
  onShowHelp,
  onShowAbout,
}: CinemaDeskMenuBarProps) {
  if (!isWindowOpen) return null;

  const handleViewDataSource = () => {
    window.open("/data/cinema-collection.json", "_blank");
  };

  const handleOpenIMDB = () => {
    window.open("https://www.imdb.com", "_blank");
  };

  return (
    <MenuBar>
      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className={MENU_BUTTON_CLASS}>
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem onClick={handleViewDataSource} className={MENU_ITEM_CLASS}>
            View Data Source
          </DropdownMenuItem>
          <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Export List...
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Print List...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className={MENU_BUTTON_CLASS}>
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Sort by Rating
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Sort by Date
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Sort by Title
          </DropdownMenuItem>
          <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Group by Type
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cinema Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className={MENU_BUTTON_CLASS}>
            Cinema
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem onClick={handleOpenIMDB} className={MENU_ITEM_CLASS}>
            Open IMDB
          </DropdownMenuItem>
          <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Find Similar Movies...
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={DISABLED_MENU_ITEM_CLASS}>
            Export to Letterboxd...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className={MENU_BUTTON_CLASS}>
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem onClick={onShowHelp} className={MENU_ITEM_CLASS}>
            CinemaDesk Help
          </DropdownMenuItem>
          <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <DropdownMenuItem onClick={onShowAbout} className={MENU_ITEM_CLASS}>
            About CinemaDesk
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}