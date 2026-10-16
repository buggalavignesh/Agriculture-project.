import type { AIAvailabilityStatus, AIModelInfo } from '../../types';
import { FARMER_SYSTEM_PROMPT, buildCropDoctorPrompt } from './prompts';
import type { AIProvider, ChatRequestParams, ImageAnalysisParams } from './types';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama Local Runtime (Windows)';

  private activeAbortController: AbortController | null = null;
  private resolvedBaseUrl: string = 'http://127.0.0.1:11434';

  getResolvedEndpoint(): string {
    return this.resolvedBaseUrl;
  }


  /**
   * Determine whether to use direct port or Vite proxy based on connectivity & CORS
   */
  private async getWorkingEndpoint(configuredEndpoint: string = 'http://127.0.0.1:11434'): Promise<string> {
    const directUrl = configuredEndpoint.replace(/\/$/, '');
    try {
      const resp = await fetch(`${directUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        this.resolvedBaseUrl = directUrl;
        return directUrl;
      }
    } catch {
      // Direct call failed (possibly CORS in browser); try the Vite proxy if running locally
      try {
        const proxyUrl = '/api/ollama';
        const resp2 = await fetch(`${proxyUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
        if (resp2.ok) {
          this.resolvedBaseUrl = proxyUrl;
          return proxyUrl;
        }
      } catch {
        // Fall back to direct
      }
    }
    this.resolvedBaseUrl = directUrl;
    return directUrl;
  }

  async checkAvailability(endpoint: string = 'http://127.0.0.1:11434'): Promise<AIAvailabilityStatus> {
    try {
      const workingBase = await this.getWorkingEndpoint(endpoint);
      const resp = await fetch(`${workingBase}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(4000) });

      if (!resp.ok) {
        return {
          isAvailable: false,
          endpoint,
          models: [],
          selectedModel: '',
          selectedModelHasVision: false,
          providerType: 'ollama',
          statusMessage: `Ollama responded with HTTP ${resp.status}. Ensure Ollama is running.`,
        };
      }

      const data = await resp.json();
      const rawModels: any[] = data.models || [];

      const models: AIModelInfo[] = rawModels.map((m: any) => {
        const caps: string[] = m.capabilities || [];
        const nameLower = (m.name || '').toLowerCase();
        const hasVision = caps.includes('vision') ||
          nameLower.includes('vision') ||
          nameLower.includes('llava') ||
          nameLower.includes('moondream') ||
          nameLower.includes('gemma4') ||
          nameLower.includes('bakllava') ||
          nameLower.includes('minicpm-v');

        return {
          name: m.name,
          size: m.size || 0,
          modifiedAt: m.modified_at || '',
          capabilities: caps,
          hasVision,
          details: {
            family: m.details?.family,
            parameterSize: m.details?.parameter_size,
            quantizationLevel: m.details?.quantization_level,
          },
        };
      });

      const preferredModel = models.find((m) => m.hasVision)?.name || (models.length > 0 ? models[0].name : '');
      const selectedModelHasVision = models.some((m) => m.name === preferredModel && m.hasVision);

      return {
        isAvailable: models.length > 0,
        endpoint: workingBase,
        models,
        selectedModel: preferredModel,
        selectedModelHasVision,
        providerType: 'ollama',
        statusMessage: models.length > 0
          ? `Ollama connected locally with ${models.length} model(s). Active: ${preferredModel}`
          : 'Ollama is running, but no models are installed yet. Run `ollama run gemma4:12b` or `ollama run llava`.',
      };
    } catch (err: any) {
      return {
        isAvailable: false,
        endpoint,
        models: [],
        selectedModel: '',
        selectedModelHasVision: false,
        providerType: 'ollama',
        statusMessage: `Cannot reach Ollama at ${endpoint}. Make sure the Ollama app is open or run 'ollama serve'.`,
      };
    }
  }

  async listModels(endpoint: string = 'http://127.0.0.1:11434'): Promise<AIModelInfo[]> {
    const status = await this.checkAvailability(endpoint);
    return status.models;
  }

  async sendChatMessage(params: ChatRequestParams): Promise<string> {
    const { messages, model, endpoint, onChunk, systemPrompt = FARMER_SYSTEM_PROMPT } = params;
    const workingBase = await this.getWorkingEndpoint(endpoint);

    this.activeAbortController = new AbortController();
    const effectiveSignal = params.signal || this.activeAbortController.signal;

    // Convert messages for Ollama API
    const formattedMessages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of messages) {
      const payload: any = {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      };

      if (msg.imageBase64) {
        // Strip data:image/...;base64,
        const cleaned = msg.imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        payload.images = [cleaned];
      }

      formattedMessages.push(payload);
    }

    const requestBody = {
      model: model || 'gemma4:12b',
      messages: formattedMessages,
      stream: true,
      options: {
        temperature: 0.7,
      },
    };

    const response = await fetch(`${workingBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: effectiveSignal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama chat error (${response.status}): ${errText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response stream received from local Ollama.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const chunk = parsed.message?.content || '';
          if (chunk) {
            fullText += chunk;
            if (onChunk) onChunk(fullText);
          }
        } catch {
          // ignore incomplete stream lines
        }
      }
    }

    // Process leftover buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        const chunk = parsed.message?.content || '';
        if (chunk) {
          fullText += chunk;
          if (onChunk) onChunk(fullText);
        }
      } catch {
        // ignore
      }
    }

    this.activeAbortController = null;
    return fullText;
  }

  async analyzeCropImage(params: ImageAnalysisParams): Promise<string> {
    const {
      imageBase64,
      cropType,
      symptomsDescription,
      userPrompt,
      model = 'gemma4:12b',
      endpoint,
      onChunk,
    } = params;

    const workingBase = await this.getWorkingEndpoint(endpoint);
    this.activeAbortController = new AbortController();
    const effectiveSignal = params.signal || this.activeAbortController.signal;

    const promptText = buildCropDoctorPrompt(cropType, symptomsDescription, userPrompt);
    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: FARMER_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: promptText,
          images: [cleanedBase64],
        },
      ],
      stream: true,
      options: {
        temperature: 0.4, // lower temperature for more precise visual diagnosis
      },
    };

    const response = await fetch(`${workingBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: effectiveSignal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Crop Doctor vision inference error (${response.status}): ${errText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response stream received from vision model.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const chunk = parsed.message?.content || '';
          if (chunk) {
            fullText += chunk;
            if (onChunk) onChunk(fullText);
          }
        } catch {
          // ignore
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        const chunk = parsed.message?.content || '';
        if (chunk) {
          fullText += chunk;
          if (onChunk) onChunk(fullText);
        }
      } catch {
        // ignore
      }
    }

    this.activeAbortController = null;
    return fullText;
  }

  stopGeneration(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}
