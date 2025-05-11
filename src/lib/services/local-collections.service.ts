/**
 * Local Collections Service
 * 
 * This service provides a completely local implementation of collections functionality
 * without any Supabase or backend dependencies.
 */

import { ThreadWithSegments, threadService } from './thread.service';

// Types
export interface LocalCollection {
  id: string;
  user_id: string;
  name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalCollectionWithThreads extends LocalCollection {
  threads: ThreadWithSegments[];
}

interface LocalCollectionThread {
  id: string;
  collection_id: string;
  thread_id: string;
  created_at: string;
}

// Storage keys
const COLLECTIONS_STORAGE_KEY = 'threadspire_local_collections';
const COLLECTION_THREADS_STORAGE_KEY = 'threadspire_local_collection_threads';

// Helper functions for localStorage
const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(COLLECTIONS_STORAGE_KEY)) {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify([]));
    console.log('Initialized local collections storage');
  }
  
  if (!localStorage.getItem(COLLECTION_THREADS_STORAGE_KEY)) {
    localStorage.setItem(COLLECTION_THREADS_STORAGE_KEY, JSON.stringify([]));
    console.log('Initialized local collection threads storage');
  }
};

// Initialize storage immediately
initializeStorage();

// Get collections from localStorage
const getStoredCollections = (): LocalCollection[] => {
  if (typeof window === 'undefined') return [];
  
  initializeStorage();
  
  const stored = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored collections:', e);
    return [];
  }
};

// Save collections to localStorage
const saveCollections = (data: LocalCollection[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(data));
  console.log('Saved collections to localStorage:', data.length, 'items');
};

// Get collection threads from localStorage
const getStoredCollectionThreads = (): LocalCollectionThread[] => {
  if (typeof window === 'undefined') return [];
  
  initializeStorage();
  
  const stored = localStorage.getItem(COLLECTION_THREADS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored collection threads:', e);
    return [];
  }
};

// Save collection threads to localStorage
const saveCollectionThreads = (data: LocalCollectionThread[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COLLECTION_THREADS_STORAGE_KEY, JSON.stringify(data));
  console.log('Saved collection threads to localStorage:', data.length, 'items');
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current user ID (or generate a placeholder)
const getCurrentUserId = (): string => {
  // Try to get from localStorage
  const storedUserId = localStorage.getItem('threadspire_local_user_id');
  if (storedUserId) return storedUserId;
  
  // Generate a new one
  const newUserId = generateId();
  localStorage.setItem('threadspire_local_user_id', newUserId);
  return newUserId;
};

export const localCollectionService = {
  // Create a new collection
  async createCollection(name: string, isPrivate: boolean = true): Promise<LocalCollection> {
    console.log('Creating local collection:', name, 'private:', isPrivate);
    
    // Get current collections
    const collections = getStoredCollections();
    
    // Create new collection
    const newCollection: LocalCollection = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to collections
    collections.push(newCollection);
    
    // Save to localStorage
    saveCollections(collections);
    
    console.log('Local collection created successfully:', newCollection);
    return newCollection;
  },
  
  // Get a collection by ID
  async getCollection(id: string): Promise<LocalCollectionWithThreads> {
    console.log('Getting local collection:', id);
    
    // Get collections
    const collections = getStoredCollections();
    
    // Find collection
    const collection = collections.find(c => c.id === id);
    if (!collection) {
      console.error('Collection not found:', id);
      throw new Error('Collection not found');
    }
    
    // Get collection threads
    const collectionThreads = getStoredCollectionThreads();
    const threadIds = collectionThreads
      .filter(ct => ct.collection_id === id)
      .map(ct => ct.thread_id);
    
    console.log('Found', threadIds.length, 'threads in collection');
    
    // Fetch real thread data using threadService
    let threads = [];
    
    if (threadIds.length > 0) {
      try {
        // Fetch threads one by one
        const threadPromises = threadIds.map(async (threadId) => {
          try {
            return await threadService.getThreadById(threadId);
          } catch (error) {
            console.error(`Error fetching thread ${threadId}:`, error);
            // Return a fallback thread object if we can't fetch the real one
            return {
              id: threadId,
              title: `Thread ${threadId.substring(0, 5)}...`,
              user_id: collection.user_id,
              is_published: true,
              is_private: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              segments: [{ 
                id: 'placeholder', 
                thread_id: threadId,
                content: '<p>This thread could not be loaded.</p>',
                order_index: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }],
              tags: ['unavailable'],
              cover_image: null,
              reaction_counts: { '🧠': 0, '🔥': 0, '👏': 0, '👀': 0, '⚠': 0 },
              author: {
                name: 'Unknown',
                avatar: null
              }
            };
          }
        });
        
        threads = await Promise.all(threadPromises);
        console.log('Successfully fetched', threads.length, 'real threads');
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    }
    
    console.log('Returning collection with', threads.length, 'threads');
    
    return {
      ...collection,
      threads: threads
    };
  },
  
  // Get user's collections
  async getUserCollections(): Promise<LocalCollection[]> {
    console.log('Getting user collections');
    
    // Get collections
    const collections = getStoredCollections();
    
    // Filter by current user
    const userId = getCurrentUserId();
    const userCollections = collections.filter(c => c.user_id === userId);
    
    console.log('Found', userCollections.length, 'collections for user');
    return userCollections;
  },
  
  // Update a collection
  async updateCollection(
    id: string,
    updates: {
      name?: string;
      is_private?: boolean;
    }
  ): Promise<LocalCollection> {
    console.log('Updating local collection:', id, updates);
    
    // Get collections
    const collections = getStoredCollections();
    
    // Find collection index
    const index = collections.findIndex(c => c.id === id);
    if (index === -1) {
      console.error('Collection not found:', id);
      throw new Error('Collection not found');
    }
    
    // Update collection
    const updatedCollection = {
      ...collections[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Replace in array
    collections[index] = updatedCollection;
    
    // Save to localStorage
    saveCollections(collections);
    
    console.log('Local collection updated successfully:', updatedCollection);
    return updatedCollection;
  },
  
  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    console.log('Deleting local collection:', id);
    
    // Get collections
    const collections = getStoredCollections();
    
    // Filter out collection
    const updatedCollections = collections.filter(c => c.id !== id);
    
    // Save to localStorage
    saveCollections(updatedCollections);
    
    // Also remove collection threads
    const collectionThreads = getStoredCollectionThreads();
    const updatedCollectionThreads = collectionThreads.filter(ct => ct.collection_id !== id);
    saveCollectionThreads(updatedCollectionThreads);
    
    console.log('Local collection deleted successfully');
  },
  
  // Add a thread to a collection
  async addThreadToCollection(collectionId: string, threadId: string): Promise<void> {
    console.log('Adding thread to local collection:', threadId, 'to collection:', collectionId);
    
    // Get collection threads
    const collectionThreads = getStoredCollectionThreads();
    
    // Check if already exists
    const exists = collectionThreads.some(
      ct => ct.collection_id === collectionId && ct.thread_id === threadId
    );
    
    if (exists) {
      console.log('Thread already in collection');
      return;
    }
    
    // Add new entry
    const newEntry: LocalCollectionThread = {
      id: generateId(),
      collection_id: collectionId,
      thread_id: threadId,
      created_at: new Date().toISOString()
    };
    
    collectionThreads.push(newEntry);
    
    // Save to localStorage
    saveCollectionThreads(collectionThreads);
    
    console.log('Thread added to local collection successfully');
  },
  
  // Remove a thread from a collection
  async removeThreadFromCollection(collectionId: string, threadId: string): Promise<void> {
    console.log('Removing thread from local collection:', threadId, 'from collection:', collectionId);
    
    // Get collection threads
    const collectionThreads = getStoredCollectionThreads();
    
    // Filter out entry
    const updatedCollectionThreads = collectionThreads.filter(
      ct => !(ct.collection_id === collectionId && ct.thread_id === threadId)
    );
    
    // Save to localStorage
    saveCollectionThreads(updatedCollectionThreads);
    
    console.log('Thread removed from local collection successfully');
  },
  
  // Check if a thread is in a collection
  async isThreadInCollection(collectionId: string, threadId: string): Promise<boolean> {
    // Get collection threads
    const collectionThreads = getStoredCollectionThreads();
    
    // Check if exists
    return collectionThreads.some(
      ct => ct.collection_id === collectionId && ct.thread_id === threadId
    );
  }
};
