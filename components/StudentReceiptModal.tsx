import React from 'react';
import { Order } from '../types';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StudentReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const StudentReceiptModal: React.FC<StudentReceiptModalProps> = ({
  order,
  onClose
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const remainingAtCounter = Math.max(0, order.total_amount - (order.paid_amount || 0));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-gray-100 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-slate-950 bg-gray-50 rounded-full transition-all print-hidden"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
          {/* Printable Thermal Receipt Area */}
          <div className="print-area font-mono text-slate-900 space-y-4 pt-2 text-center select-all">
            <div className="space-y-1 font-sans">
              <h3 className="text-base font-black tracking-tight text-slate-950 uppercase font-sans">TIMETOMEAL CANTEEN</h3>
              <p className="text-[10px] text-gray-400 font-bold font-sans">Hostel Block Dining Hall</p>
              <p className="text-[9px] text-emerald-600 font-black uppercase font-sans tracking-widest mt-0.5">Official Student Receipt</p>
            </div>

            <p className="text-[10px] text-gray-300">----------------------------------------</p>

            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-sans font-bold">TOKEN CODE</p>
              <p className="text-4xl font-black text-slate-950 tracking-tight mt-1">#{order.order_code}</p>
            </div>

            <p className="text-[10px] text-gray-300">----------------------------------------</p>

            <div className="text-left text-[10px] space-y-1.5 font-sans font-bold">
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase tracking-wider">Date & Time:</span>
                <span className="text-slate-800">{new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase tracking-wider">Order Status:</span>
                <span className="text-emerald-700 uppercase font-black">{order.order_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase tracking-wider">Student Name:</span>
                <span className="text-slate-900 font-black truncate max-w-[170px]">{order.student_details?.full_name || 'Student'}</span>
              </div>
              {order.student_details?.register_number && (
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase tracking-wider">Register No:</span>
                  <span className="text-slate-800">{order.student_details.register_number}</span>
                </div>
              )}
              {order.student_details?.hostel_name && (
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase tracking-wider">Hostel & Room:</span>
                  <span className="text-slate-800">{order.student_details.hostel_name} - {order.student_details.room_number}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-300">----------------------------------------</p>

            {/* Items Table */}
            <div className="text-left text-[10px] space-y-2 font-sans font-bold">
              {order.order_items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black">{item.item_name}</span>
                    <span className="text-[9px] text-gray-400">x{item.quantity} @ ₹{item.price}</span>
                  </div>
                  <span className="text-slate-950 font-black">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-300">----------------------------------------</p>

            <div className="text-left text-[11px] space-y-1.5 font-sans font-bold">
              <div className="flex justify-between text-gray-500 text-[10px]">
                <span>Total Bill Amount</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-emerald-700 text-[10px]">
                <span>Upfront Paid (Razorpay / UPI)</span>
                <span>₹{order.paid_amount || 0}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-gray-100">
                <span>DUE AT COUNTER</span>
                <span>₹{remainingAtCounter}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-300">----------------------------------------</p>

            <div className="space-y-1 font-sans pt-1">
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">SHOW TOKEN AT COUNTER TO PICK UP</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">TimeToMeal Canteen</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-100 print-hidden">
          <button 
            onClick={handlePrint}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button 
            onClick={onClose}
            className="py-4 px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
