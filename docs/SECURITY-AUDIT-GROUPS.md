# 🔴 GROUPS SYSTEM SECURITY AUDIT - CRITICAL ISSUES FOUND

## Executive Summary
**Status:** 🔴 **CRITICAL SECURITY FLAWS DETECTED**  
**Date:** 2025-11-03  
**Scope:** Groups System (PRD 8)  
**Severity:** HIGH - Requires immediate attention before production

---

## 🔥 CRITICAL ISSUES DISCOVERED

### Issue #1: **BROKEN RLS POLICY - Groups Table** (CRITICAL)
**Severity:** 🔴 CRITICAL  
**Impact:** Non-members can potentially update groups

**Problem:**
```sql
-- CURRENT POLICY (BROKEN)
CREATE POLICY "Admins can update groups" ON groups
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_members.id  -- 🔴 BUG: Wrong column reference
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('owner', 'admin')
      AND group_members.is_banned = false
  )
);
```

**Bug Explanation:**
- `group_members.group_id = group_members.id` should be `group_members.group_id = groups.id`
- This policy **always returns false** or matches wrong groups
- **Result:** Admins cannot update their groups OR worse, can update wrong groups

**Fix Required:**
```sql
DROP POLICY "Admins can update groups" ON groups;

CREATE POLICY "Admins can update groups" ON groups
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id  -- ✅ FIXED
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('owner', 'admin')
      AND group_members.is_banned = false
  )
);
```

---

### Issue #2: **BROKEN RLS POLICY - Group Members View** (CRITICAL)
**Severity:** 🔴 CRITICAL  
**Impact:** Privacy leak - wrong members visible

**Problem:**
```sql
-- CURRENT POLICY (BROKEN)
CREATE POLICY "Members can view group members" ON group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
      AND (
        g.privacy = 'public'
        OR EXISTS (
          SELECT 1 FROM group_members gm2
          WHERE gm2.group_id = g.id  -- ✅ This is correct
            AND gm2.user_id = auth.uid()
            AND gm2.is_banned = false
        )
      )
  )
);
```

**Status:** This policy looks CORRECT ✅

---

### Issue #3: **BROKEN RLS POLICY - Join Requests Update** (CRITICAL)
**Severity:** 🔴 CRITICAL  
**Impact:** Admins cannot approve join requests

**Problem:**
```sql
-- CURRENT POLICY (BROKEN)
CREATE POLICY "Admins can update join requests" ON group_join_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_join_requests.group_id
      -- Missing: Check if this is the correct group!
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('owner', 'admin', 'moderator')
      AND group_members.is_banned = false
  )
);
```

**Status:** This policy looks CORRECT ✅

---

### Issue #4: **BROKEN RLS POLICY - Secret Groups Visibility** (CRITICAL)
**Severity:** 🔴 CRITICAL  
**Impact:** Secret groups may be visible to wrong users

**Problem:**
```sql
-- CURRENT POLICY (BROKEN)
CREATE POLICY "Members can view secret groups" ON groups
FOR SELECT
USING (
  privacy = 'secret'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_members.id  -- 🔴 BUG: Wrong column reference!
      AND group_members.user_id = auth.uid()
      AND group_members.is_banned = false
  )
);
```

**Fix Required:**
```sql
DROP POLICY "Members can view secret groups" ON groups;

CREATE POLICY "Members can view secret groups" ON groups
FOR SELECT
USING (
  privacy = 'secret'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id  -- ✅ FIXED
      AND group_members.user_id = auth.uid()
      AND group_members.is_banned = false
  )
);
```

---

### Issue #5: **BROKEN RLS POLICY - Private Groups Visibility** (CRITICAL)
**Severity:** 🔴 CRITICAL  
**Impact:** Private groups may be visible to wrong users

**Problem:** Same as Issue #4
```sql
DROP POLICY "Members can view their private groups" ON groups;

CREATE POLICY "Members can view their private groups" ON groups
FOR SELECT
USING (
  privacy = 'private'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id  -- ✅ FIXED
      AND group_members.user_id = auth.uid()
      AND group_members.is_banned = false
  )
);
```

---

### Issue #6: **Missing DELETE Policy for Groups** (HIGH)
**Severity:** 🟠 HIGH  
**Impact:** No one can delete groups (might be intentional - soft delete only)

**Current State:** No DELETE policy exists on `groups` table

**Recommendation:** 
- If soft-delete only: ✅ This is correct, keep as-is
- If hard-delete needed: Add policy for owners only

---

### Issue #7: **Banned Users Can Still View Posts** (MEDIUM)
**Severity:** 🟡 MEDIUM  
**Impact:** Banned users can read group content

**Problem:**
```sql
CREATE POLICY "Members can view group posts" ON group_posts
FOR SELECT
USING (
  is_deleted = false
  AND EXISTS (
    SELECT 1 FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
    WHERE g.id = group_posts.group_id
      AND (
        g.privacy = 'public'
        OR (gm.user_id IS NOT NULL)  -- 🟡 Missing: AND gm.is_banned = false
      )
  )
);
```

**Fix Required:**
```sql
DROP POLICY "Members can view group posts" ON group_posts;

CREATE POLICY "Members can view group posts" ON group_posts
FOR SELECT
USING (
  is_deleted = false
  AND EXISTS (
    SELECT 1 FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
    WHERE g.id = group_posts.group_id
      AND (
        g.privacy = 'public'
        OR (gm.user_id IS NOT NULL AND gm.is_banned = false)  -- ✅ FIXED
      )
  )
);
```

---

## 🛡️ ADDITIONAL SECURITY CONCERNS

### Issue #8: **Public Profile Data Exposure** (ERROR)
**From Security Scan:**
> The 'profiles' table is publicly readable and contains sensitive personal information including full names, email addresses, locations, LinkedIn URLs, and detailed professional information.

**Recommendation:** Create privacy settings for profiles (separate from Groups system)

### Issue #9: **Missing search_path in Functions** (WARN)
**Count:** 13 functions missing `SET search_path = public`

**Impact:** Potential SQL injection via search_path manipulation

**Functions Affected:**
- `update_group_member_count()` - Missing search_path
- Plus 12 other functions

---

## ✅ SECURITY TEST SUITE

### Test #1: Non-Member Cannot Read Private Group Posts
```sql
-- Setup: Create test user and private group
BEGIN;

-- Test as non-member
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'non_member_user_id';

-- Should return 0 rows
SELECT * FROM group_posts 
WHERE group_id = 'private_group_id';

-- Expected: 0 rows
ROLLBACK;
```

### Test #2: Non-Admin Cannot Update Group Settings
```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'regular_member_user_id';

-- Should fail with permission error
UPDATE groups 
SET name = 'HACKED' 
WHERE id = 'group_id';

-- Expected: ERROR - new row violates row-level security policy
ROLLBACK;
```

### Test #3: User Cannot See Secret Groups They're Not In
```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user_id';

-- Should return 0 rows
SELECT * FROM groups 
WHERE privacy = 'secret'
  AND id NOT IN (
    SELECT group_id FROM group_members WHERE user_id = 'user_id'
  );

-- Expected: 0 rows
ROLLBACK;
```

### Test #4: Banned User Cannot Post in Group
```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'banned_user_id';

-- Should fail
INSERT INTO group_posts (group_id, author_id, content) 
VALUES ('group_id', 'banned_user_id', 'test');

-- Expected: ERROR - new row violates row-level security policy
ROLLBACK;
```

### Test #5: Banned User Cannot Read Group Posts
```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'banned_user_id';

-- Should return 0 rows
SELECT * FROM group_posts 
WHERE group_id = 'group_id';

-- Expected: 0 rows
ROLLBACK;
```

---

## 🚨 IMMEDIATE ACTION REQUIRED

### Priority 1: Fix Broken RLS Policies (MUST DO NOW)
Run the migration to fix:
1. ✅ Groups UPDATE policy (Issue #1)
2. ✅ Secret groups SELECT policy (Issue #4)
3. ✅ Private groups SELECT policy (Issue #5)
4. ✅ Group posts SELECT policy (Issue #7)

### Priority 2: Add search_path to Functions
Fix `update_group_member_count()` function

### Priority 3: Run Security Tests
Execute all 5 tests above to verify fixes

---

## 📋 MIGRATION SCRIPT

See: `supabase/migrations/YYYYMMDD_fix_groups_rls_critical.sql`

---

## ✅ WHAT'S WORKING CORRECTLY

1. ✅ Users can only create join requests for themselves
2. ✅ Users can only join groups as themselves
3. ✅ Users can only create posts as themselves
4. ✅ Public groups are visible to everyone
5. ✅ Authors can delete/update their own posts
6. ✅ Users can leave groups (except owners)
7. ✅ Banned users cannot create posts (INSERT policy works)

---

## 🎯 NEXT STEPS

1. **URGENT:** Create and run migration to fix RLS policies
2. **HIGH:** Add search_path to vulnerable functions
3. **MEDIUM:** Run comprehensive security tests
4. **LOW:** Address profile privacy settings (separate PRD)

---

**Prepared by:** Makena (AI Co-Founder)  
**For:** Jaûne Odombrown  
**Project:** Diaspora Network of Africa (DNA)  
**Status:** 🔴 CRITICAL - DO NOT DEPLOY TO PRODUCTION
