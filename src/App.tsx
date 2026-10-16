import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ChatAssistant } from './components/ChatAssistant';
import { CropDoctor } from './components/CropDoctor';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { KnowledgeLibraryView } from './components/KnowledgeLibraryView';
import { SavedConversationsView } from './components/SavedConversationsView';
import { SettingsModal } from './components/SettingsModal';
import type { 
  Conversation, 
  CropDiagnosis, 
  AppSettings, 
  AIAvailabilityStatus 
} from './types';

import { dbService, DEFAULT_SETTINGS } from './services/db';
import { aiService } from './services/ai';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [aiStatus, setAiStatus] = useState<AIAvailabilityStatus | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [diagnoses, setDiagnoses] = useState<CropDiagnosis[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation>({
    id: `conv-${Date.now()}`,
    title: 'New Crop Consultation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  });

  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load persistent DB data & initial AI status
  const loadInitialData = useCallback(async () => {
    const loadedSettings = await dbService.getSettings();
    setSettings(loadedSettings);

    const convList = await dbService.getAllConversations();
    setConversations(convList);

    const diagList = await dbService.getAllDiagnoses();
    setDiagnoses(diagList);

    if (convList.length > 0) {
      setCurrentConversation(convList[0]);
    }

    // Check Local Ollama / AI Availability
    const status = await aiService.checkStatus(loadedSettings.ollamaEndpoint);
    setAiStatus(status);

    // If active model is not set yet in settings, set it to the detected preferred model
    if (!loadedSettings.selectedModel && status.selectedModel) {
      const updated = await dbService.saveSettings({ selectedModel: status.selectedModel });
      setSettings(updated);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Refresh AI status helper
  const handleRefreshAIStatus = async () => {
    const status = await aiService.checkStatus(settings.ollamaEndpoint);
    setAiStatus(status);
  };

  // Start a fresh new chat
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Crop Consultation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setCurrentConversation(newConv);
    setInitialChatPrompt('');
    setActiveTab('chat');
  };

  // Update conversation (save to DB and state)
  const handleUpdateConversation = async (updated: Conversation) => {
    setCurrentConversation(updated);
    await dbService.saveConversation(updated);

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? updated : c));
      } else {
        return [updated, ...prev];
      }
    });
  };

  // Delete current conversation
  const handleDeleteCurrentChat = async () => {
    if (confirm('Delete this conversation from device storage?')) {
      await dbService.deleteConversation(currentConversation.id);
      const remaining = conversations.filter((c) => c.id !== currentConversation.id);
      setConversations(remaining);

      if (remaining.length > 0) {
        setCurrentConversation(remaining[0]);
      } else {
        handleNewChat();
      }
    }
  };

  // Rename conversation
  const handleRenameChat = async (id: string, newTitle: string) => {
    await dbService.renameConversation(id, newTitle);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
    if (currentConversation.id === id) {
      setCurrentConversation((prev) => ({ ...prev, title: newTitle }));
    }
  };

  // Open existing conversation
  const handleOpenConversation = (id: string) => {
    const found = conversations.find((c) => c.id === id);
    if (found) {
      setCurrentConversation(found);
      setActiveTab('chat');
    }
  };

  // Quick prompt select from dashboard
  const handleSelectPrompt = (promptText: string) => {
    setInitialChatPrompt(promptText);
    setActiveTab('chat');
  };

  // Transition from Crop Doctor to Chat with pre-filled question & image
  const handleOpenChatWithDiagnosis = (prompt: string, imageBase64: string) => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: `Crop Doctor: ${prompt.slice(0, 24)}...`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: prompt,
          imageBase64,
          timestamp: Date.now(),
        },
      ],
    };

    handleUpdateConversation(newConv);
    setActiveTab('chat');
  };

  // Save settings update
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await dbService.saveSettings(newSettings);
    setSettings(updated);
    handleRefreshAIStatus();
  };

  return (
    <div className="app-root">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiStatus={aiStatus}
        isOnline={isOnline}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="app-main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewChat={handleNewChat}
            onSelectPrompt={handleSelectPrompt}
            recentConversations={conversations}
            onOpenConversation={handleOpenConversation}
            aiStatus={aiStatus}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatAssistant
            currentConversation={currentConversation}
            onUpdateConversation={handleUpdateConversation}
            onNewChat={handleNewChat}
            onDeleteCurrentChat={handleDeleteCurrentChat}
            onRenameChat={handleRenameChat}
            aiStatus={aiStatus}
            settings={settings}
            initialPrompt={initialChatPrompt}
          />
        )}

        {activeTab === 'crop-doctor' && (
          <CropDoctor
            aiStatus={aiStatus}
            settings={settings}
            onOpenChatWithDiagnosis={handleOpenChatWithDiagnosis}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceAssistantView
            aiStatus={aiStatus}
            settings={settings}
            onUpdateSettings={handleSaveSettings}
          />
        )}

        {activeTab === 'library' && (
          <KnowledgeLibraryView
            onAskAboutArticle={handleSelectPrompt}
          />
        )}

        {activeTab === 'saved' && (
          <SavedConversationsView
            conversations={conversations}
            diagnoses={diagnoses}
            onOpenConversation={handleOpenConversation}
            onRefreshData={loadInitialData}
          />
        )}
      </main>

      {/* Settings & Local AI Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        aiStatus={aiStatus}
        onRefreshAIStatus={handleRefreshAIStatus}
      />
    </div>
  );
};

export default App;
