-- M3: CONTRIBUTE Safety & Integration
-- Tighten RLS, add blocking logic, and prepare for rate limiting

-- ============================================================================
-- 1. Security Definer Functions for Blocking Logic
-- ============================================================================

-- Check if a user is blocked from a space (by any Lead of that space)
create or replace function public.is_blocked_from_space(_user_id uuid, _space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from blocked_users bu
    join space_members sm on sm.user_id = bu.blocker_id
    where bu.blocked_id = _user_id
      and sm.space_id = _space_id
      and sm.role = 'lead'
  )
$$;

-- ============================================================================
-- 2. Tighten RLS Policies for contribution_needs
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view needs for accessible spaces" on contribution_needs;
drop policy if exists "Space leads can create needs" on contribution_needs;
drop policy if exists "Space leads can update needs" on contribution_needs;
drop policy if exists "Space leads can delete needs" on contribution_needs;

-- Re-create with tighter logic
create policy "Users can view needs for accessible spaces"
on contribution_needs
for select
using (
  exists (
    select 1
    from spaces s
    where s.id = contribution_needs.space_id
      and (
        -- Public spaces
        s.visibility = 'public'
        -- OR user is a member of the space
        or exists (
          select 1
          from space_members sm
          where sm.space_id = s.id
            and sm.user_id = auth.uid()
        )
      )
  )
);

create policy "Space leads can create needs"
on contribution_needs
for insert
with check (
  exists (
    select 1
    from space_members sm
    where sm.space_id = contribution_needs.space_id
      and sm.user_id = auth.uid()
      and sm.role = 'lead'
  )
  and created_by = auth.uid()
);

create policy "Space leads can update needs"
on contribution_needs
for update
using (
  exists (
    select 1
    from space_members sm
    where sm.space_id = contribution_needs.space_id
      and sm.user_id = auth.uid()
      and sm.role = 'lead'
  )
);

create policy "Space leads can delete needs"
on contribution_needs
for delete
using (
  exists (
    select 1
    from space_members sm
    where sm.space_id = contribution_needs.space_id
      and sm.user_id = auth.uid()
      and sm.role = 'lead'
  )
);

-- ============================================================================
-- 3. Tighten RLS Policies for contribution_offers
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view their own offers or space leads can view all" on contribution_offers;
drop policy if exists "Authenticated users can create offers" on contribution_offers;
drop policy if exists "Creators can update pending offers, leads can change status" on contribution_offers;
drop policy if exists "Creators can delete pending offers" on contribution_offers;

-- Re-create with blocking logic
create policy "Users can view their own offers or space leads can view all"
on contribution_offers
for select
using (
  created_by = auth.uid()
  or exists (
    select 1
    from space_members sm
    where sm.space_id = contribution_offers.space_id
      and sm.user_id = auth.uid()
      and sm.role = 'lead'
  )
);

create policy "Authenticated users can create offers if not blocked"
on contribution_offers
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  -- Not blocked from this space
  and not public.is_blocked_from_space(auth.uid(), space_id)
);

create policy "Creators can update pending offers, leads can change status"
on contribution_offers
for update
using (
  -- Offer creator can update their pending offers
  (created_by = auth.uid() and status = 'pending')
  -- OR space leads can update status
  or exists (
    select 1
    from space_members sm
    where sm.space_id = contribution_offers.space_id
      and sm.user_id = auth.uid()
      and sm.role = 'lead'
  )
);

create policy "Creators can delete pending offers"
on contribution_offers
for delete
using (
  created_by = auth.uid()
  and status = 'pending'
);

-- ============================================================================
-- 4. Add indexes for performance
-- ============================================================================

-- Index for blocking checks
create index if not exists idx_blocked_users_blocked_id 
  on blocked_users(blocked_id);

create index if not exists idx_blocked_users_blocker_id 
  on blocked_users(blocker_id);

-- Composite index for space member role checks
create index if not exists idx_space_members_space_user_role 
  on space_members(space_id, user_id, role);

-- ============================================================================
-- 5. Comments for documentation
-- ============================================================================

comment on function public.is_blocked_from_space is 
  'Security definer function to check if a user is blocked from contributing to a space by any lead';

comment on table contribution_needs is 
  'Contribution needs posted by space leads. Rate limited at application layer.';

comment on table contribution_offers is 
  'Contribution offers from users. Blocked users cannot create offers. Rate limited at application layer.';