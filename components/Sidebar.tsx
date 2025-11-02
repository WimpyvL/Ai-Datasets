
import React from 'react';
import type { DiscoveredLink, AccessMethod } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ApiIcon } from './icons/ApiIcon';
import { CrawlIcon } from './icons/CrawlIcon';
import { FileIcon } from './icons/FileIcon';


interface SidebarProps {
  sources: DiscoveredLink[];
  selectedSource: number | null;
  onSelectSource: (selection: number) => void;
  isLoading: boolean;
  hasSearched: boolean;
}

const getIconForMethod = (method: AccessMethod) => {
    const iconProps = { className: "h-5 w-5 mr-3 text-gray-500 flex-shrink-0" };
    switch (method) {
        case 'DIRECT_DOWNLOAD': return <DownloadIcon {...iconProps} />;
        case 'API': return <ApiIcon {...iconProps} />;
        case 'WEB_CRAWL': return <CrawlIcon {...iconProps} />;
        case 'LOCAL_FILE': return <FileIcon {...iconProps} />;
        default: return <CrawlIcon {...iconProps} />;
    }
};

const Sidebar: React.FC<SidebarProps> = ({ sources, selectedSource, onSelectSource, isLoading, hasSearched }) => {
  if (isLoading) {
      return (
          <aside className="w-1/3 max-w-sm bg-white border-r border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Discovering Sources...</h2>
              <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-gray-200 h-12 rounded-md animate-pulse"></div>
                  ))}
              </div>
          </aside>
      );
  }
    
  if (!hasSearched) {
    return (
      <aside className="w-1/3 max-w-sm bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Discovered Sources</h2>
        <div className="text-center text-gray-500 mt-8 px-4">
            <p className="text-sm">Generate a plan to see discovered data sources here.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-1/3 max-w-sm bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Discovered Sources</h2>
      <nav>
        {sources.length === 0 && !isLoading && (
             <div className="text-center text-gray-500 mt-8 px-4">
                <p className="text-sm">No sources were found for this query.</p>
            </div>
        )}
        <ul>
          {sources.map((source, index) => (
            <li key={index}>
              <button
                onClick={() => onSelectSource(index)}
                className={`w-full text-left flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                  selectedSource === index
                    ? 'bg-cyan-100 text-cyan-800 font-semibold'
                    // Check if selectedSource is null for the initial load case
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={source.url}
              >
                {getIconForMethod(source.accessMethod)}
                <span className="truncate text-sm">{source.url}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
