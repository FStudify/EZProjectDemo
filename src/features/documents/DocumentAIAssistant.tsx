import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, FileText, ListTodo, Lightbulb, User } from 'lucide-react';
import type { Document } from '@/types';

const SUGGESTED_PROMPTS = [
  { id: 'summary', label: 'Tóm tắt tài liệu', icon: FileText },
  { id: 'keypoints', label: 'Trích ý chính', icon: Lightbulb },
  { id: 'tasks', label: 'Gợi ý công việc cần làm', icon: ListTodo },
] as const;

const MOCK_RESPONSES: Record<string, string> = {
  summary:
    '**Tóm tắt:**\n\nTài liệu mô tả ứng dụng sản phẩm thương mại điện tử với phân trang và quản lý giỏ hàng. Mục tiêu chính là xây dựng ứng dụng frontend mở rộng được bằng React và TypeScript, gồm danh sách sản phẩm, tìm kiếm và quản lý trạng thái giỏ hàng.',
  keypoints:
    '**Các ý chính:**\n\n• Xây dựng trang danh sách sản phẩm với phân trang\n• Thực hiện trang chi tiết sản phẩm\n• Thêm quản lý trạng thái giỏ hàng\n• Tích hợp tìm kiếm và bộ lọc\n• Dùng React + TypeScript',
  tasks:
    '**Gợi ý công việc:**\n\n• Xây dựng trang danh sách sản phẩm\n• Thực hiện chi tiết sản phẩm\n• Thêm trạng thái giỏ hàng và lưu trữ\n• Tạo quy trình thanh toán\n• Thêm giao diện tìm kiếm và lọc',
  default:
    'Theo nội dung tài liệu, mục tiêu chính là xây dựng ứng dụng sản phẩm thương mại điện tử với phân trang và quản lý giỏ hàng. Công nghệ chính gồm React, TypeScript và Node.js.',
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="mb-2 font-semibold text-slate-900">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    if (line.startsWith('•')) {
      return (
        <li key={i} className="ml-4 mb-1">
          {line.slice(1).trim()}
        </li>
      );
    }
    return (
      <p key={i} className="mb-2">
        {line}
      </p>
    );
  });
}

interface DocumentAIAssistantProps {
  document: Document;
}

export default function DocumentAIAssistant({ document }: DocumentAIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (promptId?: string, promptText?: string) => {
    const text = (promptText ?? input.trim()) || '';
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response =
        promptId === 'summary'
          ? MOCK_RESPONSES.summary
          : promptId === 'keypoints'
            ? MOCK_RESPONSES.keypoints
            : promptId === 'tasks'
              ? MOCK_RESPONSES.tasks
              : MOCK_RESPONSES.default;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 800);
  };

  const handleSuggestedClick = (id: string) => {
    const prompt = SUGGESTED_PROMPTS.find((p) => p.id === id);
    if (prompt) handleSend(id, prompt.label);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-slate-900">Trợ lý AI</h3>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{document.name}</p>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
      >
        {!hasMessages && !loading && (
          <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-slate-700">Hỏi bất cứ điều gì về tài liệu này</p>
            <p className="mt-1 text-xs text-slate-500">
              Tóm tắt, trích ý chính hoặc hỏi đáp nhanh.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSuggestedClick(id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-800 rounded-bl-md'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm leading-relaxed">
                  {renderMarkdown(msg.content)}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4 flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhắn cho AI..."
            rows={1}
            className="w-full resize-none rounded-xl border border-slate-300 py-3 pl-4 pr-12 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            aria-label="Gửi"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
