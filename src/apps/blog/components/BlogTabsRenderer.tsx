import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TabData {
  title: string;
  content: string;
}

interface BlogTabsRendererProps {
  tabs: TabData[];
  defaultValue?: string;
  className?: string;
}

export function BlogTabsRenderer({ 
  tabs, 
  defaultValue, 
  className = "" 
}: BlogTabsRendererProps) {
  if (!tabs || tabs.length === 0) {
    return null;
  }

  // 为每个tab生成唯一的value
  const tabValues = tabs.map((_, index) => `tab-${index}`);
  const initialTab = defaultValue || tabValues[0];

  return (
    <div className={`blog-tabs-wrapper my-6 ${className}`}>
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className={`grid w-full ${tabs.length === 2 ? 'grid-cols-2' : `grid-cols-${tabs.length}`} bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none h-auto p-0`}>
          {tabs.map((tab, index) => (
            <TabsTrigger 
              key={tabValues[index]} 
              value={tabValues[index]}
              className="font-geneva-12 text-[12px] rounded-none py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-none border-r border-black last:border-r-0 data-[state=active]:text-black hover:bg-gray-200 transition-colors"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab, index) => (
          <TabsContent 
            key={tabValues[index]} 
            value={tabValues[index]}
            className="mt-0 p-4 border-2 border-t-0 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] rounded-none"
          >
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: tab.content }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 