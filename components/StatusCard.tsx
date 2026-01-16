
import React from 'react';
import { SystemStatus } from '../types';

interface StatusCardProps {
  status: SystemStatus;
}

const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  return (
    <div className="glass-panel rounded-lg p-4 space-y-3 font-hud">
      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
        <span>System Diagnostics</span>
        <span className={status.online ? 'text-emerald-500' : 'text-red-500'}>{status.online ? 'Online' : 'Offline'}</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span>Neural Processing</span>
            <span>{status.cpu}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${status.cpu}%` }} />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span>Memory Buffer</span>
            <span>{status.memory}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${status.memory}%` }} />
          </div>
        </div>

        <div className="pt-2 border-t border-sky-500/20">
          <div className="text-[10px] text-slate-500 uppercase mb-2">Active Protocols</div>
          <div className="flex flex-wrap gap-2">
            {status.tools.map((tool) => (
              <span key={tool} className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 rounded text-[9px] text-sky-400">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
