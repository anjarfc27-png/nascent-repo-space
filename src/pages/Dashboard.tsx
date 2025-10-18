import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Users, LogOut, Smartphone, TrendingUp, DollarSign, ShoppingCart, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  todayRevenue: number;
  todayTransactions: number;
  totalProducts: number;
  revenueGrowth: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin, loading, isAdminCheckComplete } = useAuth();
  const { currentStore } = useStore();
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayTransactions: 0,
    totalProducts: 0,
    revenueGrowth: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && isAdminCheckComplete) {
      loadDashboardStats();
    }
  }, [loading, isAdminCheckComplete]);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      // Mock data for now - will be replaced with real data from transactions table
      const mockStats: DashboardStats = {
        todayRevenue: 0,
        todayTransactions: 0,
        totalProducts: 0,
        revenueGrowth: 0,
      };

      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      mockStats.totalProducts = productsCount || 0;
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking admin status
  if (loading || !isAdminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // All approved users can see dashboard

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* iOS Style Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="safe-top py-4 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">{currentStore?.name || 'Sistem Kasir'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-safe-bottom">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Today Revenue */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="h-5 w-5" />
                </div>
                {stats.revenueGrowth !== 0 && (
                  <div className={`flex items-center text-xs font-semibold ${stats.revenueGrowth > 0 ? 'text-green-100' : 'text-red-100'}`}>
                    {stats.revenueGrowth > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(stats.revenueGrowth).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-white/80 mb-1">Pendapatan Hari Ini</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loadingStats ? '...' : `Rp ${stats.todayRevenue.toLocaleString('id-ID')}`}
              </p>
            </CardContent>
          </Card>

          {/* Today Transactions */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-white/80 mb-1">Transaksi Hari Ini</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loadingStats ? '...' : stats.todayTransactions}
              </p>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-white/80 mb-1">Total Produk</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loadingStats ? '...' : stats.totalProducts}
              </p>
            </CardContent>
          </Card>

          {/* Growth Indicator */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-white/80 mb-1">Pertumbuhan</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loadingStats ? '...' : stats.revenueGrowth > 0 ? `+${stats.revenueGrowth.toFixed(1)}%` : `${stats.revenueGrowth.toFixed(1)}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - iOS Style */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 px-1">Menu Utama</h2>
          
          {/* POS Menu */}
          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] rounded-2xl bg-white overflow-hidden"
            onClick={() => navigate('/pos')}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Kasir POS</h3>
                  <p className="text-sm text-gray-600">
                    Akses sistem Point of Sale untuk transaksi dan manajemen produk
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* PPOB Menu */}
          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] rounded-2xl bg-white overflow-hidden"
            onClick={() => navigate('/ppob')}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">PPOB</h3>
                  <p className="text-sm text-gray-600">
                    Layanan pembayaran online: Pulsa, Token PLN, PDAM, dan lainnya
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Admin Menu - Only show if user is admin */}
          {isAdmin && (
            <Card 
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] rounded-2xl bg-white overflow-hidden"
              onClick={() => navigate('/admin')}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Admin Panel</h3>
                    <p className="text-sm text-gray-600">
                      Kelola user, approval pendaftaran, dan administrasi sistem
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Logout Button - iOS Style */}
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );
};
