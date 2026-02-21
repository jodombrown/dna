import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';

export interface ImpactSummary {
  space: {
    id: string;
    name: string;
    tagline: string | null;
    region: string | null;
    focus_areas: string[] | null;
  };
  need: {
    id: string;
    title: string;
    description: string;
    type: string;
  };
  contributions: {
    validated_count: number;
    main_contributors: string[];
    others_count: number;
    first_validated_at: string | null;
    last_validated_at: string | null;
  };
}

export function useImpactSummary(spaceId: string | undefined, needId: string | undefined) {
  return useQuery({
    queryKey: ['impact-summary', spaceId, needId],
    queryFn: async () => {
      if (!spaceId || !needId) return null;

      // Fetch space data
      const { data: space, error: spaceError } = await supabaseClient
        .from('spaces')
        .select('id, name, tagline, region, focus_areas')
        .eq('id', spaceId)
        .single();

      if (spaceError) throw spaceError;

      // Fetch need data
      const { data: need, error: needError } = await supabaseClient
        .from('contribution_needs')
        .select('id, title, description, type')
        .eq('id', needId)
        .single();

      if (needError) throw needError;

      // Fetch validated contributions (badges)
      const { data: badges, error: badgesError } = await supabaseClient
        .from('contribution_badges')
        .select(`
          id,
          validated_at,
          user_id,
          profiles:user_id(full_name)
        `)
        .eq('space_id', spaceId)
        .eq('need_id', needId)
        .order('validated_at', { ascending: true });

      if (badgesError) throw badgesError;

      // Build contributor list
      const contributorNames = badges
        .map((b: { profiles?: { full_name: string | null } }) => b.profiles?.full_name)
        .filter((name: string | null) => name != null) as string[];
      
      const uniqueContributors = Array.from(new Set(contributorNames));
      const main_contributors = uniqueContributors.slice(0, 3);
      const others_count = Math.max(0, uniqueContributors.length - 3);

      const validated_count = badges.length;
      const first_validated_at = badges.length > 0 ? badges[0].validated_at : null;
      const last_validated_at = badges.length > 0 ? badges[badges.length - 1].validated_at : null;

      return {
        space,
        need,
        contributions: {
          validated_count,
          main_contributors,
          others_count,
          first_validated_at,
          last_validated_at,
        },
      } as ImpactSummary;
    },
    enabled: !!spaceId && !!needId,
  });
}

export function generateImpactTitle(spaceName: string, needTitle: string): string {
  return `How ${spaceName} advanced "${needTitle}" with help from the DNA community`;
}

export function generateImpactSubtitle(
  validated_count: number,
  first_validated_at: string | null,
  last_validated_at: string | null
): string {
  if (!first_validated_at || !last_validated_at) {
    return `${validated_count} contributor${validated_count !== 1 ? 's' : ''} helped reach this milestone.`;
  }

  const firstDate = new Date(first_validated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const lastDate = new Date(last_validated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (firstDate === lastDate) {
    return `${validated_count} contributor${validated_count !== 1 ? 's' : ''} helped reach this milestone in ${firstDate}.`;
  }

  return `${validated_count} contributor${validated_count !== 1 ? 's' : ''} helped reach this milestone between ${firstDate} and ${lastDate}.`;
}

export function generateImpactBody(summary: ImpactSummary): string {
  const { space, need, contributions } = summary;
  const { validated_count, main_contributors, others_count } = contributions;

  const contributorList = main_contributors.join(', ') + 
    (others_count > 0 ? ` and ${others_count} other${others_count !== 1 ? 's' : ''}` : '');

  return `## The Impact

Thanks to ${validated_count} validated contribution${validated_count !== 1 ? 's' : ''} from members of the DNA community, ${space.name} was able to advance its mission. This story shares what we set out to do, what happened, and what comes next.

## What We Needed

We published a Need on DNA looking for ${need.type} support to help us ${need.title.toLowerCase()}.

${need.description}

## How the Community Showed Up

${validated_count} people contributed to this effort${main_contributors.length > 0 ? `. Special thanks to ${contributorList}` : ''}.

Their support made a real difference in helping us achieve our goals.

## What We Achieved

*[Add details about the concrete outcomes and impact here. What specific results did these contributions enable? What changed because of this support?]*

Because of this support, we were able to…

## What's Next

We're continuing this work inside ${space.name}. If you'd like to support our mission, check out our current Needs on DNA or join the space to stay involved.`;
}
