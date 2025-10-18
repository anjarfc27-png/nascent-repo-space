import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Ban, MessageCircle, Instagram, ArrowLeft, LogOut, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  is_approved: boolean;
  created_at: string;
  approved_at?: string;
}

export const UserManagement = () => {
  const { isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUser, setActionUser] = useState<{ id: string; action: 'approve' | 'reject' | 'suspend' } | null>(null);
  
  // Admin contact settings
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [adminInstagram, setAdminInstagram] = useState('');
  const [savingContacts, setSavingContacts] = useState(false);

  useEffect(() => {
    if (isAdmin && user) {
      fetchUsers();
      loadAdminContactInfo();
    }
  }, [isAdmin, user]);

  const loadAdminContactInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('admin_whatsapp, admin_instagram')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading admin contacts:', error);
        return;
      }
      
      if (data) {
        const profileData = data as any;
        setAdminWhatsApp(profileData.admin_whatsapp || '');
        setAdminInstagram(profileData.admin_instagram || '');
      }
    } catch (error) {
      console.error('Error loading admin contacts:', error);
    }
  };

  const saveAdminContactInfo = async () => {
    if (!user) return;
    
    setSavingContacts(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          admin_whatsapp: adminWhatsApp.trim(),
          admin_instagram: adminInstagram.trim()
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Kontak admin berhasil disimpan!');
    } catch (error) {
      console.error('Error saving admin contacts:', error);
      toast.error('Gagal menyimpan kontak admin');
    } finally {
      setSavingContacts(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, username, is_approved, created_at, approved_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pending = data?.filter(u => !u.is_approved) || [];
      const approved = data?.filter(u => u.is_approved) || [];

      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          approved_by: authData.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast.success('User berhasil disetujui');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Gagal menyetujui user');
    } finally {
      setActionUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // Delete user profile (will cascade to auth.users)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Delete from auth (using admin API would be better, but we'll let cascade handle it)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth delete error (may need service role key):', authError);
      }

      toast.success('User ditolak dan dihapus dari database');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Gagal menolak user');
    } finally {
      setActionUser(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: false,
          approved_by: null,
          approved_at: null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User berhasil di-suspend');
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Gagal suspend user');
    } finally {
      setActionUser(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                <p className="text-sm text-gray-600">Kelola persetujuan dan user aktif</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-safe-bottom">

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/subscriptions')}
            className="h-14 rounded-2xl border-gray-200 hover:bg-gray-50 justify-start"
          >
            <Calendar className="h-5 w-5 mr-3" />
            <span className="font-semibold">Kelola Subscription</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="h-14 rounded-2xl border-gray-200 hover:bg-gray-50 justify-start"
          >
            <ArrowLeft className="h-5 w-5 mr-3" />
            <span className="font-semibold">Dashboard</span>
          </Button>
        </div>

        {/* Admin Contact Settings */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Kontak Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-whatsapp" className="text-sm font-medium">Nomor WhatsApp (format: 6281234567890)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="admin-whatsapp"
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="628xx xxxx xxxx"
                  className="rounded-xl"
                />
                <Button 
                  onClick={saveAdminContactInfo} 
                  disabled={savingContacts}
                  className="rounded-xl"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Nomor ini akan muncul di halaman login untuk dihubungi calon user
              </p>
            </div>
            
            <div>
              <Label htmlFor="admin-instagram" className="text-sm font-medium">Username Instagram (tanpa @)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="admin-instagram"
                  value={adminInstagram}
                  onChange={(e) => setAdminInstagram(e.target.value)}
                  placeholder="username"
                  className="rounded-xl"
                />
                <Button 
                  onClick={saveAdminContactInfo} 
                  disabled={savingContacts} 
                  variant="outline"
                  className="rounded-xl"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Username ini akan muncul di halaman login untuk dihubungi calon user
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Menunggu Persetujuan
              {pendingUsers.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                  {pendingUsers.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground font-medium">Tidak ada user yang menunggu persetujuan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Daftar: {new Date(user.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setActionUser({ id: user.user_id, action: 'approve' })}
                        className="w-full sm:w-auto rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setActionUser({ id: user.user_id, action: 'reject' })}
                        className="w-full sm:w-auto rounded-xl"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Users */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg">User Aktif ({approvedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground font-medium">Belum ada user yang disetujui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Disetujui: {user.approved_at ? new Date(user.approved_at).toLocaleString('id-ID') : '-'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionUser({ id: user.user_id, action: 'suspend' })}
                      className="w-full sm:w-auto rounded-xl"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!actionUser} onOpenChange={() => setActionUser(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionUser?.action === 'approve' && 'Setujui User?'}
                {actionUser?.action === 'reject' && 'Tolak & Hapus User?'}
                {actionUser?.action === 'suspend' && 'Suspend User?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionUser?.action === 'approve' &&
                  'User akan dapat login dan menggunakan aplikasi.'}
                {actionUser?.action === 'reject' &&
                  'User akan dihapus dari database dan tidak dapat login. Jika ingin mendaftar lagi, mereka harus menghubungi admin.'}
                {actionUser?.action === 'suspend' &&
                  'User tidak akan dapat login sampai disetujui kembali.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl"
                onClick={() => {
                  if (actionUser?.action === 'approve') handleApprove(actionUser.id);
                  if (actionUser?.action === 'reject') handleReject(actionUser.id);
                  if (actionUser?.action === 'suspend') handleSuspend(actionUser.id);
                }}
              >
                Ya, Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
