
// components/TopNavbar.js
import React from 'react';
import { Search, Bell, MessageCircle, Menu, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface TopNavbarProps {
  toggleSidebar?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
      {/* Left section with logo and toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-600">Go Back to Home</span>
        </div>
        
        {/* Sidebar toggle button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section with notifications */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        
        <button className="p-2 rounded-md hover:bg-gray-100 relative">
          <MessageCircle className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          VA
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;