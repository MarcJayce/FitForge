import { toast } from "@/hooks/use-toast";

interface DBSchema {
  userProfile: { key: number; value: any };
  workoutPrograms: { key: number; value: any };
  workouts: { key: number; value: any };
  exercises: { key: number; value: any };
  foodItems: { key: number; value: any };
  mealLogs: { key: number; value: any };
  progressLogs: { key: number; value: any };
  syncQueue: { key: number; value: any };
}

let db: IDBDatabase | null = null;

export async function initializeDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) return resolve();

    const request = indexedDB.open('FitForgeDB', 1);

    request.onerror = (event) => {
      console.error('Database error:', event);
      toast({
        title: "Database Error",
        description: "Failed to initialize offline database",
        variant: "destructive"
      });
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores with auto-incrementing keys
      if (!db.objectStoreNames.contains('userProfile')) {
        const userStore = db.createObjectStore('userProfile', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('username', 'username', { unique: true });
      }
      
      if (!db.objectStoreNames.contains('workoutPrograms')) {
        const programsStore = db.createObjectStore('workoutPrograms', { keyPath: 'id', autoIncrement: true });
        programsStore.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutsStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
        workoutsStore.createIndex('programId', 'programId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('exercises')) {
        const exercisesStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
        exercisesStore.createIndex('workoutId', 'workoutId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('foodItems')) {
        const foodItemsStore = db.createObjectStore('foodItems', { keyPath: 'id', autoIncrement: true });
        foodItemsStore.createIndex('userId', 'userId', { unique: false });
        foodItemsStore.createIndex('barcode', 'barcode', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('mealLogs')) {
        const mealLogsStore = db.createObjectStore('mealLogs', { keyPath: 'id', autoIncrement: true });
        mealLogsStore.createIndex('userId', 'userId', { unique: false });
        mealLogsStore.createIndex('date', 'date', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('progressLogs')) {
        const progressLogsStore = db.createObjectStore('progressLogs', { keyPath: 'id', autoIncrement: true });
        progressLogsStore.createIndex('userId', 'userId', { unique: false });
        progressLogsStore.createIndex('date', 'date', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Generic function to add an item to a store
export async function addItem<T extends keyof DBSchema>(
  storeName: T,
  item: Omit<DBSchema[T]['value'], 'id'>
): Promise<DBSchema[T]['value']> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest).result;
      resolve({ ...item, id } as DBSchema[T]['value']);
      
      // Add to sync queue
      addToSyncQueue({
        operation: 'add',
        storeName,
        data: { ...item, id }
      });
    };

    request.onerror = () => {
      reject(new Error(`Failed to add item to ${storeName}`));
    };
  });
}

// Generic function to get all items from a store
export async function getAllItems<T extends keyof DBSchema>(
  storeName: T,
  indexName?: string,
  indexValue?: any
): Promise<DBSchema[T]['value'][]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    let request: IDBRequest;
    
    if (indexName && indexValue !== undefined) {
      const index = store.index(indexName);
      request = index.getAll(indexValue);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get items from ${storeName}`));
    };
  });
}

// Generic function to get an item by ID
export async function getItemById<T extends keyof DBSchema>(
  storeName: T,
  id: number
): Promise<DBSchema[T]['value'] | undefined> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || undefined);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`));
    };
  });
}

// Generic function to update an item
export async function updateItem<T extends keyof DBSchema>(
  storeName: T,
  id: number,
  updates: Partial<DBSchema[T]['value']>
): Promise<DBSchema[T]['value']> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (!item) {
        reject(new Error(`Item with ID ${id} not found in ${storeName}`));
        return;
      }

      const updatedItem = { ...item, ...updates };
      const updateRequest = store.put(updatedItem);

      updateRequest.onsuccess = () => {
        resolve(updatedItem);
        
        // Add to sync queue
        addToSyncQueue({
          operation: 'update',
          storeName,
          data: updatedItem
        });
      };

      updateRequest.onerror = () => {
        reject(new Error(`Failed to update item in ${storeName}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`));
    };
  });
}

// Generic function to delete an item
export async function deleteItem<T extends keyof DBSchema>(
  storeName: T,
  id: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
      
      // Add to sync queue
      addToSyncQueue({
        operation: 'delete',
        storeName,
        data: { id }
      });
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete item from ${storeName}`));
    };
  });
}

// Add an operation to the sync queue
function addToSyncQueue(operation: { operation: string; storeName: string; data: any }): void {
  if (!db) return;

  const transaction = db.transaction('syncQueue', 'readwrite');
  const store = transaction.objectStore('syncQueue');
  store.add({
    ...operation,
    timestamp: new Date().toISOString()
  });
}

// Get all items in the sync queue
export async function getSyncQueue(): Promise<any[]> {
  return getAllItems('syncQueue');
}

// Clear all items from the sync queue
export async function clearSyncQueue(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to clear sync queue'));
    };
  });
}

// Check if there are items in the sync queue
export async function hasSyncItems(): Promise<boolean> {
  const items = await getSyncQueue();
  return items.length > 0;
}
