import React from 'react';
import { BrainIcon } from './icons/BrainIcon';

const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <BrainIcon className="h-10 w-10 mr-4 text-cyan-500" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text">
          AI Dataset Discovery Pipeline
        </h1>
      </div>
    </header>
  );
};

export default Header;