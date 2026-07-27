import React, { useState } from 'react';
import { Order } from '../types';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirmCancel
}) => {
  const [reason, setReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    onConfirmCancel(order.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Cancel Order #{order.order_code}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Meal Reservation Cancellation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs font-bold text-gray-600">
          <p className="text-slate-900 leading-relaxed">
            Are you sure you want to cancel ticket <span className="font-black text-emerald-600">#{order.order_code}</span>? The kitchen will be notified immediately.
          </p>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <p className="font-black uppercase tracking-wider text-[9px] text-amber-700">Refund Guarantee</p>
            <p>If you prepaid ₹{order.paid_amount || 0} via Razorpay / UPI, it will be automatically credited back to your original payment method within 1-2 business days.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Select Reason for Cancellation</label>
            <div className="space-y-2">
              {[
                'Ordered by mistake',
                'Taking longer than expected',
                'Need to change meal items',
                'Other'
              ].map(r => (
                <label 
                  key={r}
                  onClick={() => setReason(r)}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    reason === r ? 'bg-red-50/60 border-red-500 text-red-950 font-black' : 'bg-gray-50 border-gray-100 text-gray-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="cancel_reason" 
                    checked={reason === r} 
                    onChange={() => setReason(r)}
                    className="accent-red-600"
                  />
                  <span className="text-xs">{r}</span>
                </label>
              ))}
            </div>

            {reason === 'Other' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Specify reason..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 text-xs font-bold mt-2"
                rows={2}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
