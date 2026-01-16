
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface TerminalProps {
  logs: ChatMessage[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full glass-panel rounded-lg p-4 font-mono text-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-sky-500/30 pb-1">
        <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">System Interface Logs</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className={log.role === 'user' ? 'text-orange-400' : log.role === 'jarvis' ? 'text-sky-300' : 'text-slate-400 italic'}>
              <span className="font-bold uppercase mr-2">{log.role === 'user' ? 'Guest:' : log.role === 'jarvis' ? 'Jarvis:' : 'System:'}</span>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
