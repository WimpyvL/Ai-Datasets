import React from 'react';

// New Components and Icons
import { SchemaEditor } from './SchemaEditor';
import { FirecrawlConfigEditor } from './FirecrawlConfigEditor';
import { CodeSnippet } from './CodeSnippet';
import { DownloadIcon } from './icons/DownloadIcon';
import { ApiIcon } from './icons/ApiIcon';
import { CrawlIcon } from './icons/CrawlIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import type { AccessMethod } from '../services/ai/analysisAgent';

interface DiscoveredLink {
    url: string;
    accessMethod: AccessMethod;
    justification: string;
    strategy: string;
}

interface DiscoveredLinksSectionProps {
    content: string;
}

const parseDiscoveredLinks = (content: string): DiscoveredLink[] => {
    const linkSections = content.split('- **URL:**').slice(1);
    return linkSections.map(section => {
        const urlMatch = section.match(/\[(.*?)\]/);
        const accessMethodMatch = section.match(/Access Method: \`(.*?)\`/);
        const justificationMatch = section.match(/Justification: (.*?)\n/);
        const strategyMatch = section.match(/Strategy:\s*([\s\S]*)/);

        return {
            url: urlMatch ? urlMatch[1].trim() : '',
            accessMethod: (accessMethodMatch ? accessMethodMatch[1].trim() : 'WEB_CRAWL') as AccessMethod,
            justification: justificationMatch ? justificationMatch[1].trim() : '',
            strategy: strategyMatch ? strategyMatch[1].trim() : '',
        };
    }).filter(link => link.url);
};

const getIconForMethod = (method: AccessMethod) => {
    const iconProps = { className: "h-6 w-6 mr-3 text-cyan-500 flex-shrink-0" };
    switch (method) {
        case 'DIRECT_DOWNLOAD': return <DownloadIcon {...iconProps} />;
        case 'API': return <ApiIcon {...iconProps} />;
        case 'WEB_CRAWL': return <CrawlIcon {...iconProps} />;
        default: return <CrawlIcon {...iconProps} />;
    }
};

const StrategyRenderer: React.FC<{ strategy: string; method: AccessMethod }> = ({ strategy, method }) => {
    const codeBlocks = strategy.match(/```(\w+)?\n([\s\S]*?)```/g) || [];
    
    if (method === 'DIRECT_DOWNLOAD') {
        const bashCode = codeBlocks.find((b: string) => b.startsWith('```bash'))?.replace(/```bash\n|```/g, '').trim();
        return bashCode ? <CodeSnippet language="bash" code={bashCode} /> : <p className="text-sm text-gray-500">No download command provided.</p>;
    }

    if (method === 'API') {
        const jsCode = codeBlocks.find((b: string) => b.startsWith('```javascript'))?.replace(/```javascript\n|```/g, '').trim();
        const jsonSchema = codeBlocks.find((b: string) => b.startsWith('```json'))?.replace(/```json\n|```/g, '').trim();
        return (
            <div className="space-y-6">
                {jsCode && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">API Request Snippet</h4>
                        <CodeSnippet language="javascript" code={jsCode} />
                    </div>
                )}
                {jsonSchema && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Proposed Data Schema</h4>
                        <SchemaEditor initialJsonString={jsonSchema} />
                    </div>
                )}
            </div>
        );
    }

    if (method === 'WEB_CRAWL') {
        const jsonCodeBlocks = codeBlocks.filter((b: string) => b.startsWith('```json'));
        const firecrawlConfigBlock = jsonCodeBlocks.find((b: string) => b.includes('"url":'));
        const schemaBlock = jsonCodeBlocks.find((b: string) => !b.includes('"url":'));

        const firecrawlConfig = firecrawlConfigBlock?.replace(/```json\n|```/g, '').trim();
        const jsonSchema = schemaBlock?.replace(/```json\n|```/g, '').trim();
       
        return (
             <div className="space-y-6">
                {firecrawlConfig && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Firecrawl Configuration</h4>
                        <FirecrawlConfigEditor initialJsonString={firecrawlConfig} />
                    </div>
                )}
                {jsonSchema && (
                     <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Proposed Data Schema</h4>
                        <SchemaEditor initialJsonString={jsonSchema} />
                    </div>
                )}
            </div>
        );
    }
    
    return <p className="text-sm text-gray-500">Could not render strategy.</p>;
};


const DiscoveredLinkItem: React.FC<{ link: DiscoveredLink }> = ({ link }) => {
    return (
        <details className="group bg-gray-50 border border-gray-200 rounded-lg overflow-hidden" open>
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center min-w-0">
                    {getIconForMethod(link.accessMethod)}
                    <div className="flex flex-col min-w-0">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 hover:text-cyan-600 hover:underline truncate" title={link.url}>
                            {link.url}
                        </a>
                        <p className="text-sm text-gray-500 truncate">{link.justification}</p>
                    </div>
                </div>
                <ChevronDownIcon className="h-5 w-5 text-gray-500 transform group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
            </summary>
            <div className="p-4 border-t border-gray-200 bg-white">
                <StrategyRenderer strategy={link.strategy} method={link.accessMethod} />
            </div>
        </details>
    )
}

export const DiscoveredLinksSection: React.FC<DiscoveredLinksSectionProps> = ({ content }) => {
    const links = parseDiscoveredLinks(content);
    
    if (links.length === 0) {
        return <p className="text-gray-600">No specific dataset links could be identified in the plan.</p>
    }

    return (
        <div className="space-y-3 mt-4">
           {links.map((link, index) => <DiscoveredLinkItem key={index} link={link} />)}
        </div>
    );
};