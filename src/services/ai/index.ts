import type { AIAvailabilityStatus, AIModelInfo } from '../../types';
import { OllamaProvider } from './ollama';
import { AndroidNativeProvider } from './androidNative';
import type { AIProvider, ChatRequestParams, ImageAnalysisParams } from './types';

class AIServiceCoordinator {
  private activeProvider: AIProvider;
  private ollamaProvider: OllamaProvider;
  private androidProvider: AndroidNativeProvider;

  constructor() {
    this.ollamaProvider = new OllamaProvider();
    this.androidProvider = new AndroidNativeProvider();

    // Auto-select Android Native when running in Capacitor on an Android device
    const isCapacitorAndroid = Boolean(
      typeof window !== 'undefined' &&
      (window as any).Capacitor?.getPlatform() === 'android'
    );

    this.activeProvider = isCapacitorAndroid ? this.androidProvider : this.ollamaProvider;
  }


  getProvider(): AIProvider {
    return this.activeProvider;
  }

  async checkStatus(endpoint?: string): Promise<AIAvailabilityStatus> {
    return this.activeProvider.checkAvailability(endpoint);
  }

  async listModels(endpoint?: string): Promise<AIModelInfo[]> {
    return this.activeProvider.listModels(endpoint);
  }

  async sendChatMessage(params: ChatRequestParams): Promise<string> {
    return this.activeProvider.sendChatMessage(params);
  }

  async analyzeCropImage(params: ImageAnalysisParams): Promise<string> {
    return this.activeProvider.analyzeCropImage(params);
  }

  stopGeneration(): void {
    this.activeProvider.stopGeneration();
  }
}

export const aiService = new AIServiceCoordinator();
export * from './types';
export * from './prompts';
