import React, { useState } from 'react';
import { Bell, BellOff, Check, Trash2, Volume2, Sparkles, X, Clock } from 'lucide-react';
import { NotificationItem } from '../hooks/useOrderNotifications';

interface NotificationBellProps {
  notifications: NotificationItem[];
  permission: NotificationPermission;
  onRequestPermission: () => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  onNotificationClick?: (orderId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  permission,
  onRequestPermission,
  onMarkAllAsRead,
  onClearNotifications,
  onMarkAsRead,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-3 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Notifications</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {unreadCount} Unread Alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClearNotifications}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                    title="Clear notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Permission Prompt Banner */}
          {permission !== 'granted' && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-emerald-950">Enable Desktop Order Ready Alerts</p>
              </div>
              <button
                onClick={onRequestPermission}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm transition-all hover:bg-emerald-700"
              >
                Enable
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <Sparkles className="w-8 h-8 text-gray-200 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Alerts Right Now</p>
                <p className="text-[9px] font-bold text-gray-300">Order updates will show up here live</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    if (onNotificationClick && n.orderId) {
                      onNotificationClick(n.orderId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    n.read 
                      ? 'bg-white border-gray-100 opacity-75' 
                      : 'bg-emerald-50/40 border-emerald-100 shadow-sm'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-emerald-500'} mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-black text-slate-900 leading-tight">{n.title}</p>
                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{n.body}</p>
                    <p className="text-[8px] font-mono text-gray-400 pt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
