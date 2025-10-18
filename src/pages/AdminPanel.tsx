import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Database, 
  Settings, 
  FileText, 
  Shield,
  ArrowLeft,
  LogOut,
  TrendingUp,
  Package,
  Bell,
  CreditCard
} from 'lucide-react';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();

  const adminMenus = [
    {
      id: 'users',
      title: 'Manajemen User',
      description: 'Kelola persetujuan dan user aktif',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      route: '/admin/users'
    },
    {
      id: 'subscriptions',
      title: 'Subscription',
      description: 'Kelola langganan user',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/subscriptions'
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      description: 'Kelola backup database',
      icon: Database,
      color: 'from-green-500 to-emerald-600',
      route: '/backup-restore'
    },
    {
      id: 'reports',
      title: 'Laporan',
      description: 'Lihat laporan dan analitik',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      route: '/reports'
    },
    {
      id: 'products',
      title: 'Produk',
      description: 'Manajemen produk sistem',
      icon: Package,
      color: 'from-pink-500 to-pink-600',
      route: '/pos'
    },
    {
      id: 'settings',
      title: 'Pengaturan',
      description: 'Konfigurasi toko dan sistem',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      route: '/settings'
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Anda tidak memiliki akses ke halaman ini
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* iOS Style Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="safe-top py-4 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Pusat Kontrol Administrator</p>
              </div>
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
        {/* Admin Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total User</p>
                  <p className="text-lg font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Aktif</p>
                  <p className="text-lg font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Pending</p>
                  <p className="text-lg font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Admin</p>
                  <p className="text-lg font-bold text-gray-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Menu Grid - iOS Style */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 px-1">Menu Administrator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {adminMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <Card
                  key={menu.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] rounded-2xl bg-white overflow-hidden"
                  onClick={() => navigate(menu.route)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${menu.color} shadow-sm flex-shrink-0`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{menu.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {menu.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
};
