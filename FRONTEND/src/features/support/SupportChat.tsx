import React, { useState } from 'react';
import { MessageSquare, Send, Paperclip, Loader } from 'lucide-react';
import Header from '../customer/Header';
import Footer from '../customer/Footer';

const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot'; time: string }>>([
    { id: 1, text: 'Hello! How can we help you today?', sender: 'bot', time: '10:00 AM' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setInputValue('');
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: prev.length + 1,
          text: 'Thank you for your message. Our team will respond shortly.',
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header scrollY={0} />
      <div className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-screen md:h-auto md:min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="font-bold">SmartLog Support</p>
                  <p className="text-xs opacity-90">AI Assistant • Always here to help</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-xl rounded-bl-none">
                    <Loader size={16} className="animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip size={20} className="text-gray-600" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportChat;
