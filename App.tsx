
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Modality as ModalityType } from '@google/genai';
import JarvisCore from './components/JarvisCore';
import Terminal from './components/Terminal';
import StatusCard from './components/StatusCard';
import MemoryVault from './components/MemoryVault';
import SearchResults, { GroundingSource } from './components/SearchResults';
import VisualManifest from './components/VisualManifest';
import { ChatMessage, MemoryItem, SystemStatus, AspectRatio, GeneratedMedia } from './types';
import { decode, decodeAudioData, createBlob } from './services/audioUtils';
import { Icons } from './constants';

const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'save_memory',
    description: 'Store personal info/preferences to the vault.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ['category', 'content'],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for news or complex facts.',
    parameters: {
      type: Type.OBJECT,
      properties: { query: { type: Type.STRING } },
      required: ['query'],
    },
  },
  {
    name: 'find_nearby',
    description: 'Get location data or directions using Maps grounding.',
    parameters: {
      type: Type.OBJECT,
      properties: { location_query: { type: Type.STRING } },
      required: ['location_query'],
    },
  }
];

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [activeMedia, setActiveMedia] = useState<GeneratedMedia | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("16:9");
  const [status, setStatus] = useState<SystemStatus>({
    online: false,
    cpu: 0,
    memory: 0,
    tools: ['PRO_THINK', 'VEO_ANIMATE', 'LIVE_VOICE', 'TTS_SYNC', 'FAST_LITE'],
  });

  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core System Setup
  useEffect(() => {
    const stored = localStorage.getItem('jarvis_memories');
    if (stored) setMemories(JSON.parse(stored));
    setTimeout(() => setIsInitializing(false), 2000);
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 15) + 5,
        memory: Math.floor(Math.random() * 5) + 20,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((role: ChatMessage['role'], text: string, isThinking = false) => {
    setLogs(prev => [...prev, { role, text, timestamp: Date.now(), isThinking }]);
  }, []);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = error => reject(error);
    });
  };

  const checkApiKey = async () => {
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      addLog('system', "Sir, high-power models require an authenticated API key. Opening selection dialog.");
      await window.aistudio.openSelectKey();
    }
  };

  // --- FEATURE: Image Analysis (Vision) ---
  const analyzeImage = async (prompt: string) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return addLog('system', "Sir, please upload a visual node for analysis.");
    
    addLog('system', "Initiating optical recognition protocols...");
    addLog('jarvis', 'Thinking...', true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64 = await getBase64(file);
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { inlineData: { data: base64, mimeType: file.type } },
          { text: prompt || "Describe this image in detail." }
        ],
        config: { thinkingConfig: { thinkingBudget: 10000 } }
      });
      setLogs(prev => prev.filter(l => !l.isThinking));
      addLog('jarvis', response.text || "Analysis inconclusive, Sir.");
    } catch (e: any) {
      addLog('system', `Vision error: ${e.message}`);
    }
  };

  // --- FEATURE: Text-to-Speech (TTS) ---
  const speakText = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly and with a refined British accent: ${text}` }] }],
        config: {
          responseModalities: [ModalityType.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData && audioContextsRef.current.output) {
        const ctx = audioContextsRef.current.output;
        const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        setIsSpeaking(true);
        source.onended = () => setIsSpeaking(false);
      }
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  // --- FEATURE: Interaction Manager ---
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    addLog('user', msg);

    // Image/Video Routing
    if (msg.toLowerCase().includes("analyze") || msg.toLowerCase().includes("what is in this")) return analyzeImage(msg);
    if (msg.toLowerCase().includes("generate image") || msg.toLowerCase().includes("create image")) {
        await checkApiKey();
        setIsProcessingMedia(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
              model: 'gemini-3-pro-image-preview',
              contents: { parts: [{ text: msg }] },
              config: { imageConfig: { aspectRatio: selectedRatio, imageSize: "1K" } },
            });
            const part = response.candidates[0].content.parts.find(p => p.inlineData);
            if (part?.inlineData) setActiveMedia({ type: 'image', url: `data:image/png;base64,${part.inlineData.data}`, prompt: msg });
        } catch (e: any) { addLog('system', `Gen-Image error: ${e.message}`); }
        setIsProcessingMedia(false);
        return;
    }

    // Default Chat (Pro Thinking for complex, Lite for simple)
    const isComplex = msg.length > 50 || msg.includes("?") || msg.includes("calculate") || msg.includes("why");
    const model = isComplex ? 'gemini-3-pro-preview' : 'gemini-2.5-flash-lite-latest';
    
    addLog('jarvis', 'Thinking...', true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model,
        contents: msg,
        config: isComplex ? { thinkingConfig: { thinkingBudget: 32768 } } : undefined,
      });
      setLogs(prev => prev.filter(l => !l.isThinking));
      addLog('jarvis', response.text || "Systems unresponsive.");
      if (response.text) speakText(response.text);
    } catch (e) { addLog('system', "Neural link failure."); }
  };

  const handleToolCall = async (fc: any) => {
    addLog('system', `Protocol: ${fc.name}`);
    let result = "ok";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (fc.name === 'web_search') {
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: fc.args.query, config: { tools: [{ googleSearch: {} }] } });
      const sources = res.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => ({ title: c.web!.title || 'Ref', uri: c.web!.uri || '' })) || [];
      setGroundingSources(sources);
      result = res.text || "Results extracted.";
    } else if (fc.name === 'find_nearby') {
      const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fc.args.location_query, config: { tools: [{ googleMaps: {} }] } });
      const sources = res.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.maps).map(c => ({ title: c.maps!.title || 'Location', uri: c.maps!.uri || '' })) || [];
      setGroundingSources(sources);
      result = res.text || "Nearby data mapped.";
    }

    if (sessionRef.current) sessionRef.current.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } });
  };

  const startJarvis = async () => {
    if (status.online) return;
    addLog('system', "Powering up arc reactor...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus(p => ({ ...p, online: true }));
            addLog('system', 'Neural uplink established.');
            setIsListening(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.outputTranscription) addLog('jarvis', m.serverContent.outputTranscription.text);
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              const { output } = audioContextsRef.current;
              if (output) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
                const buffer = await decodeAudioData(decode(audioData), output, 24000, 1);
                const source = output.createBufferSource();
                source.buffer = buffer;
                source.connect(output.destination);
                source.onended = () => { sourcesRef.current.delete(source); if (sourcesRef.current.size === 0) setIsSpeaking(false); };
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            }
            if (m.toolCall) for (const fc of m.toolCall.functionCalls) await handleToolCall(fc);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
          tools: [{ functionDeclarations: toolDeclarations }],
          inputAudioTranscription: {}, outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) { 
      addLog('system', `Neural error: ${err.message}. Ensure microphone access is granted.`); 
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] p-6 gap-6 relative overflow-hidden text-slate-400 font-hud">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <VisualManifest media={activeMedia} isProcessing={isProcessingMedia} onClear={() => setActiveMedia(null)} />

      {/* Left Column */}
      <div className="w-1/4 flex flex-col gap-6 z-10">
        <StatusCard status={status} />
        <div className="glass-panel p-4 rounded-lg space-y-4">
          <div className="text-[10px] text-sky-400 uppercase tracking-widest border-b border-sky-500/20 pb-1">Protocols</div>
          <select value={selectedRatio} onChange={(e) => setSelectedRatio(e.target.value as AspectRatio)} className="w-full bg-slate-900 border border-sky-500/20 rounded px-2 py-1 text-xs text-sky-400 outline-none">
            {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => addLog('system', `Node loaded: ${e.target.files?.[0]?.name}`)} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-sky-500/5 border border-sky-500/30 rounded text-[9px] uppercase hover:bg-sky-500/10 transition-colors">Load Visual Data</button>
        </div>
        <div className="flex-1 overflow-hidden">
          <MemoryVault memories={memories} />
        </div>
      </div>

      {/* Center HUD */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 z-10 relative">
        <JarvisCore isSpeaking={isSpeaking} isListening={isListening} />
        {!status.online ? (
          <button onClick={startJarvis} className="px-12 py-4 bg-sky-500/10 border-2 border-sky-500 rounded-full text-sky-400 tracking-[0.2em] hover:bg-sky-500 glow-cyan transition-all uppercase">Initiate Uplink</button>
        ) : (
          <div className="text-xs text-sky-500 animate-pulse tracking-[0.5em] uppercase">Neural Uplink Synchronized</div>
        )}
      </div>

      {/* Right Interaction */}
      <div className="w-1/3 flex flex-col gap-6 z-10">
        <Terminal logs={logs} />
        {groundingSources.length > 0 && <div className="h-1/3"><SearchResults sources={groundingSources} /></div>}
        <div className="glass-panel p-3 rounded-lg flex flex-col gap-2">
          <div className="flex gap-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="COMMAND..." className="flex-1 bg-transparent border-b border-sky-500/30 py-1 text-sm text-sky-400 font-mono outline-none" />
            <button onClick={handleChat} className="bg-sky-500/20 p-2 rounded hover:bg-sky-500/40"><Icons.Activity className="w-4 h-4 text-sky-400" /></button>
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 uppercase tracking-widest">
             <span>Gemini 3 Pro Active</span>
             <span>Cognitive Thinking Budget: MAX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
