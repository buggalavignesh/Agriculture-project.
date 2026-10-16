import type { AIAvailabilityStatus, AIModelInfo } from '../../types';
import { FARMER_SYSTEM_PROMPT, buildCropDoctorPrompt } from './prompts';
import type { AIProvider, ChatRequestParams, ImageAnalysisParams } from './types';

/**
 * Android Native On-Device Inference Runtime Provider
 * Connects to on-device llama.cpp / MediaPipe / ExecuTorch native runtime embedded in Android APK
 */
export class AndroidNativeProvider implements AIProvider {
  id = 'android-native';
  name = 'Android On-Device Native Runtime';

  private activeAbortController: AbortController | null = null;
  private localPort: number = 8080;

  async checkAvailability(): Promise<AIAvailabilityStatus> {
    const isCapacitor = Boolean((window as any).Capacitor);
    const endpoint = `http://127.0.0.1:${this.localPort}`;

    if (!isCapacitor) {
      return {
        isAvailable: false,
        endpoint,
        models: [],
        selectedModel: '',
        selectedModelHasVision: false,
        providerType: 'android-native',
        statusMessage: 'Android Native provider is active only when running as an Android APK via Capacitor.',
      };
    }

    try {
      const resp = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        return {
          isAvailable: true,
          endpoint,
          models: [
            {
              name: 'gemma-2b-it-mobile-q4',
              size: 1600000000,
              modifiedAt: new Date().toISOString(),
              capabilities: ['completion'],
              hasVision: false,
            },
            {
              name: 'paligemma-3b-mobile-vision-q4',
              size: 2400000000,
              modifiedAt: new Date().toISOString(),
              capabilities: ['completion', 'vision'],
              hasVision: true,
            },
          ],
          selectedModel: 'paligemma-3b-mobile-vision-q4',
          selectedModelHasVision: true,
          providerType: 'android-native',
          statusMessage: 'On-device Android NPU/GPU inference engine active in app-private storage.',
        };
      }
    } catch {
      // In standalone web browser fallback
    }

    return {
      isAvailable: false,
      endpoint,
      models: [],
      selectedModel: '',
      selectedModelHasVision: false,
      providerType: 'android-native',
      statusMessage: 'Android on-device model daemon not detected. Defaulting to Windows/Desktop Ollama.',
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    const status = await this.checkAvailability();
    return status.models;
  }

  async sendChatMessage(params: ChatRequestParams): Promise<string> {
    const { messages, onChunk, systemPrompt = FARMER_SYSTEM_PROMPT } = params;
    this.activeAbortController = new AbortController();

    const response = await fetch(`http://127.0.0.1:${this.localPort}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: params.model || 'gemma-2b-it-mobile-q4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      }),
      signal: this.activeAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Android native inference error (${response.status})`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    if (onChunk) onChunk(result);
    return result;
  }

  async analyzeCropImage(params: ImageAnalysisParams): Promise<string> {
    const { imageBase64, cropType, symptomsDescription, userPrompt, onChunk } = params;
    this.activeAbortController = new AbortController();

    const promptText = buildCropDoctorPrompt(cropType, symptomsDescription, userPrompt);
    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const response = await fetch(`http://127.0.0.1:${this.localPort}/v1/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'paligemma-3b-mobile-vision-q4',
        prompt: promptText,
        image_base64: cleanedBase64,
      }),
      signal: this.activeAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Android vision inference error (${response.status})`);
    }

    const data = await response.json();
    const result = data.analysis || data.choices?.[0]?.message?.content || '';
    if (onChunk) onChunk(result);
    return result;
  }

  stopGeneration(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}
