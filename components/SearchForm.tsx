
import React, { useState, useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import Tooltip from './Tooltip';
import TooltipWrapper from './TooltipWrapper';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface SearchFormProps {
  onGenerate: (description: string, file?: File) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onGenerate, isLoading }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (file) {
        clearFile();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // Limit file size to 1MB for this example
        if (selectedFile.size > 1024 * 1024) {
            alert("File size cannot exceed 1MB.");
            clearFile();
            return;
        }
        setFile(selectedFile);
        setDescription('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(description, file || undefined);
  };

  const isButtonDisabled = isLoading || (!description.trim() && !file);
  const buttonTooltip = isButtonDisabled ? "Please provide a Dataset Description or upload a file to generate a plan." : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div>
        <div className="flex items-center mb-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Dataset Description</label>
          <Tooltip text="Provide a detailed description of the data you're looking for. The more specific you are, the better the generated plan will be. For example, mention data fields, sources, or time periods." />
        </div>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe the dataset you need, e.g., 'A collection of high-resolution images of different cat breeds...'"
          className="w-full h-32 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 outline-none transition-all duration-300 resize-y placeholder-gray-400 text-gray-800"
          disabled={isLoading}
          aria-label="Dataset Description"
        />
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div>
        {file ? (
            <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg p-3">
                <span className="text-gray-700 text-sm font-medium truncate" title={file.name}>{file.name}</span>
                <button type="button" onClick={clearFile} disabled={isLoading} className="text-gray-500 hover:text-red-600 disabled:text-gray-300">
                    <XCircleIcon className="h-5 w-5" />
                </button>
            </div>
        ) : (
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-400 transition-colors duration-200 flex flex-col items-center justify-center w-full py-6">
                <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-semibold text-cyan-600">Upload a file</span>
                <span className="text-xs text-gray-500 mt-1">CSV, JSON, TXT (Max. 1MB)</span>
                <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isLoading}
                    accept=".csv,.json,.txt,text/plain"
                />
            </label>
        )}
      </div>

      <div className="pt-2">
        <TooltipWrapper tooltipText={buttonTooltip}>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SearchIcon className="h-5 w-5 mr-2" />
                Generate Plan
              </>
            )}
          </button>
        </TooltipWrapper>
      </div>
    </form>
  );
};

export default SearchForm;
