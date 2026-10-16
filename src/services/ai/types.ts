import type { AIAvailabilityStatus, AIModelInfo, ChatMessage } from '../../types';

export interface ChatRequestParams {
  messages: ChatMessage[];
  model?: string;
  endpoint?: string;
  signal?: AbortSignal;
  onChunk?: (text: string) => void;
  systemPrompt?: string;
}

export interface ImageAnalysisParams {
  imageBase64: string;
  imageMimeType?: string;
  cropType?: string;
  symptomsDescription?: string;
  userPrompt?: string;
  model?: string;
  endpoint?: string;
  signal?: AbortSignal;
  onChunk?: (text: string) => void;
}

export interface AIProvider {
  id: string;
  name: string;
  checkAvailability(endpoint?: string): Promise<AIAvailabilityStatus>;
  listModels(endpoint?: string): Promise<AIModelInfo[]>;
  sendChatMessage(params: ChatRequestParams): Promise<string>;
  analyzeCropImage(params: ImageAnalysisParams): Promise<string>;
  stopGeneration(): void;
}
