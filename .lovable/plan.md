#  Fix: Space Creation Silently Fails Due to Broken Trigger

## Root Cause

Found it in the Postgres error logs: `**record "new" has no field "title"**`

The `trg_space_create_channel` trigger fires AFTER INSERT on the `spaces` table and runs the function `trg_auto_create_space_channel()`. This function tries to read `NEW.title` first (intended for the `collaboration_spaces` table which has a `title` column), but the `spaces` table uses `name` instead. Postgres raises an error because `NEW.title` does not exist on the `spaces` table, which rolls back the entire INSERT transaction silently.

The code in `useCollaborate.ts` is correct. The wizard UI is correct. The RLS policies are correct. The trigger function is what kills the insert.

## Fix

One database migration to update the trigger function so it safely reads the correct column:

```sql
CREATE OR REPLACE FUNCTION trg_auto_create_space_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_name text;
BEGIN
  -- spaces table uses 'name', not 'title'
  v_space_name := NEW.name;

  BEGIN
    PERFORM create_space_messaging_channel(NEW.id, v_space_name || ' - Channel');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create space channel failed for space %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;
```

## What Changes


| Item                                       | Change                              |
| ------------------------------------------ | ----------------------------------- |
| `trg_auto_create_space_channel()` function | Replace `NEW.title` with `NEW.name` |


No code changes. No schema changes. No UI changes. Just fixing the trigger function so the insert stops rolling back.

## After Fix

Clicking "Create Space" on step 4 will successfully insert the row, the trigger will create a messaging channel using the space name, and the wizard will close and navigate to the new space page.