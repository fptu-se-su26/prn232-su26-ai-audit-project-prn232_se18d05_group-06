import React, { useMemo, useRef, useState } from 'react';
import { Bot, FileText, HelpCircle, Loader2, MessageSquare, Send, ShieldCheck, Sparkles, User } from 'lucide-react';
import Header from '../customer/Header';
import Footer from '../customer/Footer';
import api from '@lib/api';

type Sender = 'user' | 'bot';
type Source = 'FAQ' | 'FAQ_FALLBACK' | 'GEMINI' | 'INTERNAL' | 'FALLBACK';

interface ChatMessage {
  id: number;
  text: string;
  sender: Sender;
  time: string;
  source?: Source;
  category?: string;
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
  'Làm sao tạo đơn hàng?',
  'Tôi xem hóa đơn ở đâu?',
  'Làm sao đánh giá dịch vụ?',
  'Tôi muốn tạo khiếu nại',
  'Tôi có thể hủy đơn không?',
];

const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const getSourceLabel = (source?: Source) => {
  switch (source) {
    case 'GEMINI': return 'Nguồn: AI Gemini';
    case 'INTERNAL': return 'Nguồn: Dữ liệu hệ thống';
    case 'FAQ_FALLBACK': return 'Nguồn: FAQ gần đúng';
    case 'FAQ': return 'Nguồn: FAQ';
    default: return 'Nguồn: SmartLog AI';
  }
};

const getErrorMessage = (err: any, fallback: string) => {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.Message || err?.message || fallback;
};

const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi có thể hỗ trợ bạn về đơn hàng, hóa đơn, thanh toán, voucher, khiếu nại và đánh giá dịch vụ trong SmartLog AI.',
      sender: 'bot',
      time: getTime(),
      source: 'FAQ',
      category: 'Hỗ trợ',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const nextId = useRef(2);

  const quickStats = useMemo(() => [
    { label: 'FAQ trước', icon: HelpCircle },
    { label: 'Gemini sau', icon: Sparkles },
    { label: 'Bảo vệ dữ liệu', icon: ShieldCheck },
  ], []);

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
    if (!question) return;
    if (question.length > 1000) {
      addMessage({ text: 'Câu hỏi quá dài. Vui lòng nhập dưới 1000 ký tự.', sender: 'bot', source: 'FALLBACK' });
      return;
    }

    addMessage({ text: question, sender: 'user' });
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post<ChatbotResponse>('/customer/chatbot/ask', { question });
      addMessage({
        text: res.data.answer,
        sender: 'bot',
        source: res.data.source,
        category: res.data.category,
      });
    } catch (err) {
      addMessage({
        text: getErrorMessage(err, 'Chatbot chưa phản hồi được. Bạn có thể thử lại hoặc vào Trung tâm hỗ trợ để tạo yêu cầu.'),
        sender: 'bot',
        source: 'FALLBACK',
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header scrollY={51} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.4fr]">
            <aside className="bg-[linear-gradient(145deg,#0f172a_0%,#164e63_100%)] p-6 text-white sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                SmartLog AI Support
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">AI Chatbot hỗ trợ khách hàng</h1>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-200">
                Hỏi nhanh về đơn hàng, hóa đơn, thanh toán, voucher, khiếu nại và đánh giá dịch vụ. Hệ thống ưu tiên FAQ trước, sau đó mới dùng Gemini khi cần.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="rounded-xl bg-cyan-300/20 p-2 text-cyan-200">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-black">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-cyan-200" />
                  <p className="text-sm font-black">Gợi ý</p>
                </div>
                <p className="mt-2 text-xs font-semibold leading-6 text-slate-200">
                  Với câu hỏi có mã đơn như SO202607..., chatbot sẽ tra dữ liệu nội bộ và chỉ trả lời nếu đơn thuộc tài khoản đang đăng nhập.
                </p>
              </div>
            </aside>

            <section className="flex min-h-[680px] flex-col bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                    <Bot size={22} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-950">SmartLog AI Assistant</p>
                    <p className="text-xs font-bold text-emerald-600">FAQ + Gemini fallback</p>
                  </div>
                </div>
                <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 sm:block">Online</div>
              </div>

              <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      onClick={() => sendQuestion(item)}
                      disabled={isTyping}
                      className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5 sm:p-7">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[86%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 shadow-sm'}`}>
                        {msg.sender === 'user' ? <User size={17} /> : <MessageSquare size={17} />}
                      </div>
                      <div className={`rounded-3xl px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'rounded-tr-md bg-blue-600 text-white' : 'rounded-tl-md border border-slate-100 bg-white text-slate-900'}`}>
                        <p className="whitespace-pre-line text-sm font-semibold leading-6">{msg.text}</p>
                        <div className={`mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          <span>{msg.time}</span>
                          {msg.sender === 'bot' && <span>{getSourceLabel(msg.source)}</span>}
                          {msg.category && <span>· {msg.category}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 rounded-3xl rounded-tl-md border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      SmartLog AI đang xử lý...
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="h-13 min-h-13 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    onClick={() => sendQuestion()}
                    disabled={isTyping || !inputValue.trim()}
                    className="inline-flex h-13 min-h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SupportChat;