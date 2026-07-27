
import React, { useMemo } from 'react';
import { Order, MenuItem } from '../types';
import { 
  TrendingUp, Package, Wallet, Clock, 
  Download, BarChart3, Activity, PieChart,
  Smartphone, Monitor, Receipt, ArrowRight,
  FileSpreadsheet, FileText, Calendar
} from 'lucide-react';

interface ReportsAnalysisViewProps {
  orders: Order[];
  menu: MenuItem[];
  onNewWalkIn?: () => void;
}

const ReportsAnalysisView: React.FC<ReportsAnalysisViewProps> = ({ orders, menu, onNewWalkIn }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = useMemo(() => orders.filter(o => o.created_at.startsWith(today)), [orders, today]);

  const metrics = useMemo(() => {
    let onlineSales = 0;
    let offlineSales = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let toCollectOnline = 0;
    let prePaidOnline = 0;
    let cashCollected = 0;

    todayOrders.forEach(o => {
      const isOnline = o.order_type === 'online';
      const total = Number(o.total_amount);
      const paid = Number(o.paid_amount);

      if (isOnline) {
        onlineSales += total;
        onlineCount++;
        toCollectOnline += (total - paid);
        prePaidOnline += paid;
      } else {
        offlineSales += total;
        offlineCount++;
        cashCollected += paid;
      }
    });

    return {
      totalSales: onlineSales + offlineSales,
      onlineSales,
      offlineSales,
      totalCount: onlineCount + offlineCount,
      onlineCount,
      offlineCount,
      toCollectOnline,
      prePaidOnline,
      cashCollected,
      totalOnHand: prePaidOnline + cashCollected
    };
  }, [todayOrders]);

  const insights = useMemo(() => {
    const itemMap: Record<string, number> = {};
    todayOrders.forEach(o => {
      o.order_items?.forEach(i => {
        itemMap[i.item_name] = (itemMap[i.item_name] || 0) + i.quantity;
      });
    });
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { topItems };
  }, [todayOrders]);

  const recentActivity = useMemo(() => orders.slice(0, 6), [orders]);

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = () => {
    const data = orders.map(o => ({
      OrderID: o.id,
      Code: o.order_code,
      Type: o.order_type,
      Status: o.order_status,
      Total: o.total_amount,
      Paid: o.paid_amount,
      Date: o.created_at,
      Customer: o.student_details?.full_name || 'Walk-in'
    }));
    exportToCSV(data, 'Orders_Report');
  };

  const handleExportPayments = () => {
    const data: any[] = [];
    orders.forEach(o => {
      o.payments?.forEach(p => {
        data.push({
          PaymentID: p.id || 'N/A',
          OrderID: o.id,
          Code: o.order_code,
          Method: p.payment_method,
          Status: p.payment_status,
          Amount: p.paid_amount,
          Date: o.created_at
        });
      });
    });
    exportToCSV(data, 'Payments_Report');
  };

  const handleExportSalesSummary = () => {
    const data = [{
      Date: today,
      TotalSales: metrics.totalSales,
      OnlineSales: metrics.onlineSales,
      OfflineSales: metrics.offlineSales,
      OrderCount: metrics.totalCount,
      OnlineCount: metrics.onlineCount,
      OfflineCount: metrics.offlineCount,
      TotalCollected: metrics.totalOnHand
    }];
    exportToCSV(data, 'Daily_Sales_Summary');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Export Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900">Reports & Analysis</h3>
          <p className="text-xs text-gray-400 font-medium">Unified metrics and data exports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportOrders} className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Orders CSV
          </button>
          <button onClick={handleExportPayments} className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            <FileText className="w-4 h-4 text-blue-400" /> Payments CSV
          </button>
          <button onClick={handleExportSalesSummary} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            <Calendar className="w-4 h-4" /> Daily Summary
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Sales</p>
          <p className="text-4xl font-black text-gray-900">₹{metrics.totalSales}</p>
          <div className="mt-4 flex gap-4 text-[9px] font-black uppercase tracking-widest">
            <span className="text-blue-500">Online: ₹{metrics.onlineSales}</span>
            <span className="text-orange-500">Offline: ₹{metrics.offlineSales}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-4xl font-black text-gray-900">{metrics.totalCount}</p>
          <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
            {metrics.onlineCount} ON / {metrics.offlineCount} OFF
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">To Collect</p>
          <p className="text-4xl font-black text-gray-900">₹{metrics.toCollectOnline}</p>
          <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">Pending Balances</p>
        </div>

        {onNewWalkIn ? (
          <button onClick={onNewWalkIn} className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Receipt className="w-8 h-8" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">New Counter Bill</span>
          </button>
        ) : (
          <div className="bg-gray-950 p-8 rounded-[2.5rem] text-white flex flex-col items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Growth Tracking</span>
          </div>
        )}
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-widest text-gray-500 mb-10">
            <Activity className="w-5 h-5 text-emerald-600" /> Hourly Transaction Flow
          </h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-gray-50">
            {[65, 45, 75, 55, 90, 60, 80, 50, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-emerald-100 rounded-t-xl hover:bg-emerald-500 transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">₹{h * 15}</div>
                </div>
                <span className="text-[9px] font-black text-gray-300">T{i+8}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-widest text-gray-500 mb-8">
            <PieChart className="w-5 h-5 text-emerald-600" /> Top Sellers
          </h3>
          <div className="space-y-6">
            {insights.topItems.map(([name, qty], i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-emerald-600">#{i+1}</div>
                  <span className="font-bold text-sm text-gray-700">{name}</span>
                </div>
                <span className="text-sm font-black text-gray-400">{qty} Sold</span>
              </div>
            ))}
            {insights.topItems.length === 0 && <p className="text-center py-10 text-gray-300 italic">No sales yet</p>}
          </div>
        </div>
      </div>

      {/* Activity & Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Recent Activity Log</h3>
          </div>
          <div className="space-y-6">
            {recentActivity.map((o) => (
              <div key={o.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${o.order_type === 'walk-in' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                    {o.order_type === 'walk-in' ? <Receipt className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{o.order_type === 'walk-in' ? 'Walk-in' : (o.student_details?.full_name || 'Student')}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600">₹{o.total_amount}</p>
                  <p className="text-[9px] font-black text-gray-300 uppercase">{o.order_status}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-center py-10 text-gray-300 italic">Queue is quiet</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-950 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-12">Wallet Settlement</h3>
          <div className="space-y-8 flex-1">
            <div className="flex justify-between items-center group">
              <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Pre-paid (Online)</span>
              <span className="text-xl font-black">₹{metrics.prePaidOnline}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center group">
              <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Cash Collected</span>
              <span className="text-xl font-black">₹{metrics.cashCollected}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="mt-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Current On-hand</p>
                <p className="text-6xl font-black">₹{metrics.totalOnHand}</p>
              </div>
              <div className="mb-2 opacity-10">
                <Wallet className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalysisView;
