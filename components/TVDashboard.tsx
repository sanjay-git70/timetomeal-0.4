
import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { ChevronLeft, Coffee, Bell, Timer, User as UserIcon } from 'lucide-react';

interface TVDashboardProps {
  orders: Order[];
  onBack: () => void;
}

const TVDashboard: React.FC<TVDashboardProps> = ({ orders, onBack }) => {
  // Fix: Use order_status and lowercase status values to match OrderStatus type
  const preparing = orders.filter(o => o.order_status === 'preparing');
  const ready = orders.filter(o => o.order_status === 'ready').slice(0, 10);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-12 flex flex-col font-black overflow-hidden selection:bg-emerald-500">
      {/* High-Impact Header */}
      <div className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-10">
          <button onClick={onBack} className="p-6 hover:bg-gray-900 rounded-[2.5rem] text-gray-700 transition-all border-2 border-gray-900 group">
            <ChevronLeft className="w-12 h-12 group-hover:text-emerald-500" />
          </button>
          <div className="bg-emerald-600 p-7 rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(5,150,105,0.5)]">
            <Coffee className="w-14 h-14 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-7xl tracking-tighter text-white flex items-center gap-6">
              TIME TO <span className="text-emerald-500">MEAL</span>
              <div className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
            </h1>
            <p className="text-gray-600 text-xl tracking-[0.5em] uppercase font-bold">Real-time Order Status System</p>
          </div>
        </div>
        
        <div className="text-right flex items-center gap-16">
           <div className="flex flex-col items-end border-r-2 border-gray-900 pr-16">
              <span className="text-8xl tabular-nums font-black text-gray-200 tracking-tighter">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
              <span className="text-lg text-emerald-700 uppercase tracking-[0.6em] mt-3 font-black">{time.toDateString()}</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-white text-9xl font-black">{ready.length}</span>
              <span className="text-xs text-emerald-100 bg-emerald-600 px-5 py-2 rounded-full uppercase font-black tracking-widest mt-4">Ready Now</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-24">
        {/* PREPARING LIST */}
        <div className="flex flex-col">
          <div className="flex items-center gap-8 mb-12 px-8">
             <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center animate-pulse border border-orange-500/20">
                <Timer className="w-8 h-8" />
             </div>
             <h2 className="text-6xl text-gray-500 tracking-tighter uppercase font-black">In Kitchen</h2>
          </div>
          <div className="flex-1 bg-white/[0.02] rounded-[5rem] border-2 border-gray-900/40 p-12 flex flex-wrap content-start gap-10 overflow-y-auto custom-scrollbar">
             {preparing.length === 0 ? (
               <div className="w-full flex items-center justify-center text-gray-800 text-5xl h-full font-black uppercase tracking-widest opacity-20">
                  Ready to Serve
               </div>
             ) : (
               preparing.map(o => (
                 <div key={o.id} className="bg-gray-900/60 border-2 border-gray-800 w-52 h-52 rounded-[4rem] flex flex-col items-center justify-center animate-pulse shadow-2xl transition-transform">
                    {/* Fix: use order_code instead of orderCode */}
                    <span className="text-6xl text-orange-400 mb-2 font-black">#{o.order_code.slice(-3)}</span>
                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                       <UserIcon className="w-4 h-4" />
                       {/* Fix: use student_details and full_name instead of studentDetails and name */}
                       <span className="text-xs uppercase font-black">{o.student_details?.full_name?.split(' ')[0] || 'Guest'}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* READY LIST */}
        <div className="flex flex-col">
          <div className="flex items-center gap-8 mb-12 px-8">
             <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                <Bell className="w-8 h-8" />
             </div>
             <h2 className="text-6xl text-emerald-400 tracking-tighter uppercase font-black">Ready to Pick</h2>
          </div>
          <div className="flex-1 bg-emerald-500/[0.03] rounded-[5rem] border-2 border-emerald-900/20 p-12 grid grid-cols-2 gap-10">
             {ready.length === 0 ? (
               <div className="col-span-2 flex items-center justify-center text-emerald-900/20 text-5xl h-full font-black uppercase tracking-widest italic">
                  Queue Empty
               </div>
             ) : (
               ready.map(o => (
                 <div key={o.id} className="bg-emerald-600 rounded-[4.5rem] p-12 flex flex-col items-center justify-center shadow-[0_40px_100px_-20px_rgba(5,150,105,0.7)] animate-in zoom-in duration-500 border-4 border-emerald-400/30">
                    <span className="text-[12px] text-white/60 font-black uppercase tracking-[0.6em] mb-6">Token Number</span>
                    {/* Fix: use order_code instead of orderCode */}
                    <span className="text-[11rem] font-black text-white leading-none mb-8 drop-shadow-2xl">{o.order_code.slice(-3)}</span>
                    <div className="bg-emerald-900/40 px-8 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                       {/* Fix: use student_details and full_name instead of studentDetails and name */}
                       <span className="text-2xl text-white uppercase font-black">{o.student_details?.full_name || 'GUEST'}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-center gap-12">
         <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-emerald-900/30 to-transparent" />
         <div className="text-center text-gray-700 text-lg tracking-[1.5em] uppercase font-black animate-pulse whitespace-nowrap">
            ORDER VIA QR CODE AT THE COUNTER
         </div>
         <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-emerald-900/30 to-transparent" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default TVDashboard;