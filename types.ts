export interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  retrievedContext?: string[];
  isThinking?: boolean;
}

export interface RagStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export enum AppTab {
  DEMO = 'DEMO',
  GUIDE = 'GUIDE',
}