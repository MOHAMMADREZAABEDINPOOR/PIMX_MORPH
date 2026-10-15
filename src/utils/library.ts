export interface LibraryFile { id: string; name: string; blob: Blob; created: number; }
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('morph-library', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', mode);
    const request = operation(tx.objectStore('files'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || request.error); };
  });
}
export const readLibrary = () => transaction<LibraryFile[]>('readonly', store => store.getAll());
export const removeLibraryFile = (id: string) => transaction('readwrite', store => store.delete(id));
export async function saveLibraryFiles(files: { name: string; blob: Blob }[]) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    for (const file of files) tx.objectStore('files').put({ ...file, id: crypto.randomUUID(), created: Date.now() });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
  window.dispatchEvent(new Event('morph-library-change'));
}
