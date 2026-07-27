import React, { useState } from 'react';
import { Sparkles, Plus, ShoppingBag, Check, Star, Heart, Flame, Info, ChevronRight } from 'lucide-react';
import { MenuItem } from '../types';

interface MilkshakesBannerProps {
  onAddToCart?: (item: MenuItem, qty?: number) => void;
  onOpenDetail?: (item: MenuItem) => void;
  cartItems?: { menu_item_id: string; quantity: number }[];
}

export const MILKSHAKE_ITEMS: (MenuItem & { emoji: string; tag: string; bgAccent: string })[] = [
  {
    id: 'm12',
    canteen_id: 's2',
    item_name: 'Rose Milk',
    price: 40,
    category: 'milkshakes',
    availability: true,
    is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800',
    stock_online: 50,
    stock_offline: 100,
    low_stock_threshold: 10,
    description: 'Light pink milkshake infused with pure damask rose syrup, garnished with edible rose petals, and topped with silky whipped cream.',
    emoji: '🌹',
    tag: 'Floral & Refreshing',
    bgAccent: 'from-pink-500/20 to-rose-900/40'
  },
  {
    id: 'm13',
    canteen_id: 's2',
    item_name: 'Oreo Milkshake',
    price: 60,
    category: 'milkshakes',
    availability: true,
    is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800',
    stock_online: 50,
    stock_offline: 100,
    low_stock_threshold: 10,
    description: 'Ultra-creamy cookies-and-cream shake blended with dark chocolate sandwich cookies, topped with crushed Oreo crunch and fluffy whipped cream.',
    emoji: '🍪',
    tag: 'Bestseller',
    bgAccent: 'from-amber-900/30 to-stone-900/50'
  },
  {
    id: 'm14',
    canteen_id: 's2',
    item_name: 'Chocolate Milkshake',
    price: 80,
    category: 'milkshakes',
    availability: true,
    is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=800',
    stock_online: 50,
    stock_offline: 100,
    low_stock_threshold: 10,
    description: 'Decadent Belgian chocolate shake with dark chocolate syrup drizzle, Dutch cocoa powder dusting, artisanal chocolate curls, and thick whipped cream.',
    emoji: '🍫',
    tag: 'Rich & Decadent',
    bgAccent: 'from-amber-950/40 to-yellow-950/60'
  },
  {
    id: 'm15',
    canteen_id: 's2',
    item_name: 'Vanilla Milkshake',
    price: 70,
    category: 'milkshakes',
    availability: true,
    is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=800',
    stock_online: 50,
    stock_offline: 100,
    low_stock_threshold: 10,
    description: 'Classic Madagascar bourbon vanilla bean shake topped with a scoop of real vanilla bean ice cream, golden whipped cream, and a glossy maraschino cherry.',
    emoji: '🍦',
    tag: 'Classic Gourmet',
    bgAccent: 'from-amber-100/20 to-amber-900/30'
  }
];

export const MilkshakesBanner: React.FC<MilkshakesBannerProps> = ({
  onAddToCart,
  onOpenDetail,
  cartItems = []
}) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'cards'>('banner');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCartQuantity = (id: string) => {
    const found = cartItems.find(i => i.menu_item_id === id);
    return found ? found.quantity : 0;
  };

  return (
    <section className="w-full my-6 font-sans">
      {/* Container with cinematic glow */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 border border-amber-900/30 shadow-2xl shadow-amber-950/20 text-white">
        
        {/* Soft Blurred Warm Café Background with Ambient Cinematic Lighting */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity bg-cover bg-center pointer-events-none filter blur-[1px]"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1600')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 z-0" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon & Title Area */}
        <div className="relative z-10 px-6 pt-7 pb-4 sm:px-10 sm:pt-9 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/15">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md shadow-amber-500/20">
                <Sparkles className="w-3 h-3 fill-slate-950" /> Luxury Café Menu
              </span>
              <span className="bg-white/10 text-amber-200/90 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-400/20 uppercase tracking-widest">
                Handcrafted Daily
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-rose-200 drop-shadow-sm font-serif">
              Milkshakes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl leading-relaxed">
              Indulge in our ultra-realistic, thick gourmet shakes made with farm-fresh milk, premium ice cream, rich syrup drizzles, and hand-garnished toppings.
            </p>
          </div>

          {/* Quick View Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-amber-500/20 p-1 rounded-2xl backdrop-blur-md self-start md:self-auto">
            <button
              onClick={() => setActiveTab('banner')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'banner'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              📷 4K Showcase Banner
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'cards'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              🏷️ Menu Grid
            </button>
          </div>
        </div>

        {/* TAB 1: ULTRA-REALISTIC 4K ADVERTISEMENT BANNER SHOWCASE */}
        {activeTab === 'banner' && (
          <div className="relative z-10 p-6 sm:p-8 space-y-8">
            {/* Wooden Table Backdrop Display with 4 Milkshakes */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-stone-900/90 shadow-2xl p-6 sm:p-8 bg-cover bg-center"
                 style={{ backgroundImage: `linear-gradient(to bottom, rgba(28,25,23,0.85), rgba(28,25,23,0.95)), url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200')` }}
            >
              {/* Subtle Wooden Table Texture Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="text-center mb-6 max-w-md mx-auto">
                <span className="text-amber-400 font-extrabold text-[11px] tracking-[0.3em] uppercase block mb-1">
                  — Signature Collection —
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                  Four Flavors of Pure Indulgence
                </h3>
              </div>

              {/* 4 Milkshakes Horizontal Presentation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                {MILKSHAKE_ITEMS.map((item) => {
                  const qty = getCartQuantity(item.id);
                  const isLiked = !!likedItems[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenDetail && onOpenDetail(item)}
                      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
                    >
                      {/* Top Badges */}
                      <div className="flex justify-between items-center z-20 mb-2">
                        <span className="bg-slate-950/80 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-amber-500/20 flex items-center gap-1">
                          {item.emoji} {item.tag}
                        </span>
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className={`p-2 rounded-full backdrop-blur-md transition-all ${
                            isLiked
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-950/60 text-slate-300 hover:text-rose-400'
                          }`}
                          title="Favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Glass Shake Realistic Photo Frame */}
                      <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden my-1 bg-slate-950 group-hover:scale-[1.02] transition-transform duration-300 shadow-inner">
                        <img
                          src={item.imageUrl}
                          alt={item.item_name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-105 contrast-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-75" />
                        
                        {/* Price Badge Overlay */}
                        <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow-lg shadow-amber-500/30 tracking-tight">
                          Rs. {item.price}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="mt-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                              {item.item_name}
                            </h4>
                            <div className="flex items-center text-amber-400 text-[10px] font-black shrink-0 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" /> 4.9
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight mt-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Add to Cart Action */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                          <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Freshly Blended
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddToCart) onAddToCart(item, 1);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                              qty > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
                            }`}
                          >
                            {qty > 0 ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                <span>In Cart ({qty})</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                                <span>Add • Rs. {item.price}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quote Banner */}
              <div className="mt-8 pt-6 border-t border-amber-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200/80 font-medium">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Ultra-thick, chilled to perfection & prepared instantly at the counter!</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  * Served in 350ml glass with fresh whipped cream & toppings
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLEAN DETAILED MENU CARDS VIEW */}
        {activeTab === 'cards' && (
          <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {MILKSHAKE_ITEMS.map((item) => {
              const qty = getCartQuantity(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onOpenDetail && onOpenDetail(item)}
                  className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/50 rounded-2xl p-4 flex gap-4 transition-all hover:bg-slate-900 group cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.item_name}
                    className="w-28 h-28 rounded-xl object-cover object-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-amber-100 group-hover:text-amber-300">
                          {item.emoji} {item.item_name}
                        </h4>
                        <span className="text-amber-400 font-black text-sm">
                          Rs. {item.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-amber-300/80 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.tag}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(item, 1);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                        {qty > 0 ? `Added (${qty})` : 'Add to Order'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
