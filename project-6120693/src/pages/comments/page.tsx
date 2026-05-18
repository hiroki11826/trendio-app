import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../dashboard/components/Sidebar';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

interface Comment {
  id: string;
  mediaId: string;
  mediaUrl: string;
  mediaPermalink: string;
  username: string;
  text: string;
  timestamp: string;
  replies?: Array<{
    id: string;
    username: string;
    text: string;
    timestamp: string;
  }>;
}

type PresetFilter = 'all' | 'today' | '7days' | '30days' | 'custom';

export default function Comments() {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetFilter>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('nekocafe_token');
      const res = await fetch(`${API_BASE_URL}/api/instagram/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) { setNotConnected(true); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const filteredComments = useMemo(() => {
    if (preset === 'all') return comments;
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    if (preset === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (preset === '7days') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === '30days') {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (preset === 'custom') {
      if (customFrom) from = new Date(customFrom);
      if (customTo) to = new Date(customTo + 'T23:59:59');
    }

    return comments.filter(c => {
      const ts = new Date(c.timestamp);
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      return true;
    });
  }, [comments, preset, customFrom, customTo]);

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('nekocafe_token');
      const res = await fetch(`${API_BASE_URL}/api/instagram/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to reply');
      setSentIds(prev => new Set([...prev, commentId]));
      setReplyingTo(null);
      setReplyText('');
      // Refresh comments to show the new reply
      await fetchComments();
    } catch {
      setError(t('common.error'));
    } finally {
      setSending(false);
    }
  };

  const handleSuggestReply = async (comment: Comment) => {
    setLoadingSuggestions(comment.id);
    try {
      const token = localStorage.getItem('nekocafe_token');
      const res = await fetch(`${API_BASE_URL}/api/instagram/comments/suggest-reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: comment.text,
          username: comment.username,
          language: i18n.language,
        }),
      });
      if (!res.ok) throw new Error('Failed to get suggestions');
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [comment.id]: data.suggestions }));
      setReplyingTo(comment.id);
      setReplyText('');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoadingSuggestions(null);
    }
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const presets: { key: PresetFilter; label: string }[] = [
    { key: 'all', label: t('comments.filterAll') },
    { key: 'today', label: t('comments.filterToday') },
    { key: '7days', label: t('comments.filter7days') },
    { key: '30days', label: t('comments.filter30days') },
    { key: 'custom', label: t('comments.filterCustom') },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('comments.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('comments.subtitle')}</p>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap items-center gap-3">
            <i className="ri-filter-3-line text-gray-400"></i>
            <div className="flex gap-2 flex-wrap">
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    preset === p.key
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-400 text-sm">{t('comments.filterTo')}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
            {!loading && (
              <span className="ml-auto text-xs text-gray-400">
                {t('comments.count', { count: filteredComments.length })}
              </span>
            )}
          </div>

          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
              <p className="text-sm text-gray-500 mt-3">{t('dashboard.loading')}</p>
            </div>
          )}

          {!loading && notConnected && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <i className="ri-instagram-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">{t('instagram.connectPrompt')}</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-4">{error}</div>
          )}

          {!loading && !notConnected && filteredComments.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <i className="ri-chat-3-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">{t('comments.noResults')}</p>
            </div>
          )}

          {!loading && filteredComments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {filteredComments.map(comment => (
                <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <a href={comment.mediaPermalink} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      {comment.mediaUrl ? (
                        <img src={comment.mediaUrl} alt="post" className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <i className="ri-image-line text-gray-400 text-xl"></i>
                        </div>
                      )}
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-instagram-line text-pink-500 text-sm"></i>
                        <span className="text-sm font-semibold text-gray-900">@{comment.username}</span>
                        <span className="text-xs text-gray-400">{formatTime(comment.timestamp)}</span>
                        {(sentIds.has(comment.id) || (comment.replies && comment.replies.length > 0)) && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                            <i className="ri-check-line mr-1"></i>{t('comments.replied')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>

                      {/* Display existing replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-emerald-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="ri-reply-line text-emerald-600 text-xs"></i>
                                <span className="text-xs font-semibold text-emerald-900">@{reply.username}</span>
                                <span className="text-xs text-gray-400">{formatTime(reply.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestions[comment.id] && replyingTo === comment.id && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestions[comment.id].map((s, i) => (
                            <button
                              key={i}
                              onClick={() => setReplyText(s)}
                              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors text-left"
                            >
                              <i className="ri-sparkling-line mr-1"></i>{s}
                            </button>
                          ))}
                        </div>
                      )}

                      {replyingTo === comment.id ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(comment.id)}
                            placeholder={t('comments.replyPlaceholder')}
                            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button onClick={() => handleReply(comment.id)} disabled={sending || !replyText.trim()} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
                            {sending ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-line"></i>}
                            {t('comments.send')}
                          </button>
                          <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-3 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-100">
                            {t('settings.cancel')}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-3">
                          <button 
                            onClick={() => { setReplyingTo(comment.id); setReplyText(''); }} 
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <i className="ri-reply-line"></i>{t('comments.reply')}
                          </button>
                          <button 
                            onClick={() => handleSuggestReply(comment)} 
                            disabled={loadingSuggestions === comment.id} 
                            className="text-xs text-purple-600 hover:text-purple-700 disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loadingSuggestions === comment.id
                              ? <><i className="ri-loader-4-line animate-spin"></i> {t('comments.aiGenerating')}</>
                              : <><i className="ri-sparkling-line"></i> {t('comments.aiSuggest')}</>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
