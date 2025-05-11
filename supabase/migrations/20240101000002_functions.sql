-- Function to get thread with all related data
CREATE OR REPLACE FUNCTION get_thread_with_data(thread_id UUID)
RETURNS TABLE (
    thread_data JSONB,
    segments JSONB,
    tags JSONB,
    reaction_counts JSONB,
    author_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', t.id,
            'title', t.title,
            'cover_image', t.cover_image,
            'status', t.status,
            'is_original', t.is_original,
            'original_id', t.original_id,
            'view_count', t.view_count,
            'created_at', t.created_at,
            'updated_at', t.updated_at
        ) as thread_data,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'id', s.id,
                'content', s.content,
                'order', s.order,
                'created_at', s.created_at,
                'updated_at', s.updated_at
            ))
            FROM segments s
            WHERE s.thread_id = t.id
            ORDER BY s.order
        ) as segments,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'id', tg.id,
                'name', tg.name
            ))
            FROM thread_tags tt
            JOIN tags tg ON tt.tag_id = tg.id
            WHERE tt.thread_id = t.id
        ) as tags,
        (
            SELECT jsonb_build_object(
                'BRAIN', COUNT(*) FILTER (WHERE r.type = 'BRAIN'),
                'FIRE', COUNT(*) FILTER (WHERE r.type = 'FIRE'),
                'CLAP', COUNT(*) FILTER (WHERE r.type = 'CLAP'),
                'EYES', COUNT(*) FILTER (WHERE r.type = 'EYES'),
                'WARNING', COUNT(*) FILTER (WHERE r.type = 'WARNING')
            )
            FROM reactions r
            WHERE r.thread_id = t.id
        ) as reaction_counts,
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar,
            'bio', u.bio
        ) as author_data
    FROM threads t
    JOIN users u ON t.author_id = u.id
    WHERE t.id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update thread view count
CREATE OR REPLACE FUNCTION update_thread_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE threads
    SET view_count = view_count + 1
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for thread view count
CREATE TRIGGER thread_view_count_trigger
AFTER INSERT ON thread_views
FOR EACH ROW
EXECUTE FUNCTION update_thread_view_count();

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
    thread_count BIGINT,
    follower_count BIGINT,
    following_count BIGINT,
    total_views BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(DISTINCT f1.id) as follower_count,
        COUNT(DISTINCT f2.id) as following_count,
        COALESCE(SUM(t.view_count), 0) as total_views
    FROM users u
    LEFT JOIN threads t ON t.author_id = u.id
    LEFT JOIN follows f1 ON f1.following_id = u.id
    LEFT JOIN follows f2 ON f2.follower_id = u.id
    WHERE u.id = user_id
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access collection
CREATE OR REPLACE FUNCTION can_access_collection(collection_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM collections c
        WHERE c.id = collection_id
        AND (c.is_private = false OR c.owner_id = user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 