import React, { useState, useRef } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Edit2, 
  Download, 
  Upload, 
  Stethoscope, 
  MessageSquare, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import type { Conversation, CropDiagnosis } from '../types';
import { dbService } from '../services/db';


interface SavedConversationsViewProps {
  conversations: Conversation[];
  diagnoses: CropDiagnosis[];
  onOpenConversation: (id: string) => void;
  onRefreshData: () => void;
}

export const SavedConversationsView: React.FC<SavedConversationsViewProps> = ({
  conversations,
  diagnoses,
  onOpenConversation,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'diagnoses'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDiagnoses = diagnoses.filter((d) =>
    d.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.analysisResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.selectedSymptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (editTitle.trim()) {
      await dbService.renameConversation(id, editTitle.trim());
      onRefreshData();
    }
    setEditingId(null);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation from your device?')) {
      await dbService.deleteConversation(id);
      onRefreshData();
      setStatusMessage({ type: 'success', text: 'Conversation removed from local storage.' });
    }
  };

  const handleDeleteDiagnosis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this plant diagnosis record?')) {
      await dbService.deleteDiagnosis(id);
      onRefreshData();
      setStatusMessage({ type: 'success', text: 'Diagnosis record deleted.' });
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const json = await dbService.exportBackupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully to your device.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Export failed: ${err.message}` });
    }
  };

  // Import JSON Backup
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await dbService.importBackupData(text);
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
        onRefreshData();
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed to read import file: ${err.message}` });
    } finally {
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    }
  };

  // Clear All Local Data
  const handleClearAllData = async () => {
    const confirmed = confirm(
      'DANGER: Are you sure you want to erase ALL local conversations and diagnoses from this device? This cannot be undone.'
    );
    if (confirmed) {
      await dbService.clearAllData();
      onRefreshData();
      setStatusMessage({ type: 'success', text: 'All local records erased.' });
    }
  };

  return (
    <div className="saved-history-page">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        style={{ display: 'none' }}
      />

      {/* Top Banner */}
      <div className="history-header-banner">
        <div className="history-title-block">
          <div className="history-icon-badge">
            <History size={26} />
          </div>
          <div>
            <h2>Local History & Device Backups</h2>
            <p>100% on-device storage in IndexedDB. Keep, search, export, or restore your farming consultations.</p>
          </div>
        </div>

        {/* Backup / Export Buttons */}
        <div className="history-action-buttons">
          <button className="btn-outline-farm btn-sm" onClick={handleExportBackup} title="Export JSON backup">
            <Download size={15} />
            <span>Export Backup</span>
          </button>
          <button className="btn-outline-farm btn-sm" onClick={() => importFileInputRef.current?.click()} title="Import JSON backup">
            <Upload size={15} />
            <span>Import Backup</span>
          </button>
          <button className="btn-outline-danger btn-sm" onClick={handleClearAllData} title="Clear all data">
            <Trash2 size={15} />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Status Notice if any */}
      {statusMessage && (
        <div className={`history-alert-banner ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {statusMessage.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMessage.text}</span>
          <button className="btn-close-banner" onClick={() => setStatusMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Privacy Guarantee Box */}
      <div className="privacy-guarantee-card">
        <ShieldCheck size={20} className="text-emerald" />
        <div className="privacy-text">
          <strong>Privacy & Offline Guarantee:</strong> All images, consultations, and symptoms records are stored 
          strictly in your browser or device private storage. Nothing is sent to cloud servers, third-party analytics, 
          or remote databases.
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="history-controls-bar">
        <div className="history-tabs-pills">
          <button
            className={`pill-tab ${activeTab === 'chats' ? 'pill-tab-active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare size={16} />
            <span>AI Chats ({conversations.length})</span>
          </button>
          <button
            className={`pill-tab ${activeTab === 'diagnoses' ? 'pill-tab-active' : ''}`}
            onClick={() => setActiveTab('diagnoses')}
          >
            <Stethoscope size={16} />
            <span>Crop Doctor Diagnoses ({diagnoses.length})</span>
          </button>
        </div>

        <div className="history-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'chats' ? 'conversations' : 'diagnoses'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'chats' ? (
        <div className="history-list-container">
          {filteredConversations.length === 0 ? (
            <div className="empty-history-state">
              <MessageSquare size={36} className="text-muted" />
              <h3>No conversations found</h3>
              <p>Start a new chat from the dashboard or chat assistant to record farming questions.</p>
            </div>
          ) : (
            <div className="history-grid-list">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="history-card chat-history-card"
                  onClick={() => onOpenConversation(conv.id)}
                >
                  <div className="card-top-row">
                    {editingId === conv.id ? (
                      <div className="rename-box" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                          autoFocus
                          className="input-rename"
                        />
                        <button className="btn-icon-sub" onClick={() => handleSaveRename(conv.id)}>
                          <Check size={15} />
                        </button>
                      </div>
                    ) : (
                      <h3 className="history-card-title">{conv.title || 'Untitled Consultation'}</h3>
                    )}

                    <div className="history-card-actions">
                      <button
                        className="btn-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(conv);
                        }}
                        title="Rename conversation"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-card-action text-danger"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        title="Delete conversation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Last message preview */}
                  <p className="history-card-preview">
                    {conv.messages[conv.messages.length - 1]?.content || 'Empty conversation'}
                  </p>

                  <div className="history-card-footer">
                    <span className="footer-meta">
                      {conv.messages.length} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="resume-link">
                      <span>Resume</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Diagnoses List */
        <div className="history-list-container">
          {filteredDiagnoses.length === 0 ? (
            <div className="empty-history-state">
              <Stethoscope size={36} className="text-muted" />
              <h3>No saved plant diagnoses</h3>
              <p>Scan crop leaves in the Crop Doctor page to create structured visual disease records.</p>
            </div>
          ) : (
            <div className="history-grid-list">
              {filteredDiagnoses.map((diag) => (
                <div key={diag.id} className="history-card diagnosis-history-card">
                  <div className="diag-card-inner">
                    {diag.imageBase64 && (
                      <div className="diag-thumb-wrapper">
                        <img src={diag.imageBase64} alt={diag.cropType} className="diag-thumb" />
                      </div>
                    )}
                    <div className="diag-info">
                      <div className="diag-header-row">
                        <span className="crop-pill-selected">{diag.cropType}</span>
                        <button
                          className="btn-card-action text-danger"
                          onClick={(e) => handleDeleteDiagnosis(diag.id, e)}
                          title="Delete diagnosis"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="diag-date">{new Date(diag.timestamp).toLocaleString()}</div>

                      {diag.selectedSymptoms.length > 0 && (
                        <div className="diag-symptoms-chips">
                          {diag.selectedSymptoms.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="symptom-mini-tag">{s}</span>
                          ))}
                        </div>
                      )}

                      <p className="diag-summary-snippet">
                        {diag.analysisResult.slice(0, 140)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
