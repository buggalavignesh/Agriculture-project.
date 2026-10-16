import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  Languages, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import type { AIAvailabilityStatus, AppSettings, ChatMessage } from '../types';
import { speechService } from '../services/speech';
import { aiService } from '../services/ai';

interface VoiceAssistantViewProps {
  aiStatus: AIAvailabilityStatus | null;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  aiStatus,
  settings,
  onUpdateSettings,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setErrorMessage(null);
    setSpokenTranscript('');
    setInterimTranscript('');
    speechService.stopSpeaking();
    setIsSpeaking(false);

    if (!speechService.isRecognitionSupported()) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android browser with speech packs.'
      );
      return;
    }

    setIsListening(true);
    speechService.startListening({
      lang: settings.preferredLanguage,
      onInterim: (text) => setInterimTranscript(text),
      onFinal: (text) => {
        setSpokenTranscript(text);
        setInterimTranscript('');
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleSendVoiceQuery = async () => {
    const query = spokenTranscript.trim();
    if (!query || isProcessingAI) return;

    if (!aiStatus?.isAvailable) {
      setErrorMessage('Local AI is not connected. Please ensure Ollama is running.');
      return;
    }

    setIsProcessingAI(true);
    setErrorMessage(null);
    setAiAnswer('');
    speechService.stopSpeaking();

    const messages: ChatMessage[] = [
      {
        id: `voice-${Date.now()}`,
        role: 'user',
        content: settings.preferredLanguage === 'te' 
          ? `${query}\n\n(Please reply in simple Telugu if possible, or clear English)`
          : query,
        timestamp: Date.now(),
      },
    ];

    try {
      let accumulated = '';
      await aiService.sendChatMessage({
        messages,
        model: aiStatus.selectedModel || 'gemma4:12b',
        endpoint: settings.ollamaEndpoint,
        onChunk: (chunk) => {
          accumulated = chunk;
          setAiAnswer(accumulated);
        },
      });

      // Automatically speak the answer aloud
      handleSpeakAnswer(accumulated);
    } catch (err: any) {
      setErrorMessage(`AI Response failed: ${err.message || 'Error communicating with local AI'}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSpeakAnswer = (text: string) => {
    if (!text) return;
    speechService.stopSpeaking();
    setIsSpeaking(true);

    speechService.speakText(text, {
      lang: settings.preferredLanguage,
      rate: settings.speechRate,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleToggleLanguage = () => {
    const nextLang = settings.preferredLanguage === 'en' ? 'te' : 'en';
    onUpdateSettings({ preferredLanguage: nextLang });
  };

  return (
    <div className="voice-assistant-page">
      {/* Top Banner */}
      <div className="voice-header-banner">
        <div className="voice-banner-left">
          <h2>Hands-Free Voice Farming Assistant</h2>
          <p>Speak your crop questions naturally while working in the field. CropMate speaks the answers aloud.</p>
        </div>

        {/* Language Switcher */}
        <button className="btn-lang-toggle" onClick={handleToggleLanguage}>
          <Languages size={18} />
          <span>Language: <strong>{settings.preferredLanguage === 'te' ? 'తెలుగు (Telugu)' : 'English (India)'}</strong></span>
        </button>
      </div>

      {/* Offline Speech Engine Info Callout */}
      <div className="speech-offline-notice">
        <Info size={16} />
        <span>
          <strong>Speech Engine Architecture:</strong> Voice output (TTS) works 100% offline using your operating system's installed voices. 
          Browser speech input uses the local speech recognizer if installed, or browser speech service when connected.
        </span>
      </div>

      {errorMessage && (
        <div className="voice-error-box">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Big Central Microphone Interface */}
      <div className="voice-center-stage">
        <div className={`mic-halo-container ${isListening ? 'halo-listening' : ''}`}>
          <button
            className={`btn-giant-mic ${isListening ? 'mic-active' : ''}`}
            onClick={handleToggleListening}
            title={isListening ? 'Tap to finish speaking' : 'Tap to speak your question'}
          >
            {isListening ? <MicOff size={44} /> : <Mic size={44} />}
          </button>
        </div>

        <div className="voice-instruction-label">
          {isListening ? (
            <span className="text-listening font-semibold">Listening... speak your question now</span>
          ) : (
            <span>Tap the microphone to ask your crop question</span>
          )}
        </div>

        {/* Live / Transcribed Text Card */}
        <div className="voice-transcript-card">
          <label className="transcript-label">Recognized Speech (You can edit below):</label>
          <textarea
            className="transcript-textarea"
            rows={3}
            value={isListening ? (interimTranscript || spokenTranscript || '...') : spokenTranscript}
            onChange={(e) => setSpokenTranscript(e.target.value)}
            placeholder="Your spoken words will appear here. Tap microphone to speak..."
            disabled={isListening}
          />

          <div className="transcript-controls">
            <button
              className="btn-outline-farm btn-sm"
              onClick={() => {
                setSpokenTranscript('');
                setInterimTranscript('');
              }}
              disabled={!spokenTranscript || isListening}
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>

            <button
              className="btn-primary-farm btn-sm"
              onClick={handleSendVoiceQuery}
              disabled={!spokenTranscript.trim() || isListening || isProcessingAI}
            >
              {isProcessingAI ? (
                <>
                  <Sparkles size={14} className="spin-icon" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Question</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Spoken AI Response Stage */}
        {(aiAnswer || isProcessingAI) && (
          <div className="voice-response-card" ref={answerRef}>
            <div className="voice-response-header">
              <div className="voice-resp-title">
                <Sparkles size={18} className="text-emerald" />
                <h3>CropMate Spoken Answer</h3>
              </div>

              {/* TTS Controls: Stop, Replay */}
              <div className="tts-controls-group">
                {isSpeaking ? (
                  <button className="btn-tts-ctrl btn-tts-stop" onClick={handleStopSpeaking}>
                    <VolumeX size={16} />
                    <span>Stop Speaking</span>
                  </button>
                ) : (
                  <button className="btn-tts-ctrl btn-tts-play" onClick={() => handleSpeakAnswer(aiAnswer)}>
                    <Volume2 size={16} />
                    <span>Replay Voice</span>
                  </button>
                )}
              </div>
            </div>

            <div className="voice-response-content">
              {aiAnswer ? (
                <div className="formatted-markdown">{aiAnswer}</div>
              ) : (
                <div className="generating-indicator">
                  <Sparkles size={16} className="spin-icon" />
                  <span>Consulting local AI model...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
