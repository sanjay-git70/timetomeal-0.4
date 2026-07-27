import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MenuItem, Order } from '../types';
import { 
  Search, Plus, Minus, MoreVertical, Edit, Trash2, Copy, BarChart3, 
  X, Check, AlertTriangle, Filter, Sparkles, Image, CheckCircle2, 
  TrendingUp, Clock, Calendar, DollarSign, ShoppingBag, Eye, EyeOff, Flame,
  ChevronDown, Tag, Utensils, Coffee, Pizza, Moon, Sun, Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface MenuCatalogViewProps {
  menu: MenuItem[];
  orders: Order[];
  onUpdateMenu: (updatedMenu: MenuItem[]) => void;
}

const PRESET_IMAGES = [
  { name: 'Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400' },
  { name: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
  { name: 'Coffee', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400' },
  { name: 'Paneer', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400' },
  { name: 'Thali', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }
];

// Rich Business Food Categories
const CATEGORY_PRESETS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', desc: 'Idli, Dosa, Poha, Paratha (7 AM - 11 AM)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'lunch', label: 'Lunch', icon: '🍲', desc: 'Meals, Thali, Rice Bowls (12 PM - 3 PM)', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: 'dinner', label: 'Dinner', icon: '🌙', desc: 'Roti, Curry, Biryani (7 PM - 10 PM)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'snacks', label: 'Snacks & Fast Food', icon: '🍕', desc: 'Samosa, Burgers, Rolls (All Day)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'milkshakes', label: 'Gourmet Milkshakes', icon: '🥤', desc: 'Rose Milk, Oreo, Chocolate & Vanilla Shakes', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'beverage', label: 'Beverages', icon: '🧃', desc: 'Coffee, Tea, Fresh Juices, Drinks', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'dessert', label: 'Desserts & Sweets', icon: '🍨', desc: 'Ice Cream, Gulab Jamun, Pastries', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { id: 'combo', label: 'Combos & Thali', icon: '🍱', desc: 'Value Combo Packs & Executive Thali', color: 'bg-purple-50 text-purple-800 border-purple-200' },
];

const MenuCatalogView: React.FC<MenuCatalogViewProps> = ({ menu, orders, onUpdateMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Menu item action dropdown state
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [analyticsItem, setAnalyticsItem] = useState<MenuItem | null>(null);

  // Custom Category Selection States
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    item_name: '',
    price: 50,
    category: 'breakfast',
    availability: true,
    is_veg: true,
    stock_offline: 50,
    stock_online: 20,
    low_stock_threshold: 10,
    imageUrl: PRESET_IMAGES[0].url,
    description: ''
  });

  // Extract all unique categories present in the current menu
  const availableCategories = useMemo(() => {
    const defaultIds = CATEGORY_PRESETS.map(c => c.id);
    const existingFromMenu = menu.map(m => m.category).filter(Boolean);
    const combined = Array.from(new Set([...defaultIds, ...existingFromMenu]));
    return combined;
  }, [menu]);

  // Filtered Menu Items
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      const matchesDiet = 
        dietFilter === 'all' ? true :
        dietFilter === 'veg' ? item.is_veg === true :
        item.is_veg === false;

      const matchesStock = 
        stockFilter === 'all' ? true :
        stockFilter === 'low' ? item.stock_offline <= (item.low_stock_threshold || 10) && item.stock_offline > 0 :
        item.stock_offline <= 0;

      return matchesSearch && matchesCategory && matchesDiet && matchesStock;
    });
  }, [menu, searchTerm, categoryFilter, dietFilter, stockFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      item_name: '',
      price: 50,
      category: 'breakfast',
      availability: true,
      is_veg: true,
      stock_offline: 50,
      stock_online: 20,
      low_stock_threshold: 10,
      imageUrl: PRESET_IMAGES[0].url,
      description: ''
    });
    setIsCategoryPickerOpen(false);
    setIsAddingCustomCategory(false);
    setCustomCategoryInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsCategoryPickerOpen(false);
    setIsAddingCustomCategory(false);
    setCustomCategoryInput('');
    setIsModalOpen(true);
    setActiveMenuDropdown(null);
  };

  // Duplicate Item
  const handleDuplicateItem = (item: MenuItem) => {
    const newItem: MenuItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 10),
      item_name: `${item.item_name} (Copy)`
    };
    onUpdateMenu([...menu, newItem]);
    setActiveMenuDropdown(null);
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this dish from the catalog?')) {
      onUpdateMenu(menu.filter(m => m.id !== itemId));
    }
    setActiveMenuDropdown(null);
  };

  // Toggle Daily Availability
  const handleToggleDailyAvailability = (itemId: string) => {
    const updated = menu.map(m => {
      if (m.id === itemId) {
        return { ...m, availability: !m.availability };
      }
      return m;
    });
    onUpdateMenu(updated);
  };

  // Adjust Stock Quantity (+ or -)
  const handleAdjustStock = (itemId: string, delta: number) => {
    const updated = menu.map(m => {
      if (m.id === itemId) {
        const newStock = Math.max(0, (m.stock_offline || 0) + delta);
        return { 
          ...m, 
          stock_offline: newStock,
          availability: newStock === 0 ? false : m.availability 
        };
      }
      return m;
    });
    onUpdateMenu(updated);
  };

  // Save Dish (Add or Edit)
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name || !formData.price) return;

    const finalCategory = isAddingCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim().toLowerCase()
      : (formData.category || 'breakfast');

    const updatedFormData = {
      ...formData,
      category: finalCategory as any
    };

    if (editingItem) {
      // Edit existing
      const updated = menu.map(m => m.id === editingItem.id ? { ...m, ...updatedFormData } as MenuItem : m);
      onUpdateMenu(updated);
    } else {
      // Create new
      const newItem: MenuItem = {
        ...updatedFormData,
        id: Math.random().toString(36).substring(2, 10),
        canteen_id: 'c1',
        availability: (formData.stock_offline || 0) > 0 ? (formData.availability ?? true) : false
      } as MenuItem;
      onUpdateMenu([...menu, newItem]);
    }

    setIsModalOpen(false);
  };

  // Select category helper
  const handleSelectCategory = (catId: string) => {
    setFormData(prev => ({ ...prev, category: catId as any }));
    setIsCategoryPickerOpen(false);
    setIsAddingCustomCategory(false);
  };

  // Analytics Computation for selected dish
  const analyticsData = useMemo(() => {
    if (!analyticsItem) return null;

    let totalQuantity = 0;
    let totalRevenue = 0;
    let todayQuantity = 0;
    let todayRevenue = 0;
    let weeklyQuantity = 0;
    let weeklyRevenue = 0;
    let monthlyQuantity = 0;
    let monthlyRevenue = 0;
    let lastOrderedDate: string | null = null;

    const now = new Date();
    const todayStr = now.toDateString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const chartMap: { [key: string]: { day: string; sales: number; revenue: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      chartMap[d.toDateString()] = { day: dayLabel, sales: 0, revenue: 0 };
    }

    orders.forEach(order => {
      if (order.order_status === 'cancelled') return;
      const orderDate = new Date(order.created_at);

      order.order_items?.forEach(item => {
        if (item.menu_item_id === analyticsItem.id || item.item_name === analyticsItem.item_name) {
          totalQuantity += item.quantity;
          const itemRev = item.price * item.quantity;
          totalRevenue += itemRev;

          if (!lastOrderedDate || orderDate > new Date(lastOrderedDate)) {
            lastOrderedDate = order.created_at;
          }

          if (orderDate.toDateString() === todayStr) {
            todayQuantity += item.quantity;
            todayRevenue += itemRev;
          }

          if (orderDate >= sevenDaysAgo) {
            weeklyQuantity += item.quantity;
            weeklyRevenue += itemRev;
          }

          if (orderDate >= thirtyDaysAgo) {
            monthlyQuantity += item.quantity;
            monthlyRevenue += itemRev;
          }

          const key = orderDate.toDateString();
          if (chartMap[key]) {
            chartMap[key].sales += item.quantity;
            chartMap[key].revenue += itemRev;
          }
        }
      });
    });

    const chartData = Object.values(chartMap);
    const avgOrdersPerDay = (weeklyQuantity / 7).toFixed(1);

    return {
      totalQuantity,
      totalRevenue,
      todayQuantity,
      todayRevenue,
      weeklyQuantity,
      weeklyRevenue,
      monthlyQuantity,
      monthlyRevenue,
      avgOrdersPerDay,
      lastOrderedDate,
      bestSellingSlot: 'Lunch (12:00 PM - 2:00 PM)',
      chartData
    };
  }, [analyticsItem, orders]);

  // Current selected category object
  const selectedCategoryObj = CATEGORY_PRESETS.find(c => c.id === formData.category) || {
    id: formData.category || 'custom',
    label: (formData.category || 'custom').toUpperCase(),
    icon: '🍽️',
    desc: 'Custom Canteen Specialty',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Top Header & Search / Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Menu Catalog & Inventory
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {menu.length} Dishes
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage canteen dishes, stock limits, daily menu availability, and dish analytics.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Dish
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          
          {/* Search Box */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dish name, description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter with Styled Select */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer appearance-none transition-all"
              >
                <option value="all">🍽️ All Categories ({menu.length})</option>
                {availableCategories.map(cat => {
                  const preset = CATEGORY_PRESETS.find(p => p.id === cat);
                  const icon = preset ? preset.icon : '🍴';
                  const label = preset ? preset.label : cat.toUpperCase();
                  const count = menu.filter(m => m.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {icon} {label} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Veg / Non-Veg Toggle Filter */}
          <div className="md:col-span-2 flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDietFilter('all')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                dietFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                dietFilter === 'veg' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                dietFilter === 'non-veg' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500 hover:text-red-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
            </button>
          </div>

          {/* Stock Status Filter */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as any)}
                className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer appearance-none transition-all"
              >
                <option value="all">📦 All Stock Status</option>
                <option value="low">⚠️ Low Stock</option>
                <option value="out">❌ Out of Stock</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Dish Catalog Grid */}
      {filteredMenu.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No dishes match your filters</h3>
          <p className="text-xs text-slate-400">Try adjusting search keywords or category filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setDietFilter('all'); setStockFilter('all'); }}
            className="text-xs text-emerald-600 font-bold hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenu.map(item => {
            const isOutOfStock = (item.stock_offline || 0) <= 0;
            const isLowStock = !isOutOfStock && (item.stock_offline || 0) <= (item.low_stock_threshold || 10);
            const isVeg = item.is_veg !== false;
            const isTodayAvailable = item.availability && !isOutOfStock;

            const categoryPreset = CATEGORY_PRESETS.find(c => c.id === item.category);

            return (
              <div 
                key={item.id} 
                className={`bg-white border rounded-2xl p-3.5 shadow-xs flex flex-col justify-between transition-all relative ${
                  isOutOfStock ? 'border-red-200 bg-red-50/20' : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {/* Top Row: Category Badge & Actions */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    categoryPreset ? categoryPreset.color : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span>{categoryPreset ? categoryPreset.icon : '🍽️'}</span>
                    <span>{item.category}</span>
                  </span>

                  {/* Three-dot Dropdown Action Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuDropdown(activeMenuDropdown === item.id ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Product Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuDropdown === item.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-xs font-semibold">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit Product
                        </button>
                        <button
                          onClick={() => handleDuplicateItem(item)}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-indigo-600" /> Duplicate Product
                        </button>
                        <button
                          onClick={() => { setAnalyticsItem(item); setActiveMenuDropdown(null); }}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> View Analytics
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dish Image & Badges */}
                <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden relative mb-3">
                  <img 
                    src={item.imageUrl} 
                    alt={item.item_name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />

                  {/* Veg / Non-Veg Badge */}
                  <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                    isVeg ? 'bg-emerald-600' : 'bg-red-600'
                  }`}>
                    {isVeg ? 'Veg' : 'Non-Veg'}
                  </span>

                  {/* Daily Availability Badge Overlay */}
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs ${
                    isTodayAvailable ? 'bg-emerald-500/90 backdrop-blur-xs' : 'bg-slate-800/80 backdrop-blur-xs'
                  }`}>
                    {isTodayAvailable ? 'Today: On' : 'Today: Off'}
                  </span>

                  {/* Stock Alert Badge Overlays */}
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md">
                        Out of Stock
                      </span>
                    </div>
                  ) : isLowStock ? (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" /> Low Stock ({item.stock_offline})
                    </span>
                  ) : null}
                </div>

                {/* Dish Title & Price */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-xs truncate leading-snug" title={item.item_name}>
                      {item.item_name}
                    </h3>
                    <span className="text-emerald-600 font-extrabold text-sm shrink-0">₹{item.price}</span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                  )}
                </div>

                {/* Daily Availability Toggle Switch & Stock Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  
                  {/* Daily Availability Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      {isTodayAvailable ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      Daily Menu
                    </span>

                    <button
                      onClick={() => handleToggleDailyAvailability(item.id)}
                      disabled={isOutOfStock}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.availability ? 'bg-emerald-600' : 'bg-slate-300'
                      } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          item.availability ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Stock Quantity Controls */}
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200/70">
                    <span className="text-[11px] font-semibold text-slate-600 pl-1">
                      Stock: <span className={`font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>{item.stock_offline} Pcs</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustStock(item.id, -5)}
                        disabled={(item.stock_offline || 0) <= 0}
                        className="w-6 h-6 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-red-600 disabled:opacity-40 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                        title="Decrease stock (-5)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 10)}
                        className="w-6 h-6 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                        title="Increase stock (+10)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT DISH MODAL WITH ELEGANT CUSTOM CATEGORY SELECTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {editingItem ? 'Edit Product Details' : 'Add New Dish to Menu'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs font-medium">
              
              {/* Dish Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Dish Name *</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. Special Masala Dosa</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={formData.item_name || ''}
                  onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="80"
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock_offline ?? 50}
                    onChange={e => setFormData({ ...formData, stock_offline: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* RICH BUSINESS CATEGORY DROPDOWN & SELECTOR */}
              <div className="space-y-1.5 relative">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Food Category *
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Business Meal Timing</span>
                </label>

                {/* Custom Interactive Category Trigger Button */}
                {!isAddingCustomCategory ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-500 focus:outline-none transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                          {selectedCategoryObj.icon}
                        </span>
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block text-xs">
                            {selectedCategoryObj.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {selectedCategoryObj.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform duration-200 ${
                        isCategoryPickerOpen ? 'rotate-180 text-emerald-600' : ''
                      }`} />
                    </button>

                    {/* Quick Category Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {CATEGORY_PRESETS.slice(0, 5).map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectCategory(preset.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                            formData.category === preset.id 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Dropdown Menu Popup */}
                    {isCategoryPickerOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto">
                        <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Select Food Category
                        </div>
                        {CATEGORY_PRESETS.map(preset => {
                          const isSelected = formData.category === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectCategory(preset.id)}
                              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold' 
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base">{preset.icon}</span>
                                <div>
                                  <span className="text-xs font-bold block">{preset.label}</span>
                                  <span className="text-[10px] text-slate-400 block">{preset.desc}</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}

                        {/* Custom Category Option */}
                        <div className="border-t border-slate-100 pt-1 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCustomCategory(true);
                              setIsCategoryPickerOpen(false);
                            }}
                            className="w-full p-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Create Custom Category
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Custom Category Input Box */
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">Enter Custom Category Name</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomCategory(false)}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Cancel & Pick Preset
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Juices, South Indian, Sweets"
                      value={customCategoryInput}
                      onChange={e => setCustomCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Diet Type Switch */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Diet Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_veg: true })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.is_veg !== false ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_veg: false })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.is_veg === false ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Non-Vegetarian
                  </button>
                </div>
              </div>

              {/* Image URL & Quick Presets */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl || ''}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />

                {/* Presets Gallery */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">Or select a preset image:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className={`p-1 border rounded-xl shrink-0 transition-all cursor-pointer ${
                          formData.imageUrl === preset.url ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-[9px] font-bold block text-center text-slate-600 mt-0.5">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description, ingredients, portion size..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              {/* Daily Availability Checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availability_cb"
                  checked={formData.availability !== false}
                  onChange={e => setFormData({ ...formData, availability: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="availability_cb" className="font-bold text-slate-800 cursor-pointer">
                  Available in Today's Canteen Menu
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ANALYTICS MODAL */}
      {analyticsItem && analyticsData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 ease-out">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={analyticsItem.imageUrl} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{analyticsItem.item_name}</h2>
                    <span className="text-xs font-bold text-emerald-600">₹{analyticsItem.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Product Performance & Sales Analytics
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setAnalyticsItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Total Orders</span>
                <span className="text-lg font-extrabold text-emerald-900 mt-1 block">{analyticsData.totalQuantity} Pcs</span>
              </div>

              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Revenue</span>
                <span className="text-lg font-extrabold text-blue-900 mt-1 block">₹{analyticsData.totalRevenue.toFixed(2)}</span>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Avg/Day</span>
                <span className="text-lg font-extrabold text-amber-900 mt-1 block">{analyticsData.avgOrdersPerDay} Orders</span>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Weekly Sales</span>
                <span className="text-lg font-extrabold text-slate-900 mt-1 block">₹{analyticsData.weeklyRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  7-Day Sales Trend
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">Revenue (₹)</span>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Analytics Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium block">Best Selling Period</span>
                <span className="font-bold text-slate-800">{analyticsData.bestSellingSlot}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium block">Last Ordered Date</span>
                <span className="font-bold text-slate-800">
                  {analyticsData.lastOrderedDate 
                    ? new Date(analyticsData.lastOrderedDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : 'No recent orders'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAnalyticsItem(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Analytics
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MenuCatalogView;
