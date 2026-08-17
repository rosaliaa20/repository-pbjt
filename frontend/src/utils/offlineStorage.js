// frontend/src/utils/offlineStorage.js
import { encryptDocument, decryptDocument } from './cryptoUtils';

const DB_NAME = 'PBJT_Offline_Docs';
const STORE_NAME = 'documents';

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Simpan dokumen ke IndexedDB secara terenkripsi dengan masa expired (7 hari)
 */
export async function saveOfflineDoc(id, docDetail, arrayBuffer) {
  const encryptedData = await encryptDocument(arrayBuffer);
  
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Expired dalam 7 hari
  const expiresAt = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
  
  const record = {
    id,
    docDetail,
    data: encryptedData, // data ini berupa Uint8Array yang sudah dienkripsi
    savedAt: new Date().getTime(),
    expiresAt
  };
  
  store.put(record);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Ambil dokumen dari IndexedDB dan dekripsi.
 * Hapus otomatis jika sudah expired.
 */
export async function getOfflineDoc(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = async () => {
      const record = request.result;
      if (!record) return resolve(null);
      
      // Cek apakah sudah expired (7 hari)
      const now = new Date().getTime();
      if (now > record.expiresAt) {
        store.delete(id); // Hapus jika kedaluwarsa
        console.warn(`Dokumen offline ${id} dihapus karena sudah expired.`);
        return resolve(null);
      }
      
      try {
        const decryptedBuffer = await decryptDocument(record.data);
        resolve({
          docDetail: record.docDetail,
          pdfBuffer: decryptedBuffer
        });
      } catch (err) {
        reject(err);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengecek ketersediaan dokumen secara offline (boolean)
 */
export async function isDocOffline(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise((resolve) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) return resolve(false);
      const now = new Date().getTime();
      if (now > request.result.expiresAt) return resolve(false);
      resolve(true);
    };
    request.onerror = () => resolve(false);
  });
}

/**
 * Hapus dokumen offline (Manual)
 */
export async function removeOfflineDoc(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
}
