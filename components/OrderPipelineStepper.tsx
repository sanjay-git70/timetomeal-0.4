import React from 'react';
import { Order, OrderStatus } from '../types';
import { Clock, ChefHat, BellRing, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface OrderPipelineStepperProps {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onPrintReceipt?: (order: Order) => void;
}

export const OrderPipelineStepper: React.FC<OrderPipelineStepperProps> = ({
  order,
  onCancelOrder,
  onPrintReceipt
}) => {
  const steps: { status: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      desc: 'Token Received',
      icon: <Clock className="w-4 h-4" />
    },
    {
      status: 'preparing',
      label: 'Confirm the Order',
      desc: 'In Kitchen',
      icon: <ChefHat className="w-4 h-4" />
    },
    {
      status: 'ready',
      label: 'Ready to Make Your Meal',
      desc: 'Counter Pickup',
      icon: <BellRing className="w-4 h-4" />
    }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'delivered': return 2;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Token #{order.order_code}
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-base mt-1">
            {order.order_items?.map(i => `${i.quantity}x ${i.item_name}`).join(', ') || 'Canteen Meal'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {onPrintReceipt && (
            <button
              onClick={() => onPrintReceipt(order)}
              className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
            >
              Print Receipt
            </button>
          )}

          {onCancelOrder && (order.order_status === 'pending' || order.order_status === 'preparing') && (
            <button
              onClick={() => onCancelOrder(order.id)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Stepper Bar */}
      {isCancelled ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider">Order Cancelled</p>
            <p className="text-[10px] font-bold opacity-80 mt-0.5">This ticket has been cancelled. Any upfront reservation amount is queued for refund.</p>
          </div>
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Progress Bar Line */}
          <div className="absolute top-7 left-[10%] right-[10%] h-1 bg-gray-100 -z-0">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isPassed = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.status} className="flex flex-col items-center text-center group">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-lg shadow-emerald-200' 
                      : isPassed 
                        ? 'bg-slate-900 text-emerald-400' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>

                  <p className={`text-xs font-black mt-2.5 tracking-tight ${isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 hidden sm:block">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Status Callout Banner */}
      {order.order_status === 'ready' && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-200 animate-pulse">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Your Meal is Ready for Pickup!</p>
              <p className="text-[10px] font-bold opacity-90">Head over to Canteen Counter #1 with Token #{order.order_code}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white text-emerald-700 rounded-xl font-black text-xs">
            Counter 1
          </div>
        </div>
      )}
    </div>
  );
};
