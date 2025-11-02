import React from 'react';
import { EditIcon } from './icons/EditIcon';

interface CollapsedSearchProps {
  description: string;
  onNewSearch: () => void;
}

const CollapsedSearch: React.FC<CollapsedSearchProps> = ({ description, onNewSearch }) => {
  return (
    <div className="max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">Current Search:</p>
        <p className="text-gray-800 font-medium truncate" title={description}>
          {description}
        </p>
      </div>
      <button
        onClick={onNewSearch}
        className="ml-4 flex-shrink-0 flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500 transition-colors duration-300"
      >
        <EditIcon className="h-5 w-5 mr-2" />
        New Search
      </button>
    </div>
  );
};

export default CollapsedSearch;