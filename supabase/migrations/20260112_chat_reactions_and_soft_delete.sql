-- Add message_reactions table for likes/dislikes
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- Add saved_messages table for bookmarks
CREATE TABLE IF NOT EXISTS saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_messages_user_id ON saved_messages(user_id);

-- Add soft delete columns to conversations table
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for filtering non-deleted conversations
CREATE INDEX IF NOT EXISTS idx_conversations_deleted ON conversations(user_id, is_deleted, updated_at DESC);

-- Create view for active (non-deleted) conversations
CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations
WHERE is_deleted = FALSE OR is_deleted IS NULL;

-- RLS policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions"
  ON message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for saved_messages
ALTER TABLE saved_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved messages"
  ON saved_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save messages"
  ON saved_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave messages"
  ON saved_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean up old deleted conversations (runs via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete conversations that have been in trash for more than 30 days
  WITH deleted_rows AS (
    DELETE FROM conversations
    WHERE is_deleted = TRUE 
      AND deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_rows;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION cleanup_old_deleted_conversations() TO authenticated;






