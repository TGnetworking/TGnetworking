
import React from 'react';
import { Icons } from '../constants';

export interface GroundingSource {
  title: string;
  uri: string;
}

interface SearchResultsProps {
  sources: GroundingSource[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col animate-in fade-in slide-in-from-right duration-500">
      <div className="flex items-center gap-2 mb-4 border-b border-sky-500/20 pb-2">
        <Icons.Search className="w-4 h-4 text-sky-400" />
        <h3 className="font-hud text-xs text-sky-400 tracking-wider uppercase">Information Retrieval</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {sources.map((source, idx) => (
          <div key={idx} className="group relative">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-1 h-1 rounded-full bg-sky-500 group-hover:bg-sky-400 transition-colors shadow-[0_0_5px_#0ea5e9]" />
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-sky-500/50 uppercase tracking-tighter mb-0.5 font-hud">Reference Node {idx + 1}</div>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-slate-300 text-xs font-medium hover:text-sky-400 transition-colors truncate mb-1"
                >
                  {source.title || 'Source Document'}
                </a>
                <div className="text-[10px] text-slate-500 truncate font-mono italic opacity-60 group-hover:opacity-100 transition-opacity">
                  {source.uri}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-2 border-t border-sky-500/10 flex justify-between items-center opacity-40">
        <span className="text-[8px] font-hud uppercase">Google Search Grounding</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-sky-500 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
