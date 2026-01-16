
import React from 'react';
import { GeneratedMedia } from '../types';

interface VisualManifestProps {
  media: GeneratedMedia | null;
  onClear: () => void;
  isProcessing: boolean;
}

const VisualManifest: React.FC<VisualManifestProps> = ({ media, onClear, isProcessing }) => {
  if (!media && !isProcessing) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl z-50 glass-panel rounded-xl overflow-hidden animate-in zoom-in duration-500 shadow-2xl shadow-sky-500/20">
      <div className="flex items-center justify-between p-3 border-b border-sky-500/30 bg-sky-950/50">
        <span className="text-[10px] font-hud text-sky-400 tracking-widest uppercase">
          {isProcessing ? 'Projecting Data...' : 'Visual Manifest'}
        </span>
        {!isProcessing && (
          <button onClick={onClear} className="text-slate-500 hover:text-white text-xs">CLOSE</button>
        )}
      </div>
      
      <div className="relative min-h-[300px] flex items-center justify-center bg-black/40 p-4">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <span className="text-sky-500/50 text-[10px] animate-pulse">SYNTHESIZING HOLOGRAPHIC BUFFER...</span>
          </div>
        ) : media?.type === 'image' ? (
          <img src={media.url} alt={media.prompt} className="max-w-full h-auto rounded shadow-lg" />
        ) : (
          <video src={media?.url} controls autoPlay className="max-w-full h-auto rounded shadow-lg" />
        )}
      </div>
      
      {media && !isProcessing && (
        <div className="p-3 bg-sky-950/30 text-[10px] text-slate-400 font-mono italic">
          {media.prompt}
        </div>
      )}
    </div>
  );
};

export default VisualManifest;
