import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  budget_min: number;
  budget_max: number;
  required_skills: string[];
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

interface Bid {
  id: string;
  proposed_rate: number;
  message: string;
  status: string;
  worker_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  worker_profiles: {
    skills: string[];
    experience_years: number;
    hourly_rate: number;
  } | null;
}

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Record<string, Bid[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch owner's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch bids for each project
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            profiles!bids_worker_id_fkey(full_name),
            worker_profiles!worker_profiles_user_id_fkey(skills, experience_years, hourly_rate)
          `)
          .in('project_id', projectIds);

        if (bidsError) throw bidsError;

        // Group bids by project
        const bidsByProject: Record<string, Bid[]> = {};
        bidsData?.forEach(bid => {
          if (!bidsByProject[bid.project_id]) {
            bidsByProject[bid.project_id] = [];
          }
          bidsByProject[bid.project_id].push(bid as any);
        });
        setBids(bidsByProject);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptBid = async (bidId: string, projectId: string) => {
    try {
      // Update bid status to accepted
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (bidError) throw bidError;

      // Update project status to in_progress
      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'in_progress' })
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Reject other bids for this project
      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('project_id', projectId)
        .neq('id', bidId);

      if (rejectError) throw rejectError;

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error accepting bid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'open': return 'default';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Project Owner Dashboard</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter(p => p.status === 'open').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(bids).flat().length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            Manage your construction projects and review worker applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any projects yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => (
                <Card key={project.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                        <p className="text-muted-foreground text-sm">{project.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${project.budget_min?.toLocaleString()} - ${project.budget_max?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    
                    {project.required_skills && project.required_skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-foreground">Required Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.required_skills.map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bids Section */}
                    {bids[project.id] && bids[project.id].length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="font-medium text-foreground mb-3">
                          Worker Applications ({bids[project.id].length})
                        </h4>
                        <div className="space-y-3">
                          {bids[project.id].map((bid) => (
                            <div key={bid.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{bid.profiles?.full_name}</span>
                                  <Badge variant="outline">
                                    {bid.worker_profiles?.experience_years || 0} years exp
                                  </Badge>
                                  <Badge variant={bid.status === 'accepted' ? 'default' : 'secondary'}>
                                    {bid.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{bid.message}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>Proposed Rate: <strong>${bid.proposed_rate}/hr</strong></span>
                                  {bid.worker_profiles?.skills && (
                                    <span>Skills: {bid.worker_profiles.skills.join(', ')}</span>
                                  )}
                                </div>
                              </div>
                              {bid.status === 'pending' && project.status === 'open' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => acceptBid(bid.id, project.id)}
                                >
                                  Accept
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;