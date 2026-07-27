
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Order, MenuItem, User as AppUser, CanteenProfile, AdminProfile, OrderStatus } from '../types';
import SummaryDashboard from './SummaryDashboard';
import ReportsAnalysisView from './ReportsAnalysisView';
import { 
  Users, ShoppingBag, Search, 
  Trash2, ChevronRight, LayoutDashboard,
  ArrowLeft, RotateCw, Store, BarChart3, Settings, Shield, Power, Phone, Mail, MapPin, Save, Printer, Bell, BellOff, AlertTriangle, Key, LogOut, Hash, User as UserIcon,
  Check, Play, CheckCircle2, Clock, X, Filter
} from 'lucide-react';

interface AdminViewProps {
  user: AppUser;
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrders: (orders: Order[]) => void;
  onLogout: () => void;
}

type AdminTab = 'summary' | 'orders' | 'reports' | 'profile' | 'users';

const AdminView: React.FC<AdminViewProps> = ({ user, orders, menu, onUpdateOrders, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [tabHistory, setTabHistory] = useState<AdminTab[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Tickets tab State
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | OrderStatus>('all');
  const [ticketSortBy, setTicketSortBy] = useState<'newest' | 'oldest' | 'total_high' | 'total_low'>('newest');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  // Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const adminProfile = user.profile as AdminProfile;

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, order_status: status } : o);
    onUpdateOrders(updated);
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Permanently delete this ticket record?')) {
      onUpdateOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (ticketStatusFilter !== 'all') {
      result = result.filter(o => o.order_status === ticketStatusFilter);
    }

    // Search query
    if (ticketSearchQuery.trim()) {
      const q = ticketSearchQuery.toLowerCase();
      result = result.filter(o => 
        o.order_code.toLowerCase().includes(q) ||
        (o.student_details?.full_name || '').toLowerCase().includes(q) ||
        (o.student_details?.register_number || '').toLowerCase().includes(q) ||
        (o.order_items || []).some(item => item.item_name.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (ticketSortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (ticketSortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (ticketSortBy === 'total_high') {
        return b.total_amount - a.total_amount;
      }
      if (ticketSortBy === 'total_low') {
        return a.total_amount - b.total_amount;
      }
      return 0;
    });

    return result;
  }, [orders, ticketStatusFilter, ticketSearchQuery, ticketSortBy]);

  const navigateTo = useCallback((tab: AdminTab) => {
    if (tab === activeTab) return;
    setTabHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
  }, [activeTab]);

  const goBack = useCallback(() => {
    if (tabHistory.length === 0) return;
    const previous = tabHistory[tabHistory.length - 1];
    setTabHistory(prev => prev.slice(0, -1));
    setActiveTab(previous);
  }, [tabHistory]);

  // Keyboard Shortcuts: ESC, TAB (Canteen Bill), Shift+Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        navigateTo('orders');
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      }
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, navigateTo]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (rollNumberInput !== adminProfile?.roll_number) {
      setPasswordError("Verification Failed: Valid Roll Number is required for password reset.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Security Rule: New password must be at least 6 characters.");
      return;
    }

    // Persist Change
    const allUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex > -1) {
      allUsers[userIndex].password = newPassword;
      localStorage.setItem('hb_users', JSON.stringify(allUsers));
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordForm(false);
      setNewPassword('');
      setRollNumberInput('');
      setPasswordSuccess(false);
    }, 2000);
  };

  return (
    <div key={refreshKey} className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {tabHistory.length > 0 && (
            <button onClick={goBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h2 className="text-4xl font-black text-gray-950 tracking-tight">System Master</h2>
            <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-[0.5em] mt-2">Administrative Console</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm flex-wrap">
            {[
              { id: 'summary', icon: LayoutDashboard, label: 'Summary' },
              { id: 'orders', icon: ShoppingBag, label: 'Tickets' },
              { id: 'reports', icon: BarChart3, label: 'Reports' },
              { id: 'profile', icon: Settings, label: 'Profile' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest ${
                  activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'summary' && (
        <SummaryDashboard 
          orders={orders} 
          menu={menu} 
          onNewWalkIn={() => navigateTo('orders')} 
          onUpdateOrders={onUpdateOrders}
          user={user}
        />
      )}
      {activeTab === 'reports' && <ReportsAnalysisView orders={orders} menu={menu} />}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          {/* Tickets Queue Metrics Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-gray-50 text-gray-900 rounded-2xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tickets</p>
                <p className="text-2xl font-black text-gray-950 mt-1">{orders.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Queue</p>
                <p className="text-2xl font-black text-gray-950 mt-1">
                  {orders.filter(o => o.order_status === 'pending' || o.order_status === 'preparing').length}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready to Collect</p>
                <p className="text-2xl font-black text-gray-950 mt-1">
                  {orders.filter(o => o.order_status === 'ready').length}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered Today</p>
                <p className="text-2xl font-black text-gray-950 mt-1">
                  {orders.filter(o => o.order_status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar Controls */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                value={ticketSearchQuery}
                onChange={e => setTicketSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 font-bold text-xs shadow-inner transition-all"
                placeholder="Search by Ticket ID (#), student name, register no, or meal item..."
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                {(['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setTicketStatusFilter(status)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      ticketStatusFilter === status 
                        ? 'bg-white text-gray-950 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-950'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <select
                value={ticketSortBy}
                onChange={e => setTicketSortBy(e.target.value as any)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none text-gray-700 font-sans"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total_high">Highest Value</option>
                <option value="total_low">Lowest Value</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {filteredAndSortedOrders.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center gap-4">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">No Tickets Found</p>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Try adjusting your filters or search keywords</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:border-emerald-100 transition-all shadow-sm flex flex-col justify-between gap-6"
                >
                  <div className="space-y-6">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="px-4.5 py-2.5 bg-gray-950 text-emerald-500 rounded-2xl font-black text-xl tracking-tight">
                          #{order.order_code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              order.order_type === 'online' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {order.order_type}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="font-black text-gray-950 text-base mt-1">
                            {order.student_details?.full_name || 'Walk-in Counter Guest'}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          order.order_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          order.order_status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.order_status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                          order.order_status === 'delivered' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.order_status}
                        </span>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all rounded-xl"
                          title="Delete Ticket Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Student details if available */}
                    {order.student_details && (
                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500">
                        <div>
                          <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">Register No:</span>
                          <span className="text-gray-800">{order.student_details.register_number}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">Hostel & Room:</span>
                          <span className="text-gray-800">{order.student_details.hostel_name} - Room {order.student_details.room_number}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center gap-1 text-[10px]">
                           <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Phone:</span>
                           <span className="text-gray-700">{order.student_details.phone_number}</span>
                        </div>
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Meal Selection</p>
                      <div className="space-y-3">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-dashed border-gray-200/50 pb-2 last:border-0 last:pb-0">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">{item.item_name}</span>
                              <span className="text-[9px] font-black text-gray-400 uppercase">₹{item.price} each</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="font-black text-gray-400">x{item.quantity}</span>
                              <span className="font-black text-gray-950">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-200/50 mt-4 pt-3 flex justify-between items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Price</div>
                        <div className="text-xl font-black text-gray-950">₹{order.total_amount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => setSelectedReceipt(order)}
                      className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Receipt
                    </button>

                    <div className="flex gap-2">
                      {order.order_status === 'pending' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')} 
                          className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-amber-100 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" /> Prepare
                        </button>
                      )}
                      {order.order_status === 'preparing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'ready')} 
                          className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-100 transition-all"
                        >
                          <Check className="w-4 h-4" /> Ready
                        </button>
                      )}
                      {order.order_status === 'ready' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')} 
                          className="flex items-center gap-2 px-6 py-3.5 bg-gray-950 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-gray-200 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Handover
                        </button>
                      )}
                      {order.order_status === 'delivered' && (
                        <span className="px-5 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Delivered
                        </span>
                      )}
                      {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                          className="px-4 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Receipt Print Overlay Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
              <div className="bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-950 bg-gray-50 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex-1 overflow-y-auto pr-1">
                  {/* Thermal Print Receipt Design */}
                  <div id="receipt-print-area" className="text-center font-mono text-gray-900 space-y-4 pt-4 select-all">
                    <div className="space-y-1 font-sans">
                      <h3 className="text-lg font-black tracking-tight text-gray-950 uppercase font-sans">CAMPUS MEALS CANTEEN</h3>
                      <p className="text-[10px] text-gray-400 font-bold font-sans">Hostel Block Dining Center</p>
                      <p className="text-[9px] text-gray-400 font-bold font-sans">Tel: +91 98765 43210</p>
                    </div>

                    <p className="text-[10px]">----------------------------------------</p>

                    <div>
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest font-sans">ORDER TOKEN</p>
                       <p className="text-3xl font-black text-gray-950 tracking-tight mt-1">#{selectedReceipt.order_code}</p>
                    </div>

                    <p className="text-[10px]">----------------------------------------</p>

                    <div className="text-left text-[10px] space-y-1.5 font-sans font-bold">
                      <div className="flex justify-between">
                        <span className="text-gray-400 uppercase tracking-wider">Date:</span>
                        <span className="text-gray-800">{new Date(selectedReceipt.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 uppercase tracking-wider">Time:</span>
                        <span className="text-gray-800">{new Date(selectedReceipt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 uppercase tracking-wider">Type:</span>
                        <span className="text-gray-800 uppercase font-black">{selectedReceipt.order_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 uppercase tracking-wider">Customer:</span>
                        <span className="text-gray-800 uppercase font-black truncate max-w-[180px]">{selectedReceipt.student_details?.full_name || 'Walk-in Guest'}</span>
                      </div>
                    </div>

                    <p className="text-[10px]">----------------------------------------</p>

                    {/* Items Table */}
                    <div className="text-left text-[10px] space-y-2 font-sans font-bold">
                      {selectedReceipt.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-black">{item.item_name}</span>
                            <span className="text-[9px] text-gray-400">x{item.quantity} @ ₹{item.price}</span>
                          </div>
                          <span className="text-gray-950 font-black">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px]">----------------------------------------</p>

                    <div className="text-left text-[11px] space-y-1 font-sans font-bold">
                      <div className="flex justify-between text-gray-500 text-[10px]">
                        <span>Subtotal</span>
                        <span>₹{selectedReceipt.total_amount}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[10px]">
                        <span>Paid (UPI/Cash)</span>
                        <span>₹{selectedReceipt.paid_amount}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-gray-100">
                        <span>TOTAL AMOUNT</span>
                        <span>₹{selectedReceipt.total_amount}</span>
                      </div>
                    </div>

                    <p className="text-[10px]">----------------------------------------</p>

                    {/* Barcode representation */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-10 w-44 bg-slate-950 flex items-stretch gap-0.5 px-3 py-1 bg-white border border-gray-100 rounded-lg">
                        <div className="w-1.5 bg-gray-950" />
                        <div className="w-0.5 bg-gray-950" />
                        <div className="w-1 bg-gray-950" />
                        <div className="w-0.5 bg-transparent" />
                        <div className="w-2 bg-gray-950" />
                        <div className="w-0.5 bg-gray-950" />
                        <div className="w-1 bg-transparent" />
                        <div className="w-1.5 bg-gray-950" />
                        <div className="w-0.5 bg-gray-950" />
                        <div className="w-1.5 bg-gray-950" />
                        <div className="w-1 bg-transparent" />
                        <div className="w-2 bg-gray-950" />
                        <div className="w-0.5 bg-gray-950" />
                        <div className="w-1 bg-gray-950" />
                      </div>
                      <span className="text-[8px] tracking-[0.25em] text-gray-400">*{selectedReceipt.order_code}*</span>
                    </div>

                    <div className="space-y-1 pt-2 font-sans">
                      <p className="text-[10px] font-black text-gray-800">THANK YOU FOR YOUR PATRONAGE!</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Powered by TimeToMeal Campus</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      const printContents = document.getElementById('receipt-print-area')?.innerHTML;
                      if (printContents) {
                        const originalContents = document.body.innerHTML;
                        document.body.innerHTML = printContents;
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload();
                      }
                    }}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Trigger System Print
                  </button>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ADMIN IDENTITY SECTION */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg">
                       <Shield className="w-10 h-10" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900">Administrator</h3>
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{adminProfile?.full_name}</p>
                    </div>
                 </div>

                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Email ID</span>
                       <span className="font-bold text-gray-900">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Roll Number</span>
                       <span className="font-black text-emerald-600">{adminProfile?.roll_number}</span>
                    </div>
                 </div>

                 <button onClick={onLogout} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                    <LogOut className="w-5 h-5" /> Sign Out Securely
                 </button>
              </div>

              {/* SECURITY / PASSWORD CHANGE SECTION */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                       <Key className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">Security Credentials</h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reset Master Password</p>
                    </div>
                 </div>

                 {!showPasswordForm ? (
                   <div className="space-y-4">
                      <p className="text-sm text-gray-500 font-bold leading-relaxed">Password reset requires verification of your system-assigned administrative roll number.</p>
                      <button onClick={() => setShowPasswordForm(true)} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Start Password Reset</button>
                   </div>
                 ) : (
                   <form onSubmit={handlePasswordChange} className="space-y-5 animate-in slide-in-from-top-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">System Roll No.</label>
                        <input required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Verification Required" value={rollNumberInput} onChange={e => setRollNumberInput(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">New Secret Password</label>
                        <input required type="password" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>

                      {passwordError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2">{passwordError}</p>}
                      {passwordSuccess && <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-2">Password changed successfully!</p>}

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100">Reset Password</button>
                      </div>
                   </form>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
