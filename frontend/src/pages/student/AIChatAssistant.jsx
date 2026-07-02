import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, User, Bot, Plus, MessageSquare, Search, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/common/Button';
import apiClient from '../../services/apiClient';

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello! I'm your AI Admissions Counselor. Ask me anything about universities, scholarships, or the application process.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/ai/chat', { message: currentInput });
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: data.reply || 'Sorry, I could not process that.' }]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errText = typeof detail === 'string'
        ? detail
        : 'Connection error. Please check the backend is running.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const chatHistory = ['Admissions Strategy', 'Canadian Visa FAQ', 'CS SOP Review', 'Budgeting for NYU'];

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-xl">
      {/* Sidebar */}
      <div className="hidden lg:flex w-72 border-r border-gray-100 dark:border-gray-700 flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
          <button className="w-full flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /> New Chat
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Search conversations..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-3">History</p>
          {chatHistory.map((chat, i) => (
            <button
              key={i}
              className={cn(
                'flex w-full items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all text-left',
                i === 0
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-800'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 shrink-0" /> {chat}
              </div>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
            <Bot className="h-7 w-7 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">Advisor GPT-4o</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex items-start gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
            >
              <div className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
              )}>
                {msg.role === 'assistant' ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn(
                'max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                msg.role === 'assistant'
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
                  : 'bg-blue-600 text-white rounded-tr-sm',
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-tl-sm text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              placeholder="Ask about programs, scholarships, visa requirements..."
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <Button
              size="sm"
              className="rounded-xl h-10 w-10 p-0 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest font-medium">
            Verify critical deadlines directly with universities
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
