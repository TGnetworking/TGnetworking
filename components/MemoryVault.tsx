
import React from 'react';
import { MemoryItem } from '../types';
import { Icons } from '../constants';

interface MemoryVaultProps {
  memories: MemoryItem[];
  highlightedIds?: Set<string>;
}

const MemoryVault: React.FC<MemoryVaultProps> = ({ memories, highlightedIds = new Set() }) => {
  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Icons.Memory className="w-4 h-4 text-sky-400" />
        <h3 className="font-hud text-xs text-sky-400 tracking-wider uppercase">Memory Core Vault</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-[11px] custom-scrollbar">
        {memories.length === 0 ? (
          <div className="text-slate-600 italic">Vault empty. No data recorded yet.</div>
        ) : (
          memories.map((m) => {
            const isHighlighted = highlightedIds.has(m.id);
            return (
              <div 
                key={m.id} 
                className={`p-2 border-l-2 transition-all duration-500 ${
                  isHighlighted 
                  ? 'border-sky-400 bg-sky-400/20 scale-[1.02] shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                  : 'border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10'
                }`}
              >
                <div className="flex justify-between text-sky-500/50 mb-1">
                  <span className={`uppercase text-[9px] ${isHighlighted ? 'text-sky-300 font-bold' : ''}`}>
                    {m.category}
                  </span>
                  <span>{new Date(m.timestamp).toLocaleDateString()}</span>
                </div>
                <div className={`${isHighlighted ? 'text-white' : 'text-slate-300'} transition-colors`}>
                  {m.content}
                </div>
                {isHighlighted && (
                  <div className="mt-1 text-[8px] text-sky-400 font-hud animate-pulse">
                    RECALLED DATA
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemoryVault;
