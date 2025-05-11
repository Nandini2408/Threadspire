export type ThreadStatus = 'DRAFT' | 'PUBLISHED'
export type ReactionType = 'BRAIN' | 'FIRE' | 'CLAP' | 'EYES' | 'WARNING'

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  avatar?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Thread {
  id: string
  title: string
  cover_image?: string
  status: ThreadStatus
  author_id: string
  is_original: boolean
  original_id?: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface Segment {
  id: string
  content: string
  order: number
  thread_id: string
  original_segment_id?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface ThreadTag {
  thread_id: string
  tag_id: string
}

export interface Reaction {
  id: string
  type: ReactionType
  user_id: string
  thread_id: string
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  thread_id: string
  created_at: string
}

export interface Collection {
  id: string
  title: string
  description?: string
  cover_image?: string
  is_private: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CollectionThread {
  id: string
  collection_id: string
  thread_id: string
  order: number
  note?: string
  created_at: string
}

export interface ThreadView {
  id: string
  thread_id: string
  user_id?: string
  session_id: string
  read_percentage: number
  source?: string
  created_at: string
}

// Extended types for joined queries
export interface ThreadWithSegments extends Thread {
  segments: Segment[]
  tags: string[]
  reaction_counts: {
    BRAIN: number
    FIRE: number
    CLAP: number
    EYES: number
    WARNING: number
  }
}

export interface CollectionWithThreads extends Collection {
  threads: ThreadWithSegments[]
}

export interface UserWithStats extends User {
  thread_count: number
  follower_count: number
  following_count: number
} 