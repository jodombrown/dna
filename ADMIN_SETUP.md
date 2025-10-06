# Admin Setup Guide

## Making a User an Admin

To grant admin access to a user, run this SQL in the Supabase SQL Editor:

### Option 1: By Email
```sql
-- Make a user an admin using their email
-- Replace 'USER_EMAIL_HERE' with the actual user email

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'USER_EMAIL_HERE';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email USER_EMAIL_HERE not found';
  END IF;

  -- Insert or update user role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';

  RAISE NOTICE 'User % (%) is now an admin', target_user_id, 'USER_EMAIL_HERE';
END $$;
```

### Option 2: By User ID
```sql
-- Make a user an admin using their UUID
-- Replace 'USER_ID_HERE' with the actual user UUID

INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

## Verifying Admin Access

After running the SQL, verify the user has admin access:

```sql
-- Check if a user is an admin (by email)
SELECT u.id, u.email, ur.role, ur.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';
```

## Removing Admin Access

To remove admin access from a user:

```sql
-- Remove admin role from a user
DELETE FROM user_roles
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'USER_EMAIL_HERE'
);
```

## Testing Admin Features

Once a user is made an admin:

1. **Sign out and sign back in** (admin status is checked on authentication)
2. Look for the "Admin" link in the header navigation
3. Navigate to `/app/admin` to access the admin dashboard
4. Test the three admin sections:
   - **Dashboard**: Overview stats
   - **Engagement**: User engagement analytics
   - **Signals**: ADIN signal analytics

## Troubleshooting

### Admin link not showing up
- Clear browser cache and cookies
- Sign out completely and sign back in
- Verify the user_roles entry exists in the database
- Check browser console for any errors

### Access denied to /app/admin
- Confirm the `has_role` function exists in your database
- Verify RLS policies are enabled on user_roles table
- Check that the user's session is valid

### Function not found error
If you see "function has_role does not exist", run:

```sql
-- Create the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```
