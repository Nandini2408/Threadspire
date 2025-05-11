-- Create collections table if it doesn't exist
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_threads junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS collection_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, thread_id)
);

-- Add RLS policies for collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own collections
CREATE POLICY "Users can view their own collections"
  ON collections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own collections
CREATE POLICY "Users can insert their own collections"
  ON collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own collections
CREATE POLICY "Users can update their own collections"
  ON collections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own collections
CREATE POLICY "Users can delete their own collections"
  ON collections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for collection_threads
ALTER TABLE collection_threads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view threads in their collections
CREATE POLICY "Users can view threads in their collections"
  ON collection_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_threads.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Policy: Users can add threads to their collections
CREATE POLICY "Users can add threads to their collections"
  ON collection_threads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_threads.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Policy: Users can remove threads from their collections
CREATE POLICY "Users can remove threads from their collections"
  ON collection_threads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_threads.collection_id
      AND collections.user_id = auth.uid()
    )
  );
