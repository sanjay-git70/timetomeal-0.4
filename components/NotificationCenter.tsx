import React, { useState } from 'react';
import { X, Check, CheckCircle2, Trash2, Search, Settings, Filter, Clock, ShoppingCart, AlertTriangle, XCircle, CreditCard, ChefHat, Bell, Store, UserPlus, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export type NotificationCategory = 
  | 'all' 
  | 'vendor_verification' 
  | 'student_registration' 
  | 'settlement_failed' 
  | 'refund_requests' 
  | 'new_orders' 
  | 'system_alerts'
  | 'support';

export type TimeFilter = 'all' | 'today' | 'yesterday' | 'this_week';

interface AppNotification {
  id: string;
  type: 'vendor' | 'student' | 'settlement' | 'refund' | 'order' | 'system' | 'support';
  title: string;
  message: string;
  time: string;
  period: 'today' | 'yesterday' | 'this_week';
  read: boolean;
  category: NotificationCategory;
}

const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'vendor',
    title: 'Pending Vendor Verification',
    message: 'Valley Snack Corner submitted FSSAI license & bank details for SRM campus.',
    time: '12 mins ago',
    period: 'today',
    read: false,
    category: 'vendor_verification'
  },
  {
    id: 'n2',
    type: 'student',
    title: 'New Student Registrations',
    message: '24 new students registered at IIT Madras node today.',
    time: '45 mins ago',
    period: 'today',
    read: false,
    category: 'student_registration'
  },
  {
    id: 'n3',
    type: 'settlement',
    title: 'Settlement Failed',
    message: 'Payout of ₹14,200 to Hostel Block B Canteen bounced due to invalid IFSC.',
    time: '2 hours ago',
    period: 'today',
    read: false,
    category: 'settlement_failed'
  },
  {
    id: 'n4',
    type: 'refund',
    title: 'Refund Request #RF-309',
    message: 'Aarav Sharma requested ₹180 refund for cancelled order #TM-8821.',
    time: 'Yesterday, 04:15 PM',
    period: 'yesterday',
    read: true,
    category: 'refund_requests'
  },
  {
    id: 'n5',
    type: 'order',
    title: 'High Order Volume Spike',
    message: 'Tech Park Central Food Court reached 150+ live active tickets.',
    time: 'Yesterday, 01:30 PM',
    period: 'yesterday',
    read: true,
    category: 'new_orders'
  },
  {
    id: 'n6',
    type: 'system',
    title: 'System Alert: Auto Backup',
    message: 'Cloud database snapshot and security rule audit completed successfully.',
    time: '3 days ago',
    period: 'this_week',
    read: true,
    category: 'system_alerts'
  },
  {
    id: 'n7',
    type: 'support',
    title: 'Vendor Support Ticket #SUP-88',
    message: 'Gourmet Campus Diner requested POS thermal printer configuration aid.',
    time: '4 days ago',
    period: 'this_week',
    read: true,
    category: 'support'
  }
];

const getIconForType = (type: AppNotification['type']) => {
  switch (type) {
    case 'vendor': return <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"><Store className="w-4 h-4" /></div>;
    case 'student': return <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"><UserPlus className="w-4 h-4" /></div>;
    case 'settlement': return <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"><XCircle className="w-4 h-4" /></div>;
    case 'refund': return <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"><RefreshCw className="w-4 h-4" /></div>;
    case 'order': return <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"><ShoppingCart className="w-4 h-4" /></div>;
    case 'support': return <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"><HelpCircle className="w-4 h-4" /></div>;
    default: return <div className="p-2 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"><ShieldAlert className="w-4 h-4" /></div>;
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (activeTimeFilter !== 'all' && n.period !== activeTimeFilter) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const CATEGORY_LABELS: Array<{ id: NotificationCategory; label: string }> = [
    { id: 'all', label: 'All Alerts' },
    { id: 'vendor_verification', label: 'Pending Vendor Verification' },
    { id: 'student_registration', label: 'New Student Registrations' },
    { id: 'settlement_failed', label: 'Settlement Failed' },
    { id: 'refund_requests', label: 'Refund Requests' },
    { id: 'new_orders', label: 'New Orders' },
    { id: 'system_alerts', label: 'System Alerts' },
    { id: 'support', label: 'Support' },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[200] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-[450px] bg-white dark:bg-slate-900 shadow-2xl z-[250] flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200/80 dark:border-slate-800 font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-950 text-emerald-400 font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white tracking-tight">Notification Center</h2>
              <p className="text-[11px] text-slate-400">Super Admin Platform Alerts</p>
            </div>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                {unreadCount} New
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
            />
          </div>

          {/* Time Filters */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setActiveTimeFilter(tf.id as TimeFilter)}
                className={`flex-1 py-1 text-center rounded-lg transition-all ${
                  activeTimeFilter === tf.id ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORY_LABELS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 shadow-xs' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
            <span className="text-[10px] font-bold text-slate-400">Unread Badge Active</span>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No notifications in this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex gap-3.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group relative ${!notification.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r" />
                  )}
                  
                  <div className="shrink-0">
                    {getIconForType(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs ${!notification.read ? 'font-black text-slate-950 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Mark read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;

