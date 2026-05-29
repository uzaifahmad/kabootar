import React, { useState } from "react";
import { Folder, FolderOpen, MoreVertical, Plus, Search } from "lucide-react";

export function CollectionExplorer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-kabootar-border">
        <div className="relative flex items-center">
          <Search className="absolute left-2 w-4 h-4 text-kabootar-textMuted" />
          <input 
            type="text" 
            placeholder="Search collections..." 
            className="w-full bg-kabootar-bg text-kabootar-textMain border border-kabootar-border rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-kabootar-accent transition-colors"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-kabootar-textMuted uppercase tracking-wider group cursor-pointer hover:text-kabootar-textMain transition-colors">
          <span>Collections</span>
          <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Static Folder Mock */}
        <div className="select-none">
          <div 
            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-kabootar-textMuted" />
              ) : (
                <Folder className="w-4 h-4 text-kabootar-textMuted" />
              )}
              <span className="font-medium text-kabootar-textMain">Kabootar API</span>
            </div>
            <MoreVertical className="w-4 h-4 text-kabootar-textMuted opacity-0 hover:opacity-100 transition-opacity" />
          </div>
          
          {isOpen && (
            <div className="pl-6 pr-2 py-1 space-y-1">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-kabootar-accent/10 cursor-pointer">
                <span className="text-[10px] font-bold text-kabootar-get w-8">GET</span>
                <span className="text-sm text-kabootar-textMain truncate">Get User Profile</span>
              </div>

              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-kabootar-post w-8">POST</span>
                <span className="text-sm text-kabootar-textMuted group-hover:text-kabootar-textMain truncate">Create Workspace</span>
              </div>
              
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-kabootar-delete w-8">DEL</span>
                <span className="text-sm text-kabootar-textMuted group-hover:text-kabootar-textMain truncate">Delete Token</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
