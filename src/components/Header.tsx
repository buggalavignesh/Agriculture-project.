import React from 'react';
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Eye, 
  EyeOff, 
  Mic, 
  Settings as SettingsIcon, 
  Plus, 
  BookOpen, 
  MessageSquare, 
  History,
  Stethoscope
} from 'lucide-react';
import type { AIAvailabilityStatus } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiStatus: AIAvailabilityStatus | null;
  isOnline: boolean;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  aiStatus,
  isOnline,
  onNewChat,
  onOpenSettings,
}) => {
  return (
    <header className="app-header">
      <div className="header-top-bar">
        {/* Brand / Logo */}
        <div className="brand-container" onClick={() => setActiveTab('dashboard')} role="button" tabIndex={0}>
          <div className="brand-logo-icon">
            <Sprout className="sprout-icon" size={26} />
          </div>
          <div className="brand-titles">
            <div className="brand-name">
              CropMate <span className="brand-highlight">Offline</span>
              <span className="badge-offline-tag">🌱 Zero Cloud</span>
            </div>
            <div className="brand-tagline">Farmer's Voice & Vision AI Assistant</div>
          </div>
        </div>

        {/* Live Real-time Status Badges */}
        <div className="header-status-group">
          {/* Online/Offline Status */}
          <div className={`status-pill ${isOnline ? 'pill-online' : 'pill-offline'}`} title={isOnline ? 'Connected to local/external network' : '100% Offline Mode active'}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Local AI Model Status */}
          <div 
            className={`status-pill ${aiStatus?.isAvailable ? 'pill-ai-ready' : 'pill-ai-error'}`}
            title={aiStatus?.statusMessage || 'Checking local AI'}
            onClick={onOpenSettings}
            role="button"
          >
            <Cpu size={14} />
            <span className="truncate-model">
              {aiStatus?.isAvailable 
                ? (aiStatus.selectedModel || 'Local AI Active') 
                : 'AI Disconnected'}
            </span>
            <span className={`status-dot ${aiStatus?.isAvailable ? 'dot-active' : 'dot-inactive'}`}></span>
          </div>

          {/* Vision Capability Pill */}
          <div 
            className={`status-pill ${aiStatus?.selectedModelHasVision ? 'pill-vision-on' : 'pill-vision-off'}`}
            title={aiStatus?.selectedModelHasVision ? 'Vision model is active: can analyze leaf images' : 'Current model does not support image analysis'}
          >
            {aiStatus?.selectedModelHasVision ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hide-on-mobile">{aiStatus?.selectedModelHasVision ? 'Vision AI' : 'Text Only'}</span>
          </div>

          {/* New Chat Quick Button */}
          <button 
            className="btn-header-action btn-new-chat" 
            onClick={onNewChat}
            title="Start a new conversation"
          >
            <Plus size={16} />
            <span className="hide-on-mobile">New Chat</span>
          </button>

          {/* Settings Button */}
          <button 
            className="btn-header-action btn-settings-icon" 
            onClick={onOpenSettings}
            title="Configure Local AI, Ollama, & Voices"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="header-nav-bar" aria-label="Main Navigation">
        <button 
          className={`nav-tab-item ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Sprout size={16} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-tab-item ${activeTab === 'chat' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          <span>AI Chat</span>
        </button>

        <button 
          className={`nav-tab-item ${activeTab === 'crop-doctor' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('crop-doctor')}
        >
          <Stethoscope size={16} />
          <span>Crop Doctor</span>
          <span className="tab-chip-pill">Vision</span>
        </button>

        <button 
          className={`nav-tab-item ${activeTab === 'voice' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <Mic size={16} />
          <span>Voice Mode</span>
        </button>

        <button 
          className={`nav-tab-item ${activeTab === 'library' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <BookOpen size={16} />
          <span>Crop Library</span>
          <span className="tab-chip-pill chip-offline">100% Offline</span>
        </button>

        <button 
          className={`nav-tab-item ${activeTab === 'saved' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <History size={16} />
          <span>History & Backup</span>
        </button>
      </nav>
    </header>
  );
};
