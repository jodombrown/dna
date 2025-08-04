-- Query to find all policies that might reference author_id
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE qual LIKE '%author_id%' OR with_check LIKE '%author_id%';