import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface OrderPlacedPopupProps {
  onClose: () => void;
}

const OrderPlacedPopup: React.FC<OrderPlacedPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 w-[90%] max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 animate-bounce duration-1000">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-100 text-amber-700 p-2 rounded-full animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-950 tracking-tight">Order Placed!</h2>
        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
          Your order has been successfully placed. Check your tickets for updates.
        </p>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-95 transition-all"
        >
          View Ticket
        </button>
      </div>
    </div>
  );
};

export default OrderPlacedPopup;