-- M4: Signals + Embeddings Setup
-- Create user_interactions table for tracking all user actions
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'space', 'need', 'story', 'profile', 'project', 'post', 'community')),
  entity_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'cta', 'scroll', 'join', 'connect_click', 'rsvp', 'apply', 'share', 'save', 'like', 'comment')),
  context_c TEXT CHECK (context_c IN ('Connect', 'Convene', 'Collaborate', 'Contribute', 'Convey', 'Messages', 'Home', 'Profile', 'Discover')),
  weight FLOAT NOT NULL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_entity ON user_interactions(entity_type, entity_id);
CREATE INDEX idx_user_interactions_created_at ON user_interactions(created_at DESC);
CREATE INDEX idx_user_interactions_context ON user_interactions(context_c);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);

-- Create user_vectors table for storing user embeddings
CREATE TABLE IF NOT EXISTS user_vectors (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vector JSONB NOT NULL,
  dimension INTEGER NOT NULL DEFAULT 32,
  source TEXT NOT NULL CHECK (source IN ('interactions', 'profile', 'hybrid')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_vectors_updated_at ON user_vectors(updated_at DESC);

-- Create entity_vectors table for storing entity embeddings
CREATE TABLE IF NOT EXISTS entity_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'space', 'need', 'story', 'profile', 'project', 'post', 'community')),
  entity_id UUID NOT NULL,
  vector JSONB NOT NULL,
  dimension INTEGER NOT NULL DEFAULT 32,
  source TEXT NOT NULL CHECK (source IN ('tags', 'metadata', 'text', 'hybrid')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_entity_vectors_entity ON entity_vectors(entity_type, entity_id);
CREATE INDEX idx_entity_vectors_updated_at ON entity_vectors(updated_at DESC);

-- Enable RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_vectors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can insert their own interactions"
  ON user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
  ON user_interactions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for user_vectors
CREATE POLICY "Users can view their own vectors"
  ON user_vectors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage user vectors"
  ON user_vectors FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for entity_vectors (readable by all authenticated users)
CREATE POLICY "Authenticated users can view entity vectors"
  ON entity_vectors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage entity vectors"
  ON entity_vectors FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to calculate cosine similarity between two vectors
CREATE OR REPLACE FUNCTION cosine_similarity(vec1 JSONB, vec2 JSONB)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  dot_product FLOAT := 0;
  magnitude1 FLOAT := 0;
  magnitude2 FLOAT := 0;
  i INTEGER;
  arr1 FLOAT[];
  arr2 FLOAT[];
BEGIN
  -- Convert JSONB arrays to FLOAT arrays
  SELECT ARRAY(SELECT jsonb_array_elements_text(vec1)::FLOAT) INTO arr1;
  SELECT ARRAY(SELECT jsonb_array_elements_text(vec2)::FLOAT) INTO arr2;
  
  -- Calculate dot product and magnitudes
  FOR i IN 1..array_length(arr1, 1) LOOP
    dot_product := dot_product + (arr1[i] * arr2[i]);
    magnitude1 := magnitude1 + (arr1[i] * arr1[i]);
    magnitude2 := magnitude2 + (arr2[i] * arr2[i]);
  END LOOP;
  
  -- Return cosine similarity
  IF magnitude1 = 0 OR magnitude2 = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN dot_product / (sqrt(magnitude1) * sqrt(magnitude2));
END;
$$;

-- Function to get similar users based on vector similarity
CREATE OR REPLACE FUNCTION get_similar_users(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  similarity_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_vector JSONB;
BEGIN
  -- Get target user's vector
  SELECT vector INTO target_vector
  FROM user_vectors
  WHERE user_vectors.user_id = target_user_id;
  
  IF target_vector IS NULL THEN
    RETURN;
  END IF;
  
  -- Return similar users
  RETURN QUERY
  SELECT 
    uv.user_id,
    cosine_similarity(target_vector, uv.vector) AS similarity_score
  FROM user_vectors uv
  WHERE uv.user_id != target_user_id
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$;

-- Function to get similar entities
CREATE OR REPLACE FUNCTION get_similar_entities(
  target_entity_type TEXT,
  target_entity_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  similarity_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_vector JSONB;
BEGIN
  -- Get target entity's vector
  SELECT vector INTO target_vector
  FROM entity_vectors
  WHERE entity_vectors.entity_type = target_entity_type
    AND entity_vectors.entity_id = target_entity_id;
  
  IF target_vector IS NULL THEN
    RETURN;
  END IF;
  
  -- Return similar entities
  RETURN QUERY
  SELECT 
    ev.entity_type,
    ev.entity_id,
    cosine_similarity(target_vector, ev.vector) AS similarity_score
  FROM entity_vectors ev
  WHERE NOT (ev.entity_type = target_entity_type AND ev.entity_id = target_entity_id)
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$;