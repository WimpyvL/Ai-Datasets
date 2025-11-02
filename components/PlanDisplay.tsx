import React, { useState } from 'react';
import type { PlanSection } from '../types';
import TooltipWrapper from './TooltipWrapper';
import { DiscoveredLinksSection } from './DiscoveredLinksSection';
import { SaveIcon } from './icons/SaveIcon';
import { ExportIcon } from './icons/ExportIcon';
import { RefineIcon } from './icons/RefineIcon';
import Tooltip from './Tooltip';

interface PlanDisplayProps {
  plan: string;
  onRefine: (instructions: string) => void;
  isRefining: boolean;
}

const parsePlan = (text: string): PlanSection[] => {
  if (!text) return [];
  // Split by ### followed by a number, a period, and a space.
  const sections = text.split(/\n###\s\d+\.\s/);
  const relevantSections = sections.filter(s => s.trim() !== '').map((s, i) => {
    if (i === 0 && !s.match(/^\d+\.\s/)) {
        // Handle the case where the first part is just the title of the first section
        const lines = s.split('\n');
        const firstLine = lines[0];
        if (!firstLine.startsWith('###')) return `1. ${s}`;
        return s;
    }
    return `${i + 1}. ${s.replace(/^###\s/, '')}`;
  });

  return relevantSections.map((sectionText) => {
    const lines = sectionText.trim().split('\n');
    const title = lines[0].replace(/^###\s/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    // A simple renderer for basic markdown-like text from the AI
    return (
        <div className="prose prose-sm max-w-none text-gray-700 mt-4 space-y-3">
            {content.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    return (
                        <div key={idx} className="flex items-start">
                            <span className="mr-3 mt-1.5 text-cyan-500 flex-shrink-0">•</span>
                            <span>{trimmedLine.substring(2)}</span>
                        </div>
                    );
                }
                return <p key={idx}>{trimmedLine}</p>;
            })}
        </div>
    );
};


const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onRefine, isRefining }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [cleaningInstructions, setCleaningInstructions] = useState('');
  const parsedPlan = parsePlan(plan);

  const handleSaveToLocalStorage = () => {
    localStorage.setItem('ingestionPlan', plan);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportAsMarkdown = () => {
    const markdownText = parsedPlan.map(sec => `### ${sec.title}\n\n${sec.content}`).join('\n\n---\n\n');
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-ingestion-plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSection = (section: PlanSection) => {
    if (section.title.includes('Discovered Datasets')) {
        return <DiscoveredLinksSection content={section.content} />;
    }
    return <MarkdownContent content={section.content} />;
  };

  const handleRefineClick = () => {
    onRefine(cleaningInstructions);
  };

  const isRefineDisabled = isRefining || !cleaningInstructions.trim();
  const hasCleaningSection = parsedPlan.some(sec => sec.title.includes('Data Cleaning & Transformation'));

  if (parsedPlan.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-cyan-600 mb-2">Generated Plan</h2>
        <pre className="text-gray-700 whitespace-pre-wrap font-sans">{plan}</pre>
      </div>
    );
  }
  
  const discoveredSection = parsedPlan.find(sec => sec.title.includes('Discovered Datasets'));
  const cleaningSection = parsedPlan.find(sec => sec.title.includes('Data Cleaning & Transformation'));
  const otherSections = parsedPlan.filter(sec => !sec.title.includes('Discovered Datasets') && !sec.title.includes('Data Cleaning & Transformation'));


  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Your Ingestion Plan</h2>
        <div className="flex items-center space-x-2 flex-shrink-0">
           {isSaved && <span className="text-green-600 text-sm transition-opacity duration-300">Saved!</span>}
           <TooltipWrapper tooltipText="Saves the current plan to your browser's local storage.">
             <button onClick={handleSaveToLocalStorage} className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-300">
               <SaveIcon className="h-5 w-5 mr-2" />
               Save
             </button>
           </TooltipWrapper>
           <TooltipWrapper tooltipText="Downloads the entire plan as a Markdown file.">
             <button onClick={handleExportAsMarkdown} className="flex items-center px-3 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-300">
               <ExportIcon className="h-5 w-5 mr-2" />
               Export
             </button>
           </TooltipWrapper>
        </div>
      </div>
      
      <div className="space-y-8">
        {discoveredSection && (
             <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-xl font-semibold text-cyan-600">{discoveredSection.title}</h3>
                {renderSection(discoveredSection)}
            </div>
        )}
        
        {cleaningSection && (
             <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-xl font-semibold text-cyan-600">{cleaningSection.title}</h3>
                {renderSection(cleaningSection)}
            </div>
        )}

        {!hasCleaningSection && parsedPlan.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-cyan-600 flex items-center mb-4">
                    Data Cleaning & Transformation
                    <Tooltip text="Optional: Provide instructions for how the discovered data should be cleaned or transformed. The AI will generate a new plan section with detailed steps." />
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <textarea
                        value={cleaningInstructions}
                        onChange={(e) => setCleaningInstructions(e.target.value)}
                        placeholder="e.g., 'Remove rows with missing values in the 'price' column. Convert the 'date' column to ISO 8601 format. Anonymize the 'user_id' field.'"
                        className="w-full h-28 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 outline-none transition-all duration-300 resize-y placeholder-gray-400 text-gray-800"
                        disabled={isRefining}
                        aria-label="Data Cleaning Instructions"
                    />
                    <TooltipWrapper tooltipText={isRefineDisabled ? 'Please enter cleaning instructions to refine the plan.' : 'Generate a new section with detailed cleaning steps based on your instructions.'}>
                        <button
                            onClick={handleRefineClick}
                            disabled={isRefineDisabled}
                            className="mt-3 w-full sm:w-auto sm:float-right flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
                        >
                            {isRefining ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Refining...
                                </>
                            ) : (
                                <>
                                    <RefineIcon className="h-5 w-5 mr-2" />
                                    Refine Plan
                                </>
                            )}
                        </button>
                    </TooltipWrapper>
                </div>
            </div>
        )}
        
        {otherSections.map((section, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-xl font-semibold text-cyan-600">{section.title}</h3>
                {renderSection(section)}
            </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDisplay;