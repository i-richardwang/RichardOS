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

// 常量定义
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

// 工具函数
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

// 评分渲染组件
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

// 推荐卡片组件
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
  
  // 当推荐内容变化时重置图片错误状态
  useEffect(() => {
    setImageError(false);
  }, [recommendation.id]);
  
  return (
    <div className={`bg-white h-full flex flex-col relative ${STYLES.CARD_BORDER}`}>
      {/* 海报区域 */}
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
        {/* 标签容器 */}
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
      
      {/* 信息区域 */}
      <div className="p-3 bg-white">
        <h2 className="font-geneva-12 text-xl font-bold mb-2 text-black">
          {recommendation.title}
        </h2>
        <p className="font-geneva-12 text-sm text-gray-600 mb-3">
          {recommendation.year} • {recommendation.director}
        </p>
        
        {/* 评分 */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={recommendation.imdbRating} />
          <span className="font-geneva-12 text-sm text-orange-600 font-bold">
            {recommendation.imdbRating}/10
          </span>
        </div>
        
        {/* 经典台词 */}
        <p className="font-geneva-12 text-sm text-gray-700 mb-3 leading-relaxed min-h-[3rem] italic">
          "{recommendation.classicQuote}"
        </p>
        
      </div>
      
      {/* 导航按钮区域 */}
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

// 小卡片组件
const MovieCard = ({ item, onClick }: { item: MonthlyRecommendation; onClick: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const monthYear = formatMonthYear(item.recommendedMonth);
  
  // 当内容变化时重置图片错误状态
  useEffect(() => {
    setImageError(false);
  }, [item.id]);
  
  return (
    <div
      key={item.id}
      onClick={onClick}
      className={`bg-white ${STYLES.CARD_BORDER} p-3 hover:bg-gray-50 transition-colors cursor-pointer font-geneva-12`}
    >
      {/* 缩略图区域 */}
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
      
      {/* 标题 */}
      <h3 className="font-geneva-12 font-bold text-xs mb-1 line-clamp-2 text-black leading-tight min-h-[32px] flex items-start">
        {item.title}
      </h3>
      <p className="font-geneva-12 text-[10px] text-gray-600 mb-1 truncate">
        {item.year}
      </p>
      
      {/* 推荐月份 */}
      <p className="font-geneva-12 text-[9px] text-blue-600 mb-2 truncate">
        {monthYear}
      </p>
      
      {/* 评分 */}
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

  // 加载影视数据
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

  // 初始显示序号1（最新推荐）
  useEffect(() => {
    if (cinemaData.monthlyRecommendations.length > 0 && currentDisplayOrder === 1) {
      // 保持初始状态为1，对应最新推荐
    }
  }, [cinemaData.monthlyRecommendations.length, currentDisplayOrder]);

  // 计算导航状态
  const navigationState = useMemo(() => {
    const totalCount = cinemaData.monthlyRecommendations.length;
    if (totalCount === 0) {
      return { canNavigatePrev: false, canNavigateNext: false, currentRecommendation: null, arrayIndex: 0 };
    }
    
    // 显示序号1对应数组最后一个（最新），显示序号N对应数组第一个（最旧）
    const arrayIndex = totalCount - currentDisplayOrder;
    const canNavigatePrev = currentDisplayOrder > 1; // 可以往左（到更早的序号）
    const canNavigateNext = currentDisplayOrder < totalCount; // 可以往右（到更晚的序号）
    const currentRecommendation = cinemaData.monthlyRecommendations[arrayIndex];
    
    return { canNavigatePrev, canNavigateNext, currentRecommendation, arrayIndex };
  }, [currentDisplayOrder, cinemaData.monthlyRecommendations]);

  // 导航处理
  const handlePrevRecommendation = () => {
    if (navigationState.canNavigatePrev) {
      setCurrentDisplayOrder(prev => prev - 1); // 往左是更早的序号
    }
  };
  
  const handleNextRecommendation = () => {
    if (navigationState.canNavigateNext) {
      setCurrentDisplayOrder(prev => prev + 1); // 往右是更晚的序号
    }
  };

  // 处理小卡片点击，切换到对应的推荐
  const handleCardClick = (item: MonthlyRecommendation) => {
    // 找到该作品在 monthlyRecommendations 数组中的索引
    const arrayIndex = cinemaData.monthlyRecommendations.findIndex(rec => rec.id === item.id);
    if (arrayIndex !== -1) {
      // 计算对应的显示序号：数组最后一个是序号1，数组第一个是序号N
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
        <div className="flex h-full w-full bg-white">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-black font-geneva-12">
                <Film className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Loading cinema collection...</p>
              </div>
            </div>
          ) : (
            <>
              {/* 左侧推荐区域 */}
              <div className="w-1/2 p-4">
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
              
              {/* 右侧推荐历史列表 */}
              <div className="w-1/2 bg-[#f5f5f5] border-l border-black flex flex-col">
                {/* 标题栏 */}
                <div className="bg-[#c0c0c0] border-b border-black px-4 py-2">
                  <h3 className="font-geneva-12 text-sm font-bold text-black">
                    Monthly Recommendations
                  </h3>
                </div>
                
                {/* 推荐历史列表 */}
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-2 gap-3">
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