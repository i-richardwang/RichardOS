import { useState, useEffect, useMemo } from "react";
import { AppProps } from "@/apps/base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { CinemaDeskMenuBar } from "./CinemaDeskMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Film, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import { helpItems, appMetadata } from "..";

interface MonthlyRecommendation {
  id: string;
  imdbId: string;
  title: string;
  type: "movie" | "series";
  imdbRating: number;
  year: number;
  director: string;
  thumbnailUrl: string;
  posterUrl: string;
  recommendedMonth: string;
  classicQuote: string;
}

interface CinemaData {
  monthlyRecommendations: MonthlyRecommendation[];
}

// Style constants
const STYLES = {
  BADGE_LARGE: "text-[9px] h-5 px-2 py-1 font-geneva-12 flex items-center",
  BADGE_SMALL: "text-[8px] h-5 px-1.5 py-1 font-geneva-12 flex items-center",
  CARD_BORDER: "border-[5px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]",
  SMALL_CARD_BORDER: "border-[3px] border-solid border-transparent [border-image:url('/button.svg')_30_stretch]",
} as const;

const ICON_SIZES = {
  TYPE_LARGE: "w-4 h-4",
  TYPE_SMALL: "w-4 h-4", 
  STAR_LARGE: "w-4 h-4",
  STAR_SMALL: "w-2.5 h-2.5",
} as const;

// Utility functions
const getTypeIcon = (type: string, size: keyof typeof ICON_SIZES = "TYPE_LARGE") => {
  const iconClass = ICON_SIZES[size];
  return type === "movie"
    ? <Film className={iconClass} />
    : <Monitor className={iconClass} />;
};

const formatMonthYear = (monthString: string) => {
  return new Date(monthString + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

// Star rating component
const StarRating = ({
  rating,
  size = "STAR_LARGE"
}: {
  rating: number;
  size?: keyof typeof ICON_SIZES;
}) => {
  const stars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;
  const iconClass = ICON_SIZES[size];

  return (
    <div className="flex items-center">
      {[...Array(stars)].map((_, i) => (
        <Star key={`star-${i}`} className={`${iconClass} fill-yellow-400 text-yellow-400`} />
      ))}
      {halfStar && (
        <Star className={`${iconClass} fill-yellow-400 text-yellow-400 opacity-50`} />
      )}
      {[...Array(5 - stars - (halfStar ? 1 : 0))].map((_, i) => (
        <Star key={`empty-star-${i}`} className={`${iconClass} text-gray-400`} />
      ))}
    </div>
  );
};

// Recommendation card component
const RecommendationCard = ({
  recommendation,
  onPrev,
  onNext,
  canNavigatePrev,
  canNavigateNext,
  currentDisplayOrder,
  totalCount
}: {
  recommendation: MonthlyRecommendation;
  onPrev: () => void;
  onNext: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  currentDisplayOrder: number;
  totalCount: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const monthYear = formatMonthYear(recommendation.recommendedMonth);

  // Reset image error state when recommendation changes
  useEffect(() => {
    setImageError(false);
  }, [recommendation.id]);

  return (
    <div className={`bg-white h-full flex flex-col relative ${STYLES.CARD_BORDER}`}>
      {/* Poster area */}
      <div className="relative flex-1 bg-[#f0f0f0] overflow-hidden">
        {!imageError ? (
          <img
            src={recommendation.posterUrl}
            alt={recommendation.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[#f0f0f0] flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Badge container */}
        <div className="absolute inset-0 p-3">
          <div className="flex justify-between items-start h-5">
            <Badge variant="retro" className={STYLES.BADGE_LARGE}>
              {getTypeIcon(recommendation.type)}
              <span className="ml-1 capitalize">{recommendation.type}</span>
            </Badge>
            <Badge variant="retro" className={STYLES.BADGE_LARGE}>
              {monthYear}
            </Badge>
          </div>
        </div>
      </div>

      {/* Information area */}
      <div className="p-3 bg-white">
        <h2 className="font-geneva-12 text-xl font-bold mb-2 text-black">
          {recommendation.title}
        </h2>
        <p className="font-geneva-12 text-sm text-gray-600 mb-3">
          {recommendation.year} • {recommendation.director}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={recommendation.imdbRating} />
          <span className="font-geneva-12 text-sm text-orange-600 font-bold">
            {recommendation.imdbRating}/10
          </span>
        </div>

        {/* Classic quote */}
        <p className="font-geneva-12 text-sm text-gray-700 mb-3 leading-relaxed min-h-[3rem] italic">
          "{recommendation.classicQuote}"
        </p>

      </div>

      {/* Navigation buttons area */}
      <div className="p-3 bg-white border-t border-gray-200 flex justify-center gap-4">
        <Button
          onClick={onPrev}
          disabled={!canNavigatePrev}
          variant="retro"
          size="sm"
          className="h-8 w-8 p-0 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="font-geneva-12 text-sm text-gray-600 self-center">
          {currentDisplayOrder} / {totalCount}
        </span>

        <Button
          onClick={onNext}
          disabled={!canNavigateNext}
          variant="retro"
          size="sm"
          className="h-8 w-8 p-0 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Small movie card component
const MovieCard = ({ item, onClick }: { item: MonthlyRecommendation; onClick: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const monthYear = formatMonthYear(item.recommendedMonth);

  // Reset image error state when content changes
  useEffect(() => {
    setImageError(false);
  }, [item.id]);

  return (
    <div
      key={item.id}
      onClick={onClick}
      className={`bg-white ${STYLES.CARD_BORDER} p-3 hover:bg-gray-50 transition-colors cursor-pointer font-geneva-12`}
    >
      {/* Thumbnail area */}
      <div className="relative mb-2">
        <div className={`w-full aspect-[2/3] bg-[#f0f0f0] ${STYLES.SMALL_CARD_BORDER} overflow-hidden relative`}>
          {!imageError ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="retro" className={STYLES.BADGE_SMALL}>
            {getTypeIcon(item.type, "TYPE_SMALL")}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-geneva-12 font-bold text-xs mb-1 line-clamp-2 text-black leading-tight min-h-[32px] flex items-start">
        {item.title}
      </h3>
      <p className="font-geneva-12 text-[10px] text-gray-600 mb-1 truncate">
        {item.year}
      </p>

      {/* Recommended month */}
      <p className="font-geneva-12 text-[9px] text-blue-600 mb-2 truncate">
        {monthYear}
      </p>

      {/* Rating */}
      <div className="flex items-center">
        <StarRating rating={item.imdbRating} size="STAR_SMALL" />
      </div>
    </div>
  );
};

export function CinemaDeskAppComponent({
  isWindowOpen,
  onClose,
  isForeground,
  skipInitialSound,
  instanceId,
  title,
  onNavigateNext,
  onNavigatePrevious,
}: AppProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [cinemaData, setCinemaData] = useState<CinemaData>({ 
    monthlyRecommendations: [] 
  });
  const [loading, setLoading] = useState(true);
  const [currentDisplayOrder, setCurrentDisplayOrder] = useState(1);

  // Load cinema data
  useEffect(() => {
    const loadCinemaData = async () => {
      try {
        const response = await fetch("/data/cinema-collection.json");
        const data = await response.json();
        setCinemaData(data);
      } catch (error) {
        console.error("[CinemaDesk] Failed to load cinema data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCinemaData();
  }, []);

  // Initial display order 1 (latest recommendation)
  useEffect(() => {
    if (cinemaData.monthlyRecommendations.length > 0 && currentDisplayOrder === 1) {
      // Keep initial state as 1, corresponding to the latest recommendation
    }
  }, [cinemaData.monthlyRecommendations.length, currentDisplayOrder]);

  // Calculate navigation state
  const navigationState = useMemo(() => {
    const totalCount = cinemaData.monthlyRecommendations.length;
    if (totalCount === 0) {
      return { canNavigatePrev: false, canNavigateNext: false, currentRecommendation: null, arrayIndex: 0 };
    }

    // Display order 1 corresponds to the last array item (newest), display order N corresponds to the first array item (oldest)
    const arrayIndex = totalCount - currentDisplayOrder;
    const canNavigatePrev = currentDisplayOrder > 1; // Can go left (to earlier order)
    const canNavigateNext = currentDisplayOrder < totalCount; // Can go right (to later order)
    const currentRecommendation = cinemaData.monthlyRecommendations[arrayIndex];

    return { canNavigatePrev, canNavigateNext, currentRecommendation, arrayIndex };
  }, [currentDisplayOrder, cinemaData.monthlyRecommendations]);

  // Navigation handlers
  const handlePrevRecommendation = () => {
    if (navigationState.canNavigatePrev) {
      setCurrentDisplayOrder(prev => prev - 1); // Left is earlier order
    }
  };

  const handleNextRecommendation = () => {
    if (navigationState.canNavigateNext) {
      setCurrentDisplayOrder(prev => prev + 1); // Right is later order
    }
  };

  // Handle small card click, switch to corresponding recommendation
  const handleCardClick = (item: MonthlyRecommendation) => {
    // Find the index of this item in the monthlyRecommendations array
    const arrayIndex = cinemaData.monthlyRecommendations.findIndex(rec => rec.id === item.id);
    if (arrayIndex !== -1) {
      // Calculate corresponding display order: last array item is order 1, first array item is order N
      const displayOrder = cinemaData.monthlyRecommendations.length - arrayIndex;
      setCurrentDisplayOrder(displayOrder);
    }
  };

  return (
    <>
      <CinemaDeskMenuBar
        onClose={onClose}
        isWindowOpen={isWindowOpen}
        onShowHelp={() => setIsHelpDialogOpen(true)}
        onShowAbout={() => setIsAboutDialogOpen(true)}
      />
      <WindowFrame
        title={title || "CinemaDesk"}
        onClose={onClose}
        isForeground={isForeground}
        appId="cinema-desk"
        skipInitialSound={skipInitialSound}
        instanceId={instanceId}
        onNavigateNext={onNavigateNext}
        onNavigatePrevious={onNavigatePrevious}
      >
        <div className="flex flex-col md:flex-row md:h-full w-full bg-white overflow-auto md:overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-black font-geneva-12">
                <Film className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Loading cinema collection...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Featured recommendation area - full width on mobile, top position */}
              <div className="w-full md:w-1/2 p-4 flex-shrink-0 md:h-full md:overflow-auto">
                {navigationState.currentRecommendation && (
                  <RecommendationCard
                    recommendation={navigationState.currentRecommendation}
                    onPrev={handlePrevRecommendation}
                    onNext={handleNextRecommendation}
                    canNavigatePrev={navigationState.canNavigatePrev}
                    canNavigateNext={navigationState.canNavigateNext}
                    currentDisplayOrder={currentDisplayOrder}
                    totalCount={cinemaData.monthlyRecommendations.length}
                  />
                )}
              </div>

              {/* Recommendation history list - below on mobile */}
              <div className="w-full md:w-1/2 bg-[#f5f5f5] border-t md:border-t-0 md:border-l border-black flex flex-col md:h-full">
                {/* Title bar */}
                <div className="bg-[#c0c0c0] border-b border-black px-4 py-2 flex-shrink-0">
                  <h3 className="font-geneva-12 text-sm font-bold text-black">
                    Monthly Recommendations
                  </h3>
                </div>

                {/* Recommendation history list */}
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 md:pb-0">
                    {[...cinemaData.monthlyRecommendations].reverse().map(item => (
                      <MovieCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </WindowFrame>

      {/* 对话框 */}
      <HelpDialog
        isOpen={isHelpDialogOpen}
        onOpenChange={setIsHelpDialogOpen}
        helpItems={helpItems}
        appName="CinemaDesk"
      />
      <AboutDialog
        isOpen={isAboutDialogOpen}
        onOpenChange={setIsAboutDialogOpen}
        metadata={appMetadata}
      />
    </>
  );
}