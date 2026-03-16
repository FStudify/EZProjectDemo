import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { mockAIResponses, mockMembers } from '@/mocks';
import type { ChatMessage } from '@/types';
import ChatMessageBubble from './ChatMessage';
import Button from '@/components/ui/Button';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'ai-welcome',
  projectId: '',
  roomId: 'ai',
  sender: 'ai',
  content:
    "Hi! I'm your AI project assistant. Ask me about tasks, deadlines, priorities, or anything about your project!",
  timestamp: new Date().toISOString(),
  channel: 'ai',
};

function findAIResponse(input: string): string {
  const lower = input.toLowerCase();
  const keys = Object.keys(mockAIResponses);
  for (const key of keys) {
    if (lower.includes(key)) {
      return mockAIResponses[key];
    }
  }
  return "I'm not sure about that. Try asking about tasks, deadlines, progress, or priorities!";
}

export default function AIChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Draggable state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
    }
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    const wasDragging = isDragging;
    dragRef.current = null;
    // Only toggle if it was a click (no drag movement)
    if (!wasDragging) {
      setIsOpen((prev) => !prev);
    }
    setTimeout(() => setIsDragging(false), 0);
  }, [isDragging]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `ai-user-${Date.now()}`,
      projectId: '',
      roomId: 'ai',
      sender: mockMembers[0],
      content: trimmed,
      timestamp: new Date().toISOString(),
      channel: 'ai',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-resp-${Date.now()}`,
        projectId: '',
        roomId: 'ai',
        sender: 'ai',
        content: findAIResponse(trimmed),
        timestamp: new Date().toISOString(),
        channel: 'ai',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  };

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    zIndex: 50,
    touchAction: 'none',
  };

  const chatStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 88,
    right: 24,
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    zIndex: 50,
  };

  return (
    <>
      {/* Draggable floating button */}
      <button
        ref={btnRef}
        type="button"
        style={btnStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl transition-shadow hover:bg-violet-700 active:cursor-grabbing ${
          isOpen ? 'ring-4 ring-violet-300' : 'animate-pulse'
        }`}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <Bot className="h-7 w-7 pointer-events-none" aria-hidden />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={chatStyle}
          className="flex h-[500px] w-96 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/50 bg-white/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" aria-hidden />
              <h3 className="text-sm font-semibold text-slate-900">AI Assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender !== 'ai' && msg.sender.id === 'mem-1'}
              />
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200/50 bg-white/50 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                className="bg-violet-600 px-4 hover:bg-violet-700"
                aria-label="Send"
              >
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
