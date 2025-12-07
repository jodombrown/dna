-- Migration: Add update_post RPC for editing posts
-- Allows post authors to edit their content with proper validation

CREATE OR REPLACE FUNCTION update_post(
  p_post_id UUID,
  p_user_id UUID,
  p_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verify the user owns the post
  IF NOT EXISTS (
    SELECT 1 FROM posts
    WHERE id = p_post_id
    AND author_id = p_user_id
    AND is_deleted = FALSE
  ) THEN
    RAISE EXCEPTION 'Post not found or you do not have permission to edit it';
  END IF;

  -- Update the post
  UPDATE posts
  SET
    content = p_content,
    updated_at = NOW()
  WHERE id = p_post_id
  AND author_id = p_user_id;

  -- Return the updated post
  SELECT json_build_object(
    'id', id,
    'content', content,
    'updated_at', updated_at
  ) INTO v_result
  FROM posts
  WHERE id = p_post_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_post TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_post IS 'Allows post authors to edit their post content. Returns the updated post data.';
