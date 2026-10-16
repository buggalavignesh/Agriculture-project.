import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Sprout, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import type { KnowledgeArticle } from '../types';

import { KNOWLEDGE_ARTICLES } from '../data/knowledgeLibrary';
import { dbService } from '../services/db';

interface KnowledgeLibraryViewProps {
  onAskAboutArticle: (topic: string) => void;
}

export const KnowledgeLibraryView: React.FC<KnowledgeLibraryViewProps> = ({
  onAskAboutArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const list = await dbService.getBookmarks();
    setBookmarkedIds(list);
  };

  const handleToggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isNowBookmarked = await dbService.toggleBookmark(id);
    setBookmarkedIds((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const categories = [
    { id: 'all', label: 'All Guides' },
    { id: 'crop-care', label: '🌾 Crop Care' },
    { id: 'soil', label: '🟤 Soil Health' },
    { id: 'irrigation', label: '💧 Water & Irrigation' },
    { id: 'symptoms', label: '🔍 Symptoms Matrix' },
    { id: 'pests', label: '🐛 Pest Prevention & IPM' },
    { id: 'nutrients', label: '🧪 Nutrient Deficiency' },
    { id: 'fertilizer', label: '⚠️ Safe Fertilizer' },
    { id: 'seasonal', label: '📅 Seasonal Calendars' },
    { id: 'photo-guide', label: '📸 Camera Guide' },
  ];

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesQuery =
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.crops.some((c) => c.toLowerCase().includes(query)) ||
      article.tags.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="knowledge-library-page">
      {/* Top Banner */}
      <div className="library-header-banner">
        <div className="lib-badge-row">
          <span className="badge-offline-pure">
            <ShieldCheck size={14} /> 100% Offline Reference Database
          </span>
          <span className="lib-count-badge">{KNOWLEDGE_ARTICLES.length} Curated Agricultural Guides</span>
        </div>
        <h2>Offline Crop Knowledge Library</h2>
        <p>
          Authoritative agricultural guidance for soil preparation, irrigation schedules, pest management, and 
          nutrient symptoms. Instantly available anywhere in the field without internet or AI models.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="library-search-toolbar">
          <div className="search-box-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by crop (paddy, tomato, wheat) or topic (yellow leaf, neem, soil pH)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-scroll-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill-btn ${selectedCategory === cat.id ? 'cat-pill-active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="empty-search-state">
            <BookOpen size={40} className="text-muted" />
            <h3>No farming guides matched your search</h3>
            <p>Try searching for broader terms like "paddy", "fertilizer", "irrigation", or reset your category filter.</p>
            <button
              className="btn-outline-farm btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Show All Guides
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            return (
              <article
                key={article.id}
                className="article-card"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="article-card-top">
                  <div className="article-crops-chips">
                    {article.crops.slice(0, 3).map((crop) => (
                      <span key={crop} className="crop-tag-pill">
                        {crop}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`btn-bookmark-icon ${isBookmarked ? 'bookmarked-active' : ''}`}
                    onClick={(e) => handleToggleBookmark(article.id, e)}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Guide'}
                  >
                    {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  </button>
                </div>

                <h3 className="article-card-title">{article.title}</h3>
                <p className="article-card-summary">{article.summary}</p>

                {/* Key Bullet Points */}
                <div className="article-key-points">
                  {article.keyPoints.slice(0, 2).map((pt, i) => (
                    <div key={i} className="key-point-row">
                      <CheckCircle2 size={13} className="text-emerald" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="article-card-footer">
                  <span className="read-guide-link">Read Complete Guide</span>
                  <ChevronRight size={16} />
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Full Guide Modal / Reader */}
      {selectedArticle && (
        <div className="modal-backdrop" onClick={() => setSelectedArticle(null)}>
          <div className="article-reader-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reader-modal-header">
              <div className="reader-meta">
                <div className="article-crops-chips">
                  {selectedArticle.crops.map((c) => (
                    <span key={c} className="crop-tag-pill">{c}</span>
                  ))}
                </div>
                <h2>{selectedArticle.title}</h2>
              </div>

              <div className="reader-header-actions">
                <button
                  className={`btn-action-icon ${bookmarkedIds.includes(selectedArticle.id) ? 'bookmarked-active' : ''}`}
                  onClick={() => handleToggleBookmark(selectedArticle.id)}
                  title="Bookmark this guide"
                >
                  {bookmarkedIds.includes(selectedArticle.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  <span>{bookmarkedIds.includes(selectedArticle.id) ? 'Saved' : 'Bookmark'}</span>
                </button>

                <button
                  className="btn-close-modal"
                  onClick={() => setSelectedArticle(null)}
                  title="Close guide"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="reader-modal-body">
              {/* Summary Callout */}
              <div className="reader-summary-box">
                <strong>Executive Summary:</strong> {selectedArticle.summary}
              </div>

              {/* Key Bullet Checklist */}
              <div className="reader-checklist-box">
                <h4>Core Field Recommendations</h4>
                <ul>
                  {selectedArticle.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Full Detailed Guide Text */}
              <div className="reader-full-content formatted-markdown">
                {selectedArticle.fullGuide}
              </div>

              {/* Safety Advisory Note */}
              {selectedArticle.safetyNote && (
                <div className="reader-safety-note">
                  <AlertTriangle size={18} className="text-amber" />
                  <div>
                    <strong>Agricultural Advisory:</strong> {selectedArticle.safetyNote}
                  </div>
                </div>
              )}
            </div>

            <div className="reader-modal-footer">
              <button
                className="btn-outline-farm"
                onClick={() => setSelectedArticle(null)}
              >
                Close
              </button>

              <button
                className="btn-primary-farm"
                onClick={() => {
                  const topic = `I was reading the guide "${selectedArticle.title}". Can you give me more specific tips for my local farm?`;
                  setSelectedArticle(null);
                  onAskAboutArticle(topic);
                }}
              >
                <Sprout size={16} />
                <span>Ask AI About This Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
