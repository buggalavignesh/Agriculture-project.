import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Image as ImageIcon, 
  Camera, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  RefreshCw,
  Trash2,
  Edit2
} from 'lucide-react';
import type { ChatMessage, Conversation, AIAvailabilityStatus, AppSettings } from '../types';
import { aiService } from '../services/ai';
import { speechService } from '../services/speech';
import { processAndCompressImage } from '../utils/imageUtils';

interface ChatAssistantProps {
  currentConversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onDeleteCurrentChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  aiStatus: AIAvailabilityStatus | null;
  settings: AppSettings;
  initialPrompt?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentConversation,
  onUpdateConversation,
  onNewChat,
  onDeleteCurrentChat,
  onRenameChat,
  aiStatus,
  settings,
  initialPrompt,
}) => {
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Image attachment states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [recognizedVoiceText, setRecognizedVoiceText] = useState('');
  const [showVoiceReviewModal, setShowVoiceReviewModal] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Conversation title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentConversation.title);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleInput(currentConversation.title);
  }, [currentConversation.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages, isGenerating]);

  // Handle initial prompt passed from Dashboard
  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
      chatInputRef.current?.focus();
    }
  }, [initialPrompt]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  // Handle Image Upload / Camera
  const handleImageFile = async (file: File) => {
    try {
      setIsProcessingImage(true);
      const processed = await processAndCompressImage(file, 1024, 0.85);
      setAttachedImage(processed.base64);
      setImageMime(processed.mimeType);
    } catch (err: any) {
      alert(`Could not process image: ${err.message || 'Unsupported format'}`);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // Handle Speech Recognition
  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    setRecognizedVoiceText('');

    if (!speechService.isRecognitionSupported()) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Android Chrome.'
      );
      return;
    }

    setIsListening(true);
    speechService.startListening({
      lang: settings.preferredLanguage,
      onInterim: (interim) => {
        setRecognizedVoiceText(interim);
      },
      onFinal: (final) => {
        setRecognizedVoiceText(final);
        setIsListening(false);
        setShowVoiceReviewModal(true);
      },
      onError: (err) => {
        setIsListening(false);
        setSpeechError(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleConfirmVoiceText = () => {
    setInputText((prev) => (prev ? `${prev} ${recognizedVoiceText}` : recognizedVoiceText));
    setShowVoiceReviewModal(false);
    setRecognizedVoiceText('');
    chatInputRef.current?.focus();
  };

  // Text-to-Speech playback
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    speechService.stopSpeaking();
    setSpeakingMessageId(msgId);

    speechService.speakText(text, {
      lang: settings.preferredLanguage,
      rate: settings.speechRate,
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  // Send Message
  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend && !attachedImage) return;
    if (isGenerating) return;

    // Check if vision is required but not supported
    if (attachedImage && !aiStatus?.selectedModelHasVision) {
      const proceed = confirm(
        `Warning: The currently active model (${aiStatus?.selectedModel || 'Unknown'}) is not flagged as a Vision model. Image analysis might fail or be ignored. Would you like to proceed anyway?`
      );
      if (!proceed) return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend || 'Please analyze this attached crop photo.',
      timestamp: Date.now(),
      imageBase64: attachedImage || undefined,
      imageMimeType: attachedImage ? imageMime : undefined,
    };

    const updatedMessages = [...currentConversation.messages, userMessage];
    
    // Auto title for first message
    let newTitle = currentConversation.title;
    if (currentConversation.messages.length === 0) {
      newTitle = textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '');
    }

    const updatedConv: Conversation = {
      ...currentConversation,
      title: newTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    onUpdateConversation(updatedConv);
    setInputText('');
    setAttachedImage(null);
    setIsGenerating(true);

    // Create placeholder assistant message
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: aiStatus?.selectedModel || 'local-ai',
    };

    const convWithAssistant: Conversation = {
      ...updatedConv,
      messages: [...updatedMessages, initialAssistantMessage],
    };
    onUpdateConversation(convWithAssistant);

    try {
      let accumulatedResponse = '';

      await aiService.sendChatMessage({
        messages: updatedMessages,
        model: aiStatus?.selectedModel || 'gemma4:12b',
        endpoint: settings.ollamaEndpoint,
        onChunk: (chunkText) => {
          accumulatedResponse = chunkText;
          const currentMsgs = [...updatedConv.messages];
          currentMsgs.push({
            id: assistantMessageId,
            role: 'assistant',
            content: accumulatedResponse,
            timestamp: Date.now(),
            modelUsed: aiStatus?.selectedModel || 'local-ai',
          });

          onUpdateConversation({
            ...updatedConv,
            updatedAt: Date.now(),
            messages: currentMsgs,
          });
        },
      });

      // If auto-speak is enabled, read out the generated response
      if (settings.autoSpeakAnswer && accumulatedResponse) {
        handleToggleSpeak(assistantMessageId, accumulatedResponse);
      }
    } catch (err: any) {
      const errorContent = err.name === 'AbortError'
        ? 'Generation stopped by user.'
        : `Local AI Error: ${err.message || 'Failed to reach local model.'}\n\nPlease verify that Ollama is running on your machine ('ollama run gemma4:12b') and check your Settings.`;

      const errorMsgs = [...updatedConv.messages];
      errorMsgs.push({
        id: assistantMessageId,
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now(),
        isError: true,
      });

      onUpdateConversation({
        ...updatedConv,
        updatedAt: Date.now(),
        messages: errorMsgs,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopGenerating = () => {
    aiService.stopGeneration();
    setIsGenerating(false);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onRenameChat(currentConversation.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="chat-container">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Chat Top Subheader */}
      <div className="chat-subheader">
        <div className="chat-title-wrapper">
          {isEditingTitle ? (
            <div className="title-edit-form">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="input-edit-title"
              />
              <button className="btn-icon-sub" onClick={handleSaveTitle} title="Save title">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="title-display-row" onClick={() => setIsEditingTitle(true)} title="Click to rename conversation">
              <h2 className="chat-current-title">{currentConversation.title || 'New Consultation'}</h2>
              <Edit2 size={14} className="icon-edit-pencil" />
            </div>
          )}
          <span className="chat-msg-count">({currentConversation.messages.length} messages)</span>
        </div>

        <div className="chat-top-actions">
          <button className="btn-chat-tool" onClick={onNewChat} title="Start clean new chat">
            <Plus size={16} />
            <span className="hide-on-mobile">New Chat</span>
          </button>
          <button className="btn-chat-tool text-danger" onClick={onDeleteCurrentChat} title="Delete this conversation">
            <Trash2 size={16} />
            <span className="hide-on-mobile">Delete</span>
          </button>
        </div>
      </div>

      {/* Speech Recognition Error Notice if any */}
      {speechError && (
        <div className="speech-error-banner">
          <AlertTriangle size={16} />
          <span>{speechError}</span>
          <button className="btn-close-banner" onClick={() => setSpeechError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {currentConversation.messages.length === 0 ? (
          <div className="chat-empty-intro">
            <div className="intro-leaf-icon">🌱</div>
            <h3>How can CropMate help your farm today?</h3>
            <p>Ask in simple words about crop diseases, pest outbreaks, fertilizer schedules, or upload a photo of an affected leaf.</p>

            <div className="intro-quick-chips">
              <button
                className="intro-chip"
                onClick={() => setInputText("What causes yellow spots with brown centers on my crop leaves?")}
              >
                🍂 What causes yellow leaf spots?
              </button>
              <button
                className="intro-chip"
                onClick={() => setInputText("How can I prepare organic pesticide using neem leaves?")}
              >
                🌿 Organic neem spray recipe
              </button>
              <button
                className="intro-chip"
                onClick={() => setInputText("My soil is sticky and hard when dry. How do I improve drainage?")}
              >
                🟤 Improve clay soil drainage
              </button>
              <button
                className="intro-chip"
                onClick={() => setInputText("What are the main signs of nitrogen deficiency in paddy?")}
              >
                🌾 Paddy nitrogen deficiency
              </button>
            </div>
          </div>
        ) : (
          currentConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble-row ${msg.role === 'user' ? 'bubble-user-row' : 'bubble-assistant-row'}`}
            >
              <div className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'} ${msg.isError ? 'bubble-error' : ''}`}>
                
                {/* Attached Image if present */}
                {msg.imageBase64 && (
                  <div className="chat-image-preview-wrapper">
                    <img
                      src={msg.imageBase64}
                      alt="Crop attachment"
                      className="chat-message-image"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Message Text Content */}
                <div className="chat-message-text">
                  {msg.content ? (
                    <div className="formatted-markdown">{msg.content}</div>
                  ) : (
                    <div className="generating-indicator">
                      <Sparkles size={16} className="spin-icon" />
                      <span>CropMate is thinking locally...</span>
                    </div>
                  )}
                </div>

                {/* Assistant Message Action Buttons */}
                {msg.role === 'assistant' && msg.content && (
                  <div className="message-actions-bar">
                    <button
                      className={`btn-action-icon ${speakingMessageId === msg.id ? 'btn-speaking-active' : ''}`}
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read answer aloud (Offline TTS)'}
                    >
                      {speakingMessageId === msg.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      <span>{speakingMessageId === msg.id ? 'Stop Voice' : 'Listen'}</span>
                    </button>

                    <button
                      className="btn-action-icon"
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      title="Copy response to clipboard"
                    >
                      {copiedId === msg.id ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    {msg.modelUsed && (
                      <span className="msg-model-tag">{msg.modelUsed}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Thumbnail before sending */}
      {attachedImage && (
        <div className="composer-attached-preview">
          <div className="attached-img-container">
            <img src={attachedImage} alt="Attachment preview" className="thumb-preview" />
            <button
              className="btn-remove-thumb"
              onClick={() => setAttachedImage(null)}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
          <div className="attached-info">
            <span className="attached-label">Attached for Vision Analysis</span>
            <span className="attached-note">Model: {aiStatus?.selectedModel || 'Local Vision Model'}</span>
          </div>
        </div>
      )}

      {/* Voice Review & Edit Modal */}
      {showVoiceReviewModal && (
        <div className="voice-review-modal-backdrop">
          <div className="voice-review-modal">
            <div className="modal-header">
              <div className="modal-title-row">
                <Mic size={20} className="text-emerald" />
                <h3>Review Your Voice Message</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowVoiceReviewModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-desc">
              Check the transcribed words below. You can edit them before sending to CropMate.
            </p>

            <textarea
              className="voice-review-textarea"
              value={recognizedVoiceText}
              onChange={(e) => setRecognizedVoiceText(e.target.value)}
              rows={3}
            />

            <div className="modal-footer-actions">
              <button
                className="btn-outline-farm"
                onClick={() => {
                  setShowVoiceReviewModal(false);
                  handleToggleMic();
                }}
              >
                <RefreshCw size={16} />
                <span>Re-Record</span>
              </button>
              <button className="btn-primary-farm" onClick={handleConfirmVoiceText}>
                <Check size={16} />
                <span>Use This Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="chat-composer-bar">
        {/* Attachment & Camera Buttons */}
        <div className="composer-media-actions">
          <button
            type="button"
            className="btn-composer-tool"
            onClick={() => fileInputRef.current?.click()}
            title="Upload crop image from device"
            disabled={isGenerating || isProcessingImage}
          >
            <ImageIcon size={20} />
          </button>

          <button
            type="button"
            className="btn-composer-tool"
            onClick={() => cameraInputRef.current?.click()}
            title="Take crop photo with camera"
            disabled={isGenerating || isProcessingImage}
          >
            <Camera size={20} />
          </button>

          <button
            type="button"
            className={`btn-composer-tool ${isListening ? 'tool-mic-listening' : ''}`}
            onClick={handleToggleMic}
            title={isListening ? 'Listening... click to stop' : 'Speak message (Voice Input)'}
            disabled={isGenerating}
          >
            {isListening ? <MicOff size={20} className="icon-pulse" /> : <Mic size={20} />}
          </button>
        </div>

        {/* Text Input Area */}
        <div className="composer-input-container">
          <textarea
            ref={chatInputRef}
            className="composer-textarea"
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : attachedImage
                ? 'Ask what is wrong with this leaf or crop photo...'
                : 'Type your farming question here or tap the microphone...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            disabled={isGenerating}
          />
        </div>

        {/* Send / Stop Buttons */}
        <div className="composer-submit-actions">
          {isGenerating ? (
            <button
              type="button"
              className="btn-stop-generate"
              onClick={handleStopGenerating}
              title="Stop AI generation"
            >
              <Square size={16} fill="currentColor" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-send-message"
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !attachedImage) || isProcessingImage}
              title="Send to local AI"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
