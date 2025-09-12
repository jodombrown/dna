-- Grant necessary permissions for post creation function
GRANT EXECUTE ON FUNCTION public.rpc_create_post(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_post(jsonb) TO anon;

-- Also ensure users can access the posts table properly
GRANT SELECT, INSERT ON TABLE public.posts TO authenticated;