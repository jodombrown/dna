-- Mark this user's tour as completed so they can access profile edit
UPDATE profiles 
SET tour_completed_at = NOW(), tour_current_step = 0 
WHERE id = 'bd6be44c-5dd3-46fa-a824-fc211cf74314';