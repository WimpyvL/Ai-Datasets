
import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';

interface CodeSnippetProps {
  code: string;
  language: 'bash' | 'javascript' | 'json' | 'python';
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabel = {
      bash: 'Shell Command',
      javascript: 'JavaScript Snippet',
      json: 'JSON',
      python: 'Python Script',
  }[language];

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden my-2">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
        <span className="text-xs font-semibold text-gray-300 uppercase">{languageLabel}</span>
        <button
          onClick={handleCopy}
          className="flex items-center text-xs text-gray-300 hover:text-white font-semibold transition-colors"
        >
          <CopyIcon className="h-4 w-4 mr-2" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-white whitespace-pre-wrap font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};
