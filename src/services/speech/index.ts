// Voice & Speech Service for CropMate Offline

export interface SpeechRecognitionStatus {
  isSupported: boolean;
  isListening: boolean;
  isOfflineCapable: boolean;
  errorNotice?: string;
}

export interface VoiceOption {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  constructor() {
    this.initRecognition();
  }


  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  isRecognitionSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getAvailableVoices(): Promise<VoiceOption[]> {
    return new Promise((resolve) => {
      if (!this.isSynthesisSupported()) {
        resolve([]);
        return;
      }

      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(
          voices.map((v) => ({
            name: v.name,
            lang: v.lang,
            default: v.default,
            localService: v.localService,
          }))
        );
        return;
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(
          voices.map((v) => ({
            name: v.name,
            lang: v.lang,
            default: v.default,
            localService: v.localService,
          }))
        );
      };

      // Fallback timeout in case onvoiceschanged does not fire
      setTimeout(() => {
        resolve(
          window.speechSynthesis.getVoices().map((v) => ({
            name: v.name,
            lang: v.lang,
            default: v.default,
            localService: v.localService,
          }))
        );
      }, 500);
    });
  }

  /**
   * Start microphone listening
   */
  startListening(params: {
    lang?: 'en' | 'te';
    onInterim?: (text: string) => void;
    onFinal: (text: string) => void;
    onError?: (err: string) => void;
    onEnd?: () => void;
  }): void {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        params.onError?.('Speech recognition is not supported in this browser.');
        return;
      }
    }

    try {
      this.recognition.lang = params.lang === 'te' ? 'te-IN' : 'en-IN';
    } catch {
      this.recognition.lang = 'en-US';
    }

    let finalTranscript = '';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (params.onInterim && interim) {
        params.onInterim(interim);
      }

      if (finalTranscript) {
        params.onFinal(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorMsg = event.error || 'Microphone error';
      if (errorMsg === 'network') {
        params.onError?.(
          'Speech recognition network error: standard browser speech recognition requires network access on this device. For 100% offline speech, install Windows speech packs or native on-device model.'
        );
      } else if (errorMsg === 'not-allowed') {
        params.onError?.('Microphone permission was denied. Please grant microphone access.');
      } else {
        params.onError?.(`Speech recognition error: ${errorMsg}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      params.onEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      this.isListening = false;
      params.onError?.(err.message || 'Failed to start microphone.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Read text aloud using offline-capable TTS
   */
  speakText(
    text: string,
    options?: {
      lang?: 'en' | 'te';
      rate?: number;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.isSynthesisSupported()) {
      options?.onError?.('Text-to-speech not supported.');
      return;
    }

    this.stopSpeaking();

    const cleanedText = this.cleanTextForSpeech(text);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = 1.0;

    const targetLang = options?.lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.lang = targetLang;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      options?.lang === 'te'
        ? v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
        : v.lang.startsWith('en-IN') || v.lang.startsWith('en')
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (err) => {
      this.currentUtterance = null;
      options?.onError?.(err);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return Boolean(this.isSynthesisSupported() && window.speechSynthesis.speaking);
  }

  cleanTextForSpeech(text: string): string {
    return text
      // remove markdown headers
      .replace(/#+\s+/g, '')
      // remove bold/italic markers
      .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1')
      // remove markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // remove emojis or special symbols that speech engines stutter on
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      // clean excessive newlines
      .replace(/\n+/g, '. ')
      .trim();
  }
}

export const speechService = new SpeechService();
