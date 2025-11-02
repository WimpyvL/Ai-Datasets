import React, { useState } from 'react';
import type { PlanSection } from '../types';
import TooltipWrapper from './TooltipWrapper';
import { DiscoveredLinksSection } from './DiscoveredLinksSection';
import { SaveIcon } from './icons/SaveIcon';
import { ExportIcon } from './icons/ExportIcon';

interface PlanDisplayProps {
  plan: string;
}

const parsePlan = (text: string): PlanSection[] => {
  if (!text) return [];
  const sections = text.split(/\n###\s\d+\.\s/);
  const relevantSections = sections.filter(s => s.trim() !== '').map((s, i) => i === 0 ? s : `${i + 1}. ${s.replace(/^###\s/, '')}`);

  return relevantSections.map((sectionText) => {
    const lines = sectionText.trim().split('\n');
    const title = lines[0].replace(/^###\s\d+\.\s/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });
};

const GenericSection: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return (
        <div className="text-gray-600 space-y-2 mt-2">
            {lines.map((line, idx) => <p key={idx}>{line}</p>)}
        </div>
    );
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const [isSaved, setIsSaved] = useState(false);
  const parsedPlan = parsePlan(plan);

  const handleSaveToLocalStorage = () => {
    localStorage.setItem('ingestionPlan', plan);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportAsMarkdown = () => {
    // A slightly more robust markdown export
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
    return <GenericSection content={section.content} />;
  };

  if (parsedPlan.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-cyan-600 mb-2">Generated Plan</h2>
        <pre className="text-gray-700 whitespace-pre-wrap font-sans">{plan}</pre>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Your Ingestion Plan</h2>
        <div className="flex items-center space-x-2">
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
        {parsedPlan.map((section, index) => (
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
