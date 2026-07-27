
import { MenuItem, Shop } from './types';

export const CANTEEN_INFO = {
  name: 'RAGA PVT LTD',
  address: 'S USMAN ROAD, T. NAGAR, CHENNAI, TAMIL NADU.',
  phone: '044 258636222',
  gstin: '33AAAGP0685F1ZH'
};

export const SHOPS: Shop[] = [
  { id: 's1', name: 'Main Canteen', image: 'https://images.unsplash.com/photo-1567529684892-0f296707f2a4?auto=format&fit=crop&q=80&w=400', location: 'Ground Floor, Block A' },
  { id: 's2', name: 'Snack Shack', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=400', location: 'Near Hostel Gate' }
];

// Fix: Added missing stock and threshold properties to comply with MenuItem interface
export const MENU_ITEMS: MenuItem[] = [
  { 
    id: 'm1', canteen_id: 's1', item_name: 'Masala Dosa', price: 45, category: 'breakfast', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    stock_online: 50, stock_offline: 100, low_stock_threshold: 10,
    description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutneys.'
  },
  { 
    id: 'm2', canteen_id: 's1', item_name: 'Veg Thali', price: 85, category: 'lunch', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400',
    stock_online: 30, stock_offline: 60, low_stock_threshold: 5,
    description: 'Complete meal with rice, roti, paneer butter masala, dal, salad, and sweet.'
  },
  { 
    id: 'm3', canteen_id: 's2', item_name: 'Vegetable Sandwich', price: 35, category: 'snacks', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    stock_online: 40, stock_offline: 80, low_stock_threshold: 8,
    description: 'Fresh bread slices packed with crunchy cucumber, tomato, potato, and green chutney.'
  },
  { 
    id: 'm4', canteen_id: 's2', item_name: 'Cold Coffee', price: 40, category: 'snacks', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=400',
    stock_online: 25, stock_offline: 50, low_stock_threshold: 5,
    description: 'Chilled thick blended coffee topped with chocolate sauce.'
  },
  { 
    id: 'm5', canteen_id: 's2', item_name: 'Chicken Sandwich', price: 60, category: 'snacks', availability: true, is_veg: false,
    imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&q=80&w=400',
    stock_online: 35, stock_offline: 70, low_stock_threshold: 8,
    description: 'Grilled sandwich packed with spiced shredded chicken, crispy lettuce, tomato, and creamy garlic mayonnaise.'
  },
  { 
    id: 'm6', canteen_id: 's2', item_name: 'Chicken Nuggets', price: 50, category: 'snacks', availability: true, is_veg: false,
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400',
    stock_online: 40, stock_offline: 80, low_stock_threshold: 10,
    description: 'Golden crispy chicken nuggets fried to perfection and served with savory dip.'
  },
  { 
    id: 'm7', canteen_id: 's1', item_name: 'Chicken Wings', price: 50, category: 'snacks', availability: true, is_veg: false,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400',
    stock_online: 30, stock_offline: 60, low_stock_threshold: 5,
    description: 'Juicy fried chicken wings tossed in a flavorful barbecue seasoning mix.'
  },
  { 
    id: 'm8', canteen_id: 's1', item_name: 'Chicken Biryani', price: 120, category: 'lunch', availability: true, is_veg: false,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    stock_online: 30, stock_offline: 60, low_stock_threshold: 8,
    description: 'Aromatic basmati rice slow-cooked with tender marinated chicken, authentic spices, and served with fresh raita.'
  },
  { 
    id: 'm9', canteen_id: 's1', item_name: 'Chicken Fried Rice', price: 100, category: 'lunch', availability: true, is_veg: false,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400',
    stock_online: 35, stock_offline: 70, low_stock_threshold: 8,
    description: 'Flavorful wok-tossed basmati rice with shredded chicken, scramble egg, spring onions, and light soy sauce.'
  },
  { 
    id: 'm10', canteen_id: 's1', item_name: 'Curd Rice', price: 40, category: 'lunch', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
    stock_online: 40, stock_offline: 80, low_stock_threshold: 10,
    description: 'Comforting creamy curd rice tempered with mustard seeds, curry leaves, green chillies, and ginger.'
  },
  { 
    id: 'm11', canteen_id: 's1', item_name: 'Tomato Rice', price: 50, category: 'lunch', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=400',
    stock_online: 30, stock_offline: 60, low_stock_threshold: 8,
    description: 'Tangy South Indian style rice cooked with ripe tomatoes, roasted spices, curry leaves, and crunchy peanuts.'
  },
  {
    id: 'm12', canteen_id: 's2', item_name: 'Rose Milk', price: 40, category: 'milkshakes', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800',
    stock_online: 50, stock_offline: 100, low_stock_threshold: 10,
    description: 'Light pink milkshake with rose syrup drizzle, delicate edible rose petals, and creamy whipped cream topping.'
  },
  {
    id: 'm13', canteen_id: 's2', item_name: 'Oreo Milkshake', price: 60, category: 'milkshakes', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800',
    stock_online: 50, stock_offline: 100, low_stock_threshold: 10,
    description: 'Thick cookies-and-cream shake topped with crushed crunchy Oreo cookies, chocolate drizzle, and whipped cream.'
  },
  {
    id: 'm14', canteen_id: 's2', item_name: 'Chocolate Milkshake', price: 80, category: 'milkshakes', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=800',
    stock_online: 50, stock_offline: 100, low_stock_threshold: 10,
    description: 'Rich chocolate shake with chocolate syrup drizzle, fine cocoa powder dusting, chocolate curls, and whipped cream.'
  },
  {
    id: 'm15', canteen_id: 's2', item_name: 'Vanilla Milkshake', price: 70, category: 'milkshakes', availability: true, is_veg: true,
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=800',
    stock_online: 50, stock_offline: 100, low_stock_threshold: 10,
    description: 'Creamy Madagascar vanilla shake topped with a scoop of vanilla ice cream, whipped cream, and a glazed cherry.'
  }
];

export const CANCEL_WINDOW_MS = 20 * 60 * 1000;
