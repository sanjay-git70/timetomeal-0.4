
import React, { useState, useEffect, useCallback } from 'react';
import { User, Order, AppRole, MenuItem, StudentProfile, CanteenProfile, AdminProfile } from './types';
import Login from './components/Login';
import StudentView from './components/StudentView';
import StaffView from './components/StaffView';
import AdminView from './components/AdminView';
import { MENU_ITEMS } from './constants';
import { Coffee, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Data from LocalStorage or Constants
  useEffect(() => {
    const savedOrders = localStorage.getItem('hb_orders');
    const savedMenu = localStorage.getItem('hb_menu');
    const savedUser = localStorage.getItem('hb_current_user');

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedMenu) {
      try {
        const parsed: MenuItem[] = JSON.parse(savedMenu);
        const existingIds = new Set(parsed.map(i => i.id));
        const existingNames = new Set(parsed.map(i => i.item_name.toLowerCase()));
        const missingDefaultItems = MENU_ITEMS.filter(i => !existingIds.has(i.id) && !existingNames.has(i.item_name.toLowerCase()));
        setMenu([...parsed, ...missingDefaultItems]);
      } catch (e) {
        setMenu(MENU_ITEMS);
      }
    } else {
      setMenu(MENU_ITEMS);
    }

    if (savedUser) setUser(JSON.parse(savedUser));
    
    setLoading(false);
  }, []);

  // Persistence side effects
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hb_orders', JSON.stringify(orders));
      localStorage.setItem('hb_menu', JSON.stringify(menu));
      if (user) localStorage.setItem('hb_current_user', JSON.stringify(user));
      else localStorage.removeItem('hb_current_user');
    }
  }, [orders, menu, user, loading]);

  const updateOrders = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
  }, []);

  const updateMenu = useCallback((newMenu: MenuItem[]) => {
    setMenu(newMenu);
  }, []);

  const handleUpdateProfile = (profile: any) => {
    if (!user) return;
    const updatedUser = { ...user, profile: { ...user.profile, ...profile } };
    setUser(updatedUser as User);
    
    // Update users in "database" (localStorage simulated)
    const allUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex > -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('hb_users', JSON.stringify(allUsers));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hb_current_user');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="animate-bounce bg-emerald-600 p-5 rounded-3xl shadow-2xl">
        <Coffee className="text-white w-10 h-10" />
      </div>
    </div>
  );

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Admin Top Bar Overlay */}
      {user.role === 'admin' && (
        <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl shadow-lg bg-gray-900 dark:bg-emerald-950">
              <Shield className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-gray-950 dark:text-white text-base leading-none">Master Console</h1>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.15em] mt-1">Full System Authority</span>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto">
        {user.role === 'student' && (
          <StudentView 
            user={user} 
            orders={orders} 
            menu={menu} 
            onUpdateOrders={updateOrders} 
            onLogout={handleLogout} 
            onUpdateProfile={handleUpdateProfile} 
          />
        )}
        {user.role === 'staff' && (
          <StaffView 
            user={user} 
            orders={orders} 
            menu={menu} 
            onUpdateOrders={updateOrders} 
            onUpdateMenu={updateMenu} 
            onLogout={handleLogout}
          />
        )}
        {user.role === 'admin' && (
          <div className="max-w-screen-2xl mx-auto p-6 md:p-10">
            <AdminView 
              user={user} 
              orders={orders} 
              menu={menu} 
              onUpdateOrders={updateOrders} 
              onLogout={handleLogout}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
