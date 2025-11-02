import React from 'react';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="relative flex items-center group ml-2">
      <QuestionMarkIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-xl">
        <p dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-gray-100 text-emerald-700 rounded px-1 py-0.5 text-xs font-mono">$1</code>') }} />
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-200"></div>
      </div>
    </div>
  );
};

export default Tooltip;