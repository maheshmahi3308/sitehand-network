import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, LogOut, User, Building, Package } from 'lucide-react';
import WorkerDashboard from '@/components/dashboard/WorkerDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';
import SupplierDashboard from '@/components/dashboard/SupplierDashboard';

interface Profile {
  id: string;
  role: 'worker' | 'owner' | 'supplier';
  full_name: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              There was an issue loading your profile. Please try signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'worker':
        return <User className="h-5 w-5" />;
      case 'owner':
        return <Building className="h-5 w-5" />;
      case 'supplier':
        return <Package className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'worker':
        return 'Construction Worker';
      case 'owner':
        return 'Project Owner';
      case 'supplier':
        return 'Material Supplier';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Construction className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">BuildConnect</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              {getRoleIcon(profile.role)}
              <span className="text-sm">{getRoleLabel(profile.role)}</span>
            </div>
            <span className="text-sm text-foreground">{profile.full_name}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {profile.role === 'worker' && <WorkerDashboard />}
        {profile.role === 'owner' && <OwnerDashboard />}
        {profile.role === 'supplier' && <SupplierDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;