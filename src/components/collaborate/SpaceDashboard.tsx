import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useSpace, 
  useSpaceMembers, 
  useSpaceInitiatives, 
  useSpaceTasks,
  useSpaceRoles,
  useSpaceActivity 
} from '@/hooks/useCollaborate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Target, 
  CheckSquare, 
  Activity,
  Settings,
  Plus,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { InitiativeCard } from './InitiativeCard';
import { TaskBoard } from './TaskBoard';
import { MemberList } from './MemberList';
import { ActivityFeed } from './ActivityFeed';
import { CreateInitiativeDialog } from './CreateInitiativeDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function SpaceDashboard() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { data: space, isLoading: spaceLoading } = useSpace(spaceId!);
  const { data: members } = useSpaceMembers(spaceId!);
  const { data: initiatives } = useSpaceInitiatives(spaceId!);
  const { data: tasks } = useSpaceTasks(spaceId!);
  const { data: roles } = useSpaceRoles(spaceId!);
  const { data: activity } = useSpaceActivity(spaceId!);

  const [showCreateInitiative, setShowCreateInitiative] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (spaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-medium text-foreground">Space not found</h2>
        <p className="text-muted-foreground mt-2">This space may have been deleted or you don't have access.</p>
      </div>
    );
  }

  // Calculate stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const overdueTasks = tasks?.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeInitiatives = initiatives?.filter(i => i.status === 'active').length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{space.name}</h1>
              <Badge 
                variant="outline" 
                className={cn(
                  space.status === 'active' && 'border-green-500 text-green-700',
                  space.status === 'stalled' && 'border-yellow-500 text-yellow-700',
                  space.status === 'completed' && 'border-blue-500 text-blue-700'
                )}
              >
                {space.status}
              </Badge>
            </div>
            {space.description && (
              <p className="text-muted-foreground max-w-2xl">{space.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {members?.length || 0} members
              </span>
              {space.last_activity_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Active {formatDistanceToNow(new Date(space.last_activity_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInviteMember(true)}>
              <Users className="w-4 h-4 mr-2" />
              Invite
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Task Progress</span>
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={taskProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {completedTasks} of {totalTasks} complete
              </p>
            </div>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Initiatives</span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2">{activeInitiatives}</p>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Team Size</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2">{members?.length || 0}</p>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overdue Tasks</span>
              <AlertCircle className={cn(
                "w-4 h-4",
                overdueTasks > 0 ? "text-destructive" : "text-muted-foreground/30"
              )} />
            </div>
            <p className={cn(
              "text-2xl font-bold mt-2",
              overdueTasks > 0 && "text-destructive"
            )}>
              {overdueTasks}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="initiatives" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Initiatives
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Recent Activity</h2>
              </div>
              <ActivityFeed activities={activity || []} />
            </div>

            {/* Team */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Team</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowInviteMember(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {members?.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.user?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.user?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.role_info?.title || 'Member'}</p>
                    </div>
                  </div>
                ))}
                {(members?.length || 0) > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('members')}
                  >
                    View all {members?.length} members
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="initiatives">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">Initiatives</h2>
            <Button 
              onClick={() => setShowCreateInitiative(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Initiative
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {initiatives?.map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
            {(!initiatives || initiatives.length === 0) && (
              <div className="col-span-2 text-center py-12 bg-muted/50 rounded-lg">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">No initiatives yet</h3>
                <p className="text-muted-foreground mt-1">Create your first initiative to start organizing work.</p>
                <Button 
                  onClick={() => setShowCreateInitiative(true)}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Initiative
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskBoard spaceId={spaceId!} tasks={tasks || []} />
        </TabsContent>

        <TabsContent value="members">
          <MemberList 
            members={members || []} 
            roles={roles || []} 
            onInvite={() => setShowInviteMember(true)} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateInitiativeDialog
        open={showCreateInitiative}
        onOpenChange={setShowCreateInitiative}
        spaceId={spaceId!}
      />
      <InviteMemberDialog
        open={showInviteMember}
        onOpenChange={setShowInviteMember}
        spaceId={spaceId!}
        roles={roles || []}
      />
    </div>
  );
}
