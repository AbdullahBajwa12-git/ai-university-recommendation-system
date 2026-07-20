import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, User, Plus, MessageSquare, Trash2, Clock,
  Copy, Check, BookOpen, GraduationCap, Globe, Award, Briefcase, Menu, X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import apiClient from '../../services/apiClient';
import chatService from '../../services/chatService';
import profileService from '../../services/profileService';
import studyrouteLogoMark from '../../assets/brand/studyroute-logo-mark.svg';

// ── Lightweight inline Markdown renderer ─────────────────────────────────────
// No external dependency needed — handles the common subset GPT returns.
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];
  let keyCounter = 0;
  const key = () => keyCounter++;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={key()} className="list-disc list-inside space-y-1 my-2 pl-1 text-sm">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const inlineFormat = (str) => {
    // Bold + italic
    const parts = str.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('***') && part.endsWith('***'))
        return <strong key={i}><em>{part.slice(3, -3)}</em></strong>;
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={i}>{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={i} className="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      return part;
    });
  };

  lines.forEach((line) => {
    // Headings
    if (/^### /.test(line)) {
      flushList();
      elements.push(<h4 key={key()} className="font-bold text-sm text-gray-900 dark:text-white mt-4 mb-1.5">{line.slice(4)}</h4>);
      return;
    }
    if (/^## /.test(line)) {
      flushList();
      elements.push(<h3 key={key()} className="font-bold text-base text-gray-900 dark:text-white mt-4 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">{line.slice(3)}</h3>);
      return;
    }
    if (/^# /.test(line)) {
      flushList();
      elements.push(<h2 key={key()} className="font-bold text-lg text-gray-900 dark:text-white mt-3 mb-2">{line.slice(2)}</h2>);
      return;
    }
    // Bullet list
    if (/^[-*•] /.test(line)) {
      listBuffer.push(line.slice(2));
      return;
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      listBuffer.push(line.replace(/^\d+\. /, ''));
      return;
    }
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key()} className="border-gray-200 dark:border-gray-700 my-3" />);
      return;
    }
    // Empty line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={key()} className="h-1.5" />);
      return;
    }
    // Normal paragraph
    flushList();
    elements.push(<p key={key()} className="text-sm leading-relaxed">{inlineFormat(line)}</p>);
  });

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
};

// ── Suggested starter prompts ─────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { icon: GraduationCap, label: 'Best MS CS universities in USA for my profile', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { icon: Award, label: 'Fully funded scholarships for Pakistani students', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { icon: Globe, label: 'How to get a student visa for Canada?', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: BookOpen, label: 'How to write a strong SOP?', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { icon: Briefcase, label: 'What are post-study work rights in the UK?', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { icon: Award, label: 'What GRE score do I need for top 50 US schools?', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

const WELCOME_TEXT = "Hello! I'm **StudyRoute Advisor**, your dedicated AI admissions counselor.\n\nI can help you with university admissions, scholarships, test scores, visa guidance, and career planning — all tailored to students from South Asia.\n\nWhat would you like to explore today?";

const freshMessages = () => [{ id: 'welcome', role: 'assistant', text: WELCOME_TEXT }];

const deriveTitleFromMessages = (msgs) => {
  const first = msgs.find((m) => m.role === 'user');
  if (!first) return 'New Chat';
  return first.text.length > 45 ? first.text.slice(0, 42) + '…' : first.text;
};

const formatRelative = (dateStr) => {
  const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Copy button component ─────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
};

// ── Profile context builder ───────────────────────────────────────────────────
const buildProfileContext = (profile) => {
  if (!profile) return null;
  const parts = [];
  if (profile.cgpa) parts.push(`CGPA: ${profile.cgpa}`);
  if (profile.ielts_score) parts.push(`IELTS: ${profile.ielts_score}`);
  if (profile.toefl_score) parts.push(`TOEFL: ${profile.toefl_score}`);
  if (profile.gre_score) parts.push(`GRE: ${profile.gre_score}`);
  if (profile.gmat_score) parts.push(`GMAT: ${profile.gmat_score}`);
  if (profile.degree) parts.push(`Current Degree: ${profile.degree}`);
  if (profile.graduation_year) parts.push(`Graduation Year: ${profile.graduation_year}`);
  if (profile.preferred_study_level) parts.push(`Applying for: ${profile.preferred_study_level}`);
  if (profile.budget_max) parts.push(`Max Budget: $${profile.budget_max.toLocaleString()}/year`);
  if (profile.preferred_countries?.length) parts.push(`Preferred Countries: ${profile.preferred_countries.join(', ')}`);
  if (profile.preferred_fields?.length) parts.push(`Preferred Fields: ${profile.preferred_fields.join(', ')}`);
  if (profile.work_experience_months) parts.push(`Work Experience: ${Math.floor(profile.work_experience_months / 12)}yr ${profile.work_experience_months % 12}mo`);
  return parts.length > 0 ? parts.join(' | ') : null;
};

// ── Main component ────────────────────────────────────────────────────────────
const AIChatAssistant = () => {

  const [messages, setMessages] = useState(freshMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Sidebar
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load profile + sessions on mount
  useEffect(() => {
    profileService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const data = await chatService.getSessions();
      setSessions(data);
    } catch { /* ignore */ } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadSessions(), 0);
    return () => clearTimeout(timer);
  }, [loadSessions]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text || loading) return;

    const userMsg = { id: crypto.randomUUID(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history (last 10 turns = 20 messages)
    const history = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.text }));

    const profileContext = buildProfileContext(profile);

    // 20-second frontend abort to avoid infinite spinner
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const { data } = await apiClient.post('/ai/chat', {
        message: text,
        history: history.slice(0, -1),
        profile_context: profileContext,
      }, { signal: controller.signal });
      setMessages((prev) => [
        ...prev,
        { id: new Date().getTime() + 1, role: 'assistant', text: data.reply || 'Sorry, I could not process that.' },
      ]);
    } catch (err) {
      const isAbort = err.name === 'AbortError' || err.code === 'ERR_CANCELED';
      const detail = err.response?.data?.detail;
      const errText = isAbort
        ? 'The request timed out. Please try again — the AI service may be slow right now.'
        : typeof detail === 'string'
          ? detail
          : 'Connection error. Please check the backend is running.';
      setMessages((prev) => [
        ...prev,
        { id: new Date().getTime() + 1, role: 'assistant', text: errText },
      ]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!messages.some((m) => m.role === 'user')) return;
    setSaving(true);
    try {
      const saved = await chatService.saveSession({ title: deriveTitleFromMessages(messages), messages });
      setSessions((prev) => [saved, ...prev]);
      setActiveSessionId(saved.id);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleNewChat = () => {
    setMessages(freshMessages());
    setInput('');
    setActiveSessionId(null);
  };

  const handleLoadSession = (session) => {
    const loaded = [
      { id: 'welcome', role: 'assistant', text: WELCOME_TEXT },
      ...session.messages.map((m, i) => ({ id: `hist-${i}`, role: m.role, text: m.text })),
    ];
    setMessages(loaded);
    setActiveSessionId(session.id);
    setInput('');
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await chatService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) handleNewChat();
    } catch { /* ignore */ }
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const isEmptyChat = messages.length === 1 && messages[0].id === 'welcome';

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-2">
        <button
          onClick={() => { handleNewChat(); setIsMobileSidebarOpen(false); }}
          className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" /> New Chat
        </button>
        <button
          onClick={handleSaveSession}
          disabled={!hasUserMessages || saving}
          className={cn(
            'w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-colors',
            hasUserMessages && !saving
              ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
              : 'border-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          {saving ? 'Saving…' : 'Save Chat'}
        </button>
      </div>

      {/* Profile context badge */}
      {profile && buildProfileContext(profile) && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> Profile Active
          </p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed line-clamp-2">
            AI knows your academic profile and will personalize responses.
          </p>
        </div>
      )}

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 mt-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Saved Chats</p>
        {sessionsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-center px-4 gap-2 text-gray-400">
            <MessageSquare className="h-6 w-6 opacity-25" />
            <p className="text-xs leading-relaxed">No saved chats yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => { handleLoadSession(s); setIsMobileSidebarOpen(false); }}
                className={cn(
                  'group w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all',
                  activeSessionId === s.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                )}
              >
                <MessageSquare className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', activeSessionId === s.id ? 'text-blue-500' : 'text-gray-400')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-semibold truncate', activeSessionId === s.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300')}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />{formatRelative(s.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 lg:group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 hover:text-red-500 text-gray-400 transition-all ml-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className="relative w-full h-full min-h-[calc(100vh-64px)] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/Image_2.jpg')" }}
    >
      {/* Background Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[3px] bg-black/5 pointer-events-none"></div>

      <div className="relative max-w-[1200px] mx-auto w-full md:p-6 lg:p-8 font-sans">
        <div className="flex h-[calc(100dvh-128px)] md:h-[calc(100vh-180px)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md md:border border-gray-100 dark:border-gray-700 md:rounded-3xl overflow-hidden shadow-2xl relative">

          {/* ── Desktop Sidebar ── */}
          <div className="hidden lg:flex w-64 xl:w-72 border-r border-gray-100/50 dark:border-gray-700/50 flex-col shrink-0">
          {sidebarContent}
        </div>

        {/* ── Mobile Sidebar Overlay ── */}
        {isMobileSidebarOpen && (
          <div className="absolute inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80%] bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 border-r border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white text-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                    <img src={studyrouteLogoMark} alt="AI" className="w-4 h-4 invert object-contain" />
                  </div>
                  AI Advisor
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1 -ml-1 mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <img src={studyrouteLogoMark} alt="AI" className="w-4 h-4 invert object-contain" />
              </div>
              AI Advisor
            </div>
            <div className="flex items-center gap-2">
              {hasUserMessages && (
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {saving ? '…' : 'Save'}
                </button>
              )}
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gray-50/30 dark:bg-gray-900/30">

            {/* Render messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex items-start gap-3 group', msg.role === 'user' ? 'flex-row-reverse' : '')}
              >
                {/* Avatar */}
                <div className={cn(
                  'h-8 w-8 md:h-9 md:w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                )}>
                  {msg.role === 'assistant'
                    ? <img src={studyrouteLogoMark} alt="AI" className="w-5 h-5 md:w-6 md:h-6 invert object-contain" />
                    : <User className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
                  <div className={cn(
                    'p-3.5 md:p-4 rounded-2xl shadow-sm',
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
                      : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm',
                  )}>
                    {msg.role === 'assistant'
                      ? renderMarkdown(msg.text)
                      : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    }
                  </div>
                  {/* Copy button for AI messages */}
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="flex mt-1 pl-1">
                      <CopyButton text={msg.text} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                  <img src={studyrouteLogoMark} alt="AI" className="w-5 h-5 md:w-6 md:h-6 invert object-contain animate-pulse" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested prompts — only on empty chat, below welcome */}
            {isEmptyChat && !loading && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 font-medium mb-3 text-center">Suggested questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p.label)}
                      className={cn(
                        'flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left text-xs font-medium transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0',
                        p.color,
                      )}
                    >
                      <p.icon className="h-4 w-4 shrink-0" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 pt-3 pb-3 md:px-5 md:pt-4 md:pb-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-end gap-2 md:gap-3 bg-gray-50 dark:bg-gray-900 px-3 md:px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400 min-h-[36px] max-h-[120px]"
                placeholder="Ask about admissions, scholarships, visas…"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={cn(
                  'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all mb-0.5',
                  input.trim() && !loading
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[10px] text-gray-400 font-medium">
                ↵ Enter to send · Shift+Enter for new line
              </p>
              {input.length > 0 && (
                <p className={cn('text-[10px] font-medium', input.length > 900 ? 'text-red-400' : 'text-gray-400')}>
                  {input.length}/1000
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
