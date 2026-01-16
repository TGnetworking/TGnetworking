
export interface MemoryItem {
  id: string;
  category: string;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface SystemStatus {
  online: boolean;
  cpu: number;
  memory: number;
  tools: string[];
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}
