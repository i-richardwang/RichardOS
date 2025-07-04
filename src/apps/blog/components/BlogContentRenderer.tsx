import React, { useState, useEffect } from 'react';
import { BlogTabsRenderer } from './BlogTabsRenderer';
import { contentProcessor } from '../utils/contentProcessor';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

interface TabData {
  title: string;
  content: string;
}

interface ProcessedContent {
  html: string;
  tabs: Array<{ 
    placeholder: string; 
    tabs: TabData[]; 
    initialTab: number;
  }>;
}

export function BlogContentRenderer({ content, className = "" }: BlogContentRendererProps) {
  const [processedData, setProcessedData] = useState<ProcessedContent>({ html: '', tabs: [] });
  
  useEffect(() => {
    if (!content) return;
    
    // 使用共享的内容处理器实例
    let processedContent = contentProcessor.processContent(content);
    
    // 创建一个临时的DOM容器来解析内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    
    // 查找所有的 Stackable Tabs
    const stackableTabs = tempDiv.querySelectorAll('.wp-block-stackable-tabs');
    const tabsData: ProcessedContent['tabs'] = [];
    
    stackableTabs.forEach((tabContainer, index) => {
      const tabData = extractTabsFromDOM(tabContainer as HTMLElement);
      
      if (tabData.length > 1) { // 只有多个tab时才替换
        // 获取初始tab（默认为0）
        const initialTabAttr = tabContainer.getAttribute('data-initial-tab');
        const initialTab = initialTabAttr ? parseInt(initialTabAttr) - 1 : 0;
        
        const placeholder = `__BLOG_TABS_${index}__`;
        
        tabsData.push({
          placeholder,
          tabs: tabData,
          initialTab: Math.max(0, Math.min(initialTab, tabData.length - 1))
        });
        
        // 用占位符替换
        const placeholderElement = document.createElement('div');
        placeholderElement.textContent = placeholder;
        tabContainer.parentNode?.replaceChild(placeholderElement, tabContainer);
      }
    });
    
    setProcessedData({
      html: tempDiv.innerHTML,
      tabs: tabsData
    });
    
  }, [content]);
  
  // 渲染内容，将占位符替换为React组件
  const renderContent = () => {
    if (processedData.tabs.length === 0) {
      return (
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: processedData.html }}
        />
      );
    }
    
    let currentHtml = processedData.html;
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;
    
    processedData.tabs.forEach((tabData) => {
      const parts = currentHtml.split(tabData.placeholder);
      
      // 添加占位符前的内容
      if (parts[0]) {
        elements.push(
          <div 
            key={`content-${keyIndex++}`}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: parts[0] }}
          />
        );
      }
      
      // 添加tab组件
      elements.push(
        <BlogTabsRenderer
          key={`tabs-${keyIndex++}`}
          tabs={tabData.tabs}
          defaultValue={`tab-${tabData.initialTab}`}
          className="my-6"
        />
      );
      
      // 更新当前内容为剩余部分
      currentHtml = parts.slice(1).join(tabData.placeholder);
    });
    
    // 添加剩余内容
    if (currentHtml) {
      elements.push(
        <div 
          key={`content-${keyIndex++}`}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: currentHtml }}
        />
      );
    }
    
    return elements;
  };
  
  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}

// 从DOM元素中提取tab数据
function extractTabsFromDOM(tabContainer: HTMLElement): TabData[] {
  const tabs: TabData[] = [];
  
  try {
    // 查找tab标签
    const tabLabels = tabContainer.querySelectorAll('.stk-block-tabs__tab .stk-block-tab-labels__text span');
    const titles = Array.from(tabLabels).map(label => label.textContent?.trim() || '');
    
    // 查找tab内容面板
    const tabPanels = tabContainer.querySelectorAll('[role="tabpanel"]');
    
    // 组合标题和内容
    for (let i = 0; i < Math.min(titles.length, tabPanels.length); i++) {
      if (titles[i]) {
        tabs.push({
          title: titles[i],
          content: (tabPanels[i] as HTMLElement).innerHTML
        });
      }
    }
    
  } catch (error) {
    console.error('Error extracting tabs:', error);
  }
  
  return tabs;
} 