import React from 'react';
import { Database, BrainCircuit, Github } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cerebro Corporativo</h1>
              <p className="text-xs text-indigo-300 hidden sm:block">Powered by Gemini & Python Architecture</p>
            </div>
          </div>
          <div className="flex gap-4">
             {/* Simple navigation items if needed later */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;