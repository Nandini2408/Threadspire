import { supabase } from '../supabase';

// This is a temporary service to handle collection-thread relationships
// until the proper database tables are created

interface CollectionThread {
  id: string;
  collection_id: string;
  thread_id: string;
  created_at: string;
}

// Use localStorage as a temporary storage solution
const STORAGE_KEY = 'threadspire_collection_threads';

// Initialize the storage if it doesn't exist
const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    console.log('Initialized collection_threads storage');
  }
};

// Call initialize immediately
initializeStorage();

const getStoredCollectionThreads = (): CollectionThread[] => {
  if (typeof window === 'undefined') return [];
  
  // Make sure storage is initialized
  initializeStorage();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored collection threads:', e);
    return [];
  }
};

const saveCollectionThreads = (data: CollectionThread[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log('Saved collection threads to localStorage:', data.length, 'items');
};

export const collectionThreadsService = {
  // Add a thread to a collection
  async addThreadToCollection(collectionId: string, threadId: string): Promise<void> {
    // Get current user to ensure they own the collection
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Verify collection ownership
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id')
      .eq('id', collectionId)
      .single();
    
    if (collectionError) {
      console.error('Error verifying collection ownership:', collectionError);
      throw new Error('Could not verify collection ownership');
    }
    
    if (collection.user_id !== user.id) {
      throw new Error('You do not have permission to modify this collection');
    }
    
    // Add to local storage
    const storedData = getStoredCollectionThreads();
    
    // Check if already exists
    const exists = storedData.some(
      item => item.collection_id === collectionId && item.thread_id === threadId
    );
    
    if (exists) return;
    
    // Add new entry
    const newEntry: CollectionThread = {
      id: `${collectionId}_${threadId}_${Date.now()}`,
      collection_id: collectionId,
      thread_id: threadId,
      created_at: new Date().toISOString()
    };
    
    storedData.push(newEntry);
    saveCollectionThreads(storedData);
  },
  
  // Get all threads for a collection
  async getThreadsForCollection(collectionId: string): Promise<string[]> {
    const storedData = getStoredCollectionThreads();
    
    // Filter by collection ID
    const collectionThreads = storedData.filter(
      item => item.collection_id === collectionId
    );
    
    // Return thread IDs
    return collectionThreads.map(item => item.thread_id);
  },
  
  // Remove a thread from a collection
  async removeThreadFromCollection(collectionId: string, threadId: string): Promise<void> {
    const storedData = getStoredCollectionThreads();
    
    // Filter out the entry to remove
    const updatedData = storedData.filter(
      item => !(item.collection_id === collectionId && item.thread_id === threadId)
    );
    
    saveCollectionThreads(updatedData);
  },
  
  // Check if a thread is in a collection
  async isThreadInCollection(collectionId: string, threadId: string): Promise<boolean> {
    const storedData = getStoredCollectionThreads();
    
    return storedData.some(
      item => item.collection_id === collectionId && item.thread_id === threadId
    );
  }
};
