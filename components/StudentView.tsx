import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Order, MenuItem, OrderItem, StudentProfile, PaymentMethod } from '../types';
import { 
  ShoppingCart, CheckCircle, Utensils, LogOut, 
  User as UserIcon, ShoppingBag, Bell, X, 
  Clock, ArrowLeft, Mail, Phone, Hash, Key, 
  ChevronRight, MapPin, Search, Info, ShieldCheck, 
  CreditCard, Smartphone, QrCode, Copy, ExternalLink,
  ChevronLeft, ArrowRight, Home, Star, Plus as PlusIcon, Minus, AlertCircle, ShoppingCart as CartIcon, Check,
  Settings, Camera, SlidersHorizontal, Printer, AlertTriangle, Sparkles, Filter,
  LayoutGrid, Coffee, SunMedium, ChevronDown, CupSoda, ChevronUp, Store
} from 'lucide-react';
import { CANCEL_WINDOW_MS } from '../constants';
import OrderPlacedPopup from './OrderPlacedPopup';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { CameraCaptureModal } from './CameraCaptureModal';
import { OrderPipelineStepper } from './OrderPipelineStepper';
import { NotificationBell } from './NotificationBell';
import { SettingsModal } from './SettingsModal';
import { StudentReceiptModal } from './StudentReceiptModal';
import { CancelOrderModal } from './CancelOrderModal';

// Quick check if constants didn't export some icons, we import them from lucide-react safely
import { Plus, ListFilter, Trash2, CheckCircle2, RotateCw, XCircle } from 'lucide-react';

interface StudentViewProps {
  user: User;
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrders: (orders: Order[]) => void;
  onLogout: () => void;
  onUpdateProfile: (profile: StudentProfile) => void;
}

type StudentTab = 'home' | 'orders' | 'history' | 'cart' | 'profile' | 'settings' | 'search';
type CheckoutStep = 'basket' | 'billing' | 'payment';

const CancellationTimer = ({ createdAt }: { createdAt: string }) => {
  const getRemaining = useCallback(() => {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diff = CANCEL_WINDOW_MS - (now - created);
    return Math.max(0, diff);
  }, [createdAt]);

  const [timeLeft, setTimeLeft] = useState(getRemaining());

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const next = getRemaining();
      setTimeLeft(next);
      if (next <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [getRemaining, timeLeft]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-full border border-slate-200 dark:border-slate-700 animate-pulse">
      <Clock className="w-2.5 h-2.5 text-slate-900 dark:text-slate-100" />
      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Cancel: {mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
};

const StudentView: React.FC<StudentViewProps> = ({ user, orders, menu, onUpdateOrders, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('home');
  const [tabHistory, setTabHistory] = useState<StudentTab[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('basket');
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>(() => {
    return (localStorage.getItem('hb_veg_preference') as any) || 'all';
  });
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Modals & UI Controls State
  const [showPlacedPopup, setShowPlacedPopup] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MenuItem | null>(null);
  const [selectedMealQty, setSelectedMealQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('cashfree'); // cashfree, upi, cod
  const [paymentRatio, setPaymentRatio] = useState<'half' | 'full'>('full'); // 100% upfront (paymentRatio selection is removed)
  
  // Simulated Cashfree Payments States
  const [isCashfreeModalOpen, setIsCashfreeModalOpen] = useState(false);
  const [cashfreeModalAmount, setCashfreeModalAmount] = useState(0);
  const [cashfreeModalCallback, setCashfreeModalCallback] = useState<(paymentId: string) => void>(() => () => {});
  const [cashfreeModalDescription, setCashfreeModalDescription] = useState('');
  const [cashfreeModalOrderCode, setCashfreeModalOrderCode] = useState('');
  const [cashfreePaymentLoading, setCashfreePaymentLoading] = useState(false);
  const [cashfreeSelectedMethod, setCashfreeSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  
  const [selectedCanteenName, setSelectedCanteenName] = useState<string>('TimeToMeal Main Canteen');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [selectedDetailsOrderId, setSelectedDetailsOrderId] = useState<string | null>(null);

  const [cancellingPageOrderId, setCancellingPageOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Changed my mind');
  const [cancelComment, setCancelComment] = useState<string>('');
  const [cancelSuccessData, setCancelSuccessData] = useState<{ referenceNumber: string } | null>(null);

  const [paymentScreenOrderId, setPaymentScreenOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'options' | 'qr' | 'upi_id' | 'more' | 'success' | 'failed'>('options');
  const [paymentResultData, setPaymentResultData] = useState<{ paymentId: string; txId: string; amount: number } | null>(null);

  // New Rating and Receipt Page States
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [ratingComments, setRatingComments] = useState<string>('');
  const [showRatingThankYou, setShowRatingThankYou] = useState<boolean>(false);
  const [receiptPageOrderId, setReceiptPageOrderId] = useState<string | null>(null);

  // Browser Notification API Hook
  const {
    notifications,
    permission,
    requestNotificationPermission,
    markAllAsRead,
    clearNotifications,
    markAsRead
  } = useOrderNotifications(orders, user.id);

  // UPI Payment State
  const [upiId, setUpiId] = useState('canteen@upi');
  const [payeeName, setPayeeName] = useState('TimeToMeal Canteen');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'submitted'>('pending');

  const studentProfile = user.profile as StudentProfile;
  const isProfileIncomplete = !studentProfile?.register_number || !studentProfile?.hostel_name;

  const myActiveOrders = useMemo(() => {
    return orders.filter(order => order.student_id === user.id && ['pending', 'preparing', 'ready'].includes(order.order_status));
  }, [orders, user.id]);

  const myPastOrders = useMemo(() => {
    return orders.filter(order => order.student_id === user.id && ['delivered', 'cancelled'].includes(order.order_status));
  }, [orders, user.id]);

  useEffect(() => {
    if (orders.length === 0) {
      const seedPastOrders: Order[] = [
        {
          id: 'past-1',
          student_id: user.id,
          canteen_id: 's1',
          total_amount: 85,
          paid_amount: 43,
          order_status: 'delivered',
          order_type: 'online',
          order_code: '5214',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          order_items: [
            { menu_item_id: 'm1', item_name: 'Masala Dosa', price: 45, quantity: 1 },
            { menu_item_id: 'm4', item_name: 'Cold Coffee', price: 40, quantity: 1 }
          ],
          student_details: studentProfile
        },
        {
          id: 'past-2',
          student_id: user.id,
          canteen_id: 's1',
          total_amount: 120,
          paid_amount: 0,
          order_status: 'delivered',
          order_type: 'online',
          order_code: '9420',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          order_items: [
            { menu_item_id: 'm2', item_name: 'Veg Thali', price: 85, quantity: 1 },
            { menu_item_id: 'm3', item_name: 'Vegetable Sandwich', price: 35, quantity: 1 }
          ],
          student_details: studentProfile
        },
        {
          id: 'past-3',
          student_id: user.id,
          canteen_id: 's1',
          total_amount: 40,
          paid_amount: 20,
          order_status: 'cancelled',
          order_type: 'online',
          order_code: '3104',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          order_items: [
            { menu_item_id: 'm4', item_name: 'Cold Coffee', price: 40, quantity: 1 }
          ],
          student_details: studentProfile
        }
      ];
      onUpdateOrders(seedPastOrders);
    }
  }, [orders.length, onUpdateOrders, user.id, studentProfile]);

  const handleReorder = (orderItems: OrderItem[]) => {
    let addedCount = 0;
    const unavailableItems: string[] = [];

    setCart(prev => {
      const newCart = [...prev];
      orderItems.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menu_item_id);
        if (menuItem && menuItem.availability) {
          const existingIdx = newCart.findIndex(c => c.menu_item_id === item.menu_item_id);
          if (existingIdx > -1) {
            newCart[existingIdx].quantity += item.quantity;
          } else {
            newCart.push({
              menu_item_id: item.menu_item_id,
              item_name: item.item_name,
              price: item.price,
              quantity: item.quantity
            });
          }
          addedCount++;
        } else {
          unavailableItems.push(item.item_name);
        }
      });
      return newCart;
    });

    if (addedCount > 0) {
      alert(`Selected meals from past order have been added to your Cart!`);
      navigateTo('cart');
    }
    if (unavailableItems.length > 0) {
      alert(`Some items from this past order are currently unavailable: ${unavailableItems.join(', ')}`);
    }
  };

  const navigateTo = useCallback((tab: StudentTab) => {
    setIsSettingsOpen(false);
    if (tab === activeTab) return;
    setTabHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
    if (tab === 'cart') setCheckoutStep('basket');
  }, [activeTab]);

  const goBack = useCallback(() => {
    if (activeTab === 'cart' && checkoutStep !== 'basket') {
      if (checkoutStep === 'payment') setCheckoutStep('billing');
      else setCheckoutStep('basket');
      return;
    }
    if (tabHistory.length === 0) return;
    const previous = tabHistory[tabHistory.length - 1];
    setTabHistory(prev => prev.slice(0, -1));
    setActiveTab(previous);
  }, [tabHistory, activeTab, checkoutStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  const [profileForm, setProfileForm] = useState({
    full_name: studentProfile?.full_name || '',
    register_number: studentProfile?.register_number || '',
    hostel_name: studentProfile?.hostel_name || '',
    room_number: studentProfile?.room_number || '',
    phone_number: studentProfile?.phone_number || ''
  });

  const total = useMemo(() => cart.reduce((sum, i) => sum + (i.price * i.quantity), 0), [cart]);
  const upfront = paymentRatio === 'full' ? total : Math.round(total * 0.5);

  const handleConfirmCancelOrder = (orderId: string, reason: string, comment?: string) => {
    const fullReason = comment && comment.trim() ? `${reason} (${comment.trim()})` : reason;
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          order_status: 'cancelled' as const,
          cancellation_reason: fullReason
        };
      }
      return o;
    });
    onUpdateOrders(updatedOrders);
  };

  const handleCameraPhotoCapture = (dataUrl: string) => {
    onUpdateProfile({
      ...studentProfile,
      photo_url: dataUrl
    });
  };

  const toggleCartItem = (item: MenuItem, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.menu_item_id === item.id);
      if (exists) {
        // If already exists, we toggle/remove if no qty is passed or update quantity
        return prev.filter(i => i.menu_item_id !== item.id);
      }
      return [...prev, { menu_item_id: item.id, item_name: item.item_name, price: item.price, quantity: qty }];
    });
  };

  const updateCartQty = (menuItemId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.menu_item_id === menuItemId) {
        const nextQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  const removeCartItem = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menu_item_id !== menuItemId));
  };

  const handlePayRemaining = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paid_amount: o.total_amount,
          payment_status: 'paid' as const
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    alert('Remaining balance paid successfully! Order payment status is now Paid.');
  };

  const handleChangePaymentMethod = (orderId: string, newMethod: string, newRatio: 'half' | 'full') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.order_status !== 'pending') {
      alert('Payment method can only be changed while order status is Pending.');
      return;
    }
    const isFull = newRatio === 'full' || newMethod === 'cashfree' || newMethod === 'Cashfree' || newMethod === 'UPI';
    const paid = newMethod === 'cod' ? 0 : (isFull ? order.total_amount : Math.round(order.total_amount * 0.5));
    const status = newMethod === 'cod' ? 'pending_cash_payment' as const : (isFull ? 'paid' as const : 'advance_paid' as const);
    
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          payment_method: newMethod === 'cod' ? 'cash' : newMethod,
          paid_amount: paid,
          payment_status: status
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    alert('Payment method updated successfully.');
  };

  const handleCashfreeCheckoutForExistingOrder = (orderId: string, amountDue: number) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    
    const processSuccessfulPayment = (paymentId: string) => {
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const prevPaid = order.paid_amount || 0;
          const newPaid = prevPaid + amountDue;
          const isFullyPaid = newPaid >= order.total_amount;
          return {
            ...order,
            paid_amount: newPaid,
            payment_status: isFullyPaid ? 'paid' : 'advance_paid',
            payments: [
              ...(order.payments || []),
              {
                order_id: orderId,
                payment_method: 'Cashfree',
                payment_status: 'completed',
                transaction_reference: paymentId,
                paid_amount: amountDue
              }
            ]
          };
        }
        return order;
      });
      onUpdateOrders(updatedOrders);
      alert('Payment successful!');
      setPaymentScreenOrderId(null);
    };

    // Open the high-fidelity Cashfree payments checkout modal
    setCashfreeModalAmount(amountDue);
    setCashfreeModalCallback(() => processSuccessfulPayment);
    setCashfreeModalDescription(`Pending Payment for Order #${existingOrder.order_code}`);
    setCashfreeModalOrderCode(existingOrder.order_code);
    setIsCashfreeModalOpen(true);
  };

  const handleCashfreeCheckout = () => {
    if (cart.length === 0) return;
    const canteenId = menu.length > 0 ? menu[0].canteen_id : 'canteen-1';
    const orderCode = Math.floor(1000 + Math.random() * 9000).toString();

    const processSuccessfulPayment = (paymentId: string) => {
      setTransactionRef(paymentId);
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        student_id: user.id,
        canteen_id: canteenId,
        total_amount: total,
        paid_amount: upfront,
        payment_method: 'Cashfree',
        payment_status: paymentRatio === 'full' ? 'paid' : 'advance_paid',
        order_status: 'pending',
        order_type: 'online',
        order_code: orderCode,
        created_at: new Date().toISOString(),
        order_items: [...cart],
        student_details: studentProfile,
        payments: [{
          order_id: '',
          payment_method: 'Cashfree',
          payment_status: 'completed',
          transaction_reference: paymentId,
          paid_amount: upfront
        }]
      };

      onUpdateOrders([newOrder, ...orders]);
      setShowPlacedPopup(true);
      setCart([]);
      setCheckoutStep('basket');
      navigateTo('orders');
    };

    // Open the high-fidelity Cashfree payments checkout modal
    setCashfreeModalAmount(upfront);
    setCashfreeModalCallback(() => processSuccessfulPayment);
    setCashfreeModalDescription(`Meal Reservation Payment (Ref: #${orderCode})`);
    setCashfreeModalOrderCode(orderCode);
    setIsCashfreeModalOpen(true);
  };

  const finalizeOrder = () => {
    if (paymentMethod === 'cashfree') {
      handleCashfreeCheckout();
      return;
    }

    const canteenId = menu.length > 0 ? menu[0].canteen_id : 'canteen-1';
    const tr = 'TM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTransactionRef(tr);
    
    const isFull = paymentRatio === 'full' || paymentMethod === 'upi';
    const paid = paymentMethod === 'cod' ? 0 : upfront;
    const pStatus = paymentMethod === 'cod' ? 'pending_cash_payment' : (isFull ? 'paid' : 'advance_paid');

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: user.id,
      canteen_id: canteenId,
      total_amount: total,
      paid_amount: paid,
      payment_method: paymentMethod === 'cod' ? 'cash' : 'UPI',
      payment_status: pStatus,
      order_status: 'pending',
      order_type: 'online',
      order_code: Math.floor(1000 + Math.random() * 9000).toString(),
      created_at: new Date().toISOString(),
      order_items: [...cart],
      student_details: studentProfile,
    };
    onUpdateOrders([newOrder, ...orders]);
    
    if (paymentMethod === 'cod') {
      setShowPlacedPopup(true);
      setCart([]);
      navigateTo('orders');
    } else {
      setCheckoutStep('payment');
      setPaymentStatus('pending');
    }
  };

  const handleConfirmPayment = () => {
    setPaymentStatus('submitted');
    setShowPlacedPopup(true);
    setCart([]); // Clear cart upon successful submission
  };

  const handlePopupClose = () => {
    setShowPlacedPopup(false);
    navigateTo('orders');
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(m => {
      const matchesSearch = m.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || m.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesDietary = dietaryFilter === 'all' || 
                             (dietaryFilter === 'veg' && m.is_veg !== false) ||
                             (dietaryFilter === 'non-veg' && m.is_veg === false);
      const matchesPrice = m.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesDietary && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [menu, searchTerm, selectedCategory, dietaryFilter, maxPrice, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(menu.map(m => m.category));
    return ['all', ...Array.from(cats)];
  }, [menu]);

  // Handle detailed view action
  const handleOpenMealDetail = (item: MenuItem) => {
    setSelectedMeal(item);
    const existing = cart.find(c => c.menu_item_id === item.id);
    setSelectedMealQty(existing ? existing.quantity : 1);
  };

  const handleAddFromDetail = () => {
    if (!selectedMeal) return;
    setCart(prev => {
      const exists = prev.find(i => i.menu_item_id === selectedMeal.id);
      if (exists) {
        return prev.map(i => i.menu_item_id === selectedMeal.id ? { ...i, quantity: selectedMealQty } : i);
      }
      return [...prev, { menu_item_id: selectedMeal.id, item_name: selectedMeal.item_name, price: selectedMeal.price, quantity: selectedMealQty }];
    });
    setSelectedMeal(null);
  };

  // Slider Button for Slide to Confirm
  const SlideButton = ({ onConfirm }: { onConfirm: () => void }) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const updateSlider = (clientX: number) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.min(Math.max(0, (x / rect.width) * 100), 100);
      setSliderValue(percent);
      if (percent >= 90) {
        setIsConfirmed(true);
        setSliderValue(100);
        setTimeout(onConfirm, 400);
      }
    };

    return (
      <div 
        ref={sliderRef}
        onClick={() => {
          if (!isConfirmed) {
            setIsConfirmed(true);
            setSliderValue(100);
            setTimeout(onConfirm, 300);
          }
        }}
        className="relative h-14 bg-emerald-600 hover:bg-emerald-700 rounded-[12px] overflow-hidden flex items-center justify-center p-1 select-none cursor-pointer shadow-sm w-full touch-none transition-all"
        onTouchMove={(e) => !isConfirmed && updateSlider(e.touches[0].clientX)}
        onMouseMove={(e) => !isConfirmed && e.buttons === 1 && updateSlider(e.clientX)}
        onMouseUp={() => !isConfirmed && setSliderValue(0)}
        onTouchEnd={() => !isConfirmed && setSliderValue(0)}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            {isConfirmed ? 'Processing...' : 'Swipe or Tap to Proceed'}
          </span>
        </div>
        <div 
          className="absolute left-1 h-12 w-16 bg-white text-emerald-600 rounded-[10px] shadow-sm flex items-center justify-center transition-transform"
          style={{ transform: `translateX(${(sliderValue / 100) * (sliderRef.current?.offsetWidth ? sliderRef.current.offsetWidth - 72 : 0)}px)` }}
        >
          <ArrowRight className="w-5 h-5 font-bold" />
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[#F8FAF9] dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300 ${(activeTab === 'cart' || activeTab === 'orders' || activeTab === 'history') ? 'h-screen h-[100dvh] overflow-hidden flex flex-col' : 'min-h-screen pb-32'}`}>
      {/* Upper header - Clean human-crafted layout */}
      {activeTab === 'home' && (
      <header className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex justify-between items-center z-40 transition-colors duration-300 shrink-0">
        <div className="flex items-center gap-3">
          {activeTab !== 'home' ? (
            <button 
              onClick={() => navigateTo('home')}
              className="flex items-center gap-1.5 text-slate-800 dark:text-white font-extrabold hover:text-emerald-600 transition-colors py-1.5 px-3.5 -ml-2 rounded-full bg-slate-100/90 dark:bg-slate-800/90"
              title="Go back to Home"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-600 stroke-[3px]" />
              <span className="text-xs uppercase tracking-wider font-extrabold">Done</span>
            </button>
          ) : (
            <div 
              onClick={() => navigateTo('profile')}
              className="cursor-pointer group flex items-center gap-2"
              title="Click to view profile"
            >
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold flex items-center gap-1 leading-none">
                  Hello, Welcome! <span className="text-sm">👋</span>
                </p>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-1 tracking-tight group-hover:text-emerald-600 transition-colors">
                  {studentProfile?.full_name || 'Sanjay Kumar'}
                </h2>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {isProfileIncomplete && (
            <button 
              onClick={() => navigateTo('profile')}
              className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200 dark:border-amber-800 animate-pulse hidden sm:block"
            >
              Complete Profile
            </button>
          )}

          {/* Report Button */}
          <a 
            href="https://forms.gle/rW8oeSayeFh1tP5RA"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"
            title="Report Issue / Feedback"
          >
            <AlertCircle className="w-5 h-5 text-slate-900 dark:text-white" />
          </a>

          {/* Circular Bell Button */}
          <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full shadow-sm flex items-center justify-center">
            <NotificationBell 
              notifications={notifications}
              permission={permission}
              onRequestPermission={requestNotificationPermission}
              onMarkAllAsRead={markAllAsRead}
              onClearNotifications={clearNotifications}
              onMarkAsRead={markAsRead}
              onNotificationClick={(orderId) => {
                setSelectedDetailsOrderId(orderId);
                setActiveTab('orders');
              }}
            />
          </div>

          {/* Profile Icon Button */}
          <button 
            onClick={() => navigateTo('profile')}
            className="w-10 h-10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"
            title="Student Profile"
          >
            <UserIcon className="w-4.5 h-4.5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>
      </header>
      )}

      {/* Main Tab Renderers */}
      <main className={`max-w-2xl mx-auto w-full ${(activeTab === 'cart' || activeTab === 'orders' || activeTab === 'history') ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        {/* DEDICATED FULL SEARCH PAGE VIEW */}
        {activeTab === 'search' && (
          <div className="px-5 pt-3 space-y-4 animate-in fade-in duration-300 pb-24">
            {/* Integrated Search Bar with Right-Side Veg Switch Dropdown Pill */}
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-sm px-4 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input 
                type="text" 
                placeholder="Search pizza, sandwich, meals..." 
                className="w-full bg-transparent border-none outline-none font-semibold text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 py-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1.5 shrink-0" />

              {/* Veg & Non-Veg Toggle Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const next = dietaryFilter === 'veg' ? 'all' : 'veg';
                    setDietaryFilter(next);
                    localStorage.setItem('hb_veg_preference', next);
                  }}
                  className={`px-2.5 py-1 rounded-full font-black text-[9px] tracking-tight uppercase transition-all shadow-xs flex items-center gap-1 ${
                    dietaryFilter === 'veg' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Filter Veg Items"
                >
                  🌱 VEG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = dietaryFilter === 'non-veg' ? 'all' : 'non-veg';
                    setDietaryFilter(next);
                    localStorage.setItem('hb_veg_preference', next);
                  }}
                  className={`px-2.5 py-1 rounded-full font-black text-[9px] tracking-tight uppercase transition-all shadow-xs flex items-center gap-1 ${
                    dietaryFilter === 'non-veg' 
                      ? 'bg-rose-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Filter Non-Veg Items"
                >
                  🍗 NON-VEG
                </button>
              </div>
            </div>

            {/* Quick Popular Searches Tags */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Popular Searches</span>
              <div className="flex flex-wrap gap-2">
                {['Pizza 🍕', 'Sandwich 🥪', 'Cold Coffee ☕', 'Veg Thali 🍱', 'Burger 🍔', 'Dosa 🥞', 'Fries 🍟'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag.split(' ')[0])}
                    className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results */}
            <section className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'All Food Items'}
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{filteredMenu.length} items available</span>
              </div>

              {filteredMenu.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">No food items found matching "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="text-xs font-black text-emerald-600 hover:underline uppercase"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredMenu.map(item => {
                    const inCart = cart.find(i => i.menu_item_id === item.id);
                    const qty = inCart ? inCart.quantity : 0;
                    
                    const hostelName = item.canteen_id === 's2' ? 'Hostel Block B Mess' : 'Hostel Block A Canteen';
                    const isVeg = item.is_veg !== false;
                    const stockRemaining = item.stock_online || 15;

                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleOpenMealDetail(item)}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.75rem] p-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="w-full h-32 rounded-[1.25rem] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                            <img 
                              src={item.imageUrl} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                            {/* Veg / Non-veg Badge on Top-Left */}
                            <div className="absolute top-2 left-2 z-10">
                              {isVeg ? (
                                <span className="bg-emerald-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                  🌱 VEG
                                </span>
                              ) : (
                                <span className="bg-rose-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                  🍗 NON-VEG
                                </span>
                              )}
                            </div>
                            {/* Category Badge on Bottom-Left */}
                            <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-slate-200/50 dark:border-slate-800">
                              🧁 {item.category.toLowerCase()}
                            </div>
                          </div>
                          
                          {/* Food Title */}
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2.5 line-clamp-1">{item.item_name}</h4>

                          {/* Location Pin & Hostel Name */}
                          <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                            <span className="text-rose-500">📍</span> {hostelName}
                          </p>
                          
                          {/* Status & Stock Badges */}
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-extrabold">
                            <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                            <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-900/60 flex items-center gap-0.5">
                              🔥 {stockRemaining} left
                            </span>
                          </div>
                        </div>

                        {/* Price & Counter Stepper Row */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{item.price}</span>
                          
                          {qty > 0 ? (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-800/80 rounded-full px-2 py-0.5 flex items-center justify-between gap-1.5 shadow-xs transition-all"
                            >
                              <button 
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded-full text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/80 flex items-center justify-center font-black text-xs active:scale-90 transition-all"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-emerald-900 dark:text-emerald-100 min-w-[14px] text-center">{qty}</span>
                              <button 
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs hover:bg-emerald-700 shadow-xs active:scale-90 transition-all"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCartItem(item, 1);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/25 transition-all"
                              title="Add item to cart"
                            >
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* HOME TAB VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-500">
            {/* Clean White Search Bar Container */}
            <div className="px-5">
              <div 
                onClick={() => navigateTo('search')}
                className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-emerald-500 cursor-pointer"
              >
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                <input 
                  type="text" 
                  placeholder="Search pizza, sandwich, meals..." 
                  className="w-full bg-transparent border-none outline-none font-semibold text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 py-1 cursor-pointer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => navigateTo('search')}
                  onFocus={() => navigateTo('search')}
                  readOnly
                />

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1.5 shrink-0" />

                {/* Veg & Non-Veg Toggle Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = dietaryFilter === 'veg' ? 'all' : 'veg';
                      setDietaryFilter(next);
                      localStorage.setItem('hb_veg_preference', next);
                    }}
                    className={`px-2.5 py-1 rounded-full font-black text-[9px] tracking-tight uppercase transition-all shadow-xs flex items-center gap-1 ${
                      dietaryFilter === 'veg' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Filter Veg Items"
                  >
                    🌱 VEG
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = dietaryFilter === 'non-veg' ? 'all' : 'non-veg';
                      setDietaryFilter(next);
                      localStorage.setItem('hb_veg_preference', next);
                    }}
                    className={`px-2.5 py-1 rounded-full font-black text-[9px] tracking-tight uppercase transition-all shadow-xs flex items-center gap-1 ${
                      dietaryFilter === 'non-veg' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Filter Non-Veg Items"
                  >
                    🍗 NON-VEG
                  </button>
                </div>
              </div>
            </div>

            {/* Top 40% Section: Categories & Preorder Banner */}
            <div className="space-y-4">
              {/* Categories Section - Exactly like Reference UI */}
              <section className="space-y-2.5">
                <div className="px-5 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Categories</h3>
                  <button 
                    onClick={() => navigateTo('search')}
                    className="text-xs font-black text-slate-950 dark:text-white hover:underline flex items-center gap-0.5"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5 stroke-[3px]" />
                  </button>
                </div>

                {/* Horizontal Category Cards */}
                <div className="flex gap-2.5 overflow-x-auto px-5 pb-1 no-scrollbar scroll-smooth">
                  {[
                    { cat: 'all', label: 'All', icon: <LayoutGrid className="w-4 h-4 text-emerald-600" /> },
                    { cat: 'Breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-500" /> },
                    { cat: 'Lunch', label: 'Lunch', icon: <SunMedium className="w-4 h-4 text-amber-500" /> },
                    { cat: 'Snacks', label: 'Snacks', icon: <Utensils className="w-4 h-4 text-amber-500" /> },
                    { cat: 'milkshakes', label: 'Milkshakes 🧋', icon: <CupSoda className="w-4 h-4 text-pink-500" /> }
                  ].map(item => {
                    const isSelected = selectedCategory === item.cat;
                    return (
                      <button
                        key={item.cat}
                        onClick={() => setSelectedCategory(item.cat)}
                        className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
                          isSelected 
                            ? 'bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Campus Cafe Promo Banner - Compact Top 40% height */}
              <div className="px-5">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl p-4 text-white relative overflow-hidden shadow-md shadow-emerald-500/15">
                  <div className="relative z-10 max-w-[70%]">
                    <span className="bg-[#FEF08A] text-slate-900 font-black text-[8px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
                      ☕ CAMPUS CAFE
                    </span>
                    <h3 className="text-base font-black tracking-tight mt-1.5 leading-tight text-white">Preorder Meals, Bypass Queue</h3>
                    <p className="text-[10px] text-emerald-100/90 font-medium mt-1 leading-snug">Instant digital reservation for Hostel blocks.</p>
                    
                    <button 
                      onClick={() => navigateTo('search')}
                      className="bg-white text-emerald-800 text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-xs hover:bg-emerald-50 transition-all inline-flex items-center gap-1.5 mt-2.5 cursor-pointer"
                    >
                      <span>Preorder Now</span>
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <ArrowRight className="w-2.5 h-2.5 stroke-[3px]" />
                      </div>
                    </button>
                  </div>

                  {/* Right side illustration graphic */}
                  <div className="absolute -right-1 bottom-0 w-24 h-24 opacity-20 flex items-center justify-center">
                    <Utensils className="w-full h-full text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 60% Section: Today's Selection Menu Grid */}
            <section className="px-5 space-y-3 pb-24 pt-1">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Today's Selection
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">Available fresh at Hostel & Campus canteens</p>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {filteredMenu.length} items available
                </span>
              </div>

              {filteredMenu.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">No matching items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredMenu.map(item => {
                    const inCart = cart.find(i => i.menu_item_id === item.id);
                    const qty = inCart ? inCart.quantity : 0;
                    
                    // Hostel Block & Food Status Metadata
                    const hostelName = item.canteen_id === 's2' ? 'Hostel Block B Mess' : 'Hostel Block A Canteen';
                    const isVeg = item.is_veg !== false;
                    const stockRemaining = item.stock_online || 15;

                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleOpenMealDetail(item)}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.75rem] p-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="w-full h-32 rounded-[1.25rem] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                            <img 
                              src={item.imageUrl} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                            {/* Top Left Veg/Non-Veg Badge */}
                            <div className="absolute top-2 left-2 z-10">
                              {isVeg ? (
                                <span className="bg-emerald-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                  🌱 VEG
                                </span>
                              ) : (
                                <span className="bg-rose-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                  🍗 NON-VEG
                                </span>
                              )}
                            </div>
                            {/* Bottom Left Category Badge */}
                            <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-slate-200/50 dark:border-slate-800">
                              🧁 {item.category.toLowerCase()}
                            </div>
                          </div>

                          {/* Food Title */}
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2.5 line-clamp-1">{item.item_name}</h4>

                          {/* Location Pin & Hostel Name */}
                          <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                            <span className="text-rose-500">📍</span> {hostelName}
                          </p>
                          
                          {/* Status & Stock Badges */}
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-extrabold">
                            <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                            <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-900/60 flex items-center gap-0.5">
                              🔥 {stockRemaining} left
                            </span>
                          </div>
                        </div>

                        {/* Price & Counter Stepper Row */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{item.price}</span>

                          {qty > 0 ? (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-800/80 rounded-full px-2 py-0.5 flex items-center justify-between gap-1.5 shadow-xs transition-all"
                            >
                              <button 
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded-full text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/80 flex items-center justify-center font-black text-xs active:scale-90 transition-all"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-emerald-900 dark:text-emerald-100 min-w-[14px] text-center">{qty}</span>
                              <button 
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs hover:bg-emerald-700 shadow-xs active:scale-90 transition-all"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCartItem(item, 1);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/25 transition-all"
                              title="Add item to cart"
                            >
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ACTIVE TICKETS VIEW */}
        {(activeTab === 'orders' || activeTab === 'history') && (
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-slate-950 w-full animate-in slide-in-from-right-4 duration-300">
            {ratingOrderId ? (
              /* RATE ORDER PAGE */
              (() => {
                const order = orders.find(o => o.id === ratingOrderId);
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950">
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
                      <button 
                        onClick={() => {
                          setRatingOrderId(null);
                          setCurrentRating(0);
                          setRatingComments('');
                        }}
                        className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full pb-24 space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Rate Your Order</h2>
                        <p className="text-sm text-gray-500 mt-1">Please rate your experience with order #{order?.order_code}</p>
                      </div>

                      {/* Stars */}
                      <div className="flex justify-center items-center gap-2.5 py-4">
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const isFilled = starValue <= currentRating;
                          return (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => setCurrentRating(starValue)}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <Star
                                className={`w-10 h-10 transition-colors ${
                                  isFilled 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-gray-300 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Comments Area */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Comments (Optional)</label>
                        <textarea
                          value={ratingComments}
                          onChange={(e) => setRatingComments(e.target.value)}
                          placeholder="Tell us what you liked or how we can improve..."
                          className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 min-h-[120px] resize-none"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRatingOrderId(null);
                            setCurrentRating(0);
                            setRatingComments('');
                          }}
                          className="py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-all text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentRating === 0) {
                              alert('Please select a star rating first!');
                              return;
                            }
                            // Process rating (save to localStorage)
                            const ratings = JSON.parse(localStorage.getItem('hb_order_ratings') || '{}');
                            ratings[ratingOrderId!] = {
                              rating: currentRating,
                              comments: ratingComments,
                              timestamp: Date.now()
                            };
                            localStorage.setItem('hb_order_ratings', JSON.stringify(ratings));
                            
                            setShowRatingThankYou(true);
                          }}
                          className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 text-center"
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    {/* Thank You Popup */}
                    {showRatingThankYou && (
                      <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 text-center space-y-5 animate-in zoom-in-95 duration-200">
                          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 dark:border-emerald-900/50">
                            <Star className="w-8 h-8 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-slate-950 dark:text-white">Thank You!</h3>
                            <p className="text-sm text-gray-500">Your feedback has been submitted successfully.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowRatingThankYou(false);
                              setRatingOrderId(null);
                              setCurrentRating(0);
                              setRatingComments('');
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : receiptPageOrderId ? (
              /* VIEW RECEIPT PAGE */
              (() => {
                const order = orders.find(o => o.id === receiptPageOrderId);
                if (!order) return null;
                const remainingAtCounter = Math.max(0, order.total_amount - (order.paid_amount || 0));
                
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-slate-950">
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-10">
                      <button 
                        onClick={() => setReceiptPageOrderId(null)}
                        className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Order Receipt</span>
                      <div className="w-5" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full pb-24 space-y-6 no-scrollbar">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm font-mono text-slate-900 dark:text-slate-100 space-y-4">
                        <div className="text-center space-y-1 font-sans">
                          <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-white uppercase">TIMETOMEAL CANTEEN</h3>
                          <p className="text-[10px] text-gray-400 font-bold">Hostel Block Dining Hall</p>
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-0.5">Official Student Receipt</p>
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-sans font-bold">TOKEN CODE</p>
                          <p className="text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-1">#{order.order_code}</p>
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        <div className="text-left text-[11px] space-y-2 font-sans">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Date & Time:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Order Status:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase">{order.order_status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Student Name:</span>
                            <span className="text-slate-900 dark:text-white font-black truncate max-w-[170px]">{order.student_details?.full_name || 'Student'}</span>
                          </div>
                          {order.student_details?.register_number && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-bold uppercase tracking-wider">Register No:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-bold">{order.student_details.register_number}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        {/* Items Table */}
                        <div className="text-left text-[11px] space-y-2 font-sans">
                          {order.order_items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className="text-slate-950 dark:text-white font-black">{item.item_name}</span>
                                <span className="text-[10px] text-gray-400 font-bold">x{item.quantity} @ ₹{item.price}</span>
                              </div>
                              <span className="text-slate-950 dark:text-white font-black">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        <div className="text-left text-[11px] space-y-1.5 font-sans">
                          <div className="flex justify-between text-gray-500 font-bold">
                            <span>Total Bill Amount</span>
                            <span>₹{order.total_amount}</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Upfront Paid (Cashfree / UPI)</span>
                            <span>₹{order.paid_amount || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-950 dark:text-white font-black text-sm pt-2 border-t border-dashed border-gray-200 dark:border-slate-800">
                            <span>DUE AT COUNTER</span>
                            <span>₹{remainingAtCounter}</span>
                          </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        <div className="text-left text-[11px] space-y-1.5 font-sans font-bold">
                          <div className="flex justify-between">
                            <span className="text-gray-400 uppercase tracking-wider">Payment Method:</span>
                            <span className="text-slate-800 dark:text-slate-200 capitalize">{order.payment_method === 'cod' ? 'Cash' : order.payment_method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 uppercase tracking-wider">Payment Status:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{order.paid_amount >= order.total_amount ? 'Fully Paid' : 'Partially Paid'}</span>
                          </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-300 dark:text-slate-700">----------------------------------------</p>

                        <div className="space-y-1 font-sans pt-1 text-center">
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">SHOW TOKEN AT COUNTER TO PICK UP</p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">TimeToMeal Canteen</p>
                        </div>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" /> Print Receipt
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : cancellingPageOrderId ? (
              /* CANCEL ORDER PAGE */
              (() => {
                const cancelOrder = orders.find(o => o.id === cancellingPageOrderId);
                if (cancelSuccessData) {
                  return (
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 max-w-xl mx-auto w-full">
                       <div className="bg-white dark:bg-slate-900 rounded-[12px] p-6 shadow-sm border border-gray-100 dark:border-slate-800 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Order Cancelled</h3>
                        <p className="text-sm text-gray-500">Your order #{cancelOrder?.order_code} has been cancelled.</p>
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 text-left space-y-3 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Refund Status</span>
                            <span className="font-semibold text-emerald-600">Processed (3-5 Days)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Reference No.</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{cancelSuccessData.referenceNumber}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCancellingPageOrderId(null);
                            setSelectedDetailsOrderId(null);
                            setCancelSuccessData(null);
                            navigateTo('home');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-[12px] transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
                      <button 
                        onClick={() => setCancellingPageOrderId(null)}
                        className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-xl mx-auto w-full no-scrollbar">
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-[12px] shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Token #{cancelOrder?.order_code}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">₹{cancelOrder?.total_amount}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {cancelOrder?.order_items?.[0]?.item_name} {cancelOrder?.order_items && cancelOrder.order_items.length > 1 ? `+ ${cancelOrder.order_items.length - 1} more` : ''}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4 rounded-[12px] shadow-sm border border-gray-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Reason for Cancellation</p>
                        <div className="space-y-3">
                          {['Ordered by mistake', 'Changed my mind', 'Long waiting time', 'Payment issue', 'Other'].map(reason => (
                            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${cancelReason === reason ? 'border-emerald-600' : 'border-gray-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                                {cancelReason === reason && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                              </div>
                              <input
                                type="radio"
                                className="hidden"
                                checked={cancelReason === reason}
                                onChange={() => setCancelReason(reason)}
                              />
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{reason}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4 rounded-[12px] shadow-sm border border-gray-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Additional Comments</p>
                        <textarea
                          value={cancelComment}
                          onChange={(e) => setCancelComment(e.target.value)}
                          placeholder="Tell us more..."
                          className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[8px] text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none h-24 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const refNum = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
                          handleConfirmCancelOrder(cancelOrder!.id, cancelReason, cancelComment);
                          setCancelSuccessData({ referenceNumber: refNum });
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-[12px] shadow-sm transition-all active:scale-[0.98] mt-2"
                      >
                        Submit Cancellation
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : paymentScreenOrderId ? (
              /* DYNAMIC QR PAYMENT PAGE FROM ACTIVE ORDERS (REMAINING PAYMENT OR CASH PAYMENT) */
              (() => {
                  const payOrder = orders.find(o => o.id === paymentScreenOrderId);
                  const amountDue = payOrder?.total_amount! - payOrder?.paid_amount!;
                  return (
                    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950">
                      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
                        <button 
                          onClick={() => {
                            setPaymentScreenOrderId(null);
                            setPaymentStep('options');
                          }}
                          className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" /> Back
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full pb-24 no-scrollbar">
                        <div className="text-center mb-6">
                           <p className="text-sm text-gray-500 font-medium">Amount Due</p>
                           <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-1">₹{amountDue}</h2>
                        </div>

                        {paymentStep === 'options' && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-[12px] border border-gray-100 dark:border-slate-800">
                               <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Pay securely with Cashfree Payments</p>
                               <button
                                 onClick={() => {
                                    handleCashfreeCheckoutForExistingOrder(payOrder!.id, amountDue);
                                 }}
                                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                               >
                                 <CreditCard className="w-5 h-5" /> Pay Now
                               </button>
                               <p className="text-xs text-center text-gray-500 mt-3">Cards, UPI, Netbanking, Wallets supported</p>
                            </div>
                          </div>
                        )}
                        
                        {paymentStep === 'success' && paymentResultData && (
                          <div className="text-center space-y-4 animate-in zoom-in-95 mt-4">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
                              <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful</h3>
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-[12px] p-4 text-left space-y-2 mt-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Paid</span>
                                <span className="font-bold text-slate-900 dark:text-white">₹{paymentResultData.amount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Payment ID</span>
                                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{paymentResultData.paymentId}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setPaymentScreenOrderId(null);
                                setPaymentStep('options');
                              }}
                              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-[12px] mt-4 shadow-sm"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
              })()
            ) : selectedDetailsOrderId ? (
              /* ORDER DETAILS PAGE */
              (() => {
                const order = orders.find(o => o.id === selectedDetailsOrderId);
                if (!order) return null;
                
                const timeDiff = new Date(order.created_at).getTime() + 20 * 60000 - Date.now();
                const canCancel = timeDiff > 0 && order.order_status === 'pending';
                const isFullyPaid = order.paid_amount >= order.total_amount;
                
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-slate-950">
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center shadow-sm shrink-0 sticky top-0 z-10">
                      <button 
                        onClick={() => setSelectedDetailsOrderId(null)}
                        className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-xl mx-auto w-full no-scrollbar">
                      <div className="bg-white dark:bg-slate-900 rounded-[12px] p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Order Information</p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">#{order.order_code}</h2>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                              order.order_status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                              order.order_status === 'cancelled' ? 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' :
                              order.order_status === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                              order.order_status === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                              'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                          <div>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Date & Time</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">
                              {new Date(order.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Estimated Cancel Time</p>
                            <div className="mt-1">
                              {canCancel ? (
                                <CancellationTimer createdAt={order.created_at} />
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full border border-slate-200 dark:border-slate-700 font-mono text-[9px] font-bold">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Cancel: Expired</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Canteen Name</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">TimeToMeal Main Canteen</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Order Type</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1 capitalize">{order.order_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[12px] p-4 shadow-sm border border-gray-100 dark:border-slate-800">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Ordered Items</p>
                        <div className="space-y-3">
                          {order.order_items.map((item, idx) => {
                            const menuItem = menu.find(m => m.id === item.menu_item_id);
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                   <img src={menuItem?.imageUrl} className="w-full h-full object-cover" alt={item.item_name} referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.item_name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-bold text-sm text-slate-900 dark:text-white">₹{item.price * item.quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">Total Amount</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{order.total_amount}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[12px] p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Payment Information</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-slate-300">Method</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{order.payment_method === 'cod' ? 'Cash' : order.payment_method}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-slate-300">Status</span>
                          <span className={`text-sm font-bold ${isFullyPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isFullyPaid ? 'Paid' : order.payment_method === 'cod' ? 'Pending Cash Collection' : order.paid_amount > 0 ? 'Partially Paid (50% Reservation)' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-4">
                        {canCancel ? (
                          <button 
                            onClick={() => setCancellingPageOrderId(order.id)}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl text-sm transition-all text-center flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                          >
                            <Trash2 className="w-4 h-4 text-slate-900 dark:text-white" />
                            Cancel Order
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600 font-bold py-3.5 rounded-xl text-sm border border-gray-100 dark:border-slate-800 text-center cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel Expired
                          </button>
                        )}
                        <button 
                          onClick={() => setReceiptPageOrderId(order.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Printer className="w-4 h-4" />
                          View Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* UNIFIED ORDERS LIST (SCROLLABLE VIEW) */
              <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-slate-950">
                <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 shadow-sm shrink-0 sticky top-0 z-10">
                  <button 
                    onClick={() => navigateTo('home')}
                    className="w-10 h-10 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center transition-all border border-slate-150/40 dark:border-slate-800 shadow-sm"
                    title="Back to Home"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Active Orders</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 max-w-xl mx-auto w-full pb-36 scroll-smooth overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {orders.filter(o => o.student_id === user.id).length === 0 ? (
                    <div className="text-center mt-20 p-6 bg-white dark:bg-slate-900 rounded-[12px] border border-gray-100 dark:border-slate-800 shadow-sm">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active orders</h3>
                      <p className="text-sm text-gray-500 mt-1">Your recent food orders will appear here.</p>
                      <button 
                        onClick={() => setActiveTab('home')}
                        className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-[12px] transition-all shadow-sm active:scale-95"
                      >
                        Order Food
                      </button>
                    </div>
                  ) : (
                    orders.filter(o => o.student_id === user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(order => {
                      const formattedDate = new Date(order.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
                          {/* Header Row */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">TOKEN NUMBER</p>
                              <p className="text-xl font-black text-slate-900 dark:text-white">#{order.order_code}</p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">TOTAL PRICE</p>
                              <p className="text-xl font-black text-slate-900 dark:text-white">₹{order.total_amount}</p>
                            </div>
                          </div>

                          {/* Info Row: Date and Status Badge */}
                          <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                              order.order_status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400' :
                              order.order_status === 'cancelled' ? 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' :
                              order.order_status === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400' :
                              order.order_status === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400' :
                              'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="grid grid-cols-2 gap-3.5 pt-1">
                            <button
                              onClick={() => setRatingOrderId(order.id)}
                              className="bg-white hover:bg-amber-50/50 dark:bg-slate-900 dark:hover:bg-amber-950/20 border border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                              Rate Order
                            </button>
                            <button
                              onClick={() => setSelectedDetailsOrderId(order.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* BASKET / CHECKOUT WIZARD VIEW */}
        {activeTab === 'cart' && (
          <div className="flex-1 flex flex-col min-h-0 px-4 pt-4 max-w-2xl mx-auto w-full animate-in duration-500 overflow-hidden bg-gray-50 dark:bg-slate-950">
            {checkoutStep === 'basket' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center shrink-0 pb-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('home')} className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm border border-gray-100 dark:border-slate-800">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight leading-none">Cart</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</p>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => setCart([])}
                      className="text-[10px] font-bold uppercase text-red-500 hover:text-red-700 tracking-wider flex items-center gap-1 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200">Your Cart is Empty</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Looks like you haven't added anything yet.</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[12px] text-sm font-bold shadow-md transition-all active:scale-95"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth pr-1 pb-2 space-y-3 no-scrollbar">
                      {cart.map(item => {
                        const menuItem = menu.find(m => m.id === item.menu_item_id);
                        return (
                          <div key={item.menu_item_id} className="bg-white dark:bg-slate-900 p-3 rounded-[12px] shadow-sm flex items-center justify-between gap-3 relative border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                <img src={menuItem?.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={item.item_name} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.item_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="font-bold text-slate-900 dark:text-white text-sm">₹{item.price}</p>
                                </div>
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-1">Total: ₹{item.price * item.quantity}</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between h-full py-1 gap-2 shrink-0">
                              <button 
                                onClick={() => removeCartItem(item.menu_item_id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/30 rounded-lg overflow-hidden border border-emerald-100 dark:border-emerald-800/50">
                                <button 
                                  onClick={() => updateCartQty(item.menu_item_id, -1)}
                                  className="w-7 h-7 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-800/50 active:scale-95 transition-all"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-emerald-900 dark:text-emerald-100">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQty(item.menu_item_id, 1)}
                                  className="w-7 h-7 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-800/50 active:scale-95 transition-all"
                                >
                                  <PlusIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Summary & Swipe to Pay */}
                    <div className="shrink-0 pt-2 pb-32 space-y-4 bg-gray-50 dark:bg-slate-950">
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-[12px] shadow-sm flex justify-between items-center border border-gray-100 dark:border-slate-800">
                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Total Amount</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">₹{total}</span>
                      </div>
                      
                      <SlideButton onConfirm={() => setCheckoutStep('billing')} />
                    </div>
                  </>
                )}
              </div>
            )}

            {checkoutStep === 'billing' && (
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 animate-in slide-in-from-right-4 pb-36 pr-1 no-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCheckoutStep('basket')} className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm border border-gray-100 dark:border-slate-800">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Payment</h4>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-[12px] shadow-sm border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Total Amount</span>
                     <span className="text-lg font-bold text-slate-900 dark:text-white text-xl">₹{total}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[12px] shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Payment Method</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="flex items-center p-4 border-b border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-3">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Online Payment</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Cards, UPI, Netbanking, Wallets</p>
                      </div>
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={paymentMethod === 'cashfree'} 
                        onChange={() => setPaymentMethod('cashfree')}
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </label>
                    <label className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mr-3">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Cash at Counter</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Pay physically upon collection</p>
                      </div>
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  {paymentMethod === 'cashfree' ? (
                    <button
                      onClick={handleCashfreeCheckout}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                    >
                      <CreditCard className="w-4 h-4" /> Pay with Cashfree Payments
                    </button>
                  ) : (
                    <button
                      onClick={finalizeOrder}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                    >
                      Place Counter Order
                    </button>
                  )}
                </div>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="flex-1 overflow-y-auto min-h-0 pb-36 space-y-6 animate-in zoom-in-95 bg-white dark:bg-slate-900 rounded-[12px] p-6 shadow-sm border border-gray-100 dark:border-slate-800 max-w-sm mx-auto my-auto mt-4 w-full no-scrollbar">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle className="w-10 h-10" />
                 </div>
                 <div className="text-center space-y-1">
                    <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payment Successful</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Your order has been placed</p>
                 </div>
                 
                 <div className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl space-y-3">
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500 dark:text-slate-400">Payment ID</span>
                     <span className="font-mono font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{transactionRef}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500 dark:text-slate-400">Order Token</span>
                     <span className="font-mono font-medium text-slate-900 dark:text-white">{orders[0]?.order_code || '---'}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500 dark:text-slate-400">Paid Amount</span>
                     <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{upfront}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500 dark:text-slate-400">Date & Time</span>
                     <span className="font-medium text-slate-900 dark:text-white">{new Date().toLocaleString()}</span>
                   </div>
                 </div>

                 <div className="w-full space-y-3 pt-2">
                   <button 
                     onClick={() => {
                        if (orders.length > 0) setSelectedReceiptOrder(orders[0]);
                     }} 
                     className="w-full py-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-[12px] font-bold text-sm transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                   >
                      View Receipt
                   </button>
                   <button 
                     onClick={() => {
                        setCheckoutStep('basket');
                        navigateTo('orders');
                     }} 
                     className="w-full py-3 bg-emerald-600 text-white rounded-[12px] font-bold text-sm shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                   >
                      Go to Active Orders
                   </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE SCREEN VIEW */}
        {activeTab === 'profile' && (
          <div className="px-6 pt-4 space-y-6 animate-in fade-in duration-500 pb-12">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-200/50 mb-4">
                  {studentProfile?.full_name?.[0] || 'U'}
                </div>
                <h3 className="text-lg font-black text-gray-950 tracking-tight leading-none">{studentProfile?.full_name}</h3>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2 bg-emerald-50 px-3 py-1 rounded-full">{studentProfile?.register_number || 'REG-USER'}</p>
             </div>

             {/* Personal Details Profile Form */}
             <section className="space-y-3">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">My Information</h4>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                   <div className="space-y-3">
                     <div>
                       <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Full Legal Name</label>
                       <input 
                         type="text" 
                         className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-emerald-500"
                         value={profileForm.full_name}
                         onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                       />
                     </div>
                     <div>
                       <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Campus Registration ID / Roll No.</label>
                       <input 
                         type="text" 
                         className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-emerald-500"
                         value={profileForm.register_number}
                         onChange={(e) => setProfileForm({ ...profileForm, register_number: e.target.value })}
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-3.5">
                       <div>
                         <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Hostel Block</label>
                         <input 
                           type="text" 
                           className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-emerald-500"
                           value={profileForm.hostel_name}
                           onChange={(e) => setProfileForm({ ...profileForm, hostel_name: e.target.value })}
                         />
                       </div>
                       <div>
                         <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Room No.</label>
                         <input 
                           type="text" 
                           className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-emerald-500"
                           value={profileForm.room_number}
                           onChange={(e) => setProfileForm({ ...profileForm, room_number: e.target.value })}
                         />
                       </div>
                     </div>
                     <div>
                       <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                       <input 
                         type="text" 
                         className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-emerald-500"
                         value={profileForm.phone_number}
                         onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                       />
                     </div>
                   </div>

                   <button 
                     onClick={() => {
                       onUpdateProfile({
                         student_id: studentProfile?.student_id || 'S-' + Date.now().toString().slice(-6),
                         full_name: profileForm.full_name,
                         register_number: profileForm.register_number,
                         hostel_name: profileForm.hostel_name,
                         room_number: profileForm.room_number,
                         phone_number: profileForm.phone_number
                       });
                       alert('Profile updated successfully!');
                     }}
                     className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all"
                   >
                     Update Profile Info
                   </button>
                </div>
             </section>

             {/* Logout button */}
             <button 
               onClick={onLogout}
               className="w-full py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-black rounded-2xl text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
             >
               <LogOut className="w-4 h-4" /> End Security Session
             </button>
          </div>
        )}
      </main>

      {/* Floating Detailed View Overlay Modal - Recreates the pizza details design screen in the reference! */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-300">
          <div 
            className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-t-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image box */}
            <div className="h-48 sm:h-64 relative bg-gray-100 shrink-0">
              <img src={selectedMeal.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setSelectedMeal(null)}
                className="absolute top-5 right-5 w-10 h-10 bg-black/45 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-950 shadow-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" /> 4.9 (180+ reviews)
              </div>
            </div>

            {/* Details info */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedMeal.item_name}</h3>
                    {selectedMeal.is_veg === false ? (
                      <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Non-Veg</span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Veg</span>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Available Fresh • Block A</p>
                </div>
                <p className="text-2xl font-black text-slate-950 leading-none">₹{selectedMeal.price}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</h4>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  {selectedMeal.description || 'Preorder this chef-made campus specialty! Prepared with fresh premium ingredients on location in our hygiene-certified canteen stalls.'}
                </p>
              </div>

              {/* Prep stats indicators */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Prep Time</p>
                    <p className="text-[11px] font-black text-slate-900 mt-1">15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</p>
                    <p className="text-[11px] font-black text-slate-900 mt-1 capitalize">{selectedMeal.category}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Picker & Confirm Add */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center bg-slate-100 rounded-2xl border border-slate-200/50 p-1.5">
                  <button 
                    onClick={() => setSelectedMealQty(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-50 active:scale-90 shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-black text-sm text-slate-950">{selectedMealQty}</span>
                  <button 
                    onClick={() => setSelectedMealQty(prev => prev + 1)}
                    className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-50 active:scale-90 shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddFromDetail}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-all"
                >
                  Confirm & Add (₹{selectedMeal.price * selectedMealQty})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zomato-style Floating Bottom Cart Bar */}
      {cart.length > 0 && activeTab === 'home' && (
        <div className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-slate-900 text-white rounded-3xl p-3 shadow-2xl z-40 flex items-center justify-between animate-in slide-in-from-bottom-5 border border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-xs">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'} Added
              </span>
              <span className="text-sm font-black text-white tracking-tight">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('cart')}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black px-6 py-3 rounded-2xl text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            Confirm Order <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Bottom Navigation Bar - Displayed on all tabs including Settings */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-full py-2 px-3 shadow-xl flex items-center justify-around z-[60] transition-colors duration-300">
        {[
          { tab: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
          { tab: 'orders', icon: <Utensils className="w-5 h-5" />, label: 'Order' },
          { tab: 'cart', icon: <ShoppingCart className="w-5 h-5" />, label: 'Cart' },
          { tab: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
        ].map((item) => {
          const isActive = activeTab === item.tab || (item.tab === 'orders' && activeTab === 'history') || (item.tab === 'settings' && isSettingsOpen);
          const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

          if (isActive) {
            return (
              <button
                key={item.tab}
                onClick={() => navigateTo(item.tab as StudentTab)}
                className="bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-slate-100 font-extrabold px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-sm"
              >
                <div className="relative">
                  {item.icon}
                  {item.tab === 'cart' && totalCartItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black capitalize tracking-tight">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.tab}
              onClick={() => navigateTo(item.tab as StudentTab)}
              className="flex flex-col items-center justify-center gap-0.5 relative py-1 px-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <div className="relative">
                {item.icon}
                {item.tab === 'cart' && totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-tight capitalize mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Popups and Modals */}
      {showPlacedPopup && (
        <OrderPlacedPopup 
          onClose={handlePopupClose} 
          orderCode={orders[0]?.order_code || '9999'} 
        />
      )}

      {/* Profile Camera Photo Capture Modal */}
      <CameraCaptureModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraPhotoCapture}
      />

      {/* App Settings Modal (Full Screen Page) */}
      <SettingsModal 
        isOpen={isSettingsOpen || activeTab === 'settings'}
        onClose={() => {
          setIsSettingsOpen(false);
          if (activeTab === 'settings') {
            setActiveTab('home');
          }
        }}
        user={user}
        menu={menu}
        onOpenCamera={() => setIsCameraOpen(true)}
        permission={permission}
        onRequestPermission={requestNotificationPermission}
        studentProfile={studentProfile}
        onUpdateProfile={onUpdateProfile}
        onLogout={onLogout}
        onNavigateToTab={(tab) => setActiveTab(tab as StudentTab)}
        vegPreference={dietaryFilter}
        onUpdateVegPreference={(pref) => setDietaryFilter(pref)}
      />

      {/* Printable Receipt Modal */}
      <StudentReceiptModal 
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Cancel Order Confirmation Modal */}
      <CancelOrderModal 
        isOpen={!!cancellingOrderId}
        order={orders.find(o => o.id === cancellingOrderId) || null}
        onClose={() => setCancellingOrderId(null)}
        onConfirmCancel={handleConfirmCancelOrder}
      />

      {/* High-Fidelity Cashfree Payments Checkout Modal */}
      {isCashfreeModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-emerald-100">Secured by</p>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                    <span className="text-emerald-300">cashfree</span> payments
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCashfreeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-extrabold">Order ID</p>
                  <p className="text-sm font-bold font-mono">CF_{cashfreeModalOrderCode || 'T2M_9831'}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-extrabold">Amount</p>
                  <p className="text-2xl font-black">₹{cashfreeModalAmount}</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-gray-500 font-bold dark:text-slate-400">{cashfreeModalDescription || 'Campus Meal Reservation Payment'}</p>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-gray-100 dark:border-slate-800">
                {(['upi', 'card', 'netbanking'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setCashfreeSelectedMethod(method)}
                    className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      cashfreeSelectedMethod === method
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Net Bank'}
                  </button>
                ))}
              </div>

              {/* Selection view */}
              <div className="space-y-4">
                {cashfreeSelectedMethod === 'upi' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Popular UPI Apps</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                        <button
                          key={app}
                          onClick={() => {
                            setCashfreePaymentLoading(true);
                            setTimeout(() => {
                              setCashfreePaymentLoading(false);
                              setIsCashfreeModalOpen(false);
                              cashfreeModalCallback(`cf_pay_${Math.random().toString(36).substr(2, 9)}`);
                            }, 1200);
                          }}
                          className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-2.5 transition-all text-left group"
                        >
                          <div className="w-7 h-7 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-black text-[10px] text-emerald-600">
                            UPI
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{app}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cashfreeSelectedMethod === 'card' && (
                  <div className="space-y-3.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enter Card Details</p>
                    <div className="space-y-2.5">
                      <input 
                        type="text" 
                        placeholder="Card Number" 
                        defaultValue="4315 9821 7731 0924"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          defaultValue="12/29"
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-center"
                        />
                        <input 
                          type="password" 
                          placeholder="CVV" 
                          defaultValue="***"
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {cashfreeSelectedMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Popular Indian Banks</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                        <button
                          key={bank}
                          onClick={() => {
                            setCashfreePaymentLoading(true);
                            setTimeout(() => {
                              setCashfreePaymentLoading(false);
                              setIsCashfreeModalOpen(false);
                              cashfreeModalCallback(`cf_pay_${Math.random().toString(36).substr(2, 9)}`);
                            }, 1200);
                          }}
                          className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between transition-all font-bold text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span>{bank}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <button
                disabled={cashfreePaymentLoading}
                onClick={() => {
                  setCashfreePaymentLoading(true);
                  setTimeout(() => {
                    setCashfreePaymentLoading(false);
                    setIsCashfreeModalOpen(false);
                    cashfreeModalCallback(`cf_pay_${Math.random().toString(36).substr(2, 9)}`);
                  }, 1500);
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/80 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-600/10"
              >
                {cashfreePaymentLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    Pay ₹{cashfreeModalAmount} securely
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% PCI-DSS compliant payment gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
