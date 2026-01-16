
import React from 'react';

interface JarvisCoreProps {
  isSpeaking: boolean;
  isListening: boolean;
}

const JarvisCore: React.FC<JarvisCoreProps> = ({ isSpeaking, isListening }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Rings */}
      <div className={`absolute w-full h-full border-4 border-sky-500/20 rounded-full animate-[spin_10s_linear_infinite] ${isSpeaking ? 'border-sky-400/50' : ''}`} />
      <div className={`absolute w-4/5 h-4/5 border-2 border-sky-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse] ${isSpeaking ? 'border-sky-300/60' : ''}`} />
      
      {/* Pulsing Core */}
      <div className={`relative w-1/3 h-1/3 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 ${isSpeaking ? 'scale-125 bg-sky-400/20' : isListening ? 'scale-110 bg-sky-500/30' : 'bg-sky-900/40'}`}>
        <div className={`w-full h-full absolute flex items-center justify-center transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-1 bg-sky-400 animate-pulse blur-sm" />
        </div>
        
        {/* The Arc Reactor Style Core */}
        <div className={`w-16 h-16 rounded-full border-4 border-sky-400 glow-cyan flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
          <div className="w-8 h-8 rounded-full border-2 border-sky-300 animate-ping opacity-75" />
          <div className="absolute w-2 h-10 bg-sky-400/40 rotate-45" />
          <div className="absolute w-2 h-10 bg-sky-400/40 -rotate-45" />
        </div>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-sky-400 font-hud text-xs tracking-[0.3em] uppercase">
        {isSpeaking ? 'Transmitting' : isListening ? 'Processing' : 'Standby'}
      </div>
      
      <svg className="absolute w-[300px] h-[300px] pointer-events-none opacity-20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="5,5" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#0ea5e9" strokeWidth="0.2" />
      </svg>
    </div>
  );
};

export default JarvisCore;
