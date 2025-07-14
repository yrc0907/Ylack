"use client";

import { Search, HelpCircle } from "lucide-react";

export function WorkspaceHeader() {
  return (
    <div className="h-14 bg-purple-900 flex items-center px-4">
      <div className="relative max-w-[600px] w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search CodeWithAntonio Workspace"
          className="w-full bg-purple-800 text-white rounded-md pl-10 pr-4 py-1.5 border border-purple-700 focus:outline-none focus:ring-1 focus:ring-white"
        />
      </div>
      <div className="ml-auto">
        <button
          className="text-white p-2 rounded-full hover:bg-purple-800"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
} 