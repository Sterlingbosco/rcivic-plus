import { progressSchema, type Progress } from '../domain/schema';

const DATABASE = 'civic-plus';
const STORE = 'progress';

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Le stockage local est indisponible.'));
    request.onblocked = () =>
      reject(new Error('Fermez les autres onglets RCIVIC+ puis réessayez.'));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => {
      database.close();
      resolve(request.result);
    };
    tx.onabort = () => {
      database.close();
      reject(new Error('La sauvegarde locale a échoué. Votre progression n’a pas été effacée.'));
    };
    tx.onerror = () => {
      database.close();
      reject(new Error('La sauvegarde locale a échoué.'));
    };
  });
}

export async function loadProgress(): Promise<Progress | null> {
  const value: unknown = await transaction('readonly', (store) => store.get('current'));
  if (value === undefined) return null;
  const parsed = progressSchema.safeParse(value);
  if (!parsed.success)
    throw new Error(
      'La sauvegarde ne peut pas être lue. Elle est conservée intacte ; ne réinitialisez pas votre navigateur.',
    );
  return parsed.data;
}

export async function saveProgress(progress: Progress): Promise<void> {
  const valid = progressSchema.parse(progress);
  await transaction('readwrite', (store) => store.put(valid, 'current'));
}

export function exportProgress(progress: Progress) {
  const blob = new Blob([JSON.stringify(progressSchema.parse(progress), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rcivic-plus-progression-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
