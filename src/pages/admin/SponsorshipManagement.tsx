/**
 * DNA Admin — Sponsorship Management
 * CRUD for sponsors and their placements with basic analytics.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sponsorshipService, Sponsor, SponsorPlacement, SponsorWithPlacements } from '@/services/sponsorshipService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, MousePointer, ExternalLink } from 'lucide-react';

const TIERS = ['gold', 'silver', 'bronze', 'community'] as const;
const PLACEMENTS = ['feed_sidebar', 'event_page', 'convene_hub', 'email_footer'] as const;

const tierColors: Record<string, string> = {
  gold: 'bg-amber-100 text-amber-800',
  silver: 'bg-slate-100 text-slate-700',
  bronze: 'bg-orange-100 text-orange-800',
  community: 'bg-emerald-100 text-emerald-800',
};

export default function SponsorshipManagement() {
  const queryClient = useQueryClient();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);

  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['admin-sponsors'],
    queryFn: sponsorshipService.getAllSponsors,
  });

  const toggleSponsorActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      sponsorshipService.updateSponsor(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
      toast.success('Sponsor updated');
    },
  });

  const deleteSponsor = useMutation({
    mutationFn: sponsorshipService.deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
      toast.success('Sponsor deleted');
    },
  });

  const togglePlacementActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      sponsorshipService.updatePlacement(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
      toast.success('Placement updated');
    },
  });

  const deletePlacement = useMutation({
    mutationFn: sponsorshipService.deletePlacement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
      toast.success('Placement deleted');
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading sponsors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sponsorship Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage sponsors and their placements across DNA</p>
        </div>
        <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSponsor(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
            </DialogHeader>
            <SponsorForm
              sponsor={editingSponsor}
              onSave={() => {
                setShowSponsorDialog(false);
                queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sponsors.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No sponsors yet. Add your first sponsor to get started.
        </Card>
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {sponsor.logo_url && (
                    <img src={sponsor.logo_url} alt="" className="w-10 h-10 rounded-lg object-contain bg-white border p-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{sponsor.name}</h3>
                      <Badge className={tierColors[sponsor.tier] || ''}>{sponsor.tier}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sponsor.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={sponsor.is_active}
                    onCheckedChange={(checked) => toggleSponsorActive.mutate({ id: sponsor.id, is_active: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingSponsor(sponsor);
                      setShowSponsorDialog(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this sponsor and all its placements?')) {
                        deleteSponsor.mutate(sponsor.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Placements */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Placements</span>
                  <Dialog open={showPlacementDialog && selectedSponsorId === sponsor.id} onOpenChange={(open) => {
                    setShowPlacementDialog(open);
                    if (open) setSelectedSponsorId(sponsor.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Placement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Placement for {sponsor.name}</DialogTitle>
                      </DialogHeader>
                      <PlacementForm
                        sponsorId={sponsor.id}
                        onSave={() => {
                          setShowPlacementDialog(false);
                          queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {(sponsor.sponsor_placements || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No placements configured</p>
                ) : (
                  <div className="divide-y divide-border rounded-lg border">
                    {(sponsor.sponsor_placements || []).map((pl: SponsorPlacement) => (
                      <div key={pl.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="outline" className="text-xs shrink-0">{pl.placement}</Badge>
                          <span className="truncate text-muted-foreground">{pl.headline || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Impressions">
                            <Eye className="h-3 w-3" />{pl.impression_count}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Clicks">
                            <MousePointer className="h-3 w-3" />{pl.click_count}
                          </span>
                          <Switch
                            checked={pl.is_active}
                            onCheckedChange={(checked) => togglePlacementActive.mutate({ id: pl.id, is_active: checked })}
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            if (confirm('Delete this placement?')) deletePlacement.mutate(pl.id);
                          }}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sponsor Form ──────────────────────────────────────────────────────────────

function SponsorForm({ sponsor, onSave }: { sponsor: Sponsor | null; onSave: () => void }) {
  const [form, setForm] = useState({
    name: sponsor?.name || '',
    slug: sponsor?.slug || '',
    logo_url: sponsor?.logo_url || '',
    description: sponsor?.description || '',
    website_url: sponsor?.website_url || '',
    tier: sponsor?.tier || 'community',
    contact_name: sponsor?.contact_name || '',
    contact_email: sponsor?.contact_email || '',
  });

  const mutation = useMutation({
    mutationFn: () =>
      sponsor
        ? sponsorshipService.updateSponsor(sponsor.id, form)
        : sponsorshipService.createSponsor(form),
    onSuccess: () => {
      toast.success(sponsor ? 'Sponsor updated' : 'Sponsor created');
      onSave();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
      <div><Label>Name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} required /></div>
      <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => update('slug', e.target.value)} required placeholder="e.g. gaba-center" /></div>
      <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => update('logo_url', e.target.value)} /></div>
      <div><Label>Description</Label><Input value={form.description} onChange={(e) => update('description', e.target.value)} /></div>
      <div><Label>Website</Label><Input value={form.website_url} onChange={(e) => update('website_url', e.target.value)} /></div>
      <div>
        <Label>Tier</Label>
        <Select value={form.tier} onValueChange={(v) => update('tier', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} /></div>
      <div><Label>Contact Email</Label><Input value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} /></div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : sponsor ? 'Update Sponsor' : 'Create Sponsor'}
      </Button>
    </form>
  );
}

// ─── Placement Form ────────────────────────────────────────────────────────────

function PlacementForm({ sponsorId, onSave }: { sponsorId: string; onSave: () => void }) {
  const [form, setForm] = useState({
    placement: 'feed_sidebar',
    headline: '',
    cta_label: 'Learn More',
    cta_url: '',
    priority: 10,
  });

  const mutation = useMutation({
    mutationFn: () =>
      sponsorshipService.createPlacement({ ...form, sponsor_id: sponsorId }),
    onSuccess: () => {
      toast.success('Placement created');
      onSave();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
      <div>
        <Label>Placement</Label>
        <Select value={form.placement} onValueChange={(v) => update('placement', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PLACEMENTS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Headline</Label><Input value={form.headline} onChange={(e) => update('headline', e.target.value)} /></div>
      <div><Label>CTA Label</Label><Input value={form.cta_label} onChange={(e) => update('cta_label', e.target.value)} /></div>
      <div><Label>CTA URL</Label><Input value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} /></div>
      <div><Label>Priority (lower = higher)</Label><Input type="number" value={form.priority} onChange={(e) => update('priority', parseInt(e.target.value) || 10)} /></div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Placement'}
      </Button>
    </form>
  );
}
