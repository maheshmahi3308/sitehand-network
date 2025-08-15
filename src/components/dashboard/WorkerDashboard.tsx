import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';

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
}

interface WorkerProfile {
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  daily_rate: number;
  availability: boolean;
  bio: string;
}

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch available projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch worker profile
      const { data: profileData, error: profileError } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setWorkerProfile(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToProject = async (projectId: string) => {
    if (!workerProfile?.hourly_rate) return;

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          project_id: projectId,
          worker_id: user?.id,
          proposed_rate: workerProfile.hourly_rate,
          message: 'I am interested in this project and available to start immediately.'
        });

      if (error) throw error;
      
      // Refresh projects to show updated bid status
      fetchData();
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Worker Dashboard</h1>
        <Badge variant={workerProfile?.availability ? "default" : "secondary"}>
          {workerProfile?.availability ? "Available" : "Unavailable"}
        </Badge>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Experience:</span>
              <span className="font-medium">{workerProfile?.experience_years || 0} years</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hourly Rate:</span>
              <span className="font-medium">${workerProfile?.hourly_rate || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Daily Rate:</span>
              <span className="font-medium">${workerProfile?.daily_rate || 0}</span>
            </div>
          </div>
          {workerProfile?.skills && workerProfile.skills.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Skills:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {workerProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Available Projects</CardTitle>
          <CardDescription>
            Find and apply to construction projects that match your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No projects available at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ${project.budget_min?.toLocaleString()} - ${project.budget_max?.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Budget</div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {project.required_skills && project.required_skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-foreground">Required Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.required_skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {project.start_date && (
                          <span>Starts: {new Date(project.start_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Button 
                        onClick={() => applyToProject(project.id)}
                        disabled={!workerProfile?.availability}
                      >
                        Apply Now
                      </Button>
                    </div>
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

export default WorkerDashboard;