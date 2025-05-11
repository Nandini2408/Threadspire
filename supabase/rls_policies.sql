-- Enable RLS on all tables
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;

-- Threads policies
CREATE POLICY "Public threads are viewable by everyone"
ON threads FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can view their own threads"
ON threads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create threads"
ON threads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
ON threads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
ON threads FOR DELETE
USING (auth.uid() = user_id);

-- Thread segments policies
CREATE POLICY "Thread segments are viewable with thread"
ON thread_segments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_segments.thread_id
        AND (threads.is_published = true OR threads.user_id = auth.uid())
    )
);

CREATE POLICY "Users can create segments for their threads"
ON thread_segments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_segments.thread_id
        AND threads.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update segments for their threads"
ON thread_segments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_segments.thread_id
        AND threads.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete segments from their threads"
ON thread_segments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_segments.thread_id
        AND threads.user_id = auth.uid()
    )
);

-- Reactions policies
CREATE POLICY "Reactions are viewable by everyone"
ON reactions FOR SELECT
USING (true);

CREATE POLICY "Users can create reactions"
ON reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON reactions FOR DELETE
USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Users can view their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
ON collections FOR SELECT
USING (is_private = false);

CREATE POLICY "Users can create collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id);

-- Collection threads policies
CREATE POLICY "Collection threads are viewable with collection"
ON collection_threads FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_threads.collection_id
        AND (collections.is_private = false OR collections.user_id = auth.uid())
    )
);

CREATE POLICY "Users can add threads to their collections"
ON collection_threads FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_threads.collection_id
        AND collections.user_id = auth.uid()
    )
);

CREATE POLICY "Users can remove threads from their collections"
ON collection_threads FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_threads.collection_id
        AND collections.user_id = auth.uid()
    )
);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Tags can be created by authenticated users"
ON tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Thread tags policies
CREATE POLICY "Thread tags are viewable with thread"
ON thread_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_tags.thread_id
        AND (threads.is_published = true OR threads.user_id = auth.uid())
    )
);

CREATE POLICY "Users can add tags to their threads"
ON thread_tags FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_tags.thread_id
        AND threads.user_id = auth.uid()
    )
);

CREATE POLICY "Users can remove tags from their threads"
ON thread_tags FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM threads
        WHERE threads.id = thread_tags.thread_id
        AND threads.user_id = auth.uid()
    )
); 