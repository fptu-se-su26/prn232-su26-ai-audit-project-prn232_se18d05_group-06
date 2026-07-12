import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, MessagesSquare, Send, User, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@lib/api';

type Sender = 'user' | 'bot';
type Source = 'FAQ' | 'FAQ_FALLBACK' | 'GEMINI' | 'INTERNAL' | 'FALLBACK';

interface ChatMessage {
  id: number;
  text: string;
  sender: Sender;
  time: string;
  source?: Source;
}

interface ChatbotResponse {
  answer: string;
  source: Source;
  matchedQuestion?: string;
  category?: string;
  confidence: number;
  respondedAt: string;
}

const suggestions = [
  'Tôi xem hóa đơn ở đâu?',
  'Làm sao đánh giá dịch vụ?',
  'Tôi muốn tạo khiếu nại',
  'Tạo đơn hàng thế nào?',
];

const hiddenPrefixes = ['/admin', '/warehouse', '/dispatcher', '/driver'];
const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const sourceLabel = (source?: Source) => {
  switch (source) {
    case 'GEMINI': return 'AI Gemini';
    case 'INTERNAL': return 'Dữ liệu hệ thống';
    case 'FAQ_FALLBACK': return 'FAQ gần đúng';
    case 'FAQ': return 'FAQ';
    default: return 'SmartLog AI';
  }
};

const getErrorMessage = (err: any, fallback: string) => {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.Message || err?.message || fallback;
};

const FloatingAiChatbot: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI của SmartLog. Bạn có thể hỏi về đơn hàng, hóa đơn, thanh toán, voucher, khiếu nại hoặc đánh giá dịch vụ.',
      sender: 'bot',
      time: getTime(),
      source: 'FAQ',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const shouldHide = useMemo(() => {
    const path = location.pathname.toLowerCase();
    return path === '/support-chat' || hiddenPrefixes.some((prefix) => path.startsWith(prefix));
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping, isOpen]);

  if (shouldHide) return null;

  const addMessage = (message: Omit<ChatMessage, 'id' | 'time'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: nextId.current++,
        time: getTime(),
      },
    ]);
  };

  const sendQuestion = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? inputValue).trim();
    if (!question || isTyping) return;

    if (question.length > 1000) {
      addMessage({ text: 'Câu hỏi quá dài. Vui lòng nhập dưới 1000 ký tự.', sender: 'bot', source: 'FALLBACK' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      addMessage({ text: 'Bạn cần đăng nhập để sử dụng AI Chatbot và tra cứu dữ liệu cá nhân.', sender: 'bot', source: 'FALLBACK' });
      setTimeout(() => navigate('/auth'), 900);
      return;
    }

    addMessage({ text: question, sender: 'user' });
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post<ChatbotResponse>('/customer/chatbot/ask', { question });
      addMessage({ text: res.data.answer, sender: 'bot', source: res.data.source });
    } catch (err) {
      addMessage({
        text: getErrorMessage(err, 'Chatbot chưa phản hồi được. Bạn có thể thử lại hoặc vào Trung tâm hỗ trợ.'),
        sender: 'bot',
        source: 'FALLBACK',
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-4 flex h-[640px] max-h-[calc(100vh-104px)] w-[calc(100vw-28px)] max-w-[440px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.20)]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-5 py-5 text-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
                  <MessagesSquare size={24} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-slate-950">SmartLog AI</p>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Hỗ trợ khách hàng
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Đóng chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => sendQuestion(item)}
                  disabled={isTyping}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f9fc] px-4 py-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[88%] items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                    {msg.sender === 'user' ? <User size={15} /> : <MessageCircle size={15} />}
                  </div>
                  <div className={`rounded-[24px] px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-slate-900 ring-1 ring-slate-100'}`}>
                    <p className="whitespace-pre-line text-[14px] font-semibold leading-6">{msg.text}</p>
                    <div className={`mt-2 flex flex-wrap gap-1.5 text-[10px] font-black ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      <span>{msg.time}</span>
                      {msg.sender === 'bot' && <span>· {sourceLabel(msg.source)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-[22px] rounded-bl-md bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
                  <Loader2 size={15} className="animate-spin text-blue-600" />
                  SmartLog AI đang trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-3.5">
            <div className="flex items-center gap-2 rounded-[22px] bg-slate-50 p-1.5 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-blue-200">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && sendQuestion()}
                placeholder="Nhập câu hỏi..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => sendQuestion()}
                disabled={!inputValue.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="Gửi câu hỏi"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-700 shadow-[0_18px_46px_rgba(15,23,42,0.24)] ring-1 ring-blue-100 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,235,0.28)]"
        aria-label="Mở AI Chatbot"
      >
        <span className="absolute inset-0 rounded-full bg-blue-100 opacity-70 blur-md transition group-hover:opacity-100" />
        <span className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
          {isOpen ? <X size={25} /> : <MessagesSquare size={26} />}
        </span>
      </button>
    </div>
  );
};

export default FloatingAiChatbot;