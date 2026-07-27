import React, { useState } from 'react';
import { X, Check, CheckCircle2, Trash2, Search, Settings, Filter, Clock, ShoppingCart, AlertTriangle, XCircle, CreditCard, ChefHat , Bell } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'all' | 'orders' | 'inventory' | 'payments' | 'system';

interface AppNotification {
  id: string;
  type: 'order_received' | 'low_stock' | 'out_of_stock' | 'payment_success' | 'kitchen_ready';
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: NotificationFilter;
}

const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'order_received',
    title: 'New Order #1452 received',
    message: 'Student walk-in order placed at counter.',
    time: '2 mins ago',
    read: false,
    category: 'orders'
  },
  {
    id: 'n2',
    type: 'kitchen_ready',
    title: 'Kitchen',
    message: 'Order #1452 is Ready for Pickup.',
    time: '5 mins ago',
    read: false,
    category: 'orders'
  },
  {
    id: 'n3',
    type: 'payment_success',
    title: 'Payment Successful',
    message: 'Order #1452 paid via Razorpay (₹450).',
    time: '6 mins ago',
    read: false,
    category: 'payments'
  },
  {
    id: 'n4',
    type: 'low_stock',
    title: 'Low Stock',
    message: 'Chicken Burger only 3 items remaining.',
    time: '15 mins ago',
    read: true,
    category: 'inventory'
  },
  {
    id: 'n5',
    type: 'out_of_stock',
    title: 'Out of Stock',
    message: 'French Fries unavailable.',
    time: '1 hour ago',
    read: true,
    category: 'inventory'
  }
];

const getIconForType = (type: AppNotification['type']) => {
  switch (type) {
    case 'order_received': return <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"><ShoppingCart className="w-4 h-4" /></div>;
    case 'low_stock': return <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"><AlertTriangle className="w-4 h-4" /></div>;
    case 'out_of_stock': return <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"><XCircle className="w-4 h-4" /></div>;
    case 'payment_success': return <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"><CreditCard className="w-4 h-4" /></div>;
    case 'kitchen_ready': return <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"><ChefHat className="w-4 h-4" /></div>;
    default: return <div className="p-2 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"><CheckCircle2 className="w-4 h-4" /></div>;
  }
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
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
    if (activeFilter !== 'all' && n.category !== activeFilter) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[200] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-white dark:bg-[#09090b] shadow-2xl z-[250] flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800 font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-[#09090b]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {['all', 'orders', 'inventory', 'payments', 'system'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as NotificationFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-end">
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-xs mt-1">No notifications to show here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/50 group relative ${!notification.read ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''}`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500" />
                  )}
                  
                  <div className="shrink-0 mt-0.5">
                    {getIconForType(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm tracking-tight ${!notification.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-slate-400">
                      <Clock className="w-3 h-3" />
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
