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
        className={`group relative flex h-14 w-14 cursor-grab items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#163B72,#274C7D)] text-white shadow-[0_18px_34px_-14px_rgba(22,59,114,0.8)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_38px_-16px_rgba(22,59,114,0.85)] active:cursor-grabbing ${
          isOpen ? 'ring-4 ring-[#B8C9E2]' : ''
        }`}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <Bot className="h-7 w-7 pointer-events-none" aria-hidden />
        <span className="animate-ez-green-pulse pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-[#6DBE45] shadow-[0_0_0_4px_rgba(109,190,69,0.22)]" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={chatStyle}
          className="flex h-[500px] w-96 flex-col overflow-hidden rounded-2xl border border-[#D5E1F0] bg-white/95 shadow-[0_30px_48px_-24px_rgba(22,59,114,0.45)] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#274C7D]/20 bg-[linear-gradient(135deg,#163B72,#274C7D)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#DCE8F7]" aria-hidden />
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
          <div className="border-t border-[#DCE4F0] bg-white/70 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border border-[#D6DFEC] px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#274C7D] focus:outline-none focus:ring-2 focus:ring-[#274C7D]/20"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                className="bg-[#163B72] px-4 hover:bg-[#0F2D57]"
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
