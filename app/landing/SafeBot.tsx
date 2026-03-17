'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, MessageCircle, ChevronDown, Users, Map, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type BotMode = 'neighbor' | 'agent' | 'friend';

const MODE_META: Record<BotMode, { label: string; short: string; placeholder: string; icon: React.ReactNode; greeting: string }> = {
  neighbor: {
    label: 'Travel Neighbour',
    short: 'Neighbour',
    placeholder: 'Ask what to carry, hydration, problems...',
    icon: <Users className="w-4 h-4" />,
    greeting:
      "Hey! I’m right here with you. Tell me where we’re heading and what time — I’ll help you pack smart, stay hydrated, and handle any travel issues on the way.",
  },
  agent: {
    label: 'Travel Agent',
    short: 'Agent',
    placeholder: 'Ask for safe routing, lighting, accident zones...',
    icon: <Map className="w-4 h-4" />,
    greeting:
      "Alright, tell me your start point, destination, and time. I’ll guide you with a safer route — well-lit, busy stretches, and fewer risky spots.",
  },
  friend: {
    label: 'Travel Friend',
    short: 'Friend',
    placeholder: 'Chat while traveling, get place recommendations...',
    icon: <Sparkles className="w-4 h-4" />,
    greeting:
      "Hey! I’m with you. Where are we exploring today? I’ll keep you company and suggest nice, safe spots to check out nearby.",
  },
};

export default function SafeBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BotMode>('agent');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<Record<BotMode, Message[]>>(() => {
    const now = new Date();
    return {
      neighbor: [{ id: 'neighbor-1', text: MODE_META.neighbor.greeting, sender: 'bot', timestamp: now }],
      agent: [{ id: 'agent-1', text: MODE_META.agent.greeting, sender: 'bot', timestamp: now }],
      friend: [{ id: 'friend-1', text: MODE_META.friend.greeting, sender: 'bot', timestamp: now }],
    };
  });

  const messages = conversations[mode];
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsModeMenuOpen(false);
    // scroll on mode change so the conversation is visible immediately
    setTimeout(() => scrollToBottom(), 0);
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [mode, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setConversations((prev) => ({ ...prev, [mode]: [...prev[mode], userMessage] }));
    setInputValue('');
    setIsTyping(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const currentMessages = [...messages, userMessage];
      const chatMessages = currentMessages
        .filter((m) => m.text.trim().length > 0)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await fetch('/api/safebot/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, mode }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText =
          typeof data?.error === 'string'
            ? data.error
            : 'Sorry, I hit a problem talking to the guide service.';
        throw new Error(errText);
      }

      const botText =
        typeof data?.reply === 'string' && data.reply.trim().length > 0
          ? data.reply
          : "I didn't catch that — can you say it again?";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setConversations((prev) => ({ ...prev, [mode]: [...prev[mode], botMessage] }));
    } catch (e: any) {
      const isAbort = e?.name === 'AbortError';
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isAbort
          ? 'Hold on — I got a newer message from you. Tell me again in one line?'
          : `I’m having trouble reaching the guide right now. Make sure Ollama is running, then try again.\n\n(${e?.message || 'Request failed'})`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setConversations((prev) => ({ ...prev, [mode]: [...prev[mode], botMessage] }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-text-primary">SafeBot Assistant</h3>
                  <p className="text-xs text-text-secondary">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'user'
                        ? 'bg-accent text-white rounded-br-none'
                        : 'bg-surface-hover text-text-primary rounded-bl-none border border-border'
                      }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-[10px] mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-surface-hover border border-border rounded-2xl rounded-bl-none p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-surface">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModeMenuOpen((v) => !v)}
                    className="p-2 hover:bg-surface-hover rounded-full transition-colors flex items-center gap-2"
                    aria-haspopup="menu"
                    aria-expanded={isModeMenuOpen}
                    title={`Mode: ${MODE_META[mode].label}`}
                  >
                    <span className="text-text-secondary">{MODE_META[mode].icon}</span>
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>

                  <AnimatePresence>
                    {isModeMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-12 left-0 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50"
                        role="menu"
                      >
                        {(['neighbor', 'agent', 'friend'] as BotMode[]).map((m) => {
                          const active = m === mode;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMode(m)}
                              className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-surface-hover transition-colors ${
                                active ? 'bg-accent/10' : ''
                              }`}
                              role="menuitem"
                            >
                              <span className={active ? 'text-accent' : 'text-text-secondary'}>{MODE_META[m].icon}</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-syne font-semibold text-text-primary">{MODE_META[m].label}</span>
                                <span className="text-[11px] text-text-secondary">{MODE_META[m].placeholder}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={MODE_META[mode].placeholder}
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}