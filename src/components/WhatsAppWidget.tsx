import React, { useState } from 'react';
import { WhatsAppIcon } from './TechIcons';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface WhatsAppWidgetProps {
  portfolioData?: PortfolioDataType;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ portfolioData }) => {
  const data = portfolioData || PORTFOLIO_DATA;
  const ww = data.whatsappWidget || PORTFOLIO_DATA.whatsappWidget;
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(
    ww?.defaultMessage
      ? ww.defaultMessage.replace('{name}', data.name || '')
      : `Hi ${data.name || ''}, I came across your portfolio and would like to discuss a project!`
  );

  const handleSend = () => {
    const encoded = encodeURIComponent(message);
    const num = data.whatsappNumber || '8801700000000';
    const url = `https://wa.me/${num}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left"
            id="whatsapp-card-popup"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 p-0.5 border border-white/40">
                  <img
                    src="/Profile-Photo.png"
                    alt={data.name || 'Al Amin Islam'}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/Profile-Photo.png";
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm">{data.name || 'Al Amin Islam'}</div>
                  <div className="text-[11px] text-emerald-200">{ww?.statusText || 'Online • Typically replies fast'}</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                id="whatsapp-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-3 bg-[#E5DDD5]/40 space-y-2">
              <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-xs text-xs text-slate-700 max-w-[90%]">
                {ww?.greetingText || ww?.greetingMessage || 'Hi there! 👋 How can I help you today? Feel free to send a message directly to my WhatsApp.'}
                <div className="text-[10px] text-slate-400 text-right mt-1">{ww?.timeText || ww?.timeLabel || 'Just now'}</div>
              </div>
            </div>

            {/* Input & Action */}
            <div className="p-3 border-t border-slate-100 bg-white space-y-2">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 resize-none"
                placeholder={ww?.placeholder || ww?.inputPlaceholder || 'Type your message...'}
                id="whatsapp-text-input"
              />
              <button
                onClick={handleSend}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                id="whatsapp-send-action-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{ww?.buttonText || ww?.sendBtnText || 'Start WhatsApp Chat'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Green WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Chat on WhatsApp"
        id="whatsapp-floating-btn"
      >
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        {/* Subtle ping indicator ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
};
