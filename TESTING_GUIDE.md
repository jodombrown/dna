# DNA Platform - Sign-up to Post Testing Guide

## 🎯 Critical User Flow: Registration → Profile → Posting

### **Prerequisites**
Before testing, ensure in Supabase Dashboard → Authentication → URL Configuration:
- ✅ **Site URL**: Set to your preview URL (e.g., `https://your-preview.lovable.app`)
- ✅ **Redirect URLs**: Add your preview URL
- ✅ **Email Confirmation**: DISABLE for faster testing (re-enable for production)

---

## 📋 Step-by-Step Testing Checklist

### **Phase 1: User Registration** ✅

1. **Navigate to sign-up page** (`/auth` or wherever your auth page is)
2. **Fill in registration form:**
   - Email: Use a real email you can access
   - Password: Minimum 6 characters
   - Full Name: Enter test name
3. **Submit registration**
4. **Expected behavior:**
   - ✅ If email confirmation DISABLED: Immediate redirect to `/dna/me`
   - ✅ If email confirmation ENABLED: Check email and click confirmation link
5. **Verify in database:**
   ```sql
   SELECT id, email, full_name, username, created_at 
   FROM profiles 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   - Profile should be auto-created with username from email

---

### **Phase 2: Profile Completion** ✅

1. **After login, you should be on `/dna/me` or onboarding**
2. **Complete profile fields:**
   - Avatar (optional but recommended)
   - Bio/Headline
   - Location
   - Skills/Interests
3. **Save profile**
4. **Expected behavior:**
   - Profile updates successfully
   - No RLS policy errors
   - Can navigate to other pages

---

### **Phase 3: Creating Posts** ✅

1. **Navigate to Activity Feed** (`/dna/connect` or wherever PostComposer is)
2. **Use PostComposer:**
   - Enter text content
   - Select pillar (Connect/Collaborate/Contribute/etc.)
   - Optional: Add image
   - Optional: Add link (auto-embeds)
3. **Click "Post" button**
4. **Expected behavior:**
   - ✅ Post creates successfully
   - ✅ Toast notification: "Post created!"
   - ✅ Post appears in feed immediately
   - ✅ Your avatar and name appear on post

**Common Errors to Watch For:**
- ❌ "Not authenticated" → Auth session expired
- ❌ "RLS policy violation" → Profile RLS misconfigured
- ❌ "Cannot insert" → Missing author_id or RLS policy

---

### **Phase 4: Viewing Posts** ✅

1. **Check your own posts appear**
2. **Try viewing as another user (if possible)**
3. **Verify privacy levels work:**
   - Public posts: Everyone sees
   - Connections-only: Only connected users see

**Expected behavior:**
- ✅ Own posts always visible
- ✅ Public posts visible to all
- ✅ Real-time updates via Supabase subscriptions

---

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot create profile"
**Solution:**
```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If missing, the trigger wasn't created. Contact support.
```

### Issue: "Cannot see my posts"
**Solution:**
1. Check RLS policies:
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'posts';
```
2. Verify your user_id matches author_id in posts table

### Issue: "Profile not loading"
**Solution:**
1. Check browser console for errors
2. Verify profile exists:
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```
3. Check AuthContext is fetching profile correctly

### Issue: "Email confirmation required"
**Temporary Fix for Testing:**
1. Supabase Dashboard → Authentication → Providers → Email
2. Uncheck "Confirm email"
3. **IMPORTANT**: Re-enable before production!

---

## ✅ Success Criteria

Your platform is working correctly when:
- [x] User can sign up without errors
- [x] Profile auto-creates with username
- [x] User can complete profile
- [x] User can create posts
- [x] Posts appear in feed immediately
- [x] User can see own posts
- [x] No RLS policy errors in console
- [x] Real-time updates work (new posts appear live)

---

## 📊 Database Health Check

Run this query to verify everything is set up correctly:

```sql
-- Check all critical components
SELECT 
  'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts
UNION ALL
SELECT 'Post Likes', COUNT(*) FROM post_likes
UNION ALL
SELECT 'Triggers', COUNT(*) FROM information_schema.triggers 
  WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';
```

Expected results:
- Profiles: >= 1
- Posts: >= 0
- Triggers: 1 (the handle_new_user trigger)

---

## 🚨 Emergency Debug Commands

If users report issues, run these:

```sql
-- 1. Check latest auth attempts
SELECT id, email, created_at, confirmation_sent_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check profile creation
SELECT id, email, username, full_name, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check recent posts
SELECT p.id, p.content, p.created_at, pr.full_name as author
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. Check for RLS violations in logs
-- (Check Supabase Dashboard → Database → Logs)
```

---

## 📞 Need Help?

**If testing fails:**
1. Check console logs in browser (F12 → Console)
2. Check Supabase logs (Dashboard → Logs → Postgres Logs)
3. Check network requests (F12 → Network)
4. Share specific error messages

**Contact Support With:**
- Error message (exact text)
- Browser console screenshot
- Steps to reproduce
- Database query results
