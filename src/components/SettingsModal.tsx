import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Volume2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Eye, 
  EyeOff, 
  Terminal
} from 'lucide-react';
import type { AppSettings, AIAvailabilityStatus } from '../types';
import { aiService } from '../services/ai';
import { speechService } from '../services/speech';
import type { VoiceOption } from '../services/speech';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  aiStatus: AIAvailabilityStatus | null;
  onRefreshAIStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  aiStatus,
  onRefreshAIStatus,
}) => {
  const [endpointInput, setEndpointInput] = useState(settings.ollamaEndpoint);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [preferredLang, setPreferredLang] = useState<'en' | 'te'>(settings.preferredLanguage);
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeakAnswer);
  const [speechRate, setSpeechRate] = useState(settings.speechRate);

  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setEndpointInput(settings.ollamaEndpoint);
    setSelectedModel(settings.selectedModel || aiStatus?.selectedModel || '');
    setPreferredLang(settings.preferredLanguage);
    setAutoSpeak(settings.autoSpeakAnswer);
    setSpeechRate(settings.speechRate);
  }, [settings, aiStatus]);

  useEffect(() => {
    if (isOpen) {
      speechService.getAvailableVoices().then(setAvailableVoices);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTestingOllama(true);
    setTestResult(null);
    try {
      const status = await aiService.checkStatus(endpointInput);
      if (status.isAvailable) {
        setTestResult(`Success! Ollama connected with ${status.models.length} model(s).`);
        onRefreshAIStatus();
      } else {
        setTestResult(`Connection Failed: ${status.statusMessage}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message || 'Cannot reach local endpoint'}`);
    } finally {
      setIsTestingOllama(false);
    }
  };

  const handleTestTTS = () => {
    setIsTestingVoice(true);
    const sampleText = preferredLang === 'te'
      ? 'నమస్కారం! క్రాప్‌మేట్ ఆఫ్‌లైన్ మీ వ్యవసాయ సహాయకుడు.'
      : 'Hello farmer! CropMate Offline is ready to assist your crops without internet.';

    speechService.speakText(sampleText, {
      lang: preferredLang,
      rate: speechRate,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
    });
  };

  const handleSave = () => {
    onSaveSettings({
      ollamaEndpoint: endpointInput.trim(),
      selectedModel,
      preferredLanguage: preferredLang,
      autoSpeakAnswer: autoSpeak,
      speechRate,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="settings-header">
          <div className="settings-header-title">
            <SettingsIcon size={22} className="text-emerald" />
            <h2>CropMate Settings & Local AI Diagnostics</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Section 1: Ollama Local Inference */}
          <section className="settings-section">
            <div className="section-title-row">
              <Cpu size={18} className="text-emerald" />
              <h3>1. Local AI Runtime (Ollama / Windows)</h3>
            </div>

            <div className="form-group">
              <label>Ollama Server Endpoint</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="input-field"
                />
                <button
                  type="button"
                  className="btn-outline-farm btn-sm"
                  onClick={handleTestConnection}
                  disabled={isTestingOllama}
                >
                  {isTestingOllama ? <RefreshCw size={14} className="spin-icon" /> : <RefreshCw size={14} />}
                  <span>Test Connection</span>
                </button>
              </div>
              <span className="field-hint">
                Default: <code>http://127.0.0.1:11434</code> (Vite proxy forwards automatically).
              </span>
            </div>

            {testResult && (
              <div className={`test-feedback-box ${testResult.startsWith('Success') ? 'box-success' : 'box-error'}`}>
                {testResult.startsWith('Success') ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{testResult}</span>
              </div>
            )}

            {/* Model Selector */}
            <div className="form-group mt-3">
              <label>Select Active Local Model</label>
              {aiStatus?.models && aiStatus.models.length > 0 ? (
                <div className="model-radio-list">
                  {aiStatus.models.map((m) => (
                    <label key={m.name} className={`model-radio-card ${selectedModel === m.name ? 'model-card-active' : ''}`}>
                      <input
                        type="radio"
                        name="activeModel"
                        value={m.name}
                        checked={selectedModel === m.name}
                        onChange={() => setSelectedModel(m.name)}
                      />
                      <div className="model-info-block">
                        <div className="model-name-line">
                          <strong>{m.name}</strong>
                          {m.hasVision ? (
                            <span className="badge-vision-pill">
                              <Eye size={12} /> Vision Capable
                            </span>
                          ) : (
                            <span className="badge-text-pill">
                              <EyeOff size={12} /> Text Only
                            </span>
                          )}
                        </div>
                        <span className="model-size-label">
                          {(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB • {m.details?.family || 'Local GGUF'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="no-models-callout">
                  <AlertCircle size={18} className="text-amber" />
                  <div>
                    <strong>No local models detected in Ollama.</strong>
                    <p>Open Windows Terminal and run the command below to download the vision-capable crop model:</p>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Command Helper */}
            <div className="terminal-helper-box">
              <div className="terminal-header">
                <Terminal size={14} />
                <span>Command to install recommended vision model in Windows:</span>
              </div>
              <code>ollama run gemma4:12b</code>
            </div>
          </section>

          {/* Section 2: Speech & Voice Settings */}
          <section className="settings-section">
            <div className="section-title-row">
              <Volume2 size={18} className="text-emerald" />
              <h3>2. Speech & Voice Engine</h3>
            </div>

            <div className="form-group">
              <label>Preferred Voice Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as 'en' | 'te')}
                className="select-field"
              >
                <option value="en">English (India / International)</option>
                <option value="te">తెలుగు (Telugu - Local Voice)</option>
              </select>
              <span className="field-hint">
                {availableVoices.length > 0 ? `${availableVoices.length} local voice(s) detected on device.` : 'Detecting voices...'}
              </span>
            </div>


            <div className="form-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                />
                <span>Automatically read out AI responses with speech (Hands-Free)</span>
              </label>
            </div>

            <div className="form-group">
              <div className="slider-label-row">
                <label>Speech Playback Speed</label>
                <span className="slider-val">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="range-slider"
              />
            </div>

            <button
              type="button"
              className="btn-outline-farm btn-sm mt-2"
              onClick={handleTestTTS}
              disabled={isTestingVoice}
            >
              <Volume2 size={14} />
              <span>{isTestingVoice ? 'Speaking Test...' : 'Test Speech Output'}</span>
            </button>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="settings-footer">
          <button className="btn-outline-farm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary-farm" onClick={handleSave}>
            <Check size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
