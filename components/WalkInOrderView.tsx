
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MenuItem, Order, OrderItem, User as AppUser, CanteenProfile, PaymentMethod } from '../types';
import { 
  Search, Plus, Minus, X, CreditCard, Banknote, Printer, 
  ChevronLeft, ShoppingCart, CheckCircle2, ChevronDown, IndianRupee,
  Keyboard, Filter, Zap, Trash2, ArrowRight
} from 'lucide-react';

interface WalkInOrderViewProps {
  user: AppUser;
  menu: MenuItem[];
  onBack: () => void;
  onPlaceOrder: (order: Order) => void;
}

type PaymentOption = 'cash' | 'online' | 'razorpay';

// Quick Category Filters
const POS_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'beverage', label: 'Beverages' },
];

const WalkInOrderView: React.FC<WalkInOrderViewProps> = ({ user, menu, onBack, onPlaceOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentOption>('cash');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');

  const canteenProfile = user.profile as CanteenProfile;

  // Filter menu items by search, category & diet
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDiet = 
        dietFilter === 'all' ? true :
        dietFilter === 'veg' ? item.is_veg === true :
        item.is_veg === false;
      return matchesSearch && matchesCategory && matchesDiet;
    });
  }, [menu, searchTerm, selectedCategory, dietFilter]);

  const addToCart = useCallback((item: MenuItem) => {
    if (!item.availability || item.stock_offline <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      if (existing) {
        return prev.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menu_item_id: item.id,
        item_name: item.item_name,
        price: item.price,
        quantity: 1
      }];
    });
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.menu_item_id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.menu_item_id !== id));
  };

  const clearCart = () => setCart([]);

  // Keyboard Shortcuts Handler (Ctrl+1 to Ctrl+9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.ctrlKey || e.altKey) {
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
          e.preventDefault();
          const targetItem = filteredMenu[keyNum - 1];
          if (targetItem) {
            addToCart(targetItem);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMenu, addToCart]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const cashAmount = parseFloat(cashReceivedInput) || total;
  const changeDue = Math.max(0, cashAmount - total);

  const handleCheckout = async (paymentType: PaymentOption = selectedPaymentMethod) => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    let mappedPaymentMethod: PaymentMethod = 'cash';
    if (paymentType === 'online' || paymentType === 'razorpay') {
      mappedPaymentMethod = 'UPI';
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: null,
      canteen_id: canteenProfile.canteen_id || 'c1',
      total_amount: total,
      paid_amount: total,
      order_status: 'delivered',
      order_type: 'walk-in',
      order_code: `W-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      order_items: [...cart],
      payments: [{
        order_id: '',
        payment_method: mappedPaymentMethod,
        payment_status: 'completed' as const,
        paid_amount: total
      }],
      canteen_details: canteenProfile
    };

    onPlaceOrder(newOrder);
    setOrderComplete(newOrder);
    setIsProcessing(false);
  };

  const handleRazorpayGateway = () => {
    if (cart.length === 0 || isProcessing) return;

    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TJCR2oIU69Zu0j',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'TimeToMeal Counter POS',
        description: `Walk-in POS Bill (₹${total.toFixed(2)})`,
        handler: function () {
          handleCheckout('razorpay');
        },
        theme: { color: '#059669' }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      handleCheckout('razorpay');
    }
  };

  // SUCCESS RECEIPT OVERLAY
  if (orderComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-slate-200 shadow-xl flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center">Order Completed</h2>
          <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mt-0.5 mb-4">
            Token #{orderComplete.order_code}
          </p>
          
          <div className="w-full bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 space-y-2 text-xs">
            {orderComplete.order_items?.map((item, idx) => (
              <div key={idx} className="flex justify-between font-medium text-slate-700">
                <span>{item.quantity}x {item.item_name}</span>
                <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 flex flex-col gap-1">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>Total Paid</span>
                <span className="text-emerald-600">₹{orderComplete.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-500">
                <span>Payment</span>
                <span className="uppercase text-slate-800 font-bold">{selectedPaymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <button 
              onClick={() => {
                setOrderComplete(null);
                setCart([]);
                setCashReceivedInput('');
                setSelectedPaymentMethod('cash');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Start Next Bill
            </button>
            <button 
              onClick={onBack}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans text-slate-800">
      
      {/* COMPACT TOOLBAR & FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search Bar & Diet Toggle */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search items or press Ctrl+1..9..." 
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Diet Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                dietFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                dietFilter === 'veg' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Veg
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                dietFilter === 'non-veg' ? 'bg-white text-red-700 font-bold shadow-2xs' : 'text-slate-500 hover:text-red-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Non-Veg
            </button>
          </div>
        </div>

        {/* Right: Quick Category Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 shrink-0">
          {POS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* POS MAIN DUAL COLUMN VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* LEFT PRODUCT CATALOG GRID (8 COLS ON DESKTOP) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-2">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600">
              Menu Catalog ({filteredMenu.length} items)
            </span>
            <span className="text-[11px] text-slate-400">
              Click item to add • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">1..9</kbd>
            </span>
          </div>

          {filteredMenu.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 space-y-2">
              <p className="text-xs font-semibold text-slate-600">No menu items match criteria</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setDietFilter('all'); }} className="text-xs text-emerald-600 font-bold hover:underline">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[calc(100vh-175px)] overflow-y-auto pr-1">
              {filteredMenu.map((item, index) => {
                const isOutOfStock = !item.availability || item.stock_offline <= 0;
                const shortcutNum = index < 9 ? index + 1 : null;
                const isVeg = item.is_veg !== false;
                const cartQuantity = cart.find(c => c.menu_item_id === item.id)?.quantity || 0;

                return (
                  <button 
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={isOutOfStock}
                    className={`bg-white border rounded-xl p-2 flex flex-col justify-between transition-all relative text-left group hover:border-emerald-500 hover:shadow-sm ${
                      cartQuantity > 0 ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20' : 'border-slate-200'
                    } ${
                      isOutOfStock ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-98'
                    }`}
                  >
                    {/* Top Row: Shortcut & Cart Count Badge */}
                    <div className="flex items-center justify-between w-full mb-1">
                      {shortcutNum ? (
                        <span className="px-1 py-0.2 bg-slate-900 text-emerald-400 text-[9px] font-bold rounded">
                          Ctrl+{shortcutNum}
                        </span>
                      ) : <span />}

                      {cartQuantity > 0 && (
                        <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[10px] rounded-full">
                          {cartQuantity} in cart
                        </span>
                      )}
                    </div>

                    {/* Compact Image */}
                    <div className="w-full h-20 bg-slate-100 rounded-lg overflow-hidden relative mb-1.5">
                      <img 
                        src={item.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        alt={item.item_name} 
                      />
                      
                      <span className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full border border-white ${
                        isVeg ? 'bg-emerald-500' : 'bg-red-500'
                      }`} title={isVeg ? 'Veg' : 'Non-Veg'} />

                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-slate-900/80 text-white text-[9px] font-medium">
                        Qty: {item.stock_offline}
                      </span>

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                          <span className="text-white font-bold text-[10px] uppercase tracking-wider bg-red-600 px-1.5 py-0.5 rounded">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name & Price */}
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs truncate leading-snug">
                        {item.item_name}
                      </h4>
                      <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-slate-100">
                        <span className="text-emerald-700 font-bold text-xs">₹{item.price}</span>
                        <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT FIXED COUNTER BILL PANEL (4 COLS ON DESKTOP) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[60vh] lg:h-[calc(100vh-140px)]">
            
            {/* Header */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs tracking-tight">Counter Bill</span>
                <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded-full text-[10px] font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items
                </span>
              </div>

              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Scrollable Cart Item List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-1.5 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Bill is currently empty</p>
                  <p className="text-[10px] text-slate-400">Select items from the menu catalog on the left</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.menu_item_id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-slate-800 text-xs truncate leading-tight">{item.item_name}</h5>
                      <p className="text-[10px] text-slate-500">₹{item.price} x {item.quantity} = <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span></p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.menu_item_id, -1)}
                          className="w-4 h-4 bg-white rounded text-slate-600 hover:text-red-600 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-bold text-xs w-5 text-center text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.menu_item_id, 1)}
                          className="w-4 h-4 bg-white rounded text-slate-600 hover:text-emerald-600 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.menu_item_id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Calculations & Payment Options */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2.5 shrink-0">
              
              {/* Amounts */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (5%)</span>
                  <span className="font-medium text-slate-800">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">Grand Total</span>
                  <span className="font-extrabold text-lg text-emerald-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Selector */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                      selectedPaymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('online')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                      selectedPaymentMethod === 'online'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('razorpay')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                      selectedPaymentMethod === 'razorpay'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Razorpay</span>
                  </button>
                </div>

                {/* Cash Quick Presets & Change Calculation */}
                {selectedPaymentMethod === 'cash' && (
                  <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Cash Received</span>
                      {changeDue > 0 && (
                        <span className="text-emerald-700 font-bold">Change: ₹{changeDue.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                        <input
                          type="number"
                          placeholder={`₹${total.toFixed(2)}`}
                          value={cashReceivedInput}
                          onChange={(e) => setCashReceivedInput(e.target.value)}
                          className="w-full pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {[100, 200, 500].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCashReceivedInput(amt.toString())}
                            className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                disabled={cart.length === 0 || isProcessing}
                onClick={() => selectedPaymentMethod === 'razorpay' ? handleRazorpayGateway() : handleCheckout(selectedPaymentMethod)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Bill (₹{total.toFixed(2)})
                  </>
                )}
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WalkInOrderView;

