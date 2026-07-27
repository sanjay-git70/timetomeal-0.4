import { useEffect, useRef, useState, useCallback } from 'react';
import { Order, OrderStatus } from '../types';

export interface NotificationItem {
  id: string;
  orderId: string;
  orderCode: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'status_change' | 'system' | 'reminder';
}

export function useOrderNotifications(orders: Order[], currentUserId?: string) {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('hb_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const prevStatusMapRef = useRef<Record<string, OrderStatus>>({});

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hb_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Request Notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  // Play audio chime
  const playAudioChime = useCallback(() => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio playback prevented or unsupported:', e);
    }
  }, []);

  // Monitor order status updates
  useEffect(() => {
    const userOrders = currentUserId 
      ? orders.filter(o => o.student_id === currentUserId)
      : orders;

    userOrders.forEach(order => {
      const prevStatus = prevStatusMapRef.current[order.id];

      if (prevStatus && prevStatus !== order.order_status) {
        // Status changed!
        let title = '';
        let body = '';

        if (order.order_status === 'ready') {
          title = `🎉 Order #${order.order_code} is Ready!`;
          body = `Your meal is prepared and ready for pickup at Canteen Counter.`;
        } else if (order.order_status === 'preparing') {
          title = `👨‍🍳 Order #${order.order_code} is Preparing`;
          body = `The kitchen team has started preparing your order.`;
        } else if (order.order_status === 'delivered') {
          title = `✅ Order #${order.order_code} Completed`;
          body = `Thank you! Your order has been marked as delivered.`;
        } else if (order.order_status === 'cancelled') {
          title = `❌ Order #${order.order_code} Cancelled`;
          body = `Order has been cancelled. Any upfront payment will be refunded.`;
        }

        if (title) {
          // 1. Add in-app notification
          const newNotif: NotificationItem = {
            id: Math.random().toString(36).substr(2, 9),
            orderId: order.id,
            orderCode: order.order_code,
            title,
            body,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'status_change'
          };
          setNotifications(prev => [newNotif, ...prev]);

          // 2. Play audio notification chime
          playAudioChime();

          // 3. Trigger Browser Native Notification
          if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
            try {
              new Notification(title, {
                body,
                icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100',
                badge: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100',
                tag: order.id
              });
            } catch (e) {
              console.log('Native notification error:', e);
            }
          }
        }
      }

      prevStatusMapRef.current[order.id] = order.order_status;
    });
  }, [orders, currentUserId, permission, playAudioChime]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return {
    notifications,
    permission,
    requestNotificationPermission,
    markAllAsRead,
    clearNotifications,
    markAsRead,
    playAudioChime
  };
}
