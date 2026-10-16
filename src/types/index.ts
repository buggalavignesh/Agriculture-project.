export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageBase64?: string;
  imageMimeType?: string;
  modelUsed?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  category?: 'general' | 'crop-doctor' | 'voice-chat';
}

export interface CropDiagnosis {
  id: string;
  timestamp: number;
  cropType: string;
  customCropName?: string;
  selectedSymptoms: string[];
  symptomNotes?: string;
  imageBase64: string;
  imageMimeType: string;
  analysisResult: string;
  modelUsed: string;
  observableSigns?: string[];
  possibleCauses?: string[];
  recommendedSteps?: string[];
  expertWarningNotice?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'crop-care' | 'soil' | 'irrigation' | 'symptoms' | 'pests' | 'nutrients' | 'fertilizer' | 'seasonal' | 'photo-guide';
  crops: string[];
  summary: string;
  keyPoints: string[];
  fullGuide: string;
  safetyNote?: string;
  tags: string[];
}


export interface AppSettings {
  ollamaEndpoint: string;
  selectedModel: string;
  preferredLanguage: 'en' | 'te'; // English or Telugu
  autoSpeakAnswer: boolean;
  speechRate: number; // 0.8 to 1.2
  offlineModeOnly: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AIModelInfo {
  name: string;
  size: number;
  modifiedAt: string;
  capabilities: string[];
  hasVision: boolean;
  details?: {
    family?: string;
    parameterSize?: string;
    quantizationLevel?: string;
  };
}

export interface AIAvailabilityStatus {
  isAvailable: boolean;
  endpoint: string;
  version?: string;
  models: AIModelInfo[];
  selectedModel: string;
  selectedModelHasVision: boolean;
  providerType: 'ollama' | 'android-native' | 'mock-offline';
  statusMessage: string;
}
