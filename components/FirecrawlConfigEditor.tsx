import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import Tooltip from './Tooltip';
import TooltipWrapper from './TooltipWrapper';

interface FirecrawlConfig {
  url: string;
  proxy?: string;
  crawlerOptions?: {
    includes?: string[];
    excludes?: string[];
    maxDepth?: number;
    delay?: number;
    rateLimit?: number;
    pageOptions?: {
      onlyMainContent?: boolean;
      waitFor?: number;
    };
  };
  headers?: {
    'User-Agent'?: string;
  };
}

interface FirecrawlConfigEditorProps {
  initialJsonString: string;
}

const defaultConfig: FirecrawlConfig = {
    url: '',
    proxy: '',
    crawlerOptions: {
        includes: [],
        excludes: [],
        maxDepth: 3,
        delay: 1000,
        rateLimit: 5,
        pageOptions: {
            onlyMainContent: true,
            waitFor: 0,
        }
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
};

export const FirecrawlConfigEditor: React.FC<FirecrawlConfigEditorProps> = ({ initialJsonString }) => {
  const [config, setConfig] = useState<FirecrawlConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setUrlError(null);
    try {
      if (!initialJsonString || initialJsonString.trim() === '{}') {
        setConfig(defaultConfig);
        setError("Warning: The generated configuration was empty. Please specify a Target URL to begin.");
        return;
      }
      const parsedConfig = JSON.parse(initialJsonString);
      
      // We no longer need the warning here as the new validation handles it.
      // if (!parsedConfig.url) {
      //     setError("Warning: The generated configuration is missing the required 'url' field. Please add one.");
      // }

      const mergedConfig = {
        ...defaultConfig,
        ...parsedConfig,
        crawlerOptions: {
          ...defaultConfig.crawlerOptions,
          ...(parsedConfig.crawlerOptions || {}),
          pageOptions: {
            ...defaultConfig.crawlerOptions?.pageOptions,
            ...(parsedConfig.crawlerOptions?.pageOptions || {}),
          },
        },
        headers: {
            ...defaultConfig.headers,
            ...(parsedConfig.headers || {}),
        }
      };
      setConfig(mergedConfig);
    } catch (e) {
      console.error("Failed to parse Firecrawl config JSON:", e);
      setError("Error: The AI generated an invalid configuration format. Please try refining the plan.");
      setConfig(defaultConfig);
    }
  }, [initialJsonString]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('Target URL is required.');
      return false;
    }
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(url)) {
        setUrlError('Please enter a valid URL format.');
        return false;
      }
    } catch (e) {
      setUrlError('Please enter a valid URL format.');
      return false;
    }
    setUrlError(null);
    return true;
  };

  const handleInputChange = (path: string, value: any) => {
    setConfig(prevConfig => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      handleInputChange('url', newUrl);
      validateUrl(newUrl);
  };

  const handleArrayChange = (path: string, value: string) => {
    handleInputChange(path, value.split(',').map(s => s.trim()).filter(Boolean));
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNestedValue = (obj: any, path: string, defaultValue: any = '') => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
  };

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="text-md font-semibold text-gray-700">Interactive Firecrawl Configuration</h4>
            <TooltipWrapper tooltipText="Copies the current Firecrawl configuration to your clipboard as a formatted JSON object.">
              <button
                  onClick={handleCopy}
                  className="flex items-center text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500 transition-colors duration-300"
              >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy as JSON'}
              </button>
            </TooltipWrapper>
        </div>
        
        {error && (
            <div className={`p-3 rounded-md text-sm ${error.startsWith('Error:') ? 'bg-red-50 border border-red-300 text-red-700' : 'bg-yellow-50 border border-yellow-300 text-yellow-700'}`}>
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <span>Target URL</span>
                        <Tooltip text="This is the starting point for the web crawler. It should be the main URL of the website you want to scrape." />
                    </label>
                    <input
                        type="text"
                        value={config.url}
                        onChange={handleUrlChange}
                        onBlur={(e) => validateUrl(e.target.value)}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-gray-800 focus:ring-1 outline-none text-sm ${
                            urlError 
                            ? 'border-red-400 ring-red-300' 
                            : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
                        }`}
                        aria-invalid={!!urlError}
                        aria-describedby="url-error"
                    />
                    {urlError && <p id="url-error" className="text-red-600 text-sm mt-1">{urlError}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <span>Max Crawl Depth</span>
                        <Tooltip text="Defines how many links deep the crawler will follow from the starting URL. A depth of `1` only scrapes the target URL. A depth of `2` scrapes the target URL and all pages linked from it. Use a reasonable number to avoid crawling an entire website." />
                    </label>
                    <input
                        type="number"
                        value={getNestedValue(config, 'crawlerOptions.maxDepth', 0)}
                        onChange={e => handleInputChange('crawlerOptions.maxDepth', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <span>Wait For (ms)</span>
                        <Tooltip text="The time in milliseconds (e.g., `2000` for 2 seconds) the crawler will wait for a page to load before extracting content. This is crucial for websites that use JavaScript to load data dynamically." />
                    </label>
                    <input
                        type="number"
                        value={getNestedValue(config, 'crawlerOptions.pageOptions.waitFor', 0)}
                        onChange={e => handleInputChange('crawlerOptions.pageOptions.waitFor', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                    />
                </div>

                <div className="pt-2">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Politeness Settings</h5>
                  <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <span>Crawl Delay (ms)</span>
                            <Tooltip text="The time in milliseconds (e.g., `1000` for 1 second) to wait between each request. This is a crucial politeness measure to avoid getting blocked." />
                        </label>
                        <input
                            type="number"
                            value={getNestedValue(config, 'crawlerOptions.delay', 0)}
                            onChange={e => handleInputChange('crawlerOptions.delay', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <span>Rate Limit (req/sec)</span>
                            <Tooltip text="The maximum number of concurrent requests to make. Setting a limit helps prevent overloading the target server." />
                        </label>
                        <input
                            type="number"
                            value={getNestedValue(config, 'crawlerOptions.rateLimit', 0)}
                            onChange={e => handleInputChange('crawlerOptions.rateLimit', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                    </div>
                  </div>
                </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <span>URL Include Patterns (comma-separated)</span>
                        <Tooltip text="Specify URL patterns to **keep**. The crawler will only follow links that match these patterns. E.g., `/products/*, /articles/2024/*`." />
                    </label>
                    <textarea
                        value={getNestedValue(config, 'crawlerOptions.includes', []).join(', ')}
                        onChange={e => handleArrayChange('crawlerOptions.includes', e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                        <span>Exclude Paths (comma-separated)</span>
                        <Tooltip text="Specify URL patterns to **ignore**. The crawler will not follow links that match these patterns. Useful for avoiding login pages or archives. E.g., `/login, /contact, /archive/*`." />
                    </label>
                    <textarea
                        value={getNestedValue(config, 'crawlerOptions.excludes', []).join(', ')}
                        onChange={e => handleArrayChange('crawlerOptions.excludes', e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm resize-none"
                    />
                </div>
            </div>
        </div>
        <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                <span>Proxy Configuration</span>
                <Tooltip text="Optional. Provide a proxy URL (e.g., `http://user:pass@host:port`) to route crawl traffic. This is useful for bypassing IP-based rate limits or accessing region-specific content." />
            </label>
            <input
                type="text"
                value={config.proxy || ''}
                onChange={e => handleInputChange('proxy', e.target.value)}
                placeholder="e.g., http://user:pass@host:port"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
            />
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                <span>User-Agent</span>
                <Tooltip text="A string that identifies the crawler to the web server. Using a common browser User-Agent can help prevent your crawler from being blocked." />
            </label>
            <textarea
                value={getNestedValue(config, 'headers.User-Agent', '')}
                onChange={e => handleInputChange('headers.User-Agent', e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm font-mono"
            />
        </div>
        <div className="md:col-span-2 flex items-center pt-2">
            <input
                type="checkbox"
                id="onlyMainContent"
                checked={getNestedValue(config, 'crawlerOptions.pageOptions.onlyMainContent', false)}
                onChange={e => handleInputChange('crawlerOptions.pageOptions.onlyMainContent', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 bg-white text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="onlyMainContent" className="ml-3 block text-sm font-medium text-gray-600 flex items-center">
                <span>Extract Main Content Only</span>
                <Tooltip text="If enabled, Firecrawl will attempt to extract only the main article/content from a page, ignoring headers, footers, and sidebars. This is useful for cleaning up scraped data." />
            </label>
        </div>
    </div>
  );
};