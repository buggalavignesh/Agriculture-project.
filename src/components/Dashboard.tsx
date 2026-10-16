import React from 'react';
import { 
  MessageSquare, 
  Stethoscope, 
  Mic, 
  BookOpen, 
  History, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import type { AIAvailabilityStatus, Conversation } from '../types';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onNewChat: () => void;
  onSelectPrompt: (promptText: string) => void;
  recentConversations: Conversation[];
  onOpenConversation: (id: string) => void;
  aiStatus: AIAvailabilityStatus | null;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onNewChat,
  onSelectPrompt,
  recentConversations,
  onOpenConversation,
  aiStatus,
  onOpenSettings,
}) => {
  const sampleQuestions = [
    { text: "My paddy leaf tips are turning yellow and drying out. What should I check?", icon: "🌾" },
    { text: "How do I prepare 5% Neem Kernel Aqueous Extract (NSKE) at home?", icon: "🌿" },
    { text: "What are the 5 critical irrigation stages for wheat crops?", icon: "💧" },
    { text: "How can I prevent blossom end rot in my tomatoes organically?", icon: "🍅" },
  ];

  return (
    <div className="dashboard-page">
      {/* Hero Welcome Card */}
      <section className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>100% Private • Local On-Device AI • No Internet Required</span>
          </div>
          <h1 className="hero-title">
            Empowering Farmers With <span className="text-gradient-farm">Offline Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Get instant crop advice, diagnose leaf diseases with local vision models, talk in natural voice, 
            and browse trusted agricultural guides — completely offline in your field.
          </p>

          <div className="hero-actions">
            <button className="btn-primary-farm btn-lg" onClick={onNewChat}>
              <MessageSquare size={20} />
              <span>Start New AI Chat</span>
            </button>
            <button className="btn-secondary-farm btn-lg" onClick={() => setActiveTab('crop-doctor')}>
              <Stethoscope size={20} />
              <span>Scan Crop Leaf</span>
            </button>
          </div>
        </div>

        {/* Model & Offline Status Info Box */}
        <div className="hero-status-card" onClick={onOpenSettings} role="button">
          <div className="status-card-header">
            <Cpu size={20} className="icon-pulse" />
            <span className="status-card-title">Local Engine Status</span>
          </div>

          <div className="status-card-body">
            <div className="status-row">
              <span className="status-label">Runtime:</span>
              <span className="status-val font-semibold">
                {aiStatus?.providerType === 'ollama' ? 'Ollama Windows (Local)' : 'Local Inference'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Active Model:</span>
              <span className="status-val font-semibold text-emerald">
                {aiStatus?.selectedModel || 'Scanning...'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Vision Support:</span>
              <span className="status-val">
                {aiStatus?.selectedModelHasVision ? '✅ Enabled (Image Capable)' : '⚠️ Text Only'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Cloud Dependency:</span>
              <span className="status-val text-accent">0% (Pure On-Device)</span>
            </div>
          </div>

          {!aiStatus?.isAvailable && (
            <div className="status-card-alert">
              <AlertCircle size={14} />
              <span>Click to view local Ollama setup instructions</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Core Modules Grid */}
      <section className="dashboard-grid-section">
        <h2 className="section-heading">Core Farming Tools</h2>

        <div className="dashboard-cards-grid">
          {/* Card 1: AI Chat Assistant */}
          <div className="feature-card card-chat" onClick={() => setActiveTab('chat')}>
            <div className="feature-icon-wrapper icon-chat-bg">
              <MessageSquare size={28} />
            </div>
            <div className="feature-card-content">
              <h3>AI Farm Assistant</h3>
              <p>Chat in simple English or Telugu about soil, water, pests, fertilizers, and crop diseases.</p>
              <div className="feature-footer">
                <span>Open Chat Assistant</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Card 2: Crop Doctor / Vision */}
          <div className="feature-card card-doctor" onClick={() => setActiveTab('crop-doctor')}>
            <div className="feature-icon-wrapper icon-doctor-bg">
              <Stethoscope size={28} />
            </div>
            <div className="feature-card-content">
              <div className="card-badge-row">
                <h3>Crop Doctor</h3>
                <span className="pill-badge-mini">Vision Model</span>
              </div>
              <p>Snap or upload a photo of sick leaves, stems, or fruits for structured symptoms analysis and safe next steps.</p>
              <div className="feature-footer">
                <span>Diagnose Plant Problem</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Card 3: Hands-Free Voice Assistant */}
          <div className="feature-card card-voice" onClick={() => setActiveTab('voice')}>
            <div className="feature-icon-wrapper icon-voice-bg">
              <Mic size={28} />
            </div>
            <div className="feature-card-content">
              <h3>Voice Assistant</h3>
              <p>Speak hands-free while working in the field. Review recognized text and hear answers read aloud.</p>
              <div className="feature-footer">
                <span>Launch Voice Assistant</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Card 4: Curated Crop Library */}
          <div className="feature-card card-library" onClick={() => setActiveTab('library')}>
            <div className="feature-icon-wrapper icon-library-bg">
              <BookOpen size={28} />
            </div>
            <div className="feature-card-content">
              <div className="card-badge-row">
                <h3>Offline Crop Library</h3>
                <span className="pill-badge-mini pill-offline-mini">Zero AI Required</span>
              </div>
              <p>Search verified agronomy guides: soil preparation, seasonal checklists, drip irrigation, and nutrient deficiency charts.</p>
              <div className="feature-footer">
                <span>Browse Farming Guides</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Questions Section */}
      <section className="dashboard-prompts-section">
        <div className="section-header-row">
          <div className="header-title-group">
            <Sparkles size={20} className="text-accent" />
            <h2 className="section-heading mb-0">Common Field Inquiries</h2>
          </div>
          <span className="section-subtext">Click any question to ask the local AI immediately</span>
        </div>

        <div className="sample-prompts-list">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              className="prompt-chip-btn"
              onClick={() => onSelectPrompt(q.text)}
            >
              <span className="prompt-chip-emoji">{q.icon}</span>
              <span className="prompt-chip-text">{q.text}</span>
              <ArrowRight size={14} className="prompt-chip-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity & Farm Tips Grid */}
      <div className="dashboard-bottom-split">
        {/* Recent Conversations */}
        <div className="dashboard-widget card-recent-chats">
          <div className="widget-header">
            <div className="widget-title">
              <History size={18} />
              <h3>Recent Conversations</h3>
            </div>
            {recentConversations.length > 0 && (
              <button className="btn-link" onClick={() => setActiveTab('saved')}>
                View All
              </button>
            )}
          </div>

          <div className="widget-content">
            {recentConversations.length === 0 ? (
              <div className="empty-widget-state">
                <p>No conversations recorded yet.</p>
                <button className="btn-outline-farm btn-sm" onClick={onNewChat}>
                  Start First Conversation
                </button>
              </div>
            ) : (
              <div className="recent-list">
                {recentConversations.slice(0, 4).map((c) => (
                  <div 
                    key={c.id} 
                    className="recent-chat-item" 
                    onClick={() => onOpenConversation(c.id)}
                  >
                    <div className="recent-chat-title">{c.title || 'Untitled Consultation'}</div>
                    <div className="recent-chat-meta">
                      <span>{c.messages.length} messages</span>
                      <span>•</span>
                      <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agricultural Safety & Photo Tip Widget */}
        <div className="dashboard-widget card-safety-tip">
          <div className="widget-header">
            <div className="widget-title">
              <HelpCircle size={18} className="text-accent" />
              <h3>Field Diagnostic Tip</h3>
            </div>
            <button className="btn-link" onClick={() => setActiveTab('library')}>
              Read Photo Guide
            </button>
          </div>

          <div className="widget-content tip-body">
            <div className="tip-callout">
              <strong>Check the leaf undersides:</strong> Over 75% of sap-sucking pests (aphids, thrips, spider mites) 
              and fungal spores hide on the protected underside of leaves. Always check both sides of the leaf 
              before concluding a diagnosis!
            </div>
            <div className="safety-disclaimer-box">
              <ShieldCheck size={16} />
              <span>CropMate provides educational agronomic advice. Always verify chemical interventions with local agricultural extension officers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
