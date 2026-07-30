
declare global {
  interface Window {
    Razorpay: any;
  }
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'online' | 'walk-in';
export type PaymentMethod = 'QR' | 'cash' | 'UPI' | 'Razorpay';

export interface Shop {
  id: string;
  name: string;
  image: string;
  location: string;
}

export interface MenuItem {
  id: string;
  canteen_id: string;
  item_name: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'snacks' | 'milkshakes' | 'beverages' | string;
  availability: boolean;
  imageUrl: string;
  stock_online: number;
  stock_offline: number;
  low_stock_threshold: number;
  description?: string;
  is_veg?: boolean;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

export interface StudentProfile {
  student_id: string;
  full_name: string;
  register_number: string;
  hostel_name: string;
  room_number: string;
  phone_number: string;
  photo_url?: string;
  google_id?: string;
  college_id?: string;
  college_name?: string;
  roll_number?: string;
  mobile_number?: string;
  department?: string;
  year?: string;
  section?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PrinterSettings {
  printer_name: string;
  printer_type: 'thermal' | 'normal';
  paper_size: '58mm' | '80mm';
  print_speed: 'low' | 'medium' | 'high';
  auto_cut: boolean;
  print_header_text: string;
  print_footer_text: string;
  show_logo: boolean;
  show_datetime: boolean;
  show_ordertype: boolean;
  show_prices: boolean;
  font_size: 'small' | 'medium' | 'large';
}

export interface PaymentSettings {
  qr_image_url?: string;
  qr_enabled: boolean;
  default_payment_mode: 'cash' | 'online' | 'mixed';
}

export interface CanteenProfile {
  canteen_id: string;
  canteen_name: string;
  owner_name: string;
  address: string;
  contact_number: string;
  email: string;
  logo_url?: string;
  is_online: boolean;
  status: 'active' | 'inactive';
  operating_hours: {
    open: string;
    close: string;
  };
  printer_settings: PrinterSettings;
  payment_settings: PaymentSettings;
  notification_settings?: {
    low_stock_threshold: number;
    enable_pwa_notifications: boolean;
  };
}

export interface AdminProfile {
  admin_id: string;
  full_name: string;
  roll_number: string;
  email: string;
}

export interface Payment {
  id?: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_status: 'partial' | 'completed';
  transaction_reference?: string;
  paid_amount: number;
}

export interface Order {
  id: string;
  student_id: string | null;
  canteen_id: string;
  total_amount: number;
  paid_amount: number;
  payment_method?: string;
  payment_status?: 'paid' | 'advance_paid' | 'pending_cash_payment';
  order_status: OrderStatus;
  order_type: OrderType;
  order_code: string;
  created_at: string;
  // Relational data
  order_items?: OrderItem[];
  payments?: Payment[];
  student_details?: StudentProfile;
  canteen_details?: CanteenProfile;
}

export type AppRole = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  role: AppRole;
  password?: string;
  profile?: StudentProfile | CanteenProfile | AdminProfile;
  last_login?: string;
}
